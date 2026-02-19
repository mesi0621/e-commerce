const fs = require('fs');
const path = require('path');

// Files to update with their specific replacements
const filesToUpdate = [
    {
        file: './services/EmailService.js',
        replacements: [
            { from: 'The Shopper Team', to: 'The Modo Team' },
            { from: 'Shopper', to: 'Modo' },
            { from: 'shopper.com', to: 'modo.com' }
        ]
    },
    {
        file: './scripts/enableGmailSending.js',
        replacements: [
            { from: 'Shopper', to: 'Modo' }
        ]
    },
    {
        file: './scripts/testEmailNotifications.js',
        replacements: [
            { from: 'Shopper', to: 'Modo' }
        ]
    },
    {
        file: '../frontend/src/Components/Navbar/Navbar.jsx',
        replacements: [
            { from: 'SHOPPER', to: 'MODO' },
            { from: 'Shopper', to: 'Modo' }
        ]
    },
    {
        file: '../frontend/src/Components/Footer/Footer.jsx',
        replacements: [
            { from: 'SHOPPER', to: 'MODO' },
            { from: 'Shopper', to: 'Modo' }
        ]
    }
];

function updateFile(filePath, replacements) {
    try {
        const fullPath = path.resolve(filePath);

        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(fullPath, 'utf8');
        let updated = false;

        replacements.forEach(({ from, to }) => {
            const regex = new RegExp(from, 'g');
            if (content.includes(from)) {
                content = content.replace(regex, to);
                updated = true;
                console.log(`✅ Replaced "${from}" with "${to}" in ${filePath}`);
            }
        });

        if (updated) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`📝 Updated: ${filePath}`);
        } else {
            console.log(`ℹ️  No changes needed: ${filePath}`);
        }

    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

function rebrandToModo() {
    console.log('🔄 Rebranding from Shopper to Modo...\n');

    filesToUpdate.forEach(({ file, replacements }) => {
        updateFile(file, replacements);
    });

    console.log('\n🎉 Rebranding complete!');
    console.log('\n📋 Summary of changes:');
    console.log('- Email service: Shopper → Modo');
    console.log('- Email templates: All references updated');
    console.log('- Brand name: SHOPPER → MODO');
    console.log('- Domain references: shopper.com → modo.com');
    console.log('\n⚠️  Note: You may need to restart the backend server to see changes.');
}

rebrandToModo();