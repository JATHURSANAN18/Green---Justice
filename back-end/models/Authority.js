const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Authority = sequelize.define('Authority', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'reviewer'
    }
  });
  return Authority;
};
