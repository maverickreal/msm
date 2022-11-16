const db = require('./db.js'), { v4: uuid } = require('uuid'), jwt = require('jsonwebtoken');

const signUp = (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!(firstName && lastName && email && password)) {
        return res.send({ status: 'error', message: 'signup information not provided' });
    }
    let { error, user } = db.userExists(email, password);
    if (error || user) {
        return res.send({ status: 'error', message: 'credentials already in use' });
    }
    const userObj = db.createUser(uuid(), firstName + ' ' + password, email, password);
    error = userObj.error, user = userObj.user;
    if (error || !user) {
        res.send({ status: 'error', message: error });
    }
    else {
        const jwtToken = jwt.sign(user, process.env.JWTSECRETKEY);
        user.token = jwtToken;
        res.send({ status: 'ok', message: user });
    }
};

const signIn = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.send({ status: 'error', message: 'login information not provided' });
    }
    const { error, user } = db.userExists(email, password);
    if (error || !user) {
        res.send({ status: 'error', message: error });
    }
    else {
        const jwtToken = jwt.sign(user, process.env.JWTSECRETKEY);
        user.token = jwtToken;
        res.send({ status: 'ok', message: user });
    }
};

const followUser = (req, res) => {
    let returnValue, error = db.followUser(req.user.id, req.params['followeeId']);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok' };
    }
    res.send(returnValue);
};

const unfollowUser = (req, res) => {
    let returnValue, error = db.unFollowUser(req.user.id, req.params['followeeId']);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok' };
    }
    res.send(returnValue);
};

const getUser = (req, res) => {
    let returnValue, { error, profile } = db.getUserProfile(req.user.id);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok', message: profile };
    }
    res.send(returnValue);
};

const putPost = (req, res) => {
    let returnValue, { post, error } = db.createPost(uuid(), req.user.id, req.body.title, req.body.description);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok', message: post };
    }
    res.send(returnValue);
};

const deletePost = (req, res) => {
    let returnValue, error = db.deletePost(req.user.id, req.params['postId']);
    if (error) {
        returnValue = { status: 'error', message: 'error' };
    }
    else {
        returnValue = { status: 'ok' };
    }
    res.send(returnValue);
};

const likePost = (req, res) => {
    let returnValue, error = db.likePost(req.user.id, req.params['postId']);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok' };
    }
    res.send(returnValue);
};

const unlikePost = (req, res) => {
    let returnValue, error = db.unLikePost(req.user.id, req.params['postId']);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok' };
    }
    res.send(returnValue);
};

const putComment = (req, res) => {
    let returnValue, { error, commentId } = db.createComment(uuid(), req.user.id, req.params['postId'], req.body.comment);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok', message: commentId };
    }
    res.send(returnValue);
};

const getPost = (req, res) => {
    let returnValue, { error, post } = db.getPost(req.params['postId']);
    if (error) {
        returnValue = { status: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok', message: post };
    }
    res.send(returnValue);
};

const getUserPosts = (req, res) => {
    let returnValue, { error, posts } = db.getPostsOfUser(req.user.id);
    if (error) {
        returnValue = { statsu: 'error', message: error };
    }
    else {
        returnValue = { status: 'ok', message: posts };
    }
    res.send(returnValue);
};

module.exports = { signIn, signUp, followUser, unfollowUser, getUser, putPost, deletePost, likePost, unlikePost, putComment, getPost, getUserPosts };