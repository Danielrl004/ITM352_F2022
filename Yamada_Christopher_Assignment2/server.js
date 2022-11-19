// Author: Christopher Y , This file handles browser to file communication
var express = require('express'); // requires express module
var app = express(); // calls express function
var fs = require('fs'); // requires fs module
const querystring = require('node:querystring'); // module for parsing and formatting URL query strings
var filename = __dirname+"/user_data.json"; // user info JSON file
var filenameOne = __dirname+"/products.json"; // product info JSON file
var products = require(filenameOne); // initializes products array from products.json
// Previous 4 lines of code is used from Lab: Server Side Form Processing Exercise 2

var errors = {}; // initializes empty errors array
var loginerrors = {}; // initializes empty login errors array
const emailregex = /^([a-zA-Z0-9_\.]+)@([a-zA-Z0-9\.]+)\.([a-zA-Z]{2,3})$/gm; // initializes email regex
const passwordregex = /^(\S{10,16})$/gm; // initializes password regex

app.use(express.urlencoded({ extended: true })); // parses incoming requests

// reads and parses data from user data and assigns to users_reg_data 
if (fs.existsSync(filename)) {
    var stats = fs.statSync(filename);
    data = fs.readFileSync(filename, 'utf-8');
    users_reg_data = JSON.parse(data);
} else {
    console.log(filename + ' does not exist!');
    users_reg_data = {};
}

// reads and parses data from product data and assigns to products_data
if (fs.existsSync(filenameOne)) {
    var statsOne = fs.statSync(filenameOne);
    dataOne = fs.readFileSync(filenameOne, 'utf-8');
    products_data = JSON.parse(dataOne);
} else {
    console.log(filenameOne + ' does not exist!');
    products_data = {};
}

// function to check if quantity is a non-number/negative number/ or non-integer. Code from Lab: Using and Creating Functions
function isNonNegInt(q, returnErrors = false) {
    errors = []; // assume no errors at first
    if (Number(q) != q) errors.push('not a number!'); // Check if string is a number value
    else {
        if (q < 0) errors.push('a negative value!'); // Check if it is non-negative
        if (parseInt(q) != q) errors.push('not an integer!'); // Check that it is an integer

    }
    return returnErrors ? errors : (errors.length == 0); // Returns error array
}

// function to check if attempted quantity purchase is above product available quantity
function isAboveQuantity(q, qan, returnQuanErrors = false) {
    quanerror = []; // assume no errors at first
    if (q > qan) quanerror.push('quantity available!'); // Check if value is above available quantity
    return returnQuanErrors ? quanerror : (quanerror.length == 0); // Returns quanerror array
}

// function to generate the confirmation order page
function genConfirmOrder(the_username) {
    
    let str1 = `
    <!DOCTYPE html>
    <html>
    <head>
    <title>Order Confirmed</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="https://www.w3schools.com/lib/w3-theme-black.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.min.css">
    <!-- Calling for products data -->
    <script src="/products.js"></script>
    </head>
    <body>
    
    
    
    <!-- Header -->
    <header class="w3-container w3-theme w3-padding" id="myHeader">
      <div class="w3-center">
          <h1 class="w3-xxxlarge w3-animate-bottom">Christopher's Mouse Store</h1>
      </div>
    </header>
    <br>
    <h1 class="w3-center">Order Confirmed</h1>
    </div>
    
    <div class="w3-row-padding">
        `;
    let str2 = '<script>';
    let str3 = `
    var quantities = []; // initializes empty quantities array
    // Code is from personal Store1 WOD invoice.html
    var params = (new URL(document.location)).searchParams
    for (let i = 0; i < products.length; i++) {
    `;
    let str4 = ' quantities.push(params.get(`';
    let str5 = `quantity$`;
    let str6 = '{i}`));';
    let str7 = `
    }
    console.log(quantities);
    `;
    let str8 = 'document.write(`';
    let str9 = `<body>
    <p>
    <h2>Thank you, ${the_username} for your purchase!</h2>
    <br><br>
    <h2>Product sent to: <br>
    Name: ${users_reg_data[the_username].name}
    <br>
    Email: ${users_reg_data[the_username].email}
    </h2></p>
    <br><br>
    <p>Click Here to get back to Product Display Page: <button class="w3-button w3-theme" value="toProdDisplay" onclick="window.location.href='/products_display.html';">Shop</button>
    </p>
    </body>`;
    let str10 = '`);</script>';
    let str11 = `
    </div>
    
    <br><br><br><br><br><br><br><br><br><br><br><br>

    <!-- Footer -->
    <footer class="w3-center w3-container w3-theme-dark w3-padding-16">
    <h3>Your one stop shop for computer mice!</h3>
    </footer>


    </body>
    </html>`;
    // appends all strings into one variable
    var confirmOrderStr = (str1 + str2 + str3 + str4 + str5 + str6 + str7 + str8 + str9 + str10 + str11);
    // returns html page
    return confirmOrderStr;

}

