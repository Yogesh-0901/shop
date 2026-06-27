const mongoose = require('mongoose');
require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');

const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Classic Linen Shirt',
    description: 'A breathable linen shirt with a relaxed fit, perfect for warm days and smart-casual outfits.',
    price: 54.99,
    category: "Men's Fashion",
    section: 'men',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    stock: 18,
    rating: 4.6
  },
  {
    name: 'Tailored Wool Blazer',
    description: 'A structured wool blazer with a refined silhouette for business meetings and evening events.',
    price: 129.0,
    category: "Men's Fashion",
    section: 'men',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    stock: 12,
    rating: 4.7
  },
  {
    name: 'Urban Denim Jacket',
    description: 'A heavyweight denim jacket with a modern cut and durable stitching for everyday wear.',
    price: 89.5,
    category: "Men's Fashion",
    section: 'men',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    stock: 16,
    rating: 4.4
  },
  {
    name: 'Minimalist Leather Belt',
    description: 'Crafted from smooth genuine leather with a polished buckle for a timeless finish.',
    price: 39.99,
    category: 'Accessories',
    section: 'unisex',
    image: 'https://images.unsplash.com/photo-1624222247344-5507f54f8f75?auto=format&fit=crop&w=900&q=80',
    stock: 24,
    rating: 4.3
  },
  {
    name: 'Silk Wrap Dress',
    description: 'An elegant wrap dress designed with a soft drape and flattering fit for day or evening.',
    price: 74.0,
    category: "Women's Fashion",
    section: 'women',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    stock: 15,
    rating: 4.8
  },
  {
    name: 'Oversized Knit Sweater',
    description: 'A cozy oversized sweater made from premium knit fabric for relaxed winter layers.',
    price: 64.99,
    category: "Women's Fashion",
    section: 'women',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    stock: 20,
    rating: 4.5
  },
  {
    name: 'Statement Tote Bag',
    description: 'A roomy tote bag with a bold shape and sturdy handles for everyday essentials.',
    price: 59.49,
    category: 'Accessories',
    section: 'women',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    stock: 22,
    rating: 4.6
  },
  {
    name: 'Floral Midi Skirt',
    description: 'A breezy midi skirt featuring a soft floral print and flattering silhouette.',
    price: 49.0,
    category: "Women's Fashion",
    section: 'women',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
    stock: 17,
    rating: 4.4
  },
  {
    name: 'Trail Runner Pro',
    description: 'Lightweight running shoes with cushioned support built for long miles and daily training.',
    price: 109.99,
    category: 'Shoes',
    section: 'unisex',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    stock: 14,
    rating: 4.7
  },
  {
    name: 'Executive Loafer',
    description: 'A polished loafer with premium leather and a refined shape made for formal occasions.',
    price: 95.0,
    category: 'Shoes',
    section: 'men',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80',
    stock: 13,
    rating: 4.5
  },
  {
    name: 'Cloud Cushion Sneaker',
    description: 'A plush everyday sneaker that pairs comfort and modern style in one versatile design.',
    price: 84.0,
    category: 'Shoes',
    section: 'women',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80',
    stock: 19,
    rating: 4.6
  },
  {
    name: 'Leather Chelsea Boot',
    description: 'A sleek Chelsea boot with a smooth finish and all-day comfort for urban wear.',
    price: 119.99,
    category: 'Shoes',
    section: 'men',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
    stock: 10,
    rating: 4.8
  },
  {
    name: 'UltraBook 14',
    description: 'A slim ultrabook with a vibrant display, long battery life, and fast performance.',
    price: 899.0,
    category: 'Electronics',
    section: 'unisex',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
    stock: 8,
    rating: 4.9
  },
  {
    name: 'Noise-Canceling Headphones',
    description: 'High-fidelity over-ear headphones with immersive sound and industry-leading noise cancellation.',
    price: 249.99,
    category: 'Electronics',
    section: 'unisex',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    stock: 11,
    rating: 4.8
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track workouts, notifications, and recovery with a sleek wearable designed for active lifestyles.',
    price: 179.5,
    category: 'Electronics',
    section: 'unisex',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
    stock: 9,
    rating: 4.6
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'A compact speaker with rich sound and long battery life for home or travel use.',
    price: 79.0,
    category: 'Electronics',
    section: 'unisex',
    image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=900&q=80',
    stock: 12,
    rating: 4.5
  },
  {
    name: 'Titanium Wrist Watch',
    description: 'A polished titanium watch featuring a minimalist dial and everyday durability.',
    price: 219.0,
    category: 'Accessories',
    section: 'unisex',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    stock: 7,
    rating: 4.7
  },
  {
    name: 'Sculpted Sunglasses',
    description: 'UV-protective sunglasses with a sculpted frame and premium lens finish.',
    price: 59.0,
    category: 'Accessories',
    section: 'unisex',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    stock: 16,
    rating: 4.4
  },
  {
    name: 'Travel Organizer',
    description: 'A neat organizer with compartments for cables, chargers, and personal essentials.',
    price: 34.99,
    category: 'Accessories',
    section: 'unisex',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
    stock: 18,
    rating: 4.3
  },
  {
    name: 'Ceramic Travel Mug',
    description: 'An insulated ceramic mug with a modern finish for commuting and office use.',
    price: 24.0,
    category: 'Accessories',
    section: 'unisex',
    image: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80',
    stock: 21,
    rating: 4.2
  }
];

const seedProducts = async ({ disconnectAfter = false } = {}) => {
  try {
    // Only connect if not already connected
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/shopApp';
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
    }

    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`✅ Database already has ${existingCount} product(s). Skipping seeding.`);
      return { inserted: 0, skipped: true };
    }

    await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully seeded ${sampleProducts.length} products!`);
    return { inserted: sampleProducts.length, skipped: false };
  } catch (error) {
    console.error('❌ Product seeding failed:', error.message);
    // Don't throw - allow app to continue without seeded data
    return { inserted: 0, error: error.message };
  } finally {
    if (disconnectAfter && mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
};

// If run as standalone script
if (require.main === module) {
  seedProducts({ disconnectAfter: true }).then((result) => {
    if (result.error) {
      console.error('Seeding failed:', result.error);
      process.exit(1);
    } else {
      console.log('Seeding completed:', result);
      process.exit(0);
    }
  }).catch((error) => {
    console.error('Fatal seeding error:', error);
    process.exit(1);
  });
}

module.exports = seedProducts;