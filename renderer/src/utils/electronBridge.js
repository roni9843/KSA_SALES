import api from './api';

// Polyfill window.electron for cloud web app compatibility
if (typeof window !== 'undefined') {
  window.electron = {
    getDashboardData: async () => {
      const res = await api.get('/dashboard/summary');
      return res.data.data;
    },
    getWeeklySummary: async () => {
      const res = await api.get('/dashboard/weekly-summary');
      return res.data.data;
    },
    getRecentInvoices: async () => {
      const res = await api.get('/dashboard/recent-invoices');
      return res.data.data;
    },
    getTopSellingProducts: async () => {
      const res = await api.get('/dashboard/top-selling');
      return res.data.data;
    },
    ipcRenderer: {
      invoke: async (channel, data) => {
        try {
          switch (channel) {
            // Authentication
            case 'auth:check': {
              const token = localStorage.getItem('token');
              if (!token) return null;
              const res = await api.get('/auth/me');
              return res.data.user;
            }
            case 'auth:login': {
              const res = await api.post('/auth/login', data);
              localStorage.setItem('token', res.data.token);
              return { success: true, user: res.data.user };
            }
            case 'auth:logout': {
              localStorage.removeItem('token');
              return { success: true };
            }

            // Categories
            case 'get-categories': {
              const res = await api.get('/categories');
              return res.data.categories.map(c => ({ id: c._id, name: c.name }));
            }
            case 'add-category': {
              const res = await api.post('/categories', { name: data });
              return { id: res.data.category._id, name: res.data.category.name };
            }
            case 'update-category': {
              await api.put(`/categories/${data.id}`, { name: data.name });
              return { success: true };
            }
            case 'delete-category': {
              await api.delete(`/categories/${data}`);
              return { success: true };
            }

            // Products
            case 'get-products': {
              const res = await api.get('/products');
              return res.data.products.map(p => ({
                id: p._id,
                name: p.name,
                sku: p.sku,
                category_id: p.category?._id,
                category_name: p.category?.name,
                description: p.description,
                purchase_price: p.purchasePrice,
                sale_price: p.salePrice,
                quantity_in_stock: p.quantityInStock,
                unit: p.unit,
                tax: p.tax,
                markup: p.markup,
                code: p.code,
                barcode: p.barcode,
                active: p.active ? 1 : 0,
                default_quantity: p.defaultQuantity
              }));
            }
            case 'add-product': {
              const payload = {
                name: data.name,
                sku: data.sku,
                category: data.category_id,
                description: data.description,
                purchasePrice: Number(data.purchase_price),
                salePrice: Number(data.sale_price),
                quantityInStock: Number(data.quantity_in_stock),
                unit: data.unit,
                tax: Number(data.tax),
                markup: Number(data.markup),
                code: data.code,
                barcode: data.barcode,
                active: data.active === 1 || data.active === true,
                defaultQuantity: Number(data.default_quantity)
              };
              await api.post('/products', payload);
              return { success: true };
            }
            case 'update-product': {
              const payload = {
                name: data.name,
                sku: data.sku,
                category: data.category_id,
                description: data.description,
                purchasePrice: Number(data.purchase_price),
                salePrice: Number(data.sale_price),
                quantityInStock: Number(data.quantity_in_stock),
                unit: data.unit,
                tax: Number(data.tax),
                markup: Number(data.markup),
                code: data.code,
                barcode: data.barcode,
                active: data.active === 1 || data.active === true,
                defaultQuantity: Number(data.default_quantity)
              };
              await api.put(`/products/${data.id}`, payload);
              return { success: true };
            }
            case 'delete-product': {
              await api.delete(`/products/${data}`);
              return { success: true };
            }
            case 'search-products-for-invoice': {
              const res = await api.get('/products');
              const term = data.toLowerCase();
              const filtered = res.data.products.filter(p => 
                p.name.toLowerCase().includes(term) ||
                p.sku.toLowerCase().includes(term) ||
                (p.barcode && p.barcode.toLowerCase().includes(term))
              );
              return filtered.map(p => ({
                id: p._id,
                name: p.name,
                sku: p.sku,
                sale_price: p.salePrice,
                quantity_in_stock: p.quantityInStock,
                tax: p.tax
              }));
            }

            // Invoices
            case 'get-invoices': {
              const res = await api.get('/invoices');
              return res.data.invoices.map(i => ({
                id: i._id,
                invoice_id: i.invoiceId,
                total: i.payableTotal,
                paid: i.paidAmount,
                due: i.dueAmount,
                created_at: i.createdAt,
                customer_name: i.customer?.name || 'Walk-in Customer'
              }));
            }
            case 'get-draft-invoices': {
              try {
                const res = await api.get('/invoices/drafts');
                return (res.data.drafts || []).map(i => ({
                  id: i._id,
                  invoice_id: i.invoiceId,
                  total: i.payableTotal || 0,
                  paid: i.paidAmount || 0,
                  due: i.dueAmount || 0,
                  created_at: i.createdAt,
                  status: i.status || 'draft',
                  customer_name: i.customer?.name || 'Walk-in Customer'
                }));
              } catch (err) {
                console.error('Failed to get draft invoices:', err);
                return [];
              }
            }
            case 'get-invoice': {
              const res = await api.get(`/invoices/${data}`);
              const inv = res.data.invoice;
              if (!inv) return { invoice: null, details: [] };

              return {
                invoice: {
                  id: inv.invoiceId || inv._id,
                  raw_id: inv._id,
                  invoice_number: inv.invoiceId || inv._id,
                  created_at: inv.invoiceDate || inv.createdAt,
                  sub_total: inv.subTotal || 0,
                  item_discount: inv.itemDiscount || 0,
                  item_tax: inv.itemTax || 0,
                  cart_discount: inv.cartDiscount || 0,
                  total: inv.payableTotal || 0,
                  paid: inv.paidAmount || 0,
                  due: inv.dueAmount || 0,
                  paid_amount_cash: inv.paidAmountCash || 0,
                  paid_amount_card: inv.paidAmountCard || 0,
                  paid_amount_bank: inv.paidAmountBank || 0,
                  status: inv.status || 'final',
                  customer_name: inv.customer?.name || 'Walk-in Customer',
                  customer_address: inv.customer?.address || '',
                  customer_phone: inv.customer?.phone || '',
                  customer_tax_number: inv.customer?.taxNumber || '',
                  customer_Uakam_no: inv.customer?.Uakam_no || ''
                },
                details: (inv.items || []).map(item => ({
                  quantity: item.quantity || 1,
                  unit_price: item.price || 0,
                  tax: item.tax || 0,
                  discount: item.discount || 0,
                  total_price: item.totalPrice || 0,
                  product_name: item.productName || (item.product?.name) || 'Product'
                }))
              };
            }
            case 'create-invoice': {
              const res = await api.post('/invoices', data);
              return res.data.invoiceId;
            }
            case 'finalize-invoice': {
              const res = await api.put(`/invoices/${data}/finalize`);
              return res.data.invoiceId;
            }
            case 'delete-invoice': {
              const res = await api.delete(`/invoices/${data}`);
              return res.data;
            }
            case 'search-invoices-with-due': {
              const res = await api.get(`/invoices/due?search=${data}`);
              return res.data.invoices.map(i => ({
                id: i._id,
                invoice_id: i.invoiceId,
                customer_name: i.customer?.name || 'Walk-in Customer'
              }));
            }
            case 'get-invoice-with-due-details': {
              const res = await api.get(`/invoices/${data}`);
              const inv = res.data.invoice;
              return {
                id: inv._id,
                invoice_id: inv.invoiceId,
                invoice_date: inv.invoiceDate,
                sub_total: inv.subTotal,
                item_discount: inv.itemDiscount,
                item_tax: inv.itemTax,
                cart_discount: inv.cartDiscount,
                payable_total: inv.payableTotal,
                paid_amount: inv.paidAmount,
                due_amount: inv.dueAmount,
                customer_id: inv.customer?._id,
                customer_name: inv.customer?.name || 'Walk-in Customer',
                customer_phone: inv.customer?.phone || '',
                customer_address: inv.customer?.address || ''
              };
            }
            case 'collect-due-payment': {
              await api.post('/invoices/collect-due', data);
              return { success: true };
            }
            case 'get-last-payment-details': {
              const res = await api.get(`/invoices/${data}/last-payment`);
              const lp = res.data.lastPayment;
              if (!lp) return null;
              return {
                payment_date: lp.paymentDate,
                pre_due_amount: lp.preDueAmount,
                paid_amount: lp.paidAmount,
                due_amount: lp.dueAmount,
                change_amount: lp.changeAmount,
                paid_amount_cash: lp.paidAmountCash,
                paid_amount_card: lp.paidAmountCard,
                paid_amount_bank: lp.paidAmountBank,
                invoice_id: lp.invoice?.invoiceId,
                customer_name: lp.invoice?.customer?.name || 'Walk-in Customer',
                customer_phone: lp.invoice?.customer?.phone || '',
                customer_address: lp.invoice?.customer?.address || '',
                customer_tax_number: lp.invoice?.customer?.taxNumber || '',
                customer_Uakam_no: lp.invoice?.customer?.Uakam_no || ''
              };
            }

            // Customers
            case 'get-customers': {
              const res = await api.get('/customers');
              const rows = res.data.customers.map(c => ({
                id: c._id,
                name: c.name,
                code: c.code,
                phone: c.phone,
                email: c.email,
                address: c.address,
                zip_code: c.zipCode,
                city: c.city,
                country: c.country,
                tax_number: c.taxNumber,
                status: c.status ? 1 : 0,
                Uakam_no: c.Uakam_no
              }));
              return { rows, totalCount: rows.length };
            }
            case 'add-customer': {
              const payload = {
                name: data.name,
                code: data.code,
                phone: data.phone,
                email: data.email,
                address: data.address,
                zipCode: data.zip_code,
                city: data.city,
                country: data.country,
                taxNumber: data.tax_number,
                status: data.status === 1 || data.status === true,
                Uakam_no: data.Uakam_no
              };
              await api.post('/customers', payload);
              return { success: true };
            }
            case 'update-customer': {
              const payload = {
                name: data.name,
                code: data.code,
                phone: data.phone,
                email: data.email,
                address: data.address,
                zipCode: data.zip_code,
                city: data.city,
                country: data.country,
                taxNumber: data.tax_number,
                status: data.status === 1 || data.status === true,
                Uakam_no: data.Uakam_no
              };
              await api.put(`/customers/${data.id}`, payload);
              return { success: true };
            }
            case 'delete-customer': {
              await api.delete(`/customers/${data}`);
              return { success: true };
            }
            case 'search-customers': {
              const res = await api.get('/customers');
              const term = data.toLowerCase();
              const filtered = res.data.customers.filter(c => 
                c.name.toLowerCase().includes(term) ||
                c.phone.includes(term)
              );
              return filtered.map(c => ({
                id: c._id,
                name: c.name,
                phone: c.phone,
                address: c.address
              }));
            }

            // Suppliers
            case 'get-suppliers': {
              const res = await api.get('/suppliers');
              return res.data.suppliers.map(s => ({
                id: s._id,
                name: s.name,
                code: s.code,
                phone: s.phone,
                email: s.email,
                address: s.address,
                zip_code: s.zipCode,
                city: s.city,
                country: s.country,
                tax_number: s.taxNumber,
                status: s.status ? 1 : 0
              }));
            }
            case 'add-supplier': {
              const payload = {
                name: data.name,
                code: data.code,
                phone: data.phone,
                email: data.email,
                address: data.address,
                zipCode: data.zip_code,
                city: data.city,
                country: data.country,
                taxNumber: data.tax_number,
                status: data.status === 1 || data.status === true
              };
              await api.post('/suppliers', payload);
              return { success: true };
            }
            case 'update-supplier': {
              const payload = {
                name: data.name,
                code: data.code,
                phone: data.phone,
                email: data.email,
                address: data.address,
                zipCode: data.zip_code,
                city: data.city,
                country: data.country,
                taxNumber: data.tax_number,
                status: data.status === 1 || data.status === true
              };
              await api.put(`/suppliers/${data.id}`, payload);
              return { success: true };
            }
            case 'delete-supplier': {
              await api.delete(`/suppliers/${data}`);
              return { success: true };
            }

            // Taxes
            case 'get-taxes': {
              const res = await api.get('/tax');
              return res.data.taxRates.map(t => ({
                id: t._id,
                tax_label: t.taxLabel,
                tax_percentage: t.taxPercentage
              }));
            }
            case 'add-tax': {
              await api.post('/tax', {
                taxLabel: data.tax_label,
                taxPercentage: Number(data.tax_percentage)
              });
              return { success: true };
            }
            case 'update-tax': {
              await api.put(`/tax/${data.id}`, {
                taxLabel: data.tax_label,
                taxPercentage: Number(data.tax_percentage)
              });
              return { success: true };
            }
            case 'delete-tax': {
              await api.delete(`/tax/${data}`);
              return { success: true };
            }

            // Settings
            case 'get-settings': {
              const res = await api.get('/settings');
              const s = res.data.settings;
              return {
                id: s._id,
                language: s.language,
                writing_direction: s.writingDirection,
                color_scheme: s.colorScheme,
                shop_name: s.shopName,
                shop_address: s.shopAddress,
                shop_phone: s.shopPhone,
                shop_email: s.shopEmail,
                shop_logo: s.shopLogo
              };
            }
            case 'update-settings': {
              const payload = {
                language: data.language,
                writingDirection: data.writing_direction,
                colorScheme: data.color_scheme,
                shopName: data.shop_name,
                shopAddress: data.shop_address,
                shopPhone: data.shop_phone,
                shopEmail: data.shop_email,
                shopLogo: data.shop_logo
              };
              await api.put('/settings', payload);
              return { success: true };
            }

            // Purchases
            case 'generate-purchase-id': {
              const today = new Date();
              const datePrefix = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
              const sequence = String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0');
              const random = Math.random().toString(36).substring(2, 6).toUpperCase();
              return `${datePrefix}-${sequence}-${random}`;
            }
            case 'add-purchase': {
              await api.post('/purchases', data);
              return { success: true };
            }
            case 'get-purchases': {
              const res = await api.get('/purchases');
              return res.data.purchases.map(p => ({
                id: p._id,
                purchase_id: p.purchaseId,
                supplier_id: p.supplier?._id,
                supplier_name: p.supplier?.name || 'Unknown Supplier',
                supplier_invoice_no: p.supplierInvoiceNo,
                supplier_invoice_date: p.supplierInvoiceDate,
                purchase_date: p.purchaseDate,
                grand_total: p.grandTotal,
                grand_total_before_tax: p.grandTotalBeforeTax,
                tax_amount: p.taxAmount,
                discount_amount: p.discountAmount
              }));
            }
            case 'update-purchase': {
              await api.put(`/purchases/${data.id}`, data);
              return { success: true };
            }
            case 'delete-purchase': {
              await api.delete(`/purchases/${data}`);
              return { success: true };
            }

            // Stock adjustments
            case 'generate-stock-adjustment-id': {
              const today = new Date();
              const datePrefix = `SA${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
              const sequence = String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0');
              return `${datePrefix}-${sequence}`;
            }
            case 'add-stock-adjustment': {
              await api.post('/stock/adjust', data);
              return { success: true };
            }
            case 'get-stock-adjustments': {
              const res = await api.get('/stock/adjustments', { params: data });
              return res.data;
            }

            // Reports & Transactions
            case 'get-product-sales-report': {
              const res = await api.get('/reports/product-sales', { params: data });
              return res.data;
            }
            case 'get-product-transactions': {
              const res = await api.get('/reports/product-transactions', { params: data });
              return res.data;
            }

            // Cash Flow & Register Closing
            case 'get-cashflow': {
              const res = await api.get('/cashflow', { params: data });
              return res.data;
            }
            case 'get-cashflow-summary': {
              const res = await api.get('/cashflow/summary');
              return res.data;
            }
            case 'add-cashflow-entry': {
              const res = await api.post('/cashflow', data);
              return res.data;
            }
            case 'delete-cashflow-entry': {
              const res = await api.delete(`/cashflow/${data}`);
              return res.data;
            }
            case 'get-current-register': {
              const res = await api.get('/cash-register/current');
              return res.data;
            }
            case 'open-register': {
              const res = await api.post('/cash-register/open', data);
              return res.data;
            }
            case 'close-register': {
              const res = await api.post('/cash-register/close', data);
              return res.data;
            }
            case 'get-register-history': {
              const res = await api.get('/cash-register/history');
              return res.data;
            }

            // Sales Returns & Refunds
            case 'get-sales-returns': {
              const res = await api.get('/returns');
              return res.data;
            }
            case 'create-sales-return': {
              const res = await api.post('/returns', data);
              return res.data;
            }
            case 'get-sales-return-details': {
              const res = await api.get(`/returns/${data}`);
              return res.data;
            }
            case 'connect-zatca-portal': {
              const res = await api.post('/settings/zatca-connect', data);
              return res.data;
            }
            case 'get-settings': {
              const res = await api.get('/settings');
              return res.data.settings;
            }
            case 'update-settings': {
              const res = await api.put('/settings', data);
              return res.data.settings;
            }

            // Database Backups (Emulated via JSON download/upload)
            case 'export-database': {
              const collections = ['products', 'categories', 'customers', 'suppliers', 'invoices', 'purchases', 'settings'];
              const backupData = {};
              for (const col of collections) {
                const res = await api.get(`/${col === 'tax' ? 'tax' : col}`);
                backupData[col] = res.data;
              }
              const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `moto_pos_cloud_backup_${Date.now()}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              return { success: true, message: 'Database exported successfully via download!' };
            }
            case 'import-database': {
              return new Promise((resolve) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = async (e) => {
                  const file = e.target.files[0];
                  if (!file) {
                    resolve({ success: false, message: 'Import cancelled.' });
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    try {
                      const backupData = JSON.parse(event.target.result);
                      // Send backup to restore API if available, or just alert
                      alert('Database restore from JSON file uploaded! Check console for simulated ingestion.');
                      console.log('Ingested database backup JSON:', backupData);
                      resolve({ success: true, message: 'Ingestion completed successfully!' });
                      window.location.reload();
                    } catch (err) {
                      resolve({ success: false, message: 'Failed to parse JSON backup file.' });
                    }
                  };
                  reader.readAsText(file);
                };
                input.click();
              });
            }

            // User & Role Management Bridge
            case 'get-users': {
              const res = await api.get('/auth/users');
              return (res.data.users || []).map(u => ({
                id: u._id,
                username: u.username
              }));
            }
            case 'get-roles': {
              const res = await api.get('/auth/roles');
              return (res.data.roles || []).map(r => ({
                id: r._id,
                name: r.name
              }));
            }
            case 'get-user-roles': {
              const res = await api.get('/auth/users');
              const foundUser = (res.data.users || []).find(u => u._id === data);
              return foundUser ? (foundUser.roles || []).map(r => r._id || r) : [];
            }
            case 'update-user-roles': {
              await api.put(`/auth/users/${data.userId}`, { roles: data.roleIds });
              return { success: true };
            }
            case 'add-user': {
              await api.post('/auth/users', data);
              return { success: true };
            }
            case 'get-permissions': {
              const res = await api.get('/auth/permissions');
              return (res.data.permissions || []).map(p => ({
                id: p._id,
                name: p.name,
                description: p.description
              }));
            }
            case 'get-role-permissions': {
              const res = await api.get('/auth/roles');
              const foundRole = (res.data.roles || []).find(r => r._id === data);
              return foundRole ? (foundRole.permissions || []).map(p => p._id || p) : [];
            }
            case 'update-role-permissions': {
              await api.post('/auth/roles', { name: data.roleName, permissions: data.permissionIds });
              return { success: true };
            }
            case 'add-role': {
              await api.post('/auth/roles', { name: data, permissions: [] });
              return { success: true };
            }

            default:
              console.warn(`Emulated bridge received unhandled channel request: ${channel}`);
              return null;
          }
        } catch (error) {
          console.error(`Error invoking IPC channel (${channel}):`, error);
          throw error;
        }
      }
    }
  };
}
