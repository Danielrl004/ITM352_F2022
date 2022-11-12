
var express = require('express');
var app = express();
products_array = require(__dirname + '/public/products.json');

function generateShipping(subtotal)
{
  var shipping;
  if (subtotal <= 50) {
    shipping = 2;
  }
  else if (subtotal <= 100) {
    shipping = 5;
  }
  else {
    shipping = subtotal * .05;
  }
  return shipping;
}
function checkNonNegInt(value, returnErrors = false) {
  errors = [];

  if (value < 0 || parseInt(value) != value || Number(value) != value) {
    errors.push("Please enter a valid number!\n");
  }
  if (errors.length == 0) {
    returnErrors = true;
  }
  else {
    return errors;
  }
  return returnErrors;
}


var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));

//monitor all requests
app.all('*', function (request, response, next) {
  console.log(request.method + ' to ' + request.path);
  next();
});

// process purchase request (validate quantities, check quantity available)


//route all other GET requests to files in public
app.use(express.static(__dirname + '/public'));

//upload products.js on the client side
app.get("/products.js", function(request, response)
{
  response.type('js');
  var products_str = `var products = ${JSON.stringify(products_array)};`;
  response.send(products_str);
})
//post request to /purchase
app.post('/purchase', function (req, res) {
  let error = false;
  let obj = req.body;
  let arr = Object.values(obj);
  let arry = [];
  arr.forEach(function (value, key) {
    arry.push(value);
   
  if (checkNonNegInt(value, true) != true && value != 0) {

      res.send(`Invalid amount of quantity added, please go back<br><button onclick="window.location = 'index.html'">Go Back</button>`);
    
      error = true;
    }


  })
  if (error == false) {
    res.write(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="../style.css">
        <title>Invoice</title>
        
    </head>
    <header>
    <span id="purple">
        <p>
            <span style="color:#FF0000">B</span>
            <span style="color:#66CC66">E</span>
            <span style="color:#FF9966">T</span>
            <span style="color:#FFCCCC">T</span>
            <span style="color:#FF0066">A</span>
        </p>
        <img src="./images/bob.png">
    </span>
</header>

    <body style = "position: relative;">

    <h1 style = "text-align: center;">Thank you for your purchase!</h1>
    <table border= "1em"; style = "margin-left: auto; margin-right: auto; margin-top: 100px; height: 400px">
    <tr>
    <th style = "text-align: center; width: 43%">Item</th>
    <th style = "text-align: center; width: 11%">Quantity</th>
    <th style = "text-align: center; width: 13%">Price</th>
    <th style = "text-align: center; width: 54%">Extended Price</th>
    </tr>
    `);
    var subtotal = 0;
    var tax_rate = .0575;
    for (var i = 0; i < products_array.length; i++) {
      var extended_price = arry[i] * products_array[i].price;
      subtotal += extended_price;
      if (arr[i] == 0) {
        continue
      }
      else {
        products_array[i].quantity_available -= arry[i]
        res.write(`
        <tr>
        <td style = "text-align: center; width: 43%">${products_array[i].name}</td>
        <td style = "text-align: center; width: 13%">${arry[i]}</td>
        <td style = "text-align: center; width: 13%">$${(products_array[i].price).toFixed(2)}</td>
        <td style = "text-align: center; width: 54%">$${extended_price.toFixed(2)}</td>
        </tr>
  
      `)
      }
    }

    res.write(`   
    <tr><td colspan = "4" width = "100%">&nbsp;</td><tr>
    <tr>
    <td style = "text-align: center;" colspan = "3"; width = "67%">Sub-total</td> 
    <td width = "54%;" style = "text-align: center;">$${subtotal.toFixed(2)}</td>
    </tr>
    <tr>
    <td style = "text-align: center;" colspan = "3"; width = "67%">Tax @ ${(tax_rate * 100).toFixed(2)}%</td> 
    <td width = "54%;" style = "text-align: center;">$${(subtotal * tax_rate).toFixed(2)}</td>
    </tr>
    <tr>
    <td style = "text-align: center;" colspan = "3"; width = "67%">Shipping</td> 
    <td width = "54%;" style = "text-align: center;">$${generateShipping(subtotal).toFixed(2)}</td>
    </tr>
    <tr>
    <td style = "text-align: center;" colspan = "3"; width = "67%">Total</td> 
    <td width = "54%;" style = "text-align: center;">$${(subtotal + (subtotal * tax_rate) + generateShipping(subtotal)).toFixed(2)}</td>
    </tr>
    </table>  
    </body>
    </html>
    <button onclick = "window.location = 'index.html'"; style = "display: block; margin-left: auto; margin-right: auto; margin-top: 20px; background-color: black; color: white; height: 50px; width: 100px; border-radius: .4em; cursor: pointer;">Continue Shopping</button>
    `);
  
    res.end();
  }

})
app.listen(8080, () => console.log("listening  on port 8080"));