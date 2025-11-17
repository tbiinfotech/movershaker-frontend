import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, InputGroup, Form, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card/MainCard';
import axios from 'axios';
import { toast } from 'react-toastify';
import SyncButton from './SyncButton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import { median } from 'd3';

const apiUrl = import.meta.env.VITE_SERVER_URL;

const MasterList = () => {
  const navigate = useNavigate();
  const toastref = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [spinningButtons, setButtonsSpinning] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Simulating fetching program names and videos from API
  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/media`);

      const programsWithMedia = response.data.data.flatMap((item) => {
        let videoLink = item.filePath;
        return {
          programId: item._id,
          id: item._id,
          program_name: item?.programId?.Product_Name,
          videoLink,
          week: item.week,
          transcriptionPath: item.transcriptionPath,
          captionSyncStatus: item?.captionSyncStatus,
          syncCaption: item.transcriptionPath ? false : true
        };
      });

      console.log('Programs with media:', programsWithMedia);
      setAllPrograms(programsWithMedia);
      setPrograms(programsWithMedia);
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
      setLoading(false);
    }

    // setTimeout(() => {
    //   const newPrograms = Array.from({ length: ITEMS_PER_PAGE }, (_, i) => ({
    //     id: (page - 1) * ITEMS_PER_PAGE + i + 1,
    //     name: `Program ${page}-${i + 1}`,
    //     videoLink: `https://example.com/video${page}-${i + 1}`
    //   }));
    //   setPrograms((prev) => [...prev, ...newPrograms]);
    //   setLoading(false);
    // }, 1000);
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const handleEditVideo = (id, week) => {
    navigate(`/media/edit/${id}/${week}`);
  };

  const handleDeleteLink = async (id) => {
    await axios.delete(`${apiUrl}/api/media/${id}`);
    toast.success('Media deleted successfully');
    fetchPrograms();
  };

  const handleScroll = (e) => {
    // const { scrollTop, scrollHeight, clientHeight } = e.target;
    // if (scrollTop + clientHeight >= scrollHeight - 10 && !loading) {
    //   setPage((prev) => prev + 1);
    // }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {

    console.log(search, "###################", allPrograms)

    const searchResult = search
      ? allPrograms.filter((program) => program.program_name?.toLowerCase().includes(search?.toLowerCase()))
      : allPrograms;

    setPrograms(searchResult);

    console.log(programs, 'programs');
  }, [search, allPrograms]);

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

  const handleSync = async (program) => {
    try {
      const syncResponse = await axios.post(`${apiUrl}/api/media/sync-caption`, {
        mediaId: program.id,
        videoUrl: program.videoLink,
        key: program.videoLink.split('/').pop()
      });

      setButtonsSpinning((prev) => [...prev, program.id]);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <React.Fragment>
      <Toast ref={toastref} />
      <ConfirmDialog />
      <Row>
        <Col>
          <Card title="Master List" remove={'remove'}>
            <InputGroup className="mb-3 shadow-sm">
              <Form.Control
                placeholder="Search..."
                aria-label="Search"
                aria-describedby="search-bar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderRadius: '25px' }}
              />
            </InputGroup>
            {/* Scrollable program list */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }} onScroll={handleScroll} className="mt-3">
              <ListGroup>
                {programs.map((program, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div style={{ width: '60%' }}>
                      <strong>{formatProgramName(program.program_name)}</strong>
                      <br />
                      <small>{program.videoLink}</small>
                    </div>

                    <div>
                      <strong>{program.week}</strong>
                    </div>
                    <div className="d-flex align-items-center">
                      {/* Edit Icon */}
                      {program.syncCaption ? (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <SyncButton
                            spinning={spinningButtons.includes(program.id)}
                            onClick={() => handleSync(program)}
                            label="Sync Caption"
                          />
                        </div>
                      ) : (
                        program.captionSyncStatus === 'processing' && (
                          <SyncButton spinning={true} onClick={() => handleSync(program)} label="Syncing..." />
                        )
                      )}
                      {/* Edit Icon */}

                      <i
                        className="bi bi-pencil-square"
                        onClick={() => handleEditVideo(program.programId, program.week)}
                        role="button"
                        tabIndex={0}
                        title="Edit Video"
                        onKeyDown={(e) => e.key === 'Enter' && handleEditVideo(program.programId, program.week)}
                        style={{ cursor: 'pointer' }}
                      ></i>
                      {/* Copy Icon */}
                      <i
                        className="bi bi-clipboard mx-2"
                        onClick={() => handleCopyLink(program.videoLink)}
                        role="button"
                        tabIndex={0}
                        title="Copy Link"
                        onKeyDown={(e) => e.key === 'Enter' && handleCopyLink(program.videoLink)}
                        style={{ cursor: 'pointer' }}
                      ></i>

                      {/* Delete Icon */}
                      <i
                        className="bi bi-trash3 mx-2 text-danger"
                        onClick={() => confirm('center', program.id)}
                        role="button"
                        tabIndex={0}
                        title="Delete media"
                        onKeyDown={(e) => e.key === 'Enter' && confirm('center', program._id)}
                        style={{ cursor: 'pointer' }}
                      ></i>
                    </div>
                    {/* {uploadProgress[program.id] && (
                      <div className="progress mt-2">
                        <div className="progress-bar" role="progressbar" style={{ width: `${uploadProgress[program.id]}%` }}>
                          {uploadProgress[program.id]}%
                        </div>
                      </div>
                    )} */}
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {!programs?.length && !loading && (
                <div className="text-center mt-2">
                  <span>Not Found</span>
                </div>
              )}

              {loading && (
                <div className="text-center mt-2">
                  <span>Loading...</span>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default MasterList;
