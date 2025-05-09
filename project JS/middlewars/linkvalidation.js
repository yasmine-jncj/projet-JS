const { validateExamLink } = require('../utils/generateExamLink');

exports.validateExamLink = (req, res, next) => {
    const { slug } = req.params;
    if (!validateExamLink(slug)) {
        return res.status(400).json({ error: 'Invalid exam link' });
    }
    next();
};
