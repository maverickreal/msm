const app = require('./index.js'), st = require('supertest'), req = st(app), { db } = require('./db.js');

jest.setTimeout(100000);

describe('running tests', () => {

    afterAll(async () => {
        await db.query(`TRUNCATE TABLE USERS, POSTS, COMMENTS;`);
    });

    test('testing signup', async () => {
        const res = await req.post('/api/authenticate').send({ email: 'a@b.com', firstName: 'fname', lastName: 'lname', password: 'password' });
        console.log(res.body);
        expect(res.statusCode).toBe(200);
    });

    test('repeating signup test', async () => {
        const res = await req.post(`/signup`).send({ email: 'a@b.com', firstName: 'fname', lastName: 'lname', password: 'password2' });
        console.log(res.body);
        expect(res.statusCode).not.toBe(200);
    });

    test('testing signing in', async () => {
        const res = await req.post('/signin').send({ email: 'a@b.com', password: 'password' });
        console.log(res.body);
        expect(res.statusCode).toBe(200);
    });

    test('testing signing in', async () => {
        const res = await req.post('/signin').send({ email: 'aa@b.com', password: 'password' });
        console.log(res.body);
        expect(res.body.message).toBe("user could not be found");
    });
});