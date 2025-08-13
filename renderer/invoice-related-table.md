attribute for invoice table:

id - integer - primary key - auto increment,
invoice_id - string - required - will be auto generated as like 'SI2025-07-26-0001',
customer_id - integer - required - have a relation with customers table,
invoice_date - date - required,
sub_total - decimal (0.00) - required,
item_discount - decimal (0.00) - required,
item_tax - decimal (0.00) - required,
cart_discount - decimal (0.00) - required,
payable_total - decimal (0.00) - required,
paid_amount - decimal (0.00) - required,
due_amount - decimal (0.00) - required,
created_at - datetime - required,
updated_at - datetime - required
created_by - string - required,

attribute for invoice_item table:

id - integer - primary key - auto increment,
invoice_id - integer - required - have a relation with invoice table
product_id - integer - required - have a relation with product table,
quantity - integer - required,
price - decimal (0.00) - required,
tax - decimal (0.00) - default 0,
discount - decimal (0.00) - required,
total_price - decimal (0.00) - required,

attribute for customer_payment_history table:

id - integer - primary key - auto increment,
invoice_id - integer - required - have a relation with invoice table,
payment_date - date - required,
pre_due_amount - decimal (0.00) - required,
paid_amount - decimal (0.00) - required,
due_amount - decimal (0.00) - required,
change_amount - decimal (0.00) - required,
payment_method - string - required,
created_by - integer - required
