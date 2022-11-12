var users = require("./user_data.json");
console.log(users);
var fs = require('fs');

var fname = "user_data.json";

var data = fs.readFileSync(fname, 'utf-8');
var users = JSON.parse(data);
console.log(data);
console.log(users);