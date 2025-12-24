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
  const [refreshKey, setRefreshKey] = useState(0);
  
  // File upload states
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
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
  }, [id, refreshKey]); // Refetch when refreshKey changes

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
  const handleDownload = (file) => {
  // Create a simple download link
    const link = document.createElement('a');
    link.href = file.url;
  link.download = file.name;
    link.target = '_blank';
  link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // File upload handlers
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setUploadError(null);
    
    if (!selected) {
      setFile(null);
      return;
    }

    // Validate file size (10MB limit)
    if (selected.size > 10 * 1024 * 1024) {
      setUploadError('File must be less than 10MB');
      setFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (!allowedTypes.includes(selected.type)) {
      setUploadError('Only PDF, Word, and PowerPoint files are allowed');
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
  if (!file) return;
  
  setUploading(true);
  setUploadError(null);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    await courseAPI.uploadFile(id, formData);
    
      alert('File uploaded successfully!');
    setFile(null);
      
      // Reset file input
    const fileInput = document.getElementById('file-upload-input');
    if (fileInput) fileInput.value = '';
    
      // Refresh course data to show new file
    setRefreshKey(k => k + 1);
  } catch (err) {
    console.error('Upload error:', err);
    setUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
  } finally {
    setUploading(false);
  }
};


  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await courseAPI.deleteFile(id, fileId);
      alert('File deleted successfully!');
      setRefreshKey(k => k + 1); // Refresh course data
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Delete failed');
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

      {/* Admin: File Upload Section */}
      {user?.role === 'admin' && (
        <div style={{ 
          padding: 20, 
          background: '#f5f5f5', 
          borderRadius: 8, 
          marginBottom: 24 
        }}>
          <h4 style={{ marginTop: 0, marginBottom: 12 }}>Upload Course Material</h4>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <input 
                id="file-upload-input"
                type="file" 
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ flex: 1 }}
              />
              <button 
                onClick={handleUpload}
                disabled={!file || uploading}
                style={{ 
                  padding: '8px 20px', 
                  background: file && !uploading ? '#1976d2' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: file && !uploading ? 'pointer' : 'not-allowed',
                  fontWeight: 500
                }}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            
            {file && !uploadError && (
              <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
            
            {uploadError && (
              <p style={{ margin: 0, fontSize: 14, color: '#d32f2f' }}>
                ⚠️ {uploadError}
              </p>
            )}
            
            <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
              Accepted formats: PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx) • Max 10MB
            </p>
          </div>
        </div>
      )}

      {/* Course Materials Section (visible to all) */}
      {course.files?.length > 0 && (
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>Course Materials</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {course.files.map(file => (
              <li 
                key={file._id} 
                style={{ 
                  padding: 16, 
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <button
                    onClick={() => handleDownload(file)}
                    style={{
                      color: '#1976d2',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      // ...
                    }}
                  >
                    📄 {file.name}
                  </button>

                  <div style={{ marginTop: 4, fontSize: 14, color: '#666' }}>
                    {(file.size / 1024).toFixed(1)} KB • 
                    Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => handleDeleteFile(file._id)}
                    style={{ 
                      padding: '6px 16px',
                      background: '#d32f2f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Admin: Enrolled Students Section */}
      {user?.role === 'admin' && (
        <div style={{ marginTop: 32 }}>
          <h3>Enrolled Students</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <button onClick={loadStudents} style={{ padding: '8px 14px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              {loadingStudents ? 'Loading…' : 'Load List'}
            </button>
            <button onClick={exportCSV} style={{ padding: '8px 14px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
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
                  <tr><td colSpan="6" style={{ padding: 16, textAlign: 'center', color: '#777' }}>No students enrolled yet</td></tr>
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
