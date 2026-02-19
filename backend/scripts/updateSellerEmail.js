const mongoose = require('mongoose');
const AuthUser = require('../models/AuthUser');
const SellerProfile = require('../models/SellerProfile');
require('dotenv').config();

async function updateSellerEmail() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('Connected to MongoDB\n');

        // Find current seller user
        const seller = await AuthUser.findOne({ role: 'seller' });

        if (seller) {
            console.log('✅ Current seller found:');
            console.log('Current Email:', seller.email);
            console.log('Username:', seller.username);

            // Update seller user email
            const newEmail = 'meseretmezgebe338@gmail.com';
            seller.email = newEmail;
            seller.updatedAt = new Date();

            await seller.save();

            // Update seller profile email
            const sellerProfile = await SellerProfile.findOne({ userId: seller._id });
            if (sellerProfile) {
                sellerProfile.businessEmail = newEmail;
                sellerProfile.updatedAt = new Date();
                await sellerProfile.save();
                console.log('✅ Seller profile email also updated');
            }

            console.log('\n✅ Seller email updated successfully!');
            console.log('New Email:', newEmail);
            console.log('Password remains: seller123');
        } else {
            console.log('❌ Seller user not found!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

updateSellerEmail();