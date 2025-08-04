import { prisma } from '../lib/db.js';

async function testDbConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try to connect to the database
    await prisma.$connect();
    console.log('Database connection successful!');
    
    // Try a simple query
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in the database`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Error code:', error.code);
  }
}

testDbConnection();
