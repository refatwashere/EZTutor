/**
 * Server-side validators for input validation
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= PASSWORD_MIN_LENGTH;
};

export const validateSubject = (subject) => {
  if (!subject || typeof subject !== 'string') return false;
  const trimmed = subject.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
};

export const validateTopic = (topic) => {
  if (!topic || typeof topic !== 'string') return false;
  const trimmed = topic.trim();
  return trimmed.length > 0 && trimmed.length <= 200;
};

export const validateTitle = (title) => {
  if (!title || typeof title !== 'string') return false;
  const trimmed = title.trim();
  return trimmed.length > 0 && trimmed.length <= 150;
};

export const validateRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  return !!value;
};

export const validateId = (id) => {
  return id && (typeof id === 'string' || typeof id === 'number');
};

export const validateArray = (arr) => {
  return Array.isArray(arr) && arr.length > 0;
};
