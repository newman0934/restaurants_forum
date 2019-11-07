'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Restaurants","viewCounts", {
      type: Sequelize.INTEGER
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn("Restaurants","viewCounts")
  }
};
