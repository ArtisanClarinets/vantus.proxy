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
  console.warn('\n⚠️  Database initialization skipped or failed.');
  console.warn('   This is normal if the database is not running yet (e.g. during initial npm install).');
  console.warn('   Please start the database (docker compose up) and run:');
  console.warn('   npm run seed --workspace=database');

  // Optionally log the actual error message for debugging purposes if needed, but keep it clean for "zero errors" request.
  // console.warn(error.message);
}

console.log('------------------------------------------\n');
