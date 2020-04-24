let utils = require('../utils/utils');

const playerIdLength = 20;
let player = {};

player.generateNewId = function() {
  return utils.generateId(playerIdLength);
};

module.exports = player;
