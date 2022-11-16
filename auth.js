const jwt = require('jsonwebtoken');

const auth = (req, res) => {
    const jwtToken = req.body.token || req.query.token || req.headers['x-access-token'];

    if (!jwtToken) {
        res.send({ status: 'error', message: 'authentication failed' });
    }
    else {
        req.user = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    }
};

module.exports = { auth };