const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  const mongoServer = await MongoMemoryServer.create();
  console.log('TEST_DB_URI=' + mongoServer.getUri());
  // Keep process alive so student can read uri or export it
  // In CI you'd use the URI programmatically.
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
