const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Report = sequelize.define('Report', {
    violationType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lat: {
      type: DataTypes.DOUBLE
    },
    lng: {
      type: DataTypes.DOUBLE
    },
    photoVideoUrl: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    status: {
      type: DataTypes.ENUM('not viewed', 'in progress', 'resolved'),
      defaultValue: 'not viewed'
    },
    severityLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    reportCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  });
  return Report;
};
