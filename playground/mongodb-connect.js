//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// var obj = new ObjectID();
// console.log(obj);


//OBJECT DESTRUCTURING
// var user = {
//     name: 'alex',
//     age: 25
// };

// var {name} = user;

// console.log(name);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => { //err only exists if there's an error. can use db to issue commands to read and write data
    if (err) {
        return console.log('Unable to connect to mongodb server');
    }
    console.log('Connected to mongodb server');

    // db.collection('Todos').insertOne({
    //     text: 'something to do',
    //     completed: false
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('unable to insert todo', err);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

    //insert new doc into the Users collection with (name, age, location)

    // db.collection('Users').insertOne({
    //     name: 'alex',
    //     age: 25,
    //     location: 'columbus'
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('unable to insert todo', err);
    //     }
    //     //console.log(JSON.stringify(result.ops, undefined, 2));

    //     console.log(result.ops[0]._id.getTimestamp());
    // });

    db.close();
});

/**
 * mongo code for mongo v3 below
 * 
 * no longer do you get err and db in .connect()
 * you get err and client
 * 
 * additionally, need "const db = client.db('TodoApp');
 * this is because you don't get db passed in anymore, so you need to make it"
 * 
 * also, it's no longer db close. it's client.close()
 */