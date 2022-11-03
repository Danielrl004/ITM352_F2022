function isNonNegInt(quantityString, returnErrors = false) {
    errors = []; // assume no errors at first
    if (Number(quantityString) != quantityString) { 
        errors.push('Not a number!'); // Check if string is a number value
    } else {
        if (quantityString < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(quantityString) != quantityString) errors.push('Not an integer!'); // Check that it is an integer
    }
    if (returnErrors) {
        return errors;
    } else if (errors.length == 0) {
        return true;
    } else {
        return false;
    }
}

var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true })); // tells app to encode the URL

app.get('/test', function (request, response, next) {
    console.log("Get a test path");
    next();
});


app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

var products = require(__dirname + '/product_data.json');
products.forEach((prod,i) => {prod.total_sold = 0});
 
app.get("/product_data.js", function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

app.post("/process_form", function (request, response) {
    var q = request.body['text1'];
    if (typeof q != 'undefined') {
        if(isNonNegInt(q)){
            let name = products[0]['name'];
            let name_price = products[0]['price'];
            response.send(`Thank you for purchasing <B>${q}</B> ${name} at ${name_price} each for a total of ${name_price * q}`);

        } else {
    response.send(`Error: ${q} is not a quantity. Hit the back button to fix.`);
        } 
    }
 });

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here to do a callback
