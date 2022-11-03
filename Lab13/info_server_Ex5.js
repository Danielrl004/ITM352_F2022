var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true })); //tells express to encode the URL

function isNonNegInt(queryString, returnErrors = false){
    errors = []; // assume no errors at first
        if(Number(queryString) != queryString) {
         errors.push('Not a number!'); // Check if string is a number value
        } else {
        if(queryString < 0) errors.push('Negative value!'); // Check if it is non-negative
        if(parseInt(queryString) != queryString) errors.push('Not an integer!'); // Check that it is an integer
        }

    if (returnErrors) {
        return errors;
    } else if (errors.length == 0) {
        return true;
    } else { 
        return false;
    }
}

app.get('/test', function (request, response, next) {
    console.log("Got a test path"); //can only send one response to a request
    next(); //used to match multiple rules, can't send a response on the first line
});

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

var products = require(__dirname + '/product_data.json');
products.forEach( (prod,i) => {prod.total_sold = 0}); 

app.get("/product_data.js", function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`; //loading JSON in the server, providing a microservice where any client can request for the data
   response.send(products_str);
});

app.post("/process_form", function (request, response) {
    var q = request.body['text1'];
        if (typeof q != 'undefined') {
            if (isNonNegInt(q)) { //we have a valid quantity
                response.redirect('receipt.html?quantity=' + q);
            } else {
                response.redirect('order_page.html?error=Invalid%20Quantity&quantity_textbox=' + q)
            }
        }

 });
 
app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here to do a callback