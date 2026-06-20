import fs from 'fs';
import path from 'path';

const STORE_FILE = path.join(process.cwd(), 'referrals.json');

interface ReferralData {
  // Maps code to the owner"s IP address
  codes: { [code: string]: string };
  // Maps IP address to their assigned referral code
  ipToCode: { [ip: string]: string };
  // Maps owner"s IP address to referred IP addresses list (distinct visitors)
  referrals: { [referrerIp: string]: string[] };
}

function readStore(): ReferralData {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      const initial: ReferralData = { codes: {}, ipToCode: {}, referrals: {} };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(raw || '{"codes":{},"ipToCode":{},"referrals":{}}');
  } catch (err) {
    console.error('Failed to read referrals.json:', err);
    return { codes: {}, ipToCode: {}, referrals: {} };
  }
}

function writeStore(data: ReferralData) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write referrals.json:', err);
  }
}

// Generate or get unique short referral code for an IP
export function getOrCreateReferralCode(ip: string): string {
  const store = readStore();
  if (store.ipToCode[ip]) {
    return store.ipToCode[ip];
  }
  
  // Generate random 6 characters code
  const code = 'ref_' + Math.random().toString(36).substring(2, 8);
  store.ipToCode[ip] = code;
  store.codes[code] = ip;
  if (!store.referrals[ip]) {
    store.referrals[ip] = [];
  }
  writeStore(store);
  return code;
}

// Record a new referral: visitorIp was referred by the owner of referralCode
export function recordReferral(visitorIp: string, referralCode: string): boolean {
  if (!referralCode) return false;
  
  const store = readStore();
  const referrerIp = store.codes[referralCode];
  
  // Cannot refer oneself, and referrer must exist
  if (!referrerIp || referrerIp === visitorIp) {
    return false;
  }
  
  const existingRefs = store.referrals[referrerIp] || [];
  if (!existingRefs.includes(visitorIp)) {
    existingRefs.push(visitorIp);
    store.referrals[referrerIp] = existingRefs;
    writeStore(store);
    return true;
  }
  return false;
}

// Check referred count for an IP
export function getReferralCount(ip: string): number {
  const store = readStore();
  return (store.referrals[ip] || []).length;
}

// Check if rate limit is bypassed (N referred users)
export function isLockedUnlocked(ip: string, requiredReferrals: number = 2): boolean {
  const count = getReferralCount(ip);
  return count >= requiredReferrals;
}
