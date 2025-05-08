import React from 'react';

const CustomScrollbar = ({ children, className = '' }) => (
  <div className={`overflow-y-auto custom-scrollbar ${className}`}>
    {children}
  </div>
);

export default CustomScrollbar;