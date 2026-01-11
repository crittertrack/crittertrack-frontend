/**
 * Error handling utilities for moderation actions
 * Provides user-friendly error messages and retry capabilities
 */

/**
 * Extracts error information from API response
 * @param {Error} err - The error from axios
 * @returns {Object} - { message, errorCode, isRetryable, details }
 */
export function parseApiError(err) {
    const response = err?.response?.data;
    
    // If the backend returned structured error info, use it
    if (response?.errorCode) {
        return {
            message: response.message || 'An error occurred',
            errorCode: response.errorCode,
            isRetryable: response.isRetryable ?? false,
            details: response.details
        };
    }
    
    // Fallback for older error format or network errors
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        return {
            message: 'Network error. Please check your connection.',
            errorCode: 'NETWORK_ERROR',
            isRetryable: true,
            details: null
        };
    }
    
    if (err.response?.status === 401) {
        return {
            message: 'Your session has expired. Please log in again.',
            errorCode: 'SESSION_EXPIRED',
            isRetryable: false,
            details: null
        };
    }
    
    if (err.response?.status === 403) {
        return {
            message: 'You do not have permission to perform this action.',
            errorCode: 'PERMISSION_DENIED',
            isRetryable: false,
            details: null
        };
    }
    
    if (err.response?.status === 404) {
        return {
            message: response?.message || 'The requested item was not found.',
            errorCode: 'NOT_FOUND',
            isRetryable: false,
            details: null
        };
    }
    
    // Default error
    return {
        message: response?.message || response?.error || err.message || 'An unexpected error occurred',
        errorCode: 'UNKNOWN_ERROR',
        isRetryable: true,
        details: null
    };
}

/**
 * Error display component for moderation actions
 * Can be used to show consistent error UI with retry button
 */
export function formatErrorForDisplay(errorInfo) {
    const { message, errorCode, isRetryable } = errorInfo;
    
    // Add icon suggestion based on error type
    let icon = '⚠️';
    if (errorCode === 'NETWORK_ERROR' || errorCode === 'DATABASE_ERROR') {
        icon = '🔌';
    } else if (errorCode === 'PERMISSION_DENIED') {
        icon = '🚫';
    } else if (errorCode === 'NOT_FOUND') {
        icon = '🔍';
    } else if (errorCode === 'VALIDATION_ERROR') {
        icon = '📝';
    }
    
    return {
        icon,
        message,
        showRetry: isRetryable,
        errorCode
    };
}

/**
 * Creates a retry wrapper for async operations
 * @param {Function} operation - The async operation to retry
 * @param {Object} options - { maxRetries, delayMs, onRetry }
 */
export async function withRetry(operation, options = {}) {
    const { maxRetries = 2, delayMs = 1000, onRetry = null } = options;
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (err) {
            lastError = err;
            const errorInfo = parseApiError(err);
            
            // Don't retry non-retryable errors
            if (!errorInfo.isRetryable || attempt === maxRetries) {
                throw err;
            }
            
            // Notify about retry if callback provided
            if (onRetry) {
                onRetry(attempt + 1, maxRetries, errorInfo.message);
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
        }
    }
    
    throw lastError;
}

export default {
    parseApiError,
    formatErrorForDisplay,
    withRetry
};
