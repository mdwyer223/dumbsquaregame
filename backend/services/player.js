let utils = require('../utils/utils');

const playerIdLength = 20;
let player = {};

player.generateNewId = function() {
  console.log('Generating player ID...');
  return utils.generateId(playerIdLength);
};

module.exports = player;
