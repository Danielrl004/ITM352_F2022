var express = require('express'); // importing the express file from node_modules
var app = express(); //putting imported express files into function named app
// Routing 

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

//gives server access to the request packet
app.use(express.urlencoded({ extended: true }));

// create response to all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

//set the product_data.json array to variable products
products = require('./public/product_data.json');

//Taken from Lab13, Ex5 
//Runs through each element in the product array and initiailly set the total_sold 0
products.forEach( (prod,i) => {prod.total_sold = 0}); 


//stringify the products array on product_data.json to the variable products_str
app.get('/product_data.js', function (request, response, next) { 
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

//check if there are any invalid quantity inputs
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
};

// process POST request which will validate the quantities and check the qty_available. 
//Code source: Wokred with Erin Tachino and Professor Kazman, Lab13-Ex5. 
app.post("/invoice.html", function (request, response) {
    // Process the invoice.html form for all quantities and then redirect if quantities are valid
    let valid = true;
    let ordered = "";
    let valid_num= true;
    for (i = 0; i < products.length; i++) { // Runs loop for all products and their respective entered quantities
        let qty_name = "quantity" + i;
        let qty = request.body["quantity" + i];
            if (isNonNegInt(qty) && qty > 0 && Number(qty) <= products[i].qty_available) {   
                // If the quantity meets the above conditions, then the qty of products sold will accumulate to total_sold
                products[i].total_sold += Number(qty);
                ordered += qty_name + "=" + qty + "&"; //writes the URL string combining the valid quantities entered by the user
            } else if(isNonNegInt(qty) != true) {
                valid_num = false
            } else if (Number(qty) >= products[i].qty_available) {
                // If doesn't meet if() conditions or inputs are invalid, then valid = false
                valid = false;
             }
            }
    if (!valid) {
        // If an error is found, then redirect to the error page
        response.redirect('products_display.html?error=Invalid');
    } else {
        // If no errors are found, then redirect to the invoice page.
        response.redirect('invoice.html?' + ordered);
    }
});

// start server and if started correctly, display message on the console. 
app.listen(8080, () => console.log(`listening on port 8080`));