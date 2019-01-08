'use strict';
module.exports = (sequelize, DataTypes) => {
  const Data = sequelize.define('Data', {
    name: DataTypes.STRING,
    age:DataTypes.INTEGER,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    monthlyIncome: DataTypes.INTEGER,
    experienced:DataTypes.BOOLEAN
  }, {});
  Data.associate = function(models) {
    // associations can be defined here
  };
  return Data;
};