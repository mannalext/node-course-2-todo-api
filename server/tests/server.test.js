const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

beforeEach((done) => { //we make a big assumption down below that the database will be empty before we run any tests
    Todo.remove({}).then(() => { //this beforeEach call will run "before each" test, and will empty the database each time
        done();
    });
});

describe('POST /todos', () => { //describe the test block
    it('should create a new todo', (done) => {
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
            Todo.find().then((todos) => { //find our Todo collection
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
                expect(todos.length).toBe(0);
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
