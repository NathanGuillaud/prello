const request = require('supertest');
const {expect, assert} = require('chai');

//const app = process.env.SERVER_URI
const app = require("../server");
const User = require('../models/User');
const Board = require('../models/Board');

const boardData = {
    name: "hkhkjhkjh",
    description: "board description",
    userId: "",
    id:""
};

const userData = {
    firstName: 'test',
    lastName: 'user',
    userName: 'testUser',
    email: 'test@user.fr',
    password: 'testpsw',
    password2: 'testpsw',
};

const userDataTwo = {
    firstName: 'test',
    lastName: 'user',
    userName: 'testUserTrois',
    email: 'test@t.fr',
    password: 'testpsw',
    password2: 'testpsw',
};

const teamData = {
    name: "team test",
    description: "description",
    userId:"",
    id:""
}

let token;

describe('POST /board/create', () => {
    before((done) => {
        Promise.all([Board.deleteMany({}), User.deleteMany({})]).then(async () => {
            try {
                await request(app)
                    .post('/api/public/register')
                    .send(userData)
                    .then((res) => {
                        boardData.userId = res.body.user._id;
                        teamData.userId = res.body.user._id;
                    });
                await request(app)
                    .post('/api/public/register')
                    .send(userDataTwo)
                    .then((res) => {
                        userDataTwo.userId = res.body.user._id
                    });

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
    it('should return 201 OK', (done) => {
        request(app)
            .post('/api/private/board/create')
            .send(boardData)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(201, (err, res) => {
                expect(res.body.board).to.not.be.undefined;
                boardData.id = res.body.board._id;
                done();
            });
    });
    it('should return 401 ERROR', (done) => {
        request(app)
            .post('/api/private/board/create')
            .send(boardData)
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
    it('should return 409 ERROR', (done) => {
        const redondantBoard = { name: boardData.name, description: "test" };
        request(app)
            .post('/api/private/board/create')
            .send(redondantBoard)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(409, done);
    });
});

describe('GET /api/private/board/member/:boardId', () => {
    it('should return 401 ERROR', (done) => {
        request(app)
            .get('/api/private/board/member/' + boardData.id)
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
    it('should return 404 ERROR', (done) => {
        request(app)
            .get('/api/private/board/member/666')
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 201 OK', (done) => {
        request(app)
            .get('/api/private/board/member/' + boardData.id)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(201, (err, res) => {
                expect(res.body.board).to.not.be.undefined;
                done();
            });
    });
});


describe('PUT /api/private/board/admin/:boardId/add/user/:userId', () => {
    it('should return 401 ERROR', (done) => {
        request(app)
            .post('/api/private/board/admin/'+ boardData.id + '/add/user/' + boardData.userId)
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
    it('should return 404 ERROR', (done) => {
        request(app)
            .post('/api/private/board/admin/'+ boardData.id + '/add/user/jkh')
            .send({isAdmin: true})
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 404 ERROR', (done) => {
        request(app)
            .post('/api/private/board/admin/sdfsdf/add/user/'+boardData.userId)
            .send({isAdmin: true})
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 201 OK', (done) => {
        request(app)
            .post('/api/private/board/admin/'+ boardData.id + '/add/user/' + userDataTwo.userId)
            .send({isAdmin: true})
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(201, (err, res) => {
                expect(res.body.board.admins.includes(userDataTwo.userId));
                expect(res.body.board.guestMembers.includes(userDataTwo.userId));
                done();
            });
    });
});

describe('DELETE /api/private/board/admin/:boardId/delete/user/:userId', () => {
    it('should return 401 ERROR', (done) => {
        request(app)
            .delete('/api/private/board/admin/'+ boardData.id + '/delete/user/' + boardData.userId)
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
    it('should return 404 ERROR', (done) => {
        request(app)
            .delete('/api/private/board/admin/'+ boardData.id + '/delete/user/jkh')
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 404 ERROR', (done) => {
        request(app)
            .delete('/api/private/board/admin/sdfsdf/delete/user/'+boardData.userId)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 201 OK', (done) => {

        request(app)
            .post('/api/private/board/admin/'+ boardData.id + '/add/user/' + userDataTwo.userId)
            .send({isAdmin: true})
            .set('Authorization', token)
        .then(

        request(app)
            .delete('/api/private/board/admin/'+ boardData.id + '/delete/user/' + userDataTwo.userId)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(201, (err, res) => {
                expect(!res.body.board.admins.includes(userDataTwo.userId));
                expect(!res.body.board.guestMembers.includes(userDataTwo.userId));
                done();
            }));
    });
});

describe('PUT /api/private/board/admin/:boardId/update/user/role/:userId', () => {
    it('should return 401 ERROR', (done) => {
        request(app)
            .put('/api/private/board/admin/'+ boardData.id + '/update/user/role/' + boardData.userId)
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
    it('should return 404 ERROR', (done) => {
        request(app)
            .put('/api/private/board/admin/'+ boardData.id + '/update/user/role/jkh')
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 404 ERROR', (done) => {
        request(app)
            .put('/api/private/board/admin/sdfsdf/update/user/role/'+boardData.userId)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 201 OK', (done) => {

        request(app)
            .post('/api/private/board/admin/'+ boardData.id + '/add/user/' + userDataTwo.userId)
            .send({isAdmin: true})
            .set('Authorization', token)
            .then(

                request(app)
                    .put('/api/private/board/admin/'+ boardData.id + '/update/user/role/' + userDataTwo.userId)
                    .send({isAdmin: false})
                    .set('Authorization', token)
                    .expect('Content-Type', /json/)
                    .expect(201, (err, res) => {
                        expect(!res.body.board.admins.includes(userDataTwo.userId));
                        expect(res.body.board.guestMembers.includes(userDataTwo.userId));
                        done();
                    }));
    });
    it('should return 201 OK', (done) => {

        request(app)
            .post('/api/private/board/admin/'+ boardData.id + '/add/user/' + userDataTwo.userId)
            .send({isAdmin: false})
            .set('Authorization', token)
            .then(
                request(app)
                    .put('/api/private/board/admin/'+ boardData.id + '/update/user/role/' + userDataTwo.userId)
                    .send({isAdmin: true})
                    .set('Authorization', token)
                    .expect('Content-Type', /json/)
                    .expect(201, (err, res) => {
                        expect(res.body.board.admins.includes(userDataTwo.userId));
                        expect(res.body.board.guestMembers.includes(userDataTwo.userId));
                        done();
                    }));
    });
});

describe('POST /api/private/board/admin/:boardId/add/team/:teamId', () => {
    it('should return 401 ERROR', (done) => {
        request(app)
            .post('/api/private/board/admin/'+ boardData.id + '/add/team/' + boardData.userId)
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
    it('should return 404 ERROR', (done) => {
        request(app)
            .post('/api/private/board/admin/'+ boardData.id + '/add/team/jkh')
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 404 ERROR', (done) => {
        request(app)
            .post('/api/private/board/admin/sdfsdf/add/team/'+boardData.userId)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 201 OK', (done) => {

        request(app)
            .post('/api/private/team/create')
            .send(teamData)
            .set('Authorization', token)
            .then(res => {
                    const teamId = res.body.team._id;
                    request(app)
                        .post('/api/private/board/admin/' + boardData.id + '/add/team/' + teamId)
                        .set('Authorization', token)
                        .expect('Content-Type', /json/)
                        .expect(201, (err, res) => {
                            expect(res.body.board.team.localeCompare(teamId));
                            done();
                        })
                }
            );
    });
});

describe('DELETE /api/private/board/admin/:boardId/delete/team/:teamId', () => {
    it('should return 401 ERROR', (done) => {
        request(app)
            .delete('/api/private/board/admin/'+ boardData.id + '/delete/team/' + boardData.userId)
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
    it('should return 404 ERROR', (done) => {
        request(app)
            .delete('/api/private/board/admin/'+ boardData.id + '/delete/team/jkh')
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 404 ERROR', (done) => {
        request(app)
            .delete('/api/private/board/admin/sdfsdf/delete/team/'+boardData.userId)
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(404, done);
    });
    it('should return 201 OK', (done) => {
        teamData.name = "deuxieme test";
        request(app)
            .post('/api/private/team/create')
            .send(teamData)
            .set('Authorization', token)
            .then(res => {
                    const teamId = res.body.team._id;
                    request(app)
                        .post('/api/private/board/admin/' + boardData.id + '/add/team/' + teamId)
                        .set('Authorization', token)
                        .then(res => {
                            request(app)
                                .delete('/api/private/board/admin/' + boardData.id + '/delete/team/' + teamId)
                                .set('Authorization', token)
                                .expect('Content-Type', /json/)
                                .expect(201, (err, res) => {
                                    expect(res.body.board.name === boardData.name);
                                    expect(res.body.board.team === undefined);
                                    done();
                                })
                        })
                }
            );
    });
});