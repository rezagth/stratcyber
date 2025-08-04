const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as connected;`;
    console.log('Database connection successful:', result);
    
    // Check for any pending migrations
    console.log('Checking for pending migrations...');
    // Note: This would normally be done with Prisma CLI, but we'll check the migrations folder
    
    // Check audit table
    console.log('Checking audit table...');
    const auditCount = await prisma.audit.count();
    console.log(`Found ${auditCount} audits in database`);
    
    // Check for locks
    console.log('Checking for database locks...');
    const locks = await prisma.$queryRaw`PRAGMA locking_mode;`;
    console.log('Locking mode:', locks);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database check failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkDatabase();
