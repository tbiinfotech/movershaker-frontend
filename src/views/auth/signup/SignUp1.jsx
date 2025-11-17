import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { chatAuth, db } from '../../../services/firebase';

const apiUrl = import.meta.env.VITE_SERVER_URL;

const SignUp1 = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    newsletter: false
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username) errors.username = 'Username is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.password) errors.password = 'Password is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrors({});

    try {
      const response = await axios.post(`${apiUrl}/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (response.status) {
        await createUserWithEmailAndPassword(chatAuth, formData.email, formData.password);
        await updateProfile(chatAuth.currentUser, {
          displayName: formData.username
        });

        setDoc(doc(db, 'users', response.data._id), {
          username: formData.username,
          email: formData.email,
          uid: response.data._id,
          timestamp: serverTimestamp()
        });

        setSuccessMessage('Registration successful!');
        setLoading(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          newsletter: false
        });
        navigate('/auth/signin-1');
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      if (error?.response) {
        setErrors({
          submit: error?.response?.data?.message || 'Something went wrong. Please try again.'
        });
      } else {
        setErrors({
          submit: 'An unexpected error occurred. Please check your connection.'
        });
      }
    }
  };

  return (
    <React.Fragment>
      <Breadcrumb />
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div>
          <Card className="borderless">
            <Row className="align-items-center">
              <Col>
                <Card.Body className="text-center">
                  <div className="mb-4">
                    <i className="feather icon-user-plus auth-icon" />
                  </div>
                  <h3 className="mb-4">Sign up</h3>
                  {successMessage && <Alert variant="success">{successMessage}</Alert>}
                  {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <div className="input-group mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                      />
                      {errors.username && <small className="text-danger d-block">{errors.username}</small>}
                    </div>
                    <div className="input-group mb-3">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email address"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      {errors.email && <small className="text-danger d-block">{errors.email}</small>}
                    </div>
                    <div className="input-group mb-4">
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      {errors.password && <small className="text-danger d-block">{errors.password}</small>}
                    </div>
                    <div className="form-check text-start mb-4 mt-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="customCheck1"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="customCheck1">
                        Send me the <Link to="#">Newsletter</Link> weekly.
                      </label>
                    </div>
                    <Button type="submit" variant="primary" className="mb-4" disabled={loading}>
                      {loading ? 'Signing up...' : 'Sign up'}
                    </Button>
                  </Form>

                  <p className="mb-2">
                    Already have an account?{' '}
                    <NavLink to={'/auth/signin-1'} className="f-w-400">
                      Login
                    </NavLink>
                  </p>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default SignUp1;
