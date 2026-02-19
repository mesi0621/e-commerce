const fs = require('fs');
const path = require('path');

function updateGmailPassword() {
    console.log('🔧 UPDATE GMAIL APP PASSWORD\n');

    const envPath = path.join(__dirname, '..', '.env');

    console.log('📋 CURRENT STATUS:');
    console.log('   EMAIL_SERVICE: gmail ✅');
    console.log('   EMAIL_USER: bitaaaa2004@gmail.com ✅');
    console.log('   EMAIL_PASSWORD: your_app_password_here ❌ NEEDS UPDATE');
    console.log('   EMAIL_FROM: Modo <bitaaaa2004@gmail.com> ✅\n');

    console.log('🔑 TO UPDATE YOUR GMAIL APP PASSWORD:');
    console.log('1. Open backend/.env file');
    console.log('2. Find this line: EMAIL_PASSWORD=your_app_password_here');
    console.log('3. Replace "your_app_password_here" with your 16-character Gmail App Password');
    console.log('4. Save the file');
    console.log('5. Restart the backend server\n');

    console.log('📝 EXAMPLE:');
    console.log('   FROM: EMAIL_PASSWORD=your_app_password_here');
    console.log('   TO:   EMAIL_PASSWORD=abcdefghijklmnop');
    console.log('   (Use your actual 16-character App Password)\n');

    console.log('❓ HOW TO GET GMAIL APP PASSWORD:');
    console.log('1. Go to: https://myaccount.google.com/security');
    console.log('2. Sign in with: bitaaaa2004@gmail.com');
    console.log('3. Find "App passwords" (under 2-Step Verification)');
    console.log('4. Generate new App Password for "Mail"');
    console.log('5. Copy the 16-character password (remove spaces)\n');

    console.log('🧪 AFTER UPDATE:');
    console.log('   Run: node backend/scripts/testRealEmails.js');
    console.log('   Check Gmail inboxes for real emails!');
}

updateGmailPassword();