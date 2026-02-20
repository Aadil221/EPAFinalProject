import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <div className="hero-badge">
        <span className="badge-icon">🎯</span>
        <span>AI-Powered Interview Mastery</span>
      </div>

      <h1 className="hero-title">
        <span className="title-gradient">SkillScout</span>
      </h1>

      <p className="hero-subtitle">
        Master technical interviews with intelligent question practice
        <br />
        and real-time AI feedback from Marcus
      </p>

      <div className="hero-features">
        <div className="feature">
          <span className="feature-icon">💡</span>
          <span>199+ Curated Questions</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🤖</span>
          <span>AI-Powered Evaluation</span>
        </div>
        <div className="feature">
          <span className="feature-icon">📈</span>
          <span>Track Your Progress</span>
        </div>
      </div>

      <div className="home-actions">
        <Link to="/questions" className="btn btn-primary">
          <span>Explore Questions</span>
          <span className="btn-icon">→</span>
        </Link>
        <Link to="/login" className="btn btn-secondary">
          <span>Get Started</span>
        </Link>
      </div>

      <div className="hero-stats">
        <div className="stat">
          <div className="stat-value">199+</div>
          <div className="stat-label">Interview Questions</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat">
          <div className="stat-value">AI</div>
          <div className="stat-label">Instant Feedback</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat">
          <div className="stat-value">100%</div>
          <div className="stat-label">Free to Use</div>
        </div>
      </div>
    </div>
  );
}
