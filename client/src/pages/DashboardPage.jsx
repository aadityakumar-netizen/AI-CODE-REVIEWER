import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getReviews } from '../services/reviewService';
import './DashboardPage.css';

const categories = ['correctness', 'security', 'performance', 'maintainability', 'quality'];

function DashboardPage() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getReviews().then((res) => { setReviews(res.data || []); setStatus('ready'); }).catch(() => setStatus('error'));
  }, []);

  const stats = useMemo(() => {
    const scores = reviews.map((r) => Number(r.score)).filter(Number.isFinite);
    const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const issueCount = reviews.reduce((n, r) => n + (r.issues?.length || 0), 0);
    const strong = reviews.filter((r) => Number(r.score) >= 80).length;
    const best = scores.length ? Math.max(...scores) : 0;
    return { total: reviews.length, average, issueCount, strong, best };
  }, [reviews]);

  const languageData = useMemo(() => {
    const map = {};
    reviews.forEach((r) => { map[r.language] = (map[r.language] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reviews]);

  const issueData = useMemo(() => {
    const map = {};
    reviews.forEach((r) => (r.issues || []).forEach((i) => { map[i.type || 'other'] = (map[i.type || 'other'] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [reviews]);

  const categoryAverage = useMemo(() => {
    const out = {};
    categories.forEach((key) => {
      const values = reviews.map((r) => Number(r.scoreBreakdown?.[key])).filter(Number.isFinite);
      out[key] = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    });
    return out;
  }, [reviews]);

  return <div className="dashboard-page">
    <header className="dashboard-header">
      <div><p className="dashboard-eyebrow">Developer workspace</p><h1>Code Review Dashboard</h1><p className="dashboard-subtitle">A quick view of your code quality, review activity and recurring issues.</p></div>
      <div className="dashboard-actions"><Link className="dashboard-secondary-button" to="/github">Review GitHub</Link><Link className="dashboard-primary-button" to="/">+ New Review</Link></div>
    </header>

    {status === 'loading' && <div className="dashboard-state">Loading dashboard…</div>}
    {status === 'error' && <div className="dashboard-state dashboard-error">Could not load dashboard data.</div>}
    {status === 'ready' && <>
      <section className="dashboard-stats">
        <Stat label="Total Reviews" value={stats.total} note="All-time" />
        <Stat label="Average Score" value={`${stats.average}/100`} note="Across reviews" />
        <Stat label="Best Score" value={`${stats.best}/100`} note="Personal best" />
        <Stat label="Issues Found" value={stats.issueCount} note={`${stats.strong} strong reviews`} />
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card category-card"><div className="card-heading"><div><h2>Quality overview</h2><p>Average score by review category.</p></div></div>
          {categories.map((key) => <div className="metric-row" key={key}><div className="metric-label"><span>{key === 'quality' ? 'Code Quality' : key[0].toUpperCase() + key.slice(1)}</span><strong>{categoryAverage[key]}</strong></div><div className="metric-track"><span style={{ width: `${categoryAverage[key]}%` }} /></div></div>)}
        </div>
        <div className="dashboard-card"><div className="card-heading"><div><h2>Languages</h2><p>What you review most.</p></div></div>
          {languageData.length ? languageData.map(([name, count]) => <div className="breakdown-row" key={name}><span>{name}</span><strong>{count}</strong></div>) : <Empty text="Run a review to see language insights." />}
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card"><div className="card-heading"><div><h2>Common issues</h2><p>Most frequent findings in your reviews.</p></div></div>
          {issueData.length ? issueData.map(([name, count]) => <div className="breakdown-row" key={name}><span>{name}</span><strong>{count}</strong></div>) : <Empty text="No issues recorded yet." />}
        </div>
        <div className="dashboard-card"><div className="card-heading"><div><h2>Recent reviews</h2><p>Your latest analysis results.</p></div><Link to="/history">View all →</Link></div>
          {reviews.slice(0, 5).map((r) => <Link className="recent-row" to={`/history?review=${r._id}`} key={r._id}><span><b>{r.language}</b><small>{new Date(r.createdAt).toLocaleDateString()}</small></span><strong>{r.score}/100</strong></Link>)}
          {!reviews.length && <Empty text="No reviews yet. Start with a code snippet." />}
        </div>
      </section>
    </>}
  </div>;
}

function Stat({ label, value, note }) { return <div className="stat-card"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>; }
function Empty({ text }) { return <p className="dashboard-empty-text">{text}</p>; }
export default DashboardPage;
