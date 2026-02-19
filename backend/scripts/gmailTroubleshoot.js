const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function gmailTroubleshoot() {
    console.log('🔧 GMAIL APP PASSWORD TROUBLESHOOTING\n');

    console.log('📋 CURRENT CONFIGURATION:');
    console.log('   EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
    console.log('   EMAIL_USER:', process.env.EMAIL_USER);
    console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
    console.log('   EMAIL_FROM:', process.env.EMAIL_FROM);

    console.log('\n❌ ERROR RECEIVED:');
    console.log('   "Invalid login: Username and Password not accepted"');
    console.log('   This means Gmail rejected the App Password\n');

    console.log('🔍 POSSIBLE ISSUES:');
    console.log('1. App Password Length:');
    console.log('   • Your password: "536277" (6 characters)');
    console.log('   • Expected: 16 characters (like "abcdefghijklmnop")');
    console.log('   • Gmail App Passwords are always 16 characters\n');

    console.log('2. App Password Format:');
    console.log('   • Gmail shows: "abcd efgh ijkl mnop" (with spaces)');
    console.log('   • You need: "abcdefghijklmnop" (no spaces)');
    console.log('   • Remove all spaces from the password\n');

    console.log('3. 2-Factor Authentication:');
    console.log('   • Must be enabled on bitaaaa2004@gmail.com');
    console.log('   • Check: https://myaccount.google.com/security');
    console.log('   • Look for "2-Step Verification: On"\n');

    console.log('🔧 SOLUTION STEPS:');
    console.log('1. Go to: https://myaccount.google.com/security');
    console.log('2. Sign in with: bitaaaa2004@gmail.com');
    console.log('3. Verify "2-Step Verification" is ON');
    console.log('4. Click "App passwords"');
    console.log('5. Generate NEW App Password for "Mail"');
    console.log('6. Copy the FULL 16-character password');
    console.log('7. Remove any spaces');
    console.log('8. Update EMAIL_PASSWORD in backend/.env');
    console.log('9. Test again\n');

    console.log('📝 EXAMPLE:');
    console.log('   Gmail shows: "abcd efgh ijkl mnop"');
    console.log('   You enter: EMAIL_PASSWORD=abcdefghijklmnop');
    console.log('   (16 characters, no spaces)\n');

    console.log('❓ NEED HELP?');
    console.log('   Tell me what you see when you go to:');
    console.log('   https://myaccount.google.com/security');
    console.log('   I can guide you through the exact steps!');
}

gmailTroubleshoot();