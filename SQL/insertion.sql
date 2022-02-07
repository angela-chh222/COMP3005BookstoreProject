insert into publisher values ('Publisher1', '1 Publisher Ave', 'publisher1@email.com', '6131234567', '123456789');
insert into publisher values ('Publisher2', '2 Publisher Ave', 'publisher2@email.com', '4162234567', '223456789');
insert into publisher values ('Publisher3', '3 Publisher Ave', 'publisher3@email.com', '8193234567', '323456789');

insert into book values ('Anna Karenina', '1234567890123', 'Leo Tolstoy', 'Historical', '40.00', '700', '1890', '20', 'Publisher1', '17.5');
insert into book values ('Madame Bovary', '2234567890123', 'Gustave Flaubert', 'Historical', '34.00', '600', '1870', '15', 'Publisher2', '14');
insert into book values ('War and Peace', '3234567890123', 'Leo Tolstoy', 'Historical', '45.00', '900', '1870', '15', 'Publisher1', '15');
insert into book values ('The Great Gatsby', '4234567890123', 'F. Scott Fitzgerald', 'Fiction', '15.00', '200', '1930', '25', 'Publisher3', '85');
insert into book values ('Lolita', '5234567890123', 'Vladimir Nabokov', 'Fiction', '15.00', '350', '1950', '15', 'Publisher2', '20');
insert into book values ('The Divine Comedy', '6234567890123', 'Dante Alighieri', 'Fantasy', '55.00', '300', '1350', '25', 'Publisher1', '18');
insert into book values ('Emma', '7234567890123', 'Jane Austen', 'Romance', '20.00', '450', '1840', '25', 'Publisher3', '21');
insert into book values ('Persuasion', '8234567890123', 'Jane Austen', 'Romance', '25.00', '450', '1840', '20', 'Publisher3', '14.5');

insert into store_book_order_info values ('1234567890123', '2021' , '12', '11', '20', 'Publisher1', '83.5');
insert into store_book_order_info values ('2234567890123', '2021' , '12', '11', '15', 'Publisher2', '84');
insert into store_book_order_info values ('3234567890123', '2021' , '12', '11', '15', 'Publisher1', '85');
insert into store_book_order_info values ('4234567890123', '2021' , '12', '11', '25', 'Publisher3', '85');
insert into store_book_order_info values ('5234567890123', '2021' , '12', '11', '15', 'Publisher2', '80');
insert into store_book_order_info values ('6234567890123', '2021' , '12', '11', '25', 'Publisher1', '74');
insert into store_book_order_info values ('7234567890123', '2021' , '12', '11', '25', 'Publisher3', '81');
insert into store_book_order_info values ('8234567890123', '2021' , '12', '11', '20', 'Publisher3', '84.5');

insert into user_acct values ('123@email.com', 'Smith B', 'regular', '123', '500 Brook Street', 'B2G6H9', 'Ottawa', 'Ontario', '16131234567', 'Visa', '0123456789123456');
insert into user_acct values ('admin@email.com', 'George K', 'admin', '123', '61 Bank Street', 'G2K0B9', 'Ottawa', 'Ontario', '16131234567', 'MasterCard', '0543210987654321');