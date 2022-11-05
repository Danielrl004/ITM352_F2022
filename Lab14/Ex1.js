
//Imports data from user_data.json and sets it to equal var users
//var users = require ("./user_data.json")
//Prints array in the user_data.json and prints it in the vs code console
//console.log(users);

var fs = require('fs');

var fname = "user_data.json";

if(fs.existsSync(fname));
    //sets data of 
    var data = fs.readFileSync(fname, 'utf-8')
    //more flexible than using require and also sets data to be read as a JSON. 
    var users = JSON.parse(data);
    var status = fs.statSync(fname);
    console.log(status);

//Prints using JS format (color not shown in console)
console.log(data);

//Prints using JSON format (color shown in console)
console.log(users);