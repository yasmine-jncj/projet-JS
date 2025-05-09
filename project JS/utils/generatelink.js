const shortid = require('shortid');
const config = require('../config');

module.exports = {
    generateExamLink: (examId) => {
        const uniqueSlug = shortid.generate();
        return {
        slug: uniqueSlug,
        fullUrl: `${config.BASE_URL}/exam/${uniqueSlug}/${examId}`
        };
    },
    validateExamLink: (slug) => {
        return shortid.isValid(slug) && slug.length >= 7 && slug.length <= 14;
    }
};