// function to generate the invoice page
function genInvoice(the_username, qparams, pastlogininfo, passtimeslogged) {
    let params = qparams;
    let str1 = `
            <!-- Author: Christopher Y. This file displays invoice for product purchase -->
<!-- This page is adapted from a W3 Schools Template: https://www.w3schools.com/w3css/tryw3css_templates_black.htm -->
<!-- Calling for products data -->
<script src="/products.js"></script>
<script>
    /*This file uses dynamic variables to display certain price and information for different products.
  */
    var quantities = []; // initializes empty quantities array

    // Code is from personal Store1 WOD invoice.html
    var params = (new URL(document.location)).searchParams;
    for (let i = 0; i < products.length; i++) {
        `;
    let str2 = ' quantities.push(params.get(`';
    let str3 = `quantity$`;
    let str4 = '{i}`));';
    let str5 = `
}
    console.log(quantities);
    // function to generate item rows with inputted product quantity array
    // Code is adapted from personal Store1 WOD invoice.html
    function generate_item_rows(product_quantities_array) {
        // loops through each product
        for (let i in product_quantities_array) {
            let extended_price = (product_quantities_array[i] * products[i].price); // calculates extended price
            // prints out item rows with product pricing information includes IR5 noted with comment
            // this document.write includes a small image of the purchased product in each line of the invoice for IR 5.
    `;
    let str6 = 'document.write(`';
    let str7 = `
    <tr>
            <td width="43%">$`
    let str8 = `{products[i].name}</td>
            <td align="center" width="11%">$`
    let str9 = `{quantities[i]}</td>
            <td width="13%">$$`
    let str10 = `{products[i].price}</td>
            <td width="54%">$$`
    let str11 = `{extended_price}</td>
            <!-- Assignment IR 5 -->
            <td width="10%"><img src="$`
    let str12 = `{products[i].image}" width="50px" height="50px"></td>
          </tr>
    `;
    let str13 = '`)';
    let str14 = `;
    `;
    let str15 = `subtotal += extended_price; // adds extendedprice to collective subtotal
}
}
// Subtotal for all 5 products.
var subtotal = 0
// Sales tax rate
var salestax = 0.0575;

</script>
<!DOCTYPE html>
<html>
<!-- Importing template stylesheets  -->
<head>
<title>Invoice</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
<link rel="stylesheet" href="https://www.w3schools.com/lib/w3-theme-black.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.min.css">
</head>


<body>

<!-- Header -->
<header class="w3-container w3-theme w3-padding" id="myHeader">
<div class="w3-center">
    <h1 class="w3-xxxlarge w3-animate-bottom">Christopher's Mouse Store</h1>
</div>
</header>


<script>
// document.writes table formatting and headers
// code is from personal Store1 WOD invoice.html
`;

    let str16 = 'document.write(`';
    let str17 = `<div class="w3-container">

`
    let str18 = `<form class="w3-container" action="edituserinfo" method="POST">
    <div class="w3-center">
    <h2>Purchase Invoice for: ${users_reg_data[the_username].name}</h2>
    <input type="hidden" name="username" value="${the_username}">
    <input type="hidden" name="quanparams" value="${params}">
    <p>Last Login: ${pastlogininfo}</p>
    <p>Number of Logins: ${passtimeslogged}</p>
    <p>Click Here to Edit User Info: <button class="w3-button w3-theme" type="submit" value="editinfo">Edit</button></p>
    </form>
</div>
<div class="w3-responsive w3-card-4">
    <table class="w3-table w3-striped w3-bordered">
        <thead>
            <tr class="w3-theme">
                <th style="text-align: center;" width="43%">Item</th>
                <th style="text-align: center;" width="11%">Quantity</th>
                <th style="text-align: center;" width="13%">Price</th>
                <th style="text-align: center;" width="54%">Extended Price</th>
                <th style="text-align: center;" width="10%">Image</th>
            </tr>
        </thead>
        <tbody>`;
    let str19 = '`);';
    let str20 = `generate_item_rows(quantities); // executes generate item rows function
var taxedamount = salestax * subtotal; // calculates tax amount
//Shipping
if (subtotal < 50) {
    shipping = 2;
} else if (subtotal < 100) {
    shipping = 5;
} else {
    shipping = 0.05 * subtotal;
}
// Total amount that needs to be paid
var grandtotal = taxedamount + subtotal + shipping;`;

    let str21 = 'document.write(`';
    let str22 = `
<tr>
                        <td colspan="4" width="100%">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align: center;" colspan="3" width="67%">Sub-total</td>
                        <td width="54%">$$`
    let str23 = `{subtotal}</td>
                    </tr>
                    <tr>
                        <td style="text-align: center;" colspan="3" width="67%"><span style="font-family: arial;">Tax @
                                5.75%</span></td>
                        <td width="54%">$$`
    let str24 = `{taxedamount.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="text-align: center;" colspan="3" width="67%"><span
                                style="font-family: arial;">Shipping</span></td>
                        <td width="54%">$$`
    let str25 = `{shipping.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="text-align: center;" colspan="3" width="67%"><strong>Total</strong></td>
                        <td width="54%"><strong>$$`
    let str26 = `{grandtotal.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
`;

    let str27 = '`);';
    let str28 = `</script>
<br><br>

<form class="w3-container" action="confirmorder?${params.toString()}" method="POST">
<div class="w3-center">
<input type="hidden" name="usernameConfirmOrder" value="${the_username}">
<input type="hidden" name="paramsConfirmOrder" value="${params}">
<p>Please Click Here to Confirm your Order: <button class="w3-button w3-theme" type="submit" value="confirmOrder">Confirm</button></p>
</form>
</div>
<br>
<!-- Shipping pricing disclaimer -->
<b>OUR SHIPPING POLICY IS:A subtotal $0 - $49.99 will be $2 shipping
    A subtotal $50 - $99.99 will be $5 shipping
    Subtotals over $100 will be charged 5% of the subtotal amount <b>
<br><br><br>

<!-- Footer -->
    <footer class="w3-center w3-container w3-theme-dark w3-padding-16">
      <h3>Your one stop shop for computer mice!</h3>
    </footer>

</body>

</html>`;
    // appends all strings into one variable
    var invoicestr = (str1 + str2 + str3 + str4 + str5 + str6 + str7 + str8 + str9 + str10 + str11 + str12 + str13 + str14 + str15 + str16 + str17 + str18 + str19 + str20 + str21 + str22 + str23 + str24 + str25 + str26 + str27 + str28);
    // returns html page
    return invoicestr;
}

