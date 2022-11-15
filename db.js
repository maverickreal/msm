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

const verifyUser = id => {
  let returnValue = 0;
  db.query(`SELECT 1 FROM USERS WHERE 'USERID'='${id}' LIMIT 1;`, (err, res) => {
    if (err) {
      console.log('error : ' + err);
    }
    else {
      returnValue = !res.rows.empty() && res.rows[0] == '1';
    }
  });
  return returnValue;
}

const createUser = (name, email, password) => {
  db.query(`INSERT INTO USERS(NAME, EMAIL PASSWORD) VALUES(${name}, ${email}, ${password});`, (err, res) => {
    if (err) {
      console.log('error : ' + err);
    }
  });
}

const followUser = (followerId, followeeId) => {
  let error;
  db.query(`SELECT 1 FROM USERS WHERE ANY(FOLLOWS)=${followeeId} LIMIT 1;`, err => error = err);
  if (error) {
    return error;
  }
  db.query(`UPDATE TABLE USERS SET FOLLOWS[CARDINALITY(FOLLOWS)]=${followeeId} WHERE ID=${followerId} LIMIT 1;`, err => error = err);
  return error;
}

const unFollowUser = (followerId, followeeId) => {
  db.query(`UPDATE TABLE USERS FOLLOWS=ARRAY_REMOVE(FOLLOWS, ${followeeId});`);
}

const getUserProfile = (userId) => {
  let error, returnValue;
  db.query(`SELECT NAME, EMAIL, CARDINALITY(FOLLOWS) FOLLOWCOUNT, CARDINALITY(POSTS) POSTCOUNT FROM USERS WHERE ID=${userId} LIMIT 1;`, (err, res) => {
    if (err) {
      error = err;
    }
    else if (res.rows.empty()) {
      error = 'user not found to exist';
    }
    else {
      returnValue = res.rows[0];
    }
  });
  return returnValue;
}

module.exports = {
  init, verifyUser, createUser, followUser, unFollowUser, getUserProfile
}