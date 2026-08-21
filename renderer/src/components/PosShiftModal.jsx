import { useEffect, useState } from 'react';
import { FaCashRegister, FaTimes, FaLock, FaUnlock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PosShiftModal = ({ isOpen, onClose, onShiftUpdated }) => {
    const [currentShift, setCurrentShift] = useState(null);
    const [openingFloat, setOpeningFloat] = useState(200);
    const [actualCash, setActualCash] = useState('');

    const fetchCurrentShift = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/pos-shifts/current', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setCurrentShift(data.shift);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (isOpen) fetchCurrentShift();
    }, [isOpen]);

    const handleOpenShift = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/pos-shifts/open', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ openingFloat: parseFloat(openingFloat) || 0 })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('POS Shift opened successfully!');
                setCurrentShift(data.shift);
                if (onShiftUpdated) onShiftUpdated(data.shift);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCloseShift = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/pos-shifts/close', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ actualCash: parseFloat(actualCash) || 0 })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Shift Closed! Cash Variance: ${data.shift.variance} SAR`);
                setCurrentShift(null);
                if (onShiftUpdated) onShiftUpdated(null);
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={modalOverlay}>
            <div style={modalBox}>
                <div style={headerStyle}>
                    <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <FaCashRegister className="text-blue-600" /> POS Cashier Shift Management
                    </h3>
                    <button onClick={onClose} style={closeBtnStyle}><FaTimes /></button>
                </div>

                {currentShift ? (
                    /* SHIFT IS OPEN - CLOSE & RECONCILE */
                    <form onSubmit={handleCloseShift} className="space-y-4">
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                            <div className="flex justify-between items-center text-xs font-bold text-emerald-800 mb-2">
                                <span>Status: Active OPEN Shift ({currentShift.shiftNumber})</span>
                                <span><FaUnlock className="inline mr-1" /> Opened At: {new Date(currentShift.openedAt).toLocaleTimeString()}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-700 mt-3">
                                <div className="bg-white p-2 rounded-lg border">
                                    <span className="text-[10px] text-slate-400 block">Opening Float</span>
                                    <strong>{currentShift.openingFloat} SAR</strong>
                                </div>
                                <div className="bg-white p-2 rounded-lg border">
                                    <span className="text-[10px] text-slate-400 block">Cash Sales</span>
                                    <strong>{currentShift.cashSales || 0} SAR</strong>
                                </div>
                                <div className="bg-white p-2 rounded-lg border">
                                    <span className="text-[10px] text-slate-400 block">Expected Cash</span>
                                    <strong className="text-blue-600">{currentShift.expectedCash || currentShift.openingFloat} SAR</strong>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Counted Cash Drawer Total (SAR) <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Enter physical cash counted in drawer"
                                value={actualCash}
                                onChange={e => setActualCash(e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>

                        <button type="submit" style={closeShiftBtn}>
                            <FaLock className="mr-2 inline text-sm" /> Reconcile Cash & Close Shift
                        </button>
                    </form>
                ) : (
                    /* NO OPEN SHIFT - START SHIFT */
                    <form onSubmit={handleOpenShift} className="space-y-4">
                        <p className="text-xs text-slate-500">Enter the starting opening cash float inside the register drawer before starting sales.</p>
                        <div>
                            <label style={labelStyle}>Opening Float Amount (SAR) <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Opening cash float (e.g. 200.00)"
                                value={openingFloat}
                                onChange={e => setOpeningFloat(e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>

                        <button type="submit" style={openShiftBtn}>
                            <FaUnlock className="mr-2 inline text-sm" /> Start & Open POS Shift
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
};

const modalBox = {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '20px',
    width: 'clamp(400px, 45vw, 550px)',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
    marginBottom: '16px'
};

const closeBtnStyle = {
    border: 'none',
    background: '#f1f5f9',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b'
};

const labelStyle = {
    marginBottom: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '14px',
    outline: 'none',
};

const openShiftBtn = {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer'
};

const closeShiftBtn = {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer'
};

export default PosShiftModal;
