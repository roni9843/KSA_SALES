import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


function InvoicePrint() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [details, setDetails] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await window.electron.ipcRenderer.invoke('get-invoice', parseInt(id));
                console.log('Invoice Response:', res);
                setInvoice(res.invoice);
                setDetails(res.details);
            } catch (e) {
                console.error('Error fetching invoice:', e);
            }
        }
        fetchData();
    }, [id]);


    useEffect(() => {
        async function testIPC() {
            try {
                const res = await window.electron.ipcRenderer.invoke('ping');
                console.log('Ping response:', res);
            } catch (e) {
                console.error('Ping error:', e);
            }
        }
        testIPC();
    }, []);


    if (!invoice) return <p>Loading...</p>;

    const handlePrint = () => {
        window.print();

        // Delay করে redirect (1s পর)
        setTimeout(() => {
            navigate('/');
        }, 1000);
    };

    return (
        <div id="invoice-a4" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial', color: '#333' }}>
            <h2 style={{ textAlign: 'center' }}>Moto POS Invoice</h2>
            <p><strong>Invoice ID:</strong> {invoice.id}</p>
            <p><strong>Date:</strong> {invoice.created_at}</p>
            <p><strong>Customer:</strong> {invoice.customer_name}</p>

            <table width="100%" border="1" cellPadding="6" style={{ marginTop: '20px', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {details.map((item, i) => (
                        <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{item.product_name}</td>
                            <td>{item.quantity}</td>
                            <td>{item.unit_price}</td>
                            <td>{item.total_price.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <p>Tax: {invoice.tax.toFixed(2)}</p>
                <p>Discount: {invoice.discount.toFixed(2)}</p>
                <p><strong>Total: {invoice.total.toFixed(2)}</strong></p>
                <p>Paid: {invoice.paid.toFixed(2)}</p>
                <p><strong>Due: {(invoice.total - invoice.paid).toFixed(2)}</strong></p>
            </div>

            <button onClick={handlePrint}>🖨️ Print</button>
        </div>
    );
}

export default InvoicePrint;
