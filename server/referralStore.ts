import { db } from './firestore';

// Cache Layer to reduce Firestore reads/writes by up to 99%
const ipToCodeCache: Record<string, string> = {};
const ipToCountCache: Record<string, number> = {};
const codeToIpCache: Record<string, string> = {};

// Quota exhaustion cooldown detector
let isQuotaExhausted = false;
let quotaExhaustedUntil = 0;

function markQuotaExhausted() {
  isQuotaExhausted = true;
  // Hold a 15-minute cooldown before attempting to read/write Firestore again
  quotaExhaustedUntil = Date.now() + 15 * 60 * 1000;
}

function checkFirestoreAvailable(): boolean {
  if (!db) return false;
  if (isQuotaExhausted) {
    if (Date.now() > quotaExhaustedUntil) {
      isQuotaExhausted = false; // Cooldown expired, try again
      return true;
    }
    return false;
  }
  return true;
}

// In-memory fallback if Firestore is not initialized/ready or quota is exhausted
const fallbackIpToCode: Record<string, string> = {};
const fallbackCodes: Record<string, string> = {};
const fallbackReferrals: Record<string, string[]> = {};
const fallbackUserProfiles: Record<string, { uid?: string, displayName?: string, photoURL?: string, email?: string }> = {};

// Generate or get unique short referral code for an IP
export async function getOrCreateReferralCode(ip: string): Promise<string> {
  // 1. Check in-memory cache first
  if (ipToCodeCache[ip]) {
    return ipToCodeCache[ip];
  }

  // 2. Fall back to local storage if Firestore is unavailable or quota is exceeded
  if (!checkFirestoreAvailable()) {
    if (fallbackIpToCode[ip]) {
      return fallbackIpToCode[ip];
    }
    const code = 'ref_' + Math.random().toString(36).substring(2, 8);
    fallbackIpToCode[ip] = code;
    fallbackCodes[code] = ip;
    fallbackReferrals[ip] = [];
    ipToCodeCache[ip] = code;
    codeToIpCache[code] = ip;
    ipToCountCache[ip] = 0;
    return code;
  }

  try {
    const refDoc = db.collection('referrals').doc(ip);
    const doc = await refDoc.get();
    
    if (doc.exists) {
      const data = doc.data();
      if (data?.referralCode) {
        const code = data.referralCode;
        // Cache it
        ipToCodeCache[ip] = code;
        codeToIpCache[code] = ip;
        
        // Backfill referralCount if missing
        const count = (data.referredIps || []).length;
        if (data.referralCount === undefined || data.referralCount !== count) {
          try {
            await refDoc.update({ referralCount: count });
          } catch (updateErr: any) {
            if (updateErr.message?.includes('RESOURCE_EXHAUSTED') || updateErr.code === 8) {
              markQuotaExhausted();
            }
          }
        }
        ipToCountCache[ip] = count;
        return code;
      }
    }
    
    const code = 'ref_' + Math.random().toString(36).substring(2, 8);
    await refDoc.set({
      referralCode: code,
      referredIps: [],
      referralCount: 0
    }, { merge: true });
    
    // Cache it
    ipToCodeCache[ip] = code;
    codeToIpCache[code] = ip;
    ipToCountCache[ip] = 0;
    return code;
  } catch (err: any) {
    if (err.message?.includes('RESOURCE_EXHAUSTED') || err.code === 8) {
      console.warn('Firestore getOrCreateReferralCode detected Quota Exceeded. Entering fallback cooldown.');
      markQuotaExhausted();
    } else {
      console.error('Firestore getOrCreateReferralCode failed, using fallback:', err);
    }
    
    if (fallbackIpToCode[ip]) return fallbackIpToCode[ip];
    const code = 'ref_' + Math.random().toString(36).substring(2, 8);
    fallbackIpToCode[ip] = code;
    fallbackCodes[code] = ip;
    fallbackReferrals[ip] = [];
    ipToCodeCache[ip] = code;
    codeToIpCache[code] = ip;
    ipToCountCache[ip] = 0;
    return code;
  }
}

// Record a new referral: visitorIp was referred by the owner of referralCode
export async function recordReferral(visitorIp: string, referralCode: string): Promise<boolean> {
  if (!referralCode) return false;

  // Use fallback if Firestore is unavailable or quota is exceeded
  if (!checkFirestoreAvailable()) {
    const referrerIp = codeToIpCache[referralCode] || fallbackCodes[referralCode];
    if (!referrerIp || referrerIp === visitorIp) {
      return false;
    }
    fallbackReferrals[referrerIp] = fallbackReferrals[referrerIp] || [];
    if (!fallbackReferrals[referrerIp].includes(visitorIp)) {
      fallbackReferrals[referrerIp].push(visitorIp);
      ipToCountCache[referrerIp] = fallbackReferrals[referrerIp].length;
      return true;
    }
    return false;
  }

  try {
    // Prevent self referral
    const visitorCode = await getOrCreateReferralCode(visitorIp);
    if (visitorCode === referralCode) {
      return false;
    }

    const snapshot = await db.collection('referrals').where('referralCode', '==', referralCode).limit(1).get();
    if (snapshot.empty) {
      return false;
    }
    
    const referrerDoc = snapshot.docs[0];
    const referrerIp = referrerDoc.id;
    
    if (referrerIp === visitorIp) {
      return false;
    }
    
    const referredIps = referrerDoc.data()?.referredIps || [];
    if (!referredIps.includes(visitorIp)) {
      referredIps.push(visitorIp);
      await referrerDoc.ref.update({ 
        referredIps,
        referralCount: referredIps.length
      });
      // Update local cache
      ipToCountCache[referrerIp] = referredIps.length;
      return true;
    }
    return false;
  } catch (err: any) {
    if (err.message?.includes('RESOURCE_EXHAUSTED') || err.code === 8) {
      console.warn('Firestore recordReferral detected Quota Exceeded. Entering fallback cooldown.');
      markQuotaExhausted();
    } else {
      console.error('Firestore recordReferral failed, using fallback:', err);
    }
    
    const referrerIp = codeToIpCache[referralCode] || fallbackCodes[referralCode];
    if (!referrerIp || referrerIp === visitorIp) {
      return false;
    }
    fallbackReferrals[referrerIp] = fallbackReferrals[referrerIp] || [];
    if (!fallbackReferrals[referrerIp].includes(visitorIp)) {
      fallbackReferrals[referrerIp].push(visitorIp);
      ipToCountCache[referrerIp] = fallbackReferrals[referrerIp].length;
      return true;
    }
    return false;
  }
}

