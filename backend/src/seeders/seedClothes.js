const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

const sampleClothes = [
  // WOMEN
  {
    name: 'Floral Summer Dress',
    description: 'A beautiful floral dress perfect for summer days.',
    price: 45.99,
    category: 'Dresses',
    section: 'women',
    image: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg',
    stock: 20,
    rating: 4.5
  },
  {
    name: 'Elegant Evening Dress',
    description: 'Stunning black dress for evening parties.',
    price: 89.99,
    category: 'Dresses',
    section: 'women',
    image: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg',
    stock: 10,
    rating: 4.8
  },
  {
    name: 'Casual Crop Top',
    description: 'Comfortable cotton crop top for daily wear.',
    price: 19.99,
    category: 'Tops',
    section: 'women',
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
    stock: 50,
    rating: 4.2
  },
  {
    name: 'Traditional Silk Saree',
    description: 'Authentic silk saree with intricate gold border.',
    price: 120.00,
    category: 'Sarees',
    section: 'women',
    image: 'https://images.pexels.com/photos/1453008/pexels-photo-1453008.jpeg',
    stock: 15,
    rating: 4.9
  },
  // MEN
  {
    name: 'Classic White Shirt',
    description: 'A crisp white button-down shirt for any formal occasion.',
    price: 35.99,
    category: 'Shirts',
    section: 'men',
    image: 'https://images.pexels.com/photos/1321943/pexels-photo-1321943.jpeg',
    stock: 30,
    rating: 4.7
  },
  {
    name: 'Graphic Print T-Shirt',
    description: 'Cool graphic tee made with 100% breathable cotton.',
    price: 24.99,
    category: 'T-Shirts',
    section: 'men',
    image: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg',
    stock: 45,
    rating: 4.4
  },
  {
    name: 'Slim Fit Denim Pants',
    description: 'Modern slim fit blue jeans.',
    price: 55.00,
    category: 'Pants',
    section: 'men',
    image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg',
    stock: 25,
    rating: 4.6
  },
  {
    name: 'Casual Chino Trousers',
    description: 'Lightweight and stylish khaki pants.',
    price: 49.99,
    category: 'Pants',
    section: 'men',
    image: 'https://images.pexels.com/photos/842811/pexels-photo-842811.jpeg',
    stock: 30,
    rating: 4.5
  },
  // KIDS
  {
    name: 'Kids Graphic T-Shirt',
    description: 'Fun and colorful t-shirt for kids.',
    price: 15.99,
    category: 'T-Shirts',
    section: 'kids',
    image: 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg',
    stock: 60,
    rating: 4.3
  },
  {
    name: 'Comfortable Play Shorts',
    description: 'Durable cotton shorts for active play.',
    price: 18.99,
    category: 'Shorts',
    section: 'kids',
    image: 'https://images.pexels.com/photos/168866/pexels-photo-168866.jpeg',
    stock: 40,
    rating: 4.6
  },
  {
    name: 'Cute Summer Dress',
    description: 'A beautiful dress for little girls.',
    price: 22.99,
    category: 'Dresses',
    section: 'kids',
    image: 'https://images.pexels.com/photos/1619697/pexels-photo-1619697.jpeg',
    stock: 25,
    rating: 4.7
  }
];

const seedClothes = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for clothing seeding...');
    
    // Clear old products to remove non-clothing items
    await Product.deleteMany({});
    console.log('Cleared old non-clothing products.');
    
    const User = require('../models/User');
    let seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      seller = await User.create({
        fullName: 'Default Seller',
        email: 'seller@example.com',
        password: 'password123',
        role: 'seller'
      });
    }

    const clothesWithSeller = sampleClothes.map(cloth => ({
      ...cloth,
      seller: seller._id
    }));

    const inserted = await Product.insertMany(clothesWithSeller);
    console.log(`Successfully seeded ${inserted.length} clothing items.`);
    
    await mongoose.disconnect();
    console.log('Seeding completed. Disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding clothes:', error);
    process.exit(1);
  }
};

seedClothes();
