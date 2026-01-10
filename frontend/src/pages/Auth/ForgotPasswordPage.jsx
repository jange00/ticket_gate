import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Card from '../../components/ui/Card';
import FormField from '../../components/forms/FormField';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { emailSchema } from '../../utils/validators';
import { authService } from '../../services/auth.service';
import { useState } from 'react';

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
        <p className="text-gray-600">
          {submitted 
            ? 'Check your email for password reset instructions'
            : 'Enter your email to receive a password reset link'
          }
        </p>
      </div>
      
      {!submitted ? (
        <Formik
          initialValues={{ email: '' }}
          validationSchema={Yup.object({ email: emailSchema })}
          onSubmit={async (values, { setFieldError }) => {
            setLoading(true);
            try {
              await authService.forgotPassword(values);
              setSubmitted(true);
            } catch (error) {
              setFieldError('email', error.response?.data?.message || 'Failed to send reset email');
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form className="space-y-6">
              <FormField
                component={Input}
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
                required
              />
              
              <Button type="submit" loading={loading} className="w-full">
                Send Reset Link
              </Button>
              
              <p className="text-center text-sm text-gray-600">
                <a href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                  Back to login
                </a>
              </p>
            </Form>
          )}
        </Formik>
      ) : (
        <div className="text-center">
          <Button onClick={() => window.location.href = '/login'} className="w-full">
            Back to Login
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ForgotPasswordPage;

