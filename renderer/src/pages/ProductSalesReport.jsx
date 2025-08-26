import { useState, useEffect, useRef } from 'react';
import AsyncSelect from 'react-select/async';
import toast from 'react-hot-toast';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const PAGE_SIZE = 5;

const ProductSalesReport = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const dateRangeRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [dateRange, setDateRange] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    }]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dateRangeRef.current && !dateRangeRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dateRangeRef]);

    const loadProductOptions = async (inputValue) => {
        if (inputValue.length < 2) return [];
        try {
            const results = await window.electron.ipcRenderer.invoke('search-products-for-invoice', inputValue);
            return results.map(p => ({
                value: p.id,
                label: `${p.name} (SKU: ${p.sku || 'N/A'})`,
                product: p
            }));
        } catch (error) {
            console.error('Error searching products:', error);
            toast.error('Failed to search for products.');
            return [];
        }
    };

    const fetchReport = async (productId, start, end, page = 1) => {
        setLoading(true);
        try {
            const { rows, totalCount } = await window.electron.ipcRenderer.invoke('get-product-sales-report', {
                productId: productId,
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
                page: page,
                limit: PAGE_SIZE
            });
            setReportData(rows);
            setTotalPages(Math.ceil(totalCount / PAGE_SIZE));
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error('Failed to generate report.');
        } finally {
            setLoading(false);
        }
    };

    const handleProductSelect = (selectedOption) => {
        setSelectedProduct(selectedOption);
        if (selectedOption) {
            fetchReport(selectedOption.value, dateRange[0].startDate, dateRange[0].endDate, 1);
        } else {
            setReportData([]);
            setTotalPages(0);
        }
    };

    const handleGenerateReport = () => {
        if (!selectedProduct) {
            toast.error('Please select a product first.');
            return;
        }
        fetchReport(selectedProduct.value, dateRange[0].startDate, dateRange[0].endDate, 1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchReport(selectedProduct.value, dateRange[0].startDate, dateRange[0].endDate, newPage);
        }
    };

    const totalQuantity = reportData.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = reportData.reduce((sum, item) => sum + item.total_price, 0);

    return (
        <div style={styles.container}>
            <h2>Product Wise Sales Report</h2>
            <div style={styles.filters}>
                <div style={{ flex: 2 }}>
                    <label>Select Product</label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        loadOptions={loadProductOptions}
                        onChange={handleProductSelect}
                        placeholder="Type to search for a product..."
                        isClearable
                    />
                </div>
                <div style={{ flex: 2, position: 'relative' }}>
                    <label>Date Range</label>
                    <input
                        type="text"
                        readOnly
                        value={`${format(dateRange[0].startDate, "yyyy-MM-dd")} to ${format(dateRange[0].endDate, "yyyy-MM-dd")}`}
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        style={styles.dateInput}
                    />
                    {isCalendarOpen && (
                        <div ref={dateRangeRef} style={{ position: 'absolute', zIndex: 10, top: '100%', left: 0 }}>
                            <DateRange
                                editableDateInputs={true}
                                onChange={item => setDateRange([item.selection])}
                                moveRangeOnFirstSelection={false}
                                ranges={dateRange}
                            />
                        </div>
                    )}
                </div>
                <button onClick={handleGenerateReport} disabled={loading || !selectedProduct} className="default-button">
                    {loading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>

            {selectedProduct && (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Invoice ID</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Quantity</th>
                                <th style={styles.th}>Unit Price</th>
                                <th style={styles.th}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.length > 0 ? reportData.map((row, index) => (
                                <tr key={index}>
                                    <td style={styles.td}>{row.invoice_id}</td>
                                    <td style={styles.td}>{new Date(row.invoice_date).toLocaleDateString()}</td>
                                    <td style={styles.td}>{row.quantity}</td>
                                    <td style={styles.td}>{row.price.toFixed(2)}</td>
                                    <td style={styles.td}>{row.total_price.toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No sales data found for the selected criteria.</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="2" style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold' }}>Total (Page):</td>
                                <td style={{ ...styles.td, fontWeight: 'bold' }}>{totalQuantity}</td>
                                <td style={styles.td}></td>
                                <td style={{ ...styles.td, fontWeight: 'bold' }}>{totalValue.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="default-button">
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="default-button">
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px', background: '#2D3748', color: '#fff', borderRadius: '4px' },
    filters: { display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '20px' },
    dateInput: { width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#eeeeee', color: '#333', boxSizing: 'border-box', cursor: 'pointer' },
    tableContainer: { marginTop: '20px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#4A5568', color: '#fff', padding: '12px', textAlign: 'left' },
    td: { padding: '12px', borderBottom: '1px solid #4A5568' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' },
};

export default ProductSalesReport;