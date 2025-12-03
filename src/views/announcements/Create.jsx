import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import DatePicker from 'react-date-picker';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-quill/dist/quill.snow.css';
import QuillEditor from './QuillEditor';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import AutoCompleteSelect from './AutoCompleteSelect';
import { Backdrop, CircularProgress } from '@mui/material';

const apiUrl = import.meta.env.VITE_SERVER_URL;

function stripHTML(html) {
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  // feedCaption: Yup.string().required('Feed caption is required'),
  pushNotificationCaption: Yup.string()
    .required('Push notification caption is required')
    .test('remove-white-space', 'Push notification caption is required', (value, testcontext) => {
      console.log(value, !stripHTML(value), 'jslkfjasl');
      return stripHTML(value);
    }),
  // feedUrl: Yup.string().url('Enter a valid URL').required('Feed URL is required'),
  pushNotificationUrl: Yup.string().url('Enter a valid URL'),
  // expiryDate: Yup.date().required('Expiry date is required'),
  emails: Yup.string().test('valid-emails', 'Invalid email(s) provided', function (value) {
    if (!value) return true;
    const emails = value.split(', ').map((email) => email.trim());
    const isValid = emails.every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    return isValid;
  }),
  file: Yup.mixed()
    .nullable()
    .test('file-type', 'Invalid file type. Only images and videos are allowed.', (file) => {
      if (!file) return true;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/mov', 'video/avi'];
      return file && allowedTypes.includes(file.type);
    })
  // program: Yup.string().when('specificUsers', {
  //   is: true,
  //   then: Yup.string().required('Program is required if specific users are selected')
  // })
});

