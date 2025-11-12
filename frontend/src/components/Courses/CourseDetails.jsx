import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { enrollmentAPI, courseAPI } from '../../services/api.js';

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await courseAPI.getById(id);
        setCourse(data);
      } catch (err) {
        console.error('Fetch course error:', err);
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const { data } = await enrollmentAPI.listCourseStudents(id);
      setStudents(data);
    } catch (err) {
      alert('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const exportCSV = async () => {
    try {
      const res = await enrollmentAPI.exportCourseStudentsCSV(id);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enrolled_${course?.courseCode || 'course'}_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  if (!course) return <div style={{ padding: 24 }}>Course not found</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      {/* Course Info Card */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: 24 }}>
        <h1>{course.title}</h1>
        <p><strong>Code:</strong> {course.courseCode} | <strong>Department:</strong> {course.department}</p>
        <p>{course.description}</p>
        <p><strong>Credits:</strong> {course.credits} | <strong>Instructor:</strong> {course.instructor}</p>
        <p><strong>Schedule:</strong></p>
  <ul style={{ marginTop: 4, paddingLeft: 20 }}>
    <li>Days: {course.schedule?.days}</li>
    <li>Time: {course.schedule?.time}</li>
    <li>Room: {course.schedule?.room}</li>
  </ul>
        <p><strong>Enrollment:</strong> {course.enrolled || 0} / {course.capacity}</p>
        <p><strong>Status:</strong> {course.isActive ? 'Active' : 'Inactive'}</p>
      </div>

      {/* Admin Section - your original code */}
      {user?.role === 'admin' && (
        <div style={{ marginTop: 32 }}>
          <h3>Enrolled Students</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <button onClick={loadStudents} style={{ padding: '8px 14px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>
              {loadingStudents ? 'Loading…' : 'Load List'}
            </button>
            <button onClick={exportCSV} style={{ padding: '8px 14px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 6 }}>
              Export CSV
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Email</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Student ID</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Major</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Semester</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Enrolled At</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: 16, textAlign: 'center', color: '#777' }}>No students found</td></tr>
                ) : students.map(s => (
                  <tr key={s._id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: 12 }}>{s.name}</td>
                    <td style={{ padding: 12 }}>{s.email}</td>
                    <td style={{ padding: 12 }}>{s.studentId}</td>
                    <td style={{ padding: 12 }}>{s.major}</td>
                    <td style={{ padding: 12 }}>{s.semester}</td>
                    <td style={{ padding: 12 }}>{new Date(s.enrolledAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