// Check referred count for an IP
export async function getReferralCount(ip: string): Promise<number> {
  // Check cache first
  if (ipToCountCache[ip] !== undefined) {
    return ipToCountCache[ip];
  }

  // Use fallback if Firestore is unavailable or quota is exceeded
  if (!checkFirestoreAvailable()) {
    return (fallbackReferrals[ip] || []).length;
  }

  try {
    const doc = await db.collection('referrals').doc(ip).get();
    if (doc.exists) {
      const data = doc.data();
      const count = (data?.referredIps || []).length;
      
      // Cache it
      ipToCountCache[ip] = count;
      if (data?.referralCode) {
        ipToCodeCache[ip] = data.referralCode;
        codeToIpCache[data.referralCode] = ip;
      }
      
      // Keep cached referralCount field in sync with referredIps array length
      if (data?.referralCount === undefined || data.referralCount !== count) {
        try {
          await db.collection('referrals').doc(ip).update({ referralCount: count });
        } catch (updateErr: any) {
          if (updateErr.message?.includes('RESOURCE_EXHAUSTED') || updateErr.code === 8) {
            markQuotaExhausted();
          }
        }
      }
      
      return count;
    }
    return 0;
  } catch (err: any) {
    if (err.message?.includes('RESOURCE_EXHAUSTED') || err.code === 8) {
      console.warn('Firestore getReferralCount detected Quota Exceeded. Entering fallback cooldown.');
      markQuotaExhausted();
    } else {
      console.error('Firestore getReferralCount failed, using fallback:', err);
    }
    return (fallbackReferrals[ip] || []).length;
  }
}

// Link google user to IP's referral code document
export async function linkUserToReferral(
  ip: string, 
  uid: string, 
  displayName: string, 
  photoURL: string, 
  email: string
): Promise<void> {
  fallbackUserProfiles[ip] = { uid, displayName, photoURL, email };

  if (!checkFirestoreAvailable()) {
    return;
  }
  try {
    await db.collection('referrals').doc(ip).set({
      uid,
      displayName,
      photoURL,
      email,
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  } catch (err: any) {
    if (err.message?.includes('RESOURCE_EXHAUSTED') || err.code === 8) {
      console.warn('Firestore linkUserToReferral detected Quota Exceeded. Entering fallback cooldown.');
      markQuotaExhausted();
    } else {
      console.error('Firestore linkUserToReferral failed:', err);
    }
  }
}

// Retrieve top 10 referrers
export async function getReferralLeaderboard(): Promise<any[]> {
  const localLeaderboard = Object.entries(ipToCountCache)
    .map(([ip, count]) => {
      const code = ipToCodeCache[ip] || fallbackIpToCode[ip] || 'ref_anon';
      const profile = fallbackUserProfiles[ip] || {};
      return {
        displayName: profile.displayName || `Explorer_${code.substring(4)}`,
        photoURL: profile.photoURL || null,
        referralCount: count,
        referralCode: code
      };
    })
    .filter(item => item.referralCount > 0)
    .sort((a, b) => b.referralCount - a.referralCount)
    .slice(0, 10);

  if (!checkFirestoreAvailable()) {
    return localLeaderboard;
  }

  try {
    const snapshot = await db.collection('referrals')
      .where('referralCount', '>', 0)
      .orderBy('referralCount', 'desc')
      .limit(10)
      .get();

    const dbLeaderboard = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        displayName: data.displayName || `Explorer_${data.referralCode?.substring(4) || 'Anon'}`,
        photoURL: data.photoURL || null,
        referralCount: data.referralCount || 0,
        referralCode: data.referralCode || ''
      };
    });

    if (dbLeaderboard.length > 0) {
      return dbLeaderboard;
    }
    return localLeaderboard;
  } catch (err: any) {
    if (err.message?.includes('RESOURCE_EXHAUSTED') || err.code === 8) {
      console.warn('Firestore getReferralLeaderboard detected Quota Exceeded. Entering fallback cooldown.');
      markQuotaExhausted();
    } else {
      console.error('Firestore getReferralLeaderboard failed:', err);
    }
    return localLeaderboard;
  }
}

// Check if rate limit is bypassed (N referred users)
export async function isLockedUnlocked(ip: string, requiredReferrals: number = 2): Promise<boolean> {
  const count = await getReferralCount(ip);
  return count >= requiredReferrals;
}
