/*
 * DB queries
 */
const { response } = require("express");
const url = require("url");

const createUser = (req, res, pool) => {
  var email_addr = req.body.email;
  var fullName = req.body.fullName;
  var phoneNumber = req.body.phoneNumber;
  var address = req.body.address;
  var postalCode = req.body.postalCode;
  var city = req.body.city;
  var province = req.body.province;
  var password = req.body.password;
  var creditcardNumber = req.body.creditcardNumber;
  console.log("username: ", email_addr);
  console.log("phoneNumber: ", phoneNumber);
  pool.query('INSERT INTO user_acct (email_address,fullName, acct_type, password, billing_address, ' +
             'billing_postal_code, billing_city, billing_prov, phone_number, creditcard_type, creditcard_number) ' +
             'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
              [email_addr, fullName, "regular",password, address, postalCode, city, province,
               phoneNumber, "MasterCard", creditcardNumber], (error, results) => {
      if (error) {
        console.log("Error:" + error);
        res.render('signup', {"prompt": "Account with this email address already exists"});
      }
      else {
          res.render('acct_created', {"prompt": "New account created"});
      }
    })
};

const createAdmin = (req, res, pool) => {
    var email_addr = req.body.email;
    var fullName = req.body.fullName;
    var phoneNumber = req.body.phoneNumber;
    var address = req.body.address;
    var postalCode = req.body.postalCode;
    var city = req.body.city;
    var province = req.body.province;
    var password = req.body.password;
    console.log("username: ", email_addr);
    console.log("phoneNumber: ", phoneNumber);
    pool.query('INSERT INTO user_acct (email_address,fullName, acct_type, password, billing_address, billing_postal_code, billing_city, billing_prov, phone_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [email_addr, fullName, "admin",password, address, postalCode, city, province, phoneNumber,], (error, results) => {
        if (error) {
          console.log("Error:" + error);
          res.render('signup', {"prompt": "Account with this email address already exists" + error});
        }
        else {
            res.render('acct_created', {"prompt": "New admin account created"});
        }
      });   
};

const userLogin = async (req, res, pool, session) => {
  var email_addr = req.body.email;
  var password = req.body.password;
  console.log("/user_dashboard: login check, email: ", email_addr);
  console.log("password:", password);
  try {
    results = await pool.query('SELECT user_uuid, email_address, fullName, acct_type, billing_address, billing_postal_code, billing_city, ' +
                              'billing_prov, phone_number, creditcard_type, creditcard_number FROM user_acct ' +
                              'WHERE email_address = $1 AND password = $2', [email_addr, password]);
  } catch (error) {
     throw error;
  } 
  return results;
};

const addPublisher = (req, res, pool) => {
  var publisher_name = req.body.name;
  var publisher_address = req.body.address;
  var email_address = req.body.emailAddress;
  var phone_number = req.body.phoneNumber;
  var bank_deposit_number = req.body.depositNumber;
  console.log("Publisher added: ", publisher_name);
  pool.query('INSERT INTO publisher (publisher_name, publisher_address, email_address, phone_number, bank_deposit_number) VALUES ($1, $2, $3, $4, $5)', [publisher_name, publisher_address, email_address, phone_number, bank_deposit_number], (error, results) => {
      if (error) {
        console.log("Error:" + error);
        res.render('add_publisher', {"prompt": error});
      }
      else {
          res.render('add_publisher', {"prompt": "Publisher added. Add another or return to home."});
      }
    })
}

const addBookInDb = async (req, res, pool) => {
  var title = req.body.title;
  var ISBN = req.body.ISBN;
  var author = req.body.author;
  var genre = req.body.genre;
  var price = req.body.price;
  var page_count = req.body.pageCount;
  var publication_date = req.body.publicationDate;
  var quantity = req.body.quantity;
  var publisher_name = req.body.publisherName;
  var payment_percent = req.body.paymentPercent;
  console.log("Book added: ", title);
  let results;
  // check if book has been in store
  
  try {
    results = await pool.query('INSERT INTO book (title, ISBN, author, genre, price, page_count, publication_date, ' + 
             'stock, publisher_name, payment_percent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [title, ISBN, author, genre, price, page_count, publication_date, quantity,
         publisher_name, payment_percent]);
  } catch (error) {
      console.log("Error:" + error);
      res.render('add_book', {"prompt": "Error: " + error});
      return;
  }
  res.render('add_book', {"prompt": "Book added. Add another or return to home."});
};

