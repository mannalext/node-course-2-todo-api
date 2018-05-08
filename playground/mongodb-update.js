const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => { //err only exists if there's an error. can use db to issue commands to read and write data
    if (err) {
        return console.log('Unable to connect to mongodb server');
    }
    console.log('Connected to mongodb server');

    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('5af0fc209fa01e94995903d0')
    // }, {
    //     $set: {
    //         completed: true
    //     }
    // }, {
    //     returnOriginal: false
    // }).then((result => {
    //     console.log(result);
    // }));

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5adfe18f7832284315057de7')
    }, {
        $inc: {
            age: 1
        },
        $set: {
            name: 'alexander'
        }
    }, {
        returnOriginal: false
    }).then((result) => {
        console.log(result)
    });

    //db.close();
});