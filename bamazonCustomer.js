const mysql = require("mysql")
const inquirer = require("inquirer")

// create the connection information for the sql database
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "01051992",
    database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err
        // run the displayInventory function after the connection is made to prompt the user
    displayInventory()
});

let displayInventory = () => {
    //console.log("SQL Connection Established")
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err
        for (let i = 0; i < res.length; i++) {
            console.log(" - - - - - - - - - - - - - - - ")
            console.log("item number: " + res[i].itemid)
            console.log("item: " + res[i].productname)
            console.log("price: $" + res[i].price)
        }
        purchase()
    })
};

// validateInput makes sure that the user is supplying only positive integers for their inputs
let validateInput = (value) => {
    var integer = Number.isInteger(parseFloat(value))
    var sign = Math.sign(value)

    if (integer && (sign === 1)) {
        return true;
    } else {
        return 'Please enter a whole non-zero number.'
    }
}

// purchase function to prompt the customer for an item to purchase
let purchase = () => {
    inquirer.prompt([{
                type: "input",
                name: "itemid",
                message: "Select the item you would like to purchase by item number.",
                validate: validateInput,
                filter: Number
            },
            {
                type: "input",
                name: "quantity",
                message: "How many of this item would you like to purchase?",
                validate: validateInput,
                filter: Number
            }
        ])
        .then(function(purchase) {
            let item = purchase.itemid
            let quantity = purchase.quantity

            let queryStr = 'SELECT * FROM products WHERE ?';

            connection.query(queryStr, { itemid: item }, function(err, res) {
                if (err) throw err

                if (res.length === 0) {
                    console.log("ERROR: Invalid Item ID. Please select a valid Item ID.")
                    displayInventory()
                } else {

                    // set the results to the variable of productInfo
                    let productInfo = res[0]

                    if (quantity <= productInfo.stockquantity) {
                        console.log(productInfo.productname + "is in stock! Placing order now!")
                        console.log("\n")

                        // the updating query string
                        var updateQueryStr = "UPDATE products SET stockquantity = " + (productInfo.stockquantity - quantity) + " WHERE itemid = " + item
                            // console.log('updateQueryStr = ' + updateQueryStr);

                        // Update the inventory
                        connection.query(updateQueryStr, function(err, data) {
                            if (err) throw err;

                            console.log("Your order has been placed!");
                            console.log("Your total is $" + productInfo.price * quantity)
                            console.log("Thank you for shopping with bamazon!")
                            console.log(" - - - - - - - - - - - - - - - ")
                            console.log("To shop again with us please input 'node bamazonCustomer.js' into your command line again.")
                            console.log("\n")

                            // End the database connection and close the app
                            connection.end();
                        })
                    } else {
                        console.log("Sorry, there is not enough " + productInfo.productname + " in stock.")
                        console.log("Your order can not be placed as is.")
                        console.log("Please modify your order or select another item.")
                        console.log("\n")

                        // After 3 seconds display the inventory again so that the customer can make a new selcetion.
                        setTimeout(function() { displayInventory() }, 3000)
                    }


                }
            })


        })
}