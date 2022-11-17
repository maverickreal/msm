const db = new (require('pg').Client)({
  user: process.env.DBUSER,
  host: process.env.DBHOST,
  database: process.env.DBDB,
  password: process.env.DBPASSWORD,
  port: process.env.DBPORT,
  ssl: true
});

const init = () => {
  db.connect();
}

const verifyCredentials = async (email, password) => {
  let returnValue = false;
  try {
    const res = await db.query(`SELECT 1 FROM USERS WHERE EMAIL='${email}' OR PASSWORD='${password}' LIMIT 1;`);
    if (res.rows.length > 0) {
      returnValue = true;
    }
  }
  catch (error) {
    console.log(error);
  }
  return returnValue;
}

const userExists = async (email, password) => {
  let returnValue = {};
  try {
    const res = await db.query(`SELECT ID, NAME, EMAIL FROM USERS WHERE EMAIL='${email}' AND PASSWORD='${password}' LIMIT 1;`);
    if (res.rows.length > 0) {
      returnValue.user = res.rows[0];
    }
    else {
      returnValue.error = 'user could not be found';
    }
  }
  catch (error) {
    returnValue.error = error;
  }
  return returnValue;
}

const createUser = async (id, name, email, password) => {
  let returnValue = {};
  try {
    await db.query(`INSERT INTO USERS(ID, NAME, EMAIL, PASSWORD) VALUES('${id}', '${name}', '${email}', '${password}');`);
    returnValue.user = { id, name, email };
  }
  catch (error) {
    returnValue = { error };
  }
  return returnValue;
}

const followUser = async (followerId, followeeId) => {
  try {
    let res = await db.query(`SELECT 1 FROM USERS WHERE ID='${followeeId}' LIMIT 1;`);
    if (res.rows.length == 0) {
      return 'followee could not be found';
    }
    res = await db.query(`SELECT 1 FROM USERS WHERE ID='${followerId}' and '{${followeeId}}' IN (FOLLOWS) LIMIT 1;`);
    if (res.rows.length > 0) {
      return 'already following';
    }
    await db.query(`UPDATE USERS SET FOLLOWS=ARRAY_APPEND(FOLLOWS, '${followeeId}') WHERE ID='${followerId}';`);
  }
  catch (error) {
    return error;
  }
}

const unFollowUser = async (followerId, followeeId) => {
  try {
    let res = await db.query(`SELECT 1 FROM USERS WHERE ID='${followerId}'  AND '{${followeeId}}' IN ( FOLLOWS ) LIMIT 1;`);
    if (res.rows.length == 0) {
      return 'followee could not be found';
    }
    await db.query(`UPDATE USERS SET FOLLOWS=ARRAY_REMOVE(FOLLOWS, '${followeeId}') WHERE ID='${followerId}';`);
  }
  catch (error) {
    return error;
  }
};

const getUserProfile = async (userId) => {
  let returnValue = {};
  try {
    const res = await db.query(`SELECT 'NAME', 'EMAIL', CARDINALITY('FOLLOWS') FOLLOWCOUNT, CARDINALITY('POSTS') POSTCOUNT FROM USERS WHERE 'ID'='${userId}' LIMIT 1;`);
    if (!res.rows.length) {
      returnValue.error = 'user not found to exist';
    }
    else {
      returnValue.profile = { ...res.rows[0], id: userId };
    }
  }
  catch (error) {
    returnValue = { error };
  }
  return returnValue;
}

const createPost = async (postId, userId, title, desc) => {
  let returnValue = {};
  try {
    await db.query(`INSERT INTO POSTS(ID, TITLE, DESCRIPTION, USERID, CREATEDTIME) VALUES('${postId}', '${title}', '${desc}', '${userId}', NOW());`);
    returnValue.post = { postId, title, desc };
    await db.query(`UPDATE USERS SET POSTS=ARRAY_APPEND(POSTS, '${postId}') WHERE ID='${userId}';`);
  }
  catch (error) {
    returnValue = { error };
  }
  return returnValue;
}

