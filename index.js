const app = require('express')(), db = require('./db.js'), jwt = require('jsonwebtoken');

db.init();

app.post('/api/authenticate', (req, res) => {
    if (db.verifyUser(userid)) {
        return res.send({
            status: 'error', message: 'already authenticated'
        });
    }
    db.createUser(req.email, req.password);
    const data = {
        status: 'ok', email: req.email
    }
    const token = jwt.sign(data, process.env.JWTSECRETKEY);
    res.send(token);
});

app.post('/api/follow/:followeeId', (req, res) => {
    const jwtToken = req.header(process.env.JWTTOKENKEY), verified = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    if (!verified) {
        return res.send({ status: 'error', message: 'verification failed' });
    }
    const error = db.followUser(req.headers(userid), req.params['followeeId']);
    if (error) {
        res.send({ status: 'error', message: error });
    }
    else {
        res.send({ status: 'ok' });
    }
});

app.post('/api/unfollow/:followeeId', (req, res) => {
    const jwtToken = req.header(process.env.JWTTOKENKEY), verified = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    if (!verified) {
        return res.send({ status: 'error', message: 'verification failed' });
    }
    db.unFollowUser(req.headers(userid), req.params['followeeId']);
    res.send({ status: 'ok' });
});

app.get('/api/user', (req, res) => {
    const jwtToken = req.header(process.env.JWTTOKENKEY), verified = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    if (!verified) {
        return res.send({ status: 'error', message: 'verification failed' });
    }
    const [profile, error] = db.getUserProfile(req.headers(userid));
    if (error) {
        res.send({ status: 'error', message: error });
    }
    else {
        res.send({ status: 'ok', profile });
    }
});

app.post('/api/posts', (req, res) => {
});

app.delete('/api/posts/:id', (req, res) => {
});

app.post('/api/like/:id', (req, res) => {
});

app.post('/api/unlike/:id', (req, res) => {
});

app.post('/api/comment/:id', (req, res) => {
});

app.get('/api/post/:id', (req, res) => {
});

app.get('/api/all_posts', (req, res) => {
});

app.listen(process.env.PORT);