const searchBook = async (req, res, pool) => {
  var title = req.body.title;
  var author = req.body.author;
  var genre = req.body.genre;
  var ISBN = req.body.ISBN;
  let response;

  console.log('title: ', title);
  console.log('genre: ', genre);
  console.log('author: ', author);
  console.log('ISBN: ', ISBN);
  try {
    response = await pool.query('SELECT title, ISBN, author, genre, price, page_count, publication_date, stock,' + 
    'publisher_name, payment_percent FROM book WHERE title LIKE $1 OR author LIKE $2 OR genre LIKE $3 OR ISBN = $4',
     [title, author, genre, ISBN]);
  } catch (error) {
     throw error;
  }
  return response;
};

const searchForDeleteBook = async (req, res, pool) => {
  console.log("searchForDeleteBook ========= not implemented yet!");
  return await searchBook(req, res, pool);

};

const viewBook = async (pool, isbn) =>{
  let response;
  try {
    response = await pool.query('SELECT title, ISBN, author, genre, price, page_count, publication_date, ' + 
                'stock, publisher_name FROM book WHERE ISBN = $1',[isbn]);
  }
  catch (error) {
    throw error;
 }
 return response;
};

const deleteBook = async (req, res, pool) => {
  var queryObject = url.parse(req.url, true).query;
	var ISBN = queryObject.ISBN;
	console.log("Deleted book ISBN: " + ISBN);
  let response;
  try {
    response = await pool.query('DELETE FROM book WHERE ISBN = $1', [ISBN]);
  } catch (error) {
     throw error;
  }
} 

const deleteBookInBasket = async (req, res, pool, ISBN, order_number) => {
	console.log("Deleted from basket ISBN: " + ISBN);
  let response;
  try {
    response = await pool.query('DELETE FROM order_item WHERE ISBN = $1 AND order_number = $2', [ISBN, order_number]);
  } catch (error) {
     throw error;
  }
}

// search for pending order number
const findPendingOrder = async (session, pool) => {
  let response;
  console.log("user ID: ", session.user_uuid);
  try {
    response = await pool.query('SELECT user_uuid, tracking_status, order_number FROM order_info WHERE user_uuid = $1 AND tracking_status = $2', 
    [session.user_uuid, 'Pending']);
  } catch (error) {
     throw error;
  }
  if (response.rowCount == 1) {
    console.log("Pending order:", response.rows[0]);
    return response.rows[0].order_number;
  } else {
    console.log("NO Pending order:");
    return undefined;
  }
};

//create order based on user info
const createNewOrder = async (session, pool) => {
  let response;
  console.log("New order user ID: ", session.user_uuid);
  try {
    response = await pool.query('INSERT INTO order_info (user_uuid, tracking_status) VALUES ($1, $2) RETURNING *', 
      [session.user_uuid, 'Pending']);
  } catch (error) {
     throw error;
  }
  console.log("new order:", response.rows[0])
  return response.rows[0];
};

//add order book to basket
const addBookToBasket = async (session, pool) => {
  let response;
  //console.log("New order user ID: ", session.user_uuid);
  try {
    response = await pool.query('INSERT INTO order_item (order_number, quantity, ISBN) VALUES ($1, $2, $3) RETURNING *',
                                 [session.order_number, 1, session.isbn])
  } catch (error) {
     throw error;
  }
  session.isbn = "";
  console.log("new order item:", response.rows[0])
  return response.rows[0];
};

//check if book is already in basket
const checkBook = async (session, pool) => {
  let response;
  try {
    response = await pool.query('SELECT ISBN FROM order_item WHERE ISBN = $1 AND order_number = $2', 
                               [session.isbn, session.order_number]);
  } catch (error) {
     throw error;
  }
  console.log("checkBook: rowCount: ", response.rowCount);
  return response.rowCount;
};

