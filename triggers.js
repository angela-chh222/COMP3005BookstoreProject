/*
 * DB triggers
 */
//const url = require("url");

const bookStockChangeTrigger = async (pool) => {
    await pool.query('CREATE OR REPLACE FUNCTION booK_stock_notify() RETURNS trigger ' +
    'LANGUAGE plpgsql AS $function$ ' +
    'BEGIN ' +
    '  PERFORM pg_notify(\'bookStockChangeEvent\', row_to_json(NEW)::text); '+
    '  RETURN new; ' +
    'END; ' +
    '$fucntion$');
    
    await pool.query('CREATE TRIGGER book_stock_update_trigger AFTER UPDATE ' + 
       'ON book FOR EACH ROW EXECUTE PROCEDURE booK_stock_notify();');
}

module.exports = {
    bookStockChangeTrigger,
}