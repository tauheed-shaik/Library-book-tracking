require('dotenv').config();
const { connectDB } = require('./utils/database');
const User = require('./models/User');
const Book = require('./models/Book');
const Category = require('./models/Category');
const FinePolicy = require('./models/FinePolicy');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Category.deleteMany({});
    await FinePolicy.deleteMany({});

    // Create Categories
    const categories = await Category.insertMany([
      { name: 'Fiction', description: 'Fiction novels and stories' },
      { name: 'Science', description: 'Science and technology books' },
      { name: 'History', description: 'History and biography books' },
      { name: 'Self-Help', description: 'Self-help and personal development' },
      { name: 'Children', description: 'Children and young adult books' }
    ]);

    // Create Sample Books
    const books = await Book.insertMany([
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780060935467',
        category: categories[0]._id,
        totalCopies: 5,
        availableCopies: 5,
        publishedYear: 1960,
        description: 'A classic of modern American literature'
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '9780553380163',
        category: categories[1]._id,
        totalCopies: 3,
        availableCopies: 3,
        publishedYear: 1988,
        description: 'From the big bang to black holes'
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451526342',
        category: categories[0]._id,
        totalCopies: 4,
        availableCopies: 4,
        publishedYear: 1949,
        description: 'A dystopian social science fiction novel'
      }
    ]);

    // Create Sample Users with hashed passwords
    // Note: The User model has a pre-save hook that hashes the password, 
    // but sometimes insertMany bypasses hooks or people use different versions of mongoose.
    // Let's create them one by one to ensure hooks run correctly.

    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '9876543210',
        role: 'user',
        membershipStatus: 'active'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'user',
        membershipStatus: 'active'
      },
      {
        name: 'Librarian Mike',
        email: 'librarian@example.com',
        password: 'password123',
        phone: '9876543212',
        role: 'staff',
        membershipStatus: 'active'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }

    // Create Fine Policy
    await FinePolicy.create({
      dailyFineAmount: 10,
      maxDaysForFine: 30,
      maxFineAmount: 500,
      issuePeriodDays: 14,
      renewalLimit: 2,
      maxBooksPerUser: 5
    });

    // Update category book counts
    for (let i = 0; i < categories.length; i++) {
      const count = await Book.countDocuments({ category: categories[i]._id });
      await Category.findByIdAndUpdate(categories[i]._id, { bookCount: count });
    }

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
