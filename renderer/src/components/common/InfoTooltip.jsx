import { useState } from 'react';
import { FaInfoCircle, FaCalculator } from 'react-icons/fa';

const InfoTooltip = ({ title, content, formula, position = 'bottom' }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div 
            className="relative inline-block ml-2 select-none"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-full hover:bg-blue-50 focus:outline-none flex items-center justify-center cursor-pointer"
                title="ফিচার ও হিসেব জানার জন্য হোভার বা ক্লিক করুন"
            >
                <FaInfoCircle className="text-base animate-pulse" />
            </button>

            {isVisible && (
                <div 
                    className={`absolute z-50 w-80 p-4 bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-2xl shadow-2xl border border-slate-700/60 transition-all duration-200 ${
                        position === 'bottom' ? 'top-full mt-2 left-1/2 -translate-x-1/2' : 'bottom-full mb-2 left-1/2 -translate-x-1/2'
                    }`}
                >
                    {/* Arrow Pointer */}
                    <div 
                        className={`absolute w-3 h-3 bg-slate-900 border-l border-t border-slate-700/60 rotate-45 left-1/2 -translate-x-1/2 ${
                            position === 'bottom' ? '-top-1.5 border-r-0 border-b-0' : '-bottom-1.5 border-l-0 border-t-0'
                        }`}
                    ></div>

                    <div className="relative z-10 space-y-2">
                        {title && (
                            <h4 className="font-extrabold text-blue-400 text-xs flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                                <span>📌</span> {title}
                            </h4>
                        )}
                        
                        <p className="text-slate-300 leading-relaxed font-medium">
                            {content}
                        </p>

                        {formula && (
                            <div className="mt-2.5 p-2 bg-slate-800/90 rounded-xl border border-slate-700/80 font-mono text-[11px] text-amber-300">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <FaCalculator className="text-amber-400 text-[10px]" /> হিসাবের সূত্র (Formula):
                                </div>
                                <div className="bg-slate-950/80 p-2 rounded-lg text-amber-200 border border-slate-800">
                                    {formula}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InfoTooltip;
