import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../landing.css';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Dynamically inject the app.js script when component mounts
    const script = document.createElement('script');
    script.src = '/js/app.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Make navigate available to global scope if app.js relies on location changes (optional)
  window.reactNavigate = navigate;

  return (
    <div className="landing-page-container">
      

    
    <div className="global-background-effects">
        <div className="bg-gradient-orb orb-1"></div>
        <div className="bg-gradient-orb orb-2"></div>
        <div className="bg-grid-overlay"></div>
    </div>

    
    <header className="main-header">
        <div className="header-container">
            <a href="#home" className="logo" id="header-logo">
                <svg className="logo-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
                    <line x1="12" y1="22" x2="12" y2="12" />
                    <line x1="12" y1="12" x2="22" y2="8.5" />
                    <line x1="12" y1="12" x2="2" y2="8.5" />
                </svg>
                <span className="logo-text"><span className="logo-accent">FUSION</span><span className="logo-services">SERVICES</span></span>
            </a>
            
            <nav className="desktop-nav">
                <ul className="nav-menu">
                    
                    <div className="nav-underline" id="nav-underline"></div>
                    <li><a href="#home" className="nav-link active" data-page="home">Home</a></li>
                    <li><a href="#about" className="nav-link" data-page="about">About</a></li>
                    <li><a href="#services" className="nav-link" data-page="services">Products & Services</a></li>
                    <li><a href="#portfolio" className="nav-link" data-page="portfolio">Portfolio</a></li>
                    <li style={{ position: 'relative' }} 
                        onMouseEnter={(e) => e.currentTarget.querySelector('.login-dropdown-menu').style.display = 'flex'}
                        onMouseLeave={(e) => e.currentTarget.querySelector('.login-dropdown-menu').style.display = 'none'}
                    >
                        <div className="nav-link" style={{display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            Login
                        </div>
                        <div className="login-dropdown-menu" style={{
                            display: 'none',
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            flexDirection: 'column',
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            minWidth: '160px',
                            padding: '0.5rem 0',
                            zIndex: 100
                        }}>
                            <Link to="/login" style={{ padding: '0.75rem 1.5rem', color: '#0f2042', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#f05423'; e.currentTarget.style.background = 'rgba(240, 84, 35, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#0f2042'; e.currentTarget.style.background = 'transparent'; }}>As an Admin</Link>
                            <Link to="/login" style={{ padding: '0.75rem 1.5rem', color: '#0f2042', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#f05423'; e.currentTarget.style.background = 'rgba(240, 84, 35, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#0f2042'; e.currentTarget.style.background = 'transparent'; }}>As a Staff</Link>
                        </div>
                    </li>
                    <li><a href="#contact" className="nav-link nav-btn" data-page="contact">Contact Us</a></li>
                </ul>
            </nav>

            <button className="hamburger-menu" id="hamburger-btn" aria-label="Toggle Menu">
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>
        </div>
    </header>

    
    <div className="mobile-drawer" id="mobile-drawer">
        <nav className="mobile-nav">
            <ul>
                <li><a href="#home" className="mobile-link" data-page="home">Home</a></li>
                <li><a href="#about" className="mobile-link" data-page="about">About</a></li>
                <li><a href="#services" className="mobile-link" data-page="services">Products & Services</a></li>
                <li><a href="#portfolio" className="mobile-link" data-page="portfolio">Portfolio</a></li>
                <li style={{ position: 'relative' }}>
                    <div className="mobile-link" style={{display: 'flex', alignItems: 'center', color: '#0F2042', cursor: 'pointer'}} onClick={(e) => {
                        const menu = e.currentTarget.nextElementSibling;
                        menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Login
                    </div>
                    <div className="login-dropdown-menu" style={{
                        display: 'none',
                        flexDirection: 'column',
                        gap: '0.65rem',
                        paddingLeft: '1rem',
                        paddingTop: '0.75rem',
                        borderLeft: '2px solid rgba(255, 107, 53, 0.35)',
                        marginLeft: '1.5rem',
                        marginTop: '0.5rem'
                    }}>
                        <Link to="/login" style={{ padding: '0.7rem 0.9rem', color: '#0F2042', background: 'rgba(255, 107, 53, 0.1)', border: '1px solid rgba(255, 107, 53, 0.18)', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}>As an Admin</Link>
                        <Link to="/login" style={{ padding: '0.7rem 0.9rem', color: '#0F2042', background: 'rgba(255, 107, 53, 0.1)', border: '1px solid rgba(255, 107, 53, 0.18)', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}>As a Staff</Link>
                    </div>
                </li>
                    <li><a href="#contact" className="mobile-link mobile-btn" data-page="contact">Contact Us</a></li>
            </ul>
        </nav>
    </div>

    
    <main className="main-content">

        
        <section id="home" className="page-view active">
            
            <section className="hero-section" id="hero-interactive">
                
                <canvas id="hero-particles" className="hero-particles-canvas"></canvas>
                
                
                <div className="hero-tech-bg">
                    <div className="tech-blueprint-grid"></div>
                    <div className="tech-circuit-lines">
                        <svg viewBox="0 0 1000 800" fill="none" stroke="rgba(255, 107, 53, 0.08)" strokeWidth="2">
                            
                            <path d="M 0 150 H 250 L 300 200 V 350 L 350 400 H 600" className="circuit-path-1" />
                            <path d="M 1000 650 H 750 L 700 600 V 450 L 650 400 H 400" className="circuit-path-2" />
                            
                            
                            <path d="M 0 150 H 250 L 300 200 V 350 L 350 400 H 600" className="circuit-pulse" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                            <path d="M 1000 650 H 750 L 700 600 V 450 L 650 400 H 400" className="circuit-pulse" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                            
                            
                            <circle cx="500" cy="400" r="160" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" strokeDasharray="6 6" />
                            <circle cx="500" cy="400" r="90" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
                            <line x1="500" y1="180" x2="500" y2="620" stroke="rgba(255, 255, 255, 0.015)" strokeWidth="1" strokeDasharray="2 4" />
                            <line x1="280" y1="400" x2="720" y2="400" stroke="rgba(255, 255, 255, 0.015)" strokeWidth="1" strokeDasharray="2 4" />
                            <rect x="480" y="380" width="40" height="40" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" strokeDasharray="2 2" />
                            
                            
                            <circle cx="300" cy="200" r="4" fill="var(--color-accent)" opacity="0.5" />
                            <circle cx="700" cy="600" r="4" fill="var(--color-accent)" opacity="0.5" />
                            <circle cx="350" cy="400" r="4" fill="var(--color-accent)" opacity="0.5" />
                            <circle cx="650" cy="400" r="4" fill="var(--color-accent)" opacity="0.5" />
                        </svg>
                    </div>
                    <div className="tech-light-beams">
                        <div className="light-beam beam-1"></div>
                        <div className="light-beam beam-2"></div>
                    </div>
                </div>
                
                
                <div className="floating-shapes-container">
                    <div className="floating-shape shape-1" style={{"animationDelay":"0s"}}>
                        <svg viewBox="0 0 100 100" width="50" height="50" fill="none" stroke="rgba(255, 107, 53, 0.15)" strokeWidth="4">
                            <polygon points="50,15 90,85 10,85" />
                        </svg>
                    </div>
                    <div className="floating-shape shape-2" style={{"animationDelay":"-3s"}}>
                        <svg viewBox="0 0 100 100" width="70" height="70" fill="none" stroke="rgba(96, 114, 140, 0.15)" strokeWidth="4">
                            <circle cx="50" cy="50" r="40"/>
                            <line x1="50" y1="10" x2="50" y2="90" strokeDasharray="5 5"/>
                            <line x1="10" y1="50" x2="90" y2="50" strokeDasharray="5 5"/>
                        </svg>
                    </div>
                    <div className="floating-shape shape-3" style={{"animationDelay":"-6s"}}>
                        <svg viewBox="0 0 100 100" width="40" height="40" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="3">
                            <rect x="15" y="15" width="70" height="70" rx="6" />
                        </svg>
                    </div>
                </div>

                <div className="container hero-container grid grid-2">
                    <div className="hero-content scroll-reveal slide-in-left">
                        <span className="badge animated-badge">Construction Project Solutions</span>
                        <h1 className="text-reveal-header">Reliable Construction Solutions for <span className="text-gradient">Modern Projects</span></h1>
                        <p className="tagline-container">We engineer <span id="typing-tagline" className="typing-text"></span><span className="typing-cursor">|</span></p>
                        <div className="hero-actions">
                            <a href="#services" className="btn btn-primary floating-btn btn-magnetic" onclick="navigateToPage('services')">Explore Services</a>
                            <a href="#contact" className="btn btn-secondary floating-btn btn-magnetic" onclick="navigateToPage('contact')">Contact Us</a>
                        </div>
                        <div className="hero-trust-indicators">
                            <div className="trust-badge-pill">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                <span>ISO 9001:2015</span>
                            </div>
                            <div className="trust-badge-pill">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                <span>AS9100D Aerospace</span>
                            </div>
                            <div className="trust-badge-pill">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                <span>AWS Certified</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="hero-visual scroll-reveal slide-in-right">
                        
                        <div className="hero-parallax-layer layer-cog" data-depth="0.15">
                            <svg viewBox="0 0 100 100" width="80" height="80" fill="none" stroke="rgba(255, 107, 53, 0.12)" strokeWidth="3" className="spin-slow">
                                <path d="M50 35a15 15 0 1 0 0 30 15 15 0 0 0 0-30m0-10c-3 0-6 2-7 5l-4-1c-2-3-5-4-8-3l-2 3c-1 3 0 6 3 8l-3 4c-3-1-6 0-7 3l1 4c3 1 4 5 3 8l3 2c3 1 6 0 7-3l4 3c-1 3-2 6 1 7l4-1c1-3 5-4 8-3l2-3c1-3 0-6-3-8l3-4c3 1 6 0 7-3l-1-4c-3-1-4-5-3-8l-3-2c-3-1-6 0-7 3z"/>
                            </svg>
                        </div>
                        <div className="hero-parallax-layer layer-blueprint" data-depth="0.25">
                            <svg viewBox="0 0 100 100" width="120" height="120" fill="none" stroke="rgba(96, 114, 140, 0.08)" strokeWidth="2">
                                <rect x="10" y="10" width="80" height="80" strokeDasharray="2 2"/>
                                <line x1="50" y1="10" x2="50" y2="90"/>
                                <line x1="10" y1="50" x2="90" y2="50"/>
                                <circle cx="50" cy="50" r="20"/>
                            </svg>
                        </div>

                        
                        <div className="hero-image-card hover-tilt" data-tilt>
                            <div className="glowing-border-overlay"></div>
                            <img src="/assets/hero_factory.png" alt="Construction project planning and execution" />
                            <div className="hero-image-overlay"></div>
                            <div className="hero-visual-badge">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin-slow"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                                <span>24/7 Operations</span>
                            </div>
                        </div>

                        
                        <div className="kpi-wrapper kpi-1 scroll-reveal zoom-in" data-depth="0.2">
                            <div className="floating-kpi-card">
                                <span className="kpi-num">500+</span>
                                <span className="kpi-text">Projects Done</span>
                            </div>
                        </div>
                        <div className="kpi-wrapper kpi-2 scroll-reveal zoom-in" data-depth="0.1">
                            <div className="floating-kpi-card">
                                <span className="kpi-num">99%</span>
                                <span className="kpi-text">Quality Gates</span>
                            </div>
                        </div>
                        <div className="kpi-wrapper kpi-3 scroll-reveal zoom-in" data-depth="0.3">
                            <div className="floating-kpi-card">
                                <span className="kpi-num">10+</span>
                                <span className="kpi-text">Years Exp</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="logos-strip-section">
                <div className="container">
                    <div className="strip-header">
                        <h2>Trusted by global enterprise leaders</h2>
                        <p className="strip-subtitle">Supporting construction, infrastructure, commercial projects, residential builds, and site development sectors.</p>
                    </div>
                    <div className="logos-marquee-container">
                        <div className="logos-marquee-track">
                            <div className="logo-item" aria-label="AeroSpace Corp">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="180" height="40">
                                    <g transform="translate(10, 10)">
                                        <path d="M 0 25 L 15 5 L 30 25 L 15 20 Z" fill="#38bdf8"/>
                                        <circle cx="15" cy="5" r="2" fill="#ffffff"/>
                                    </g>
                                    <text x="50" y="32" fontFamily="var(--font-heading)" fontSize="16" fontWeight="800" fill="#ffffff" letterSpacing="1">AERO<tspan fill="#38bdf8">SPACE</tspan></text>
                                </svg>
                            </div>
                            <div className="logo-item" aria-label="AutoDyn EV">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="180" height="40">
                                    <g transform="translate(10, 10)">
                                        <circle cx="15" cy="15" r="14" stroke="#ff6b35" strokeWidth="2" fill="none"/>
                                        <path d="M 14 6 L 8 16 L 15 16 L 14 24 L 20 14 L 13 14 Z" fill="#ff6b35"/>
                                    </g>
                                    <text x="50" y="32" fontFamily="var(--font-heading)" fontSize="16" fontWeight="800" fill="#ffffff" letterSpacing="1">AUTO<tspan fill="#ff6b35">DYN</tspan></text>
                                </svg>
                            </div>
                            <div className="logo-item" aria-label="GlobalEnergy">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="180" height="40">
                                    <g transform="translate(10, 10)">
                                        <circle cx="15" cy="15" r="14" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" fill="none"/>
                                        <path d="M 9 15 Q 15 9 21 15 Q 15 21 9 15 Z" fill="#10b981"/>
                                        <circle cx="15" cy="15" r="3" fill="#ffffff"/>
                                    </g>
                                    <text x="50" y="32" fontFamily="var(--font-heading)" fontSize="15" fontWeight="800" fill="#ffffff" letterSpacing="1">GLOBAL<tspan fill="#10b981">ENERGY</tspan></text>
                                </svg>
                            </div>
                            <div className="logo-item" aria-label="DefenseSystems">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="180" height="40">
                                    <g transform="translate(10, 10)">
                                        <path d="M 15 2 L 3 6 V 16 C 3 23 15 28 15 28 C 15 28 27 23 27 16 V 6 Z" fill="#3b82f6"/>
                                        <path d="M 9 13 L 13 17 L 21 9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                    </g>
                                    <text x="50" y="32" fontFamily="var(--font-heading)" fontSize="14" fontWeight="800" fill="#ffffff" letterSpacing="1">DEFENSE<tspan fill="#3b82f6">SYS</tspan></text>
                                </svg>
                            </div>
                            <div className="logo-item" aria-label="RoboticsInc">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="180" height="40">
                                    <g transform="translate(10, 10)">
                                        <rect x="4" y="4" width="22" height="22" rx="3" stroke="#a855f7" strokeWidth="2" fill="none"/>
                                        <circle cx="10" cy="12" r="2" fill="#a855f7"/>
                                        <circle cx="20" cy="12" r="2" fill="#a855f7"/>
                                        <path d="M 9 19 Q 15 22 21 19" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" fill="none"/>
                                    </g>
                                    <text x="50" y="32" fontFamily="var(--font-heading)" fontSize="16" fontWeight="800" fill="#ffffff" letterSpacing="1">ROBOTICS<tspan fill="#a855f7">INC</tspan></text>
                                </svg>
                            </div>
                            <div className="logo-item" aria-label="PowerGrid Co">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="180" height="40">
                                    <g transform="translate(10, 10)">
                                        <path d="M 5 28 L 15 2 L 25 28 Z" stroke="#eab308" strokeWidth="2" fill="none"/>
                                        <line x1="15" y1="2" x2="15" y2="28" stroke="#eab308" strokeWidth="2"/>
                                        <line x1="9" y1="16" x2="21" y2="16" stroke="#eab308" strokeWidth="2"/>
                                    </g>
                                    <text x="50" y="32" fontFamily="var(--font-heading)" fontSize="16" fontWeight="800" fill="#ffffff" letterSpacing="1">POWER<tspan fill="#eab308">GRID</tspan></text>
                                </svg>
                            </div>
                            
                            
                            <div className="logo-item" aria-label="AeroSpace Corp">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="180" height="40">
                                    <g transform="translate(10, 10)">
                                        <path d="M 0 25 L 15 5 L 30 25 L 15 20 Z" fill="#38bdf8"/>
                                        <circle cx="15" cy="5" r="2" fill="#ffffff"/>
                                    </g>
                                    <text x="50" y="32" fontFamily="var(--font-heading)" fontSize="16" fontWeight="800" fill="#ffffff" letterSpacing="1">AERO<tspan fill="#38bdf8">SPACE</tspan></text>
                                </svg>
                            </div>
                            <div className="logo-item" aria-label="AutoDyn EV">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="180" height="40">
                                    <g transform="translate(10, 10)">
                                        <circle cx="15" cy="15" r="14" stroke="#ff6b35" strokeWidth="2" fill="none"/>
                                        <path d="M 14 6 L 8 16 L 15 16 L 14 24 L 20 14 L 13 14 Z" fill="#ff6b35"/>
                                    </g>
                                    <text x="50" y="32" fontFamily="var(--font-heading)" fontSize="16" fontWeight="800" fill="#ffffff" letterSpacing="1">AUTO<tspan fill="#ff6b35">DYN</tspan></text>
                                </svg>
                            </div>
                            <div className="logo-item" aria-label="GlobalEnergy">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="180" height="40">
                                    <g transform="translate(10, 10)">
                                        <circle cx="15" cy="15" r="14" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" fill="none"/>
                                        <path d="M 9 15 Q 15 9 21 15 Q 15 21 9 15 Z" fill="#10b981"/>
                                        <circle cx="15" cy="15" r="3" fill="#ffffff"/>
                                    </g>
                                    <text x="50" y="32" fontFamily="var(--font-heading)" fontSize="15" fontWeight="800" fill="#ffffff" letterSpacing="1">GLOBAL<tspan fill="#10b981">ENERGY</tspan></text>
                                </svg>
                            </div>
                            <div className="logo-item" aria-label="DefenseSystems">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="180" height="40">
                                    <g transform="translate(10, 10)">
                                        <path d="M 15 2 L 3 6 V 16 C 3 23 15 28 15 28 C 15 28 27 23 27 16 V 6 Z" fill="#3b82f6"/>
                                        <path d="M 9 13 L 13 17 L 21 9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                    </g>
                                    <text x="50" y="32" fontFamily="var(--font-heading)" fontSize="14" fontWeight="800" fill="#ffffff" letterSpacing="1">DEFENSE<tspan fill="#3b82f6">SYS</tspan></text>
                                </svg>
                            </div>
                            <div className="logo-item" aria-label="RoboticsInc">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="180" height="40">
                                    <g transform="translate(10, 10)">
                                        <rect x="4" y="4" width="22" height="22" rx="3" stroke="#a855f7" strokeWidth="2" fill="none"/>
                                        <circle cx="10" cy="12" r="2" fill="#a855f7"/>
                                        <circle cx="20" cy="12" r="2" fill="#a855f7"/>
                                        <path d="M 9 19 Q 15 22 21 19" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" fill="none"/>
                                    </g>
                                    <text x="50" y="32" fontFamily="var(--font-heading)" fontSize="16" fontWeight="800" fill="#ffffff" letterSpacing="1">ROBOTICS<tspan fill="#a855f7">INC</tspan></text>
                                </svg>
                            </div>
                            <div className="logo-item" aria-label="PowerGrid Co">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="180" height="40">
                                    <g transform="translate(10, 10)">
                                        <path d="M 5 28 L 15 2 L 25 28 Z" stroke="#eab308" strokeWidth="2" fill="none"/>
                                        <line x1="15" y1="2" x2="15" y2="28" stroke="#eab308" strokeWidth="2"/>
                                        <line x1="9" y1="16" x2="21" y2="16" stroke="#eab308" strokeWidth="2"/>
                                    </g>
                                    <text x="50" y="32" fontFamily="var(--font-heading)" fontSize="16" fontWeight="800" fill="#ffffff" letterSpacing="1">POWER<tspan fill="#eab308">GRID</tspan></text>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="home-overview section-padding" style={{"paddingTop": "3rem", "paddingBottom": "3rem"}}>
                <div className="container grid grid-2" style={{"maxWidth": "750px", "margin": "0 auto", "alignItems": "center", "gap": "1.5rem"}}>
                    <div className="overview-text scroll-reveal slide-in-left">
                        <span className="section-subtitle" style={{"fontSize": "0.8rem", "marginBottom": "0.5rem"}}>Who We Are</span>
                        <h2 style={{"fontSize": "1.8rem", "marginBottom": "1rem"}}>Building the Future of Construction Delivery</h2>
                        <p className="lead" style={{"fontSize": "1rem", "marginBottom": "1rem"}}>At Fusion Services, we combine site execution, structural planning, material coordination, and project supervision to deliver dependable construction work.</p>
                        <p style={{"fontSize": "0.9rem", "marginBottom": "1rem"}}>From site planning to final handover, our teams follow structured quality checks to ensure dependable construction, cost control, and timely execution.</p>
                        <a href="#about" className="text-link hover-slide-arrow" onclick="navigateToPage('about')" style={{"fontSize": "0.9rem"}}>Learn more about our journey <span className="arrow">&rarr;</span></a>
                    </div>
                    <div className="overview-visual scroll-reveal slide-in-right">
                        <div className="image-wrapper hover-zoom-img">
                            <img src="/assets/heavy_machinery.png" alt="Advanced industrial machinery in operation" style={{"maxHeight": "280px", "width": "100%", "objectFit": "cover", "borderRadius": "8px"}} />
                            <div className="floating-badge pulse-badge">
                                <span className="badge-num">10+</span>
                                <span className="badge-txt">Years of Excellence</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="stats-section section-padding bg-dark">
                <div className="container">
                    <div className="grid grid-4 text-center">
                        <div className="stat-card scroll-reveal zoom-in">
                            <div className="stat-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <h3 className="stat-number" data-target="10">0</h3>
                            <p className="stat-label">Years Experience</p>
                            <div className="stat-progress-bar"><div className="stat-progress-fill" data-progress="100%"></div></div>
                        </div>
                        <div className="stat-card scroll-reveal zoom-in" style={{"animationDelay":"0.1s"}}>
                            <div className="stat-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </div>
                            <h3 className="stat-number" data-target="500">0</h3>
                            <p className="stat-label">Projects Completed</p>
                            <div className="stat-progress-bar"><div className="stat-progress-fill" data-progress="95%"></div></div>
                        </div>
                        <div className="stat-card scroll-reveal zoom-in" style={{"animationDelay":"0.2s"}}>
                            <div className="stat-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <h3 className="stat-number" data-target="100">0</h3>
                            <p className="stat-label">Clients Served</p>
                            <div className="stat-progress-bar"><div className="stat-progress-fill" data-progress="88%"></div></div>
                        </div>
                        <div className="stat-card scroll-reveal zoom-in" style={{"animationDelay":"0.3s"}}>
                            <div className="stat-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </div>
                            <h3 className="stat-number" data-target="99">0</h3>
                            <p className="stat-label">Quality Commitment %</p>
                            <div className="stat-progress-bar"><div className="stat-progress-fill" data-progress="99%"></div></div>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="services-preview section-padding">
                <div className="container">
                    <div className="section-header text-center scroll-reveal">
                        <span className="section-subtitle">Our Specializations</span>
                        <h2>Key Construction Service Offerings</h2>
                        <p>We provide civil, structural, and project support solutions designed for dependable construction execution.</p>
                    </div>
                    <div className="grid grid-3 service-cards-reveal">
                        
                        <div className="card hover-tilt scroll-reveal reveal-item" data-tilt>
                            <div className="glowing-border-overlay"></div>
                            <div className="card-icon-container animated-icon">
                                <svg className="svg-gear" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
                            </div>
                            <h3>Civil Construction</h3>
                            <p>Residential, commercial, and industrial civil works with disciplined site execution and quality control.</p>
                            <a href="#services" className="card-link" onclick="navigateToPage('services')">Learn More &rarr;</a>
                        </div>
                        
                        <div className="card hover-tilt scroll-reveal reveal-item" data-tilt style={{"animationDelay":"0.1s"}}>
                            <div className="glowing-border-overlay"></div>
                            <div className="card-icon-container animated-icon">
                                <svg className="svg-compass" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            </div>
                            <h3>Structural Engineering</h3>
                            <p>Structural planning, drawings, load-focused design support, and practical execution coordination.</p>
                            <a href="#services" className="card-link" onclick="navigateToPage('services')">Learn More &rarr;</a>
                        </div>
                        
                        <div className="card hover-tilt scroll-reveal reveal-item" data-tilt style={{"animationDelay":"0.2s"}}>
                            <div className="glowing-border-overlay"></div>
                            <div className="card-icon-container animated-icon">
                                <svg className="svg-wrench" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                            </div>
                            <h3>Construction Services</h3>
                            <p>Concrete work, masonry, finishing, steel support, and complete site-based construction activities.</p>
                            <a href="#services" className="card-link" onclick="navigateToPage('services')">Learn More &rarr;</a>
                        </div>
                        
                        <div className="card hover-tilt scroll-reveal reveal-item" data-tilt>
                            <div className="glowing-border-overlay"></div>
                            <div className="card-icon-container animated-icon">
                                <svg className="svg-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </div>
                            <h3>Quality Inspection</h3>
                            <p>Site quality checks, material verification, workmanship review, and construction progress reporting.</p>
                            <a href="#services" className="card-link" onclick="navigateToPage('services')">Learn More &rarr;</a>
                        </div>
                        
                        <div className="card hover-tilt scroll-reveal reveal-item" data-tilt style={{"animationDelay":"0.1s"}}>
                            <div className="glowing-border-overlay"></div>
                            <div className="card-icon-container animated-icon">
                                <svg className="svg-briefcase" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l-7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            </div>
                            <h3>Project Consulting</h3>
                            <p>Planning, material selection, vendor coordination, BOQ support, and construction workflow guidance.</p>
                            <a href="#services" className="card-link" onclick="navigateToPage('services')">Learn More &rarr;</a>
                        </div>
                        
                        <div className="card hover-tilt scroll-reveal reveal-item" data-tilt style={{"animationDelay":"0.2s"}}>
                            <div className="glowing-border-overlay"></div>
                            <div className="card-icon-container animated-icon">
                                <svg className="svg-shield" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            </div>
                            <h3>Turnkey Project Solutions</h3>
                            <p>End-to-end construction support tailored for residential, commercial, and infrastructure projects.</p>
                            <a href="#services" className="card-link" onclick="navigateToPage('services')">Learn More &rarr;</a>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="why-choose-us section-padding bg-light">
                <div className="container">
                    <div className="section-header text-center scroll-reveal">
                        <span className="section-subtitle">Our Competitive Advantage</span>
                        <h2>Why Global Enterprises Choose Fusion</h2>
                        <p>We combine advanced infrastructure with rigid quality gates to deliver perfect execution on every contract.</p>
                    </div>
                    <div className="grid grid-3">
                        <div className="feature-card scroll-reveal slide-in-left">
                            <div className="feature-icon pulse-effect">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <h4>Experienced Team</h4>
                            <p>Our team consists of veteran engineers and certified precision technicians who bring decades of combined industrial expertise.</p>
                        </div>
                        <div className="feature-card scroll-reveal zoom-in">
                            <div className="feature-icon pulse-effect">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                            </div>
                            <h4>Modern Infrastructure</h4>
                            <p>Our project workflow includes site preparation, material movement, safety checks, and coordinated construction zones.</p>
                        </div>
                        <div className="feature-card scroll-reveal slide-in-right">
                            <div className="feature-icon pulse-effect">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                            </div>
                            <h4>Advanced Technology</h4>
                            <p>We use project planning tools, site measurement workflows, drawings coordination, and progress monitoring.</p>
                        </div>
                        <div className="feature-card scroll-reveal slide-in-left">
                            <div className="feature-icon pulse-effect">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            </div>
                            <h4>Quality Assurance</h4>
                            <p>With an AS9100/ISO9001 certified program, we enforce strict tolerances and double-blind inspection workflows.</p>
                        </div>
                        <div className="feature-card scroll-reveal zoom-in">
                            <div className="feature-icon pulse-effect">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <h4>On-Time Delivery</h4>
                            <p>Our intelligent scheduling system and lean logistics management guarantee that deadlines are met without compromise.</p>
                        </div>
                        <div className="feature-card scroll-reveal slide-in-right">
                            <div className="feature-icon pulse-effect">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                            </div>
                            <h4>Customer Satisfaction</h4>
                            <p>We pride ourselves on direct project manager communication, transparent quotes, and collaborative engineering partnerships.</p>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="process-section section-padding">
                <div className="container">
                    <div className="section-header text-center scroll-reveal">
                        <span className="section-subtitle">Operational Excellence</span>
                        <h2>Our Construction Process</h2>
                        <p>A rigorous, structured path that takes your project from engineering design to absolute physical reality.</p>
                    </div>
                    
                    <div className="process-stepper scroll-reveal">
                        <div className="stepper-progress">
                            <div className="progress-bar-fill" id="process-progress"></div>
                        </div>
                        <div className="step-nodes-container">
                            <button className="step-node active" data-step="1" aria-label="Step 1: Consultation">
                                <span className="step-num">01</span>
                                <span className="step-title">Consultation</span>
                            </button>
                            <button className="step-node" data-step="2" aria-label="Step 2: Planning">
                                <span className="step-num">02</span>
                                <span className="step-title">Planning</span>
                            </button>
                            <button className="step-node" data-step="3" aria-label="Step 3: Production">
                                <span className="step-num">03</span>
                                <span className="step-title">Production</span>
                            </button>
                            <button className="step-node" data-step="4" aria-label="Step 4: Quality Testing">
                                <span className="step-num">04</span>
                                <span className="step-title">Testing</span>
                            </button>
                            <button className="step-node" data-step="5" aria-label="Step 5: Delivery">
                                <span className="step-num">05</span>
                                <span className="step-title">Delivery</span>
                            </button>
                        </div>
                        
                        <div className="process-content-wrapper card hover-tilt" data-tilt>
                            <div className="glowing-border-overlay"></div>
                            <div className="process-slide active" id="process-step-1">
                                <h3>Step 1: Technical Consultation</h3>
                                <p>We start by reviewing drawings, site requirements, budget, timeline, and construction goals. Our team evaluates materials, permissions, quantities, and execution feasibility.</p>
                            </div>
                            <div className="process-slide" id="process-step-2">
                                <h3>Step 2: Engineering & Planning</h3>
                                <p>Our team prepares work schedules, BOQ references, procurement plans, and site coordination steps before execution begins.</p>
                            </div>
                            <div className="process-slide" id="process-step-3">
                                <h3>Step 3: Advanced Production</h3>
                                <p>Your project moves into site execution with supervised civil work, structural activity, material checks, and daily progress tracking.</p>
                            </div>
                            <div className="process-slide" id="process-step-4">
                                <h3>Step 4: Rigorous Quality Testing</h3>
                                <p>Quality assurance validates every dimension. We apply Coordinate Measuring Machine (CMM) testing, surface roughness analysis, and non-destructive testing (NDT) procedures. Every batch leaves with full verification documentation.</p>
                            </div>
                            <div className="process-slide" id="process-step-5">
                                <h3>Step 5: Protected Logistics & Delivery</h3>
                                <p>Components are custom-packed in corrosion-resistant packaging, cataloged, and shipped with full track-and-trace. We offer flexible shipping modes and ensure on-time warehousing arrivals according to your supply chain deadlines.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="testimonials-section section-padding bg-light">
                <div className="container">
                    <div className="section-header text-center scroll-reveal">
                        <span className="section-subtitle">Client Success</span>
                        <h2>What Industry Leaders Say</h2>
                        <p>Hear from clients and project partners about their construction experience with Fusion Services.</p>
                    </div>
                    
                    
                    <div className="testimonial-carousel-wrapper scroll-reveal zoom-in">
                        <div className="testimonial-carousel-inner" id="testimonial-carousel-slider">
                            
                            
                            <div className="testimonial-slide active">
                                <div className="testimonial-card card floating-review">
                                    <div className="quote-icon">“</div>
                                    <p className="quote-text">Fusion Services handled our project planning and site execution with discipline. Their team kept quality, timeline, and material coordination under control.</p>
                                    <div className="client-info">
                                        <div className="client-meta">
                                            <h4 className="client-name">Marcus Vance</h4>
                                            <span className="client-title">VP of Operations, AeroDynamic Corp</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            
                            <div className="testimonial-slide">
                                <div className="testimonial-card card floating-review">
                                    <div className="quote-icon">“</div>
                                    <p className="quote-text">Their construction support solved our site bottlenecks quickly. Work moved faster once their team took over coordination and daily execution tracking.</p>
                                    <div className="client-info">
                                        <div className="client-meta">
                                            <h4 className="client-name">Elena Rostova</h4>
                                            <span className="client-title">Engineering Director, NordEnergy Group</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            
                            <div className="testimonial-slide">
                                <div className="testimonial-card card floating-review">
                                    <div className="quote-icon">“</div>
                                    <p className="quote-text">Fusion's project consulting helped us reduce rework and control costs. Their practical construction planning made the execution much smoother.</p>
                                    <div className="client-info">
                                        <div className="client-meta">
                                            <h4 className="client-name">David K. Miller</h4>
                                            <span className="client-title">Project Director, Urban Build Group</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        </div>

                        
                        <div className="carousel-dots-container" id="carousel-dots">
                            <span className="carousel-dot active" data-index="0" aria-label="Go to slide 1"></span>
                            <span className="carousel-dot" data-index="1" aria-label="Go to slide 2"></span>
                            <span className="carousel-dot" data-index="2" aria-label="Go to slide 3"></span>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="cta-section section-padding bg-dark text-center parallax-section" style={{"backgroundImage":"linear-gradient(180deg, rgba(11, 19, 43, 0.9) 0%, rgba(11, 19, 43, 0.95) 100%), url('assets/hero_factory.png')"}}>
                <div className="container scroll-reveal zoom-in">
                    <h2>Let's Build Something Together</h2>
                    <p>Contact our project team today to discuss construction drawings, BOQ, material planning, site execution, or turnkey requirements.</p>
                    <a href="#contact" className="btn btn-primary pulse-badge" onclick="navigateToPage('contact')">Get In Touch Today &rarr;</a>
                </div>
            </section>
        </section>

        
        <section id="about" className="page-view">
            
            <section className="page-hero bg-dark">
                <div className="container text-center">
                    <span className="badge animated-badge">Who We Are</span>
                    <h1>Our Engineering Heritage</h1>
                    <p>Learn about our mission, vision, and the values that drive our construction delivery.</p>
                </div>
            </section>

            
            <section className="about-overview section-padding">
                <div className="container grid grid-2">
                    <div className="overview-details scroll-reveal slide-in-left">
                        <h2>Dedicated to Precision & Quality</h2>
                        <p className="lead">Founded on practical site execution, structural discipline, and project accountability, Fusion Services supports reliable construction delivery.</p>
                        <p>We provide civil construction, structural support, project consulting, BOQ coordination, and turnkey execution assistance. We focus on quality workmanship, material discipline, safety, and clear communication across every project stage.</p>
                        <div className="mvv-grid">
                            <div className="mvv-item card hover-tilt" data-tilt>
                                <div className="glowing-border-overlay"></div>
                                <h5>Our Mission</h5>
                                <p>To engineer and deliver flawless, high-precision industrial components that enable our clients to innovate, grow, and operate at peak efficiency.</p>
                            </div>
                            <div className="mvv-item card hover-tilt" data-tilt>
                                <div className="glowing-border-overlay"></div>
                                <h5>Our Vision</h5>
                                <p>To be a trusted construction partner recognized for reliable execution, quality workmanship, transparent coordination, and client trust.</p>
                            </div>
                        </div>
                    </div>
                    <div className="capabilities-summary card hover-tilt scroll-reveal slide-in-right" data-tilt>
                        <div className="glowing-border-overlay"></div>
                        <h3>Core Values</h3>
                        <ul className="values-list">
                            <li>
                                <strong>Safety First:</strong> Protecting workers, clients, and site teams through disciplined safety practices on every project.
                            </li>
                            <li>
                                <strong>Integrity & Precision:</strong> Maintaining structural tolerances in our metal and metal-free workpieces alike.
                            </li>
                            <li>
                                <strong>Innovation:</strong> Continuously improving planning, site coordination, measurement, and reporting workflows.
                            </li>
                            <li>
                                <strong>Collaboration:</strong> Aligning closely with client project managers, sharing detailed metrology and scheduling data.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            
            <section className="capabilities-section section-padding bg-light">
                <div className="container">
                    <div className="section-header text-center scroll-reveal">
                        <span className="section-subtitle">What We Do Best</span>
                        <h2>Construction Capabilities</h2>
                        <p>Our construction workflow is designed to handle civil works, structural coordination, finishing, repair, and turnkey execution.</p>
                    </div>
                    <div className="grid grid-4 capability-cards-reveal">
                        <div className="capability-card card hover-tilt scroll-reveal reveal-item" data-tilt>
                            <div className="glowing-border-overlay"></div>
                            <h4>Modern Machinery</h4>
                            <p>Site preparation, RCC work, masonry, plastering, waterproofing, steel support, finishing, and project supervision.</p>
                        </div>
                        <div className="capability-card card hover-tilt scroll-reveal reveal-item" data-tilt style={{"animationDelay":"0.1s"}}>
                            <div className="glowing-border-overlay"></div>
                            <h4>Skilled Workforce</h4>
                            <p>Every machinist and welder is certified under ISO, AWS, and local engineering guild standards to guarantee perfection.</p>
                        </div>
                        <div className="capability-card card hover-tilt scroll-reveal reveal-item" data-tilt style={{"animationDelay":"0.2s"}}>
                            <div className="glowing-border-overlay"></div>
                            <h4>Quality Standards</h4>
                            <p>ISO 9001 and AS9100 fully implemented quality systems, climate controlled metrology, and absolute coordinate auditing.</p>
                        </div>
                        <div className="capability-card card hover-tilt scroll-reveal reveal-item" data-tilt style={{"animationDelay":"0.3s"}}>
                            <div className="glowing-border-overlay"></div>
                            <h4>Production Capacity</h4>
                            <p>Flexible operations with high capacity to support 24/7 industrial runs, hot-swappable tools, and fast tooling setups.</p>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="timeline-section section-padding">
                <div className="container">
                    <div className="section-header text-center scroll-reveal">
                        <span className="section-subtitle">Our Journey</span>
                        <h2>Growth & Milestones</h2>
                        <p>How Fusion Services developed into a dependable construction and project execution partner.</p>
                    </div>

                    <div className="timeline-container">
                        <div className="timeline-line">
                            <div className="timeline-line-progress" id="timeline-progress-bar"></div>
                        </div>
                        
                        <div className="timeline-item left scroll-reveal slide-in-left">
                            <div className="timeline-dot"></div>
                            <div className="timeline-card card hover-tilt" data-tilt>
                                <div className="glowing-border-overlay"></div>
                                <span className="timeline-date">2016</span>
                                <h4>Company Founding</h4>
                                <p>Fusion Services launched with a small execution team focused on civil work, site coordination, and client trust.</p>
                            </div>
                        </div>

                        <div className="timeline-item right scroll-reveal slide-in-right">
                            <div className="timeline-dot"></div>
                            <div className="timeline-card card hover-tilt" data-tilt>
                                <div className="glowing-border-overlay"></div>
                                <span className="timeline-date">2018</span>
                                <h4>Facility Expansion</h4>
                                <p>Expanded into larger construction projects, adding structural support, finishing teams, repair work, and stronger site supervision.</p>
                            </div>
                        </div>

                        <div className="timeline-item left scroll-reveal slide-in-left">
                            <div className="timeline-dot"></div>
                            <div className="timeline-card card hover-tilt" data-tilt>
                                <div className="glowing-border-overlay"></div>
                                <span className="timeline-date">2020</span>
                                <h4>ISO Certification & Aerospace</h4>
                                <p>Strengthened documentation, quality checks, vendor coordination, and project reporting for larger construction clients.</p>
                            </div>
                        </div>

                        <div className="timeline-item right scroll-reveal slide-in-right">
                            <div className="timeline-dot"></div>
                            <div className="timeline-card card hover-tilt" data-tilt>
                                <div className="glowing-border-overlay"></div>
                                <span className="timeline-date">2023</span>
                                <h4>Automation & Robotics Integration</h4>
                                <p>Invested in high-volume robotic arm cells and custom CAD-CAM telemetry, enabling automated night shift runs.</p>
                            </div>
                        </div>

                        <div className="timeline-item left scroll-reveal slide-in-left">
                            <div className="timeline-dot"></div>
                            <div className="timeline-card card hover-tilt" data-tilt>
                                <div className="glowing-border-overlay"></div>
                                <span className="timeline-date">2026</span>
                                <h4>Global Supply Expansion</h4>
                                <p>Serving residential, commercial, and infrastructure clients with civil works, repairs, renovation, and project coordination.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="trust-cards section-padding bg-light">
                <div className="container">
                    <div className="section-header text-center scroll-reveal">
                        <span className="section-subtitle">Unmatched Commitment</span>
                        <h2>Why Clients Trust Us</h2>
                        <p>We work to eliminate risk, ensure quality compliance, and provide seamless scheduling for our clients.</p>
                    </div>
                    <div className="grid grid-3">
                        <div className="card hover-tilt scroll-reveal zoom-in" data-tilt>
                            <div className="glowing-border-overlay"></div>
                            <div className="trust-icon pulse-effect">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            </div>
                            <h4>End-to-End Compliance</h4>
                            <p>Complete regulatory compliance with detailed material traceability logs, chemical certifications, and metrology audits.</p>
                        </div>
                        <div className="card hover-tilt scroll-reveal zoom-in" data-tilt style={{"animationDelay":"0.1s"}}>
                            <div className="glowing-border-overlay"></div>
                            <div className="trust-icon pulse-effect">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <h4>Guaranteed Lead Times</h4>
                            <p>Committed project schedules, site follow-ups, and material coordination to handle urgent construction requirements.</p>
                        </div>
                        <div className="card hover-tilt scroll-reveal zoom-in" data-tilt style={{"animationDelay":"0.2s"}}>
                            <div className="glowing-border-overlay"></div>
                            <div className="trust-icon pulse-effect">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path></svg>
                            </div>
                            <h4>Transparent Engineering Data</h4>
                            <p>Clients enjoy transparent access to design modifications, telemetry tracking, and dimensional checking reports.</p>
                        </div>
                    </div>
                </div>
            </section>
        </section>

        
        <section id="services" className="page-view">
            
            <section className="page-hero bg-dark">
                <div className="container text-center">
                    <span className="badge animated-badge">What We Deliver</span>
                    <h1>Construction Services & Solutions</h1>
                    <p>Explore our civil works, structural support, project coordination, and turnkey construction capabilities.</p>
                </div>
            </section>

            
            <section className="detailed-services-section section-padding">
                <div className="container">
                    <div className="grid grid-2 service-block">
                        <div className="service-image-wrapper hover-zoom-img scroll-reveal slide-in-left">
                            <img src="/assets/heavy_machinery.png" alt="Construction equipment and project site" />
                        </div>
                        <div className="service-info-wrapper scroll-reveal slide-in-right">
                            <span className="service-number">01</span>
                            <h3>Civil Construction</h3>
                            <p>We deliver civil construction work for residential, commercial, and industrial projects with structured planning, skilled teams, and reliable site supervision.</p>
                            <div className="features-benefits">
                                <div className="fb-item">
                                    <strong>Key Features:</strong>
                                    <p>Site preparation, RCC work, masonry, plastering, finishing, and daily progress control.</p>
                                </div>
                                <div className="fb-item">
                                    <strong>Benefits:</strong>
                                    <p>Better schedule control, cleaner execution, and dependable quality across project stages.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-2 service-block reverse">
                        <div className="service-image-wrapper hover-zoom-img scroll-reveal slide-in-right">
                            <img src="/assets/precision_part.png" alt="Structural construction planning detail" />
                        </div>
                        <div className="service-info-wrapper scroll-reveal slide-in-left">
                            <span className="service-number">02</span>
                            <h3>Structural Project Support</h3>
                            <p>We support construction projects with structural planning, BOQ coordination, reinforcement detailing, and execution-ready technical guidance.</p>
                            <div className="features-benefits">
                                <div className="fb-item">
                                    <strong>Key Features:</strong>
                                    <p>Structural drawings review, reinforcement coordination, quantity planning, and site checks.</p>
                                </div>
                                <div className="fb-item">
                                    <strong>Benefits:</strong>
                                    <p>Improved site accuracy, reduced rework, and stronger coordination between planning and execution.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-3 services-secondary-grid">
                        <div className="service-card-detailed card hover-tilt scroll-reveal zoom-in" data-tilt>
                            <div className="glowing-border-overlay"></div>
                            <span className="num-tag">03</span>
                            <h4>Construction Solutions</h4>
                            <p>Concrete, masonry, steel support, waterproofing, finishing, repair, and site development work for construction projects.</p>
                            <div className="features-benefits-inline">
                                <strong>Features:</strong> Skilled site teams, material coordination, safety practices, and supervision.<br />
                                <strong>Benefits:</strong> Strong execution quality and predictable project progress.
                            </div>
                        </div>
                        <div className="service-card-detailed card hover-tilt scroll-reveal zoom-in" data-tilt style={{"animationDelay":"0.1s"}}>
                            <div className="glowing-border-overlay"></div>
                            <span className="num-tag">04</span>
                            <h4>Site Quality Services</h4>
                            <p>Construction-stage quality checks, material verification, measurement review, and workmanship inspections.</p>
                            <div className="features-benefits-inline">
                                <strong>Features:</strong> Checklists, measurement sheets, site photos, and progress documentation.<br />
                                <strong>Benefits:</strong> Reduced rework, transparent reporting, and stronger client confidence.
                            </div>
                        </div>
                        <div className="service-card-detailed card hover-tilt scroll-reveal zoom-in" data-tilt style={{"animationDelay":"0.2s"}}>
                            <div className="glowing-border-overlay"></div>
                            <span className="num-tag">05</span>
                            <h4>Construction Support</h4>
                            <p>Our team supports drawing coordination, BOQ preparation, vendor alignment, and practical site execution planning.</p>
                            <div className="features-benefits-inline">
                                <strong>Features:</strong> BOQ support, schedule planning, site coordination, and material advice.<br />
                                <strong>Benefits:</strong> Lower project delays and better cost control.
                            </div>
                        </div>
                        <div className="service-card-detailed card hover-tilt scroll-reveal zoom-in" data-tilt>
                            <div className="glowing-border-overlay"></div>
                            <span className="num-tag">06</span>
                            <h4>Repair & Maintenance</h4>
                            <p>Building repair, renovation, waterproofing, structural strengthening, and maintenance support for existing sites.</p>
                            <div className="features-benefits-inline">
                                <strong>Features:</strong> Site inspection, repair planning, waterproofing, and restoration works.<br />
                                <strong>Benefits:</strong> Longer building life and reduced future maintenance costs.
                            </div>
                        </div>
                        <div className="service-card-detailed card hover-tilt scroll-reveal zoom-in" data-tilt style={{"animationDelay":"0.1s"}}>
                            <div className="glowing-border-overlay"></div>
                            <span className="num-tag">07</span>
                            <h4>Project Consulting</h4>
                            <p>Construction planning, contractor coordination, material sourcing, timeline review, and execution strategy.</p>
                            <div className="features-benefits-inline">
                                <strong>Features:</strong> BOQ review, vendor comparison, procurement planning, and site progress tracking.<br />
                                <strong>Benefits:</strong> Fewer delays, clearer budgets, and smoother project delivery.
                            </div>
                        </div>
                        <div className="service-card-detailed card hover-tilt scroll-reveal zoom-in" data-tilt style={{"animationDelay":"0.2s"}}>
                            <div className="glowing-border-overlay"></div>
                            <span className="num-tag">08</span>
                            <h4>Turnkey Construction</h4>
                            <p>End-to-end construction delivery from planning and materials to execution, finishing, and handover support.</p>
                            <div className="features-benefits-inline">
                                <strong>Features:</strong> Single-point coordination, execution teams, quality checks, and handover support.<br />
                                <strong>Benefits:</strong> A simpler client experience and stronger accountability from start to finish.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="gallery-section section-padding bg-light">
                <div className="container">
                    <div className="section-header text-center scroll-reveal">
                        <span className="section-subtitle">Visual Tour</span>
                        <h2>Construction Project Gallery</h2>
                        <p>Take a look at our project execution, site coordination, structural work, and finishing capabilities.</p>
                    </div>
                    <div className="grid grid-3 gallery-grid">
                        <div className="gallery-item card hover-tilt scroll-reveal zoom-in" data-tilt>
                            <img src="/assets/hero_factory.png" alt="Construction project coordination" />
                            <div className="gallery-overlay">
                                <h5>Project Coordination</h5>
                                <p>Planning, material movement, and site execution in action</p>
                            </div>
                        </div>
                        <div className="gallery-item card hover-tilt scroll-reveal zoom-in" data-tilt style={{"animationDelay":"0.1s"}}>
                            <img src="/assets/precision_part.png" alt="Construction quality inspection" />
                            <div className="gallery-overlay">
                                <h5>Quality Inspection</h5>
                                <p>Checking measurements, finishing, and site workmanship</p>
                            </div>
                        </div>
                        <div className="gallery-item card hover-tilt scroll-reveal zoom-in" data-tilt style={{"animationDelay":"0.2s"}}>
                            <img src="/assets/heavy_machinery.png" alt="Construction equipment and site work" />
                            <div className="gallery-overlay">
                                <h5>Site Equipment Support</h5>
                                <p>Coordinated equipment use for faster construction progress</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </section>

        
        <section id="portfolio" className="page-view">
            
            <section className="page-hero bg-dark">
                <div className="container text-center">
                    <span className="badge animated-badge">Proven Results</span>
                    <h1>Enterprise Portfolio & Success</h1>
                    <p>Explore case studies detailing how we solved construction, site coordination, and project delivery challenges.</p>
                </div>
            </section>

            
            <section className="projects-section section-padding">
                <div className="container">
                    
                    
                    <div className="project-block card grid grid-2 scroll-reveal zoom-in">
                        <div className="project-image hover-zoom-img">
                            <img src="/assets/automotive_assembly.png" alt="Commercial construction execution" />
                        </div>
                        <div className="project-details">
                            <span className="badge badge-accent animated-badge">Case Study: Commercial</span>
                            <h3>Commercial Building Execution</h3>
                            <p><strong>Description:</strong> Coordinated civil work, material planning, and finishing support for a multi-floor commercial project.</p>
                            <div className="challenge-solution">
                                <div className="cs-block">
                                    <strong>Challenge:</strong>
                                    <p>Maintaining schedule discipline while coordinating multiple vendors, materials, and quality checkpoints.</p>
                                </div>
                                <div className="cs-block">
                                    <strong>Solution:</strong>
                                    <p>We created a phased work plan, aligned material delivery, and maintained daily site reporting for faster decisions.</p>
                                </div>
                                <div className="cs-block">
                                    <strong>Outcome:</strong>
                                    <p>Reduced delays, improved vendor coordination, and completed priority work packages on schedule.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div className="project-block card grid grid-2 reverse scroll-reveal zoom-in">
                        <div className="project-image hover-zoom-img">
                            <img src="/assets/heavy_machinery.png" alt="Infrastructure construction site" />
                        </div>
                        <div className="project-details">
                            <span className="badge badge-accent animated-badge">Case Study: Infrastructure</span>
                            <h3>Site Development Work</h3>
                            <p><strong>Description:</strong> Earthwork, base preparation, structural support, and site coordination for an infrastructure project.</p>
                            <div className="challenge-solution">
                                <div className="cs-block">
                                    <strong>Challenge:</strong>
                                    <p>Site conditions required careful sequencing, material handling, and continuous supervision to avoid delays.</p>
                                </div>
                                <div className="cs-block">
                                    <strong>Solution:</strong>
                                    <p>Used a staged execution plan with quality checkpoints, vendor scheduling, and daily progress review.</p>
                                </div>
                                <div className="cs-block">
                                    <strong>Outcome:</strong>
                                    <p>Completed critical site packages with improved coordination and reduced rework.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div className="project-block card grid grid-2 scroll-reveal zoom-in">
                        <div className="project-image hover-zoom-img">
                            <img src="/assets/precision_part.png" alt="Structural planning and site detailing" />
                        </div>
                        <div className="project-details">
                            <span className="badge badge-accent animated-badge">Case Study: Residential</span>
                            <h3>Residential Structural Support</h3>
                            <p><strong>Description:</strong> Structural coordination, BOQ support, and execution guidance for a residential construction project.</p>
                            <div className="challenge-solution">
                                <div className="cs-block">
                                    <strong>Challenge:</strong>
                                    <p>Balancing client design expectations, structural requirements, and controlled project cost.</p>
                                </div>
                                <div className="cs-block">
                                    <strong>Solution:</strong>
                                    <p>We reviewed drawings, aligned quantities, coordinated materials, and supported practical site decisions.</p>
                                </div>
                                <div className="cs-block">
                                    <strong>Outcome:</strong>
                                    <p>Improved site clarity, reduced material confusion, and helped keep execution within planned budget.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div className="project-block card grid grid-2 reverse scroll-reveal zoom-in">
                        <div className="project-image hover-zoom-img">
                            <img src="/assets/hero_factory.png" alt="Turnkey construction project" />
                        </div>
                        <div className="project-details">
                            <span className="badge badge-accent animated-badge">Case Study: Infrastructure</span>
                            <h3>Turnkey Construction Project</h3>
                            <p><strong>Description:</strong> End-to-end construction coordination for structural work, finishing, vendor management, and handover support.</p>
                            <div className="challenge-solution">
                                <div className="cs-block">
                                    <strong>Challenge:</strong>
                                    <p>The client needed one accountable team to manage timeline, materials, quality, and finishing details.</p>
                                </div>
                                <div className="cs-block">
                                    <strong>Solution:</strong>
                                    <p>We managed phased construction, site teams, procurement coordination, and quality checks through handover.</p>
                                </div>
                                <div className="cs-block">
                                    <strong>Outcome:</strong>
                                    <p>Modular construction joints assembled perfectly on-site with zero alignment issues, cutting construction time by two weeks.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            
            <section className="metrics-section section-padding bg-dark text-center">
                <div className="container">
                    <span className="badge animated-badge">Business Impact</span>
                    <h2>Key Operational Achievements</h2>
                    <p className="lead">How our construction solutions translate into better project delivery for our clients.</p>
                    
                    <div className="grid grid-3 metrics-grid">
                        <div className="metric-card scroll-reveal zoom-in">
                            <div className="metric-val pulse-effect">15%</div>
                            <div className="metric-lbl">Average Component Weight Reduction</div>
                        </div>
                        <div className="metric-card scroll-reveal zoom-in" style={{"animationDelay":"0.15s"}}>
                            <div className="metric-val pulse-effect">99.8%</div>
                            <div className="metric-lbl">First-Pass QA Inspection Yield Rate</div>
                        </div>
                        <div className="metric-card scroll-reveal zoom-in" style={{"animationDelay":"0.3s"}}>
                            <div className="metric-val pulse-effect">14 Days</div>
                            <div className="metric-lbl">Average Tooling Lead-Time Saved</div>
                        </div>
                    </div>
                </div>
            </section>
        </section>

        
        <section id="contact" className="page-view">
            
            <section className="page-hero bg-dark">
                <div className="container text-center">
                    <span className="badge animated-badge">Get In Touch</span>
                    <h1>Contact Fusion Services</h1>
                    <p>Discuss your construction drawings, BOQ, site visit, repair work, or turnkey project requirement.</p>
                </div>
            </section>

            
            <section className="contact-details-section section-padding">
                <div className="container grid grid-2">
                    
                    <div className="contact-form-wrapper card">
                        <h3>Submit Project Requirements</h3>
                        <p className="form-desc">Fill out our corporate request form. Our engineering division will review your details and respond within 24 hours.</p>
                        
                        <form id="rfq-form" novalidate>
                            <div className="form-group floating-group">
                                <input type="text" id="company_name" name="company_name" required placeholder=" " />
                                <label htmlFor="company_name">Company Name *</label>
                                <span className="error-msg" id="err-company_name">Company name is required</span>
                            </div>

                            <div className="form-group floating-group">
                                <input type="text" id="contact_person" name="contact_person" required placeholder=" " />
                                <label htmlFor="contact_person">Contact Person *</label>
                                <span className="error-msg" id="err-contact_person">Contact name is required</span>
                            </div>

                            <div className="form-group grid grid-2" style={{"gap":"1.5rem","marginBottom":"0"}}>
                                <div className="form-group floating-group">
                                    <input type="email" id="contact_email" name="contact_email" required placeholder=" " />
                                    <label htmlFor="contact_email">Email Address *</label>
                                    <span className="error-msg" id="err-contact_email">Enter a valid email</span>
                                </div>
                                <div className="form-group floating-group">
                                    <input type="tel" id="contact_phone" name="contact_phone" required placeholder=" " />
                                    <label htmlFor="contact_phone">Phone Number *</label>
                                    <span className="error-msg" id="err-contact_phone">Phone is required</span>
                                </div>
                            </div>

                            <div className="form-group select-group">
                                <label className="select-label" htmlFor="requirement_type">Requirement Type *</label>
                                <select id="requirement_type" name="requirement_type" required>
                                    <option value="" disabled selected>Select an option...</option>
                                    <option value="civil_construction">Civil Construction</option>
                                    <option value="structural_work">Structural Work</option>
                                    <option value="turnkey_project">Turnkey Project</option>
                                    <option value="engineering_consulting">Technical Consulting</option>
                                    <option value="other">Other Inquiry</option>
                                </select>
                                <span className="error-msg" id="err-requirement_type">Please select a requirement type</span>
                            </div>

                            <div className="form-group floating-group" style={{"marginTop":"1.5rem"}}>
                                <textarea id="message" name="message" rows="4" required placeholder=" "></textarea>
                                <label htmlFor="message">Detailed Requirements / Specifications *</label>
                                <span className="error-msg" id="err-message">Message details are required</span>
                            </div>

                            
                            <button type="submit" className="btn btn-primary btn-block btn-submit-effect" id="btn-submit-rfq">
                                <span className="btn-text">Submit RFQ / Inquiry &rarr;</span>
                                <span className="btn-spinner"></span>
                            </button>
                        </form>
                        
                        
                        <div className="form-success-card" id="form-success-alert">
                            <div className="success-icon success-pop-anim">
                                <svg viewBox="0 0 52 52" className="checkmark-svg">
                                    <circle cx="26" cy="26" r="25" fill="none" className="checkmark-circle"/>
                                    <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="checkmark-check"/>
                                </svg>
                            </div>
                            <h4>Inquiry Successfully Logged!</h4>
                            <p>Thank you. Your request has been forwarded to our engineering team. We will review your requirements and get back to you within 24 hours.</p>
                            <button className="btn btn-secondary floating-btn" type="button" id="btn-reset-form">Submit Another Request</button>
                        </div>
                    </div>

                    
                    <div className="contact-info-wrapper">
                        <div className="info-card card scroll-reveal slide-in-right">
                            <h4>Corporate Headquarters</h4>
                            <div className="info-item">
                                <svg className="info-svg pulse-effect" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                <div>
                                    <h5>Address</h5>
                                    <p>J-5, Park Street,<br />Mayur Vihar –II, Delhi -110091</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <svg className="info-svg pulse-effect" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                <div>
                                    <h5>Phone & Support</h5>
                                    <p>Call: 011- 49851127<br />Mobile: +91 9289421832</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <svg className="info-svg pulse-effect" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                <div>
                                    <h5>Email Coordinates</h5>
                                    <p>Email: info@fusionservices.co.in<br />Support: info@fusionservices.co.in</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <svg className="info-svg pulse-effect" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                <div>
                                    <h5>Working Hours</h5>
                                    <p>Production Line: 24/7 Shift Work<br />Corporate Offices: Mon - Fri: 8:00 AM - 6:00 PM EST</p>
                                </div>
                            </div>
                        </div>

                        
                        <div className="map-placeholder-card card scroll-reveal slide-in-right" id="map-interactive-card">
                            <h4>Facility Location</h4>
                            <div className="mock-map-visual">
                                <svg className="map-svg" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" id="map-hover-sensor">
                                    
                                    <defs>
                                        <pattern id="grid-interactive" width="20" height="20" patternUnits="userSpaceOnUse">
                                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(96, 114, 140, 0.15)" strokeWidth="1"/>
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid-interactive)" />
                                    
                                    <path d="M 0 60 L 400 60 M 0 140 L 400 140 M 120 0 L 120 200 M 280 0 L 280 200" stroke="#cbd5e1" strokeWidth="16" fill="none" strokeLinecap="square"/>
                                    
                                    <text x="140" y="25" fill="#94a3b8" fontSize="8" fontFamily="Inter" letterSpacing="1">METRO BLVD</text>
                                    <text x="290" y="180" fill="#94a3b8" fontSize="8" fontFamily="Inter" letterSpacing="1">EAST ACCESS RD</text>
                                    <text x="10" y="50" fill="#94a3b8" fontSize="8" fontFamily="Inter" letterSpacing="1">INDUSTRIAL PARKWAY</text>
                                    
                                    <rect x="20" y="10" width="80" height="40" rx="4" fill="#e2e8f0" className="map-plot" />
                                    <rect x="140" y="80" width="120" height="40" rx="4" fill="#cbd5e1" className="map-plot" />
                                    <rect x="20" y="80" width="80" height="40" rx="4" fill="#e2e8f0" className="map-plot" />
                                    
                                    <rect x="140" y="10" width="120" height="40" rx="4" fill="#0f2042" stroke="#ff6b35" strokeWidth="2" className="map-plot highlight-plot"/>
                                    <text x="150" y="34" fill="#ffffff" fontSize="10" fontFamily="Outfit" fontWeight="bold">Fusion Services HQ</text>
                                    
                                    <g transform="translate(200, 30)" className="map-pin-group">
                                        <circle cx="0" cy="0" r="10" fill="rgba(255, 107, 53, 0.4)" className="ping-pulse" />
                                        <circle cx="0" cy="0" r="6" fill="#ff6b35" />
                                        <circle cx="0" cy="0" r="3" fill="#ffffff" />
                                    </g>
                                </svg>
                            </div>
                            <span className="map-coordinates">GPS Coordinates: 42.8942&deg; N, -78.4901&deg; W</span>
                        </div>
                    </div>
                </div>
            </section>
        </section>

    </main>

    
    <footer className="main-footer">
        <div className="container footer-grid">
            <div className="footer-brand-column">
                <a href="#home" className="footer-logo" onclick="navigateToPage('home')">
                    <span className="logo-accent">FUSION</span>SERVICES
                </a>
                <p className="footer-desc">Civil construction, structural support, repair, renovation, waterproofing, finishing, and professional project consulting services.</p>
                <div className="social-icons">
                    <a href="#" aria-label="LinkedIn" className="social-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                    <a href="#" aria-label="Twitter" className="social-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                    </a>
                    <a href="#" aria-label="YouTube" className="social-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                    </a>
                </div>
            </div>

            <div className="footer-links-column">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="#home" onclick="navigateToPage('home')">Home Overview</a></li>
                    <li><a href="#about" onclick="navigateToPage('about')">About Company</a></li>
                    <li><a href="#services" onclick="navigateToPage('services')">Our Capabilities</a></li>
                    <li><a href="#portfolio" onclick="navigateToPage('portfolio')">Case Studies</a></li>
                    <li><a href="#contact" onclick="navigateToPage('contact')">Get a Quote</a></li>
                </ul>
            </div>

            <div className="footer-links-column">
                <h4>Capabilities</h4>
                <ul>
                    <li><a href="#services" onclick="navigateToPage('services')">Civil Construction</a></li>
                    <li><a href="#services" onclick="navigateToPage('services')">Structural Work</a></li>
                    <li><a href="#services" onclick="navigateToPage('services')">CMM Quality Audits</a></li>
                    <li><a href="#services" onclick="navigateToPage('services')">Design For Assembly (DFM)</a></li>
                    <li><a href="#services" onclick="navigateToPage('services')">Custom Automation Tools</a></li>
                </ul>
            </div>

            <div className="footer-contact-column">
                <h4>Contact Details</h4>
                <p><strong>Address:</strong> J-5, Park Street, Mayur Vihar –II, Delhi -110091</p>
                <p><strong>Inquiry Line:</strong> 011- 49851127 / +91 9289421832</p>
                <p><strong>General Mail:</strong> info@fusionservices.co.in</p>
                <p><strong>Core Hours:</strong> Mon - Fri, 8:00 AM - 6:00 PM</p>
            </div>
        </div>
        
        <div className="footer-bottom">
            <div className="container footer-bottom-container">
                <p>&copy; 2026 Fusion Services. All rights reserved. Construction and project solutions.</p>
                <div className="footer-legal-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms & Conditions</a>
                    <a href="#">Sitemap</a>
                </div>
            </div>
        </div>
    </footer>

    
    
    <a 
      href="https://wa.me/919289421832" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white rounded-full p-3 shadow-lg hover:bg-green-600 hover:scale-110 transition-all z-50 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
      </svg>
    </a>
    </div>
  );
};

export default Home;
