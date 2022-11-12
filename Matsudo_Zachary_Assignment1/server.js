var products_array = require(__dirname + '/product_data.json');

var express = require('express');
var app = express();

/* Functions referenced from Lab 8 (IsNonNegInt) */
function isNonNegInt(queryString, returnErrors = false) {
    errors = []; // assume no errors at first
    if (Number(queryString) != queryString) errors.push('Not a number!'); // Check if string is a number value
    if (queryString < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (parseInt(queryString) != queryString) errors.push('Not an integer!'); // Check that it is an integer
    return returnErrors ? errors : (errors.length == 0);
}

// Routing 

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

// process purchase request (validate quantities, check quantity available)
app.post("/Purchase", function (request, response) {
    // 
    let valid = true;
    let ordered = "";

    for (i = 0; i < products_array.length; i++) {
       if(isNonNegInt) {
        response.redirect('home.html');
       } else {
        response.redirect('invoice.html');
       }
        }
    }
);

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));


