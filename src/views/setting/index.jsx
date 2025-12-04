import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import Card from '../../components/Card/MainCard';
import axios from 'axios';
import useFirstRender from 'hooks/useFirstRender';
import { toast } from 'react-toastify';

const apiUrl = import.meta.env.VITE_SERVER_URL;

const SamplePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useFirstRender(() => {
    checkAuthStatus();
  }, []);

  /// Function to fetch zoho auth status
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/zoho/checkZohoAuthStatus`);
      if (response.data.success) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      toast.error(`Error while checking auth status : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to initiate the Zoho OAuth flow
  const initiateZohoOAuth = async () => {
    const response = await axios.get(`${apiUrl}/api/zoho/connect`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(response);
    if (response.data.success) {
      window.location.href = response.data.url;
    }
  };

  // Function to check if the OAuth token is available
  //   const checkZohoTokenStatus = () => {
  //     // Ideally, you'd make an API call to check the status of the OAuth token
  //     const token = localStorage.getItem('zoho_access_token');
  //     if (token) {
  //       setIsAuthenticated(true);
  //     } else {
  //       setIsAuthenticated(false);
  //     }
  //   };

  //   // Handle OAuth callback to save tokens
  //   const handleOAuthCallback = (code) => {
  //     // You will need a backend to exchange the 'code' for an access token
  //     // Example API call (you'll need to implement this on your backend):
  //     // axios.post('/api/exchange-zoho-code', { code });

  //     // Mocking response for demo
  //     localStorage.setItem('zoho_access_token', 'mockAccessToken');
  //     setIsAuthenticated(true);
  //   };

  //   // Display error message if any
  //   const displayError = (message) => {
  //     setErrorMessage(message);
  //   };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card title="Settings" isOption>
            <div>
              <h3>Zoho OAuth Integration</h3>

              {loading ? (
                '...loading'
              ) : isAuthenticated ? (
                <Alert variant="success">Successfully connected to Zoho CRM.</Alert>
              ) : (
                <>
                  <Alert variant="danger">Not connected to Zoho CRM.</Alert>
                  <Button variant="primary" onClick={initiateZohoOAuth}>
                    Connect to Zoho CRM
                  </Button>
                </>
              )}

              {/* Check if Zoho is authenticated */}
              {/* {isAuthenticated ? (
                <Alert variant="success">Successfully connected to Zoho CRM.</Alert>
              ) : (
                <Alert variant="danger">Not connected to Zoho CRM.</Alert>
              )} */}

              {/* Button to initiate OAuth */}
              {/* {!isAuthenticated && (
                <Button variant="primary" onClick={initiateZohoOAuth}>
                  Connect to Zoho CRM
                </Button>
              )} */}

              {/* Display error message */}
              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            </div>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default SamplePage;
