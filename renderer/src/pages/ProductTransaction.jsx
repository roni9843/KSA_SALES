import { useState, useEffect, useRef } from 'react';
import AsyncSelect from 'react-select/async';
import toast from 'react-hot-toast';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaExchangeAlt } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import Dropdown from '../components/common/Dropdown';

const PAGE_SIZE = 10;

const ProductTransaction = () => {
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
            const { rows, totalCount } = await window.electron.ipcRenderer.invoke('get-product-transactions', {
                productId: productId,
                startDate: format(start, 'yyyy-MM-dd'),
                endDate: format(end, 'yyyy-MM-dd'),
                page: page,
                limit: PAGE_SIZE
            });
            setReportData(rows || []);
            setTotalPages(Math.ceil((totalCount || 0) / PAGE_SIZE));
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

    const fetchAllReportData = async () => {
        if (!selectedProduct) {
            toast.error('Please select a product first.');
            return [];
        }
        setLoading(true);
        try {
            const startDate = format(dateRange[0].startDate, 'yyyy-MM-dd');
            const endDate = format(dateRange[0].endDate, 'yyyy-MM-dd');

            const { totalCount } = await window.electron.ipcRenderer.invoke('get-product-transactions', {
                productId: selectedProduct.value,
                startDate,
                endDate,
                page: 1,
                limit: 1
            });

            const allData = [];
            const totalPagesToFetch = Math.ceil(totalCount / PAGE_SIZE);
            for (let i = 1; i <= totalPagesToFetch; i++) {
                const { rows } = await window.electron.ipcRenderer.invoke('get-product-transactions', {
                    productId: selectedProduct.value,
                    startDate,
                    endDate,
                    page: i,
                    limit: PAGE_SIZE
                });
                allData.push(...rows);
            }
            return allData;
        } catch (error) {
            console.error('Error fetching all report data:', error);
            toast.error('Failed to fetch all report data.');
            return [];
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = async () => {
        const allData = await fetchAllReportData();
        if (allData.length === 0) {
            toast.error('No data to export.');
            return;
        }
        const headers = ['Date', 'Transaction Type', 'ID', 'Quantity', 'Previous Stock', 'New Stock'];
        const csvContent = [
            headers.join(','),
            ...allData.map(item => [
                new Date(item.date).toLocaleDateString(),
                item.type,
                item.id,
                item.quantity,
                item.pre_stock,
                item.new_stock
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `product_transaction_report_${selectedProduct.label}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = async () => {
        const allData = await fetchAllReportData();
        if (allData.length === 0) {
            toast.error('No data to export.');
            return;
        }

        const doc = new jsPDF();
        doc.text(`Product Transaction Report: ${selectedProduct.label}`, 14, 16);
        doc.text(`Date Range: ${format(dateRange[0].startDate, "yyyy-MM-dd")} to ${format(dateRange[0].endDate, "yyyy-MM-dd")}`, 14, 22);

        const tableColumn = ["Date", "Transaction Type", "ID", "Quantity", "Previous Stock", "New Stock"];
        const tableRows = [];

        allData.forEach(item => {
            const itemData = [
                new Date(item.date).toLocaleDateString(),
                item.type,
                item.id,
                item.quantity,
                item.pre_stock,
                item.new_stock
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
        });

        doc.save(`product_transaction_report_${selectedProduct.label}.pdf`);
    };

    const handleExportSelect = (option) => {
        if (option === 'csv') {
            exportToCSV();
        } else if (option === 'pdf') {
            exportToPDF();
        }
    };

    const exportOptions = [
        { label: 'Export as CSV', value: 'csv' },
        { label: 'Export as PDF', value: 'pdf' },
    ];

    return (
        <div style={styles.container}>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <FaExchangeAlt className="text-blue-600" /> Product Inventory Transaction Log
            </h2>
            <div style={styles.filters}>
                <div style={{ flex: 2 }}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Select Product</label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        loadOptions={loadProductOptions}
                        onChange={handleProductSelect}
                        placeholder="Type to search product..."
                        isClearable
                    />
                </div>
                <div style={{ flex: 2, position: 'relative' }}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Date Range</label>
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
                <button onClick={handleGenerateReport} disabled={loading || !selectedProduct} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all">
                    {loading ? 'Generating...' : 'Generate History'}
                </button>
                {reportData.length > 0 && <Dropdown options={exportOptions} onSelect={handleExportSelect} title="Export Report" />}
            </div>

            {selectedProduct && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 mt-4">
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Transaction Type</th>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Quantity</th>
                                <th style={styles.th}>Previous Stock</th>
                                <th style={styles.th}>New Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.length > 0 ? reportData.map((row, index) => (
                                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td style={styles.td}>{new Date(row.date).toLocaleDateString()}</td>
                                    <td style={{ ...styles.td, fontWeight: '700', color: row.type === 'SALE' ? '#ef4444' : '#10b981' }}>{row.type}</td>
                                    <td style={{ ...styles.td, fontWeight: '600', color: '#2563eb' }}>#{row.id}</td>
                                    <td style={{ ...styles.td, fontWeight: '700' }}>{row.quantity}</td>
                                    <td style={styles.td}>{row.pre_stock}</td>
                                    <td style={{ ...styles.td, fontWeight: '700', color: '#0f172a' }}>{row.new_stock}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No transactions found for the selected criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm disabled:opacity-50">
                        <FaChevronLeft />
                    </button>
                    <span className="text-xs font-semibold text-slate-600">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm disabled:opacity-50">
                        <FaChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '24px', background: '#ffffff', color: '#0f172a', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
    filters: { display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '20px' },
    dateInput: { width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '13px', cursor: 'pointer', outline: 'none' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8fafc' },
    th: { color: '#475569', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
    td: { padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#334155', fontSize: '14px' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' },
};

export default ProductTransaction;