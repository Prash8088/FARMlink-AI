const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const { Product } = require('../models/Product');

const seedProducts = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmlink_ai';
    console.log(`[Seed Products] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    const ramesh = await User.findOne({ email: 'farmer.ramesh@farmlink.ai' });
    const kavita = await User.findOne({ email: 'farmer.kavita@farmlink.ai' });

    if (!ramesh || !kavita) {
      console.log('[Seed Products] Farmer accounts not found. Run seedAdmin.js first.');
      process.exit(1);
    }

    const existingCount = await Product.countDocuments({});
    if (existingCount > 0) {
      console.log(`[Seed Products] Products already exist (${existingCount} listings). Skipping seeding.`);
      await mongoose.connection.close();
      process.exit(0);
    }

    const sampleProducts = [
      {
        farmerId: ramesh._id,
        cropName: 'Sharbati Premium Golden Wheat',
        category: 'Grains & Cereals',
        description:
          'Single-origin certified Sharbati wheat grown in deep black soil of Mehsana. Machine-cleaned, sorted with zero stones, moisture strictly below 10%. Excellent gluten strength for artisanal chapati and bakery use.',
        images: [
          'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
        ],
        quantity: 120,
        unit: 'quintal',
        pricePerUnit: 2850,
        qualityGrade: 'Grade A (Premium)',
        harvestDate: new Date('2026-10-15'),
        pickupLocation: 'Patel Agro Godown, Kadi Industrial Corridor',
        state: 'Gujarat',
        district: 'Mehsana',
        village: 'Kadi',
        status: 'available',
        isActive: true,
        viewsCount: 14
      },
      {
        farmerId: ramesh._id,
        cropName: 'Organic Yellow Mustard Seeds',
        category: 'Oilseeds',
        description:
          'Chemical-free yellow mustard seeds with high oil content (>42%). Sourced from winter harvest, double-filtered, ideal for cold-pressed oil extraction and condiment processing.',
        images: [
          'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=800'
        ],
        quantity: 75,
        unit: 'quintal',
        pricePerUnit: 5400,
        qualityGrade: 'Grade A (Premium)',
        harvestDate: new Date('2026-10-25'),
        pickupLocation: 'Farm Warehouse, Survey 42, Kadi',
        state: 'Gujarat',
        district: 'Mehsana',
        village: 'Kadi',
        status: 'available',
        isActive: true,
        viewsCount: 9
      },
      {
        farmerId: kavita._id,
        cropName: 'Nashik Red Onions (Medium-Large Bulb)',
        category: 'Fresh Vegetables',
        description:
          'Export-quality pungent red onions with 55mm+ diameter. Properly cured skins with excellent shelf life for long-distance transport and cold storage.',
        images: [
          'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?auto=format&fit=crop&q=80&w=800'
        ],
        quantity: 250,
        unit: 'quintal',
        pricePerUnit: 1850,
        qualityGrade: 'Grade B (Standard)',
        harvestDate: new Date('2026-11-01'),
        pickupLocation: 'Sundaram Orchards, Dindori Road Mandi Yard',
        state: 'Maharashtra',
        district: 'Nashik',
        village: 'Dindori',
        status: 'available',
        isActive: true,
        viewsCount: 22
      },
      {
        farmerId: kavita._id,
        cropName: 'Thompson Seedless Table Grapes',
        category: 'Horticulture & Fruits',
        description:
          'Brix sugar index 18%+. Sweet, crisp seedless white table grapes harvested at peak morning chill. Packaged in 5kg ventilated CFB boxes ready for cold-chain transit.',
        images: [
          'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&q=80&w=800'
        ],
        quantity: 40,
        unit: 'quintal',
        pricePerUnit: 8200,
        qualityGrade: 'Grade A (Premium)',
        harvestDate: new Date('2026-11-05'),
        pickupLocation: 'Cold Packhouse 1, Vineyard Valley, Dindori',
        state: 'Maharashtra',
        district: 'Nashik',
        village: 'Dindori',
        status: 'available',
        isActive: true,
        viewsCount: 31
      }
    ];

    for (const prod of sampleProducts) {
      await Product.create(prod);
      console.log(`[Seed Products] Created product: "${prod.cropName}" (${prod.quantity} ${prod.unit})`);
    }

    console.log('\n===============================================');
    console.log(' PRODUCT SEEDING COMPLETED SUCCESSFULLY');
    console.log(` Seeded ${sampleProducts.length} authentic crop listings.`);
    console.log('===============================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Products Error]', error);
    process.exit(1);
  }
};

seedProducts();
