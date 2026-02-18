import React, { useMemo } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.css';

/**
 * Custom DatePicker component that respects browser locale
 * Wraps react-datepicker with consistent styling and locale-aware formatting
 */
const DatePicker = ({ 
    value, 
    onChange, 
    name,
    placeholder,
    className = "",
    disabled = false,
    minDate = null,
    maxDate = null,
    required = false,
    ...props 
}) => {
    // Detect user's locale and appropriate date format
    const { dateFormat, placeholderText } = useMemo(() => {
        const locale = navigator.language || 'en-US';
        const testDate = new Date(2024, 0, 31); // Jan 31, 2024
        const formatted = new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(testDate);
        
        // Determine format from the formatted string
        let format = 'MM/dd/yyyy'; // Default US
        let placeholder = 'MM/DD/YYYY';
        
        if (formatted.startsWith('31')) {
            // Day first (e.g., UK, AU, most of Europe)
            format = 'dd/MM/yyyy';
            placeholder = 'DD/MM/YYYY';
        } else if (formatted.startsWith('2024')) {
            // Year first (e.g., China, Japan, Korea)
            format = 'yyyy/MM/dd';
            placeholder = 'YYYY/MM/DD';
        }
        
        return { dateFormat: format, placeholderText: placeholder };
    }, []);

    // Parse date string safely without timezone issues
    // If value is YYYY-MM-DD, parse it as local date
    const dateValue = useMemo(() => {
        if (!value || value === '') return null;
        
        try {
            // If it's in YYYY-MM-DD format, parse as local date
            if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                const [year, month, day] = value.split('T')[0].split('-').map(Number);
                return new Date(year, month - 1, day);
            }
            
            // Otherwise try to parse normally
            const parsed = new Date(value);
            return isNaN(parsed.getTime()) ? null : parsed;
        } catch (e) {
            console.warn('[DatePicker] Failed to parse date:', value, e);
            return null;
        }
    }, [value]);

    console.log('[DatePicker] Render:', { name, value, dateValue, locale: navigator.language, format: dateFormat });

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
        // Use local date components to avoid timezone issues
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
            selected={dateValue}
            onChange={handleChange}
            dateFormat={dateFormat}
            placeholderText={placeholder || placeholderText}
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
