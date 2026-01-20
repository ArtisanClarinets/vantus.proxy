const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question, defaultValue) => {
  return new Promise((resolve) => {
    rl.question(`${question} (${defaultValue}): `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
};

const generateSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

const main = async () => {
  console.log('\n--- Vantus Proxy Setup ---\n');
  console.log('Please provide the following environment variables. Press Enter to use the default value.\n');

  const mysqlRootPassword = await ask('MYSQL_ROOT_PASSWORD', 'password123');
  const mysqlDatabase = await ask('MYSQL_DATABASE', 'vantus');

  // Default DATABASE_URL assumes localhost for local development/build
  const defaultDatabaseUrl = `mysql://root:${mysqlRootPassword}@localhost:3306/${mysqlDatabase}`;
  const databaseUrl = await ask('DATABASE_URL', defaultDatabaseUrl);

  const betterAuthSecret = await ask('BETTER_AUTH_SECRET', generateSecret());
  const betterAuthUrl = await ask('BETTER_AUTH_URL', 'http://localhost:3000');
  const redisUrl = await ask('REDIS_URL', 'redis://localhost:6379');
  const configRendererSecret = await ask('CONFIG_RENDERER_SECRET', generateSecret());

  const envContent = [
    `MYSQL_ROOT_PASSWORD="${mysqlRootPassword}"`,
    `MYSQL_DATABASE="${mysqlDatabase}"`,
    `DATABASE_URL="${databaseUrl}"`,
    `BETTER_AUTH_SECRET="${betterAuthSecret}"`,
    `BETTER_AUTH_URL="${betterAuthUrl}"`,
    `REDIS_URL="${redisUrl}"`,
    `CONFIG_RENDERER_SECRET="${configRendererSecret}"`,
    `NEXT_PUBLIC_APP_URL="${betterAuthUrl}"`
  ].join('\n');

  // Docker environment needs internal hostnames
  const dockerEnvContent = [
    `MYSQL_ROOT_PASSWORD=${mysqlRootPassword}`,
    `MYSQL_DATABASE=${mysqlDatabase}`,
    `DATABASE_URL=mysql://root:${mysqlRootPassword}@mariadb:3306/${mysqlDatabase}`,
    `BETTER_AUTH_SECRET=${betterAuthSecret}`,
    `BETTER_AUTH_URL=${betterAuthUrl}`,
    `REDIS_URL=redis://redis:6379`,
    `CONFIG_RENDERER_SECRET=${configRendererSecret}`
  ].join('\n');

  // Paths to write .env files
  const paths = [
    path.join(__dirname, '../apps/control-plane/.env'),
    path.join(__dirname, '../services/config-renderer/.env'),
    path.join(__dirname, '../database/.env'),
  ];

  const dockerPath = path.join(__dirname, '../infra/docker/.env');

  console.log('\nWriting .env files...');

  paths.forEach(p => {
    try {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(p, envContent);
      console.log(`Updated ${p}`);
    } catch (e) {
      console.error(`Failed to write to ${p}:`, e.message);
    }
  });

  // Write docker specific env
  try {
     const dir = path.dirname(dockerPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dockerPath, dockerEnvContent);
      console.log(`Updated ${dockerPath}`);
  } catch (e) {
      console.error(`Failed to write to ${dockerPath}:`, e.message);
  }

  console.log('\nSetup complete!\n');
  rl.close();
};

main();
