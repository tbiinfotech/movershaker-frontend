import React, { useState, useContext, useCallback } from 'react';
import { Row, Col, Alert, Button, Card } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { updatePassword } from 'firebase/auth';
import { chatAuth, updatePass } from '../../../services/firebase';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const apiUrl = import.meta.env.VITE_SERVER_URL;
const ResetPassword = () => {
  const { auth } = useContext(AuthContext);
  console.log(auth.user, 'user ussser user');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const verifyPassword = useCallback(async (oldpassword, token) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/verify-password`,
        {
          password: oldpassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return true;
    } catch (error) {
      throw error;
    }
  }, []);

  const handleResetPassword = async (values, { setSubmitting, setErrors, setStatus, resetForm }) => {
    if (!auth.token) {
      toast.error('No token found');
    }
    setSubmitting(true);
    console.log(chatAuth.currentUser, 'this is current user user');
    try {
      await verifyPassword(values.oldpassword, auth.token);
      await updatePass(values.confirmPassword, values.oldpassword);
      const response = await axios.post(
        `${apiUrl}/api/auth/change-password`,
        {
          password: values.confirmPassword
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        }
      );
      console.log('response ::::::::::::::', response);
      resetForm();
      setStatus({ success: response.data.message });

      // const response = await axios.post(`${apiUrl}/api/auth/forgot-password`, {
      //   email: values.email
      // });

      // console.log('Response:', response);
      // resetForm();
      // setStatus({ success: `Password reset link has been sent to your email.'${values.email}'` });
    } catch (error) {
      console.log(error, 'error rror ');
      if (error?.response?.data) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error(error.message);
      }
      setErrors({ submit: error?.response?.data.message });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card title="Change Password">
            <div className="auth-content p-4">
              <h3 className="mb-4">Change Password</h3>
              <p>Please enter and confirm your new password.</p>
              {/* <h3 className="mb-4">Reset Password</h3>
              <p>Please enter Email to get reset password link.</p> */}
              <Formik
                initialValues={{
                  oldpassword: '',
                  password: '',
                  confirmPassword: '',
                  // email: '',
                  submit: null
                }}
                validationSchema={Yup.object().shape({
                  oldpassword: Yup.string()
                    .min(8, 'Password must be at least 8 characters')
                    .max(255, 'Password cannot exceed 255 characters')
                    .required('Old Password is required'),

                  password: Yup.string()
                    .min(8, 'Password must be at least 8 characters')
                    .max(255, 'Password cannot exceed 255 characters')
                    .required('Password is required')
                    .notOneOf([Yup.ref('oldpassword')], 'Please set different password then the old one'),
                  confirmPassword: Yup.string()
                    .oneOf([Yup.ref('password'), null], 'Passwords must match')
                    .required('Confirm Password is required')
                  // email: Yup.string().email('Invalid email address').required('Email is required')
                })}
                onSubmit={handleResetPassword}
              >
                {({ errors, status, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                  <form noValidate onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
                    {/* <div className="form-group mb-3 position-relative">
                      <input
                        className="form-control"
                        name="email"
                        placeholder="Enter email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        // type={showOldPassword ? 'text' : 'password'}
                        type="text"
                        value={values.oldpassword}
                      />
                      <span
                        className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        style={{ cursor: 'pointer' }}
                      >
                        {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </span>
                      {touched.email && errors.email && <small className="text-danger form-text">{errors.email}</small>}
                    </div> */}
                    <div className="mb-3">
                      <div className="form-group  position-relative">
                        <input
                          className="form-control"
                          name="oldpassword"
                          placeholder="Old Password"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type={showOldPassword ? 'text' : 'password'}
                          value={values.oldpassword}
                        />
                        <span
                          className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          style={{ cursor: 'pointer' }}
                        >
                          {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                      </div>
                      {touched.oldpassword && errors.oldpassword && <small className="text-danger form-text">{errors.oldpassword}</small>}
                    </div>
                    <div className="mb-3">
                      <div className="form-group  position-relative">
                        <input
                          className="form-control"
                          name="password"
                          placeholder="New Password"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type={showPassword ? 'text' : 'password'}
                          value={values.password}
                        />
                        <span
                          className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ cursor: 'pointer' }}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                      </div>
                      {touched.password && errors.password && <small className="text-danger form-text">{errors.password}</small>}
                    </div>
                    <div className="mb-4">
                      <div className="form-group  position-relative">
                        <input
                          className="form-control"
                          name="confirmPassword"
                          placeholder="Confirm New Password"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={values.confirmPassword}
                        />
                        <span
                          className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ cursor: 'pointer' }}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                      </div>
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
                          {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                      </Col>
                    </Row>
                  </form>
                )}
              </Formik>
            </div>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ResetPassword;
