// development mode
// pm2 start ecosystem.config.cjs --only express-ejs/development

// production mode
// pm2 start ecosystem.config.cjs --only express-ejs/production

module.exports = {
  apps : [
    {
      // development
      name   : "express-ejs/development",
      script : "./bin/www",
      exec_mode: "fork",
      instances: 1,
      merge_logs: true,
      time   : false,
      watch  : true,
      ignore_watch : [".*", "node_modules", "logs", "sessions", "public/uploads", "storage/uploads"],
      autorestart: true,
      max_memory_restart : "300M",
      args: ["development"],
      env: {
        TZ: "Asia/Seoul",
        NODE_ENV: "development",
        NODE_NO_WARNINGS: "0", // display warning
        PORT: 3009,
        HOST: "0.0.0.0"
      },
      wait_ready: true,
      kill_timeout: 5000,
      listen_timeout: 10000,
      restart_delay: 5000
    },
    {
      // production
      name   : "express-ejs/production",
      script : "./bin/www",
      exec_mode: "cluster",
      instances: 4,
      merge_logs: true,
      time   : false,
      watch  : false,
      ignore_watch : [".*", "node_modules", "logs", "sessions", "public/uploads", "storage/uploads"],
      autorestart: true,
      max_memory_restart : "300M",
      args: ["production"],
      env: {
        TZ: "Asia/Seoul",
        NODE_ENV: "production",
        NODE_NO_WARNINGS: "1",
        PORT: 3009,
        HOST: "0.0.0.0"
      },
      wait_ready: true,
      kill_timeout: 5000,
      listen_timeout: 10000,
      restart_delay: 5000
    }
  ]
};