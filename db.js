const db = new (require('pg').Client)({
  user: process.env.DBUSER,
  host: process.env.DBHOST,
  database: process.env.DBDB,
  password: process.env.DBPASSWORD
});

const init = () => {
  db.connect(err => {
    if (err) {
      console.log('error : ' + err);
    }
    else {
      console.log("db connected");
    }
  });
}

const userExists = (email, password) => {
  let error, returnValue;
  db.query(`SELECT COUNT(ID) FROM USERS WHERE 'EMAIL'='${email}' || 'PASSWORD'='${password}';`, (err, res) => {
    if (err) {
      error = err;
    }
    else if (res.rows.empty()) {
      error = 'user not found';
    }
    else {
      returnValue = res.rows[0];
    }
  });
  return { error, user: returnValue };
}

const createUser = (id, name, email, password) => {
  let error, returnValue;
  db.query(`INSERT INTO USERS('ID', 'NAME', 'EMAIL', 'PASSWORD') VALUES('${id}', '${name}', '${email}', '${password}');`, (err, res) => {
    if (err) {
      error = err;
    }
    else if (res.rows.empty()) {
      err = 'user could not be created';
    }
    else {
      returnValue = res.rows[0];
    }
  });
  return { error, user: returnValue };
}

const followUser = (followerId, followeeId) => {
  let error;
  db.query(`SELECT COUNT(ID) FROM USERS WHERE ANY('FOLLOWS')='${followeeId}';`, err => error = err);
  if (!error) {
    db.query(`UPDATE TABLE USERS SET 'FOLLOWS'[CARDINALITY('FOLLOWS')]='${followeeId}' WHERE 'ID'='${followerId}' LIMIT 1;`, err => error = err);
  }
  return error;
}

const unFollowUser = (followerId, followeeId) => {
  let error;
  db.query(`UPDATE TABLE USERS SET 'FOLLOWS'=ARRAY_REMOVE('FOLLOWS', '${followeeId}') WHERE 'USERID'='${followerId}';`, err => error = err);
  return error;
}

const getUserProfile = (userId) => {
  let error, returnValue;
  db.query(`SELECT 'NAME', 'EMAIL', CARDINALITY('FOLLOWS') FOLLOWCOUNT, CARDINALITY('POSTS') POSTCOUNT FROM USERS WHERE 'ID'='${userId}' LIMIT 1;`, (err, res) => {
    if (err) {
      error = err;
    }
    else if (res.rows.empty()) {
      error = 'user not found to exist';
    }
    else {
      returnValue = { ...res.rows[0], id: userId };
    }
  });
  return { error, profile: returnValue };
}

const createPost = (id, title, desc, userId) => {
  let error, returnValue;
  db.query(`INSERT INTO POSTS('ID', 'TITLE', 'DESCRIPTION', 'USERID', 'CREATEDTIME') VALUES('${id}', '${title}', '${desc}', '${userId}', CURENT_TIMESTAMP());`, (err, res) => {
    if (err) {
      error = err;
    }
    else if (res.rows.empty()) {
      err = 'post could not be created';
    }
    else {
      returnValue = res.rows[0];
    }
  });
  return { error, post: returnValue };
}

const deletePost = (userId, postId) => {
  let error;
  db.query(`DELETE FROM POSTS WHERE 'ID'='${postId}' && 'USERID'='${userId}' LIMIT 1;`, err => error = err);
  if (error) {
    return error;
  }
  db.query(`UPDATE TABLE USERS SET 'POSTS'=ARRAY_REMOVE('POSTS', '${postId}');`, err => error = err);
  if (error) {
    return error;
  }
  db.query(`DELETE FROM COMMENTS WHERE 'POSTID'='${postId}';`, err => error = err);
  return error;
}

const likePost = (userId, postId) => {
  let error;
  db.query(`UPDATE TABLE POSTS SET 'LIKES'=ARRAY_APPEND('LIKES', '${userId}') WHERE 'ID'='${postId}';`, err => error = err);
  return error;
}

const unLikePost = (userId, postId) => {
  let error;
  db.query(`UPDATE TABLE POSTS SET 'LIKES'=ARRAY_REMOVE('LIKES', '${userId}') WHERE 'ID'='${postId}';`, err => error = err);
  return error;
}

const createComment = (id, userId, postId, comment) => {
  let error, returnValue;
  db.query(`INSERT INTO COMMENTS('ID', 'COMMENT', 'USERID', 'POSTID') VALUES('${id}', '${comment}', '${userId}', '${postId}');`, (err, res) => {
    if (err) {
      error = err;
    }
    else if (res.rows.empty()) {
      error = 'comment could not be created';
    }
    else {
      returnValue = res.rows[0];
    }
  });
  if (!error) {
    db.query(`UPDATE TABLE POSTS SET 'COMMENTS'=ARRAY_APPEND('COMMENTS', '${returnValue.ID}') WHERE 'ID'='${postId}';`, err => error = err);
  }
  return { error, commentId: returnValue };
}

const getPost = postId => {
  let error, returnValue;
  db.query(`SELECT TITLE, DESCRIPTION FROM POSTS WHERE 'ID'='${postId}' LIMIT 1;`, (err, res) => {
    if (err) {
      error = err;
    }
    else if (res.rows.empty()) {
      error = 'post not found';
    }
    else {
      returnValue = { id: postId, ...res.rows[0] };
    }
  });
  return { error, post: returnValue };
}

const getPostsOfUser = userId => {
  let error, returnValue;
  db.query(`SELECT * FROM POSTS WHERE 'ID' IN (
    SELECT POSTS FROM USERS WHERE 'ID'='${userId}' LIMIT 1;
    );`, (err, res) => {
    if (err) {
      error = err;
    }
    else if (res.rows.empty()) {
      error = 'posts not found';
    }
    else {
      returnValue = res.rows;
    }
  });
  return { error, posts: returnValue };
}

module.exports = {
  init, userExists, createUser, followUser, unFollowUser, getUserProfile, createPost, deletePost, likePost, unLikePost, createComment, getPost, getPostsOfUser
}