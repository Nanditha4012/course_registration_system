import { useState } from 'react';
import { authAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function OTPVerification({ email, userId }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
      const { data } = await authAPI.verifyOTP({ email, otp });
      setSuccess('Email verified successfully!');
      
      // Save token and user
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      setTimeout(() => {
        navigate('/login');
      }, 10);
  } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
  } finally {
    setLoading(false);
  }
};


  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccess('');

    try {
      await authAPI.resendOTP({ email });
      setSuccess('New OTP sent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '450px', 
      margin: '60px auto', 
      padding: '40px', 
      background: 'white', 
      borderRadius: '12px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
      <h2 style={{ marginBottom: '10px' }}>Verify Your Email</h2>
      <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px' }}>
        We've sent a 6-digit code to<br />
        <strong>{email}</strong>
      </p>

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

      {success && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          background: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleVerify}>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit OTP"
          maxLength="6"
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '24px',
            textAlign: 'center',
            letterSpacing: '10px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: 'bold'
          }}
          required
        />

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            fontWeight: '600',
            backgroundColor: loading || otp.length !== 6 ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
            marginBottom: '15px'
          }}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div style={{ fontSize: '14px', color: '#666' }}>
        Didn't receive the code?{' '}
        <button
          onClick={handleResend}
          disabled={resending}
          style={{
            background: 'none',
            border: 'none',
            color: '#4CAF50',
            fontWeight: '600',
            cursor: resending ? 'not-allowed' : 'pointer',
            textDecoration: 'underline'
          }}
        >
          {resending ? 'Sending...' : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}
