import React, { useMemo, useState } from 'react';
import './Reports.css';

// Helper: format date as YYYY-MM-DD
const fmt = (d) => d.toISOString().slice(0, 10);

// Generate dummy financial rows for a month range
function generateFinancialData(startDate, endDate) {
  const rows = [];
  const s = new Date(startDate);
  const e = new Date(endDate);
  // create monthly buckets between s and e
  const cur = new Date(s.getFullYear(), s.getMonth(), 1);
  while (cur <= e) {
    const monthLabel = cur.toLocaleString(undefined, { month: 'short', year: 'numeric' });
    // dummy numbers
    const deposits = Math.round(50000 + Math.random() * 150000);
    const loans = Math.round(20000 + Math.random() * 120000);
    const interest = Math.round(loans * (0.02 + Math.random() * 0.06));
    const expenses = Math.round(5000 + Math.random() * 30000);
    const net = deposits - loans + interest - expenses;
    rows.push({ period: monthLabel, deposits, loans, interest, expenses, net });
    cur.setMonth(cur.getMonth() + 1);
  }
  return rows;
}

// Generate dummy member rows for a date range
function generateMemberData(startDate, endDate) {
  const rows = [];
  const s = new Date(startDate);
  const e = new Date(endDate);
  const totalDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  const count = Math.min(40, Math.max(6, Math.round(totalDays / 7)));
  for (let i = 0; i < count; i++) {
    const join = new Date(s.getTime() + Math.random() * (e - s));
    rows.push({
      id: `M-${1000 + i}`,
      name: `Member ${i + 1}`,
      joined: fmt(join),
      shares: Math.round(1 + Math.random() * 50),
      contribution: Math.round(1000 + Math.random() * 40000),
    });
  }
  // sort by joined
  rows.sort((a, b) => (a.joined > b.joined ? 1 : -1));
  return rows;
}

