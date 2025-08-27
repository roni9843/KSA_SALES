import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaShoppingCart, FaTrash } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import AsyncSelect from 'react-select/async';
import '../App.css';

const CustomDatePickerInput = React.forwardRef(({
  value,
  onClick,
  style
}, ref) => (
  <input
    type="text"
    className="example-custom-input"
    onClick={onClick}
    value={value}
    readOnly
    ref={ref}
    style={style}
  />
));

const ProductPurchase = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseId, setPurchaseId] = useState('');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [supplierInvoiceDate, setSupplierInvoiceDate] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [selectKey, setSelectKey] = useState(0);
  const selectRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const suppliersData = await window.electron.ipcRenderer.invoke('get-suppliers');
        setSuppliers(suppliersData);
        const generatedPurchaseId = await window.electron.ipcRenderer.invoke('generate-purchase-id');
        setPurchaseId(generatedPurchaseId);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to fetch initial data.');
      }
    };
    fetchInitialData();
  }, []);

  const loadProductOptions = async (inputValue) => {
    if (inputValue.length < 2) return [];
    try {
      const results = await window.electron.ipcRenderer.invoke('search-products', inputValue);
      return results.map(p => ({
        value: p.id,
        label: `${p.name} (SKU: ${p.sku})`,
        product: p
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search for products.');
      return [];
    }
  };

  const handleProductSelect = (selectedOption) => {
    if (!selectedOption) return;

    const product = selectedOption.product;
    const existingItem = purchaseItems.find(item => item.productId === product.id);

    if (existingItem) {
      toast.error('Product already added.');
      return;
    }

    const newItem = {
      productId: product.id,
      name: product.name,
      quantity: 1,
      priceBeforeTax: product.purchase_price || 0,
      tax: product.tax || 0,
      price: (product.purchase_price || 0) * (1 + (product.tax || 0) / 100),
      discountPercentage: 0,
      totalBeforeTax: product.purchase_price || 0,
      total: (product.purchase_price || 0) * (1 + (product.tax || 0) / 100),
    };

    setPurchaseItems([...purchaseItems, newItem]);
    setSelectKey(prevKey => prevKey + 1);
    if (selectRef.current) {
      selectRef.current.clearValue();
    }
  };


  const handleItemChange = (index, field, value) => {
    const updatedItems = [...purchaseItems];
    const item = updatedItems[index];

    if (field === 'quantity' && parseFloat(value) < 0) {
      toast.error('Quantity cannot be negative.');
      return;
    }

    item[field] = value;

    // Recalculate totals
    const quantity = parseFloat(item.quantity) || 0;
    const priceBeforeTax = parseFloat(item.priceBeforeTax) || 0;
    const tax = parseFloat(item.tax) || 0;
    const discountPercentage = parseFloat(item.discountPercentage) || 0;

    item.totalBeforeTax = quantity * priceBeforeTax;
    item.price = priceBeforeTax * (1 + tax / 100); // Price with tax
    item.total = item.totalBeforeTax * (1 + tax / 100) * (1 - discountPercentage / 100);

    setPurchaseItems(updatedItems);
  };

  const removeItem = (index) => {
    const updatedItems = purchaseItems.filter((_, i) => i !== index);
    setPurchaseItems(updatedItems);
  };

  const calculateTotalBeforeTax = () => {
    return purchaseItems.reduce((acc, item) => acc + item.totalBeforeTax, 0);
  };

  const calculateTotalTax = () => {
    return purchaseItems.reduce((acc, item) => {
      const priceBeforeTax = parseFloat(item.priceBeforeTax) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      const tax = parseFloat(item.tax) || 0;
      return acc + (priceBeforeTax * quantity * (tax / 100));
    }, 0);
  };

  const calculateTotalDiscount = () => {
    return purchaseItems.reduce((acc, item) => {
      const totalBeforeTaxAndItemTax = (parseFloat(item.priceBeforeTax) || 0) * (parseFloat(item.quantity) || 0) * (1 + (parseFloat(item.tax) || 0) / 100);
      const discount = totalBeforeTaxAndItemTax * ((parseFloat(item.discountPercentage) || 0) / 100);
      return acc + discount;
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateTotalBeforeTax() + calculateTotalTax() - calculateTotalDiscount();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSupplier) {
      toast.error('Supplier is required.');
      return;
    }
    if (!purchaseDate) {
      toast.error('Purchase Date is required.');
      return;
    }
    if (purchaseItems.length === 0) {
      toast.error('Please add at least one product to the purchase.');
      return;
    }

    for (const item of purchaseItems) {
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        toast.error(`Quantity for ${item.name} must be greater than zero.`);
        return;
      }
    }

    const purchaseData = {
      purchase_id: purchaseId,
      supplier_invoice_no: supplierInvoiceNo,
      supplier_invoice_date: supplierInvoiceDate ? supplierInvoiceDate.toISOString().slice(0, 10) : '',
      purchase_date: purchaseDate ? purchaseDate.toISOString().slice(0, 10) : '',
      supplier_id: selectedSupplier,
      grand_total: calculateGrandTotal(),
      grand_total_before_tax: calculateTotalBeforeTax(),
      tax_amount: calculateTotalTax(),
      discount_amount: calculateTotalDiscount(),
      items: purchaseItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        tax_percentage: item.tax,
        price: item.priceBeforeTax, // Store price before tax in DB
        discount_percentage: item.discountPercentage,
        total_before_tax: item.totalBeforeTax,
        total: item.total,
      })),
    };
    console.log(purchaseData);
    try {
      await window.electron.ipcRenderer.invoke('add-purchase', purchaseData);
      toast.success('Purchase added successfully');
      // Clear form after successful submission
      const generatedPurchaseId = await window.electron.ipcRenderer.invoke('generate-purchase-id');
      setPurchaseId(generatedPurchaseId);
      setSupplierInvoiceNo('');
      setSupplierInvoiceDate(null);
      setPurchaseDate(null);
      setSelectedSupplier('');
      setPurchaseItems([]);
    } catch (err) {
      toast.error(err.message || 'An error occurred while adding the purchase.');
    }
  };

  return (
    <div style={cardStyle}>
      <h2><FaShoppingCart /> Create Purchase</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Purchase Details</legend>
          <div style={detailsGridStyle}>
            <div style={inputGroupStyle}>
              <label htmlFor="purchaseId" style={labelStyle}>
                Purchase Id
              </label>
              <input
                type="text"
                id="purchaseId"
                name="purchaseId"
                value={purchaseId}
                readOnly
                style={{ ...inputStyle, backgroundColor: '#E2E8F0' }}
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="purchaseDate" style={labelStyle}>
                Purchase Date <span style={{ color: 'red' }}>*</span>
              </label>
              <DatePicker
                id="purchaseDate"
                name="purchaseDate"
                selected={purchaseDate}
                onChange={(date) => setPurchaseDate(date)}
                dateFormat="yyyy-MM-dd"
                customInput={<CustomDatePickerInput style={inputStyle} />}
                peekNextMonth
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="supplierInvoiceNo" style={labelStyle}>
                Supplier Invoice No
              </label>
              <input
                type="text"
                id="supplierInvoiceNo"
                name="supplierInvoiceNo"
                value={supplierInvoiceNo}
                onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="supplierInvoiceDate" style={labelStyle}>
                Supplier Invoice Date
              </label>
              <DatePicker
                id="supplierInvoiceDate"
                name="supplierInvoiceDate"
                selected={supplierInvoiceDate}
                onChange={(date) => setSupplierInvoiceDate(date)}
                dateFormat="yyyy-MM-dd"
                customInput={<CustomDatePickerInput style={inputStyle} />}
                peekNextMonth
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="supplier" style={labelStyle}>
                Supplier <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                id="supplier"
                name="supplier"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Purchase Items</legend>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Search and Add Product</label>
            <AsyncSelect
              key={selectKey}
              ref={selectRef}
              cacheOptions
              defaultOptions
              loadOptions={loadProductOptions}
              onChange={handleProductSelect}
              placeholder="Type to search for a product..."
              isClearable
              styles={selectStyles}
            />
          </div>
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th style={{ ...thStyle, width: '25%' }}>Product Name</th>
                  <th style={{ ...thStyle, width: '10%' }}>Quantity <span style={{ color: 'red' }}>*</span></th>
                  <th style={{ ...thStyle, width: '12%', textAlign: 'right' }}>Price before tax</th>
                  <th style={{ ...thStyle, width: '8%' }}>Tax (%)</th>
                  <th style={{ ...thStyle, width: '10%', textAlign: 'right' }}>Price</th>
                  <th style={{ ...thStyle, width: '10%' }}>Discount (%)</th>
                  <th style={{ ...thStyle, width: '12%', textAlign: 'right' }}>Total before Tax</th>
                  <th style={{ ...thStyle, width: '10%', textAlign: 'right' }}>Total</th>
                  <th style={{ ...thStyle, width: '3%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseItems.map((item, index) => (
                  <tr key={index} style={tableRowStyle(index)}>
                    <td style={{ ...tdStyle, width: '25%' }}>
                      {item.name}
                    </td>
                    <td style={{ ...tdStyle, width: '10%' }}>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ ...tdStyle, width: '12%', textAlign: 'right' }}>
                      <input
                        type="number"
                        value={(item.priceBeforeTax || 0).toFixed(2)}
                        readOnly
                        style={{ ...inputStyle, backgroundColor: '#E2E8F0', textAlign: 'right' }}
                      />
                    </td>
                    <td style={{ ...tdStyle, width: '8%' }}>
                      <input
                        type="number"
                        value={item.tax}
                        onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ ...tdStyle, width: '10%', textAlign: 'right' }}>
                      <input
                        type="number"
                        value={(item.price || 0).toFixed(2)}
                        readOnly
                        style={{ ...inputStyle, backgroundColor: '#E2E8F0', textAlign: 'right' }}
                      />
                    </td>
                    <td style={{ ...tdStyle, width: '10%' }}>
                      <input
                        type="number"
                        value={item.discountPercentage}
                        onChange={(e) => handleItemChange(index, 'discountPercentage', e.target.value)}
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ ...tdStyle, width: '12%', textAlign: 'right' }}>
                      {(item.totalBeforeTax || 0).toFixed(2)}
                    </td>
                    <td style={{ ...tdStyle, width: '10%', textAlign: 'right' }}>
                      {(item.total || 0).toFixed(2)}
                    </td>
                    <td style={{ ...tdStyle, width: '3%' }}>
                      <button type="button" onClick={() => removeItem(index)} className="action-button">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Summary</legend>
          <div style={summaryGridStyle}>
            <div style={summaryItemStyle}>
              <span style={summaryLabelStyle}>Total Before Tax:</span>
              <span style={summaryValueStyle}>{(calculateTotalBeforeTax() || 0).toFixed(2)}</span>
            </div>
            <div style={summaryItemStyle}>
              <span style={summaryLabelStyle}>Total Tax:</span>
              <span style={summaryValueStyle}>{(calculateTotalTax() || 0).toFixed(2)}</span>
            </div>
            <div style={summaryItemStyle}>
              <span style={summaryLabelStyle}>Total Discount:</span>
              <span style={summaryValueStyle}>{(calculateTotalDiscount() || 0).toFixed(2)}</span>
            </div>
            <div style={summaryItemStyle}>
              <span style={summaryLabelStyle}>Grand Total:</span>
              <span style={summaryValueStyle}>{(calculateGrandTotal() || 0).toFixed(2)}</span>
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          // style={{ ...buttonStyle, gridColumn: '1 / -1' }}
          className="default-button"
        >
          Save Purchase
        </button>
      </form>
    </div>
  );
};

