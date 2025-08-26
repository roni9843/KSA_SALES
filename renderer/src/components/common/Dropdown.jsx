import { useState, useRef, useEffect } from 'react';

const Dropdown = ({ options, onSelect, title }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleSelect = (option) => {
        onSelect(option);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div style={styles.dropdown} ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="default-button">
                {title}
            </button>
            {isOpen && (
                <ul style={styles.dropdownMenu}>
                    {options.map((option, index) => (
                        <li key={index} onClick={() => handleSelect(option.value)} style={styles.dropdownMenuItem}>
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const styles = {
    dropdown: {
        position: 'relative',
        display: 'inline-block',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        backgroundColor: '#4A5568',
        borderRadius: '4px',
        listStyle: 'none',
        padding: '5px 0',
        margin: 0,
        minWidth: '150px',
        zIndex: 1000,
    },
    dropdownMenuItem: {
        padding: '10px 15px',
        cursor: 'pointer',
        color: '#fff',
    },
};

export default Dropdown;