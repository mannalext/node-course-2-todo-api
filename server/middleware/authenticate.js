var {User} = require('./../models/user');

//this is the function we will call to make all our routes private
var authenticate = (req, res, next) => {
    var token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
            /* could just do res.status(401).send() like we do below. however, that's code duplication.
            instead, can return Promise.reject(). same thing we're doing in the error case inside findByToken
            in user.js. this makes sure that code execution stops and the next thing that gets run is the catch block
            right below here. so, in the end, we call res.status(401).send()
            */
        }

        //res.send(user);
        /*
        no longer want to send back the user here. this is now a function that lives inside all our routes. do all our
        routes return a user? NO. this is just authenticating that the request is a good one. if it is, then we need to
        know what user and token are being worked on when we get to the back end. so once findByToken returns the happy path,
        we're taking the user and token and storing them on the request to then be used later in whatever path we're on
        */
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send();
    });
};


module.exports = {authenticate};