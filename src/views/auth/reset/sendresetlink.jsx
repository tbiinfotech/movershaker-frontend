import React, { useState } from 'react';
import { Row, Col, Alert, Button, Card } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_SERVER_URL;

const ResetPassword = () => {
  const handleResetPassword = async (values, { setSubmitting, setErrors, setStatus, resetForm }) => {
    try {
      setSubmitting(true);
      const response = await axios.post(`${apiUrl}/api/auth/forgot-password`, {
        email: values.email,
      });

      console.log('Response:', response);
      resetForm();
      setStatus({ success: 'Password reset link has been sent to your email.' });
    } catch (error) {
      setErrors({ submit: error?.response?.data?.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-content">
        <Card className="borderless text-center">
          <Card.Body>
            <h3 className="mb-4">Reset Password</h3>
            <Formik
              initialValues={{ email: '', submit: null }}
              validationSchema={Yup.object().shape({
                email: Yup.string()
                  .email('Invalid email address')
                  .required('Email is required'),
              })}
              onSubmit={handleResetPassword}
            >
              {({ errors, status, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                <form noValidate onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <input
                      className="form-control"
                      name="email"
                      placeholder="Enter your email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="email"
                      value={values.email}
                    />
                    {touched.email && errors.email && <small className="text-danger">{errors.email}</small>}
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
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
