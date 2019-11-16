const request = require('supertest');
const { expect, assert } = require('chai');

const app = require("../server")
const Team = require('../models/Team');
const User = require('../models/User');

const teamData = {
    name: "team name",
    description: "team description",
    id: ""
};

const userData = {
    firstName: 'test',
    lastName: 'user',
    userName: 'testUser',
    email: 'test@user.fr',
    password: 'testpsw',
    password2: 'testpsw',
};

const otherUserData = {
    firstName: 'otherTest',
    lastName: 'otherUser',
    userName: 'otherTestUser',
    email: 'othertest@user.fr',
    password: 'azerty',
    password2: 'azerty',
};

let token = null;
let createdUserId = null;
let token2 = null;
let createdUserId2 = null;

describe('POST /api/private/team/create', () => {
    before((done) => {
        Promise.all([Team.deleteMany({}), User.deleteMany({})]).then(async () => {
            try {
                await request(app)
                    .post('/api/public/register')
                    .send(userData)
                    .then((res) => {
                        createdUserId = res.body.user._id
                    })
                request(app)
                    .post('/api/public/login')
                    .send({ email: userData.email, password: userData.password })
                    .end((err, res) => {
                        token = res.body.token;
                        done();
                    });
            } catch (err) {
                console.log("ERROR : " + err);
                process.exit(-1);
            }
        })
            .catch(err => console.log("ERROR : " + err));
    });
    it('should return 201 OK and fill the members and admins lists', (done) => {
        request(app)
            .post('/api/private/team/create')
            .send({ name: teamData.name, description: teamData.description, userId: createdUserId })
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(201, (err, res) => {
                expect(res.body.team).to.not.be.undefined;
                expect(res.body.team.members).lengthOf(1);
                expect(res.body.team.admins).lengthOf(1);
                teamData.id = res.body.team._id;
                done();
            });
    });
    it('should return 401 ERROR', (done) => {
        request(app)
            .post('/api/private/team/create')
            .send({ name: teamData.name, description: teamData.description, userId: createdUserId })
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
    it('should return 409 ERROR', (done) => {
        const redondantTeam = { name: teamData.name, description: "test", userId: createdUserId };
        request(app)
            .post('/api/private/team/create')
            .send(redondantTeam)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(409, done);
    });
    it('should return 422 ERROR with an empty name', (done) => {
        const wrongData = { name: '', userId: createdUserId };
        request(app)
            .post('/api/private/team/create')
            .send(wrongData)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(422, done);
    });
    it('should return 422 ERROR with no user', (done) => {
        request(app)
            .post('/api/private/team/create')
            .send({ name: teamData.name, description: teamData.description })
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(422, done);
    });
});

describe('GET /api/private/team/member/:teamId', () => {
    it('should return 401 ERROR', (done) => {
        request(app)
            .get('/api/private/team/member/' + teamData.id)
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
    it('should return 404 ERROR', (done) => {
        request(app)
            .get('/api/private/team/member/666')
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 201 OK', (done) => {
        request(app)
            .get('/api/private/team/member/' + teamData.id)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(201, (err, res) => {
                expect(res.body.team).to.not.be.undefined;
                done();
            });
    });
});

describe('POST /api/private/team/admin/:teamId/add/user/:userId', () => {
    before(async () => {
        try {
            await request(app)
                .post('/api/public/register')
                .send(otherUserData)
                .then((res) => {
                    createdUserId2 = res.body.user._id
                })
            request(app)
                .post('/api/public/login')
                .send({ email: otherUserData.email, password: otherUserData.password })
                .end((err, res) => {
                    token2 = res.body.token;
                });
        } catch (err) {
            console.log("ERROR : " + err);
            process.exit(-1);
        }
    });
    it('should return 401 ERROR', (done) => {
        request(app)
            .post(`/api/private/team/admin/${teamData.id}/add/user/${createdUserId}`)
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
    it('should return 404 ERROR with a false teamId', (done) => {
        request(app)
            .post(`/api/private/team/admin/666/add/user/${createdUserId}`)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 404 ERROR with a false userId', (done) => {
        request(app)
            .post(`/api/private/team/admin/${teamData.id}/add/user/666`)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 201 OK and not fill the members and admins lists', (done) => {
        request(app)
            .post(`/api/private/team/admin/${teamData.id}/add/user/${createdUserId}`)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(201, (err, res) => {
                expect(res.body.team).to.not.be.undefined;
                expect(res.body.team.members).lengthOf(1);
                expect(res.body.team.admins).lengthOf(1);
                done();
            });
    });
    it('should return 201 OK and fill the members list but not the admins list', (done) => {
        request(app)
            .post(`/api/private/team/admin/${teamData.id}/add/user/${createdUserId2}`)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(201, (err, res) => {
                expect(res.body.team).to.not.be.undefined;
                expect(res.body.team.members).lengthOf(2);
                expect(res.body.team.admins).lengthOf(1);
                done();
            });
    });
});


describe('DELETE /api/private/team/admin/:teamId/delete/user/:userId', () => {
    it('should return 401 ERROR', (done) => {
        request(app)
            .delete(`/api/private/team/admin/${teamData.id}/delete/user/${createdUserId}`)
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
    it('should return 404 ERROR with a false teamId', (done) => {
        request(app)
            .delete(`/api/private/team/admin/666/delete/user/${createdUserId}`)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 404 ERROR with a false userId', (done) => {
        request(app)
            .delete(`/api/private/team/admin/${teamData.id}/delete/user/666`)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 201 OK and pull the members list but not the admins list', (done) => {
        request(app)
            .delete(`/api/private/team/admin/${teamData.id}/delete/user/${createdUserId2}`)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(201, (err, res) => {
                expect(res.body.team).to.not.be.undefined;
                expect(res.body.team.members).lengthOf(1);
                expect(res.body.team.admins).lengthOf(1);
                done();
            });
    });
    it('should return 201 OK and not update members and admins lists', (done) => {
        request(app)
            .delete(`/api/private/team/admin/${teamData.id}/delete/user/${createdUserId2}`)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(201, (err, res) => {
                expect(res.body.team).to.not.be.undefined;
                expect(res.body.team.members).lengthOf(1);
                expect(res.body.team.admins).lengthOf(1);
                done();
            });
    });
    it('should return 201 OK and pull members and admins lists', (done) => {
        request(app)
            .delete(`/api/private/team/admin/${teamData.id}/delete/user/${createdUserId}`)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(201, (err, res) => {
                expect(res.body.team).to.not.be.undefined;
                expect(res.body.team.members).lengthOf(0);
                expect(res.body.team.admins).lengthOf(0);
                done();
            });
    });
});