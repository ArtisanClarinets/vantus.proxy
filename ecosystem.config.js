module.exports = {
  apps: [
    {
      name: 'config-renderer',
      cwd: './services/config-renderer',
      script: 'dist/index.js',
      env_file: './services/config-renderer/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'control-plane',
      cwd: './apps/control-plane',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env_file: './apps/control-plane/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
