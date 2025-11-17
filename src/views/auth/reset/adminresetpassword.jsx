import React, { useState } from 'react';
import { Row, Col, Alert, Button, Card } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const apiUrl = import.meta.env.VITE_SERVER_URL;
const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { token } = useParams();
  const handleResetPassword = async (values, { setSubmitting, setErrors, setStatus, resetForm }) => {
    try {
      setSubmitting(true);
      const response = await axios.post(`${apiUrl}/api/auth/reset-password/${token}`, {
        password: values.confirmPassword
      });

      console.log('response ::::::::::::::', response);
      resetForm();
      setStatus({ success: response.data.message });
    } catch (error) {
      setErrors({ submit: error?.response?.data.message });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <React.Fragment>
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div>
          <Card className="borderless text-center">
            <Card.Body>
              <h3 className="mb-4">Reset Password</h3>
              <p>Please enter and confirm your new password.</p>
              <Formik
                initialValues={{
                  password: '',
                  confirmPassword: '',
                  submit: null
                }}
                validationSchema={Yup.object().shape({
                  password: Yup.string()
                    .min(8, 'Password must be at least 8 characters')
                    .max(255, 'Password cannot exceed 255 characters')
                    .required('Password is required'),
                  confirmPassword: Yup.string()
                    .oneOf([Yup.ref('password'), null], 'Passwords must match')
                    .required('Confirm Password is required')
                })}
                onSubmit={handleResetPassword}
              >
                {({ errors, status, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                  <form noValidate onSubmit={handleSubmit}>
                    <div className="form-group mb-3 position-relative">
                      <input
                        className="form-control"
                        name="password"
                        placeholder="New Password"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type={showPassword ? "text" : "password"}
                        value={values.password}
                      />
                      <span
                        className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: 'pointer' }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </span>
                      {touched.password && errors.password && <small className="text-danger form-text">{errors.password}</small>}
                    </div>
                    <div className="form-group mb-4 position-relative">
                      <input
                        className="form-control"
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type={showConfirmPassword ? "text" : "password"}
                        value={values.confirmPassword}
                      />
                      <span
                        className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ cursor: 'pointer' }}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </span>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <small className="text-danger form-text">{errors.confirmPassword}</small>
                      )}
                    </div>
                    {errors.submit && (
                      <Col sm={12}>
                        <Alert variant="danger">{errors.submit}</Alert>
                      </Col>
                    )}
                    {status?.success && (
                      <Col sm={12}>
                        <Alert variant="success">{status.success}</Alert>
                      </Col>
                    )}
                    <Row>
                      <Col>
                        <Button
                          className="btn-block mb-4"
                          color="primary"
                          disabled={isSubmitting}
                          size="large"
                          type="submit"
                          variant="primary"
                        >
                          Reset Password
                        </Button>
                      </Col>
                    </Row>
                  </form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ResetPassword;
