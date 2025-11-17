import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Form } from 'react-bootstrap';
import Card from '../../components/Card/MainCard';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Select from 'react-select';
const apiUrl = import.meta.env.VITE_SERVER_URL;

const SamplePage = () => {
  const [qrCode, setQRCode] = useState(null);
  const programs = useSelector((state) => state.module.programs);
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedweek, setSelectedWeek] = useState('');
  const [programList, setProgramList] = useState([]);
  const [editStatus, setEditStatus] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    if (programs && typeof programs === 'object') {
      let programOption = programs.map((program) => {
        return { value: program._id, label: program.Product_Name };
      });
      setProgramList(programOption);
    }
  }, [programs]);

  // Fetch attendance and leaderboard data when selectedProgram changes
  useEffect(() => {
    if (selectedProgram && selectedweek) {
      fetchAttendanceData(selectedProgram, selectedweek);
      fetchQRCodes(selectedProgram, selectedweek);
    }
    if (selectedProgram) {
      fetchLeaderboard(selectedProgram);
    }
  }, [selectedProgram, selectedweek]);

  // API call to fetch attendance data
  const fetchAttendanceData = async (selectedProgram, selectedweek) => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/practice/attendance/${selectedProgram}/${selectedweek}`);
      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  // API call to fetch leaderboard data
  const fetchLeaderboard = async (selectedProgram) => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/practice/leaderboard/${selectedProgram}`);
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };

  const fetchQRCodes = async (selectedProgram, selectedweek) => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/practice/qrcode/${selectedProgram}/${selectedweek}`);
      setQRCode(data.qrCodeUrl);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setQRCode('');
    }
  };

  const weeks = ['week 1', 'week 2', 'week 3', 'week 4', 'week 5', 'week 6', 'week 7', 'week 8', 'week 9', 'week 10'];

  const handleSelectedProgram = async (value) => {
    setSelectedProgram(value.value);
  };

  const handleEditClick = (attendance) => {
    setEditStatus(attendance._id);
    setUpdatedStatus(attendance.status);
  };

  const handleSave = async (id) => {
    try {
      await axios.post(`${apiUrl}/api/practice/attendance/update-status`, { status: updatedStatus, id });
      setEditStatus(null);
      setHoveredRow(null);
      fetchAttendanceData(selectedProgram, selectedweek);
    } catch (error) {
      console.error('Error updating attendance status:', error);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card title="Friday Practice - Admin Panel" isOption>
            {/* Attendance Table */}
            <div className="mb-4">
              <Form.Group controlId="selectProgram">
                <Form.Label>Select Program</Form.Label>
                <Select options={programList} onChange={handleSelectedProgram} />
              </Form.Group>
            </div>

            <div className="mb-4">
              <Form.Group controlId="week" className="mb-4">
                <Form.Label>Select Week</Form.Label>
                <Form.Control as="select" name="week" className="form-control" onChange={(e) => setSelectedWeek(e.target.value)}>
                  <option value="">Select a week</option>
                  {weeks.map((week, index) => (
                    <option key={index} value={week}>
                      {week}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>
            <div className="mb-4">
              {/* {qrCode && (
                <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCode)}&size=256x256`} alt="QR Code" />
              )} */}
              {qrCode && <img src={qrCode} alt="QR Code" />}
            </div>
            <h5>Attendance Data</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Program</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData?.length > 0 ? (
                  attendanceData.map((attendance) => (
                    <tr key={attendance._id}>
                      <td>
                        {attendance.studentId.First_Name} {attendance.studentId.Last_Name}
                      </td>
                      <td>{attendance.programId.Product_Name}</td>
                      <td>
                        {new Date(attendance.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td
                        className="border p-2 relative"
                        onMouseEnter={() => setHoveredRow(attendance._id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        {editStatus === attendance._id ? (
                          <input
                            type="text"
                            value={updatedStatus}
                            onChange={(e) => setUpdatedStatus(e.target.value)}
                            onBlur={() => handleSave(attendance._id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSave(attendance._id);
                            }}
                            className="border p-1"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>{attendance.status}</span>
                            {hoveredRow === attendance._id && <i class="bi bi-pencil" onClick={() => handleEditClick(attendance)}></i>}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No attendance data available
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Leaderboard */}
            <h5>Leaderboard</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student Name</th>
                  <th>Attendance Count</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard?.length > 0 ? (
                  leaderboard.map((entry) => (
                    <tr key={entry.studentId}>
                      <td>{entry.attendanceCount}</td>
                      <td>{entry.name}</td>
                      <td>{entry.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No leaderboard data available
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default SamplePage;