// function to generate the edit user data page
function editingUser(the_username, qparams) {
    let str1 = `
            <!DOCTYPE html>
    <html>
    <head>
    <title>Editing User Information</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="https://www.w3schools.com/lib/w3-theme-black.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.min.css">
    </head>
    <body>
    
    
    
    <!-- Header -->
    <header class="w3-container w3-theme w3-padding" id="myHeader">
      <div class="w3-center">
          <h1 class="w3-xxxlarge w3-animate-bottom">Christopher's Mouse Store</h1>
      </div>
    </header>
    <br>
    <h1 class="w3-center">Editing your Account</h1>
    </div>
    
    <div class="w3-row-padding">
        `;
    let str2 = '<script> document.write(`';
    let str3 = `<body>
    <form class="w3-container" action="/changedinfo?${qparams}" method="POST">
      <h2>User Information Form</h2>
      <div class="w3-section">   
      <input type="hidden" name="quantityparam" value="${qparams}">
      <input type="hidden" name="originaluser" value="${the_username}">
        <input class="w3-input" type="text" name="username" value="${the_username}">
        <label for="username">Username</label>
        ${(typeof errors['no_username'] != 'undefined') ? errors['no_username'] : ''}
        ${(typeof errors['username_taken'] != 'undefined') ? errors['username_taken'] : ''}
      </div>
      <div class="w3-section">      
        <input class="w3-input" type="text" name="fullname" value="${users_reg_data[the_username].name}">
        <label for="fullname">Full Name</label>
        ${(typeof errors['no_fullname'] != 'undefined') ? errors['no_fullname'] : ''}
        ${(typeof errors['fullname_taken'] != 'undefined') ? errors['fullname_taken'] : ''}
      </div>
      <div class="w3-section">      
        <input class="w3-input" type="text" name="email" value="${users_reg_data[the_username].email}">
        <label for="email">Email</label>
        ${(typeof errors['fail_email'] != 'undefined') ? errors['fail_email'] : ''}
      </div>
      <div class="w3-section">
        <input class="w3-input" type="password" name="password">
        <label for="password">Password</label>
        ${(typeof errors['fail_password'] != 'undefined') ? errors['fail_password'] : ''}
      </div>
      <div class="w3-section">
        <input class="w3-input" type="password" name="passwordconfirm">
        <label for="passwordconfirm">Please enter password again</label>
        ${(typeof errors['password_mismatch'] != 'undefined') ? errors['password_mismatch'] : ''}
      </div>
      <button class="w3-button w3-theme" type="submit" value="regb">Edit Info</button>
      </div>
      <div class="w3-row"></div>
    </form>
    </body>`;
    let str4 = '`);</script>';
    let str5 = `

    </div>
    <br><br><br><br><br><br><br><br><br><br><br><br><br>

    <!-- Footer -->
    <footer class="w3-center w3-container w3-theme-dark w3-padding-16">
      <h3>Your one stop shop for computer mice!</h3>
    </footer>
    
    
    </body>
    </html>`;
    // appends all strings into one variable
    var editingStr = (str1 + str2 + str3 + str4 + str5);
    // returns html page
    return editingStr; 
}

