require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

//server js is just going to be responsible for our routes
//need express for that (remember middleware?)

var app = express();
const port = process.env.PORT; //heroku puts the port on that variable

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    console.log(req.body);
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    })
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        } else {
            res.status(200).send({todo});
        }
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        } else {
            res.status(200).send({todo});
        }
    }).catch((e) => {
        res.status(400).send();
    });
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo: todo});
    }).catch((e) => {
        res.status(400).send();
    })
});

app.post('/users', (req, res) => {
    console.log(req.body);
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
});


app.get('/users/me', authenticate, (req, res) => {
    //ALL OF THIS IS UNNECESSARY WITH THE ADDITION OF AUTHENTICATE
    // var token = req.header('x-auth');

    // User.findByToken(token).then((user) => {
    //     if (!user) {
    //         return Promise.reject();
    //         /* could just do res.status(401).send() like we do below. however, that's code duplication.
    //         instead, can return Promise.reject(). same thing we're doing in the error case inside findByToken
    //         in user.js. this makes sure that code execution stops and the next thing that gets run is the catch block
    //         right below here. so, in the end, we call res.status(401).send()
    //         */
    //     }

    //     res.send(user);
    // }).catch((e) => {
    //     res.status(401).send();
    // });

    //WE JUST NEED TO SEND THE USER BACK. AUTH DID THE WORK FOR US
    res.send(req.user); //see how user is on req here? we stored it on req in authenticate
});

app.listen(port, () => {
    console.log(`started on port ${port}`)
});


module.exports = {app};