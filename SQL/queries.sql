
/*1. create a new user */
pool.query('INSERT INTO user_acct (email_address,fullName, acct_type, password, billing_address, ' +
     'billing_postal_code, billing_city, billing_prov, phone_number, creditcard_type, creditcard_number) ' +
     'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [email_addr, fullName, "regular",password, address, postalCode, city, province,
       phoneNumber, "MasterCard", creditcardNumber], (error, results)

/*2. create new admin*/
 pool.query('INSERT INTO user_acct (email_address,fullName, acct_type, password, billing_address, billing_postal_code, billing_city, billing_prov, phone_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [email_addr, fullName, "admin",password, address, postalCode, city, province, phoneNumber,], (error, results)
 
 /*3. verify that user exists, so they can login*/
 pool.query('SELECT user_uuid, email_address, fullName, acct_type, billing_address, billing_postal_code, billing_city, ' +
      'billing_prov, phone_number, creditcard_type, creditcard_number FROM user_acct ' +
      'WHERE email_address = $1 AND password = $2', [email_addr, password])

/*4. add new publisher*/
 pool.query('INSERT INTO publisher (publisher_name, publisher_address, email_address, phone_number, bank_deposit_number) VALUES ($1, $2, $3, $4, $5)', [publisher_name, publisher_address, email_address, phone_number, bank_deposit_number], (error, results)
 
/*5. add new new book*/
pool.query('INSERT INTO book (title, ISBN, author, genre, price, page_count, publication_date, ' + 
     'stock, publisher_name, payment_percent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
    [title, ISBN, author, genre, price, page_count, publication_date, quantity,
     publisher_name, payment_percent])

/*6. search for a book by title or author or genre or ISBN*/
pool.query('SELECT title, ISBN, author, genre, price, page_count, publication_date, stock,' + 
    'publisher_name, payment_percent FROM book WHERE title LIKE $1 OR author LIKE $2 OR genre LIKE $3 OR ISBN = $4',
     [title, author, genre, ISBN])

/*7. view details of a book based on ISBN*/
pool.query('SELECT title, ISBN, author, genre, price, page_count, publication_date, ' + 
                'stock, publisher_name FROM book WHERE ISBN = $1',[isbn])

/*8. delete a book*/
pool.query('DELETE FROM book WHERE ISBN = $1', [ISBN])

/*9. remove a book from basket*/
pool.query('DELETE FROM order_item WHERE ISBN = $1 AND order_number = $2', [ISBN, order_number])

/*10. find a pending order, which is order currently in basket*/
pool.query('SELECT user_uuid, tracking_status, order_number FROM order_info WHERE user_uuid = $1 AND tracking_status = $2', 
    [session.user_uuid, 'Pending'])

/*11. create a new order which is in basket*/
pool.query('INSERT INTO order_info (user_uuid, tracking_status) VALUES ($1, $2) RETURNING *', 
      [session.user_uuid, 'Pending'])

/*12. add a book to basket*/
pool.query('INSERT INTO order_item (order_number, quantity, ISBN) VALUES ($1, $2, $3) RETURNING *',
    [session.order_number, 1, session.isbn])

/*13. check using ISBN to see if book is is basket or not*/
pool.query('SELECT ISBN FROM order_item WHERE ISBN = $1 AND order_number = $2', 
    [session.isbn, session.order_number]

/*14. search for past orders ans sort by order date*/
pool.query('SELECT order_info.order_date, order_info.order_number, order_item.quantity, ' +
   'order_info.tracking_status, order_info.tracking_number, book.ISBN, book.title, book.author, ' +
   'book.price FROM order_info, order_item, book ' +
   'WHERE order_info.user_uuid = $1 AND tracking_status != $2 AND ' +
   'order_info.order_number = order_item.order_number ' +
   'AND order_item.isbn = book.isbn',
   [session.user_uuid, 'Pending'])

/*15. get book order from basket*/
pool.query('SELECT order_info.order_number, order_info.tracking_number,' +
     'order_info.order_date, order_item.quantity, ' +
     'book.isbn, book.title, book.author, book.price, book.stock, book.publisher_name, ' +
     'book.payment_percent, order_info.tracking_status ' + 
     'FROM order_info, order_item, book ' +
     'WHERE order_info.order_number = $1 AND order_info.order_number = order_item.order_number ' +
     'AND book.isbn = order_item.isbn', [order_number])

/*16. search for order by tracking number*/
pool.query('SELECT order_info.order_number, order_info.order_date, order_item.quantity, ' +
     'book.isbn, book.title, book.author, order_info.tracking_number , order_info.tracking_status ' + 
     'FROM order_info, order_item, book ' +
     'WHERE order_info.tracking_number = $1 AND order_info.order_number = order_item.order_number ' +
     'AND  order_item.isbn = book.isbn', [tracking_number])

/*17. update the quantity of books*/
pool.query('UPDATE order_item SET quantity = $1 WHERE order_number = $2 AND ISBN = $3',
        [row.quantity, row.order_number, row.isbn])

/*18. update shipping information at checkout*/
pool.query('UPDATE order_info SET  shipping_address = $1, shipping_postal_code = $2, ' +
    'shipping_city = $3, shipping_prov = $4, total_price = $5, order_date = $6, shipping_name = $7, ' +
    'tracking_number = $8, tracking_status = $9 WHERE order_number = $10 RETURNING *',
    [session.shipping_address, session.shipping_postal_code, session.shipping_city, 
     session.shipping_prov, session.total, order_date,
     session.shipping_name, session.tracking_number, "Shipped", session.order_number])

/*19. using publisher name to get publisher info*/
pool.query('SELECT bank_deposit_number, email_address FROM publisher WHERE publisher_name = $1', [publisher_name])

/*20. automatically reorder books*/
pool.query('UPDATE book SET stock = 25 WHERE isbn = $1 RETURNING *', [bookrow.isbn])

/*21. update book stock after checkout is completed*/
pool.query('UPDATE book SET stock = stock - $1 WHERE isbn = $2 RETURNING *', [order_quantity, isbn])

/*22. calculate amount to be paid to publisher afte checkout is completed*/
pool.query('INSERT INTO publisher_payment (publisher_name, bank_deposit_number, ' +
  'sales_price, payment_amount, order_number, isbn, pay_year, pay_month, pay_day) ' + 
  'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',  
  [publisher_name, publisher.bank_deposit_number, sales_price, payment_amount, order_number,
   isbn, year, month, day])

/*23. calculate total sales by each author*/
pool.query('SELECT SUM(order_item.quantity * book.price) AS sale_total, book.author ' +
    'FROM order_info, publisher_payment, order_item, book ' +
    'WHERE publisher_payment.order_number = order_info.order_number AND ' +
    'order_info.order_number = order_item.order_number AND  order_item.isbn = book.isbn ' +
    'GROUP BY book.author')

/*24. calculate total sales by each genre*/
pool.query('SELECT SUM(order_item.quantity * book.price) AS sale_total, book.genre ' +
    'FROM order_info, publisher_payment, order_item, book ' +
    'WHERE publisher_payment.order_number = order_info.order_number AND ' +
    'order_info.order_number = order_item.order_number AND order_item.isbn = book.isbn ' +
    'GROUP BY book.genre')

/*25. calculate total sales and total amount paid to publishers*/
pool.query('SELECT SUM(payment_amount) AS totalPayment, SUM(sales_price) AS totalSales FROM publisher_payment')
