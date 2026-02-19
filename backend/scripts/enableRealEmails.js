const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function enableRealEmails() {
    console.log('🔧 Gmail Email Configuration Setup\n');

    console.log('📋 Current Status: Emails are logged to console only (development mode)');
    console.log('🎯 Goal: Enable real Gmail email sending\n');

    console.log('📝 Prerequisites:');
    console.log('1. Gmail account: bitaaaa2004@gmail.com');
    console.log('2. 2-Factor Authentication enabled');
    console.log('3. Gmail App Password generated\n');

    const hasAppPassword = await askQuestion('Do you have a Gmail App Password ready? (y/n): ');

    if (hasAppPassword.toLowerCase() !== 'y') {
        console.log('\n📱 How to get Gmail App Password:');
        console.log('1. Go to https://myaccount.google.com/');
        console.log('2. Click "Security" → "2-Step Verification" (enable if not already)');
        console.log('3. Go back to Security → "App passwords"');
        console.log('4. Select "Mail" → Generate');
        console.log('5. Copy the 16-character password\n');

        const continueSetup = await askQuestion('Ready to continue with App Password? (y/n): ');
        if (continueSetup.toLowerCase() !== 'y') {
            console.log('Setup cancelled. Run this script again when ready.');
            rl.close();
            return;
        }
    }

    const appPassword = await askQuestion('Enter your Gmail App Password (16 characters): ');

    if (!appPassword || appPassword.length < 16) {
        console.log('❌ Invalid App Password. Must be 16 characters.');
        rl.close();
        return;
    }

    // Update .env file
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Replace the EMAIL_PASSWORD line
    envContent = envContent.replace(
        /EMAIL_PASSWORD=.*/,
        `EMAIL_PASSWORD=${appPassword.replace(/\s/g, '')}`
    );

    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Configuration updated!');
    console.log('📧 Email settings:');
    console.log('- Service: Gmail');
    console.log('- User: bitaaaa2004@gmail.com');
    console.log('- Password: ***configured***');
    console.log('- From: Modo <bitaaaa2004@gmail.com>');

    console.log('\n🔄 Next steps:');
    console.log('1. Restart the backend server');
    console.log('2. Test password reset functionality');
    console.log('3. Check Gmail inbox for actual emails');

    console.log('\n🧪 Test commands:');
    console.log('- Test email sending: node scripts/enableGmailSending.js');
    console.log('- Test password reset: node scripts/testPasswordReset.js');

    rl.close();
}

enableRealEmails().catch(console.error);