// Made by: Pua Kelliher on 10/19/2022
// Updated by: Pua Kelliher on 11/13/2022
// This is file is the server that the website will be running on

// Vaiables for server
var express = require('express');
var app = express();

// Enable the use of file I/O
var fs = require('fs');

// Load products to server memory
var products_array = require(__dirname + '/products_data.json');

app.get("/products_data.json", function (request, response, next) {
    response.type('.js');
    var products_str = `var products_array = ${JSON.stringify(products_array)};`;
    response.send(products_str);
});

// Get user data and save it to a variable
var users_file = __dirname + '/user_data.json';

// Keep check out info in a file until ready to use in the invoice page
var current_user_quantities = {};
var current_edit;

// If the files exists, we will read the file, load it to our variable, and parse it
if (fs.existsSync(users_file)) {
    var users = fs.readFileSync(users_file, 'utf-8');
    var users_reg_data = JSON.parse(users);
}

// Enable quantities and errors to show on query string
const querystring = require('node:querystring');

// Monitor all requests
app.all('*', function (request, response, next) {
    next();
});

// Function used to show errors (from Lab 12)
function isNonNegInt(q, returnErrors = false) {

    // Assume no errors at first
    let errors = [];

    // If the user doesn't put anything into the quantity textbox, they dont want that item
    if (q == '') q = 0;

    // Check if string is a number value
    if (Number(q) != q) errors.push('Not a number!');

    // If the quantity is a number, check if its a negative value or an integer
    else {

        // Check if it is non-negative number
        if (q < 0) errors.push('Negative value!');

        // Check that it is an integer
        if (parseInt(q) != q) errors.push('Not an integer!');

    }

    // If the above statements are true (there are errors), put errors into the errors array. If there are no errors, leave the array empty.
    return returnErrors ? errors : (errors.length == 0);

}

// Get the query string by returning middleware and accessing the body of the page
app.use(express.urlencoded({ extended: true }));

// Process purchase request (validate quantities, check quantity available)
app.post('/purchase', function (request, response, next) {

    // Enable quantities to show in query string
    var q;
    var has_quantities = false;
    var errors = {};
    for (let i in products_array) {

        // Get the entered quantities from the textboxes
        q = request.body['quantity' + i];

        // Check if the textbox has a quantity in it
        if (typeof q != 'undefined') {
            if (q > 0) {
                has_quantities = true;
            }

            // Check if the quantity is valid
            if (isNonNegInt(q, false) == false) {
                errors['quantity_error' + i] = isNonNegInt(q, true);
            }

            // Check if the quantity is not greater than what is available
            if (q > products_array[i].quantity_available) {
                errors['not_enough_items' + i] = ("We don't have enough items! Please select a smaller quantity!");
            }
        }
    }

    // Show an error if no quantities are selected
    if (has_quantities == false) {
        errors['no_selections_error'] = "You need to select some items!";
    }

    // Update the inventory and redirect the page to sign in
    if (Object.keys(errors).length == 0) {
        // Save current users quantities
        current_user_quantities = request.body;
        response.redirect("./sign_in.html");
    }

    // If there are errors, stay on products_display page
    else {
        response.redirect("./products_display.html?" + querystring.stringify(request.body) + '&' + querystring.stringify({ "errors_obj_JSON": JSON.stringify(errors) }));
    }

}

);

// Process login form POST and redirect to invoice page if ok, back to login page if not
app.post("/login", function (request, response) {
    // Check if email exists
    var email_entered = request.body['email'];
    var password_entered = request.body['password'];

    // Clear current_edit
    current_edit = undefined;

    // Default for saved email info will be in lowercase for easier search (email addresses are case insensitive since they will all be converted to lower case)
    var email = email_entered.toLowerCase();

    // Start with no errors
    var error = false;

    // Place to store errors
    var error_message = {};

    // Check if email entered exists in database
    if (typeof users_reg_data[email] != 'undefined') {
    } else {
        error_message['no_such_email'] = `${email_entered} does not exist!`;
        error = true;
    }

    // Check if password entered matches saved password
    if (password_entered == users_reg_data[email].password) {
    } else {
        error_message['wrong_psw'] = 'Incorrect password!';
        error = true;
    }

    if (!error) {
        // Save user info if editing
        user = {};
        user['email'] = `${email}`;

        // Update inventory with purchase amount
        for (let i in products_array) {
            q = current_user_quantities['quantity' + i];
            if (q > 0) {
                products_array[i].quantity_available -= Number(q);
            }
        }

        // Update times logged in
        users_reg_data[email].times_logged_in += 1;
        fs.writeFileSync(users_file, JSON.stringify(users_reg_data));

        // If editing registration, go to the regestration page with the user data, otherwise go to invoice
        if (typeof request.body['edit_reg_button'] != 'undefined') {
            // Delete old user data, then go to registration
            let user_reg_data = users_reg_data[email];
            user_reg_data['user'] = email;
            delete user_reg_data.password;
            current_edit = email;
            response.redirect('./register.html?' + querystring.stringify(user_reg_data));
        } else {
            // If no errors, go to invoice
            response.redirect(`./invoice.html?` + `email_info=${email_entered}&name_info=${users_reg_data[email].name}&times_logged_in_info=${users_reg_data[email].times_logged_in}` + '&' + querystring.stringify(current_user_quantities));
        }
    } else {
        // If there are errors, stay on page and show them
        response.redirect(`./sign_in.html?` + querystring.stringify({ "errors_obj_JSON": JSON.stringify(error_message) }));
    }
});

