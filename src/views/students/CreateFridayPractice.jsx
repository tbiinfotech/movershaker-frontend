import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Form } from 'react-bootstrap';
import Card from '../../components/Card/MainCard';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
const apiUrl = import.meta.env.VITE_SERVER_URL;

const SamplePage = () => {
  const [qrCode, setQRCode] = useState('');
  const programs = useSelector((state) => state.module.programs);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [addedWeeks, setAddedWeeks] = useState([]);
  const [addedDate, setAddedDate] = useState([]);
  const [upcomingFridays, setUpcomingFridays] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedProgramName, setProgramName] = useState('');
  const [classDate, setClassDate] = useState('');

  useEffect(() => {
    if (programs && typeof programs === 'object') {
      let programOption = programs.map((program) => {
        return { value: program._id, label: program.Product_Name };
      });
      setProgramList(programOption);
    }
  }, [programs]);

  useEffect(() => {
    if (selectedProgram) {
      let startDateOfProgram = programs.filter((program) => program._id == selectedProgram);
      console.log('Start date of program', startDateOfProgram);
      // const fridays = getUpcomingFridays(new Date(startDateOfProgram[0].Start_Date), 10);
      const fridays = getUpcomingFridays(new Date(), 10);
      setUpcomingFridays(fridays);
    }
  }, [selectedProgram]);

  const getUpcomingFridays = (currentDate, numberOfFridays) => {
    const fridays = [];
    const date = new Date(currentDate);

    date.setDate(date.getDate() + ((5 - date.getDay() + 7) % 7));

    for (let i = 0; i < numberOfFridays; i++) {
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      fridays.push(formattedDate);
      date.setDate(date.getDate() + 7);
    }

    return fridays;
  };

  // API call to generate QR Code
  const handleGenerateQRCode = async (values, { resetForm }) => {
    try {
      const { data } = await axios.post(`${apiUrl}/api/practice/generate-qrcode`, {
        programId: values.programId,
        friday: values.friday,
        week: values.week
      });
      const filterProgramName = await programs.filter((program) => program._id === values.programId);
      console.log("###################### ", filterProgramName)
      setProgramName(filterProgramName[0].Product_Name);
      setClassDate(values.friday);
      setQRCode(data.qrCodeUrl);
      setShowQRCodeModal(true);
      setSelectedProgram(null)
      resetForm();
      // if (data.qrCodeUrl) {
      // }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    }
  };

  // Close the QR Code modal
  const handleCloseQRCodeModal = () => {
    setShowQRCodeModal(false);
  };

  const weeks = ['week 1', 'week 2', 'week 3', 'week 4', 'week 5', 'week 6', 'week 7', 'week 8', 'week 9', 'week 10'];

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    programId: Yup.string().required('Program is required'),
    week: Yup.string().required('Week is required'),
    friday: Yup.string().required('Friday is required')
  });

  useEffect(() => {
    if (selectedProgram) {
      fetchQRCodes(selectedProgram);
      // fetchAttendanceData();
      // fetchLeaderboard();
    }
  }, [selectedProgram]);

  // API call to fetch attendance data
  const fetchQRCodes = async (selectedProgram) => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/practice/already-added-practice/${selectedProgram}`);
      const weeks = data.data.map((item) => item.week);
      const date = data.data.map((item) => new Date(item.date));
      setAddedDate(date);
      setAddedWeeks(weeks);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAddedWeeks([]);
    }
  };

  const handleSelectedProgram = async (value, setFieldValue) => {
    setFieldValue('programId', value.value);
    setSelectedProgram(value.value);
  };

  const compareDates = (date1, date2) => {
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  };

  return (
    <Row className="justify-content-center">
      <Col md={8}>
        <Card title="Friday Practice">
          <Formik
            initialValues={{
              programId: '',
              week: '',
              friday: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleGenerateQRCode}
          >
            {({ setFieldValue }) => (
              <FormikForm>
                <Form.Group controlId="selectProgram" className="mb-4">
                  <Form.Label>Select Program</Form.Label>
                  <Select
                    defaultValue={selectedProgram}
                    options={programList}
                    onChange={(value) => handleSelectedProgram(value, setFieldValue)}
                  />

                  <ErrorMessage name="programId" component="div" className="text-danger" />
                </Form.Group>

                <Form.Group controlId="week" className="mb-4">
                  <Form.Label>Select Week</Form.Label>
                  <Field as="select" name="week" className="form-control">
                    <option value="">Select a week</option>
                    {weeks.map((week, index) => (
                      <option key={index} value={week} disabled={addedWeeks.includes(week)}>
                        {week} {addedWeeks.includes(week) ? '(Already Added)' : ''}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="week" component="div" className="text-danger" />
                </Form.Group>

                <Form.Group controlId="friday" className="mb-4">
                  <Form.Label>Select Upcoming Friday</Form.Label>
                  <Field as="select" name="friday" className="form-control">
                    <option value="">Select a Friday</option>
                    {upcomingFridays.map((friday, index) => {
                      const today = new Date(); // Get today's date
                      const fridayDate = new Date(friday);
                      const findDate = addedDate.some((addedDateItem) => compareDates(addedDateItem, fridayDate));

                      return (
                        <option
                          key={index}
                          value={friday}
                          disabled={fridayDate < today || findDate} // Disable if the date is earlier than today
                        >
                          {friday} {findDate && ' (Already Added Video for this friday)'}
                        </option>
                      );
                    })}
                  </Field>
                  <ErrorMessage name="friday" component="div" className="text-danger" />
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-3">
                  Generate QR Code
                </Button>
              </FormikForm>
            )}
          </Formik>

          {/* QR Code Modal */}
          <Modal show={showQRCodeModal} onHide={handleCloseQRCodeModal} style={{ zIndex: 99999999999 }}>
            <Modal.Header closeButton>
              <Modal.Title>Generated QR Code</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <p>Program Name : {selectedProgramName}</p>
              <p>Sheduled Class Date : {classDate}</p>
              {qrCode ? <img src={qrCode} alt="QR Code" style={{ width: '100%' }} /> : <p>No QR Code generated.</p>}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseQRCodeModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </Card>
      </Col>
    </Row>
  );
};

export default SamplePage;
