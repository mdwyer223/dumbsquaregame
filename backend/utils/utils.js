let utils = {};

utils.generateId = function generateId(length) {
  let result = '';
  let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let numbers = '0123456789';
  for (let i = 0; i < length; i++) {
      if (i % 2 == 0) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
      } else {
        result += numbers.charAt(Math.floor(Math.random() * numbers.length));
      }
  }
  return result;
};

utils.sleep = (miliseconds) => {
  return new Promise(resolve => setTimeout(resolve, miliseconds));
};

module.exports = utils;