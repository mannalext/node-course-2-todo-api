const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email: {
        required: true,
        type: String,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: (value) => {
                return validator.isEmail(value);
            },
            message: '{VALUE} is not a valid email'
        }
    }, 
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

//you won't see this called explicitly. it's because we're overriding it. it is called behind the scenes
//our implementation picks off id and email because we don't want to show
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject(); //toObject takes a mongoose variable and converts to a JSON object

    return _.pick(userObject, ['_id', 'email']); //picking off id and email so password and token don't get sent back. never want to send those back

};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    var user = this;

    return user.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    });
};

UserSchema.statics.findByToken = function (token) {
    var User = this; //instance methods get called with the individual document. model methods get called with the class (see difference in this line in the other two functions)
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        // return new Promise((resolve, reject) => {
        //     reject();
        // });
        return Promise.reject('test reject value');
    }

    return User.findOne({
        '_id': decoded._id, //quotes are required when you have a dot in the value. not required on _id here. just did it anyway
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            //user bcrypt.compare to compare password and user.password
            //if result == true user is found. call resolve with the user sent in
            //if something goes wrong, call reject which will trigger catch
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};

UserSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        // user.password
        // hash it with bcrypt.hash
        // set it on user.password
        // then call next
        // call genSalt
        // call hash
        // inside callback for hash you need to add user.password = hash and next();
        // once this is done, add a new user and password should be hashed in the database

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {
    User: User
}