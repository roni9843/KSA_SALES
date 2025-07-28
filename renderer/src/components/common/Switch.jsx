const Switch = ({ checked, onChange, name }) => {
    const switchStyle = {
        position: 'relative',
        display: 'inline-block',
        width: '60px',
        height: '24px',
    };

    const inputStyle = {
        opacity: 0,
        width: 0,
        height: 0,
    };

    const sliderStyle = {
        position: 'absolute',
        cursor: 'pointer',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: checked ? '#27ae60' : '#ccc',
        transition: '.4s',
        borderRadius: '24px',
    };

    const knobStyle = {
        position: 'absolute',
        height: '18px',
        width: '18px',
        left: '3px',
        bottom: '3px',
        backgroundColor: 'white',
        transition: '.4s',
        borderRadius: '50%',
        transform: checked ? 'translateX(36px)' : 'translateX(0)',
    };

    return (
        <label style={switchStyle}>
            <input type="checkbox" name={name} checked={checked} onChange={onChange} style={inputStyle} />
            <span style={sliderStyle}>
                <span style={knobStyle}></span>
            </span>
        </label>
    );
};

export default Switch;