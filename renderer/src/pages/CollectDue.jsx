import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import AsyncSelect from 'react-select/async';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CollectDue = () => {
    const { user } = useAuth();
    const navigate = useNavigate(); // Get navigate function
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceDetails, setInvoiceDetails] = useState(null);
    const [paidAmount, setPaidAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const searchInvoices = async (inputValue) => {
        if (!inputValue) {
            return [];
        }
        const invoices = await window.electron.ipcRenderer.invoke('search-invoices-with-due', inputValue);
        return invoices.map(invoice => ({
            label: `${invoice.invoice_id} - ${invoice.customer_name}`,
            value: invoice.id,
        }));
    };

    const handleInvoiceSelect = async (option) => {
        setSelectedInvoice(option);
        if (option) {
            const details = await window.electron.ipcRenderer.invoke('get-invoice-with-due-details', option.value);
            setInvoiceDetails(details);
            setPaidAmount(details.due_amount.toFixed(2));
        } else {
            setInvoiceDetails(null);
            setPaidAmount('');
        }
    };

    const handleCollectDue = async (e) => {
        e.preventDefault();
        if (!invoiceDetails || !paidAmount) {
            toast.error('Please select an invoice and enter a paid amount.');
            return;
        }

        const paid = parseFloat(paidAmount);
        if (isNaN(paid) || paid <= 0) {
            toast.error('Invalid paid amount.');
            return;
        }
        
        if (paid > invoiceDetails.due_amount) {
            toast.error('Paid amount cannot be greater than due amount.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await window.electron.ipcRenderer.invoke('collect-due-payment', {
                invoiceId: invoiceDetails.id,
                paidAmount: paid,
                paymentMethod: 'Cash', // Assuming cash for now
                createdBy: user.username,
            });

            if (result.success) {
                toast.success('Due collected successfully!');
                // Navigate to receipt page
                navigate(`/due-receipt/${invoiceDetails.id}`);
            } else {
                toast.error('Failed to collect due.');
            }
        } catch (error) {
            console.error('Error collecting due:', error);
            toast.error('Failed to collect due.');
        } finally {
            setIsLoading(false);
        }
    };

    const pageStyle = {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        color: '#333', // Darker text color for the whole page
    };

    const containerStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '20px',
    };

    const cardStyle = {
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        color: '#333', // Darker text color for cards
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        fontSize: '14px',
        boxSizing: 'border-box',
    };

    const selectStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '40px',
        }),
        // Fix for text color in react-select
        singleValue: (provided) => ({
            ...provided,
            color: '#333',
        }),
        input: (provided) => ({
            ...provided,
            color: '#333',
        }),
    };

    return (
        <div style={pageStyle}>
            <h1>Collect Customer Due</h1>
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <h3>Search Invoice</h3>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        loadOptions={searchInvoices}
                        onChange={handleInvoiceSelect}
                        value={selectedInvoice}
                        placeholder="Search by Invoice ID..."
                        styles={selectStyles}
                    />
                </div>
                <div>
                    {invoiceDetails && (
                        <div style={cardStyle}>
                            <form onSubmit={handleCollectDue}>
                                <h3>Invoice Details</h3>
                                <p><strong>Invoice ID:</strong> {invoiceDetails.invoice_id}</p>
                                <p><strong>Customer:</strong> {invoiceDetails.customer_name}</p>
                                <p><strong>Phone:</strong> {invoiceDetails.customer_phone}</p>
                                <hr />
                                <p><strong>Total Amount:</strong> {invoiceDetails.payable_total.toFixed(2)}</p>
                                <p><strong>Paid Amount:</strong> {invoiceDetails.paid_amount.toFixed(2)}</p>
                                <p style={{ color: 'red', fontWeight: 'bold' }}>
                                    <strong>Due Amount:</strong> {invoiceDetails.due_amount.toFixed(2)}
                                </p>
                                <hr />
                                <h3>Collect Payment</h3>
                                <div style={{ margin: '20px 0' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Amount to Pay</label>
                                    <input
                                        type="number"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                        style={inputStyle}
                                        max={invoiceDetails.due_amount}
                                    />
                                </div>
                                <button type="submit" className="default-button" disabled={isLoading} style={{width: '100%'}}>
                                    {isLoading ? 'Processing...' : 'Collect Due'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectDue;