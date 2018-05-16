const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const{User} = require('./../server/models/user');

//this will remove all todos from the database
// Todo.remove({}).then((result) => {
//     console.log(result);
// })

//Todo.findOneAndRemove
//Todo.findByIdAndRemove


//the following two calls will do the same thing
Todo.findOneAndRemove({_id: '5afc4e0f98476e6332280299'}).then((todo) => {
    console.log(todo);
});

Todo.findByIdAndRemove('5afc4e0f98476e6332280299').then((todo) => {
    console.log(todo);
});