// Routing 

// monitor all requests
// Code from Lab: Server Side Form Processing Exercise 2
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});

// processing products.js from initialized data 
// Code from Lab: Server Side Form Processing Exercise 4
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`; // initializes variable with products information
    response.send(products_str); // sends products data
});

// Creates login page
app.get("/login", function (request, response) {
    console.log(request.params.toString());
    let params = new URLSearchParams(request.query); // takes the params from product display page
    let str1 = `
            <!DOCTYPE html>
<html>
<head>
<title>Login</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
<link rel="stylesheet" href="https://www.w3schools.com/lib/w3-theme-black.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.min.css">
</head>
<body>



<!-- Header -->
<header class="w3-container w3-theme w3-padding" id="myHeader">
  <div class="w3-center">
      <h1 class="w3-xxxlarge w3-animate-bottom">Christopher's Mouse Store</h1>
  </div>
</header>
<br>
<h2 class="w3-center">Login to your account</h2>
</div>

<div class="w3-row-padding">

        `;
    let str2 = '<script>';
    let str3 = `
    `;
    let str4 = 'document.write(`';
    let str5 = `<body>
    <form class="w3-container" action="?${params.toString()}" method="POST">  
      <h2>Login Form</h2>
      <div class="w3-section">      
        <input class="w3-input" type="text" name="username">
        <label for="username">Username</label>
        ${(typeof loginerrors['no_username'] != 'undefined') ? loginerrors['no_username'] : ''}
      </div>
      <div class="w3-section">
        <input class="w3-input" type="password" name="password">
        <label for="password">Password</label>
        ${(typeof loginerrors['wrong_password'] != 'undefined') ? loginerrors['wrong_password'] : ''}
      </div>
      <button class="w3-button w3-theme" type="submit" value="loginb">Login</button>
      </div>
      <div class="w3-row"></div>
    </form>
    </body>`;
    let str6 = '`);</script>';
    let str7 = `
    </div>
    
    
    <br><br><br><br>
    <div id="regb" class="w3-center">
      <h2>Don't have an account?</h2>
      <p>Click <a href="./register?${params.toString()}
      ">here</a> to sign up!</p>
    </div>
    <br><br><br><br><br><br><br><br><br>
    
    
    <!-- Footer -->
    <footer class="w3-center w3-container w3-theme-dark w3-padding-16">
      <h3>Your one stop shop for computer mice!</h3>
    </footer>
    
    
    </body>
    </html>`;
    // Sends the html code to client
    response.send(str1 + str2 + str3 + str4 + str5 + str6 + str7);

});

