'use strict';
const fs = require('fs')

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
   let arr = fs.readFileSync('data.csv', 'utf8').trim().split('\n').map(x => x.split(','))
   let result = []
   for (let i = 1; i < arr.length; i++){
        let obj = {}
        obj.name = arr[i][0]
        obj.age = arr[i][1]
        obj.latitude = arr[i][2]
        obj.longitude = arr[i][3]
        obj.monthlyIncome = arr[i][4]
        obj.experienced = arr[i][5]
        obj.createdAt = new Date()
        obj.updatedAt = new Date()
        result.push(obj) 
   }
   console.log(result)
   return queryInterface.bulkInsert('Data', result, {})
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
