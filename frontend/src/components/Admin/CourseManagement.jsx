import { useState, useEffect } from 'react';
import { courseAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CourseManagement() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  
  const [formData, setFormData] = useState({
    courseCode: '',
    title: '',
    description: '',
    credits: 3,
    department: '',
    instructor: '',
    schedule: {
      days: [],
      time: '',
      room: ''
    },
    capacity: 30,
    prerequisites: [],
    semester: 'even',
    year: new Date().getFullYear(),
    isActive: true
  });

  const [prerequisiteInput, setPrerequisiteInput] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      const { data } = await courseAPI.getAll({});
      setCourses(data);
    } catch (error) {
      showMessage('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const resetForm = () => {
    setFormData({
      courseCode: '',
      title: '',
      description: '',
      credits: 3,
      department: '',
      instructor: '',
      schedule: {
        days: [],
        time: '',
        room: ''
      },
      capacity: 30,
      prerequisites: [],
      semester: 'even',
      year: new Date().getFullYear(),
      isActive: true
    });
    setPrerequisiteInput('');
    setEditingCourse(null);
    setShowModal(false);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode,
      title: course.title,
      description: course.description,
      credits: course.credits,
      department: course.department,
      instructor: course.instructor,
      schedule: course.schedule || { days: [], time: '', room: '' },
      capacity: course.capacity,
      prerequisites: course.prerequisites || [],
      semester: course.semester,
      year: course.year,
      isActive: course.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Ensure all required fields are present
    const payload = {
      courseCode: formData.courseCode,
      title: formData.title,
      description: formData.description,
      credits: Number(formData.credits),
      department: formData.department,
      instructor: formData.instructor,
      schedule: {
        days: formData.schedule.days || [],
        time: formData.schedule.time,
        room: formData.schedule.room
      },
      capacity: Number(formData.capacity),
      prerequisites: formData.prerequisites || [],
      semester: formData.semester,
      year: Number(formData.year),
      isActive: formData.isActive
    };

    console.log('Submitting payload:', payload); // ADD THIS for debugging

    if (editingCourse) {
      await courseAPI.update(editingCourse._id, payload);
      showMessage('Course updated successfully!', 'success');
    } else {
      await courseAPI.create(payload);
      showMessage('Course created successfully!', 'success');
    }
    
    loadCourses();
    resetForm();
  } catch (error) {
    console.error('Submit error:', error);
    showMessage(error.response?.data?.message || 'Operation failed', 'error');
  }
};
  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to deactivate this course?')) return;
    
    try {
      await courseAPI.delete(courseId);
      showMessage('Course deactivated successfully', 'success');
      loadCourses();
    } catch (error) {
      showMessage('Failed to deactivate course', 'error');
    }
  };

  const handleDayToggle = (day) => {
    const days = formData.schedule.days.includes(day)
      ? formData.schedule.days.filter(d => d !== day)
      : [...formData.schedule.days, day];
    
    setFormData({
      ...formData,
      schedule: { ...formData.schedule, days }
    });
  };

  const addPrerequisite = () => {
    if (prerequisiteInput.trim() && !formData.prerequisites.includes(prerequisiteInput.trim())) {
      setFormData({
        ...formData,
        prerequisites: [...formData.prerequisites, prerequisiteInput.trim().toUpperCase()]
      });
      setPrerequisiteInput('');
    }
  };

  const removePrerequisite = (prereq) => {
    setFormData({
      ...formData,
      prerequisites: formData.prerequisites.filter(p => p !== prereq)
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const departments = ['Computer Science', 'Mathematics', 'Engineering', 'Business', 'Physics', 'Chemistry'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '5px' }}>Course Management</h1>
          <p style={{ color: '#666' }}>Total Courses: {courses.length}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          + Add New Course
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '6px',
          background: messageType === 'success' ? '#d4edda' : '#f8d7da',
          color: messageType === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* Courses Table */}
      <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Code</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Title</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Department</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Instructor</th>
              <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Enrollment</th>
              <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>
                  <strong style={{ color: '#1976d2' }}>{course.courseCode}</strong>
                </td>
                <td style={{ padding: '15px' }}>{course.title}</td>
                <td style={{ padding: '15px', color: '#666' }}>{course.department}</td>
                <td style={{ padding: '15px', color: '#666' }}>{course.instructor}</td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <span style={{ 
                    color: course.enrolled >= course.capacity ? '#d32f2f' : '#388e3c',
                    fontWeight: '600'
                  }}>
                    {course.enrolled}/{course.capacity}
                  </span>
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    background: course.isActive ? '#e8f5e9' : '#ffebee',
                    color: course.isActive ? '#2e7d32' : '#c62828'
                  }}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleEdit(course)}
                    style={{
                      padding: '6px 12px',
                      marginRight: '8px',
                      fontSize: '14px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '14px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {courses.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            No courses found. Click "Add New Course" to create one.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '20px' }}>
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {/* Course Code */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                    required
                    placeholder="CS101"
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                {/* Credits */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Credits *
                  </label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    required
                    min="1"
                    max="4"
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* Title */}
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Introduction to Computer Science"
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              {/* Description */}
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="3"
                  placeholder="Course description..."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                {/* Department */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Instructor */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Instructor *
                  </label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    required
                    placeholder="Dr. John Smith"
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* Schedule - Days */}
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Days *
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {daysOfWeek.map(day => (
                    <label key={day} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.schedule.days.includes(day)}
                        onChange={() => handleDayToggle(day)}
                        style={{ marginRight: '5px' }}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                {/* Time */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Time *
                  </label>
                  <input
                    type="text"
                    value={formData.schedule.time}
                    onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, time: e.target.value } })}
                    required
                    placeholder="10:00 AM - 11:30 AM"
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                {/* Room */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Room *
                  </label>
                  <input
                    type="text"
                    value={formData.schedule.room}
                    onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, room: e.target.value } })}
                    required
                    placeholder="Room 301"
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
                {/* Capacity */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Capacity *
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                    min="1"
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                {/* Semester */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Semester *
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="Even">Even</option>
                    <option value="Odd">Odd</option>
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Year *
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                    min="2024"
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* Prerequisites */}
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Prerequisites
                </label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={prerequisiteInput}
                    onChange={(e) => setPrerequisiteInput(e.target.value)}
                    placeholder="e.g., CS100"
                    style={{ flex: 1, padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addPrerequisite();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addPrerequisite}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.prerequisites.map(prereq => (
                    <span
                      key={prereq}
                      style={{
                        padding: '4px 10px',
                        background: '#e3f2fd',
                        borderRadius: '12px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {prereq}
                      <button
                        type="button"
                        onClick={() => removePrerequisite(prereq)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d32f2f',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: 0
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
