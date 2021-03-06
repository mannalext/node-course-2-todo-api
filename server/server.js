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

app.post('/todos', authenticate, (req, res) => {
    console.log(req.body);
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id //only returning todos where _creator is equal to the id of the user that's logged in
    }).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    })
});

app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        } else {
            res.status(200).send({todo});
        }
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        } else {
            res.status(200).send({todo});
        }
    }).catch((e) => {
        res.status(400).send();
    });
});

app.patch('/todos/:id', authenticate, (req, res) => {
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

    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, {$set: body}, {new: true}).then((todo) => {
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

//need a login route. have a singup route but if you lose your token there's no way to get one back
//this route will fix that problem
//POST /users/login {email, password}
//need to find a user in mongo with the given email and a HASHED PASSWORD equal to the one passed in
//pick email and password from body
//res.send the body data
//fire up server, login with postman, make sure email and password come back
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        //by this point we're confirming that the email and hashed passwords are equivalent
        //so since the whole point of this it to "login", and to effectively log someone in you need to give them a token,
        //let's respond with a new token in the header
        //we've already got generateAuthToken which makes one based on the unique user we're dealing with 
        //so give them a token and respond with the user but put the token in the response header
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
        //res.send(user);
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`started on port ${port}`)
});


module.exports = {app};