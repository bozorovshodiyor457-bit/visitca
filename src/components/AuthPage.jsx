import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';
import './AuthPage.css';

export default function AuthPage({ 
  initialMode = 'login', 
  onLoginSuccess,
  onNavigateHome 
}) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  
  // Form fields
  const [phoneNumber, setPhoneNumber] = useState('+998');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Status & error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'register') {
        if (!fullName.trim() || fullName.trim().length < 3) {
          throw new Error("Ism va familiyangizni to'liq kiriting");
        }
        if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
          throw new Error("Telefon raqamingizni to'g'ri kiriting");
        }
        if (!password || password.length < 8) {
          throw new Error("Parol kamida 8 ta belgidan iborat bo'lishi kerak");
        }

        const res = await registerUser({
          name: fullName.trim(),
          phone: phoneNumber.trim(),
          email: email.trim() || undefined,
          password
        });

        if (res.token) {
          localStorage.setItem('token', res.token);
          if (onLoginSuccess) {
            onLoginSuccess(res.user || { name: fullName, phone: phoneNumber, email });
          }
        } else {
          // Auto login after registration
          try {
            const loginRes = await loginUser({ phone: phoneNumber.trim(), password });
            if (loginRes.token) {
              localStorage.setItem('token', loginRes.token);
              if (onLoginSuccess) {
                onLoginSuccess(loginRes.user || { name: fullName, phone: phoneNumber, email });
              }
            }
          } catch {
            switchMode('login');
          }
        }
      } else {
        // Login mode
        if (!phoneNumber.trim()) {
          throw new Error("Telefon raqamingizni kiriting");
        }
        if (!password) {
          throw new Error("Parolingizni kiriting");
        }

        const res = await loginUser({
          phone: phoneNumber.trim(),
          password
        });

        if (res.token) {
          localStorage.setItem('token', res.token);
          if (onLoginSuccess) {
            onLoginSuccess(res.user || res.data || { phone: phoneNumber });
          }
        } else {
          throw new Error(res.message || "Tizimga kirishda xatolik yuz berdi");
        }
      }
    } catch (err) {
      console.warn("Auth xatosi:", err.message);
      setErrorMessage(err.message || "Server bilan bog'lanishda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-page-container">
        {onNavigateHome && (
          <button 
            type="button" 
            className="auth-back-home-btn"
            onClick={onNavigateHome}
          >
            ← Bosh sahifaga qaytish
          </button>
        )}
        <div className="auth-page-grid">
          
          {/* Left Column: Big Dark Card (Screenshots 1 & 2) */}
          <div className="auth-left-card">
            <h2 className="auth-left-card-text">
              {mode === 'login' 
                ? "Xush kelibsiz. Keyingi sayohat sizni kutmoqda." 
                : "Bir hisob — barcha sayohatlaringiz uchun."}
            </h2>
          </div>

          {/* Right Column: Form Pane */}
          <div className="auth-right-pane">
            <h1 className="auth-pane-title">
              {mode === 'login' ? "Hisobingizga kiring" : "Hisob yaratish"}
            </h1>
            
            <p className="auth-pane-subtitle">
              {mode === 'login' 
                ? "Bronlar, sevimlilar va izohlaringizni ko'rish uchun tizimga kiring."
                : "Bronlar, sevimli turlar va izohlaringiz bir joyda saqlanadi."}
            </p>

            {/* Pill Switcher [ Kirish ] [ Ro'yxatdan o'tish ] (Matching Screenshot) */}
            <div className="auth-pill-switch">
              <button
                type="button"
                className={`auth-pill-btn ${mode === 'login' ? 'is-active' : ''}`}
                onClick={() => switchMode('login')}
              >
                Kirish
              </button>
              <button
                type="button"
                className={`auth-pill-btn ${mode === 'register' ? 'is-active' : ''}`}
                onClick={() => switchMode('register')}
              >
                Ro'yxatdan o'tish
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="auth-error-banner">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form-fields">
              
              {/* Register only: Ism va familiya */}
              {mode === 'register' && (
                <div className="auth-form-group">
                  <label className="auth-form-label" htmlFor="auth-name">
                    Ism va familiya
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    className="auth-form-input"
                    placeholder="Masalan, Aziza Rahimova"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              {/* Telefon raqami */}
              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="auth-phone">
                  Telefon raqami
                </label>
                <input
                  id="auth-phone"
                  type="tel"
                  required
                  className="auth-form-input"
                  placeholder="+998"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              {/* Register only: Email */}
              {mode === 'register' && (
                <div className="auth-form-group">
                  <label className="auth-form-label" htmlFor="auth-email">
                    Elektron pochta <span className="optional">(ixtiyoriy)</span>
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    className="auth-form-input"
                    placeholder="siz@pochta.uz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              {/* Parol */}
              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="auth-pass">
                  Parol
                </label>
                <div className="auth-password-wrap">
                  <input
                    id="auth-pass"
                    type={showPassword ? "text" : "password"}
                    required
                    className="auth-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Yashirish" : "Ko'rsatish"}
                  </button>
                </div>
                {mode === 'register' && (
                  <span className="auth-input-hint">Kamida 8 belgi.</span>
                )}
              </div>

              {/* Login only: Remember me & Forgot Password */}
              {mode === 'login' && (
                <div className="auth-remember-row">
                  <label className="auth-remember-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Meni eslab qol</span>
                  </label>

                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => alert("Parolni tiklash uchun SMS xabarnoma yuborish tez kunda ishga tushadi.")}
                  >
                    Parolni unutdingizmi?
                  </button>
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="btn-auth-submit"
                disabled={isLoading}
              >
                {isLoading 
                  ? (mode === 'login' ? "Kirilmoqda..." : "Yaratilmoqda...") 
                  : (mode === 'login' ? "Kirish" : "Ro'yxatdan o'tish")}
              </button>

              {/* Footnotes */}
              {mode === 'login' ? (
                <>
                  <div className="auth-divider-line"></div>
                  <p className="auth-footnote-text">
                    Hisobingiz yo'qmi?{' '}
                    <button
                      type="button"
                      className="auth-footnote-link"
                      onClick={() => switchMode('register')}
                    >
                      Ro'yxatdan o'tish
                    </button>
                  </p>
                </>
              ) : (
                <p className="auth-footnote-text" style={{ fontSize: '12px', color: '#64748b', marginTop: '16px', lineHeight: '1.45' }}>
                  Ro'yxatdan o'tish orqali foydalanish shartlari va maxfiylik siyosatiga rozilik bildirasiz.
                </p>
              )}

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
