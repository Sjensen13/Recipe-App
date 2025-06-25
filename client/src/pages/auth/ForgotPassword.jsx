import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import apiClient from '../../services/api/client';
import '../../assets/styles/auth.css';

const ForgotPassword = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleChange = (e) => {
    setUsernameOrEmail(e.target.value);
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if input is an email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let email = usernameOrEmail;

      if (!emailRegex.test(usernameOrEmail)) {
        // If not an email, try to look up the email by username
        try {
          const response = await apiClient.post('/auth/get-email-by-username', {
            username: usernameOrEmail
          });
          
          if (response.data.success) {
            email = response.data.email;
          } else {
            throw new Error('Username not found');
          }
        } catch (lookupError) {
          setError('Username or email not found. Please check your input.');
          setIsLoading(false);
          return;
        }
      }

      await resetPassword(email);
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (error) {
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>Enter your username or email address and we'll send you a link to reset your password.</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" style={{ 
              color: '#ef4444', 
              backgroundColor: '#fef2f2', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" style={{ 
              color: '#059669', 
              backgroundColor: '#f0fdf4', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              border: '1px solid #bbf7d0'
            }}>
              {success}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="usernameOrEmail" className="form-label">
              Username or Email
            </label>
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              type="text"
              required
              className="form-input"
              placeholder="Enter your username or email"
              value={usernameOrEmail}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 