import React, { useState } from 'react';
import { sendContactMessage } from '../services/api';
import './ContactPage.css';

export default function ContactPage() {
  // Form state
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // FAQ Accordion state (expanded index or null)
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Iltimos, ismingizni kiriting");
      return;
    }
    if (!contact.trim()) {
      setErrorMessage("Iltimos, telefon yoki elektron pochtangizni kiriting");
      return;
    }
    if (!message.trim()) {
      setErrorMessage("Iltimos, xabar matnini kiriting");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      await sendContactMessage({
        name: name.trim(),
        contact: contact.trim(),
        message: message.trim(),
      });

      setStatusMessage("Xabaringiz muvaffaqiyatli yuborildi! Tez orada mutaxassislarimiz siz bilan bog'lanishadi.");
      setName('');
      setContact('');
      setMessage('');
      setTimeout(() => setStatusMessage(''), 6000);
    } catch (err) {
      console.warn("Bog'lanish xabari xatosi:", err.message);
      setErrorMessage(err.message || "Xabar yuborishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // FAQ Items matching exact Figma screenshots
  const faqs = [
    {
      q: "Bronni qanday bekor qilaman?",
      a: "Broningizni shaxsiy kabinetingizdagi 'Mening turlarim' bo'limidan yoki qo'llab-quvvatlash xizmati orqali bekor qilishingiz mumkin. Tur boshlanishiga 48 soat qolguncha to'liq qaytariladi."
    },
    {
      q: "To'lov qachon olinadi?",
      a: "Tur buyurtma qilingandan so'ng 15 daqiqa ichida oldindan to'lov qilinadi yoki tasdiqlashdan so'ng Payme, Click yoki bank kartalari orqali to'lanadi."
    },
    {
      q: "Gid va turoperator turlarining farqi nimada?",
      a: "Gidlar odatda individual va kichik guruhlar uchun mualliflik ekskursiyalarini o'tkazadi. Turoperatorlar esa to'liq paketli turlar (transport, mehmonxona, ovqatlanish) tashkil qiladi."
    },
    {
      q: "Tashkilotchi sifatida qanday qo'shilaman?",
      a: "Tashkilotchi yoki gid sifatida ro'yxatdan o'tish uchun platformada ariza qoldiring yoki biz bilan to'g'ridan-to'g'ri bog'laning. Mutaxassislarimiz barcha ma'lumotlarni tekshirib, hisobingizni faollashtirib berishadi."
    }
  ];

  return (
    <div className="contact-page-wrapper">
      <div className="contact-page-container">
        
        {/* Page Header (Screenshots 1 & 3) */}
        <div className="contact-header-block">
          <h1 className="contact-main-title">Bog'lanish</h1>
          <p className="contact-main-subtitle">
            Tur, bron yoki hamkorlik bo'yicha savollaringiz bo'lsa, yozing — jamoamiz siz bilan bog'lanadi.
          </p>
        </div>

        {/* 4 Contact Info Cards (Screenshots 1 & 3) */}
        <div className="contact-info-grid">
          
          {/* Card 1: Telefon */}
          <div className="contact-info-card">
            <div className="card-status-dot dot-cyan"></div>
            <span className="contact-card-label">Telefon</span>
            <a href="tel:+998712000000" className="contact-card-value">
              +998 71 200 00 00
            </a>
          </div>

          {/* Card 2: Elektron pochta */}
          <div className="contact-info-card">
            <div className="card-status-dot dot-blue"></div>
            <span className="contact-card-label">Elektron pochta</span>
            <a href="mailto:info@visitca.uz" className="contact-card-value">
              info@visitca.uz
            </a>
          </div>

          {/* Card 3: Manzil */}
          <div className="contact-info-card">
            <div className="card-status-dot dot-cyan"></div>
            <span className="contact-card-label">Manzil</span>
            <span className="contact-card-value">
              Toshkent shahri
            </span>
          </div>

          {/* Card 4: Ish vaqti */}
          <div className="contact-info-card">
            <div className="card-status-dot dot-green"></div>
            <span className="contact-card-label">Ish vaqti</span>
            <span className="contact-card-value">
              Dush–Shan, 09:00–18:00
            </span>
          </div>

        </div>

        {/* Lower 2-Column Grid (Screenshots 1, 4, 5) */}
        <div className="contact-lower-grid">
          
          {/* Left Column: Form Card */}
          <div className="contact-form-card">
            <h2 className="contact-form-title">Xabar yuborish</h2>

            {statusMessage && (
              <div className="contact-success-banner">
                <span>{statusMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="contact-error-banner">
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-field-group">
                <label className="contact-field-label" htmlFor="contact-name">
                  Ismingiz
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  className="contact-input"
                  placeholder=""
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="contact-field-group">
                <label className="contact-field-label" htmlFor="contact-info">
                  Telefon yoki elektron pochta
                </label>
                <input
                  id="contact-info"
                  type="text"
                  required
                  className="contact-input"
                  placeholder=""
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>

              <div className="contact-field-group">
                <label className="contact-field-label" htmlFor="contact-msg">
                  Xabar
                </label>
                <textarea
                  id="contact-msg"
                  required
                  rows={4}
                  className="contact-textarea"
                  placeholder=""
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-contact-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Yuborilmoqda..." : "Xabar yuborish"}
              </button>
            </form>
          </div>

          {/* Right Column: FAQ Accordion */}
          <div className="contact-faq-column">
            <h2 className="contact-faq-title">Ko'p so'raladigan savollar</h2>

            <div className="contact-faq-list">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;

                return (
                  <div key={idx} className="faq-accordion-item">
                    <button
                      type="button"
                      className="faq-accordion-trigger"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-question-text">{faq.q}</span>
                      <span className="faq-icon-symbol">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="faq-accordion-body">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
