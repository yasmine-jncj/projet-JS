// In exam creation route
const uniqueId = require('shortid').generate();
const uniqueLink = `https://yourapp.com/exam/${uniqueId}`;
await Exam.create({ ... uniqueLink });