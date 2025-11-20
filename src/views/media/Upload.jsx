import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { Formik, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import Card from '../../components/Card/MainCard';
import axios from 'axios';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const apiUrl = import.meta.env.VITE_SERVER_URL;

async function sha256(buffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function getVideoHash(file) {
  const video = document.createElement('video');
  if (file instanceof File) {
    video.src = URL.createObjectURL(file);
  } else {
    video.src = file;
  }
  video.crossOrigin = 'anonymous';
  video.muted = true;

  await new Promise((res) => video.addEventListener('loadeddata', res));
  video.currentTime = 1;

  await new Promise((res) => video.addEventListener('seeked', res));

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.7));
  const buffer = await blob.arrayBuffer();

  return await sha256(buffer);
}

const SamplePage = () => {
  const navigate = useNavigate();
  const [videoPreview, setVideoPreview] = useState(null);
  const [linkPreview, setLinkPreview] = useState(null);
  const programs = useSelector((state) => state.module.programs);
  const [progress, setUploadProgress] = useState(0);
  const [isProgress, setIsProgress] = useState(false);
  const [alreadyWeek, setAlreadyWeek] = useState([]);
  const [weekOption, setWeekOption] = useState([
    { value: 'Week 1', label: 'Week 1' },
    { value: 'Week 2', label: 'Week 2' },
    { value: 'Week 3', label: 'Week 3' },
    { value: 'Week 4', label: 'Week 4' },
    { value: 'Week 5', label: 'Week 5' },
    { value: 'Week 6', label: 'Week 6' },
    { value: 'Week 7', label: 'Week 7' },
    { value: 'Week 8', label: 'Week 8' },
    { value: 'Week 9', label: 'Week 9' },
    { value: 'Week 10', label: 'Week 10' }
  ]);
  const [alreadyAddedClassDate, setClassDate] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');

  const initialValues = {
    program: '',
    videoFile: null,
    videoLink: '',
    week: '',
    class_date: new Date(),
    video_aspect: ''
  };

  const validationSchema = Yup.object().shape({
    program: Yup.string().required('Program is required'),
    week: Yup.string()
      .required('Week is required')
      .matches(/^[a-zA-Z\s]*\d+$/, 'Week must contain text followed by an integer'),
    // video_aspect: Yup.string().required('Video Aspect is required'),
    // class_date: Yup.date().required('Class date is required'),
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
    if (programs && typeof programs === 'object') {
      let programOption = programs.map((program) => {
        return { value: program._id, label: program.Product_Name };
      });
      setProgramList(programOption);
    }
  }, [programs]);

  useEffect(() => {
    const fetchAlreadyAddedWeek = async () => {
      const response = await axios.get(`${apiUrl}/api/media/already-added-week/${selectedProgram}`);

      console.log('#### response from the already-added-week', response);
      if (response?.data?.weeks?.length > 0) {
        setAlreadyWeek(response.data.weeks);
        setWeekOption((prev) =>
          prev.map((option) => ({
            ...option,
            isDisabled: response.data.weeks.includes(option.value) // Disable if it's in response.data.weeks
          }))
        );
      }
      if (response?.data?.dates?.length > 0) {
        let disabledDated = response.data.dates.map((d) => new Date(d));
        setClassDate(disabledDated);
      }
    };

    if (selectedProgram) {
      fetchAlreadyAddedWeek();
    }
  }, [selectedProgram]);

  const CHUNK_SIZE = 5 * 1024 * 1024; // 50MB

  const handleSubmit = async (values, { setErrors, setSubmitting, resetForm }) => {
    try {
      setUploadProgress(1);
      setIsProgress(true);

      if (values.videoLink) {
        const fileHash = await getVideoHash(values.videoLink);
        console.log(fileHash, 'file hash hash hash hash');

        await axios.post(`${apiUrl}/api/media/video-upload-by-link`, {
          week: values.week,
          class_date: values.class_date,
          video_aspect: values.video_aspect,
          program: values.program,
          videoLink: values.videoLink,
          videoHash: fileHash
        });
        toast.success('Media uploaded successfully!');
        navigate('/media/master-list');
        return;
      }

      const file = values.videoFile;
      const fileHash = await getVideoHash(values.videoFile);

      console.log(fileHash, 'file hash hash hash hash');

      // Step 1: Initiate multipart upload
      const initResponse = await axios.post(`${apiUrl}/api/media/initiate-upload`, {
        fileName: file.name,
        // fileType: file.type,
        fileType: 'Test',
        program: values.program,
        videoHash: fileHash,
        week: values.week
      });

      if (initResponse.data.duplicate) {
        toast.success('Media uploaded successfully!');
        navigate('/media/master-list');
        return;
      }

      const { uploadId, key } = initResponse.data;

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let completedChunks = 0; // Initialize completedChunks
      const uploadedParts = []; // Store parts ETag for completion

      // Step 2: Upload each chunk sequentially
      for (let currentChunkIndex = 0; currentChunkIndex < totalChunks; currentChunkIndex++) {
        const start = currentChunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const chunkFormData = new FormData();
        chunkFormData.append('file', chunk);
        chunkFormData.append('uploadId', uploadId);
        chunkFormData.append('key', key);
        chunkFormData.append('partNumber', currentChunkIndex + 1);

        // Upload the chunk and await the response
        const partUploadResponse = await axios.post(`${apiUrl}/api/media/upload-chunk`, chunkFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Store the ETag and part number for completion
        uploadedParts.push({
          ETag: partUploadResponse.data.ETag,
          PartNumber: currentChunkIndex + 1
        });

        // Update completed chunks and progress
        completedChunks += 1;
        const overallProgress = Math.round((completedChunks / totalChunks) * 100);
        console.log('Overall Progress:', overallProgress);
        setUploadProgress(overallProgress);
      }

      // Step 3: Complete multipart upload
      await axios.post(`${apiUrl}/api/media/complete-upload`, {
        uploadId,
        key,
        parts: uploadedParts,
        week: values.week,
        class_date: values.class_date,
        video_aspect: values.video_aspect,
        fileSize: file.size,
        program: values.program,
        fileHash
      });

      toast.success('Media uploaded successfully!');
      navigate('/media/master-list');
    } catch (error) {
      console.error('Error uploading file:', error.message);
      setErrors({ server: error.response?.data?.message || 'An unknown error occurred' });
    } finally {
      setSubmitting(false);
      setIsProgress(false);
      resetForm({});

      // Clear the file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleRemoveVideo = (setFieldValue) => {
    setVideoPreview(null);
    setLinkPreview(null);
    setFieldValue('videoFile', null);
    setFieldValue('videoLink', '');
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSelectedProgram = async (value, setFieldValue) => {
    setFieldValue('program', value.value);
    setSelectedProgram(value.value);
  };

  return (
    <Row className="justify-content-center">
      <Col lg={8}>
        <Card title="Video Upload" remove={'remove'}>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ handleSubmit, handleChange, setFieldValue, values, errors, touched, isSubmitting }) => (
              <Form noValidate onSubmit={handleSubmit}>
                {/* Program Dropdown */}
                <Form.Group controlId="programSelect" className="mb-3">
                  <Form.Label>Select Program</Form.Label>
                  <Select
                    defaultValue={selectedProgram}
                    options={programList}
                    onChange={(value) => handleSelectedProgram(value, setFieldValue)}
                  />
                  {errors.program && touched.program && <div className="text-danger">{errors.program}</div>}
                </Form.Group>

                {/* Week Input */}
                <Form.Group controlId="weekInput" className="mb-3">
                  <Form.Label>Week</Form.Label>
                  <Select options={weekOption} onChange={(value) => setFieldValue('week', value.value)} />
                  {/* <Form.Control type="text" name="week" value={values.week} onChange={handleChange} /> */}
                  {errors.week && touched.week && <div className="text-danger">{errors.week}</div>}
                </Form.Group>

                {/* Video Aspect */}
                {/* <Form.Group controlId="videoAspectSelect" className="mb-3">
                  <Form.Label>Video Aspect (56.25% or 177.78%)</Form.Label>
                  <Form.Control as="select" name="video_aspect" value={values.video_aspect} onChange={handleChange}>
                    <option value="">Select aspect ratio</option>
                    <option value="56.25%">56.25%</option>
                    <option value="177.78%">177.78%</option>
                  </Form.Control>
                  {errors.video_aspect && touched.video_aspect && <div className="text-danger">{errors.video_aspect}</div>}
                </Form.Group> */}

                {/* Date Picker */}
                {/* <Form.Group controlId="classDate" className="mb-3">
                  <Form.Label className="d-block">Class Date</Form.Label>
                  <DatePicker
                    selected={values.class_date}
                    onChange={(date) => setFieldValue('class_date', date)}
                    dateFormat="MMMM d, yyyy"
                    className="form-control"
                    minDate={new Date()}
                    excludeDates={alreadyAddedClassDate}
                  />
                  <ErrorMessage name="class_date" component="div" className="text-danger" />
                </Form.Group> */}

                {/* Video File Upload */}
                <Form.Group controlId="videoUpload" className="mb-3">
                  <Form.Label>Upload Video File</Form.Label>
                  <Form.Control
                    type="file"
                    accept="video/*"
                    name="videoFile"
                    disabled={linkPreview}
                    onChange={(event) => {
                      console.log('##### Upload change');
                      setVideoPreview('');
                      setLinkPreview(null);
                      const file = event.currentTarget.files[0];
                      const allowedTypes = ['video/mp4', 'video/mov', 'video/avi'];
                      setFieldValue('videoFile', file || null);
                      if (allowedTypes.includes(file.type)) {
                        if (videoPreview) {
                          URL.revokeObjectURL(videoPreview);
                        }
                        setFieldValue('videoFile', file || null);
                        const previewUrl = URL.createObjectURL(file);
                        console.log('previewUrl :-', previewUrl, videoPreview, file.size);
                        setVideoPreview(previewUrl);
                        setLinkPreview(null);
                      }
                    }}
                  />
                  {errors.videoFile && touched.videoFile && <div className="text-danger">{errors.videoFile}</div>}
                </Form.Group>

                {/* <div className="text-center mb-3">
                  <span>-or-</span>
                </div> */}

                {/* Video Link Upload */}
                <Form.Group controlId="videoLink" className="mb-3">
                  <Form.Label>Video Link</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Video Link"
                    value={values.videoLink}
                    disabled={videoPreview}
                    onChange={(event) => {
                      setFieldValue('videoLink', event.target.value);
                      setFieldValue('videoFile', null);
                      setVideoPreview(null);
                      setLinkPreview(event.target.value);
                    }}
                  />
                  {errors.videoLink && touched.videoLink && <div className="text-danger">{errors.videoLink}</div>}
                </Form.Group>

                <Form.Group controlId="programSelect" className="mb-3">
                  <Form.Label>Weeks Already Added (Only for checking)</Form.Label>
                  <Form.Control as="select" name="already_week" value={values.already_week} onChange={handleChange}>
                    {alreadyWeek.length > 0 && alreadyWeek.map((val) => <option value={val}>{val}</option>)}
                  </Form.Control>
                </Form.Group>

                {/* Video Preview */}
                {videoPreview ? (
                  <div className="mb-3">
                    <h5>Video Preview</h5>
                    <video key={videoPreview} controls className="w-100">
                      <source src={videoPreview} type="video/mp4" />
                    </video>
                    <Button variant="danger" className="mt-2" onClick={() => handleRemoveVideo(setFieldValue)} disabled={isProgress}>
                      Remove Video
                    </Button>
                  </div>
                ) : null}

                {linkPreview && (
                  <div className="mb-3">
                    <h5>Video Id Preview</h5>
                    <video controls className="w-100">
                      <source src={linkPreview} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <Button variant="danger" className="mt-2" onClick={() => handleRemoveVideo(setFieldValue)} disabled={isSubmitting}>
                      Remove Video Link
                    </Button>
                  </div>
                )}

                {/* Progress Bar */}
                {isProgress && <ProgressBar animated now={progress} label={`${progress}%`} />}

                {/* Submit Button */}
                <Button variant="primary" type="submit" style={{ marginTop: '10px' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Upload Video'}
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
