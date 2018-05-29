var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI); //heroku puts the mongo uri in that variable

module.exports = {
    mongoose: mongoose
};
