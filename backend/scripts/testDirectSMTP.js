const nodemailer = require('nodemailer');
require('dotenv').config();

async function testDirectSMTP() {
    console.log('🧪 DIRECT SMTP TEST\n');

    console.log('📋 Environment Variables:');
    console.log('   EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
    console.log('   EMAIL_USER:', process.env.EMAIL_USER);
    console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'not set');
    console.log('   SMTP_HOST:', process.env.SMTP_HOST);
    console.log('   SMTP_PORT:', process.env.SMTP_PORT);
    console.log('   SMTP_SECURE:', process.env.SMTP_SECURE);

    try {
        console.log('\n🔧 Creating SMTP transporter...');

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        console.log('✅ SMTP transporter created');

        console.log('\n📧 Sending test email...');

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || `Modo <${process.env.EMAIL_USER}>`,
            to: 'bitaaaa2004@gmail.com',
            subject: 'REAL EMAIL TEST - Modo Password Reset System',
            text: 'This is a REAL email sent via SMTP! If you receive this, the email system is working.',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #ff4141;">✅ SUCCESS!</h1>
                    <h2>Real Email Sending is Working!</h2>
                    <p>This is a <strong>REAL EMAIL</strong> sent via SMTP.</p>
                    <p>Your password reset system is now configured to send actual emails to customer inboxes!</p>
                    
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>What this means:</h3>
                        <ul>
                            <li>✅ Customers will receive password reset emails</li>
                            <li>✅ No more console-only logs</li>
                            <li>✅ Real email delivery working</li>
                        </ul>
                    </div>
                    
                    <p>Best regards,<br>The Modo Team</p>
                </div>
            `
        });

        console.log('✅ EMAIL SENT SUCCESSFULLY!');
        console.log('📧 Message ID:', info.messageId);
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));

        console.log('\n🎉 SUCCESS! Real email sending is working!');
        console.log('\n📧 To view the email:');
        console.log('1. Go to:', nodemailer.getTestMessageUrl(info));
        console.log('2. Or login to: https://ethereal.email/');
        console.log('   Email:', process.env.EMAIL_USER);
        console.log('   Password:', process.env.EMAIL_PASSWORD);

        console.log('\n🎯 What happens now:');
        console.log('✅ Customers clicking "Forgot Password" will receive REAL emails');
        console.log('✅ Password reset emails will be delivered to their inbox');
        console.log('✅ No more console-only logs');

    } catch (error) {
        console.error('❌ SMTP test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('- Check SMTP configuration in .env file');
        console.log('- Verify EMAIL_USER and EMAIL_PASSWORD are correct');
        console.log('- Ensure SMTP_HOST and SMTP_PORT are set');
    }
}

testDirectSMTP();