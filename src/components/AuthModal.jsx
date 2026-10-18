import React, { useState } from 'react';
import { X, Lock, Phone, User, Mail, CheckCircle2, KeyRound, AlertCircle } from 'lucide-react';
import { loginUser, registerUser, sendOtp, verifyOtp, resetPassword } from '../services/api';
import './AuthModal.css';

export default function AuthModal({ initialMode = 'login', onClose, onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login', 'register', 'otp', 'forgot'
  const [phoneNumber, setPhoneNumber] = useState('+998');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState('traveler');
  
  // OTP & Reset Password States
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Switch modes and clear messages
  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
    setStatusMessage('');
  };

  // Handle Login & Register Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'register') {
        const res = await registerUser({
          name: fullName.trim(),
          phone: phoneNumber.trim(),
          email: email.trim() || undefined,
          password
        });

        if (res.token) {
          localStorage.setItem('token', res.token);
          setIsSuccess(true);
          setStatusMessage("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
          if (onLoginSuccess) {
            onLoginSuccess(res.user || { name: fullName, phone: phoneNumber });
          }
        } else if (res.requiresOtp || res.step === 'otp') {
          setMode('otp');
          setStatusMessage(`${phoneNumber} raqamiga tasdiqlash kodi yuborildi.`);
        } else {
          setIsSuccess(true);
          setStatusMessage(res.message || "Ro'yxatdan muvaffaqiyatli o'tdingiz!");
          if (onLoginSuccess) {
            onLoginSuccess(res.user || { name: fullName, phone: phoneNumber });
          }
        }
      } else {
        // Mode === 'login'
        const res = await loginUser({
          phone: phoneNumber.trim(),
          password
        });

        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        setIsSuccess(true);
        setStatusMessage(res.message || "Tizimga muvaffaqiyatli kirdingiz!");
        if (onLoginSuccess) {
          onLoginSuccess(res.user || { name: fullName || phoneNumber, phone: phoneNumber });
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMessage(err.message || "Autentifikatsiyada xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Verification: POST /api/auth/otp/verify
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await verifyOtp(phoneNumber.trim(), otpCode.trim());
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      setIsSuccess(true);
      setStatusMessage(res.message || "SMS kod muvaffaqiyatli tasdiqlandi!");
      if (onLoginSuccess) {
        onLoginSuccess(res.user || { name: fullName || phoneNumber, phone: phoneNumber });
      }
    } catch (err) {
      console.error("OTP error:", err);
      setErrorMessage(err.message || "Tasdiqlash kodi noto'g'ri yoki muddati o'tgan.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Send OTP for password reset
  const handleSendResetOtp = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 9) {
      setErrorMessage("Iltimos, avval to'g'ri telefon raqamini kiriting.");
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await sendOtp(phoneNumber.trim());
      setStatusMessage(res.message || `${phoneNumber} raqamiga kod yuborildi.`);
    } catch (err) {
      setErrorMessage(err.message || "SMS kod yuborishda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset: POST /api/auth/password/reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await resetPassword(phoneNumber.trim(), otpCode.trim(), newPassword);
      setIsSuccess(true);
      setStatusMessage(res.message || "Yangi parol muvaffaqiyatli o'rnatildi! Endi yangi parol bilan kirishingiz mumkin.");
    } catch (err) {
      console.error("Reset error:", err);
      setErrorMessage(err.message || "Parolni tiklashda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog auth-dialog" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Yopish">
          <X size={20} />
        </button>

        {!isSuccess ? (
          <div>
            {/* Modal Tabs for login/register */}
            {(mode === 'login' || mode === 'register') && (
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => switchMode('login')}
                >
                  Kirish
                </button>
                <button
                  type="button"
                  className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => switchMode('register')}
                >
                  Ro'yxatdan o'tish
                </button>
              </div>
            )}

            <div className="auth-header-desc">
              <h3 className="auth-heading">
                {mode === 'login' && "Platformaga xush kelibsiz"}
                {mode === 'register' && "Yangi hisob yaratish"}
                {mode === 'otp' && "SMS kodni tasdiqlash"}
                {mode === 'forgot' && "Parolni tiklash"}
              </h3>
              <p className="auth-subheading">
                {mode === 'login' && "Sayohatlaringizni boshqarish va bron qilish uchun tizimga kiring."}
                {mode === 'register' && "O'zbekiston bo'ylab eng yaxshi turlarni bron qiling yoki tashkil eting."}
                {mode === 'otp' && "Telefoningizga yuborilgan tasdiqlash kodini kiriting."}
                {mode === 'forgot' && "Telefon raqamingiz va SMS kod orqali yangi parol o'rnating."}
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', color: '#b91c1c', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Status Message */}
            {statusMessage && !errorMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e0f2fe', color: '#0369a1', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                <CheckCircle2 size={18} />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* LOGIN & REGISTER FORM */}
            {(mode === 'login' || mode === 'register') && (
              <form onSubmit={handleAuthSubmit} className="auth-form">
                {mode === 'register' && (
                  <>
                    <div className="account-type-selector">
                      <button
                        type="button"
                        className={`type-btn ${accountType === 'traveler' ? 'active' : ''}`}
                        onClick={() => setAccountType('traveler')}
                      >
                        Sayohatchi
                      </button>
                      <button
                        type="button"
                        className={`type-btn ${accountType === 'organizer' ? 'active' : ''}`}
                        onClick={() => setAccountType('organizer')}
                      >
                        Gid / Turoperator
                      </button>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-name"><User size={14} /> To'liq ism:</label>
                      <input
                        id="reg-name"
                        type="text"
                        required
                        placeholder="Ism va familiya"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-email"><Mail size={14} /> Elektron pochta (ixtiyoriy):</label>
                      <input
                        id="reg-email"
                        type="email"
                        placeholder="example@mail.uz"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="auth-phone"><Phone size={14} /> Telefon raqami:</label>
                  <input
                    id="auth-phone"
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="auth-pass"><Lock size={14} /> Parol:</label>
                  <input
                    id="auth-pass"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                {mode === 'login' && (
                  <div className="forgot-pass-wrap">
                    <button 
                      type="button" 
                      className="forgot-pass-link" 
                      onClick={() => switchMode('forgot')}
                    >
                      Parolni unutdingizmi?
                    </button>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-auth-submit" disabled={isLoading}>
                  {isLoading ? "Iltimos kuting..." : mode === 'login' ? "Tizimga kirish" : "Ro'yxatdan o'tish"}
                </button>

                <div className="auth-switch-note">
                  {mode === 'login' ? (
                    <span>
                      Hisobingiz yo'qmi?{" "}
                      <button type="button" className="switch-inline-btn" onClick={() => switchMode('register')}>
                        Ro'yxatdan o'ting
                      </button>
                    </span>
                  ) : (
                    <span>
                      Allaqachon hisobingiz bormi?{" "}
                      <button type="button" className="switch-inline-btn" onClick={() => switchMode('login')}>
                        Kirish
                      </button>
                    </span>
                  )}
                </div>
              </form>
            )}

            {/* OTP VERIFICATION FORM: POST /api/auth/otp/verify */}
            {mode === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="auth-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="otp-input"><KeyRound size={14} /> SMS tasdiqlash kodi:</label>
                  <input
                    id="otp-input"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="54321"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="form-input otp-large-input"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-auth-submit" disabled={isLoading}>
                  {isLoading ? "Tekshirilmoqda..." : "Kodni tasdiqlash"}
                </button>

                <div className="auth-switch-note">
                  <button type="button" className="switch-inline-btn" onClick={() => switchMode('login')}>
                    ← Kirish sahifasiga qaytish
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD FORM: POST /api/auth/password/reset */}
            {mode === 'forgot' && (
              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="reset-phone"><Phone size={14} /> Telefon raqami:</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      id="reset-phone"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="form-input"
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={handleSendResetOtp}
                      disabled={isLoading}
                      style={{ whiteSpace: 'nowrap', fontSize: '13px' }}
                    >
                      Kod yuborish
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reset-code"><KeyRound size={14} /> SMS tasdiqlash kodi:</label>
                  <input
                    id="reset-code"
                    type="text"
                    required
                    placeholder="54321"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reset-new-pass"><Lock size={14} /> Yangi parol:</label>
                  <input
                    id="reset-new-pass"
                    type="password"
                    required
                    placeholder="Yangi kuchli parol"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-auth-submit" disabled={isLoading}>
                  {isLoading ? "Tiklanmoqda..." : "Parolni yangilash"}
                </button>

                <div className="auth-switch-note">
                  <button type="button" className="switch-inline-btn" onClick={() => switchMode('login')}>
                    ← Bekor qilish va kirish
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="auth-success-view">
            <div className="success-icon-wrap">
              <CheckCircle2 size={52} className="success-check-svg" />
            </div>
            <h3 className="success-title">Muvaffaqiyatli!</h3>
            <p className="success-desc">
              {statusMessage || "Amal muvaffaqiyatli bajarildi."}
            </p>
            <button type="button" className="btn btn-primary" onClick={onClose} style={{ marginTop: '20px', width: '100%' }}>
              Davom etish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
