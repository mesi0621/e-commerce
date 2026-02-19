const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

async function configureEmail() {
    console.log('📧 Email Configuration Helper\n');

    console.log('Current status: Emails are only logged to console');
    console.log('Goal: Send real emails to customer inboxes\n');

    console.log('📋 What you need:');
    console.log('1. Gmail account: bitaaaa2004@gmail.com');
    console.log('2. 2-Factor Authentication enabled on Gmail');
    console.log('3. Gmail App Password (16 characters)\n');

    const hasAppPassword = await askQuestion('Do you have a Gmail App Password ready? (y/n): ');

    if (hasAppPassword.toLowerCase() !== 'y') {
        console.log('\n📱 How to get Gmail App Password:');
        console.log('1. Go to: https://myaccount.google.com/security');
        console.log('2. Enable "2-Step Verification" if not already enabled');
        console.log('3. Click "App passwords"');
        console.log('4. Select "Mail" → Generate');
        console.log('5. Copy the 16-character password (remove spaces)\n');

        const ready = await askQuestion('Ready to continue? (y/n): ');
        if (ready.toLowerCase() !== 'y') {
            console.log('\nSetup cancelled. Run this script again when you have the App Password.');
            rl.close();
            return;
        }
    }

    const appPassword = await askQuestion('\nEnter your Gmail App Password (16 characters, no spaces): ');

    if (!appPassword || appPassword.length < 16) {
        console.log('\n❌ Invalid App Password. Must be exactly 16 characters with no spaces.');
        console.log('Example: abcdefghijklmnop');
        rl.close();
        return;
    }

    // Validate App Password format (should be alphanumeric, 16 chars)
    if (!/^[a-zA-Z0-9]{16}$/.test(appPassword)) {
        console.log('\n❌ Invalid App Password format. Should be 16 alphanumeric characters.');
        console.log('Make sure to remove all spaces from the password.');
        rl.close();
        return;
    }

    try {
        // Update .env file
        const envPath = path.join(__dirname, '..', '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');

        // Replace the EMAIL_PASSWORD line
        const oldLine = 'EMAIL_PASSWORD=your_app_password_here';
        const newLine = `EMAIL_PASSWORD=${appPassword}`;

        if (envContent.includes(oldLine)) {
            envContent = envContent.replace(oldLine, newLine);
        } else {
            // If the line was already changed, replace any EMAIL_PASSWORD line
            envContent = envContent.replace(/EMAIL_PASSWORD=.*/, newLine);
        }

        fs.writeFileSync(envPath, envContent);

        console.log('\n✅ Email configuration updated successfully!');
        console.log('\n📧 New email settings:');
        console.log('- Service: Gmail');
        console.log('- User: bitaaaa2004@gmail.com');
        console.log('- Password: ***configured***');
        console.log('- From: Modo <bitaaaa2004@gmail.com>');

        console.log('\n🔄 Next steps:');
        console.log('1. Restart your backend server (Ctrl+C then node server.js)');
        console.log('2. Test password reset from the website');
        console.log('3. Check Gmail inbox for actual emails');

        console.log('\n🧪 Test commands:');
        console.log('- Test email sending: node scripts/enableGmailSending.js');
        console.log('- Clear rate limits: node scripts/clearPasswordResetTokens.js');

        console.log('\n⚠️  Important: Restart the backend server to apply changes!');

    } catch (error) {
        console.log('\n❌ Error updating configuration:', error.message);
    }

    rl.close();
}

configureEmail().catch(console.error);