const searchPastOrders = async (pool, session) => {
  let response;
  try {
    response = await pool.query('SELECT order_info.order_date, order_info.order_number, order_item.quantity, ' +
                       'order_info.tracking_status, order_info.tracking_number, book.ISBN, book.title, book.author, ' +
                       'book.price FROM order_info, order_item, book ' +
                       'WHERE order_info.user_uuid = $1 AND tracking_status != $2 AND ' +
                       'order_info.order_number = order_item.order_number ' +
                       'AND order_item.isbn = book.isbn',
                       [session.user_uuid, 'Pending']);
  }
  catch (error) {
    throw error;
  }
  console.log("past order items: ", response.rowCount);
  console.log("past orders: ", response.rows);

  return response;
}

const getOrderItems = async (pool, order_number) => {
  let response;
  try {
    response = await pool.query('SELECT order_info.order_number, order_info.tracking_number,' +
                 'order_info.order_date, order_item.quantity, ' +
                 'book.isbn, book.title, book.author, book.price, book.stock, book.publisher_name, ' +
                 'book.payment_percent, order_info.tracking_status ' + 
                 'FROM order_info, order_item, book ' +
                 'WHERE order_info.order_number = $1 AND order_info.order_number = order_item.order_number ' +
                 'AND book.isbn = order_item.isbn',
                 [order_number]);
  }
  catch (error) {
    throw error;
  }
  console.log("order items: ", response.rowCount);
  return response;
}

const searchByTrackingNumber = async (pool, tracking_number) => {
  let response;
  try {
    response = await pool.query('SELECT order_info.order_number, order_info.order_date, order_item.quantity, ' +
                 'book.isbn, book.title, book.author, order_info.tracking_number , order_info.tracking_status ' + 
                 'FROM order_info, order_item, book ' +
                 'WHERE order_info.tracking_number = $1 AND order_info.order_number = order_item.order_number ' +
                 'AND  order_item.isbn = book.isbn',
                 [tracking_number]);
  }
  catch (error) {
    throw error;
  }
  console.log("order items: ", response.rowCount);
  return response;
}

const updateOrderItemQuantity = async (pool, row) => {
  let response;
  try {
   await pool.query('UPDATE order_item SET quantity = $1 WHERE order_number = $2 AND ISBN = $3',
            [row.quantity, row.order_number, row.isbn]);
  }
  catch (error) {
    throw error;
  }
}

function getCurrentData() {
  let date_ob = new Date();
  let day = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();

  var order_date = day + "-" + month + "-" + year + " " + hours + ":" + minutes;
  return order_date;
}

const updateOrderInfo = async (req, res, pool, session) => {
  order_date = getCurrentData();
  console.log("order_date: ", order_date);
  let results;
  try {
    results = await pool.query('UPDATE order_info SET  shipping_address = $1, shipping_postal_code = $2, ' +
        'shipping_city = $3, shipping_prov = $4, total_price = $5, order_date = $6, shipping_name = $7, ' +
        'tracking_number = $8, tracking_status = $9 WHERE order_number = $10 RETURNING *',
            [session.shipping_address, session.shipping_postal_code, session.shipping_city, 
             session.shipping_prov, session.total, order_date,
             session.shipping_name, session.tracking_number, "Shipped", session.order_number]);
  } catch (error) {
     throw error;
  }
  console.log("updateOrderInfo: updated=", results.rows);
}

const getPublisher = async (pool, publisher_name) => {
  console.log("getPublisher: publisher_name=", publisher_name);
  let response;
  try {
    response = await pool.query('SELECT bank_deposit_number, email_address FROM publisher WHERE publisher_name = $1', [publisher_name]);
  } catch (error)
  {
    throw error;
  }
  return response.rows[0];
}

const reorderNewBook = async (pool, bookrow) => {
  // get publisher's email address
  let results;
  try {
    results = await getPublisher(pool, bookrow.publisher_name);
  } catch(error) {
    throw error;
  }
  console.log("====================================================");
  console.log("Place a new order for existing book:");
  console.log("publisher_email:", results.email_address);
  console.log("publisher_name: ", bookrow.publisher_name);
  console.log("title: ", bookrow.title);
  console.log("isbn: ", bookrow.isbn);
  console.log("quntity:", 25 - bookrow.stock);
  console.log("====================================================");
  //update stock
  let reorderStock;
  try {
    reorderStock = await pool.query('UPDATE book SET stock = 25 WHERE isbn = $1 RETURNING *', [bookrow.isbn]);
  }
  catch (error) {
    throw error
  }
}

