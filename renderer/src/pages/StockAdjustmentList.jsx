import React, { useState, useEffect, useRef } from 'react';
import { FaClipboardList, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const PAGE_SIZE = 5;

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
            <h2><FaClipboardList /> Stock Adjustment List</h2>

            <div style={styles.filters}>
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
                        <div ref={dateRangeRef} style={{ position: 'absolute', zIndex: 10, top: '100%', left: 0, color: '#000' }}>
                            <DateRange
                                editableDateInputs={true}
                                onChange={item => setDateRange([item.selection])}
                                moveRangeOnFirstSelection={false}
                                ranges={dateRange}
                            />
                        </div>
                    )}
                </div>
                <button onClick={handleGenerateReport} disabled={loading} className="default-button">
                    {loading ? 'Loading...' : 'Generate'}
                </button>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
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
                            <tr key={adj.id || index} style={styles.tr(index)}>
                                <td style={styles.td}>{new Date(adj.stock_adjustment_date).toLocaleDateString()}</td>
                                <td style={styles.td}>{adj.stock_adjustment_no}</td>
                                <td style={styles.td}>{adj.product_name}</td>
                                <td style={styles.td}>{adj.pre_stock}</td>
                                <td style={styles.td}>{adj.quantity}</td>
                                <td style={styles.td}>{adj.new_stock}</td>
                                <td style={styles.td}>{adj.adjusted_by}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No adjustments found for the selected criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="default-button">
                        <FaChevronLeft />
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="default-button">
                        <FaChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    card: { background: '#2D3748', padding: '20px', borderRadius: '4px', color: '#fff' },
    filters: { display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '20px' },
    dateInput: { width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#eeeeee', color: '#333', boxSizing: 'border-box', cursor: 'pointer' },
    tableContainer: { marginTop: '20px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #4A5568', textTransform: 'uppercase', fontSize: '12px' },
    tr: (index) => ({ backgroundColor: index % 2 === 0 ? '#374151' : '#2D3748' }),
    td: { padding: '12px', borderBottom: '1px solid #4A5568' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' },
};

export default StockAdjustmentList;