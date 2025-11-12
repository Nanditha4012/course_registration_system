import { useState, useEffect } from 'react';
import { courseAPI, enrollmentAPI } from '../../services/api.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CourseList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myEnrolledSet, setMyEnrolledSet] = useState(new Set());
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedSemester, setSelectedSemester] = useState('All Semesters');
  const [showOnlyMySemester, setShowOnlyMySemester] = useState(true); // New state
  const [message, setMessage] = useState('');

  const departments = ['All Departments', 'Computer Science', 'Mathematics', 'Information Science', 'Business', 'Physics', 'Chemistry'];
  const semesters = ['All Semesters', 'Even', 'Odd'];

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
  if (user?.role === 'student') {
    enrollmentAPI.getMyCourses().then(({ data }) => {
      const ids = new Set(data.map(d => d.course?._id || d.course));
      setMyEnrolledSet(ids);
    }).catch(() => {});
  }
}, [user]);
  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedDepartment, selectedSemester, showOnlyMySemester]);

  const loadCourses = async () => {
    try {
      const { data } = await courseAPI.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      setMessage('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Filter by semester-wise eligibility for students
    if (user?.role === 'student' && showOnlyMySemester) {
      // Show courses for current semester and previous semesters
      filtered = filtered.filter(course => {
        // You can implement semester-based logic here
        // For now, showing all active courses
        return course.isActive;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by department
    if (selectedDepartment !== 'All Departments') {
      filtered = filtered.filter(course => course.department === selectedDepartment);
    }

    // Filter by semester
    if (selectedSemester !== 'All Semesters') {
      filtered = filtered.filter(course => course.semester === selectedSemester);
    }

    setFilteredCourses(filtered);
  };

    const handleEnroll = async (courseId) => {
    setEnrolling(prev => ({ ...prev, [courseId]: true }));
    try {
      await enrollmentAPI.enroll(courseId);
      setMessage('Successfully enrolled in course!');
    // Update local enrolled set so button changes to "Already Enrolled"
      setMyEnrolledSet(prev => {
        const next = new Set(prev);
        next.add(courseId);
        return next;
      });
    // Optionally bump the enrolled count in UI
      setCourses(prev =>
      prev.map(c => c._id === courseId ? { ...c, enrolled: Math.min((c.enrolled || 0) + 1, c.capacity) } : c)
      );
    setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Enrollment failed');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };


  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading courses...</div>;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>
          {user?.role === 'admin' ? 'All Courses' : 'Available Courses'}
        </h1>
        {user?.role === 'student' && (
          <p style={{ color: '#666', fontSize: '16px' }}>
            You are in Semester {user.semester}. {showOnlyMySemester ? 'Showing courses for your level.' : 'Showing all courses.'}
          </p>
        )}
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          background: message.includes('Success') ? '#d4edda' : '#f8d7da',
          color: message.includes('Success') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('Success') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: user?.role === 'student' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
        gap: '15px',
        marginBottom: '30px'
      }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '12px',
            fontSize: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            outline: 'none'
          }}
        />

        {/* Department Filter */}
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          style={{
            padding: '12px',
            fontSize: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        {/* Semester Filter */}
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          style={{
            padding: '12px',
            fontSize: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {semesters.map(sem => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </select>

        {/* Semester Filter Toggle (Students Only) */}
        {user?.role === 'student' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer'
          }}
          onClick={() => setShowOnlyMySemester(!showOnlyMySemester)}
          >
            <input
              type="checkbox"
              checked={showOnlyMySemester}
              onChange={(e) => setShowOnlyMySemester(e.target.checked)}
              style={{ marginRight: '10px', cursor: 'pointer' }}
            />
            <label style={{ cursor: 'pointer', fontSize: '15px' }}>
              My Semester Only
            </label>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '20px', color: '#666', fontSize: '15px' }}>
        Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
      </div>

      {/* Courses Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {filteredCourses.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: '60px 20px',
            textAlign: 'center',
            background: 'white',
            borderRadius: '12px',
            border: '2px dashed #ddd'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📚</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#333' }}>No courses found</h3>
            <p style={{ color: '#666' }}>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div
              key={course._id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => navigate(`/courses/${course._id}`)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {/* Course Header */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1976d2',
                    background: '#e3f2fd',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {course.courseCode}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#666',
                    background: '#f5f5f5',
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }}>
                    {course.credits} Credits
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '10px', color: '#333' }}>
                  {course.title}
                </h3>
              </div>

              {/* Course Info */}
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '10px' }}>
                  {course.description.substring(0, 100)}...
                </p>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '10px' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Department:</strong> {course.department}
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Instructor:</strong> {course.instructor}
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Semester:</strong> {course.semester} {course.year}
                  </div>
                  {course.schedule && (
                    <div style={{ marginBottom: '6px' }}>
                      <strong>Schedule:</strong> {course.schedule.days?.join(', ')} at {course.schedule.time}
                    </div>
                  )}
                </div>
              </div>

              {/* Enrollment Status */}
              <div style={{
                padding: '12px',
                background: course.enrolled >= course.capacity ? '#ffebee' : '#e8f5e9',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>
                    Enrollment: {course.enrolled}/{course.capacity}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: course.enrolled >= course.capacity ? '#d32f2f' : '#2e7d32'
                  }}>
                    {course.enrolled >= course.capacity ? 'FULL' : `${course.capacity - course.enrolled} seats left`}
                  </span>
                </div>
                <div style={{
                  marginTop: '8px',
                  height: '6px',
                  background: '#e0e0e0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(course.enrolled / course.capacity) * 100}%`,
                    height: '100%',
                    background: course.enrolled >= course.capacity ? '#d32f2f' : '#4caf50',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Action Button (Students Only) */}
              {user?.role === 'student' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                                handleEnroll(course._id);
                  }}
                              disabled={course.enrolled >= course.capacity || enrolling[course._id]}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                                backgroundColor: course.enrolled >= course.capacity ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                                cursor: course.enrolled >= course.capacity ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                              {enrolling[course._id] ? 'Enrolling...' : course.enrolled >= course.capacity ? 'Course Full' : 'Enroll Now'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
