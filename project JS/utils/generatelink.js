// utils/generateLink.js
const shortid = require('shortid');
module.exports = () => `https://exam.com/${shortid.generate()}`;