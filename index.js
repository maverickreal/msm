const express = require('express'), db = require('./db.js'), { auth } = require('./auth.js'), router = require('./routes.js'), app = express();

app.use(express.json()), db.init();
app.post('/signup', router.signUp);

app.post('/api/authenticate', router.signUp);

app.post('/signin', router.signIn);

app.post('/api/follow/:followeeId', auth, router.followUser);

app.post('/api/unfollow/:followeeId', auth, router.unfollowUser);

app.get('/api/user', auth, router.getUser);

app.post('/api/posts', auth, router.putPost);

app.delete('/api/posts/:postId', auth, router.deletePost);

app.post('/api/like/:postId', auth, router.likePost);

app.post('/api/unlike/:postId', auth, router.unlikePost);

app.post('/api/comment/:postId', auth, router.putComment);

app.get('/api/posts/:postId', auth, router.getPost);

app.get('/api/all_posts', auth, router.getUserPosts);

app.listen(process.env.PORT);