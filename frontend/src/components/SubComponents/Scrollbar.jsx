import React from 'react';

const CustomScrollbar = ({ children, className = '' }) => (
  <div className={`overflow-y-auto ${className} custom-scrollbar`}>
    {children}
  </div>
);

export default CustomScrollbar;