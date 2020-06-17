let utils = require('../utils/utils');
let adjs = require('../utils/adjectives');
let nouns = require('../utils/nouns');

const playerIdLength = 20;
let player = {};

player.generateNewId = function() {
  console.log('Generating player ID...');
  return utils.generateId(playerIdLength);
};

player.generateName = function() {
  console.log('Generating player name...');
  var randomAdj, randomNoun;
  randomAdj = adjs[Math.floor(Math.random() * adjs.length)];
  randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  while (randomAdj.length > 10) {
    randomAdj = adjs[Math.floor(Math.random() * adjs.length)];
  }

  while (randomNoun.length > 10) {
    randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  }

  return `${randomAdj} ${randomNoun}`;
};

module.exports = player;
