import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import toast from 'react-hot-toast';
import { FaMoneyBillWave, FaCreditCard, FaUniversity } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';

const CollectDue = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceDetails, setInvoiceDetails] = useState(null);
    const [paidByCash, setPaidByCash] = useState('');
    const [paidByCard, setPaidByCard] = useState('');
    const [paidByBank, setPaidByBank] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const searchInvoices = async (inputValue) => {
        if (!inputValue) return [];
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
            setPaidByCash(details.due_amount.toFixed(2));
            setPaidByCard('');
            setPaidByBank('');
        } else {
            setInvoiceDetails(null);
            setPaidByCash('');
            setPaidByCard('');
            setPaidByBank('');
        }
    };

    const handleCollectDue = async (e) => {
        e.preventDefault();
        if (!invoiceDetails) {
            toast.error('Please select an invoice.');
            return;
        }

        const cash = parseFloat(paidByCash) || 0;
        const card = parseFloat(paidByCard) || 0;
        const bank = parseFloat(paidByBank) || 0;
        const totalPaid = cash + card + bank;

        if (totalPaid <= 0) {
            toast.error('Please enter a valid paid amount.');
            return;
        }

        if (totalPaid > invoiceDetails.due_amount) {
            toast.error('Paid amount cannot be greater than the due amount.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await window.electron.ipcRenderer.invoke('collect-due-payment', {
                invoiceId: invoiceDetails.id,
                paidByCash: cash,
                paidByCard: card,
                paidByBank: bank,
                createdBy: user.username,
            });

            if (result.success) {
                toast.success('Due collected successfully!');
                navigate(`/due-receipt/${invoiceDetails.id}`);
            } else {
                toast.error(result.message || 'Failed to collect due.');
            }
        } catch (error) {
            console.error('Error collecting due:', error);
            toast.error(error.message || 'Failed to collect due.');
        } finally {
            setIsLoading(false);
        }
    };

    const pageStyle = { padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333' };
    const containerStyle = { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' };
    const cardStyle = { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#333' };
    const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' };
    const selectStyles = {
        control: (provided) => ({ ...provided, minHeight: '40px', color: '#333' }),
        singleValue: (provided) => ({ ...provided, color: '#333' }),
        input: (provided) => ({ ...provided, color: '#333' }),
    };
    const paymentGroupStyle = { display: 'flex', flexDirection: 'column' };
    const paymentLabelStyle = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.9em' };

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
                                <div style={{ marginTop: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px' }}>Payment Details</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                        <div style={paymentGroupStyle}>
                                            <label style={paymentLabelStyle}><FaMoneyBillWave /> Cash</label>
                                            <input type="number" placeholder="0.00" value={paidByCash} onChange={(e) => setPaidByCash(e.target.value)} style={inputStyle} />
                                        </div>
                                        <div style={paymentGroupStyle}>
                                            <label style={paymentLabelStyle}><FaCreditCard /> Card</label>
                                            <input type="number" placeholder="0.00" value={paidByCard} onChange={(e) => setPaidByCard(e.target.value)} style={inputStyle} />
                                        </div>
                                        <div style={paymentGroupStyle}>
                                            <label style={paymentLabelStyle}><FaUniversity /> Bank</label>
                                            <input type="number" placeholder="0.00" value={paidByBank} onChange={(e) => setPaidByBank(e.target.value)} style={inputStyle} />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="default-button" disabled={isLoading} style={{ width: '100%', marginTop: '20px' }}>
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
