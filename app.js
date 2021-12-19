const http = require("http");
const url = require("url");
var crypto = require("crypto");
const express = require('express');
const app = express();
const port = 3000;
const session = require('express-session');
const bodyParser = require('body-parser');
const queries = require("./queries");
const triggers = require("./triggers");
/* const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'bookstore',
    password: 'COMP3005',
    port: 5432,
});

client.connect(); */

app.use(bodyParser.json());

const { Pool, Client } = require('pg')
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
//    host: '192.168.0.71',
    database: 'bookstore',
    password: 'COMP3005',
    port: 5432,
});

// create a listener
//triggers.bookStockChangeTrigger(pool);
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack)
    }
    // Listen for all pg_notify channel messages
    console.log("Listen for all pg_notify channel messages");
    //client.on('bookStockChangeEvent', function(msg) {
    client.on('notification', function(msg) {
        let payload = JSON.parse(msg.payload);
        console.log("#####book stock channel:", msg.channel);
        console.log("#####book stock changed:", payload);
        //dbEventEmitter.emit(msg.channel, payload);
    });
    // Designate which channels we are listening on. 
    // Add additional channels with multiple lines.
    var query = client.query('LISTEN bookStockChangeEvent');
});

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');

//get
app.get('/', (req, res) => {
	res.render('index', {"prompt": "Welcome to Look Inna Book Bookstore!"});
});

app.get('/index', (req, res) => {
	res.render('index', {"prompt": "Look Inna Book Bookstore: User Login"});
});

app.get('/logout', (req, res) => {
	res.render('index', {"prompt": "Look Inna Book Bookstore: User Login"});
});
app.get('/admin_login', (req, res) => {
	res.render('admin_login', {"prompt": "Look Inna Book Bookstore: Admin"});
});

app.get('/signup', (req, res) => {
	res.render('signup', {"prompt":"Please create an account:"});
});

app.get('/admin_signup', (req, res) => {
	res.render('admin_signup', {"prompt":"Please create an admin account:"});
});

app.get('/admin_dashboard', (req, res) => {
	res.render('admin_dashboard', {"prompt": "Look Inna Book Bookstore: Admin", "rowCount": -1, "rows":[]});
});

app.get('/addPublisher', (req, res) => {
	res.render('add_publisher', {"prompt":"Please fill out:"});
});

app.get('/addBook', (req, res) => {
	res.render('add_book', {"prompt":"Please fill out:"});
});

app.get('/search', (req, res) => {
	res.render('search', {"prompt":"Enter a query:",});
});

app.get('/deleteBookInBasket', async (req, res) => {
	//res.render('search', {"prompt":"Enter a query:",});
    console.log("/deleteBookInBasket: ", session.order_number);
    var order_number = session.order_number;
    var queryObject = url.parse(req.url, true).query;
    var ISBN = queryObject.ISBN;
    await queries.deleteBookInBasket(req, res, pool, ISBN, order_number);
    let results;
    results = await queries.getOrderItems(pool, session.order_number);
    console.log("order items: rowCount: ", results.rowCount);
    res.render('user_dashboard', {"prompt": "Order items: ", "rowCount": results.rowCount, "rows": results.rows});    
});

app.get('/user_dashboard', async (req, res) => {
    //display books in basket
    let results;
    if (session.order_number != "") {
        results = await queries.getOrderItems(pool, session.order_number);
        console.log("order items: rowCount: ", results.rowCount);
        res.render('user_dashboard', {"prompt": "Order items: ", "rowCount": results.rowCount, "rows": results.rows});
    } else {
        res.render('user_dashboard', {"prompt": "Order items: ", "rowCount": 0, "rows": []});
    }
});

app.get('/viewBook', async (req, res) => {
    var queryObject = url.parse(req.url, true).query;
	var ISBN = queryObject.ISBN;
	console.log("Book ISBN: " + ISBN);
    let results;
    results = await queries.viewBook(pool, ISBN);
    if (results.rowCount == 1)
    {
      console.log("rowCount: ", results.rowCount);
      console.log("rows: ", results.rows);
      // store viewed book in session im case it wil be ordered
      session.title = results.rows[0].title;
      session.quantity = results.rows[0].quantity;
      session.isbn = results.rows[0].isbn;
      session.price = results.rows[0].price;
      res.render('view_book', {"prompt": "Search results:", "rowCount": results.rowCount, "rows": results.rows});
    }
});

app.get('/viewReports', async (req, res) => {
    console.log("/viewReports");
    await queries.displayReport(pool, session);
    console.log("payment: ", session.paymentAmount);
    res.render('view_reports', {"rowCountByAuthor": session.rowCountByAuthor, 
                                "salesByAuthor":  session.salesByAuthor,
                                "rowCountByGenre": session.rowCountByGenre,
                                "salesByGenre": session.salesByGenre,
                                "profit": session.profit,
                                "totalSales": session.paymentAmount.totalsales,
                                "totalPayment": session.paymentAmount.totalpayment
                            });
});

app.get('/removeBook', (req, res) => {
    res.render('delete_book', {"prompt":"Search below:",});
});

app.get('/deleteBook', async (req, res) => {
    await queries.deleteBook(req, res, pool);
    res.render('delete_book', {"prompt":"Book deleted:",});
});

app.get('/viewPastOrders', async (req, res) => {
    let results = await queries.searchPastOrders(pool, session);
    res.render('view_pastorders', {"prompt":"View past order",
        "rowCount":results.rowCount, "rows":results.rows});
});

function getDashboardLink(session) {
    if (session.acct_type == 'admin') {
        return "/admin_dashboard";
    }
    else {
        return "/user_dashboard";
    }
}
app.get('/searchByOrderNumber', async (req, res) => {
    res.render('search_by_order_number', {"prompt":"Search by order number",
        "rowCount":-1, "rows":[], "dashboard": getDashboardLink(session)});
});

app.get('/searchByTrackingNumber', async (req, res) => {
    res.render('search_by_tracking_number', {"prompt":"Search by tracking number",
        "rowCount":-1, "rows":[], "dashboard": getDashboardLink(session)});
});

app.get('/addToBasket', async (req, res) => {
    //queries.addToBasket(req, res, pool, session);
    var order_number = await queries.findPendingOrder(session, pool);
    if (order_number == undefined) {
      console.log("New order created.");
      var order = await queries.createNewOrder(session, pool);
      order_number = order.order_number;
      console.log("order_number:", order_number);
    }
    session.order_number = order_number;
  
    if (session.isbn != "") {
      let bookExists = await queries.checkBook(session, pool);
      if (bookExists == 0) {
        console.log("add to basket order_number: ", order_number);
        // add book to order-item
       await queries.addBookToBasket(session, pool);
      }
    }
  
    //display books in basket
    let results;
    results = await queries.getOrderItems(pool, session.order_number);
    console.log("order items: rowCount: ", results.rowCount);
    //console.log("rows: ", results.rows);
    res.render('user_dashboard', {"prompt": "Order items: ", "rowCount": results.rowCount, "rows": results.rows});    
});

// app.get('/checkout', (req, res) => {
// 	res.render('checkout', {"prompt":"Please make sure your payment information is up to date",});
// });

//post
app.post('/create_acct', (req, res) =>{
    console.log("New account created.");
    queries.createUser(req, res, pool);
});

app.post('/create_admin', (req, res) =>{
    console.log("New admin created.");
    queries.createAdmin(req, res, pool);
});

app.post('/user_dashboard', async (req, res) => {
    let results = await queries.userLogin(req, res, pool, session);
    if (results.rowCount == 1) {
        console.log("User is logged in: results.rows[0]" , results.rows[0]);
        session.user_uuid = results.rows[0].user_uuid;
        session.email_address = results.rows[0].email_address;
        session.fullName = results.rows[0].fullname;
        session.acct_type = results.rows[0].acct_type;
        session.billing_address = results.rows[0].billing_address;
        session.billing_postal_code = results.rows[0].billing_postal_code;
        session.billing_city = results.rows[0].billing_city;
        session.billing_prov = results.rows[0].billing_prov;
        session.phone_number = results.rows[0].phone_number;
        session.creditcard_type = results.rows[0].creditcard_type;
        session.creditcard_number = results.rows[0].creditcard_number;
        console.log("user ID: ", session.user_uuid);

        if (session.acct_type == 'regular') {
            var order_number = await queries.findPendingOrder(session, pool);
            if (order_number != undefined) {
              session.order_number = order_number;
              orderItems = await queries.getOrderItems(pool, session.order_number);
              console.log("order items: rowCount: ", orderItems.rowCount);
              console.log("rows: ", orderItems.rows);
              res.render('user_dashboard', {"prompt": "Welcome to Look Inna Book Bookstore!", "rowCount": orderItems.rowCount, "rows": orderItems.rows});            }
            else {
                session.order_number = "";
                res.render('user_dashboard', {"prompt": "Welcome to Look Inna Book Bookstore!", "rowCount": -1, "rows": []});
            }
        }
        else {
            res.render('admin_dashboard', 
              {"prompt": "Welcome to Look Inna Book Bookstore!", "rowCount": -1, "rows":[]});
        }
    }
    else {
        console.log("Invalid username or password");
        res.render('index', {"prompt": "Incorrect email or password. Please try again."});
    }  
});

app.post('/addPublisher', (req, res) => {
    console.log("Add a publisher");
    queries.addPublisher(req, res, pool);
    //console.log("Publisher added: ", publisher_name);
    //res.render('add_publisher', {"prompt": "Publisher added. Add another or return to home."});
});

app.post('/addBook', async (req, res) => {
    console.log("Add a book");
    await queries.addBookInDb(req, res, pool);
});

app.post('/searchBook', async (req, res) => {
    console.log("Find a book");
    let results = await queries.searchBook(req, res, pool);
    console.log("rowCount: ", results.rowCount);
    console.log("rows: ", results.rows);
    res.render('search_results', {"prompt": "Search results:", "rowCount": results.rowCount, "rows": results.rows});
});

//adminSearchBook
app.post('/adminSearchBook', async (req, res) => {
    console.log("Find a book");
    let results = await queries.searchBook(req, res, pool);
    console.log("rowCount: ", results.rowCount);
    console.log("rows: ", results.rows);
    res.render('admin_dashboard', {"prompt": "Search results:", "rowCount": results.rowCount, "rows": results.rows});
});

app.post('/searchForDelete', async (req, res) => {
    console.log("Find a book to delete");
    let results = await queries.searchForDeleteBook(req, res, pool);
    res.render('delete_book', {"prompt": "Search results:", "rowCount": results.rowCount, "rows": results.rows});
});

app.post('/checkout', async (req, res) => {
    console.log("/checkout");
    orderItems = await queries.getOrderItems(pool, session.order_number);
    console.log("body: ", req.body);
    //get order quantity per item and subtotal
    var total = 0;
    session.orderItems = [];
    session.numberOfItems = 0;
    for (var i = 0; i < orderItems.rowCount; i++) {
       orderItems.rows[i].quantity = req.body[orderItems.rows[i].isbn];
       console.log("ISBN:", orderItems.rows[i].isbn);
       console.log("quantity:", orderItems.rows[i].quantity);
       console.log("row: ", orderItems.rows[i]);
       if (orderItems.rows[i].quantity <= 0) {
         orderItems.rows[i].quantity = 0;
         orderItems.rows[i].subtotal = 0;
         await queries.deleteBookInBasket(req, res, pool, orderItems.rows[i].isbn, orderItems.rows[i].order_number);
       }
       else {
         await queries.updateOrderItemQuantity(pool, orderItems.rows[i]);
         orderItems.rows[i].subtotal = orderItems.rows[i].quantity * orderItems.rows[i].price;
         total += orderItems.rows[i].subtotal;
         session.orderItems.push(orderItems.rows[i]);
         session.numberOfItems++;
       }
    }
    session.total = total;
    //await queries.getOrderItems(pool, session.order_number);
    res.render('checkout',{"prompt": "Please make sure your payment information is up to date",
               "total": total, "orderNumber":session.order_number,
               "rowCount": session.numberOfItems, "rows": session.orderItems})
    //"total": total, "rowCount": orderItems.rowCount, "rows": orderItems.rows})
});

app.post('/checkoutShipping', async (req, res) => {
    console.log("/checkoutShipping: fullName", session.fullName);
    // generate a tracking number
    session.tracking_number = crypto.randomBytes(6).toString('hex');
    res.render('checkout_shipping', {"prompt": "Make sure this information is up to date",
            "total": session.total,
            "fullName": session.fullName,
            "email_address": session.email_address,
            "billing_address": session.billing_address,
            "billing_postal_code": session.billing_postal_code,
            "billing_city": session.billing_city,
            "billing_prov": session.billing_prov,
            "phone_number": session.phone_number,
            "creditcard_number": session.creditcard_number,
            "creditcard_type": session.creditcard_type,
            "order_number": session.order_number,
            "tracking_number": session.tracking_number});
});

app.post('/updateShippingAddressCompleteOrder', async (req, res) => {
    console.log("/updateShippingAddressCompleteOrder");
    session.shipping_name = req.body.fullName;
    session.shipping_address = req.body.address;
    session.shipping_postal_code = req.body.postalCode;
    session.shipping_city = req.body.city;
    session.shipping_prov = req.body.province;
    session.tracking_number = req.body.trackingNumber;
    console.log("shipping_name: ", session.shipping_name);
    console.log("shipping_postal_code: ", session.shipping_postal_code);
    if (session.shipping_name == "" || session.shipping_address == "" || session.shipping_postal_code =="" ||
        session.shipping_city == "" || session.shipping_prov == "" || session.tracking_number == "") {
            res.render('checkout_shipping', {"prompt": "Shipping info is incomplete!",
            "total": session.total,
            "fullName": session.fullName,
            "email_address": session.email_address,
            "billing_address": session.billing_address,
            "billing_postal_code": session.billing_postal_code,
            "billing_city": session.billing_city,
            "billing_prov": session.billing_prov,
            "phone_number": session.phone_number,
            "creditcard_number": session.creditcard_number,
            "creditcard_type": session.creditcard_type,
            "order_number": session.order_number,
            "tracking_number": session.tracking_number});
        return;
    }
    try {
      let results = await queries.updateOrderInfo(req, res, pool, session);
    }
    catch (error) {
        res.render('checkout_shipping', {"prompt": "Shipping info is incomplete! " + error,
        "total": session.total,
        "fullName": session.fullName,
        "email_address": session.email_address,
        "billing_address": session.billing_address,
        "billing_postal_code": session.billing_postal_code,
        "billing_city": session.billing_city,
        "billing_prov": session.billing_prov,
        "phone_number": session.phone_number,
        "creditcard_number": session.creditcard_number,
        "creditcard_type": session.creditcard_type,
        "order_number": session.order_number,
        "tracking_number": session.tracking_number});
        return;
    }

    // update book stock and pay publishers
    //console.log("Order Items updateBookStock:" , session.orderItems);
    for (var i = 0; i < session.numberOfItems; i++) {
        await queries.updateBookStock(pool, session.orderItems[i].isbn, session.orderItems[i].quantity);
        await queries.payPublisher(pool, session.order_number, session.orderItems[i].isbn,
              session.orderItems[i].quantity,
              session.orderItems[i].price,
              session.orderItems[i].publisher_name,
              session.orderItems[i].payment_percent);
    }

    //reset session
    session.numberOfItems = 0;
    session.orderItems = [];
    session.rows = [];
    session.rowCount = 0;
    session.order_number = "";
    console.log("/updateShippingAddressCompleteOrder completed");
    res.render('checkout_complete', {"prompt": "Thank you for your order",});
});

app.post('/searchByOrderNumber', async (req, res) => {
    var order_number = req.body.order_number;
    let results;
    results = await queries.getOrderItems(pool, order_number);
    res.render('search_by_order_number', {"prompt":"Search by order number",
        "order_number": order_number, "dashboard": getDashboardLink(session),
        "rowCount":results.rowCount, "rows":results.rows});
});

app.post('/searchByTrackingNumber', async (req, res) => {
    var tracking_number = req.body.tracking_number;
    console.log("/searchByTrackingNumbe=", tracking_number)
    let results = await queries.searchByTrackingNumber(pool, tracking_number);
    res.render('search_by_tracking_number', {"prompt":"Search by tracking number",
       "tracking_number": tracking_number, "dashboard": getDashboardLink(session),
       "rowCount":results.rowCount, "rows":results.rows});
});


//Start server
app.listen(3000, () => {
	console.log("Server listening at http://localhost:3000");
});

/* client.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  client.end()
}) */