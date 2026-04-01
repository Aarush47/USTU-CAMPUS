import { useEffect, useState } from "react";
import { Link } from "react-router";
import "../../styles/landing.css";

const featureRows = [
  {
    audience: "Students",
    text: "Track canteen orders, class schedules, and announcements in one tap.",
  },
  {
    audience: "Teachers",
    text: "Manage attendance, share materials, and communicate effortlessly.",
  },
  {
    audience: "Canteen Staff",
    text: "Handle orders, update menus, and monitor daily flow with ease.",
  },
  {
    audience: "Admins",
    text: "Full campus oversight - reports, users, and operations, all in one dashboard.",
  },
];

const testimonials = [
  {
    quote: "Everything I need is in one place. No more switching between apps for classes and campus updates.",
    name: "Aarav Mehta",
    role: "Student",
  },
  {
    quote: "Attendance, notices, and learning materials now move with the rhythm of teaching, not against it.",
    name: "Dr. Nisha Rao",
    role: "Teacher",
  },
  {
    quote: "Ustu Campus gave us visibility across operations with control that finally feels effortless.",
    name: "Priya Sharma",
    role: "Administrator",
  },
];

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";

    const onScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    nodes.forEach((node) => observer.observe(node));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

  return (
    <div className="ustu-landing">
      <header className={`landing-nav ${isScrolled ? "scrolled" : ""}`}>
        <div className="landing-wrap nav-inner">
          <a href="#top" className="brand-mark" aria-label="Ustu Campus home">
            <span className="brand-dot" />
            Ustu Campus
          </a>
          <nav aria-label="Primary" className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Testimonials</a>
            <Link to="/sign-in" className="login-link">
              Login
            </Link>
            <Link to="/sign-up" className="nav-cta">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero reveal in-view">
          <div className="hero-word" aria-hidden="true">CAMPUS</div>
          <div className="landing-wrap hero-content">
            <h1>
              <span>The Campus.</span>
              <span>Finally,</span>
              <span>One Place.</span>
            </h1>
            <p>
              Ustu Campus connects students, teachers, canteen, and administration into one
              seamless experience.
            </p>
            <div className="hero-actions">
              <Link to="/sign-up" className="cta-dark">
                Get Started
              </Link>
              <a href="#how-it-works" className="cta-link">
                See How It Works <span aria-hidden="true">&#8594;</span>
              </a>
            </div>
            <div className="role-badges" aria-label="Platform roles">
              <span>Student</span>
              <span>Teacher</span>
              <span>Canteen</span>
              <span>Admin</span>
            </div>
          </div>
        </section>

        <section className="stats-strip reveal">
          <div className="landing-wrap stats-grid">
            <div>
              <h2>10,000+</h2>
              <p>Students</p>
            </div>
            <div>
              <h2>500+</h2>
              <p>Faculty</p>
            </div>
            <div>
              <h2>4</h2>
              <p>Modules</p>
            </div>
            <div>
              <h2>1</h2>
              <p>Platform</p>
            </div>
          </div>
        </section>

        <section id="features" className="features reveal">
          <div className="landing-wrap">
            <h2 className="section-title">Everything your campus needs.</h2>
            <div className="feature-list">
              {featureRows.map((feature, index) => {
                const flipped = index % 2 === 1;
                return (
                  <article key={feature.audience} className={`feature-row ${flipped ? "flip" : ""}`}>
                    <div className="feature-copy">
                      <h3>{feature.audience}</h3>
                      <p>{feature.text}</p>
                    </div>
                    <div className="feature-visual" aria-hidden="true">
                      <div className="line-box">
                        <span>{feature.audience.toUpperCase()}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works reveal">
          <div className="landing-wrap">
            <h2 className="section-title center">Up and running in minutes.</h2>
            <div className="steps-row">
              <div className="step-item">
                <span className="step-bg">01</span>
                <h3>Your institution registers</h3>
              </div>
              <div className="step-link" aria-hidden="true" />
              <div className="step-item">
                <span className="step-bg">02</span>
                <h3>Roles are assigned</h3>
              </div>
              <div className="step-link" aria-hidden="true" />
              <div className="step-item">
                <span className="step-bg">03</span>
                <h3>Everyone&apos;s connected</h3>
              </div>
            </div>
            <div className="center-action">
              <Link to="/sign-up" className="cta-link strong">
                Request Access <span aria-hidden="true">&#8594;</span>
              </Link>
            </div>
          </div>
        </section>

        <section id="testimonials" className="testimonials reveal">
          <div className="landing-wrap">
            <h2 className="section-title">Trusted across campus.</h2>
            <div className="testimonials-row">
              {testimonials.map((item) => (
                <blockquote key={item.name}>
                  <p>&ldquo;{item.quote}&rdquo;</p>
                  <footer>
                    <span>{item.name}</span>
                    <small>{item.role}</small>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="full-cta reveal">
          <div className="landing-wrap cta-wrap">
            <h2>One platform. Every corner of campus.</h2>
            <Link to="/sign-up" className="cta-light">
              Get Started Today
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-wrap footer-grid">
          <div>
            <h3 className="brand-mark footer-brand">
              <span className="brand-dot" />
              Ustu Campus
            </h3>
            <p>Campus operations, streamlined for every role.</p>
          </div>
          <div>
            <h4>Links</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#top">Contact</a>
          </div>
          <div>
            <h4>Roles</h4>
            <a href="#top">Students</a>
            <a href="#top">Teachers</a>
            <a href="#top">Canteen</a>
            <a href="#top">Admins</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
          </div>
        </div>
        <div className="footer-bottom">© 2025 Ustu Campus. All rights reserved.</div>
      </footer>
    </div>
  );
}
