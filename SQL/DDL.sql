create table user_acct
    (email_address  text,
    fullName    text,
    acct_type text
        check (acct_type in ('regular', 'admin')),
    user_uuid uuid DEFAULT gen_random_uuid(),
    password    varchar(12),
    billing_address    text,
    billing_postal_code    varchar(6),
    billing_city    text,
    billing_prov    text,
    phone_number   numeric(12),
    creditcard_type text
        check (creditcard_type in ('Visa', 'MasterCard', 'American Express')),
    creditcard_number numeric(16),
    primary key (user_uuid),
    unique (email_address)
    );

create table order_info
    (user_uuid  uuid,
    order_number uuid DEFAULT gen_random_uuid(),
    tracking_status varchar(14)
        check (tracking_status in ('Pending', 'Confirmed', 'Shipped', 'Completed')),
    order_date    text,
	tracking_number varchar(12),
    shipping_name   text,
    shipping_address   text,
    shipping_postal_code    text,
    shipping_city    text,
    shipping_prov    text,
    total_price   numeric(8,2),
    primary key (order_number),
	unique (tracking_number),
    foreign key (user_uuid) references user_acct
        on delete cascade
    );

create table publisher
    (publisher_name  text,
    publisher_address   text,
    email_address  text,
    phone_number   numeric(12),
    bank_deposit_number numeric(12),
    primary key (publisher_name),
    unique (bank_deposit_number)
    );

create table book
    (title  text,
    ISBN   varchar(13),
    author  text,
    genre    text,
    price   numeric(8,2),
    page_count   numeric(6),
    publication_date    numeric(4),
    stock    numeric(4),
    publisher_name  text,
    payment_percent numeric(8,2),
    primary key (ISBN),
    foreign key (publisher_name) references publisher
        on delete cascade
    );

create table order_item
    (item_number    uuid DEFAULT gen_random_uuid(),
    order_number    uuid,
    quantity   numeric(4),
    ISBN   varchar(13),
    primary key (item_number),
    foreign key (order_number) references order_info
        on delete cascade,
    foreign key (ISBN) references book
        on delete cascade
    );

create table publisher_payment
    (publisher_name text,
    bank_deposit_number numeric(12),
	sales_price      numeric(10,2),
    payment_amount  numeric(10,2),
    order_number    uuid,
    ISBN   varchar(13),
    pay_year    numeric(4),
    pay_month   numeric(2),
    pay_day     numeric(2),
    foreign key (publisher_name) references publisher
        on delete cascade,
    foreign key (order_number) references order_info
        on delete cascade
    );