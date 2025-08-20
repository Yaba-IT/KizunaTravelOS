#!/usr/bin/env node

/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/scripts/check-version.js - Node.js version check script
* Ensures the correct Node.js version is installed
*
* coded by farid212@Yaba-IT!
*/

const requiredVersion = 20;
const currentVersion = parseInt(process.version.slice(1).split('.')[0]);

console.log(`\n🔍 Node.js Version Check`);
console.log(`Current version: ${process.version}`);
console.log(`Required version: ${requiredVersion}+`);

if (currentVersion >= requiredVersion) {
  console.log(`✅ Node.js version ${requiredVersion}+ requirement met`);
  process.exit(0);
} else {
  console.log(`❌ Node.js version ${requiredVersion}+ required, but ${currentVersion} is installed`);
  console.log(`\nPlease upgrade Node.js to version ${requiredVersion} or higher.`);
  console.log(`\nYou can download it from: https://nodejs.org/`);
  console.log(`Or use a version manager like nvm:`);
  console.log(`  nvm install 20`);
  console.log(`  nvm use 20`);
  process.exit(1);
}

