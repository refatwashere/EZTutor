/**
 * Input validation middleware
 * Validates request body against schema
 */
import { validateEmail, validatePassword, validateSubject, validateTopic, validateTitle, validateRequired, validateId } from '../utils/validators.js';

/**
 * Middleware to validate request body against a schema
 * @param {Object} schema - Validation schema { fieldName: validatorFunction }
 * @returns {Function} Express middleware
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const errors = {};

    for (const [field, validator] of Object.entries(schema)) {
      if (!validator(req.body[field])) {
        errors[field] = `Invalid ${field}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
  };
};

/**
 * Schema definitions for common validations
 */
export const schemas = {
  // Auth schemas
  register: {
    email: validateEmail,
    password: validatePassword,
    firstName: validateRequired,
    lastName: validateRequired,
  },
  login: {
    email: validateEmail,
    password: validatePassword,
  },

  // Lesson Plan schemas
  createLesson: {
    subject: validateSubject,
    topic: validateTopic,
  },
  updateLesson: {
    title: validateTitle,
    description: validateRequired,
  },

  // Quiz schemas
  createQuiz: {
    topic: validateTopic,
    difficulty: validateRequired,
  },
  updateQuiz: {
    title: validateTitle,
    description: validateRequired,
  },

  // Export schemas
  export: {
    contentType: validateRequired,
    contentId: validateId,
  },
};

/**
 * Custom validation middleware factories
 */
export const createValidateEmailMiddleware = () => {
  return (req, res, next) => {
    if (!validateEmail(req.body.email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    next();
  };
};

export const createValidateIdParamMiddleware = (paramName = 'id') => {
  return (req, res, next) => {
    if (!validateId(req.params[paramName])) {
      return res.status(400).json({ error: `Invalid ${paramName}` });
    }
    next();
  };
};
