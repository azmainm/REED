/**
 * Common Utility Functions
 * 
 * A collection of commonly used utility functions for the Socrati application.
 * 
 * @module utils
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS classes conditionally using clsx and tailwind-merge
 * 
 * @param {...string} inputs - CSS class names or conditional class objects
 * @returns {string} - Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date into a readable string
 * 
 * @param {Date|string|number} date - Date to format (Date object, ISO string, or timestamp)
 * @param {Object} options - Formatting options
 * @param {boolean} [options.includeTime=false] - Whether to include time in the output
 * @param {string} [options.format='medium'] - Format style ('short', 'medium', 'long')
 * @returns {string} - Formatted date string
 */
export function formatDate(date, { includeTime = false, format = 'medium' } = {}) {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const options = {
      short: { day: 'numeric', month: 'short', year: 'numeric' },
      medium: { day: 'numeric', month: 'long', year: 'numeric' },
      long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    };
    
    const dateFormat = options[format] || options.medium;
    
    if (includeTime) {
      return dateObj.toLocaleString('en-US', {
        ...dateFormat,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    return dateObj.toLocaleDateString('en-US', dateFormat);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Truncates text to a specified length and adds ellipsis
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text with ellipsis if needed
 */
export function truncateText(text, maxLength) {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

/**
 * Formats a file size from bytes to human-readable format
 * 
 * @param {number} bytes - Size in bytes
 * @param {number} [decimals=2] - Number of decimal places to show
 * @returns {string} - Formatted file size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Generates a random string of specified length
 * 
 * @param {number} [length=8] - Length of the string to generate
 * @returns {string} - Random alphanumeric string
 */
export function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Debounces a function call to limit its execution frequency
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Time to wait in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