const deletePost = async (userId, postId) => {
  try {
    const res = await db.query(`SELECT 1 FROM USERS WHERE '{${postId}}' = ANY( POSTS ) LIMIT 1;`);
    if (!res.rows || res.rows.length == 0) {
      return 'post could not be found';
    }
    await db.query(`DELETE FROM POSTS WHERE ID='${postId}' AND USERID='${userId}';`);
    await db.query(`UPDATE USERS SET POSTS=ARRAY_REMOVE(POSTS, '${postId}');`);
    await db.query(`DELETE FROM COMMENTS WHERE POSTID='${postId}';`);
  }
  catch (error) {
    return error;
  }
}

const likePost = async (userId, postId) => {
  try {
    let res = await db.query(`SELECT 1 FROM POSTS WHERE ID='${postId}' LIMIT 1;`);
    if (res.rows.length == 0) {
      return 'post could not be found';
    }
    res = await db.query(`SELECT 1 FROM POSTS WHERE ID='${postId}' AND '{${userId}}' IN ( LIKES ) LIMIT 1;`);
    if (res.rows.length > 0) {
      return 'user has already liked the post';
    }
    await db.query(`UPDATE POSTS SET LIKES=ARRAY_APPEND(LIKES, '${userId}') WHERE ID='${postId}';`);
  }
  catch (error) {
    return error;
  }
}

const unLikePost = async (userId, postId) => {
  try {
    const res = await db.query(`SELECT 1 FROM POSTS WHERE ID='${postId}' AND '{${userId}}' IN ( LIKES ) LIMIT 1;`);
    if (res.rows.length == 0) {
      return 'like could not be found';
    }
    await db.query(`UPDATE POSTS SET LIKES=ARRAY_REMOVE(LIKES, '${userId}') WHERE ID='${postId}';`);
  }
  catch (error) {
    return error;
  }
}

const createComment = async (commentId, userId, postId, comment) => {
  let returnValue = {};
  try {
    const res = await db.query(`SELECT 1 FROM POSTS WHERE ID='${postId}' LIMIT 1;`);
    if (res.rows.length == 0) {
      returnValue.error = 'post could not be found';
    }
    else {
      await db.query(`INSERT INTO COMMENTS(ID, COMMENT, USERID, POSTID) VALUES('${commentId}', '${comment}', '${userId}', '${postId}');`);
      returnValue = { commentId };
      await db.query(`UPDATE POSTS SET COMMENTS=ARRAY_APPEND(COMMENTS, '${commentId}') WHERE ID='${postId}';`);
    }
  }
  catch (error) {
    returnValue = { error };
  }
  return returnValue;
}

const getPost = async postId => {
  let returnValue = {};
  try {
    const res = await db.query(`SELECT TITLE, DESCRIPTION FROM POSTS WHERE ID='${postId}' LIMIT 1;`);
    if (!res.rows.length) {
      returnValue.error = 'post not found';
    }
    else {
      returnValue.post = { id: postId, ...res.rows[0] };
    }
  }
  catch (error) {
    returnValue = { error };
  }
  return returnValue;
}

const getPostsOfUser = async userId => {
  let returnValue = {};
  try {
    let res = await db.query(`SELECT 1 FROM USERS WHERE ID='${userId}' LIMIT 1;`);
    if (res.rows.length == 0) {
      returnValue.error = 'user could not be found';
    }
    else {
      const res = await db.query(`SELECT * FROM POSTS WHERE USERID='${userId}';`);
      returnValue.posts = res.rows;
      for (let i = 0; i < returnValue.posts.length; ++i) {
        delete (returnValue.posts)[i].userid;
        returnValue.posts[i].likes = returnValue.posts[i].likes ? returnValue.posts[i].likes.length : 0;
      }
    }
  }
  catch (error) {
    returnValue = { error };
  }
  return returnValue;
}

module.exports = {
  init, userExists, createUser, followUser, unFollowUser, getUserProfile, createPost, deletePost, likePost, unLikePost, createComment, getPost, getPostsOfUser, verifyCredentials, db
}