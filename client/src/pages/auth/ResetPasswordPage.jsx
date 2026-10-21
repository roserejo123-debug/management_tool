import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { resetPassword, clearMessages } from '../../redux/slices/authSlice';
import { FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  useEffect(() => () => dispatch(clearMessages()), [dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(resetPassword({ token, password: data.password }));
    if (resetPassword.fulfilled.match(result)) {
      toast.success('Password reset successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🏠</div>
          <span className="auth-logo-text">PropEstate</span>
        </div>

        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Enter your new password below.</p>

        {error && (
          <div className="alert alert-error">
            <FiAlertCircle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Min 6 characters"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
              />
              <span className="input-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                className="form-input"
                type="password"
                placeholder="Repeat new password"
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (v) => v === watch('password') || 'Passwords do not match',
                })}
              />
            </div>
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px' }}>
            {loading ? <><div className="spinner" /> Resetting...</> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
