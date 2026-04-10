const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mssql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      options: {
        useUTC: false,
        dateFirst: 1,
        trustServerCertificate: true,
        encrypt: false,
      },
      authentication: {
        type: 'default',
      },
    },
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('✅ SQL Server connected successfully');
  })
  .catch((err) => {
    console.error('❌ Unable to connect to SQL Server:', err.message);
  });

module.exports = sequelize;