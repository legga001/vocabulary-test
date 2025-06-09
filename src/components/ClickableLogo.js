// src/components/ClickableLogo.js
import React from 'react';

function ClickableLogo({ onLogoClick, className = "app-logo" }) {
  const handleClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
  };

  return (
    <div className="logo-container">
      <img 
        src="/purple_fox_transparent.png" 
        alt="Mr. Fox English - Click to go home" 
        className={`${className} clickable-logo`}
        onClick={handleClick}
        title="Return to main menu"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      />
    </div>
  );
}

export default ClickableLogo;
