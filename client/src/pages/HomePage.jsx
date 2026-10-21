import { Link } from 'react-router-dom';

const HomePage = () => {
  const features = [
    { icon: '🔍', title: 'Smart Search', desc: 'Filter by location, type, budget and more with our intelligent search system.' },
    { icon: '🗺️', title: 'Map View', desc: 'Explore properties on an interactive map to find the perfect neighborhood.' },
    { icon: '📅', title: 'Easy Booking', desc: 'Schedule property visits online with instant confirmation.' },
    { icon: '🏆', title: 'Verified Agents', desc: 'Connect with trusted, verified real estate agents in your area.' },
  ];

  const stats = [
    { value: '10K+', label: 'Properties Listed' },
    { value: '5K+', label: 'Happy Clients' },
    { value: '500+', label: 'Expert Agents' },
    { value: '50+', label: 'Cities Covered' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        minHeight: '88vh',
        display: 'flex', alignItems: 'center',
        padding: '60px 24px',
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(108,99,255,0.2) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(255,101,132,0.12) 0%, transparent 40%),
          radial-gradient(ellipse at 60% 80%, rgba(67,217,173,0.08) 0%, transparent 40%)
        `,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '10%', right: '8%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '20%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,101,132,0.05)', border: '1px solid rgba(255,101,132,0.1)' }} />

        <div className="container">
          <div style={{ maxWidth: 680 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: 50, padding: '6px 16px', marginBottom: 28,
              fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500
            }}>
              🏆 India's #1 Real Estate Platform
            </div>

            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 24 }}>
              Find Your{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light), var(--secondary))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                Dream Home
              </span>{' '}
              With Confidence
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 520, lineHeight: 1.7 }}>
              Discover thousands of verified properties across India. Buy, rent, or sell with ease using our powerful search and trusted agents.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/properties" className="btn btn-primary" style={{ fontSize: '1rem', padding: '15px 36px' }}>
                🔍 Explore Properties
              </Link>
              <Link to="/agents" className="btn btn-outline" style={{ fontSize: '1rem', padding: '15px 36px' }}>
                Meet Our Agents
              </Link>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 40, marginTop: 56, flexWrap: 'wrap' }}>
              {stats.map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {s.value}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 24px', background: 'rgba(19,19,42,0.5)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: 12 }}>Why Choose PropEstate?</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
              Everything you need to find, book, and secure your perfect property in one place.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ marginBottom: 8, fontSize: '1.1rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 24px' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,101,132,0.1))',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            padding: '60px 48px', textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>Ready to Find Your Home?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              Join over 5,000 happy customers who found their dream property with PropEstate.
            </p>
            <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '15px 36px' }}>
              🚀 Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        © 2025 PropEstate. Built with ❤️ using MERN Stack.
      </footer>
    </div>
  );
};

export default HomePage;