const Reports = () => {
  const [reportType, setReportType] = useState('financial');
  const [preset, setPreset] = useState('last_month');
  const [from, setFrom] = useState(() => fmt(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)));
  const [to, setTo] = useState(() => fmt(new Date()));
  const [data, setData] = useState(null);
  const [orgName, setOrgName] = useState('SLZCoop');
  const [reportTitle, setReportTitle] = useState('SLZCoop');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState(null);

  // compute from/to when preset changes
  const applyPreset = (p) => {
    const now = new Date();
    let s, e;
    if (p === 'this_month') {
      s = new Date(now.getFullYear(), now.getMonth(), 1);
      e = now;
    } else if (p === 'last_month') {
      s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      e = new Date(now.getFullYear(), now.getMonth(), 0); // end of last month
    } else if (p === 'last_3_months') {
      s = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      e = now;
    } else if (p === 'ytd') {
      s = new Date(now.getFullYear(), 0, 1);
      e = now;
    } else {
      s = new Date();
      e = new Date();
    }
    setFrom(fmt(s));
    setTo(fmt(e));
    setPreset(p);
  };

  const handleGenerate = () => {
    if (!from || !to) return;
    if (new Date(from) > new Date(to)) {
      alert('Invalid range: from must be <= to');
      return;
    }
    if (reportType === 'financial') {
      setData({ headers: ['Period', 'Deposits', 'Loans', 'Interest', 'Expenses', 'Net'], rows: generateFinancialData(from, to) });
    } else {
      setData({ headers: ['ID', 'Name', 'Joined', 'Shares', 'Contribution'], rows: generateMemberData(from, to) });
    }
  };

  const [generating, setGenerating] = useState(false);

  const loadScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.body.appendChild(s);
  });

  const downloadPDF = async () => {
    if (!data) return;
    try {
      setGenerating(true);
      // load jsPDF UMD from CDN if not present
      if (!window.jspdf) {
        await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
      }
      const jsPDF = window.jspdf ? window.jspdf.jsPDF : null;
      if (!jsPDF) throw new Error('jsPDF not available');

      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const margin = 40;
      let y = 60;
      // Header: optional logo, org name, title, generated timestamp
      const pageWidth = doc.internal.pageSize.getWidth();
      const rightX = pageWidth - margin;

      // prefer in-memory uploaded logo; fallback to logoUrl
      let finalLogo = logoDataUrl || null;
      if (!finalLogo && logoUrl) {
        try {
          const res = await fetch(logoUrl);
          const blob = await res.blob();
          finalLogo = await new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.onerror = reject;
            fr.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn('Failed to load logo URL for PDF header', e);
          finalLogo = null;
        }
      }

      // draw logo left if available and reserve content start X
      const logoW = 56;
      const logoH = 56;
      if (finalLogo) {
        try {
          // try PNG first
          doc.addImage(finalLogo, 'PNG', margin, 36, logoW, logoH);
        } catch (e) {
          try {
            doc.addImage(finalLogo, 'JPEG', margin, 36, logoW, logoH);
          } catch (er) {
            console.warn('addImage failed for logo', er);
          }
        }
      }
      const contentStartX = finalLogo ? margin + logoW + 12 : margin;

      // header text
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const titleText = reportTitle || (reportType === 'financial' ? 'Financial Report' : 'Member Report');
      const titleWidth = doc.getTextWidth(titleText);
      doc.text(titleText, (pageWidth - titleWidth) / 2, y);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const generatedText = `Generated: ${new Date().toLocaleString()}`;
      const genWidth = doc.getTextWidth(generatedText);
      doc.text(generatedText, rightX - genWidth, y);

      // leave more vertical space after header
      y += 28;

      // Prepare table layout and center it horizontally (but avoid overlapping logo)
      const headers = data.headers;
      const fullUsable = pageWidth - margin * 2;
      const maxColWidth = Math.floor(fullUsable / headers.length);
      const colWidth = Math.max(70, Math.min(maxColWidth, 160));
      const tableWidth = colWidth * headers.length;
      let contentStartCentered = Math.floor((pageWidth - tableWidth) / 2);
      // ensure content doesn't go outside left margin
      if (contentStartCentered < margin) contentStartCentered = margin;
      // if there's a logo, avoid overlapping it
      const minContentX = finalLogo ? margin + logoW + 12 : margin;
      const contentStart = contentStartCentered < minContentX ? minContentX : contentStartCentered;

      // render period at contentStart
      doc.setFontSize(10);
      doc.text(`Period: ${from} — ${to}`, contentStart, y);
      y += 18;

      // compute summary stats for financial report
      let stats = {};
      if (reportType === 'financial') {
        const totalDeposits = data.rows.reduce((s, r) => s + (r.deposits || 0), 0);
        const totalLoans = data.rows.reduce((s, r) => s + (r.loans || 0), 0);
        const totalInterest = data.rows.reduce((s, r) => s + (r.interest || 0), 0);
        const totalExpenses = data.rows.reduce((s, r) => s + (r.expenses || 0), 0);
        const totalNet = data.rows.reduce((s, r) => s + (r.net || 0), 0);
        stats = { totalDeposits, totalLoans, totalInterest, totalExpenses, totalNet };
      } else {
        stats = { members: data.rows.length };
      }

      // draw small stat boxes starting at contentStart
      const statX = contentStart;
      let statY = y;
      doc.setFontSize(9);
      if (reportType === 'financial') {
        const statLabels = [
          ['Deposits', stats.totalDeposits],
          ['Loans', stats.totalLoans],
          ['Interest', stats.totalInterest],
          ['Expenses', stats.totalExpenses],
          ['Net', stats.totalNet],
        ];
        let sx = statX;
        const boxW = Math.min(colWidth, 140);
        const boxH = 28;
        statLabels.forEach(([label, val], i) => {
          doc.setFillColor(245,245,250);
          doc.rect(sx, statY, boxW, boxH, 'F');
          doc.setFont('helvetica', 'bold');
          doc.text(label, sx + 6, statY + 10);
          doc.setFont('helvetica', 'normal');
          doc.text(String((val ?? 0)).toLocaleString(), sx + 6, statY + 22);
          sx += boxW + 8;
        });
        y += boxH + 12;
      } else {
        doc.setFillColor(245,245,250);
        doc.rect(statX, statY, 160, 36, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('Members', statX + 8, statY + 12);
        doc.setFont('helvetica', 'normal');
        doc.text(String(stats.members), statX + 8, statY + 28);
        y += 36 + 12;
      }

      // draw headers
      const colX = [];
      const usableWidth = tableWidth;
      headers.forEach((h, i) => colX.push(contentStart + i * colWidth));

      doc.setFontSize(9);
      doc.setFillColor(245, 245, 250);
      // header row
      headers.forEach((h, i) => {
        doc.text(String(h), colX[i] + 4, y);
      });
      y += 16;

      // rows
      for (let ri = 0; ri < data.rows.length; ri++) {
        const r = data.rows[ri];
        const cells = reportType === 'financial'
          ? [r.period, r.deposits, r.loans, r.interest, r.expenses, r.net]
          : [r.id, r.name, r.joined, r.shares, r.contribution];

        cells.forEach((c, i) => {
          const text = String(c ?? '');
          doc.text(text, colX[i] + 4, y);
        });
        y += 14;
        if (y > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          y = 60;
        }
      }

      const fileName = `${reportType}-report-${from}_to_${to}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('PDF generation error', err);
      alert('Failed to generate PDF: ' + (err.message || err));
    } finally {
      setGenerating(false);
    }
  };

  const preview = useMemo(() => data, [data]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>Reports</h1>
          <p>Generate automated financial and member reports (dummy data)</p>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <label>
            Report type
            <br />
            <select value={reportType} onChange={(e) => { setReportType(e.target.value); setData(null); }}>
              <option value="financial">Financial</option>
              <option value="members">Members</option>
            </select>
          </label>

          <label>
            Preset
            <br />
            <select value={preset} onChange={(e) => applyPreset(e.target.value)}>
              <option value="last_month">Last month</option>
              <option value="this_month">This month</option>
              <option value="last_3_months">Last 3 months</option>
              <option value="ytd">Year to date</option>
              <option value="custom">Custom range</option>
            </select>
          </label>

          <label style={{ minWidth: 220 }}>
            Report title
            <br />
            <input className="form-control" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} />
          </label>

          <label>
            Logo (upload)
            <br />
            <input type="file" accept="image/*" onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (!f) return;
              const fr = new FileReader();
              fr.onload = () => setLogoDataUrl(fr.result);
              fr.readAsDataURL(f);
            }} />
          </label>

          <label>
            From
            <br />
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPreset('custom'); }} />
          </label>

          <label>
            To
            <br />
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPreset('custom'); }} />
          </label>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleGenerate}>Generate Report</button>
            <button className="btn" onClick={() => { setData(null); }}>Clear</button>
            <button className="btn" onClick={downloadPDF} disabled={!data || generating}>{generating ? 'Generating...' : 'Download PDF'}</button>
          </div>
        </div>
      </div>

      {preview ? (
        <div className="card" style={{ marginTop: '1rem', overflowX: 'auto' }}>
          <h3 style={{ marginTop: 0 }}>{reportType === 'financial' ? 'Financial report (preview)' : 'Member report (preview)'}</h3>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {preview.headers.map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((r, idx) => (
                <tr key={idx}>
                  {reportType === 'financial' ? (
                    <>
                      <td style={{ padding: '0.5rem' }}>{r.period}</td>
                      <td style={{ padding: '0.5rem' }}>{(r.deposits ?? 0).toLocaleString()}</td>
                      <td style={{ padding: '0.5rem' }}>{(r.loans ?? 0).toLocaleString()}</td>
                      <td style={{ padding: '0.5rem' }}>{(r.interest ?? 0).toLocaleString()}</td>
                      <td style={{ padding: '0.5rem' }}>{(r.expenses ?? 0).toLocaleString()}</td>
                      <td style={{ padding: '0.5rem' }}>{(r.net ?? 0).toLocaleString()}</td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '0.5rem' }}>{r.id}</td>
                      <td style={{ padding: '0.5rem' }}>{r.name}</td>
                      <td style={{ padding: '0.5rem' }}>{r.joined}</td>
                      <td style={{ padding: '0.5rem' }}>{r.shares ?? 0}</td>
                      <td style={{ padding: '0.5rem' }}>{(r.contribution ?? 0).toLocaleString()}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '1rem', padding: '2rem', textAlign: 'center' }}>
          <p>No report generated yet — choose a preset or custom range and click <strong>Generate Report</strong>.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
