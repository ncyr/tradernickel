import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

interface ValidationRules {
  [key: string]: ValidationRule[];
}

interface Errors {
  [key: string]: string[];
}

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: any) => {
    if (!validationRules[name]) {
      return [];
    }

    return validationRules[name]
      .map(rule => {
        if (rule.required && !value) {
          return rule.message;
        }
        if (rule.minLength && String(value).length < rule.minLength) {
          return rule.message;
        }
        if (rule.maxLength && String(value).length > rule.maxLength) {
          return rule.message;
        }
        if (rule.pattern && !rule.pattern.test(String(value))) {
          return rule.message;
        }
        if (rule.custom && !rule.custom(value)) {
          return rule.message;
        }
        return null;
      })
      .filter(Boolean) as string[];
  }, [validationRules]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    const fieldErrors = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldErrors }));
  }, [validateField]);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldErrors = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: fieldErrors }));
  }, [validateField, values]);

  const validateForm = useCallback(() => {
    const newErrors: Errors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const fieldErrors = validateField(fieldName, values[fieldName]);
      if (fieldErrors.length > 0) {
        isValid = false;
        newErrors[fieldName] = fieldErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField, values, validationRules]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setValues,
  };
};

// Common validation rules
export const commonValidationRules = {
  required: (message = 'This field is required') => ({
    required: true,
    message,
  }),
  minLength: (length: number, message = `Minimum length is ${length} characters`) => ({
    minLength: length,
    message,
  }),
  maxLength: (length: number, message = `Maximum length is ${length} characters`) => ({
    maxLength: length,
    message,
  }),
  email: (message = 'Please enter a valid email address') => ({
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message,
  }),
  url: (message = 'Please enter a valid URL') => ({
    pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    message,
  }),
  number: (message = 'Please enter a valid number') => ({
    pattern: /^-?\d*\.?\d*$/,
    message,
  }),
  integer: (message = 'Please enter a valid integer') => ({
    pattern: /^-?\d*$/,
    message,
  }),
  password: (message = 'Password must be at least 8 characters long and contain at least one number and one letter') => ({
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    message,
  }),
}; 