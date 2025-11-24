#!/usr/bin/env node
/**
 * Cron Expression Parser
 * 
 * Parses a standard cron expression and expands each field to show the times at which it will run.
 */

/**
 * Validate that a value is within the allowed range.
 * 
 * @param {number} value - The value to validate
 * @param {number} minVal - Minimum valid value
 * @param {number} maxVal - Maximum valid value
 * @param {string} fieldName - Name of the field for error messages
 */
function validateValue(value, minVal, maxVal, fieldName) {
    if (isNaN(value)) {
        throw new Error(`Invalid value in ${fieldName}: not a valid number`);
    }
    if (value < minVal || value > maxVal) {
        throw new Error(`Value ${value} in ${fieldName} is out of range (${minVal}-${maxVal})`);
    }
}

/**
 * Parse a cron field and return an array of values.
 * 
 * @param {string} field - The cron field string
 * @param {number} minVal - Minimum valid value for this field
 * @param {number} maxVal - Maximum valid value for this field
 * @param {string} fieldName - Name of the field for error messages
 * @returns {number[]} Array of integers representing the expanded values
 */
function parseField(field, minVal, maxVal, fieldName = 'field') {
    // Validate input
    if (!field || typeof field !== 'string') {
        throw new Error(`Invalid ${fieldName}: field cannot be empty`);
    }
    
    // Trim whitespace
    field = field.trim();
    
    if (field.length === 0) {
        throw new Error(`Invalid ${fieldName}: field cannot be empty`);
    }
    
    const values = [];
    
    // Handle asterisk (all values)
    if (field === '*') {
        return Array.from({ length: maxVal - minVal + 1 }, (_, i) => minVal + i);
    }
    
    // Handle step values (*/n or range/n)
    if (field.includes('/')) {
        const parts = field.split('/');
        
        if (parts.length !== 2) {
            throw new Error(`Invalid ${fieldName}: malformed step expression`);
        }
        
        const [range, stepStr] = parts;
        const step = parseInt(stepStr, 10);
        
        if (isNaN(step) || step <= 0) {
            throw new Error(`Invalid ${fieldName}: step value must be a positive number`);
        }
        
        let start, end;
        if (range === '*') {
            start = minVal;
            end = maxVal;
        } else if (range.includes('-')) {
            const rangeParts = range.split('-');
            if (rangeParts.length !== 2) {
                throw new Error(`Invalid ${fieldName}: malformed range in step expression`);
            }
            start = parseInt(rangeParts[0], 10);
            end = parseInt(rangeParts[1], 10);
            validateValue(start, minVal, maxVal, fieldName);
            validateValue(end, minVal, maxVal, fieldName);
            
            if (start > end) {
                throw new Error(`Invalid ${fieldName}: range start (${start}) is greater than end (${end})`);
            }
        } else {
            start = parseInt(range, 10);
            validateValue(start, minVal, maxVal, fieldName);
            end = maxVal;
        }
        
        if (step > (end - start)) {
            throw new Error(`Invalid ${fieldName}: step value (${step}) is larger than range (${start}-${end})`);
        }
        
        for (let i = start; i <= end; i += step) {
            values.push(i);
        }
        
        if (values.length === 0) {
            throw new Error(`Invalid ${fieldName}: step expression produced no values`);
        }
        
        return values;
    }
    
    // Handle ranges (n-m)
    if (field.includes('-')) {
        const parts = field.split('-');
        
        if (parts.length !== 2) {
            throw new Error(`Invalid ${fieldName}: malformed range expression`);
        }
        
        const [startStr, endStr] = parts;
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        
        validateValue(start, minVal, maxVal, fieldName);
        validateValue(end, minVal, maxVal, fieldName);
        
        if (start > end) {
            throw new Error(`Invalid ${fieldName}: range start (${start}) is greater than end (${end})`);
        }
        
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    
    // Handle lists (n,m,p)
    if (field.includes(',')) {
        const parts = field.split(',');
        const listValues = [];
        
        for (const part of parts) {
            if (!part.trim()) {
                throw new Error(`Invalid ${fieldName}: empty value in list`);
            }
            const value = parseInt(part.trim(), 10);
            validateValue(value, minVal, maxVal, fieldName);
            listValues.push(value);
        }
        
        if (listValues.length === 0) {
            throw new Error(`Invalid ${fieldName}: list cannot be empty`);
        }
        
        return [...new Set(listValues)].sort((a, b) => a - b);
    }
    
    // Single value
    const value = parseInt(field, 10);
    validateValue(value, minVal, maxVal, fieldName);
    return [value];
}

/**
 * Parse a cron expression string.
 * 
 * @param {string} cronString - A cron expression string
 * @returns {Object} Object with field names as keys and expanded values as values
 */
function parseCron(cronString) {
    // Validate input
    if (!cronString || typeof cronString !== 'string') {
        throw new Error('Invalid cron expression: must be a non-empty string');
    }
    
    // Trim and normalize whitespace
    cronString = cronString.trim().replace(/\s+/g, ' ');
    
    if (cronString.length === 0) {
        throw new Error('Invalid cron expression: cannot be empty');
    }
    
    const parts = cronString.split(' ');
    
    if (parts.length < 6) {
        throw new Error('Invalid cron expression: must have 5 time fields and a command');
    }
    
    const [minute, hour, dayOfMonth, month, dayOfWeek, ...commandParts] = parts;
    const command = commandParts.join(' ');
    
    // Validate command is not empty
    if (!command || command.trim().length === 0) {
        throw new Error('Invalid cron expression: command cannot be empty');
    }
    
    // Parse each field with validation
    try {
        return {
            'minute': parseField(minute, 0, 59, 'minute'),
            'hour': parseField(hour, 0, 23, 'hour'),
            'day of month': parseField(dayOfMonth, 1, 31, 'day of month'),
            'month': parseField(month, 1, 12, 'month'),
            'day of week': parseField(dayOfWeek, 0, 6, 'day of week'),
            'command': command
        };
    } catch (error) {
        // Re-throw with more context if needed
        throw error;
    }
}

/**
 * Format the parsed cron data as a table.
 * 
 * @param {Object} parsedCron - Object with field names and their expanded values
 */
function formatOutput(parsedCron) {
    const fieldWidth = 14;
    const fields = ['minute', 'hour', 'day of month', 'month', 'day of week', 'command'];
    
    for (const fieldName of fields) {
        const value = parsedCron[fieldName];
        
        // Format the value part
        const valueStr = Array.isArray(value) ? value.join(' ') : value;
        
        // Print with field name padded to 14 characters
        console.log(fieldName.padEnd(fieldWidth) + valueStr);
    }
}

/**
 * Main entry point for the cron parser.
 */
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('Usage: node cron-parser.js "<cron_expression>"');
        console.error('Example: node cron-parser.js "*/15 0 1,15 * 1-5 /usr/bin/find"');
        process.exit(1);
    }
    
    if (args.length > 1) {
        console.error('Error: Too many arguments. Cron expression must be quoted as a single argument.');
        console.error('Usage: node cron-parser.js "<cron_expression>"');
        console.error('Example: node cron-parser.js "*/15 0 1,15 * 1-5 /usr/bin/find"');
        process.exit(1);
    }
    
    try {
        const cronString = args[0];
        const parsed = parseCron(cronString);
        formatOutput(parsed);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseField, parseCron, formatOutput };
}

// Run main if executed directly
if (require.main === module) {
    main();
}
