export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CURRENCY_SYMBOL = '£';
export const passwordHint =
  'Password must contain at least 10 characters long, a combination of uppercase letters, lowercase letters, numbers and symbols';

const REGISTER_PASSWORD_MIN_LENGTH = 10;
const SIGN_IN_PASSWORD_MIN_LENGTH = 6;

const passwordRegisterRequirements = {
  minLength: REGISTER_PASSWORD_MIN_LENGTH,
  hasUpperCase: (value: string) => /[A-Z]/.test(value),
  hasLowerCase: (value: string) => /[a-z]/.test(value),
  hasNumber: (value: string) => /\d/.test(value),
  hasSpecialChar: (value: string) =>
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
};

const validatePasswordRegisterRequirements = (value: string) => {
  const results = {
    minLength: value.length >= passwordRegisterRequirements.minLength,
    hasUpperCase: passwordRegisterRequirements.hasUpperCase(value),
    hasLowerCase: passwordRegisterRequirements.hasLowerCase(value),
    hasNumber: passwordRegisterRequirements.hasNumber(value),
    hasSpecialChar: passwordRegisterRequirements.hasSpecialChar(value),
  };

  const allValid = Object.values(results).every(Boolean);
  return {...results, allValid};
};

const validPasswordRegister = (value: string) => {
  const validation = validatePasswordRegisterRequirements(value);
  if (!validation.minLength) {
    return `Password must be at least ${REGISTER_PASSWORD_MIN_LENGTH} characters`;
  }
  if (!validation.hasUpperCase) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!validation.hasLowerCase) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!validation.hasNumber) {
    return 'Password must contain at least one number';
  }
  if (!validation.hasSpecialChar) {
    return 'Password must contain at least one special character';
  }
  return validation.allValid;
};

const validatePasswordSignInRequirements = (value: string) => {
  const validation = {
    minLength: value.length >= SIGN_IN_PASSWORD_MIN_LENGTH,
  };

  return validation;
};

const validPasswordSignIn = (value: string) => {
  const validation = validatePasswordSignInRequirements(value);
  return validation.minLength;
};

export {
  REGISTER_PASSWORD_MIN_LENGTH,
  SIGN_IN_PASSWORD_MIN_LENGTH,
  validatePasswordRegisterRequirements,
  validatePasswordSignInRequirements,
  validPasswordRegister,
  validPasswordSignIn,
};
