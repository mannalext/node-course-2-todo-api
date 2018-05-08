const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => { //err only exists if there's an error. can use db to issue commands to read and write data
    if (err) {
        return console.log('Unable to connect to mongodb server');
    }
    console.log('Connected to mongodb server');

    //deleteMany
    // db.collection('Todos').deleteMany({text: 'eat lunch'}).then((result) => {
    //     console.log(result);
    // });

    //deleteOne
    // db.collection('Todos').deleteOne({text: 'eat lunch'}).then((result) => {
    //     console.log(result);
    // });

    //findOneAndDelete
    db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
        console.log(result);
    });

    //db.close();
});




/**
 * I ACCIDENTALLY OVERWROTE THE "FIND" EXAMPLE WITH THE "DELETE EXAMPLE" SHOULD REWATCH THE FIND VIDEO IF YOU NEED THAT STUFF AGAIN
 */