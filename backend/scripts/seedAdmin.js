const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmlink_ai';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Checking for Admin user...');
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@farmlink.ai').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@FarmLink2026!';

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      admin = await User.create({
        fullName: process.env.ADMIN_NAME || 'Platform Administrator',
        email: adminEmail,
        phone: process.env.ADMIN_PHONE || '+919876543210',
        passwordHash,
        role: 'admin',
        state: process.env.ADMIN_STATE || 'Karnataka',
        district: process.env.ADMIN_DISTRICT || 'Bengaluru Urban',
        village: process.env.ADMIN_VILLAGE || 'Bengaluru Central',
        address: 'FARMlink AI Central Command, Innovation Park',
        isActive: true,
        isVerified: true
      });
      console.log(`[Seed] Admin created successfully: ${adminEmail}`);
    } else {
      console.log(`[Seed] Admin account already exists: ${adminEmail}`);
      // Ensure role and active status
      admin.role = 'admin';
      admin.isActive = true;
      admin.isVerified = true;
      await admin.save();
    }

    // Seed realistic sample accounts if no other users exist
    const userCount = await User.countDocuments({});
    if (userCount <= 1) {
      console.log('[Seed] Seeding sample demo accounts for Farmer, Buyer, and Transporter...');
      const defaultPassword = 'Password123!';
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(defaultPassword, salt);

      const demoUsers = [
        {
          fullName: 'Ramesh Patel',
          email: 'farmer.ramesh@farmlink.ai',
          phone: '+919811223344',
          passwordHash,
          role: 'farmer',
          state: 'Gujarat',
          district: 'Mehsana',
          village: 'Kadi',
          address: 'Plot 42, Green Agro Farm Road',
          farmerDetails: {
            farmName: 'Patel Organic Farms',
            farmLocation: 'Kadi, Mehsana, Gujarat',
            farmingExperience: 14,
            mainCropsGrown: ['Organic Wheat', 'Mustard', 'Cotton', 'Castor Seeds']
          },
          isActive: true,
          isVerified: true
        },
        {
          fullName: 'Kavita Sundaram',
          email: 'farmer.kavita@farmlink.ai',
          phone: '+919822334455',
          passwordHash,
          role: 'farmer',
          state: 'Maharashtra',
          district: 'Nashik',
          village: 'Dindori',
          address: 'Survey No. 88, Vineyard Valley',
          farmerDetails: {
            farmName: 'Sundaram Agro Orchards',
            farmLocation: 'Dindori, Nashik, Maharashtra',
            farmingExperience: 9,
            mainCropsGrown: ['Table Grapes', 'Red Onions', 'Pomegranate', 'Tomatoes']
          },
          isActive: true,
          isVerified: true
        },
        {
          fullName: 'Ananya Sharma',
          email: 'buyer.ananya@farmlink.ai',
          phone: '+919833445566',
          passwordHash,
          role: 'buyer',
          state: 'Maharashtra',
          district: 'Mumbai Suburban',
          village: 'Andheri East',
          address: 'Suite 404, Apex Fresh Foods Logistics Hub',
          buyerDetails: {
            businessName: 'Apex Fresh Foods Pvt Ltd',
            businessType: 'Wholesale Distributor',
            businessLocation: 'APMC Market, Vashi & Andheri Depot',
            requiredCategories: ['Fresh Vegetables', 'Grains & Cereals', 'Pulses']
          },
          isActive: true,
          isVerified: true
        },
        {
          fullName: 'Vikram Singh',
          email: 'transporter.vikram@farmlink.ai',
          phone: '+919844556677',
          passwordHash,
          role: 'transporter',
          state: 'Haryana',
          district: 'Gurugram',
          village: 'Manesar',
          address: 'Yard 12, Expressway Logistics Park',
          transporterDetails: {
            companyOrIndividualName: 'Kisan Express Logistics & Freight',
            vehicleType: 'Multi-Axle Refrigerated Container Truck',
            vehicleRegNumber: 'HR-26-DQ-9042',
            vehicleCapacity: '12 Metric Tonnes (Cold Storage)',
            operatingLocations: ['Haryana', 'Punjab', 'Delhi NCR', 'Rajasthan', 'Gujarat']
          },
          isActive: true,
          isVerified: true
        }
      ];

      for (const demo of demoUsers) {
        await User.create(demo);
        console.log(`[Seed] Created demo user: ${demo.role.toUpperCase()} - ${demo.email}`);
      }
    }

    console.log('\n===============================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY');
    console.log('===============================================');
    console.log('Default Admin Account:');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('Demo Accounts Password: Password123!');
    console.log('  Farmer:      farmer.ramesh@farmlink.ai');
    console.log('  Buyer:       buyer.ananya@farmlink.ai');
    console.log('  Transporter: transporter.vikram@farmlink.ai');
    console.log('===============================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
