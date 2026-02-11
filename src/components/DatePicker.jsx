import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.css';

/**
 * Custom DatePicker component configured for DD/MM/YYYY format
 * Wraps react-datepicker with consistent styling and format
 */
const DatePicker = ({ 
    value, 
    onChange, 
    placeholder = "DD/MM/YYYY",
    className = "",
    disabled = false,
    minDate = null,
    maxDate = null,
    required = false,
    ...props 
}) => {
    // Convert string value to Date object if needed
    const dateValue = value ? new Date(value) : null;

    const handleChange = (date) => {
        if (!date) {
            onChange({ target: { value: '' } });
            return;
        }
        
        // Convert to YYYY-MM-DD format for backend compatibility
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const isoDate = `${year}-${month}-${day}`;
        
        // Mimic input onChange event structure
        onChange({ target: { value: isoDate } });
    };

    return (
        <ReactDatePicker
            selected={dateValue}
            onChange={handleChange}
            dateFormat="dd/MM/yyyy"
            placeholderText={placeholder}
            className={`date-picker-input ${className}`}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            autoComplete="off"
            required={required}
            {...props}
        />
    );
};

export default DatePicker;
