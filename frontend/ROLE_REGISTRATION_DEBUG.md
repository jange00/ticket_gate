# Role Selection During Registration - Debug Guide

## Frontend Status ✅

The frontend is **correctly sending the role** in the registration request:

1. **RegisterForm.jsx** - Role field is properly bound:
   - Formik field: `name="role"`, `value={values.role}`, `onChange={handleChange}`
   - Initial value: `ROLES.USER` (default)
   - Options: User, Organizer, Staff (Admin excluded for security)
   - Validation: Yup schema validates role is one of allowed values

2. **Registration Data Sent**:
   ```javascript
   {
     email: values.email,
     password: values.password,
     firstName: values.firstName,
     lastName: values.lastName,
     phone: values.phone,
     role: values.role  // ✅ Role is included
   }
   ```

3. **API Request**:
   - Endpoint: `POST /api/auth/register`
   - Role is included in request body
   - Debug logging shows role in console

## Backend Issue 🔍

The issue is **likely on the backend**. Common reasons:

1. **Backend ignores role field** - The registration endpoint might not accept/process the `role` field
2. **Backend validation** - The backend might have validation that only allows 'user' role during registration
3. **Security restriction** - The backend might strip the role field for security (common practice)

## How to Debug

1. **Check Browser Console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for logs:
     - "Registration Data:" - Shows what's being sent
     - "Selected Role:" - Shows the selected role
     - "API Request:" - Shows the full request payload

2. **Check Network Tab**:
   - Open DevTools → Network tab
   - Register a new account
   - Find the `/auth/register` request
   - Check the "Payload" or "Request" tab
   - Verify `role` field is present in the request body

3. **Check Backend Response**:
   - In Network tab, check the Response
   - See if the created user has the correct role
   - Check for any error messages about role

## Backend Fix Required

The backend registration endpoint (`POST /api/auth/register`) needs to:

1. **Accept the role field** in the request body
2. **Validate the role** (allow: 'user', 'organizer', 'staff', reject: 'admin')
3. **Save the role** to the user document in the database

Example backend fix (Node.js/Express):
```javascript
// In your registration controller
const { email, password, firstName, lastName, phone, role } = req.body;

// Validate role
const allowedRoles = ['user', 'organizer', 'staff'];
if (role && !allowedRoles.includes(role)) {
  return res.status(400).json({ 
    success: false, 
    message: 'Invalid role selected' 
  });
}

// Create user with role
const user = await User.create({
  email,
  password: hashedPassword,
  firstName,
  lastName,
  phone,
  role: role || 'user', // Use provided role or default to 'user'
  // ... other fields
});
```

## Current Status

- ✅ Frontend sends role correctly
- ✅ Role selection UI works
- ⚠️ Backend needs to accept and save the role field

## Next Steps

1. Check browser console for registration logs
2. Check Network tab to verify role is in request
3. Update backend registration endpoint to accept role field
4. Test registration with different roles







