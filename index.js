const app = require('express')(), db = require('./db.js'), jwt = require('jsonwebtoken');

db.init();

app.post('/api/authenticate', (req, res) => {
    let [error, verified] = db.verifyUser(req.headers.userid);
    if (error || !verified) {
        returnValue = { status: 'error', message: 'already authenticated' };
        const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
        return res.send(token);
    }
    const { user } = db.createUser(req.email, req.password);
    let returnValue;
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok', message: user };
    }
    const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
    res.send(token);
});

app.post('/api/follow/:followeeId', (req, res) => {
    const jwtToken = req.header(process.env.JWTTOKENKEY), verified = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    if (!verified) {
        returnValue = { status: 'error', message: 'verification failed' };
        const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
        return res.send(token);
    }
    let returnValue, error = db.followUser(req.headers.userid, req.params['followeeId']);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok' };
    }
    const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
    res.send(token);
});

app.post('/api/unfollow/:followeeId', (req, res) => {
    const jwtToken = req.header(process.env.JWTTOKENKEY), verified = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    if (!verified) {
        returnValue = { status: 'error', message: 'verification failed' };
        const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
        return res.send(token);
    }
    let returnValue, error = db.unFollowUser(req.headers.userid, req.params['followeeId']);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok' };
    }
    const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
    res.send(token);
});

app.get('/api/user', (req, res) => {
    const jwtToken = req.header(process.env.JWTTOKENKEY), verified = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    if (!verified) {
        returnValue = { status: 'error', message: 'verification failed' };
        const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
        return res.send(token);
    }
    let returnValue, [error, profile] = db.getUserProfile(req.headers.userid);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok', message: profile };
    }
    const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
    res.send(token);
});

app.post('/api/posts', (req, res) => {
    const jwtToken = req.header(process.env.JWTTOKENKEY), verified = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    if (!verified) {
        returnValue = { status: 'error', message: 'verification failed' };
        const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
        return res.send(token);
    }
    let returnValue, [post, error] = db.createPost(req.headers.userid, req.headers.title, req.headers.description);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok', message: post };
    }
    const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
    res.send(token);
});

app.delete('/api/posts/:postId', (req, res) => {
    const jwtToken = req.header(process.env.JWTTOKENKEY), verified = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    if (!verified) {
        returnValue = { status: 'error', message: 'verification failed' };
        const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
        return res.send(token);
    }
    let returnValue, error = db.deletePost(req.headers.userid, req.params['postId']);
    if (error) {
        returnValue = { status: 'error', message: 'error' };
    }
    else {
        returnValue = { status: 'ok' };
    }
    const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
    res.send(token);
});

app.post('/api/like/:postId', (req, res) => {
    const jwtToken = req.header(process.env.JWTTOKENKEY), verified = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    if (!verified) {
        returnValue = { status: 'error', message: 'verification failed' };
        const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
        return res.send(token);
    }
    let returnValue, error = db.likePost(req.headers.userid, req.params['postId']);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok' };
    }
    const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
    res.send(token);
});

app.post('/api/unlike/:postId', (req, res) => {
    const jwtToken = req.header(process.env.JWTTOKENKEY), verified = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    if (!verified) {
        returnValue = { status: 'error', message: 'verification failed' };
        const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
        return res.send(token);
    }
    let returnValue, error = db.unLikePost(req.headers.userid, req.params['postId']);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok' };
    }
    const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
    res.send(token);
});

app.post('/api/comment/:postId', (req, res) => {
    const jwtToken = req.header(process.env.JWTTOKENKEY), verified = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    if (!verified) {
        returnValue = { status: 'error', message: 'verification failed' };
        const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
        return res.send(token);
    }
    let returnValue, [error, commentId] = db.createComment(req.headers.userid, req.params['postId'], req.headers.comment);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok', message: commentId };
    }
    const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
    res.send(token);
});

app.get('/api/post/:postId', (req, res) => {
    const jwtToken = req.header(process.env.JWTTOKENKEY), verified = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    if (!verified) {
        returnValue = { status: 'error', message: 'verification failed' };
        const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
        return res.send(token);
    }
    let returnValue, [error, post] = db.getPost(req.params['postId']);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok', message: post };
    }
    const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
    res.send(token);
});

app.get('/api/all_posts', (req, res) => {
    const jwtToken = req.header(process.env.JWTTOKENKEY), verified = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    if (!verified) {
        returnValue = { status: 'error', message: 'verification failed' };
        const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
        return res.send(token);
    }
    let returnValue, [error, posts] = db.getPostsOfUser(req.headers.userid);
    if (error) {
        returnValue = { statsu: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok', message: posts };
    }
    const token = jwt.sign(returnValue, process.env.JWTSECRETKEY);
    res.send(token);
});

app.listen(process.env.PORT);