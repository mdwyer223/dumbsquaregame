
const directory = './games';
const fs = require('fs');

let files = {};

function buildFileName(gameId) {
  return directory + '/' + gameId + '.json';
}

files.read = function(gameId) {
  return JSON.parse(fs.readFileSync(buildFileName(gameId)));
}

files.write = function(gameId, gameContents) {
  fs.writeFileSync(
    buildFileName(gameId),
    JSON.stringify(gameContents)
  );

  return true;
}

module.exports = files;