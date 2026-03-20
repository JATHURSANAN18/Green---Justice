const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const Authority = require('./Authority')(sequelize);
const Report = require('./Report')(sequelize);
const Department = require('./Department')(sequelize);

// Associations
Department.hasMany(Authority, { foreignKey: 'departmentId' });
Authority.belongsTo(Department, { foreignKey: 'departmentId' });

module.exports = { sequelize, Authority, Report, Department };