// processes edited user info username
app.post("/edituserinfo", function (request, response) {
    console.log(request.body);
    console.log(request.query);
    // Process edituserinfo form POST and sent editingUser page if logged in, back to products display if not
    var the_username = request.body['username'].toLowerCase();
    var quanparams = request.body['quanparams'];
    if (typeof users_reg_data[the_username] != 'undefined') {
        response.send(editingUser(the_username, quanparams)); // generates edit user page if client clicks edit user button and is logged in
    } else {
        response.redirect('./products_display.html'); // redirects to display products if not logged in
    }
});

// processes confirmation order username and quantity array
app.post("/confirmorder", function (request, response) {
    var the_username = request.body['usernameConfirmOrder'].toLowerCase(); // initializes username
    var quantities = []; // initializes empty quantities array
    let params = new URLSearchParams(request.query);
    // Process confirmorder form POST and sent confirmorder page if logged in, back to products display if not
    if (typeof users_reg_data[the_username] != 'undefined') {
        for (let i = 0; i < products.length; i++) {
            quantities.push(params.get(`quantity${i}`)); // sets quantities purchasing array
        }
        for (let i = 0; i < products.length; i++) { 
            let quanAvil = products[i].quantity_available; // creates temp variable to store quantity available of product
            let minusQuan = quantities[i]; // creates temp variable of quantity purchasing for specific product
            products_data[i].quantity_available = (quanAvil - minusQuan); // minues purchased number of products from total amount available
            console.log(products_data[i].quantity_available);
            fs.writeFileSync(filenameOne, JSON.stringify(products_data)); // writes new quantity available to file
            console.log(products[i].quantity_available);
        }
        response.send(genConfirmOrder(the_username)); // prints out the order confirmation page
    } else {
        response.redirect('./products_display.html');
    }
});

// processes login information
app.post("/login", function (request, response) {
    console.log(request.body);
    console.log(request.query);
    const date = new Date().toLocaleString(); // creates variable of current time
    console.log(date);
    let params = new URLSearchParams(request.query); // stores quantity purchasing in a variable

    // Process login form POST and redirect to logged in page if ok, back to login page if not
    var the_username = request.body['username'].toLowerCase(); // stores username in the variable
    var the_password = request.body['password']; // stores password in the variable
    if (typeof users_reg_data[the_username] != 'undefined') {
        if (users_reg_data[the_username].password == the_password) {
            users_reg_data[the_username].pastlogin = users_reg_data[the_username].currentlogin; // stores past login date
            users_reg_data[the_username].currentlogin = date; // sets current login date
            let plustimeslogged = users_reg_data[the_username].timesloggedin; // creates variable for number of times logged in
            users_reg_data[the_username].timesloggedin = 1 + plustimeslogged; // adds 1 to number of times logged in
            fs.writeFileSync(filename, JSON.stringify(users_reg_data)); // writes new dates and logged in amounts to user data
            let pastlogininfo = users_reg_data[the_username].pastlogin; // initializes variable of past login info
            let passtimeslogged = users_reg_data[the_username].timesloggedin; // initializes variable: number of times logged in
            response.send(genInvoice(the_username, params, pastlogininfo, passtimeslogged)); // generates the invoice page while passing nessicary parameters
        } else {
            loginerrors['wrong_password'] = `Error: Wrong password!`; // sets the error message if wrong password
            response.redirect('./login?' + params.toString()); // redirects back to login page if unsuccessful
        }
        return;
    } else {
        loginerrors['no_username'] = `Error: "${the_username}" does not exist`; // sets the error message if there is no matching username
        response.redirect('./login?' + params.toString());
    }
});

