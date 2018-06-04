const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc!';

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash);
    });
});

var hashedPassword = '$2a$10$3xww6tGpHwffjpQIwSNMsePTcD/MzLEX870e7GRZdBXzl91N/jUmy';

bcrypt.compare(password, hashedPassword, (err, res) => {
    console.log(res);
});

// var data = {
//     id: 10
// };

// var token = jwt.sign(data, '123abc'); //data is the data, '123abc' is the SECRET. the SALT
// console.log(token);



// var decoded = jwt.verify(token, '123abc'); //ONLY WHEN THE TOKEN IS UNALTERED AND THE SECRET IS THE SAME WILL WE GETTHE RIGHT RESULT
// //THIS MIMICS THE CODE BELOW. JWT DOES THE WORK FOR YOU
// console.log('decoded: ', decoded);










// // var message = 'I am user number 3';
// // var hash = SHA256(message).toString();

// // console.log(`message: ${message}`);
// // console.log(`hash: ${hash}`);

// // var data = {
// //     id: 4
// // };
// // var token = {
// //     data: data,
// //     hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// // }


// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data)).toString();


// // var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
// // if (resultHash === token.hash) {
// //     console.log('data was not changed');
// // } else {
// //     console.log('data was changed. do not trust');
// // }

// /*
// so, why am I hashing the data object inside token? 
// imagine a scenario where the client gets {data}, sees the id is 4, and changes it to 5
// then sends a delete for id: 5. 
// we don't want to allow that
// so instead, when we get that we're operating on id: 4, we hash that object
// since hashing is a one-way algorithm, if the data is changed on the client side the hashes won't match and we can stop all execution

// now, that's still not foolproof. the user could take the token and change the hash value to that of id: 5. that's where "salting" comes in
// if you have some secret salt value that you add to your hashes, only you will know which hashes are correct
// the salt MUST be secret

// the example of this is seen on lines 18 and 19. pretend these are the actions that an attacker is taking
// they have the token and change the id to 5, and hash it. then send it all back
// on our end we will take the hash they give us in the token and compare it to the salted hash
// since they don't have the salt, we know something changed. the original salt was lost when they rehashed. so we don't accept
// */