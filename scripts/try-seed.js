const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n--- Attempting Database Initialization ---');

try {
  // Load environment variables from database/.env
  const envPath = path.join(__dirname, '../database/.env');
  const envVars = { ...process.env };
  
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from ${envPath}...`);
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        envVars[key] = value;
      }
    });
  }

  // Check if database workspace exists and has seed script
  console.log('Checking database connection and seeding default user...');
  
  // We use stdio: 'pipe' to suppress output if it fails (because we expect it to fail if DB is down)
  // We manually print stdout if it succeeds, or log the error if we want debugging.
  const output = execSync('npm run seed --workspace=database', {
    stdio: 'pipe',
    env: envVars
  });
  
  console.log(output.toString());

  const adminEmail = envVars.ADMIN_EMAIL || 'admin@vantus.systems';
  console.log(`✅ Database initialized. Default Admin: ${adminEmail}`);
} catch (error) {
  // Check if it's likely a connection error (exit code 1 is generic, but usually DB down)
  console.warn(`\n⚠️  Database initialization skipped (DB likely not running).`);
  console.warn('\n=======================================================');
  console.warn('   🚀 NEXT STEPS TO START DEVELOPMENT');
  console.warn('=======================================================');
  console.warn('   1. Run the one-click setup script:');
  console.warn('      \x1b[32mnpm run setup\x1b[0m');
  console.warn('\n   This will start Docker, seed the DB, and get you ready.');
  console.warn('=======================================================\n');
}

console.log('------------------------------------------\n');
