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
    name,
    placeholder = "DD/MM/YYYY",
    className = "",
    disabled = false,
    minDate = null,
    maxDate = null,
    required = false,
    ...props 
}) => {
    // Convert string value to Date object if needed
    // Handle empty strings and invalid dates
    const dateValue = (value && value !== '') ? new Date(value) : null;
    const isValidDate = dateValue && !isNaN(dateValue.getTime());

    console.log('[DatePicker] Render:', { name, value, dateValue, isValidDate });

    const handleChange = (date) => {
        console.log('[DatePicker] handleChange called with:', date, 'name:', name);
        if (!date) {
            console.log('[DatePicker] Empty date, clearing value');
            const event = { target: { value: '' } };
            if (name) event.target.name = name;
            onChange(event);
            return;
        }
        
        // Convert to YYYY-MM-DD format for backend compatibility
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const isoDate = `${year}-${month}-${day}`;
        
        console.log('[DatePicker] Calling onChange with:', isoDate);
        // Mimic input onChange event structure - include name if provided
        const event = { target: { value: isoDate } };
        if (name) event.target.name = name;
        onChange(event);
    };

    return (
        <ReactDatePicker
            selected={isValidDate ? dateValue : null}
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
