import { db } from './firestore';

// In-memory fallback if Firestore is not initialized/ready
const fallbackIpToCode: Record<string, string> = {};
const fallbackCodes: Record<string, string> = {};
const fallbackReferrals: Record<string, string[]> = {};

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
        return data.referralCode;
      }
    }
    
    const code = 'ref_' + Math.random().toString(36).substring(2, 8);
    await refDoc.set({
      referralCode: code,
      referredIps: []
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
      await referrerDoc.ref.update({ referredIps });
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
      return (doc.data()?.referredIps || []).length;
    }
    return 0;
  } catch (err) {
    console.error('Firestore getReferralCount failed, using fallback:', err);
    return (fallbackReferrals[ip] || []).length;
  }
}

// Check if rate limit is bypassed (N referred users)
export async function isLockedUnlocked(ip: string, requiredReferrals: number = 2): Promise<boolean> {
  const count = await getReferralCount(ip);
  return count >= requiredReferrals;
}
