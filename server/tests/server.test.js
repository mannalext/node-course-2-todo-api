const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: new ObjectID(), 
    text: 'first test todo'
}, {
    _id: new ObjectID(),
    text: 'second test todo'
}];

beforeEach((done) => { //we make a big assumption down below that the database will be empty before we run any tests
    Todo.remove({}).then(() => { //this beforeEach call will run "before each" test, and will empty the database each time
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => { //describe the test block
    it('should create a new todo', (done) => { //asynchronous test, so we need to specify the done argument
        var text = 'test todo text'; //dummy test data

        request(app) //begin your http request
        .post('/todos') //specify that it's a POST to the /todos url
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
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
});

describe('GET /todos/:id', () => {
    it ('should return todo doc', (done) => {
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text);
        })
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
        .expect(404)
        .end(done);
    });

    it('should return a 404 for non-object ids', (done) => {
        //pass in a url  like this: /todos/123
        //not a valid obj id so should fail and we get a 404
        request(app)
        .get('/todos/123')
        .expect(404)
        .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();

        request(app)
        .delete(`/todos/${hexId}`)
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

    it('should return 404 if todo not found', (done) => {
        var id = new ObjectID();
        request(app)
        .delete(`/todos/${id.toHexString()}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 if objectID is invalid', (done) => {
        request(app)
        .delete('/todos/123')
        .expect(404)
        .end(done);
    });
})

//send empty object
//expect 400
//dont need any body assumptions
//pass callback to end
//check for errors
//make db assumptions
//length of todos is zero
