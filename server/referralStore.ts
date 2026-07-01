import { db } from './firestore';

// In-memory fallback if Firestore is not initialized/ready
const fallbackIpToCode: Record<string, string> = {};
const fallbackCodes: Record<string, string> = {};
const fallbackReferrals: Record<string, string[]> = {};
const fallbackUserProfiles: Record<string, { uid?: string, displayName?: string, photoURL?: string, email?: string }> = {};

// Generate or get unique short referral code for an IP
export async function getOrCreateReferralCode(ip: string): Promise<string> {
  if (!db) {
    if (fallbackIpToCode[ip]) {
      return fallbackIpToCode[ip];
    }
    const code = 'ref_' + Math.random().toString(36).substring(2, 8);
    fallbackIpToCode[ip] = code;
    fallbackCodes[code] = ip;
    fallbackReferrals[ip] = [];
    return code;
  }

  try {
    const refDoc = db.collection('referrals').doc(ip);
    const doc = await refDoc.get();
    
    if (doc.exists) {
      const data = doc.data();
      if (data?.referralCode) {
        // Backfill referralCount if missing
        const count = (data.referredIps || []).length;
        if (data.referralCount === undefined || data.referralCount !== count) {
          await refDoc.update({ referralCount: count });
        }
        return data.referralCode;
      }
    }
    
    const code = 'ref_' + Math.random().toString(36).substring(2, 8);
    await refDoc.set({
      referralCode: code,
      referredIps: [],
      referralCount: 0
    }, { merge: true });
    return code;
  } catch (err) {
    console.error('Firestore getOrCreateReferralCode failed, using fallback:', err);
    if (fallbackIpToCode[ip]) return fallbackIpToCode[ip];
    const code = 'ref_' + Math.random().toString(36).substring(2, 8);
    fallbackIpToCode[ip] = code;
    fallbackCodes[code] = ip;
    fallbackReferrals[ip] = [];
    return code;
  }
}

// Record a new referral: visitorIp was referred by the owner of referralCode
export async function recordReferral(visitorIp: string, referralCode: string): Promise<boolean> {
  if (!referralCode) return false;

  if (!db) {
    const referrerIp = fallbackCodes[referralCode];
    if (!referrerIp || referrerIp === visitorIp) {
      return false;
    }
    fallbackReferrals[referrerIp] = fallbackReferrals[referrerIp] || [];
    if (!fallbackReferrals[referrerIp].includes(visitorIp)) {
      fallbackReferrals[referrerIp].push(visitorIp);
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
      return true;
    }
    return false;
  } catch (err) {
    console.error('Firestore recordReferral failed, using fallback:', err);
    const referrerIp = fallbackCodes[referralCode];
    if (!referrerIp || referrerIp === visitorIp) {
      return false;
    }
    fallbackReferrals[referrerIp] = fallbackReferrals[referrerIp] || [];
    if (!fallbackReferrals[referrerIp].includes(visitorIp)) {
      fallbackReferrals[referrerIp].push(visitorIp);
      return true;
    }
    return false;
  }
}

// Check referred count for an IP
export async function getReferralCount(ip: string): Promise<number> {
  if (!db) {
    return (fallbackReferrals[ip] || []).length;
  }

  try {
    const doc = await db.collection('referrals').doc(ip).get();
    if (doc.exists) {
      const data = doc.data();
      const count = (data?.referredIps || []).length;
      
      // Keep cached referralCount field in sync with referredIps array length
      if (data?.referralCount === undefined || data.referralCount !== count) {
        await db.collection('referrals').doc(ip).update({ referralCount: count });
      }
      
      return count;
    }
    return 0;
  } catch (err) {
    console.error('Firestore getReferralCount failed, using fallback:', err);
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
  if (!db) {
    fallbackUserProfiles[ip] = { uid, displayName, photoURL, email };
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
  } catch (err) {
    console.error('Firestore linkUserToReferral failed:', err);
  }
}

// Retrieve top 10 referrers
export async function getReferralLeaderboard(): Promise<any[]> {
  if (!db) {
    // Sort memory fallback
    return Object.entries(fallbackReferrals)
      .map(([ip, referredList]) => {
        const code = fallbackIpToCode[ip] || 'ref_anon';
        const profile = fallbackUserProfiles[ip] || {};
        return {
          displayName: profile.displayName || `Explorer_${code.substring(4)}`,
          photoURL: profile.photoURL || null,
          referralCount: referredList.length,
          referralCode: code
        };
      })
      .filter(item => item.referralCount > 0)
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 10);
  }

  try {
    const snapshot = await db.collection('referrals')
      .where('referralCount', '>', 0)
      .orderBy('referralCount', 'desc')
      .limit(10)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        displayName: data.displayName || `Explorer_${data.referralCode?.substring(4) || 'Anon'}`,
        photoURL: data.photoURL || null,
        referralCount: data.referralCount || 0,
        referralCode: data.referralCode || ''
      };
    });
  } catch (err) {
    console.error('Firestore getReferralLeaderboard failed:', err);
    return [];
  }
}

// Check if rate limit is bypassed (N referred users)
export async function isLockedUnlocked(ip: string, requiredReferrals: number = 2): Promise<boolean> {
  const count = await getReferralCount(ip);
  return count >= requiredReferrals;
}