// creates user registration page
app.get("/register", function (request, response) {
    let params = new URLSearchParams(request.query); // initializes variables with quantity parameters
    // Give a simple register form
    let str1 = `
            <!DOCTYPE html>
    <html>
    <head>
    <title>Registration</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="https://www.w3schools.com/lib/w3-theme-black.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.min.css">
    </head>
    <body>
    
    
    
    <!-- Header -->
    <header class="w3-container w3-theme w3-padding" id="myHeader">
      <div class="w3-center">
          <h1 class="w3-xxxlarge w3-animate-bottom">Christopher's Mouse Store</h1>
      </div>
    </header>
    <br>
    <h1 class="w3-center">Create your account</h1>
    </div>
    
    <div class="w3-row-padding">
        `;
    let str2 = '<script> document.write(`';
    let str3 = `<body>
    <form class="w3-container" action="?${params.toString()}" method="POST">
      <h2>Registration Form</h2>
      <div class="w3-section">      
        <input class="w3-input" type="text" name="username">
        <label for="username">Username</label>
        ${(typeof errors['no_username'] != 'undefined') ? errors['no_username'] : ''}
        ${(typeof errors['username_taken'] != 'undefined') ? errors['username_taken'] : ''}
      </div>
      <div class="w3-section">      
        <input class="w3-input" type="text" name="fullname">
        <label for="fullname">Full Name</label>
        ${(typeof errors['no_fullname'] != 'undefined') ? errors['no_fullname'] : ''}
        ${(typeof errors['fullname_taken'] != 'undefined') ? errors['fullname_taken'] : ''}
      </div>
      <div class="w3-section">      
        <input class="w3-input" type="text" name="email">
        <label for="email">Email</label>
        ${(typeof errors['fail_email'] != 'undefined') ? errors['fail_email'] : ''}
      </div>
      <div class="w3-section">
        <input class="w3-input" type="password" name="password">
        <label for="password">Password</label>
        ${(typeof errors['fail_password'] != 'undefined') ? errors['fail_password'] : ''}
      </div>
      <div class="w3-section">
        <input class="w3-input" type="password" name="passwordconfirm">
        <label for="passwordconfirm">Please enter password again</label>
        ${(typeof errors['password_mismatch'] != 'undefined') ? errors['password_mismatch'] : ''}
      </div>
      <button class="w3-button w3-theme" type="submit" value="regb">Register</button>
      </div>
      <div class="w3-row"></div>
    </form>
    </body>`;
    let str4 = '`);</script>';
    let str5 = `

    </div>
    <br><br><br><br><br><br><br><br><br><br><br><br><br>

    <!-- Footer -->
    <footer class="w3-center w3-container w3-theme-dark w3-padding-16">
      <h3>Your one stop shop for computer mice!</h3>
    </footer>
    
    
    </body>
    </html>`;
    response.send(str1 + str2 + str3 + str4 + str5); // sends user registration page

});

// processes registration information
app.post("/register", function (request, response) {
    console.log(request.body);
    console.log(request.query);
    username = request.body.username.toLowerCase(); // stores username in the variable
    let params = new URLSearchParams(request.query);
    const date = new Date().toLocaleString();
    // Process registration form POST and redirect to invoice if ok, back to registration page if not
    // check if username taken
    if (typeof users_reg_data[username] != 'undefined') {
        errors['username_taken'] = `Error: The username "${username}" is already registered!`;
    }
    // check if password is repeated correctly
    if (request.body.password != request.body.passwordconfirm) {
        errors['password_mismatch'] = `Error: Repeated password is not the same!`;
    }
    // checks if username textbox is empty
    if (request.body.username == '') {
        errors['no_username'] = `Error: You need to enter a username!`;
    }
    // checks if full name textbox is empty
    if (request.body.fullname == '') {
        errors['no_fullname'] = `Error: You need to enter a Full Name!`;
    }
    // checks if email passes the regex
    if (emailregex.test(request.body.email) == false) {
        errors['fail_email'] = `Error: Your entered email is not valid!`;
    }
    // checks if password passes the regex
    if (passwordregex.test(request.body.password) == false) {
        errors['fail_password'] = `Error: Your entered password is not valid!`;
    }
    // if no errors then the new user information is written to the user data file including, username, name, password, email, past and current login, and times logged in
    if (Object.keys(errors).length == 0) {
        users_reg_data[username] = {};
        users_reg_data[username].name = request.body.fullname;
        users_reg_data[username].password = request.body.password;
        users_reg_data[username].email = request.body.email;
        users_reg_data[username].pastlogin = date;
        users_reg_data[username].currentlogin = date;
        users_reg_data[username].timesloggedin = 1;
        fs.writeFileSync(filename, JSON.stringify(users_reg_data));
        let pastlogininfo = users_reg_data[username].pastlogin;
        let passtimeslogged = users_reg_data[username].timesloggedin;
        console.log("Saved: " + users_reg_data);
        response.send(genInvoice(username, params, pastlogininfo, passtimeslogged)); // sends user the generated invoice page
    } else {
        response.redirect("./register?" + params.toString()); // if an error is encountered then the user is sent back to the registration page

    }
});

