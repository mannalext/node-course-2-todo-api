const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const{User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => { //describe the test block
    it('should create a new todo', (done) => { //asynchronous test, so we need to specify the done argument
        var text = 'test todo text'; //dummy test data

        request(app) //begin your http request
        .post('/todos') //specify that it's a POST to the /todos url
        .set('x-auth', users[0].tokens[0].token)
        .send({text})//POST needs data, so we also call send, sending our dummy data in an object with 1 field called text
        .expect(200) //we expect a 200 code in the happy path
        .expect((res) => { //we alos expect the response body text to be our text 
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => { //if there's an error, use that error variable for context
            if (err) {
                return done(err);
            }
            
            //but we're not done! need to also verify the database state
            Todo.find({text}).then((todos) => { //find our Todo collection
                expect(todos.length).toBe(1); //we've added 1 todo, length should be 1
                expect(todos[0].text).toBe(text); //verify that the todo got the correct text
                done(); //end the test
            }).catch((e) => done(e)); //deal with any db related errors
        });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send({})
        .expect(400)
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.find().then((todos) => {
                expect(todos.length).toBe(2);
                done();
            }).catch((e) => done(e));
        })
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
        .get('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(1);
        })
        .end(done);
    });
});

describe('GET /todos/:id', () => {
    it ('should return todo doc', (done) => {
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it ('should not return todo doc created by other user', (done) => {
        request(app)
        .get(`/todos/${todos[1]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return a 404 if todo not found', (done) => {
        //make req using real obj id
        //call its toHexString method and newObjectID
        //will be a valid id but not found in colleciton so should get 404 back
        //only expectation is that status code. make sure you get 404
        var id = new ObjectID();
        request(app)
        .get(`/todos/${id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return a 404 for non-object ids', (done) => {
        //pass in a url  like this: /todos/123
        //not a valid obj id so should fail and we get a 404
        request(app)
        .get('/todos/123')
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();

        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.findById(hexId).then((todo) => {
                expect(todo).toNotExist();
                done();
            }).catch((e) => done(e));
        })
    });

    it('should not remove a todo made by a different user', (done) => {
        var hexId = todos[0]._id.toHexString();

        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.findById(hexId).then((todo) => {
                expect(todo).toExist();
                done();
            }).catch((e) => done(e));
        })
    });

    it('should return 404 if todo not found', (done) => {
        var id = new ObjectID();
        request(app)
        .delete(`/todos/${id.toHexString()}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 404 if objectID is invalid', (done) => {
        request(app)
        .delete('/todos/123')
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        //grab id of the first item
        //make patch request. provide proper url with id. use send to send data along with body
        //update text, set completed = true
        //assert 200
        //assert res.body has text property equal to test you sent in, completed true, completedAt is number (toBeA)
        var hexId = todos[0]._id.toHexString();
        var text = 'the new text';

        request(app)
        .patch(`/todos/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .send({
            text: text,
            completed: true
        })
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeA('number');
        })
        .end(done);
    });

    it('should not update the todo tied to a different user', (done) => {
        //grab id of the first item
        //make patch request. provide proper url with id. use send to send data along with body
        //update text, set completed = true
        //assert 200
        //assert res.body has text property equal to test you sent in, completed true, completedAt is number (toBeA)
        var hexId = todos[0]._id.toHexString();
        var text = 'the new text';

        request(app)
        .patch(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .send({
            text: text,
            completed: true
        })
        .expect(404)
        .end(done);
    });

    it('should clear completedAt when todo is not complete', (done) => {
        var hexId = todos[1]._id.toHexString();
        var text = 'new text 2';

        request(app)
        .patch(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .send({
            text: text,
            completed: false
        })
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toNotExist();
        })
        .end(done);
        //grab id of second todo item
        //update text to something different
        //set completed to false
        //assert 200
        //assert res.body has new text, completed = false, completedAt is null (toNotExist)
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token) //setting header
        .expect(200)
        .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        //expect 401
        //expect body equals an empty object
            //should be if user is not authenticated, if user doesn't have a token
            //toEqual
        request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
            expect(res.body).toEqual({});
        })
        .end(done);

    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@example.com';
        var password = '123mnb!';

        request(app)
        .post('/users')
        .send({email, password})
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
            expect(res.body.email).toBe(email);
        })
        .end((err) => {
            if (err) {
                return done(err);
            }

            User.findOne({email}).then((user) => {
                expect(user).toExist();
                expect(user.password).toNotBe(password);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should return validation errors if request invalid', (done) => {
        //send invalid email
        //expect 400

        var email = 'andrew@example.com....com';
        var password = 'theemailisinvalid__2@#$A';
        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });

    it('should not create user if email in user', (done) => {
        var email = users[0].email;
        var password = 'abc123!';

        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: users[1].password
        })
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toExist();
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            User.findById(users[1]._id).then((user) => {
                expect(user.tokens[1]).toInclude({
                    access: 'auth',
                    token: res.headers['x-auth']
                });
                done();
            }).catch((e) => done(e));
        });
    });

    it('should reject invalid login', (done) => {
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: 'invalidPassword'
        })
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            User.findById(users[1]._id).then((user) => {
                expect(user.tokens.length).toBe(1);
                done();
            }).catch((e) => done(e));
        });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        //DELETE request /users/me/token
        //set x-auth equal to token
        //expect 200
        //async end call -> find user, verify that tokens array has length of zero

        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            User.findById(users[0]._id).then((user) => {
                expect(user.tokens.length).toBe(0);
                done();
            }).catch((e) => done(e));
        })

    });
});

//send empty object
//expect 400
//dont need any body assumptions
//pass callback to end
//check for errors
//make db assumptions
//length of todos is zero
