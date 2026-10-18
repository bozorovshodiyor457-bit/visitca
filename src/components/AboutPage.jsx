import React from 'react';
import './AboutPage.css';

export default function AboutPage({ onContact, onExploreTours }) {
  const values = [
    {
      id: 'aim',
      title: 'Maqsadimiz',
      description: "Sayohatchilarga ishonchli tanlov, tashkilotchilarga esa o'z turlarini sifatli taqdim etish imkoniyatini berish."
    },
    {
      id: 'trust',
      title: 'Ishonch',
      description: "Har bir tur va tashkilotchi e'lon qilinishidan oldin platforma jamoasi tomonidan tekshiriladi."
    },
    {
      id: 'experience',
      title: 'Yagona tajriba',
      description: "Gid bilan piyoda sayr yoki bir haftalik tur — qidiruv, bron va to'lov har doim bir xil."
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Turni tanlang',
      description: "Yo'nalish, sana va byudjet bo'yicha saralang."
    },
    {
      number: 2,
      title: 'Sanani belgilang',
      description: "Mavjud jo'nash sanasi va sayohatchilar sonini tanlang."
    },
    {
      number: 3,
      title: 'Bron qiling',
      description: "Ma'lumotlarni tekshiring va to'lovga o'ting."
    },
    {
      number: 4,
      title: 'Sayohatga chiqing',
      description: "Belgilangan vaqtda marshrut bo'yicha yo'lga chiqing va unutilmas taassurot oling."
    }
  ];

  return (
    <div className="about-page-wrapper">
      <div className="container about-container">
        
        {/* 1. Hero / Intro Section (Screenshots 2 & 3) */}
        <section className="about-hero-section">
          <div className="about-hero-content">
            <span className="about-tag">Biz haqimizda</span>
            <h1 className="about-hero-title">
              Sayohatni <br />
              rejalashtirish oson <br />
              bo'lishi kerak.
            </h1>
            <p className="about-hero-desc">
              Visitca Trip — O'zbekiston bo'ylab gidlar va turoperatorlar turlarini bir joyga jamlovchi platforma. 
              Har bir tur moderatsiyadan o'tadi, bron qilish va to'lov esa tashkilotchi turidan qat'i nazar bir xil tartibda amalga oshiriladi.
            </p>
          </div>

          {/* Hero Media Placeholder / Image */}
          <div className="about-media-box">
            <img 
              src="https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&auto=format&fit=crop&q=80" 
              alt="O'zbekiston bo'ylab sayohat" 
              className="about-media-img"
              loading="lazy"
              onError={(e) => {
                // If offline or fails to load, gracefully hide image and show clean placeholder
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* 3 Values with Cyan Dividers (Screenshot 3) */}
          <div className="about-values-list">
            {values.map((val) => (
              <div key={val.id} className="about-value-item">
                <div className="about-value-cyan-line" aria-hidden="true"></div>
                <h3 className="about-value-title">{val.title}</h3>
                <p className="about-value-desc">{val.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Process Section: Qanday ishlaydi (Screenshots 3 & 4) */}
        <section className="about-process-section">
          <h2 className="about-section-heading">Qanday ishlaydi</h2>
          
          <div className="about-steps-grid">
            {steps.map((st) => (
              <div key={st.number} className="about-step-card">
                <div className="about-step-number-circle">{st.number}</div>
                <h4 className="about-step-title">{st.title}</h4>
                <p className="about-step-desc">{st.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. For Organizers CTA Section (Screenshot 5) */}
        <section className="about-cta-section">
          {/* CTA Media Box */}
          <div className="about-cta-media-box">
            <img 
              src="https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1200&auto=format&fit=crop&q=80" 
              alt="Tashkilotchilar uchun" 
              className="about-cta-img"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className="about-cta-content">
            <span className="about-tag">Tashkilotchilar uchun</span>
            <h2 className="about-cta-title">
              Turlaringizni Visitca <br />
              Trip'da e'lon qiling
            </h2>
            <p className="about-cta-desc">
              Gid yoki turoperator sifatida ro'yxatdan o'ting, turlaringizni qo'shing va bronlarni bitta tizim orqali boshqaring.
            </p>
            <button 
              type="button" 
              className="btn btn-primary btn-about-contact"
              onClick={onContact}
            >
              Biz bilan bog'laning
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
