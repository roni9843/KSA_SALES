attribute for product_purchase table:
id - integer - primary key - auto increment,
purchase_id - string - required - will be auto generated as like 'P2025-07-26-0001',
supplier_invoice_no - string - optional,
supplier_invoice_date - date - required,
purchase_date - date - required,
supplier_id - integer - required - have a relation with suppliers table,
grand_total - decimal (0.00) - required,
grand_total_before_tax - decimal (0.00) - required,
tax_amount - decimal (0.00) - required,
discount_amount - decimal (0.00) - required

attribute for product_purchase_item table:
id - integer - primary key - auto increment,
product_purchase_id - integer - required - have a relation with product_purchase table
product_id - integer - required - have a relation with product table,
quantity - integer - required,
tax_percentage - decimal (0.00) - default 0,
price - decimal (0.00) - required,
discount_percentage - decimal (0.00) - default 0,
total_before_tax - decimal (0.00) - required,
total - decimal (0.00) - required,
