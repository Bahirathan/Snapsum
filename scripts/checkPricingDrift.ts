import fs from 'fs';
import path from 'path';

const BANNED_STRINGS = [
  '8.99',
  '12.99',
  'Pro Creator Pass',
  'Enterprise Agency Hub'
];

const DIRECTORIES_TO_SCAN = ['src', 'scripts'];
const FILES_TO_SCAN = ['server.ts', 'index.html'];

const IGNORED_FILES = [
  'scripts/checkPricingDrift.ts',
  'scripts/checkPricingDrift.js'
];

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function runCheck() {
  console.log('🔍 Running Pricing Drift Safeguard Check...');
  let filesToScan: string[] = [...FILES_TO_SCAN];

  DIRECTORIES_TO_SCAN.forEach((dir) => {
    filesToScan = filesToScan.concat(getAllFiles(dir));
  });

  let violationsCount = 0;

  filesToScan.forEach((filePath) => {
    const normalizedPath = filePath.replace(/\\/g, '/');
    if (IGNORED_FILES.some((ignored) => normalizedPath.endsWith(ignored))) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        BANNED_STRINGS.forEach((banned) => {
          if (line.includes(banned)) {
            console.error(
              `❌ PRICING DRIFT VIOLATION in ${filePath}:${index + 1}`
            );
            console.error(`   Found banned string: "${banned}"`);
            console.error(`   Line content: ${line.trim()}`);
            violationsCount++;
          }
        });
      });
    } catch (err) {
      // Ignore directory or unreadable file errors
    }
  });

  if (violationsCount > 0) {
    console.error(`\n🚨 FAILED: Found ${violationsCount} pricing drift violations in codebase.`);
    process.exit(1);
  } else {
    console.log('✅ PASSED: Zero pricing drift violations detected across codebase.');
    process.exit(0);
  }
}

runCheck();