// processes user editing login information
app.post("/changedinfo", function (request, response) {
    console.log(request.body);
    console.log(request.query);
    username = request.body.username.toLowerCase();
    let params = new URLSearchParams(request.query);
    var quanparams = request.body['quantityparam'];
    var originuser = request.body['originaluser'];
    const date = new Date().toLocaleString();
    // Process registration form POST and redirect to invoice if ok, back to user editing information page if not
    // check is username taken
    if (request.body.password != request.body.passwordconfirm) {
        errors['password_mismatch'] = `Error: Repeated password is not the same!`;
    }
    // checks if username textbox is empty
    if (request.body.username == '') {
        errors['no_username'] = `Error: You need to enter a username!`;
    }
    // checks if full name textbox is empty
    if (request.body.fullname == '') {
        errors['no_fullname'] = `Error: You need to enter a Full Name!`;
    }
    // checks if email passes the regex
    if (emailregex.test(request.body.email) == false) {
        errors['fail_email'] = `Error: Your entered email is not valid!`;
    }
    // checks if password passes the regex
    if (passwordregex.test(request.body.password) == false) {
        errors['fail_password'] = `Error: Your entered password is not valid!`;
    }
    // if no errors then the new user information is written to the user data file including, username, name, password, email, past and current login, and times logged in
    if (Object.keys(errors).length == 0) {
        delete users_reg_data[originuser];
        users_reg_data[username] = {};
        users_reg_data[username].name = request.body.fullname;
        users_reg_data[username].password = request.body.password;
        users_reg_data[username].email = request.body.email;
        users_reg_data[username].pastlogin = date;
        users_reg_data[username].currentlogin = date;
        users_reg_data[username].timesloggedin = 1;
        fs.writeFileSync(filename, JSON.stringify(users_reg_data));
        let pastlogininfo = users_reg_data[username].pastlogin;
        let passtimeslogged = users_reg_data[username].timesloggedin;
        console.log("Saved: " + users_reg_data);
        response.send(genInvoice(username, quanparams, pastlogininfo, passtimeslogged)); // sends user the generated invoice page
    } else {
        response.redirect("./register?" + params.toString()); // if an error is encountered then the user is sent back to the edit info page

    }
});

// processing data dalidation for invoice
// Code adapted from ITM 352 Github Repo: info_server_Ex2c.js
app.post('/purchase', function (request, response, next) {
    console.log(request.body);
    let params = new URLSearchParams(request.body);
    var q; // initialize quantity object
    var qa = []; // initialize quantities array
    var has_quantities = false; // assumes there are no quantities entered
    // checks for empty quantity desired text field
    for (let i in products) {
        q = request.body['quantity' + i]; // requests quantity desired value and assigns to object
        if (typeof q != 'undefined') {
            console.log(q);
            has_quantities = has_quantities || (q > 0);
        }
    }
    // if there are quantities then checks are ran
    if (has_quantities == true) {
        // initializes quantities array
        for (let i in products) {
            qa.push(request.body['quantity' + i]);
            // checks if quantity is a non-number/negative number/ or non-integer
            if (isNonNegInt(qa[i]) == false) {
                // if check fails then user will be stay on the products display with an error message of the invalid value
                response.redirect("./products_display.html?" + querystring.stringify(request.body) + `&error=Your entered value for ${products[i].name} is ${errors.join(" ")}`);
            }
            // checks if attempted quantity to purchase is above the inventory availability of the product
            if (isAboveQuantity(qa[i], products[i].quantity_available) == false) {
                // if check fails then user will be stay on the products display with an error message of the invalid value
                response.redirect("./products_display.html?" + querystring.stringify(request.body) + `&error=The quantity for ${products[i].name} exceeds ${quanerror}`);
            }
        }
        // if all checks pass then the valid data is passed on to the invoice page
        response.redirect('./login?' + params.toString());
    } else {
        // if there are no quantities entered then the user will be prompted with an error to enter values
        response.redirect("./products_display.html?" + querystring.stringify(request.body) + `&error=You need to enter quantity values!`);
    }
});


// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));