import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { Formik, ErrorMessage } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import Card from '../../components/Card/MainCard';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { toast } from 'react-toastify';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/lara-light-cyan/theme.css';

const apiUrl = import.meta.env.VITE_SERVER_URL;

const SamplePage = () => {
  const navigate = useNavigate();
  const { id, week } = useParams();
  const [videoPreview, setVideoPreview] = useState(null);
  const [linkPreview, setLinkPreview] = useState(null);
  const [media, setMediaData] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedWeek, setWeek] = useState('');

  const toastref = useRef(null);

  const [initialValues, setInitialValues] = useState({
    program: '',
    videoFile: null,
    videoLink: '',
    week: '',
    class_date: new Date(),
    video_aspect: ''
  });

  const validationSchema = Yup.object().shape({
    week: Yup.string()
      .required('Week is required') // Required field
      .matches(/^[a-zA-Z\s]*\d+$/, 'Week must contain text followed by an integer'),
    video_aspect: Yup.string().required('Video Aspect is required'),
    class_date: Yup.date().required('Class date is required'),
    videoFile: Yup.mixed()
      .nullable()
      .test('video-required', 'Either a video file or a video link is required', function (value) {
        const { videoLink } = this.parent;
        return !!videoLink || !!value; // At least one must be provided
      })
      .test('file-type', 'Only video files are allowed (e.g., .mp4, .mov, .avi)', function (value) {
        if (!value) return true; // Skip validation if no file is uploaded
        const allowedTypes = ['video/mp4', 'video/mov', 'video/avi']; // Allowed MIME types
        return allowedTypes.includes(value.type);
      }),

    videoLink: Yup.string()
      .nullable()
      .matches(/^(https?:\/\/)?[\w\-\.]+(\.[\w\-]+)+[/#?]?.*$/, 'Invalid URL format')
      .test('video-link-or-file', 'Provide either a video link or a file, not both', function (value) {
        const { videoFile } = this.parent;
        return !videoFile || !value; // One or the other, not both
      })
      .url('Video link must be a valid URL') // Check for valid URL format
      .test('video-required', 'Either a video link or a video file is required', function (value) {
        const { videoFile } = this.parent;
        return !!videoFile || !!value; // At least one must be provided
      })
  });

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/media/${id}`);

        const programsWithMedia = response.data.flatMap((item) =>
          item.media
            .filter((media) => media.week === week) // ✅ Filter first
            .map((media) => ({
              id: media._id,
              program_name: item.Product_Name,
              videoPath: media.filePath,
              week: media.week,
              video_aspect: media.video_aspect,
              class_date: media.class_date
            }))
        );

        setMediaData(programsWithMedia);
      } catch (error) {
        if (error.response) {
          console.error('Upload failed:', error.response.data);
          // setError(error.response.data.message);
        } else if (error.request) {
          console.error('Upload failed:', error.request);
          // setError('Failed to send the request');
        } else {
          console.error('Upload failed:', error.message);
          // setError('An unknown error occurred');
        }
      } finally {
      }
    };

    fetchPrograms();
  }, [id]);

  useEffect(() => {
    const selectedMedia = media.filter((val) => val._id === selectedWeek);
    if (selectedMedia.length) {
      setVideoPreview(selectedMedia[0].videoPath);
    }
    console.log('Selected media:', selectedMedia);
  }, [selectedWeek]);

  // Handle form submission
  const handleSubmit = async (values, { setErrors, setSubmitting, resetForm }) => {
    const formData = new FormData();
    formData.append('program', values.program);
    formData.append('week', values.week);
    formData.append('class_date', values.class_date);
    formData.append('video_aspect', values.video_aspect);
    if (values.videoLink) {
      formData.append('video_link', values.videoLink);
    } else if (values.videoFile) {
      formData.append('media', values.videoFile);
    }

    try {
      const response = await axios.put(`${apiUrl}/api/media/${values.media_week}`, formData);

      if (response.status === 200) {
        toast.success('Media Updated successfully!');
      }
    } catch (error) {
      if (error.response) {
        setErrors({ server: error.response.data.message });
      } else {
        setErrors({ server: 'An unknown error occurred' });
      }
    } finally {
      setSubmitting(false);
      navigate('/media/master-list');
    }
  };

  const changeWeek = async (e, setFieldValue) => {
    try {
      const selectedProgramId = e.target.value;
      setFieldValue('media_week', selectedProgramId);
      const selectedMedia = media.filter((item) => item.id === selectedProgramId);

      if (selectedMedia.length) {
        let media = selectedMedia[0];
        setFieldValue('week', media.week);
        setFieldValue('video_aspect', media.video_aspect);
        setFieldValue('class_date', media.class_date);
        setFieldValue('videoLink', media.videoPath);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
    }
  };

  useEffect(() => {
    if (media.length > 0) {
      let data = media[0];
      console.log(data);

      setInitialValues({
        program: '',
        videoFile: null,
        videoLink: data.videoPath,
        week: data.week,
        class_date: new Date(data.class_date),
        video_aspect: data.video_aspect,
        media_week: data.id,
        mediaId: data.id
      });

      setVideoPreview(data.videoPath);

      console.log('Initial values set to ###########################');
    }
  }, [media]);

  const reject = () => {
    console.log('Rejected');
  };

  const confirm = (position, id) => {
    confirmDialog({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      position,
      accept: () => handleDeleteLink(id),
      reject: () => reject()
    });
  };

  const handleDeleteLink = async (id) => {
    await axios.delete(`${apiUrl}/api/media/${id}`);
    toast.success('Media deleted successfully');
    navigate('/media/master-list');
  };
  const handleFileChange = useCallback((event, setFieldValue, values) => {
    setLoading(false);
    console.log('##### Upload change 1', videoPreview);
    setVideoPreview(null);
    setLinkPreview(null);
    setFieldValue('videoLink', '');
    values.videoLink = '';

    const file = event.currentTarget.files[0];
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi'];

    if (!file) {
      setFieldValue('videoFile', null);
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setFieldValue('videoFile', null);
      console.warn('Unsupported file type:', file.type);
      return;
    }

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
    setFieldValue('videoFile', file);
    console.log('##### Upload change 2', previewUrl);
    setLoading(true);
  }, []);

  const handleRemoveVideo = (setFieldValue) => {
    setVideoPreview(null);
    setLinkPreview(null);
    setFieldValue('videoFile', null);
    setFieldValue('videoLink', '');
    console.log('##### Remove video', videoPreview);
  }
  
  console.log('##### File ', videoPreview);
  return (
    <Row className="justify-content-center">
      <Toast ref={toastref} />
      <ConfirmDialog />
      <Col lg={8}>
        <Card title="Video Upload" remove={'remove'}>
          <Formik enableReinitialize={true} initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ handleSubmit, handleChange, setFieldValue, values, errors, touched, isSubmitting }) => (
              <Form noValidate onSubmit={handleSubmit}>
                {/* Program Dropdown */}
                {/* <Form.Group controlId="programSelect" className="mb-3">
                  <Form.Label>Select Week</Form.Label>
                  <Form.Control as="select" name="media_week" value={values.media_week} onChange={(e) => changeWeek(e, setFieldValue)}>
                    <option value="">Select a week</option>
                    {media.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.week}
                      </option>
                    ))}
                  </Form.Control>
                  {errors.program && touched.program && <div className="text-danger">{errors.program}</div>}
                </Form.Group> */}

                {/* Week Input */}
                <Form.Group controlId="weekInput" className="mb-3">
                  <Form.Label>Week</Form.Label>
                  <Form.Control type="text" name="week" value={values.week} onChange={handleChange} />
                  {errors.week && touched.week && <div className="text-danger">{errors.week}</div>}
                </Form.Group>

                {/* Video Aspect */}
                <Form.Group controlId="videoAspectSelect" className="mb-3">
                  <Form.Label>Video Aspect (56.25% or 177.78%)</Form.Label>
                  <Form.Control as="select" name="video_aspect" value={values.video_aspect} onChange={handleChange}>
                    <option value="">Select aspect ratio</option>
                    <option value="56.25%">56.25%</option>
                    <option value="177.78%">177.78%</option>
                  </Form.Control>
                  {errors.video_aspect && touched.video_aspect && <div className="text-danger">{errors.video_aspect}</div>}
                </Form.Group>

                {/* Date Picker */}
                <Form.Group controlId="classDate" className="mb-3">
                  <Form.Label>Class Date</Form.Label>
                  <DatePicker
                    selected={values.class_date}
                    onChange={(date) => setFieldValue('class_date', date)}
                    dateFormat="MMMM d, yyyy"
                    className="form-control"
                    minDate={new Date()}
                  />
                  <ErrorMessage name="class_date" component="div" className="text-danger" />
                </Form.Group>

                {/* Video File Upload */}
                <Form.Group controlId="videoUpload" className="mb-3">
                  <Form.Label>Upload Video File</Form.Label>
                  <Form.Control
                    type="file"
                    accept="video/*"
                    name="videoFile"
                    onChange={(event) => handleFileChange(event, setFieldValue, values)}
                  />
                  {errors.videoFile && touched.videoFile && <div className="text-danger">{errors.videoFile}</div>}
                </Form.Group>

                {/* Video Link Upload */}
                <Form.Group controlId="videoLink" className="mb-3">
                  <Form.Label>Video Link</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter video link (e.g., Vimeo link)"
                    value={values.videoLink}
                    name="videoLink"
                    onChange={(event) => {
                      setFieldValue('videoLink', event.target.value);
                      setFieldValue('videoFile', '');
                      setVideoPreview('');
                      setLinkPreview(event.target.value);
                    }}
                  />
                  {errors.videoLink && touched.videoLink && <div className="text-danger">{errors.videoLink}</div>}
                </Form.Group>

                {videoPreview && (
                  <div className="mb-3">
                    <h5>File Preview</h5>
                    <video key={videoPreview} controls className="w-100">
                      <source src={videoPreview} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <Button variant="danger" className="mt-2" onClick={() => handleRemoveVideo(setFieldValue)}>
                      Remove Video
                    </Button>
                  </div>
                )}

                {linkPreview && (
                  <div className="mb-3">
                    <h5>Video Link Preview</h5>
                    <iframe
                      src={`${linkPreview}`}
                      width="500"
                      height="240"
                      webkitallowfullscreen
                      mozallowfullscreen
                      allowfullscreen
                    ></iframe>
                    <Button variant="danger" className="mt-2" onClick={() => handleRemoveVideo(setFieldValue)}>
                      Remove Video Link
                    </Button>
                  </div>
                )}

                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Media'}
                </Button>
                <Button variant="danger" disabled={isSubmitting} onClick={() => confirm('center', values.mediaId)}>
                  {isSubmitting ? 'Deleting...' : 'Delete Media'}
                </Button>
              </Form>
            )}
          </Formik>
        </Card>
      </Col>
    </Row>
  );
};

export default SamplePage;
