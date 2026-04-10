const app = require('./src/app');
const sequelize = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Start server (no auto-sync, use manual SQL schema)
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║      QuickBite API Server Started      ║
╚════════════════════════════════════════╝

📌 Server: http://localhost:${PORT}
📌 Environment: ${process.env.NODE_ENV || 'development'}
📌 Database: ${process.env.DB_NAME}
📌 Time: ${new Date().toLocaleString()}
  `);
});

module.exports = server;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    sequelize.close();
  });
});