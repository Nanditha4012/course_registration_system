import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { enrollmentAPI } from '../../services/api.js';
import CourseCard from '../Courses/CourseCard.jsx';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      const { data } = await enrollmentAPI.getMyCourses();
      setEnrollments(data);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (courseId) => {
    if (!window.confirm('Are you sure you want to drop this course?')) return;

    try {
      await enrollmentAPI.drop(courseId);
      setMessage('Course dropped successfully');
      loadEnrollments();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to drop course');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const totalCredits = enrollments.reduce((sum, e) => sum + (e.course?.credits || 0), 0);

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Welcome, {user?.name}!</h1>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '25px', 
        borderRadius: '12px', 
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: '0', marginBottom: '15px', fontSize: '20px' }}>Student Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <p style={{ margin: '5px 0' }}><strong>Student ID:</strong> {user?.studentId}</p>
          <p style={{ margin: '5px 0' }}><strong>Major:</strong> {user?.major}</p>
          <p style={{ margin: '5px 0' }}><strong>Semester:</strong> {user?.semester}</p>
          <p style={{ margin: '5px 0' }}><strong>GPA:</strong> {user?.gpa?.toFixed(2) || 'N/A'}</p>
          <p style={{ margin: '5px 0' }}><strong>Total Credits:</strong> {totalCredits}</p>
        </div>
      </div>

      {message && (
        <div style={{ 
          padding: '12px 20px', 
          marginBottom: '20px', 
          background: message.includes('Failed') ? '#ffebee' : '#fff3cd',
          color: message.includes('Failed') ? '#c62828' : '#856404',
          borderRadius: '6px',
          border: `1px solid ${message.includes('Failed') ? '#ef9a9a' : '#ffeaa7'}`
        }}>
          {message}
        </div>
      )}

      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
        My Enrolled Courses ({enrollments.length})
      </h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
          Loading your courses...
        </div>
      ) : enrollments.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#f9f9f9',
          borderRadius: '12px',
          border: '2px dashed #ddd'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📚</div>
          <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '10px' }}>
            No Courses Enrolled Yet
          </h3>
          <p style={{ color: '#666', fontSize: '15px' }}>
            Visit the "Browse Courses" page to enroll in courses
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {enrollments.map(enrollment => (
            <CourseCard 
              key={enrollment._id} 
              course={enrollment.course} 
              enrolled={true}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
