/**
 * Format a date string to a more readable format
 * @param dateString - ISO date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format: Month Day, Year at Hour:Minute AM/PM
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error';
  }
};

/**
 * Format a number as currency
 * @param value - Number to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  if (value === undefined || value === null) return 'N/A';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return 'Error';
  }
};

/**
 * Format a number with specified decimal places
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export const formatNumber = (value: number, decimals = 2): string => {
  if (value === undefined || value === null) return 'N/A';
  
  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    return 'Error';
  }
};

/**
 * Format a percentage value
 * @param value - Number to format as percentage
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercent = (value: number, decimals = 2): string => {
  if (value === undefined || value === null) return 'N/A';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return 'Error';
  }
}; 