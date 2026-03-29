const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const dotenv = require('dotenv');
const dns = require('dns');

// 1. Force Google DNS to prevent Atlas Windows ECONNREFUSED issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

console.log("🌱 Starting Database Seeder...");

// 2. Safely load URIs from individual .env files
const loadEnvUrl = (serviceDir) => {
  try {
    const envConfig = dotenv.parse(fs.readFileSync(`./${serviceDir}/.env`));
    return envConfig.MONGO_URI;
  } catch (e) {
    console.error(`❌ Could not load .env from ${serviceDir}. Make sure it exists!`);
    process.exit(1);
  }
};

const uris = {
  users: loadEnvUrl('user-service'),
  books: loadEnvUrl('book-service'),
  reservations: loadEnvUrl('reservation-service'),
  borrows: loadEnvUrl('borrow-fine-service')
};

// 3. Define Schemas natively within the script to avoid cross-connection issues
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['member', 'admin', 'librarian'] },
  phone: String,
  address: String,
  membershipId: { type: String, unique: true },
});
userSchema.pre('save', async function () {
  if (this.isModified('password') && !this.password.startsWith('$2a$')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

const bookSchema = new mongoose.Schema({
  title: String, author: String, isbn: String, genre: String, publisher: String,
  publishedYear: Number, totalCopies: Number, availableCopies: Number, description: String,
});

const reservationSchema = new mongoose.Schema({
  userId: String, bookId: String, reservationDate: { type: Date, default: Date.now },
  expiryDate: Date, status: { type: String, default: 'pending' }, notes: String,
});

const borrowSchema = new mongoose.Schema({
  userId: String, bookId: String, borrowDate: { type: Date, default: Date.now },
  dueDate: Date, returnDate: Date, status: { type: String, default: 'borrowed' },
  fineAmount: Number, finePaid: Boolean,
});

// 4. The main seeding async function
async function runSeeder() {
  console.log("🔌 Connecting to Atlas cluster...");

  // Create explicit connections
  const connUsers = mongoose.createConnection(uris.users);
  const connBooks = mongoose.createConnection(uris.books);
  const connReserv = mongoose.createConnection(uris.reservations);
  const connBorr = mongoose.createConnection(uris.borrows);

  // Bind models to individual connections
  const User = connUsers.model('User', userSchema);
  const Book = connBooks.model('Book', bookSchema);
  const Reservation = connReserv.model('Reservation', reservationSchema);
  const Borrow = connBorr.model('Borrow', borrowSchema);

  console.log("🧹 Clearing old databases...");
  await Promise.all([
    User.deleteMany({}), Book.deleteMany({}),
    Reservation.deleteMany({}), Borrow.deleteMany({})
  ]);

  // Seed Users
  console.log("👤 Seeding Library Accounts...");

  const librarian = await User.create({
    name: "Head Librarian", email: "admin@library.lk", password: "Admin123",
    role: "librarian", phone: "0770000000", address: "Main Library Desk", membershipId: "LIB-ADMIN"
  });

  const member = await User.create({
    name: "Alice Johnson", email: "alice@student.lk", password: "Member123",
    role: "member", phone: "0711111111", address: "Dormitory 4", membershipId: "LIB-000001"
  });

  // Seed Books
  console.log("📗 Seeding Premium Book Catalog...");
  const books = await Book.insertMany([
    { title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", genre: "Technology", publisher: "Prentice Hall", publishedYear: 2008, totalCopies: 5, availableCopies: 4, description: "A Handbook of Agile Software Craftsmanship." },
    { title: "Design Patterns", author: "Erich Gamma", isbn: "978-0201633610", genre: "Technology", publisher: "Addison-Wesley", publishedYear: 1994, totalCopies: 3, availableCopies: 3, description: "Elements of Reusable Object-Oriented Software." },
    { title: "The Pragmatic Programmer", author: "Andrew Hunt", isbn: "978-0201616224", genre: "Technology", publisher: "Addison-Wesley", publishedYear: 1999, totalCopies: 4, availableCopies: 4, description: "Your journey to mastery." },
    { title: "Dune", author: "Frank Herbert", isbn: "978-0441172719", genre: "Science Fiction", publisher: "Chilton Books", publishedYear: 1965, totalCopies: 6, availableCopies: 6, description: "A science fiction masterpiece." },
    { title: "1984", author: "George Orwell", isbn: "978-0451524935", genre: "Fiction", publisher: "Signet Classic", publishedYear: 1949, totalCopies: 10, availableCopies: 9, description: "A dystopian social science fiction novel." },
    { title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "978-0547928227", genre: "Fantasy", publisher: "Houghton Mifflin", publishedYear: 1937, totalCopies: 7, availableCopies: 7, description: "There and Back Again." },
    { title: "Atomic Habits", author: "James Clear", isbn: "978-0735211292", genre: "Self-Help", publisher: "Avery", publishedYear: 2018, totalCopies: 8, availableCopies: 8, description: "Tiny Changes, Remarkable Results." },
    { title: "Sapiens", author: "Yuval Noah Harari", isbn: "978-0062316097", genre: "History", publisher: "Harper", publishedYear: 2015, totalCopies: 5, availableCopies: 5, description: "A Brief History of Humankind." }
  ]);

  // Seed 1 active reservation (Alice reserving Clean Code)
  console.log("📅 Seeding Active Reservations...");
  const resExpiry = new Date();
  resExpiry.setDate(resExpiry.getDate() + 7);
  
  await Reservation.create({
    userId: member._id,
    bookId: books[0]._id, // Clean Code
    expiryDate: resExpiry,
    notes: "Please hold this until tomorrow morning!"
  });

  // Seed 1 active borrow (Alice borrowed 1984)
  console.log("💰 Seeding Borrows and calculating dues...");
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 10); // Borrowed 10 days ago
  const oldDue = new Date(oldDate);
  oldDue.setDate(oldDue.getDate() + 14);

  await Borrow.create({
    userId: member._id,
    bookId: books[4]._id, // 1984
    borrowDate: oldDate,
    dueDate: oldDue,
    status: "borrowed"
  });

  console.log("\n🚀 Seeding Complete! Safe to close connections.\n");

  await Promise.all([
    connUsers.close(), connBooks.close(),
    connReserv.close(), connBorr.close()
  ]);

  console.log("✅ Databases fully populated for assignment demo.");
  process.exit(0);
}

runSeeder().catch(err => {
  console.error("❌ Fatal Seeder Error:", err);
  process.exit(1);
});
