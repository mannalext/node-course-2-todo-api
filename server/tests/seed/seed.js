const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
    _id: userOneId,
    email: 'andrew@example.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}, {
    _id: userTwoId,
    email: 'jen@example.com',
    password: 'userTwoPass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}];

const todos = [{
    _id: new ObjectID(), 
    text: 'first test todo',
    _creator: userOneId
}, {
    _id: new ObjectID(),
    text: 'second test todo',
    completed: true,
    completedAt: 333,
    _creator: userTwoId
}];

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

const populateTodos = (done) => { //we make a big assumption down below that the database will be empty before we run any tests
    Todo.remove({}).then(() => { //this beforeEach call will run "before each" test, and will empty the database each time
        return Todo.insertMany(todos);
    }).then(() => done());
}

module.exports = {todos, populateTodos, users, populateUsers}