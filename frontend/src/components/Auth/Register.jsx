import { useState } from 'react';
import { authAPI } from '../../services/api.js';
import { useNavigate } from 'react-router-dom';
import OTPVerification from './OTPVerification.jsx';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: '',
    major: '',
    semester: 1
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OTP verification state
  const [showOTP, setShowOTP] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [userId, setUserId] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Build payload based on role
      let payload;
      
      if (formData.role === 'admin') {
        // Admin: ONLY name, email, password, role
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'admin'
        };
      } else {
        // Student: ALL fields
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'student',
          studentId: formData.studentId,
          major: formData.major,
          semester: Number(formData.semester)
        };
      }

      console.log('Sending registration payload:', payload);

      // Register and get OTP sent
      const { data } = await authAPI.register(payload);
      
      console.log('Registration response:', data);

      // For students: Show OTP verification screen
      if (formData.role === 'student') {
        setRegisteredEmail(data.email);
        setUserId(data.userId);
        setShowOTP(true);
      } else {
        // For admins: Direct login (no OTP verification)
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // If OTP verification is needed, show OTP screen
  if (showOTP) {
    return <OTPVerification email={registeredEmail} userId={userId} />;
  }

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '40px auto', 
      padding: '30px', 
      background: 'white', 
      borderRadius: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
    }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Create Account</h2>
      
      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Role */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              border: '1px solid #ddd', 
              borderRadius: '6px' 
            }}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Name */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              border: '1px solid #ddd', 
              borderRadius: '6px' 
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              border: '1px solid #ddd', 
              borderRadius: '6px' 
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Password (min 6 characters)
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              border: '1px solid #ddd', 
              borderRadius: '6px' 
            }}
          />
        </div>

        {/* Student Fields - ONLY show for students */}
        {formData.role === 'student' && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Student ID
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  fontSize: '14px', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px' 
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Major
              </label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  fontSize: '14px', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px' 
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Semester
              </label>
              <input
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                min="1"
                max="8"
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  fontSize: '14px', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px' 
                }}
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        Already have an account? <a href="/login" style={{ color: '#4CAF50', fontWeight: '600' }}>Login</a>
      </p>
    </div>
  );
}
