import { useState, useEffect } from 'react';
import { enrollmentAPI } from '../../services/api.js';
import { useNavigate } from 'react-router-dom';

export default function EnrolledCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const navigate = useNavigate();

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      const { data } = await enrollmentAPI.getMyCourses();
      setEnrollments(data);
    } catch (error) {
      setMessage('Failed to load enrolled courses');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to drop "${courseTitle}"?`)) {
      return;
    }

    try {
      await enrollmentAPI.drop(courseId);
      setMessage('Course dropped successfully');
      setMessageType('success');
      loadEnrollments();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to drop course');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 4000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const totalCredits = enrollments.reduce((sum, e) => sum + (e.course?.credits || 0), 0);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px' }}>Loading your courses...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#333' }}>
          My Enrolled Courses
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Total: {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} • {totalCredits} credits
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div style={{ 
          padding: '15px', 
          marginBottom: '25px', 
          borderRadius: '8px',
          background: messageType === 'success' ? '#d4edda' : '#f8d7da',
          color: messageType === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* Credits Summary Card */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '5px' }}>Total Courses</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{enrollments.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '5px' }}>Total Credits</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalCredits}</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '5px' }}>Status</div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginTop: '6px' }}>
              {totalCredits < 12 ? 'Part-time' : 'Full-time'}
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {enrollments.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#f9f9f9',
          borderRadius: '12px',
          border: '2px dashed #ddd'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
          <h3 style={{ fontSize: '22px', marginBottom: '10px', color: '#333' }}>
            No Courses Enrolled Yet
          </h3>
          <p style={{ color: '#666', marginBottom: '25px', fontSize: '15px' }}>
            Start building your schedule by browsing available courses
          </p>
          <button
            onClick={() => navigate('/courses')}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Browse Courses
          </button>
        </div>
      ) : (
        /* Course List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;

            return (
              <div 
                key={enrollment._id}
                style={{ 
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '25px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    {/* Course Header */}
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ 
                        display: 'inline-block',
                        background: '#e3f2fd',
                        color: '#1976d2',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        {course.courseCode}
                      </div>
                      <h3 style={{ 
                        fontSize: '20px', 
                        marginBottom: '8px', 
                        color: '#333',
                        fontWeight: '600'
                      }}>
                        {course.title}
                      </h3>
                      <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                        {course.description}
                      </p>
                    </div>

                    {/* Course Details Grid */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '15px',
                      marginBottom: '15px'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Instructor</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                          {course.instructor}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Schedule</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                          {course.schedule?.days?.join(', ')} • {course.schedule?.time}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Room</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                          {course.schedule?.room}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Credits</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                          {course.credits} credits
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Enrolled On</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                          {formatDate(enrollment.enrolledAt)}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Status</div>
                        <div style={{ 
                          display: 'inline-block',
                          fontSize: '13px', 
                          fontWeight: '600',
                          color: '#2e7d32',
                          background: '#e8f5e9',
                          padding: '3px 10px',
                          borderRadius: '12px'
                        }}>
                          ✓ {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginLeft: '20px' }}>
                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      style={{
                        padding: '8px 20px',
                        fontSize: '14px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleDrop(course._id, course.title)}
                      style={{
                        padding: '8px 20px',
                        fontSize: '14px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Drop Course
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
