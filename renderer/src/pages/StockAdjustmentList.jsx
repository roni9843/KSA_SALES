import { useState, useEffect, useRef } from 'react';
import { FaClipboardList, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const PAGE_SIZE = 10;

const StockAdjustmentList = () => {
    const [adjustments, setAdjustments] = useState([]);
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

    const fetchAdjustments = async (page = 1) => {
        setLoading(true);
        try {
            const result = await window.electron.ipcRenderer.invoke('get-stock-adjustments', {
                startDate: dateRange[0].startDate.toISOString().split('T')[0],
                endDate: dateRange[0].endDate.toISOString().split('T')[0],
                page: page,
                limit: PAGE_SIZE
            });
            setAdjustments(result?.rows || []);
            setTotalPages(Math.ceil((result?.totalCount || 0) / PAGE_SIZE));
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to fetch stock adjustments:', error);
            toast.error('Failed to fetch stock adjustments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdjustments(1);
    }, []);

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

    const handleGenerateReport = () => {
        fetchAdjustments(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchAdjustments(newPage);
        }
    };

    return (
        <div style={styles.card}>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <FaClipboardList className="text-blue-600" /> Stock Adjustment Log History
            </h2>

            <div style={styles.filters}>
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
                <button onClick={handleGenerateReport} disabled={loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all">
                    {loading ? 'Loading...' : 'Filter Log'}
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 mt-4">
                <table style={styles.table}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Adjustment No</th>
                            <th style={styles.th}>Product Name</th>
                            <th style={styles.th}>Prev Stock</th>
                            <th style={styles.th}>Adj Qty</th>
                            <th style={styles.th}>New Stock</th>
                            <th style={styles.th}>Adjusted By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adjustments.length > 0 ? adjustments.map((adj, index) => (
                            <tr key={adj.id || index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                <td style={styles.td}>{new Date(adj.stock_adjustment_date).toLocaleDateString()}</td>
                                <td style={{ ...styles.td, fontWeight: '700', color: '#2563eb' }}>{adj.stock_adjustment_no}</td>
                                <td style={{ ...styles.td, fontWeight: '700', color: '#0f172a' }}>{adj.product_name}</td>
                                <td style={styles.td}>{adj.pre_stock}</td>
                                <td style={{ ...styles.td, fontWeight: '700' }}>{adj.quantity}</td>
                                <td style={{ ...styles.td, fontWeight: '700', color: '#10b981' }}>{adj.new_stock}</td>
                                <td style={styles.td}>{adj.adjusted_by || 'Admin'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No stock adjustments found for the selected criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
    card: { background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
    filters: { display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '20px' },
    dateInput: { width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '13px', cursor: 'pointer', outline: 'none' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', fontSize: '11px', fontWeight: '700', color: '#475569' },
    td: { padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#334155', fontSize: '14px' },
    pagination: { display: 'flex', justify: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' },
};

export default StockAdjustmentList;