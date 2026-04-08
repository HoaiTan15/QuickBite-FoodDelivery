const app = require('./src/app');
const sequelize = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Sync database and start server
sequelize.sync({ force: true }).then(() => {
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

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      sequelize.close();
    });
  });
}).catch(err => {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    sequelize.close();
  });
});