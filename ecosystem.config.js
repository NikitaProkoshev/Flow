module.exports = {
  apps: [{
    name: 'flow-app',
    script: 'app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/flow-error.log',
    out_file: '/var/log/pm2/flow-out.log',
    log_file: '/var/log/pm2/flow-combined.log',
    time: true
  }]
};