const cardStyle = {
  background: '#2D3748',
  padding: '20px',
  borderRadius: '4px',
  color: '#fff'
};

const formStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '20px',
};

const fieldsetStyle = {
  border: '1px solid #4A5568',
  borderRadius: '8px',
  padding: '20px',
  margin: '0',
};

const legendStyle = {
  padding: '0 10px',
  color: '#E2E8F0',
  fontWeight: 'bold',
  fontSize: '18px',
  marginLeft: '10px',
};

const detailsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const labelStyle = {
  marginBottom: '8px',
  fontSize: '14px',
  color: '#A0AEC0',
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '4px',
  border: '1px solid #A0AEC0',
  backgroundColor: '#fff',
  color: '#333',
  fontSize: '14px',
  boxSizing: 'border-box',
};



const tableContainerStyle = {
  overflowX: 'auto',
  marginTop: '20px',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  borderRadius: '8px',
  overflow: 'hidden',
};

const tableHeaderStyle = {
  backgroundColor: '#4A5568',
  color: '#fff',
};

const thStyle = {
  padding: '12px 15px',
  textAlign: 'left',
  textTransform: 'uppercase',
  fontSize: '12px',
  borderBottom: '1px solid #2D3748',
};

const tableRowStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? '#575F6D' : '#4A5568',
  borderBottom: '1px solid #2D3748',
});

const tdStyle = {
  padding: '12px 15px',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

const summaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px',
  marginTop: '20px',
};

const summaryItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '5px 0',
  borderBottom: '1px dashed #4A5568',
};

const summaryLabelStyle = {
  fontWeight: 'bold',
  color: '#A0AEC0',
};

const summaryValueStyle = {
  color: '#E2E8F0',
};

const selectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #A0AEC0',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#fff',
    color: '#333',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#27ae60' : state.isFocused ? '#f0f0f0' : '#fff',
    color: state.isSelected ? '#fff' : '#333',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#333',
  }),
};

export default ProductPurchase;