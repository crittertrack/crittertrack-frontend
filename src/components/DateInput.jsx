import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DateInput.css';

/**
 * Consistent date input component using DD/MM/YYYY format
 * Wraps react-datepicker with standardized configuration
 */
const DateInput = ({ 
    value, 
    onChange, 
    name,
    min,
    max,
    required,
    disabled,
    className,
    placeholder = "DD/MM/YYYY",
    ...props 
}) => {
    // Convert string value to Date object
    const dateValue = value ? new Date(value) : null;
    
    // Convert min/max strings to Date objects
    const minDate = min ? new Date(min) : null;
    const maxDate = max ? new Date(max) : null;

    // Handle date change
    const handleChange = (date) => {
        if (onChange) {
            if (date) {
                // Convert to YYYY-MM-DD format for backend compatibility
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
                
                // Create synthetic event to match native input behavior
                const syntheticEvent = {
                    target: {
                        name: name,
                        value: formattedDate
                    }
                };
                onChange(syntheticEvent);
            } else {
                // Handle clearing the date
                const syntheticEvent = {
                    target: {
                        name: name,
                        value: ''
                    }
                };
                onChange(syntheticEvent);
            }
        }
    };

    return (
        <DatePicker
            selected={dateValue}
            onChange={handleChange}
            dateFormat="dd/MM/yyyy"
            placeholderText={placeholder}
            minDate={minDate}
            maxDate={maxDate}
            required={required}
            disabled={disabled}
            className={`date-input ${className || ''}`}
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            isClearable={!required}
            autoComplete="off"
            {...props}
        />
    );
};

export default DateInput;
