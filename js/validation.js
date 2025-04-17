/**
 * Validation Service
 * Provides validation functions for forms and inputs in the UnwrapLater app
 */
const ValidationService = (() => {
    // Regular expressions for common validations
    const REGEX = {
        EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        URL: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/,
        PHONE: /^(\+\d{1,3}[- ]?)?\d{10,14}$/,
        DATE: /^\d{4}-\d{2}-\d{2}$/,
        TIME: /^([01]\d|2[0-3]):([0-5]\d)$/,
        DATE_TIME: /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):([0-5]\d)$/,
        ALPHA: /^[a-zA-Z]+$/,
        ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
        NUMERIC: /^[0-9]+$/,
        INTEGER: /^-?\d+$/,
        DECIMAL: /^-?\d+(\.\d+)?$/,
        HEX_COLOR: /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/,
        PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    };
    
    // Validation rules
    const rules = {
        /**
         * Check if a value is required (not empty)
         * @param {*} value - The value to check
         * @param {Object} options - Options for the validation
         * @returns {boolean} Whether the validation passes
         */
        required: (value, options = {}) => {
            if (value === null || value === undefined) {
                return false;
            }
            
            if (typeof value === 'string') {
                return value.trim() !== '';
            }
            
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            
            return true;
        },
        
        /**
         * Check if a string matches a regex pattern
         * @param {string} value - The string to check
         * @param {Object} options - Options for the validation
         * @returns {boolean} Whether the validation passes
         */
        pattern: (value, options = {}) => {
            const { pattern } = options;
            
            if (!value || typeof value !== 'string') {
                return false;
            }
            
            if (!pattern || !(pattern instanceof RegExp)) {
                throw new Error('ValidationService: pattern option is required and must be a RegExp');
            }
            
            return pattern.test(value);
        },
        
        /**
         * Check if a value has a minimum length
         * @param {string|Array} value - The value to check
         * @param {Object} options - Options for the validation
         * @returns {boolean} Whether the validation passes
         */
        minLength: (value, options = {}) => {
            const { min = 0 } = options;
            
            if (value === null || value === undefined) {
                return false;
            }
            
            if (typeof value === 'string' || Array.isArray(value)) {
                return value.length >= min;
            }
            
            return false;
        },
        
        /**
         * Check if a value has a maximum length
         * @param {string|Array} value - The value to check
         * @param {Object} options - Options for the validation
         * @returns {boolean} Whether the validation passes
         */
        maxLength: (value, options = {}) => {
            const { max = Infinity } = options;
            
            if (value === null || value === undefined) {
                return true;
            }
            
            if (typeof value === 'string' || Array.isArray(value)) {
                return value.length <= max;
            }
            
            return false;
        },
        
        /**
         * Check if a value is greater than or equal to a minimum
         * @param {number} value - The value to check
         * @param {Object} options - Options for the validation
         * @returns {boolean} Whether the validation passes
         */
        min: (value, options = {}) => {
            const { min = 0 } = options;
            
            if (value === null || value === undefined || isNaN(Number(value))) {
                return false;
            }
            
            return Number(value) >= min;
        },
        
        /**
         * Check if a value is less than or equal to a maximum
         * @param {number} value - The value to check
         * @param {Object} options - Options for the validation
         * @returns {boolean} Whether the validation passes
         */
        max: (value, options = {}) => {
            const { max = Infinity } = options;
            
            if (value === null || value === undefined || isNaN(Number(value))) {
                return false;
            }
            
            return Number(value) <= max;
        },
        
        /**
         * Check if a value equals another value
         * @param {*} value - The value to check
         * @param {Object} options - Options for the validation
         * @returns {boolean} Whether the validation passes
         */
        equals: (value, options = {}) => {
            const { target, strict = false } = options;
            
            if (value === null || value === undefined) {
                return target === null || target === undefined;
            }
            
            return strict ? value === target : value == target;
        },
        
        /**
         * Check if a value is in a list of allowed values
         * @param {*} value - The value to check
         * @param {Object} options - Options for the validation
         * @returns {boolean} Whether the validation passes
         */
        oneOf: (value, options = {}) => {
            const { values = [] } = options;
            
            if (!Array.isArray(values)) {
                throw new Error('ValidationService: values option must be an array');
            }
            
            return values.includes(value);
        },
        
        /**
         * Check if a value is an email address
         * @param {string} value - The value to check
         * @returns {boolean} Whether the validation passes
         */
        email: (value) => {
            return rules.pattern(value, { pattern: REGEX.EMAIL });
        },
        
        /**
         * Check if a value is a valid URL
         * @param {string} value - The value to check
         * @returns {boolean} Whether the validation passes
         */
        url: (value) => {
            return rules.pattern(value, { pattern: REGEX.URL });
        },
        
        /**
         * Check if a value is a valid phone number
         * @param {string} value - The value to check
         * @returns {boolean} Whether the validation passes
         */
        phone: (value) => {
            return rules.pattern(value, { pattern: REGEX.PHONE });
        },
        
        /**
         * Check if a value is a valid date string (YYYY-MM-DD)
         * @param {string} value - The value to check
         * @returns {boolean} Whether the validation passes
         */
        date: (value) => {
            if (!rules.pattern(value, { pattern: REGEX.DATE })) {
                return false;
            }
            
            // Check if it's a valid date
            const date = new Date(value);
            return !isNaN(date.getTime());
        },
        
        /**
         * Check if a value is a valid time string (HH:MM)
         * @param {string} value - The value to check
         * @returns {boolean} Whether the validation passes
         */
        time: (value) => {
            return rules.pattern(value, { pattern: REGEX.TIME });
        },
        
        /**
         * Check if a value is a valid date-time string (YYYY-MM-DDTHH:MM)
         * @param {string} value - The value to check
         * @returns {boolean} Whether the validation passes
         */
        dateTime: (value) => {
            if (!rules.pattern(value, { pattern: REGEX.DATE_TIME })) {
                return false;
            }
            
            // Check if it's a valid date
            const date = new Date(value);
            return !isNaN(date.getTime());
        },
        
        /**
         * Check if a value contains only alpha characters
         * @param {string} value - The value to check
         * @returns {boolean} Whether the validation passes
         */
        alpha: (value) => {
            return rules.pattern(value, { pattern: REGEX.ALPHA });
        },
        
        /**
         * Check if a value contains only alphanumeric characters
         * @param {string} value - The value to check
         * @returns {boolean} Whether the validation passes
         */
        alphanumeric: (value) => {
            return rules.pattern(value, { pattern: REGEX.ALPHANUMERIC });
        },
        
        /**
         * Check if a value contains only numeric characters
         * @param {string} value - The value to check
         * @returns {boolean} Whether the validation passes
         */
        numeric: (value) => {
            return rules.pattern(value, { pattern: REGEX.NUMERIC });
        },
        
        /**
         * Check if a value is an integer
         * @param {string|number} value - The value to check
         * @returns {boolean} Whether the validation passes
         */
        integer: (value) => {
            if (typeof value === 'number') {
                return Number.isInteger(value);
            }
            
            return rules.pattern(value, { pattern: REGEX.INTEGER });
        },
        
        /**
         * Check if a value is a decimal number
         * @param {string|number} value - The value to check
         * @returns {boolean} Whether the validation passes
         */
        decimal: (value) => {
            if (typeof value === 'number') {
                return isFinite(value);
            }
            
            return rules.pattern(value, { pattern: REGEX.DECIMAL });
        },
        
        /**
         * Check if a value is a valid hex color
         * @param {string} value - The value to check
         * @returns {boolean} Whether the validation passes
         */
        hexColor: (value) => {
            return rules.pattern(value, { pattern: REGEX.HEX_COLOR });
        },
        
        /**
         * Check if a value is a valid password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
         * @param {string} value - The value to check
         * @returns {boolean} Whether the validation passes
         */
        password: (value) => {
            return rules.pattern(value, { pattern: REGEX.PASSWORD });
        },
        
        /**
         * Check if a custom validation function passes
         * @param {*} value - The value to check
         * @param {Object} options - Options for the validation
         * @returns {boolean} Whether the validation passes
         */
        custom: (value, options = {}) => {
            const { validator } = options;
            
            if (typeof validator !== 'function') {
                throw new Error('ValidationService: validator option must be a function');
            }
            
            return validator(value);
        }
    };
    
    /**
     * Validate a value against a set of rules
     * @param {*} value - The value to validate
     * @param {Object} validations - Validation rules to apply
     * @returns {Object} Validation result with isValid and errors properties
     */
    const validate = (value, validations = {}) => {
        const errors = [];
        
        // Run each validation rule
        Object.keys(validations).forEach(ruleName => {
            // Get rule configuration
            const ruleConfig = validations[ruleName];
            const options = typeof ruleConfig === 'object' ? ruleConfig : {};
            const message = options.message || `Validation failed for rule: ${ruleName}`;
            
            // Skip if rule doesn't exist
            if (!rules[ruleName]) {
                console.warn(`ValidationService: unknown rule "${ruleName}"`);
                return;
            }
            
            // Run the validation rule
            const isValid = rules[ruleName](value, options);
            
            if (!isValid) {
                errors.push({ rule: ruleName, message });
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    };
    
    /**
     * Validate a form object with multiple fields
     * @param {Object} formData - Form data to validate
     * @param {Object} formValidations - Validation rules for each field
     * @returns {Object} Validation result with isValid and errors properties
     */
    const validateForm = (formData, formValidations) => {
        const result = {
            isValid: true,
            errors: {}
        };
        
        // Validate each field
        Object.keys(formValidations).forEach(fieldName => {
            const fieldValue = formData[fieldName];
            const fieldRules = formValidations[fieldName];
            
            const fieldResult = validate(fieldValue, fieldRules);
            
            if (!fieldResult.isValid) {
                result.isValid = false;
                result.errors[fieldName] = fieldResult.errors;
            }
        });
        
        return result;
    };
    
    /**
     * Check if a value passes a single validation rule
     * @param {*} value - The value to validate
     * @param {string} ruleName - The name of the rule to check
     * @param {Object} options - Options for the validation
     * @returns {boolean} Whether the validation passes
     */
    const check = (value, ruleName, options = {}) => {
        if (!rules[ruleName]) {
            console.warn(`ValidationService: unknown rule "${ruleName}"`);
            return false;
        }
        
        return rules[ruleName](value, options);
    };
    
    // Public API
    return {
        validate,
        validateForm,
        check,
        REGEX
    };
})(); 