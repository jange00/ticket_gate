import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import FormField from '../../components/forms/FormField';
import PasswordInput from '../../components/forms/PasswordInput';
import PasswordStrengthMeter from '../../components/forms/PasswordStrengthMeter';
import Button from '../../components/ui/Button';
import { passwordSchema, confirmPasswordSchema } from '../../utils/validators';
import { authService } from '../../services/auth.service';
import { useState } from 'react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  
  if (!token) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
          <Button onClick={() => navigate('/forgot-password')}>
            Request New Link
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-gray-600">Enter your new password</p>
      </div>
      
      <Formik
        initialValues={{ newPassword: '', confirmPassword: '' }}
        validationSchema={Yup.object({
          newPassword: passwordSchema,
          confirmPassword: confirmPasswordSchema('newPassword'),
        })}
        onSubmit={async (values, { setFieldError }) => {
          setLoading(true);
          try {
            await authService.resetPassword({
              token,
              newPassword: values.newPassword,
            });
            navigate('/login');
          } catch (error) {
            setFieldError('newPassword', error.response?.data?.message || 'Failed to reset password');
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="space-y-6">
            <FormField
              component={PasswordInput}
              label="New Password"
              name="newPassword"
              value={values.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.newPassword}
              touched={touched.newPassword}
              required
            />
            {values.newPassword && <PasswordStrengthMeter password={values.newPassword} />}
            
            <FormField
              component={PasswordInput}
              label="Confirm Password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              required
            />
            
            <Button type="submit" loading={loading} className="w-full">
              Reset Password
            </Button>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default ResetPasswordPage;












