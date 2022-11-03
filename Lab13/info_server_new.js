var express = require('express');
var app = express();
var path = require('path');


app.use(express.static(__dirname + '/public'));
app.use('/css',express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true })); 

function isNonNegativeInteger(queryString, returnErrors = false) {
    errors = []; // assume no errors at first
    if (Number(queryString) != queryString) {
        errors.push('Not a number!'); // Check if string is a number value
    } else {
        if (queryString < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(queryString) != queryString) errors.push('Not an integer!'); // Check that it is an integer
    }
    if (returnErrors) {
        return errors;
    } else if (errors.length == 0) {
        return true;
    } else {
        return false;
    }
}

var products = require(__dirname + '/product_data.json');
products.forEach((prod, i) => { prod.total_sold = 0 });

app.get("/product_data.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

app.post("/process_form", function (request, response) {
    // Process the form by redirecting to the receipt page
    let valid = true;
    let ordered = "";

    for (i = 0; i < products.length; i++) {
        var name = "text" + i;
        var q = request.body[name];
        if (typeof q != 'undefined') {
            if (isNonNegativeInteger(q)) {  // We have a valid quantity
                products[i].total_sold += Number(q);
                ordered += name + "=" + q + "&"; 
            } else {
                valid = false;
            }
        } else {
            valid = false;
        }
    }
    if (!valid) {
        response.redirect('order_page.new.html?error=Invalid%20Quantity');
    } else {
        response.redirect('receipt.new.html?' + ordered);
    }

});

app.listen(8080, () => console.log(`listening on port 8080`));