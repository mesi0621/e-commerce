const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

async function setupSimpleEmail() {
    console.log('📧 ALTERNATIVE EMAIL SETUP - No Gmail App Password Needed\n');

    console.log('🎯 Goal: Send real password reset emails without complex Gmail setup');
    console.log('📧 Solution: Use Ethereal Email (test email service)\n');

    try {
        // Create test account with Ethereal Email
        console.log('🔧 Creating test email account...');
        const testAccount = await nodemailer.createTestAccount();

        console.log('✅ Test email account created!');
        console.log('📧 Email Details:');
        console.log('   Host:', testAccount.smtp.host);
        console.log('   Port:', testAccount.smtp.port);
        console.log('   User:', testAccount.user);
        console.log('   Pass:', testAccount.pass);

        // Update .env file with test email configuration
        const envPath = path.join(__dirname, '..', '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');

        // Replace email configuration
        envContent = envContent.replace(/EMAIL_SERVICE=.*/g, 'EMAIL_SERVICE=smtp');
        envContent = envContent.replace(/EMAIL_USER=.*/g, `EMAIL_USER=${testAccount.user}`);
        envContent = envContent.replace(/EMAIL_PASSWORD=.*/g, `EMAIL_PASSWORD=${testAccount.pass}`);
        envContent = envContent.replace(/EMAIL_FROM=.*/g, `EMAIL_FROM=Modo <${testAccount.user}>`);

        // Add SMTP configuration
        if (!envContent.includes('SMTP_HOST=')) {
            envContent += `\n# SMTP Configuration\nSMTP_HOST=${testAccount.smtp.host}\nSMTP_PORT=${testAccount.smtp.port}\nSMTP_SECURE=false\n`;
        } else {
            envContent = envContent.replace(/SMTP_HOST=.*/g, `SMTP_HOST=${testAccount.smtp.host}`);
            envContent = envContent.replace(/SMTP_PORT=.*/g, `SMTP_PORT=${testAccount.smtp.port}`);
            envContent = envContent.replace(/SMTP_SECURE=.*/g, `SMTP_SECURE=false`);
        }

        fs.writeFileSync(envPath, envContent);

        console.log('\n✅ Configuration updated!');
        console.log('\n📋 New Email Settings:');
        console.log('   Service: SMTP (Ethereal Email)');
        console.log('   Host:', testAccount.smtp.host);
        console.log('   User:', testAccount.user);
        console.log('   Password: ***configured***');

        console.log('\n🔄 Next Steps:');
        console.log('1. Restart backend server (Ctrl+C then node server.js)');
        console.log('2. Test password reset from website');
        console.log('3. Check email preview at: https://ethereal.email/');

        console.log('\n📧 How to View Emails:');
        console.log('1. Go to: https://ethereal.email/');
        console.log('2. Login with:');
        console.log('   Email:', testAccount.user);
        console.log('   Password:', testAccount.pass);
        console.log('3. View all sent emails in the inbox');

        console.log('\n🎯 What This Solves:');
        console.log('✅ Real email sending (not console logs)');
        console.log('✅ No Gmail App Password needed');
        console.log('✅ View emails in web interface');
        console.log('✅ Test password reset functionality');

        console.log('\n⚠️  Note: This is for testing. For production, use real Gmail or other service.');

    } catch (error) {
        console.error('❌ Error setting up email:', error.message);
    }
}

setupSimpleEmail();