const Create = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setloading] = useState(false);

  const initialValues = {
    feedCaption: '',
    pushNotificationCaption: '',
    feedUrl: '',
    file: null,
    pushNotificationUrl: '',
    expiryDate: '',
    expiryTime: '12:00',
    specificUsers: false,
    photo: null,
    emails: '',
    program: ''
  };

  const handleSubmit = async (values) => {
    try {
      setloading(true);
      // console.log(values, 'values values');
      const formData = new FormData();
      formData.append('feedCaption', values.feedCaption);
      formData.append('pushNotificationCaption', values.pushNotificationCaption);
      formData.append('feedUrl', values.feedUrl);
      formData.append('pushNotificationUrl', values.pushNotificationUrl);
      formData.append('expiryDate', values.expiryDate);
      formData.append('expiryTime', values.expiryTime);
      formData.append('specificUsers', values.specificUsers);
      formData.append('file', values.file);
      if (values.specificUsers) {
        if (values.emails.length) formData.append('emails', values.emails);
        if (values.program.length) formData.append('program', values.program);
      }

      const response = await axios.post(`${apiUrl}/api/announcements/create`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('API Response:', response.data);

      toast.success('Announcement created successfully!');
      setTimeout(() => {
        navigate('/announcements/view');
      }, 3000);
    } catch (error) {
      console.error('Error submitting the form:', error);
      if (error?.response?.data) {
        toast.error(error?.response?.data?.message || 'Failed to create the announcement.');
      } else {
        alert('Failed to create the announcement.');
      }
    } finally {
      setloading(false);
    }
  };

  const formatProgramName = (productName) => {
    try {
      const regex = /(.*?)-(\d{4})(S\d)\s(.*)\s(.*)/;
      const matches = productName.match(regex);

      if (matches) {
        const [, , year, season, programName, day] = matches;
        const formattedDay = day.slice(0, 3);
        return `${programName} ${formattedDay} ${year} ${season}`;
      }

      return productName;
    } catch (error) {
      console.error('Error formatting program name:', error);
      return productName;
    }
  };

  // Fetch programs from API
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/student/programs`);
        setPrograms(response.data.data);
      } catch (err) {
        console.error('Error fetching programs:', err);
        toast.error('Failed to load programs');
      }
    };

    fetchPrograms();
  }, []);

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    } else {
      setPreview(null);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        let hour = h % 12 === 0 ? 12 : h % 12; // Convert 24-hour format to 12-hour
        let minute = m.toString().padStart(2, '0');
        let period = h < 12 ? 'AM' : 'PM'; // Determine AM or PM
        let formattedTime = `${hour}:${minute} ${period}`;
        options.push(formattedTime);
      }
    }
    return options;
  };

  return (
    <>
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={loading}>
        <CircularProgress sx={{ color: '#04a9f5' }} />
      </Backdrop>
      <div className="container mt-4">
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ values, setFieldValue, handleChange, setErrors }) => (
            <FormikForm>
              {/* Feed Caption */}
              {/* <Form.Group controlId="feedCaption" className="mb-3">
              <Form.Label>Title for the announcement</Form.Label>
              <QuillEditor
                setFieldValue={setFieldValue}
                value={values.feedCaption}
                fieldName={'feedCaption'}
                placeholder={'Enter announcement title'}
                charLimit={100}
              />
              <ErrorMessage name="feedCaption" component="div" className="text-danger" />
            </Form.Group> */}

              {/* Push Notification Caption */}
              <Form.Group controlId="pushNotificationCaption" className="mb-3">
                <Form.Label>Caption for the announcement</Form.Label>
                <QuillEditor
                  placeholder={'Enter announcement caption'}
                  setFieldValue={setFieldValue}
                  value={values.pushNotificationCaption}
                  fieldName={'pushNotificationCaption'}
                />

                <ErrorMessage name="pushNotificationCaption" component="div" className="text-danger" />
              </Form.Group>

              {/* Announcement Upload file */}
              <Form.Group controlId="file" className="mb-3">
                <Form.Label>Upload Images/Videos</Form.Label>
                <Form.Control
                  name="file"
                  type="file"
                  className="form-control"
                  onChange={(event) => {
                    const file = event.currentTarget.files[0];
                    setFieldValue('file', file || null);
                    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/mov', 'video/avi'];
                    // setFieldValue('file', file); // Always set the file to Formik state
                    if (file && allowedTypes.includes(file.type)) {
                      handleFileChange(event); // Update preview
                    }
                  }}
                />
                <ErrorMessage name="file" component="div" className="text-danger" />

                {/* Preview Section */}
                {preview && (
                  <div className="mt-3">
                    {preview.startsWith('blob:') && (preview.endsWith('.mp4') || preview.endsWith('.mov') || preview.endsWith('.avi')) ? (
                      <video controls width="100%" src={preview} />
                    ) : (
                      <img src={preview} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
                    )}
                  </div>
                )}
              </Form.Group>

              {/* Announcement Feed URL */}
              <Form.Group controlId="feedUrl" className="mb-3">
                <Form.Label>Users will be redirected when Photo is clicked from Homepage feed (Optional)</Form.Label>
                <Field name="feedUrl" type="text" placeholder="Enter Announcement Feed URL" className="form-control" />
                <ErrorMessage name="feedUrl" component="div" className="text-danger" />
              </Form.Group>

              {/* Push Notification URL */}
              <Form.Group controlId="pushNotificationUrl" className="mb-3">
                <Form.Label>Fill out this field if you need users to be redirected when push notification is clicked</Form.Label>
                <Field name="pushNotificationUrl" type="text" placeholder="URL minus https://" className="form-control" />
                <ErrorMessage name="pushNotificationUrl" component="div" className="text-danger" />
              </Form.Group>

              {/* Expiry Date */}
              <Form.Group controlId="expiryDate" className="mb-3">
                <Form.Label>This announcement will expire on? (PST)</Form.Label>
                <Row>
                  <Col md={2}>
                    <DatePicker
                      value={values.expiryDate}
                      onChange={(date) => setFieldValue('expiryDate', date)}
                      dateFormat="MMMM d, yyyy"
                      minDate={new Date()}
                      // readOnly // Makes the input non-editable
                    />
                    <ErrorMessage name="expiryDate" component="div" className="text-danger" />
                  </Col>
                  <Col md={2}>
                    <Field as="select" name="expiryTime">
                      {generateTimeOptions().map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </Field>
                  </Col>
                </Row>
              </Form.Group>

              {/* Specific Users Checkbox */}
              <Form.Group controlId="specificUsers" className="mb-3">
                <Field name="specificUsers" type="checkbox" className="form-check-input me-2" />
                <Form.Label className="form-check-label">Send to specific users only?</Form.Label>
              </Form.Group>

              {values.specificUsers && (
                <>
                  <hr />

                  {/* Emails Input */}
                  <Form.Group controlId="emails" className="mb-3">
                    <Form.Label>Insert emails (comma separated with space)</Form.Label>
                    <Field
                      as="textarea"
                      name="emails"
                      type="text"
                      placeholder="Insert emails (comma separated with space)"
                      className="form-control"
                      style={{ height: '100px' }}
                      disabled={values.program.length > 0} // Disable if program is selected
                    />
                    <ErrorMessage name="emails" component="div" className="text-danger" />
                  </Form.Group>

                  <div className="text-center mb-3">
                    <span>-or-</span>
                  </div>

                  <Form.Group controlId="programSelect" className="mb-3">
                    <Form.Label>Select Program</Form.Label>
                    <AutoCompleteSelect options={programs} setFieldValue={setFieldValue} value={values.program} />
                    {/* <Form.Control
                    as="select"
                    name="program"
                    value={values.program}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
                      setFieldValue('program', selectedOptions); // Update Formik state
                    }}
                    multiple // Enable multiple selection
                  >
                    <option value="" disabled>
                      Select a program...
                    </option>
                    {programs.map((program) => (
                      <option key={program._id} value={program._id}>
                        {formatProgramName(program.Product_Name)}
                      </option>
                    ))}
                  </Form.Control> */}

                    <ErrorMessage name="program" component="div" className="text-danger" />
                  </Form.Group>
                </>
              )}

              {/* Submit Button */}
              <Button variant="primary" type="submit">
                Create
              </Button>
            </FormikForm>
          )}
        </Formik>
      </div>
    </>
  );
};

export default Create;
