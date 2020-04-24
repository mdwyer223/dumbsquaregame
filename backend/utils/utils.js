let utils = {};

utils.generateId = function generateId(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

utils.sleep = (miliseconds) => {
  return new Promise(resolve => setTimeout(resolve, miliseconds));
};

module.exports = utils;