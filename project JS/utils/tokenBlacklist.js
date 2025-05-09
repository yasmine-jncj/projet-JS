const revokedTokens = new Set();

async function isTokenBlacklisted(token) {
    return revokedTokens.has(token);
}

async function addToBlacklist(token) {
    revokedTokens.add(token);
}

module.exports = { isTokenBlacklisted, addToBlacklist };
