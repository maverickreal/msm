const db = require('./db.js'), { v4: uuid } = require('uuid'), { sign } = require('jsonwebtoken');

const signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!(firstName && lastName && email && password)) {
            return res.status(400).send({ status: 'error', message: 'signup information not provided' });
        }
        const emailPattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailPattern.test(email)) {
            return res.status(400).send({ status: 'error', message: 'invalid email address provided' });
        }
        if ((await db.verifyCredentials(email, password)) === true) {
            return res.status(400).send({ status: 'error', message: 'credentials already in use' });
        }
        const { error, user } = await db.createUser(uuid(), firstName + ' ' + lastName, email, password);
        if (error) {
            console.error(error);
            return res.status(500).send({ status: 'error', message: error });
        }
        const jwtToken = sign(user, process.env.JWTSECRETKEY);
        user.token = jwtToken;
        res.status(200).send({ status: 'ok', message: user });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ status: 'error', message: 'login information not provided' });
        }
        const { error, user } = await db.userExists(email, password);
        if (error) {
            console.error(error);
            return res.status(500).send({ status: 'error', message: error });
        }
        const jwtToken = sign(user, process.env.JWTSECRETKEY);
        user.token = jwtToken;
        res.status(200).send({ status: 'ok', message: user });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const followUser = async (req, res) => {
    try {
        const followerId = req.user.id, followeeId = req.params['followeeId'];
        if (followerId == followeeId) {
            return res.status(400).send({ status: 'error', message: 'cannot follow self' });
        }
        const error = await db.followUser(followerId, followeeId);
        if (error) {
            console.error(error);
            res.status(500).send({ status: 'error', message: error });
        }
        else {
            res.status(200).send({ status: 'ok' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const error = await db.unFollowUser(req.user.id, req.params['followeeId']);
        if (error) {
            console.error(error);
            res.status(500).send({ status: 'error', message: error });
        }
        else {
            res.status(200).send({ status: 'ok' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const getUser = async (req, res) => {
    try {
        const profile = await db.getUserProfile(req.user.id);
        res.status(200).send({ status: 'ok', message: profile });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const putPost = async (req, res) => {
    try {
        if (!req.body.title || !req.body.description) {
            res.status(400).send({ status: 'error', message: 'post information not provided' });
        }
        let { post, error } = await db.createPost(uuid(), req.user.id, req.body.title, req.body.description);
        if (error) {
            console.error(error);
            res.status(500).send({ status: 'error', message: error });
        }
        else {
            res.status(200).send({ status: 'ok', message: post });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const deletePost = async (req, res) => {
    try {
        let error = await db.deletePost(req.user.id, req.params['postId']);
        if (error) {
            console.error(error);
            res.status(500).send({ status: 'error', message: error });
        }
        else {
            res.status(200).send({ status: 'ok' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const likePost = async (req, res) => {
    try {
        let error = await db.likePost(req.user.id, req.params['postId']);
        if (error) {
            console.error(error);
            res.status(500).send({ status: 'error', message: error });
        }
        else {
            res.status(200).send({ status: 'ok' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const unlikePost = async (req, res) => {
    try {
        let error = await db.unLikePost(req.user.id, req.params['postId']);
        if (error) {
            console.error(error);
            res.status(500).send({ status: 'error', message: error });
        }
        else {
            res.status(200).send({ status: 'ok' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const putComment = async (req, res) => {
    try {
        let { error, commentId } = await db.createComment(uuid(), req.user.id, req.params['postId'], req.body.comment);
        if (error) {
            console.error(error);
            res.status(500).send({ status: 'error', message: error });
        }
        else {
            res.status(200).send({ status: 'ok', message: commentId });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const getPost = async (req, res) => {
    try {
        let { error, post } = await db.getPost(req.params['postId']);
        if (error) {
            console.error(error);
            res.status(500).send({ status: 'error', message: error });
        }
        else {
            res.status(200).send({ status: 'ok', message: post });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const getUserPosts = async (req, res) => {
    try {
        let { error, posts } = await db.getPostsOfUser(req.user.id);
        if (error) {
            console.error(error);
            res.status(500).send({ status: 'error', message: error });
        }
        else {
            res.status(200).send({ status: 'ok', message: posts });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

module.exports = { signIn, signUp, followUser, unfollowUser, getUser, putPost, deletePost, likePost, unlikePost, putComment, getPost, getUserPosts };