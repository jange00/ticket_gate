import * as Yup from 'yup';

export const emailSchema = Yup.string()
  .email('Invalid email address')
  .required('Email is required');

export const passwordSchema = Yup.string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must be less than 128 characters')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
  .required('Password is required');

export const confirmPasswordSchema = (passwordField = 'password') =>
  Yup.string()
    .oneOf([Yup.ref(passwordField)], 'Passwords must match')
    .required('Please confirm your password');

export const nameSchema = Yup.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
  .required('Name is required');

export const phoneSchema = Yup.string()
  .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
  .optional();

export const eventTitleSchema = Yup.string()
  .min(3, 'Title must be at least 3 characters')
  .max(200, 'Title must be less than 200 characters')
  .required('Title is required');

export const ticketTypeNameSchema = Yup.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .required('Name is required');

export const priceSchema = Yup.number()
  .min(0, 'Price must be positive')
  .required('Price is required');

export const quantitySchema = Yup.number()
  .integer('Quantity must be a whole number')
  .min(1, 'Quantity must be at least 1')
  .required('Quantity is required');

export const dateSchema = Yup.date()
  .min(new Date(), 'Date must be in the future')
  .required('Date is required');

export const mfaCodeSchema = Yup.string()
  .length(6, 'MFA code must be 6 digits')
  .matches(/^[0-9]+$/, 'MFA code must contain only numbers')
  .required('MFA code is required');










