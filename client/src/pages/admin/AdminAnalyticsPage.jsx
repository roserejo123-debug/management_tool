import { useEffect, useState } from 'react';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import API from '../../utils/axiosInstance';

const metricLabels = {
  users: 'Registered users',
  agents: 'Agents',
  properties: 'Property listings',
  pendingProperties: 'Awaiting approval',
  bookings: 'Visit bookings',
  enquiries: 'Enquiries',
  reviews: 'Property reviews',
};

const csvValue = (value) => {
  const text = String(value ?? '');
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
};

const AdminAnalyticsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    API.get('/dashboard/summary', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setReport(data);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError.response?.data?.message || 'Unable to load platform analytics.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const downloadSpreadsheet = () => {
    if (!report) return;
    const summaryRows = Object.entries(metricLabels).map(([key, label]) => [label, report.summary[key] || 0]);
    const listingRows = (report.recentProperties || []).map((property) => [
      property.title,
      property.agent?.name || '',
      property.location?.city || '',
      property.location?.state || '',
      property.type,
      property.listingType,
      property.status,
      property.isApproved ? 'Approved' : 'Awaiting approval',
      property.price,
      property.views,
      new Date(property.createdAt).toISOString(),
    ]);
    const rows = [
      ['Platform Analytics Report', new Date().toLocaleString()],
      [],
      ['Metric', 'Count'],
      ...summaryRows,
      [],
      ['Recent Listings'],
      ['Title', 'Agent', 'City', 'State', 'Type', 'Listing', 'Status', 'Approval', 'Price', 'Views', 'Created'],
      ...listingRows,
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvValue).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `propestate-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <main className="property-page admin-report-page">
      <header className="property-page-header">
        <p className="property-eyebrow">Administration</p>
        <h1>Platform analytics</h1>
        <p>Current platform totals, listing pipeline, booking activity, and recent submissions.</p>
      </header>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {loading ? (
        <div className="property-page-loading"><span className="spinner" /></div>
      ) : report ? (
        <>
          <div className="report-actions">
            <button className="btn btn-outline" onClick={downloadSpreadsheet}><FiDownload /> Download Excel-compatible CSV</button>
            <button className="btn btn-primary" onClick={() => window.print()}><FiPrinter /> Print / Save as PDF</button>
          </div>
          <section className="stats-grid report-metrics">
            {Object.entries(metricLabels).map(([key, label]) => (
              <article className="stat-card" key={key}>
                <div className="stat-value">{report.summary[key] ?? 0}</div>
                <div className="stat-label">{label}</div>
              </article>
            ))}
          </section>

          <div className="report-columns">
            <section className="card report-status-card">
              <h2>Listing status</h2>
              {Object.entries(report.summary.listingStatuses || {}).length
                ? Object.entries(report.summary.listingStatuses).map(([status, count]) => (
                  <div className="report-status-row" key={status}>
                    <span>{status}</span><strong>{count}</strong>
                  </div>
                ))
                : <p>No listings have been submitted yet.</p>}
            </section>
            <section className="card report-status-card">
              <h2>Booking status</h2>
              {Object.entries(report.summary.bookingStatuses || {}).length
                ? Object.entries(report.summary.bookingStatuses).map(([status, count]) => (
                  <div className="report-status-row" key={status}>
                    <span>{status}</span><strong>{count}</strong>
                  </div>
                ))
                : <p>No visit bookings yet.</p>}
            </section>
          </div>

          <section className="card recent-listings-card">
            <h2>Recent property submissions</h2>
            {report.recentProperties?.length ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Listing</th><th>Agent</th><th>Location</th><th>Price</th><th>Views</th><th>Approval</th></tr></thead>
                  <tbody>
                    {report.recentProperties.map((property) => (
                      <tr key={property._id}>
                        <td>{property.title}</td>
                        <td>{property.agent?.name || 'Unknown'}</td>
                        <td>{property.location?.city}, {property.location?.state}</td>
                        <td>₹{Number(property.price).toLocaleString('en-IN')}</td>
                        <td>{property.views || 0}</td>
                        <td>{property.isApproved ? 'Approved' : property.status === 'rejected' ? 'Rejected' : 'Pending'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p>No property submissions yet.</p>}
          </section>
        </>
      ) : null}
    </main>
  );
};

export default AdminAnalyticsPage;