const updateBookStock = async (pool, isbn, order_quantity) => {
  // update book stock
  let results;
  try {
    results = await pool.query('UPDATE book SET stock = stock - $1 WHERE isbn = $2 RETURNING *', [order_quantity, isbn]);
  }
  catch (error) {
    throw error
  }
  console.log("book stock updated:", results.rows)
   if (results.rows[0].stock <= 10) {
    // automacticall order new for 20
    await reorderNewBook(pool, results.rows[0]);
  }
}

const payPublisher = async (pool, order_number, isbn, order_quantity, price, publisher_name, pay_percent) => {
  let date_ob = new Date();
  let day = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  var sales_price = order_quantity * price;
  var payment_amount = pay_percent * sales_price / 100.0;
  var publisher = await getPublisher(pool, publisher_name);
  console.log("payPublisher: publisher:", publisher);
  console.log("payPublisher: sales_price:", sales_price);
  console.log("payPublisher: payment_amount:", payment_amount);
  console.log("payPublisher:", publisher_name, publisher.bank_deposit_number,
   payment_amount, order_number, isbn, year, month, day);
  try {
    await pool.query('INSERT INTO publisher_payment (publisher_name, bank_deposit_number, ' +
          'sales_price, payment_amount, order_number, isbn, pay_year, pay_month, pay_day) ' + 
          'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',  
          [publisher_name, publisher.bank_deposit_number, sales_price, payment_amount, order_number,
           isbn, year, month, day]);
  } catch (error) {
    throw error;
  }
}

const displayReport = async (pool, session) => {
  await getAuthorSales(pool,session);
  await getGenreSales(pool, session);
  var paymentAmount = await getTotalAmount(pool);
  session.paymentAmount = paymentAmount;
  session.profit = (paymentAmount.totalsales - paymentAmount.totalpayment).toFixed(2);
  console.log("Payment amount:", paymentAmount);
  //var profit = totalSales - paymentAmount;
  //console.log("profit: ", profit);
  
}

const getAuthorSales = async (pool, session) => {
  let response;
  try {
    response = await pool.query('SELECT SUM(order_item.quantity * book.price) AS sale_total, book.author ' +
    'FROM order_info, publisher_payment, order_item, book ' +
    'WHERE publisher_payment.order_number = order_info.order_number AND ' +
    'order_info.order_number = order_item.order_number AND  order_item.isbn = book.isbn ' +
    'GROUP BY book.author');
  } catch (error)
  {
    throw error;
  }
  console.log("author: ", response.rows);
  session.rowCountByAuthor = response.rowCount;
  session.salesByAuthor = response.rows;
  return response.rows[0];
}

const getGenreSales = async (pool, session) => {
  let response;
  try {
    response = await pool.query('SELECT SUM(order_item.quantity * book.price) AS sale_total, book.genre ' +
    'FROM order_info, publisher_payment, order_item, book ' +
    'WHERE publisher_payment.order_number = order_info.order_number AND ' +
    'order_info.order_number = order_item.order_number AND order_item.isbn = book.isbn ' +
    'GROUP BY book.genre');
  } catch (error)
  {
    throw error;
  }
  console.log("genre: ", response.rows);
  session.rowCountByGenre = response.rowCount;
  session.salesByGenre = response.rows;
  return response.rows[0];
}

const getTotalAmount = async (pool) => {
  let response;
  try {
    response = await pool.query('SELECT SUM(payment_amount) AS totalPayment, SUM(sales_price) AS totalSales FROM publisher_payment');
  } catch (error)
  {
    throw error;
  }
  //console.log("getPaymentAmount", response);
  return response.rows[0];
}

module.exports = {
    createUser,
    createAdmin,
    userLogin,
    addPublisher,
    addBookInDb,
    addBookToBasket,
    createNewOrder,
    searchBook,
    searchForDeleteBook,
    viewBook,
    findPendingOrder,
    getOrderItems,
    searchByTrackingNumber,
    searchPastOrders,
    checkBook,
    deleteBook,
    deleteBookInBasket,
    updateOrderItemQuantity,
    updateOrderInfo,
    updateBookStock,
    payPublisher,
    getPublisher,
    displayReport,
    getAuthorSales,
    getGenreSales,
    getTotalAmount,
    //deleteUser,
}