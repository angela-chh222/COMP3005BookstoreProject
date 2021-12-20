CREATE OR REPLACE FUNCTION book_stock_notify() RETURNS TRIGGER AS
   $BODY$
    BEGIN
      PERFORM pg_notify('bookStockChangeEvent', row_to_json(NEW)::text);
      RETURN NULL;
    END;
   $BODY$  
   LANGUAGE plpgsql VOLATILE COST 100;
CREATE TRIGGER book_stock_notify AFTER UPDATE  
       ON book FOR EACH ROW EXECUTE PROCEDURE book_stock_notify();
   
DROP TRIGGER booK_stock_notify ON book;
DROP procedure booK_stock_notify();