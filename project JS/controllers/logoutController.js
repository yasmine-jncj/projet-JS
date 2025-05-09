const { addToBlacklist } = require('../utils/tokenBlacklist');

exports.logout = async (req, res) => {
    try {
        await addToBlacklist(req.user.token);
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Logout failed' });
    }
};
