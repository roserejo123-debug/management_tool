import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { forgotPassword, clearMessages } from '../../redux/slices/authSlice';
import { FiMail, FiAlertCircle, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => () => dispatch(clearMessages()), [dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(forgotPassword(data.email));
    if (forgotPassword.fulfilled.match(result)) {
      setSent(true);
      toast.success('Reset link sent to your email!');
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📋</div>
          <span className="auth-logo-text">TaskFlow</span>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📧</div>
            <h2 style={{ marginBottom: '12px' }}>Check Your Email</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              We've sent a password reset link. It expires in 15 minutes.
            </p>
            <Link to="/login" className="btn btn-primary">Back to Login</Link>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtitle">No worries! Enter your email and we'll send a reset link.</p>

            {error && (
              <div className="alert alert-error">
                <FiAlertCircle /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    className="form-input"
                    type="email"
                    placeholder="john@example.com"
                    {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                  />
                </div>
                {errors.email && <span className="form-error">{errors.email.message}</span>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px' }}>
                {loading ? <><div className="spinner" /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>

            <p className="auth-footer">
              <Link to="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <FiArrowLeft /> Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
