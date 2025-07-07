// development mode
// pm2 start ecosystem.config.js --only express-ejs/development

// production mode
// pm2 start ecosystem.config.js --only express-ejs/production

module.exports = {
  apps : [
    {
      // development
      name   : "express-ejs/development",
      script : "./bin/www",
      time   : false,
      watch  : true,
      ignore_watch : [".*", "node_modules", "logs", "sessions"],
      autorestart: true,
      max_memory_restart : "2G",
      args: ["development"],
      env: {
        NODE_ENV: "development",
        NODE_NO_WARNINGS: "0", // display warning
        PORT: 3000,
        HOST: "0.0.0.0"
      },
    },
    {
      // production
      name   : "express-ejs/production",
      script : "./bin/www",
      time   : false,
      watch  : false,
      ignore_watch : [".*", "node_modules", "logs", "sessions"],
      autorestart: true,
      max_memory_restart : "2G",
      args: ["production"],
      env: {
        NODE_ENV: "production",
        NODE_NO_WARNINGS: "1",
        PORT: 3000,
        HOST: "0.0.0.0"
      },
    }
  ]
};