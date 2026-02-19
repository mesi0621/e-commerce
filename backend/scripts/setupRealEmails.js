const fs = require('fs');
const path = require('path');

console.log('📧 SETUP REAL EMAIL SENDING FOR MODO\n');

console.log('🎯 Goal: Send password reset emails to real customer inboxes');
console.log('📧 Current: Emails only logged to console (development mode)\n');

console.log('🔧 STEP-BY-STEP GMAIL SETUP:\n');

console.log('1️⃣ ENABLE 2-FACTOR AUTHENTICATION');
console.log('   • Go to: https://myaccount.google.com/security');
console.log('   • Find "2-Step Verification"');
console.log('   • If it says "Off", click and enable it');
console.log('   • If it says "On", you\'re ready for step 2\n');

console.log('2️⃣ GENERATE GMAIL APP PASSWORD');
console.log('   • Still in Google Account Security');
console.log('   • Look for "App passwords" (might need to scroll)');
console.log('   • Click "App passwords"');
console.log('   • Select "Mail" from dropdown');
console.log('   • Click "Generate"');
console.log('   • COPY the 16-character password (example: abcd efgh ijkl mnop)\n');

console.log('3️⃣ UPDATE CONFIGURATION');
console.log('   • Open: backend/.env file');
console.log('   • Find: EMAIL_PASSWORD=your_app_password_here');
console.log('   • Replace with: EMAIL_PASSWORD=your16characterpassword');
console.log('   • IMPORTANT: Remove all spaces from the password\n');

console.log('4️⃣ RESTART BACKEND SERVER');
console.log('   • Stop current server (Ctrl+C)');
console.log('   • Start again: node server.js\n');

console.log('5️⃣ TEST REAL EMAIL SENDING');
console.log('   • Run: node scripts/testRealEmails.js');
console.log('   • Check Gmail inbox for actual emails\n');

console.log('📋 CURRENT CONFIGURATION:');
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const emailService = envContent.match(/EMAIL_SERVICE=(.+)/)?.[1] || 'not set';
const emailUser = envContent.match(/EMAIL_USER=(.+)/)?.[1] || 'not set';
const emailPassword = envContent.match(/EMAIL_PASSWORD=(.+)/)?.[1] || 'not set';
const emailFrom = envContent.match(/EMAIL_FROM=(.+)/)?.[1] || 'not set';

console.log('   • Service:', emailService);
console.log('   • User:', emailUser);
console.log('   • Password:', emailPassword === 'your_app_password_here' ? '❌ PLACEHOLDER (needs setup)' : '✅ Configured');
console.log('   • From:', emailFrom);

console.log('\n🚨 WHAT HAPPENS AFTER SETUP:');
console.log('   • Customer clicks "Forgot Password"');
console.log('   • Customer enters email address');
console.log('   • REAL EMAIL sent to customer\'s Gmail inbox');
console.log('   • Customer receives email with reset link');
console.log('   • Customer can reset password successfully');

console.log('\n💡 NEED HELP?');
console.log('   • Can\'t find "App passwords"? Enable 2-Factor Authentication first');
console.log('   • App password has spaces? Remove them: abcdefghijklmnop');
console.log('   • Still not working? Run: node scripts/testRealEmails.js');

console.log('\n🎯 READY TO START? Follow steps 1-5 above!');