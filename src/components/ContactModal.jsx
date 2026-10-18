import React, { useState } from 'react';
import { X, Send, Phone, User, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { sendContactMessage } from '../services/api';
import './ContactModal.css';

export default function ContactModal({ onClose }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('+998 ');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [serverReply, setServerReply] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 3) {
      setErrorMessage("Ism kamida 3 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (!contact.trim() || contact.trim().length < 9) {
      setErrorMessage("To'g'ri aloqa ma'lumotini kiriting.");
      return;
    }
    if (!message.trim()) {
      setErrorMessage("Xabar matnini kiriting.");
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await sendContactMessage({ 
        name: name.trim(), 
        contact: contact.trim(), 
        message: message.trim() 
      });
      setServerReply(res?.message || "Xabaringiz muvaffaqiyatli qabul qilindi. Tez orada siz bilan bog'lanamiz!");
      setIsSent(true);
    } catch (err) {
      console.error("Contact error:", err);
      // Do NOT simulate success on error: preserve entered data and show error
      setErrorMessage(err.message || "Xabar yuborishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog contact-dialog" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Yopish">
          <X size={20} />
        </button>

        {!isSent ? (
          <div>
            <div className="contact-modal-header">
              <h3 className="contact-heading">Biz bilan bog'lanish</h3>
              <p className="contact-subheading">
                Savollaringiz, takliflaringiz yoki maxsus guruhli sayohat bo'yicha murojaat qoldiring.
              </p>
            </div>

            {errorMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', color: '#b91c1c', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label className="form-label" htmlFor="c-name"><User size={14} /> Ismingiz:</label>
                <input
                  id="c-name"
                  type="text"
                  required
                  placeholder="Ismingizni kiriting"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="c-phone"><Phone size={14} /> Aloqa (Telefon yoki Telegram):</label>
                <input
                  id="c-phone"
                  type="text"
                  required
                  placeholder="+998 90 123 45 67"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="c-msg"><MessageSquare size={14} /> Xabaringiz:</label>
                <textarea
                  id="c-msg"
                  required
                  rows={4}
                  placeholder="Salom, safar haqida savolim bor edi..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-input"
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-contact-submit" disabled={isLoading}>
                <Send size={16} /> {isLoading ? "Yuborilmoqda..." : "Xabarni yuborish"}
              </button>
            </form>
          </div>
        ) : (
          <div className="contact-success-view">
            <div className="contact-success-icon-wrap">
              <CheckCircle2 size={56} className="contact-success-svg" />
            </div>
            <h3 className="contact-success-title">Rahmat, {name}!</h3>
            <p className="contact-success-msg">{serverReply}</p>
            <button type="button" className="btn btn-primary" onClick={onClose} style={{ marginTop: '20px', width: '100%' }}>
              Tushunarli
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
