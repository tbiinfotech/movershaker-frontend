import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import axios from 'axios';
import DOMPurify from 'dompurify';
import Card from '../../components/Card/MainCard';
import dayjs from 'dayjs';

const SamplePage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/announcements`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log(response.data);

        setAnnouncements(response.data.data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        if (err?.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to fetch announcements');
        }
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);
  const formatDate = (time) => {
    // Fallback format
    const fallback = dayjs(new Date()).format('MMM D YYYY HH:mm');

    if (!time) return fallback;

    // Handle Date instance
    if (time instanceof Date) return dayjs(time).format('MMM D YYYY HH:mm');

    // Handle Firestore Timestamps (assuming they have a `toDate` method)
    if (typeof time.toDate === 'function') {
      return dayjs(time.toDate()).format('MMM D YYYY HH:mm');
    }

    // Handle valid string or number
    if (typeof time === 'string' || typeof time === 'number') {
      const parsedDate = dayjs(time); // Using `dayjs` to parse directly
      if (parsedDate.isValid()) return parsedDate.format('MMM D YYYY HH:mm');
    }

    // Fallback for invalid cases
    return fallback;
  };

  console.log(announcements, 'announcements::::::::::::');

  return (
    <React.Fragment>
      <Row>
        <Col>
          {loading ? (
            <p>Loading announcements...</p>
          ) : error ? (
            <p>{error}</p>
          ) : announcements.length === 0 ? (
            <p>No announcements available</p>
          ) : (
            announcements.map((announcement) => (
              <Card
                key={announcement._id}
                title={
                  <div
                    className="announcement-card"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(announcement.feedCaption, {
                        ALLOWED_TAGS: ['iframe', 'img', 'p', 'br'],
                        ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'controls', 'class']
                      })
                    }}
                  />
                }
                cardName={'announcements'}
                id={announcement._id}
                isOption
              >
                <p
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(announcement.pushNotificationCaption, {
                      ALLOWED_TAGS: ['iframe', 'img', 'p', 'br'],
                      ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'controls', 'class']
                    })
                  }}
                />
                <hr />
                {/* <p>{announcement.expiryDate ? `Expiry Date: ${formatDate(announcement.expiryDate)}` : ''}</p>
                <p>{announcement.feedUrl}</p> */}

                {announcement.specificUsers && announcement.emails && (
                  <p>
                    <strong>Recipients:</strong> {announcement.emails}
                  </p>
                )}
                <p>
                  <strong>Sent:</strong> {formatDate(announcement.createdAt)}
                </p>

                <p>{announcement.expiryDate ? `Expiry Date: ${formatDate(announcement.expiryDate)}` : ''}</p>

                {announcement.fileUrl && (
                  <p>
                    <strong>Attachment:</strong>{' '}
                    <a href={announcement.fileUrl} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </p>
                )}
              </Card>
            ))
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default SamplePage;
