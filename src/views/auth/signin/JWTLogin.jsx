import React, { useContext } from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik } from 'formik';
import axios from 'axios';
import { AuthContext } from '../../../contexts/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { chatAuth } from '../../../services/firebase';

const apiUrl = import.meta.env.VITE_SERVER_URL;

const JWTLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogin = async (values, { setSubmitting, setErrors }) => {
    try {
      console.log(apiUrl);
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email: values.email,
        password: values.password
      });

      if (response.data && response.data.token) {
        login(response.data.token, response.data.user);
        signInWithEmailAndPassword(chatAuth, values.email, values.password)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log({ user });

            navigate('/dashbaord');
          })
          .catch((error) => {
            const errorCode = error.code;
            console.error(errorCode)
            const errorMessage = error.message;

            alert(errorMessage);
          });
      } else {
        setErrors({ submit: 'Login failed. Please try again.' });
      }
    } catch (error) {
      console.log(error, '::::::::::::::::::::::::::::::::::::::::::::::::');
      setErrors({ submit: error?.response?.data.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
        password: Yup.string().max(255).required('Password is required')
      })}
      onSubmit={handleLogin} // Handle form submission
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              className="form-control"
              label="Email Address / Username"
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              type="email"
              value={values.email}
            />
            {touched.email && errors.email && <small className="text-danger form-text">{errors.email}</small>}
          </div>
          <div className="form-group mb-4">
            <input
              className="form-control"
              label="Password"
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              type="password"
              value={values.password}
            />
            {touched.password && errors.password && <small className="text-danger form-text">{errors.password}</small>}
          </div>

          {errors.submit && (
            <Col sm={12}>
              <Alert variant={'danger'}>{errors.submit}</Alert>
            </Col>
          )}

          <Row>
            <Col mt={2}>
              <Button className="btn-block mb-4" color="primary" disabled={isSubmitting} size="large" type="submit" variant="primary">
                Signin
              </Button>
            </Col>
          </Row>
        </form>
      )}
    </Formik>
  );
};

export default JWTLogin;