// Process registration form to save info from new user based on given info
app.post("/register", function (request, response) {
    // Get user info from page
    var email_entered = request.body.email;
    var name_entered = request.body.name;
    var password_entered = request.body.password;


    // Default for saved email and name info will be in lowercase for easier search (email addresses and names are case insensitive, thus will be converted to lower case)
    var email = email_entered.toLowerCase();
    var name = name_entered.toLowerCase();

    // Start with no errors
    var error = false;

    // Place to store errors
    var error_message = {};

    // Used https://regexr.com/ to check and modify regular expressions
    var name_regex = name_entered.match(/[a-z\s]+[a-z]+/i);
    var password_regex = password_entered.match(/[^\s]+/);

    // Regular expression to check validity of email (credit to: Lazar Ristic at https://stackabuse.com/validate-email-addresses-with-regular-expressions-in-javascript/
    var email_regex = email_entered.match(/[a-z0-9_.]+@[a-z.]+\.[a-z]{2,3}/i);

    // Check if the name entered is valid
    if (name_entered != name_regex) {
        error_message['invalid_name'] = "Invalid name! Insert your full name! (space between first and last) (i.e. John Doe)";
        error = true;
    }

    // Check if the email entered is valid
    if (email_entered != email_regex) {
        error_message['invalid_email'] = "Invalid email! Insert acceptable email! (i.e. john_doe@email.com)";
        error = true;
    }

    // Check if email already exists (make an exception for users editing their registration)
    if (typeof users_reg_data[email_entered] == 'undefined' || email == current_edit) {
        // No error
    } else {
        error_message['email_exists'] = "Email already exists! Go to sign-in page if you already have an account!";
        error = true;
    }

    // Check if password is valid
    if (password_entered != password_regex) {
        error_message['invalid_password'] = "Password is invalid! Insert acceptable password!";
        error = true;
    }

    // Check if both passwords entered match
    if (password_entered != request.body.repeat_password) {
        error_message['psws_dont_match'] = "Passwords don't match! (case sensitive)";
        error = true;
    }

    if (!error) {
        // Delete old user info
        if (typeof current_edit != "undefined") {
            delete users_reg_data[current_edit];
        }
        // Add new user or updated info to users_reg_data
        users_reg_data[email] = {};
        users_reg_data[email].name = name;
        users_reg_data[email].password = password_entered;
        users_reg_data[email].times_logged_in = 0;

        // Update inventory with purchase amount
        for (let i in products_array) {
            q = current_user_quantities['quantity' + i];
            if (q > 0) {
                products_array[i].quantity_available -= Number(q);
            }
        }

        // Save user info and update times logged in
        users_reg_data[email].times_logged_in += 1;
        fs.writeFileSync(users_file, JSON.stringify(users_reg_data));

        user = {};
        user['email'] = `${email}`
        user['name'] = `${name_entered}`
        response.redirect(`./invoice.html?` + `email_info=${email_entered}&name_info=${name_entered}&times_logged_in_info=${users_reg_data[email].times_logged_in}` + '&' + querystring.stringify(current_user_quantities) + '&' + querystring.stringify(user));
    } else {
        response.redirect(`./register.html?` + querystring.stringify({ "errors_obj_JSON": JSON.stringify(error_message) }));
    }
});

// Route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// Start the server
app.listen(8080, () => console.log(`listening on port 8080`));