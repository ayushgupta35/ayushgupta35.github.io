import React from 'react';

const ReorderButtons = ({ index, length, onMoveUp, onMoveDown, disabled = false }) => {
  const buttonStyle = {
    backgroundColor: '#4B2E83', // Purple background
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#4B2E83',
    borderRadius: '4px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontSize: '16px',
    color: 'white', // White arrows
    margin: '0 2px',
    transition: 'all 0.2s ease'
  };

  const enabledButtonStyle = {
    ...buttonStyle
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
    color: '#ffffff'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <button
        onClick={() => onMoveUp(index)}
        disabled={disabled || index === 0}
        style={disabled || index === 0 ? disabledButtonStyle : enabledButtonStyle}
        title="Move up"
        onMouseEnter={(e) => {
          if (!disabled && index !== 0) {
            e.target.style.backgroundColor = '#3A2266'; // Darker purple on hover
            e.target.style.borderColor = '#3A2266';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && index !== 0) {
            e.target.style.backgroundColor = '#4B2E83';
            e.target.style.borderColor = '#4B2E83';
          }
        }}
      >
        ▲
      </button>
      <button
        onClick={() => onMoveDown(index)}
        disabled={disabled || index === length - 1}
        style={disabled || index === length - 1 ? disabledButtonStyle : enabledButtonStyle}
        title="Move down"
        onMouseEnter={(e) => {
          if (!disabled && index !== length - 1) {
            e.target.style.backgroundColor = '#3A2266'; // Darker purple on hover
            e.target.style.borderColor = '#3A2266';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && index !== length - 1) {
            e.target.style.backgroundColor = '#4B2E83';
            e.target.style.borderColor = '#4B2E83';
          }
        }}
      >
        ▼
      </button>
    </div>
  );
};

export default ReorderButtons;
