import React, { useEffect } from 'react';
import '../styles/outer/lander.css';
import { useNavigate } from 'react-router-dom';
import HeroImg from '../assets/Front-assets/landing-img1.svg';
import logo from '../assets/Front-assets/logo.png';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        if (window.scrollY > 10) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const programs = [
    { title: "Full Stack Mastery", tech: "Java, Python, MERN", duration: "5 Months", icon: "🚀" },
    { title: "Cloud & DevOps", tech: "AWS, Azure, Kubernetes", duration: "6 Months", icon: "☁️" },
    { title: "Data Intelligence", tech: "Data Science, Tableau", duration: "6 Months", icon: "📊" },
    { title: "SAP Solutions", tech: "FICO, MM, ABAP", duration: "20+ Case Studies", icon: "💼" }
  ];

  const methodology = [
    { id: "M1", title: "Tech Guru", desc: "Deep theoretical concepts for technical rounds." },
    { id: "M2", title: "Hands-on Expert", desc: "Daily practical sessions with industry tools." },
    { id: "M3", title: "Soft Skills Coach", desc: "Communication & personality grooming." },
    { id: "M4", title: "Project Guide", desc: "Experience with Live Industrial Projects." },
    { id: "M5", title: "Placement Buddy", desc: "Unlimited interviews and resume building." }
  ];

  const companies = ["TCS", "Capgemini", "Infosys", "Accenture", "Wipro", "Cognizant", "HCL", "IBM", "Tech Mahindra", "Deloitte"];

  return (
    <div className="landing-container landing-wrapper">
      {/* Background Elements */}
      <div className="bg-shape"></div>
      <div className="bg-glass-float"></div>
      <div className="bg-shape-top"></div>

      {/* Navbar */}
      <header className="navbar">
        <div className="nav-left">
          <img src={logo} alt="Fortune Cloud Technologies" className="nav-logo" />
        </div>
        <div className="nav-center">
          <h2 className="logo-text">Fortune Cloud Technologies</h2>
        </div>
        <div className="nav-right">
           <button className="btn-login" onClick={() => navigate('/login')}>
            Log In
          </button>
          <button className="btn-register" onClick={() => navigate('/register')}>
            REGISTER NOW
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">100% Job-Ready Training</div>
          <h1 className="hero-main-title">
            Build <span className="highlight-mark">Real Skills.</span> <br /> 
            Get Placed Fast.
          </h1>
          <p className="hero-subtext">
            Join India's Most Trusted IT Training Institute. Master Cloud, Data Science, and SAP with Pune's Best Industry Experts.
          </p>
          <div className="hero-cta">
            <button className="btn-primary">Free Demo Class</button>
            <button className="link-more">Placement Report →</button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <strong>5000+</strong> <span>Trained</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <strong>2000+</strong> <span>Hiring Partners</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="image-wrapper">
            <img src={HeroImg} alt="Hero" className="hero-image" />
            <div className="image-blur-fade"></div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="methodology-section">
        <div className="section-header">
          <h2 className="underlined">Our 5M Training Formula</h2>
          <p>We don't just teach; we transform your career path.</p>
        </div>
        <div className="m-grid">
          {methodology.map((m, i) => (
            <div key={i} className="m-card">
              <span className="m-id">{m.id}</span>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs Section */}
      <section className="programs-section">
        <div className="section-header">
          <h2 className="underlined">Career-Ready Programs</h2>
        </div>
        <div className="programs-grid">
          {programs.map((p, i) => (
            <div key={i} className="p-card">
              <div className="p-icon">{p.icon}</div>
              <h3>{p.title}</h3>
              <p className="p-tech">{p.tech}</p>
              <div className="p-footer">
                <span>{p.duration}</span>
                <button className="btn-small">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners Marquee */}
      <section className="partners-banner">
        <p className="partners-title">Our Students Work At</p>
        <div className="marquee-container">
          <div className="logo-marquee">
            {[...companies, ...companies].map((company, i) => (
              <span key={i} className="company-tag" data-text={company}>{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-action">
        <div className="footer-content">
          <h2>Ready to Lead the IT Industry?</h2>
          <div className="footer-btns">
            <button className="btn-primary">Get Career Counseling</button>
          </div>
          <p className="footer-locations">Pune: Shivaji Nagar | Bengaluru: BTM Layout</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
