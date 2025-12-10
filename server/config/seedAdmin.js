/**
 * Admin Seed Script
 * @description Seeds the database with an admin user
 * @author Member-1 (Module 2)
 * 
 * Usage: node config/seedAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('./config');

const seedAdmin = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log('📦 Connected to MongoDB');

        const existingAdmin = await User.findOne({ email: 'admin@urbanmaid.com' });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('   Email: admin@urbanmaid.com');
            await mongoose.connection.close();
            return;
        }

        const adminUser = await User.create({
            name: 'System Admin',
            email: 'admin@urbanmaid.com',
            password: 'Admin@123',
            role: 'admin',
            isVerified: true,
            phone: '+8801700000000',
            address: {
                street: 'Admin Office',
                city: 'Dhaka',
                state: 'Dhaka Division',
                zipCode: '1000',
                country: 'Bangladesh',
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log('========================================');
        console.log('   Email: admin@urbanmaid.com');
        console.log('   Password: Admin@123');
        console.log('   ID:', adminUser._id);
        console.log('========================================');

        await mongoose.connection.close();
        console.log('📦 Database connection closed');

    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
