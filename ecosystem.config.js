module.exports = {
  apps: [
    {
      name: 'magellania-api',
      script: './api-server/working-server.js',
      cwd: './api-server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'magellania-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5173,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5173,
      },
    },
  ],
}
