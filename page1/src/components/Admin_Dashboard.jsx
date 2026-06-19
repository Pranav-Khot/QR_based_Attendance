

import React, { useEffect, useState, useCallback } from 'react';

/* ─── INLINE STYLES (green stencil theme) ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Saira+Stencil+One&family=Oswald:wght@300;400;600;700&family=Barlow:wght@300;400;500;600&display=swap');

  :root {
    --dark:     #0B2218;
    --deep:     #12372A;
    --forest:   #1B5E4A;
    --mid:      #2E7D55;
    --accent:   #436850;
    --mint:     #87D1B9;
    --pale:     #ADBC9F;
    --cream:    #CEC0BB;
    --glass:    rgba(255,255,255,0.08);
    --glassh:   rgba(255,255,255,0.14);
    --border:   rgba(135,209,185,0.2);
    --red:      #d32f2f;
    --amber:    #f57c00;
    --blue:     #1565C0;
    --stencil:  'Saira Stencil One', cursive;
    --oswald:   'Oswald', sans-serif;
    --body:     'Barlow', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .adm-root {
    display: flex; height: 100vh; font-family: var(--body);
    background: var(--dark); color: white; overflow: hidden;
  }

  /* SIDEBAR */
  .adm-sidebar {
    width: 260px; flex-shrink: 0;
    background: var(--deep);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
  }
  .adm-sidebar::before {
    content: ''; position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(135,209,185,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .adm-brand {
    padding: 28px 24px 20px;
    border-bottom: 1px solid var(--border);
  }
  .adm-brand-title {
    font-family: var(--stencil); font-size: 15px;
    color: var(--mint); letter-spacing: 2px; line-height: 1.3;
  }
  .adm-brand-sub {
    font-family: var(--oswald); font-size: 10px; font-weight: 300;
    color: var(--cream); letter-spacing: 3px; margin-top: 4px;
  }
  .adm-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
  .adm-nav-section { margin-bottom: 24px; }
  .adm-nav-label {
    font-family: var(--oswald); font-size: 9px; font-weight: 600;
    color: rgba(135,209,185,0.45); letter-spacing: 3px;
    padding: 0 12px; margin-bottom: 8px; text-transform: uppercase;
  }
  .adm-nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 10px; cursor: pointer;
    font-family: var(--oswald); font-size: 13px; font-weight: 400;
    color: rgba(255,255,255,0.6); letter-spacing: 0.5px;
    transition: all 0.25s ease; margin-bottom: 3px; border: none;
    background: transparent; width: 100%; text-align: left;
  }
  .adm-nav-item:hover { background: var(--glass); color: white; }
  .adm-nav-item.active {
    background: linear-gradient(135deg, var(--forest), var(--mid));
    color: white; box-shadow: 0 4px 15px rgba(27,94,74,0.4);
  }
  .adm-nav-icon { font-size: 17px; flex-shrink: 0; }
  .adm-nav-badge {
    margin-left: auto; background: var(--mint); color: var(--deep);
    border-radius: 10px; font-size: 10px; font-weight: 700;
    padding: 2px 7px; font-family: var(--oswald);
  }
  .adm-sidebar-footer {
    padding: 16px; border-top: 1px solid var(--border);
  }
  .adm-role-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--glass); border: 1px solid var(--border);
    border-radius: 8px; padding: 8px 12px; width: 100%;
  }
  .adm-role-dot { width: 7px; height: 7px; background: var(--mint); border-radius: 50%; }
  .adm-role-text { font-family: var(--oswald); font-size: 11px; font-weight: 600; letter-spacing: 1px; }

  /* MAIN */
  .adm-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .adm-topbar {
    padding: 18px 32px; background: var(--deep);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  }
  .adm-page-title { font-family: var(--stencil); font-size: 22px; color: var(--mint); letter-spacing: 2px; }
  .adm-topbar-right { display: flex; align-items: center; gap: 16px; }
  .adm-search {
    background: var(--glass); border: 1px solid var(--border); border-radius: 10px;
    padding: 8px 16px; display: flex; align-items: center; gap: 10px;
    transition: all 0.3s ease;
  }
  .adm-search:focus-within { border-color: var(--mint); }
  .adm-search input {
    background: transparent; border: none; outline: none;
    color: white; font-family: var(--body); font-size: 13px; width: 200px;
  }
  .adm-search input::placeholder { color: rgba(255,255,255,0.35); }
  .adm-search-icon { color: rgba(135,209,185,0.5); font-size: 15px; }
  .adm-content { flex: 1; overflow-y: auto; padding: 28px 32px; }

  /* STATS GRID */
  .adm-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 16px; margin-bottom: 28px; }
  .adm-stat-card {
    background: var(--glass); border: 1px solid var(--border);
    border-radius: 16px; padding: 20px; position: relative; overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .adm-stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
  .adm-stat-card::after {
    content: ''; position: absolute; bottom: -20px; right: -20px;
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(135,209,185,0.06);
  }
  .adm-stat-label { font-family: var(--oswald); font-size: 10px; font-weight: 600; letter-spacing: 2px; color: var(--mint); margin-bottom: 8px; }
  .adm-stat-num { font-family: var(--stencil); font-size: 34px; color: white; line-height: 1; }
  .adm-stat-sub { font-family: var(--body); font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 4px; }
  .adm-stat-icon { position: absolute; top: 18px; right: 18px; font-size: 22px; opacity: 0.3; }

  /* SECTION HEADER */
  .adm-section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .adm-section-title { font-family: var(--stencil); font-size: 16px; color: var(--mint); letter-spacing: 1px; }
  .adm-filter-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .adm-filter-btn {
    background: transparent; border: 1px solid var(--border); border-radius: 8px;
    padding: 6px 14px; font-family: var(--oswald); font-size: 11px; font-weight: 600;
    color: rgba(255,255,255,0.5); cursor: pointer; letter-spacing: 1px;
    transition: all 0.2s;
  }
  .adm-filter-btn.active { background: var(--forest); border-color: var(--mint); color: var(--mint); }
  .adm-filter-btn:hover:not(.active) { border-color: rgba(135,209,185,0.4); color: white; }
  .adm-btn-primary {
    background: linear-gradient(135deg, var(--forest), var(--mid));
    border: none; border-radius: 10px; padding: 10px 20px;
    font-family: var(--oswald); font-size: 12px; font-weight: 600;
    color: white; cursor: pointer; letter-spacing: 1px;
    transition: all 0.2s; display: flex; align-items: center; gap: 8px;
  }
  .adm-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(27,94,74,0.4); }
  .adm-btn-danger {
    background: rgba(211,47,47,0.1); border: 1px solid rgba(211,47,47,0.3);
    border-radius: 8px; padding: 7px 10px; color: #ff6b6b;
    cursor: pointer; transition: all 0.2s; font-size: 14px;
  }
  .adm-btn-danger:hover { background: rgba(211,47,47,0.25); }

  /* TABLE */
  .adm-table-wrap {
    background: var(--glass); border: 1px solid var(--border);
    border-radius: 18px; overflow: hidden; overflow-x: auto;
  }
  .adm-table { width: 100%; border-collapse: collapse; min-width: 600px; }
  .adm-table thead tr { background: rgba(27,94,74,0.4); }
  .adm-table th {
    padding: 14px 18px; text-align: left;
    font-family: var(--oswald); font-size: 10px; font-weight: 600;
    letter-spacing: 2px; color: var(--mint); text-transform: uppercase;
    border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  .adm-table td {
    padding: 14px 18px; border-bottom: 1px solid rgba(135,209,185,0.06);
    font-family: var(--body); font-size: 13px; color: rgba(255,255,255,0.85);
  }
  .adm-table tbody tr { transition: background 0.15s; }
  .adm-table tbody tr:hover { background: rgba(255,255,255,0.04); }
  .adm-table tbody tr:last-child td { border-bottom: none; }

  /* AVATAR */
  .adm-avatar {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, var(--forest), var(--mid));
    display: flex; align-items: center; justify-content: center;
    font-family: var(--oswald); font-size: 13px; font-weight: 700; color: white;
    flex-shrink: 0;
  }
  .adm-user-cell { display: flex; align-items: center; gap: 12px; }
  .adm-user-name { font-family: var(--oswald); font-size: 13px; font-weight: 600; color: white; }
  .adm-user-email { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 1px; }

  /* ROLE BADGES */
  .adm-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 6px;
    font-family: var(--oswald); font-size: 10px; font-weight: 700; letter-spacing: 1px;
  }
  .adm-badge-admin { background: rgba(21,101,192,0.2); color: #64b5f6; border: 1px solid rgba(21,101,192,0.3); }
  .adm-badge-teacher { background: rgba(245,124,0,0.15); color: #ffb74d; border: 1px solid rgba(245,124,0,0.3); }
  .adm-badge-student { background: rgba(27,94,74,0.3); color: var(--mint); border: 1px solid var(--border); }
  .adm-badge-pending { background: rgba(245,124,0,0.1); color: #ffb74d; border: 1px solid rgba(245,124,0,0.3); }
  .adm-badge-approved { background: rgba(27,94,74,0.3); color: var(--mint); border: 1px solid var(--border); }
  .adm-badge-rejected { background: rgba(211,47,47,0.15); color: #ef9a9a; border: 1px solid rgba(211,47,47,0.3); }

  /* PROGRESS BAR */
  .adm-progress-wrap { display: flex; align-items: center; gap: 10px; }
  .adm-progress-bar { flex: 1; height: 5px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; min-width: 80px; }
  .adm-progress-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
  .adm-progress-pct { font-family: var(--oswald); font-size: 12px; font-weight: 600; color: var(--mint); min-width: 36px; text-align: right; }

  /* SELECT */
  .adm-select {
    background: rgba(27,94,74,0.2); border: 1px solid var(--border);
    border-radius: 8px; padding: 7px 12px; color: white;
    font-family: var(--oswald); font-size: 12px; cursor: pointer;
    outline: none; transition: border-color 0.2s;
  }
  .adm-select:focus { border-color: var(--mint); }
  .adm-select option { background: var(--deep); color: white; }

  /* ACTION BTNS ROW */
  .adm-actions { display: flex; align-items: center; gap: 8px; }
  .adm-act-btn {
    border: none; border-radius: 7px; padding: 7px 12px;
    font-family: var(--oswald); font-size: 11px; font-weight: 600;
    letter-spacing: 0.5px; cursor: pointer; transition: all 0.2s;
  }
  .adm-act-approve { background: rgba(27,94,74,0.3); color: var(--mint); border: 1px solid var(--border); }
  .adm-act-approve:hover { background: var(--forest); }
  .adm-act-reject { background: rgba(211,47,47,0.1); color: #ef9a9a; border: 1px solid rgba(211,47,47,0.3); }
  .adm-act-reject:hover { background: rgba(211,47,47,0.25); }

  /* MODAL */
  .adm-modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px); z-index: 1000;
    display: flex; align-items: center; justify-content: center;
  }
  .adm-modal {
    background: var(--deep); border: 1px solid var(--border);
    border-radius: 24px; padding: 36px; width: 480px; max-width: 95vw;
    max-height: 85vh; overflow-y: auto;
    animation: modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes modalIn { from { transform: scale(0.88); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .adm-modal-title { font-family: var(--stencil); font-size: 18px; color: var(--mint); letter-spacing: 2px; margin-bottom: 24px; }
  .adm-modal-field { margin-bottom: 16px; }
  .adm-modal-label { font-family: var(--oswald); font-size: 10px; font-weight: 600; letter-spacing: 2px; color: var(--mint); margin-bottom: 6px; display: block; }
  .adm-modal-input {
    width: 100%; background: var(--glass); border: 1px solid var(--border);
    border-radius: 10px; padding: 11px 14px; color: white;
    font-family: var(--body); font-size: 13px; outline: none;
    transition: border-color 0.2s;
  }
  .adm-modal-input:focus { border-color: var(--mint); }
  .adm-modal-input::placeholder { color: rgba(255,255,255,0.3); }
  .adm-modal-row { display: flex; gap: 12px; }
  .adm-modal-btns { display: flex; gap: 12px; margin-top: 24px; }
  .adm-modal-cancel {
    flex: 1; background: transparent; border: 1px solid var(--border);
    border-radius: 10px; padding: 12px; font-family: var(--oswald);
    font-size: 12px; font-weight: 600; letter-spacing: 1px; color: rgba(255,255,255,0.6);
    cursor: pointer; transition: all 0.2s;
  }
  .adm-modal-cancel:hover { background: var(--glass); color: white; }
  .adm-modal-submit {
    flex: 2; background: linear-gradient(135deg, var(--forest), var(--mid));
    border: none; border-radius: 10px; padding: 12px; font-family: var(--oswald);
    font-size: 12px; font-weight: 700; letter-spacing: 2px; color: white;
    cursor: pointer; transition: all 0.2s;
  }
  .adm-modal-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(27,94,74,0.4); }

  /* DETAIL PANEL */
  .adm-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
  .adm-detail-item { background: var(--glass); border: 1px solid var(--border); border-radius: 10px; padding: 14px; }
  .adm-detail-key { font-family: var(--oswald); font-size: 9px; letter-spacing: 2px; color: rgba(135,209,185,0.6); margin-bottom: 4px; }
  .adm-detail-val { font-family: var(--oswald); font-size: 13px; color: white; }

  /* TAB PANELS */
  .adm-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: rgba(0,0,0,0.2); border-radius: 12px; padding: 5px; }
  .adm-tab {
    flex: 1; padding: 9px; border: none; border-radius: 9px;
    font-family: var(--oswald); font-size: 12px; font-weight: 600; letter-spacing: 1px;
    cursor: pointer; background: transparent; color: rgba(255,255,255,0.45); transition: all 0.2s;
  }
  .adm-tab.active { background: var(--forest); color: white; }

  /* TOAST */
  .adm-toast {
    position: fixed; bottom: 24px; right: 24px;
    background: var(--forest); border: 1px solid var(--mint);
    border-radius: 12px; padding: 14px 20px;
    font-family: var(--oswald); font-size: 13px; letter-spacing: 0.5px;
    color: white; z-index: 9999; animation: toastIn 0.3s ease;
  }
  @keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* LOADING */
  .adm-loading { text-align: center; padding: 60px; color: rgba(255,255,255,0.3); font-family: var(--oswald); letter-spacing: 2px; font-size: 12px; }
  .adm-spinner { width: 32px; height: 32px; border: 2px solid var(--border); border-top-color: var(--mint); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* EMPTY STATE */
  .adm-empty { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); }
  .adm-empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }
  .adm-empty-text { font-family: var(--oswald); font-size: 13px; letter-spacing: 1px; }

  /* OVERALL VIEW CARD */
  .adm-overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap: 16px; }
  .adm-ov-card {
    background: var(--glass); border: 1px solid var(--border);
    border-radius: 16px; padding: 22px;
  }
  .adm-ov-title { font-family: var(--stencil); font-size: 13px; color: var(--mint); letter-spacing: 1px; margin-bottom: 16px; }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(135,209,185,0.25); border-radius: 3px; }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .adm-sidebar { display: none; }
    .adm-topbar { padding: 14px 16px; }
    .adm-content { padding: 16px; }
    .adm-detail-grid { grid-template-columns: 1fr; }
    .adm-modal-row { flex-direction: column; }
    .adm-stats { grid-template-columns: repeat(2, 1fr); }
  }
`;

const API = 'http://localhost:5001/api';

/* ─── UTILITIES ─── */
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const pctColor = (p) => p >= 75 ? '#87D1B9' : p >= 50 ? '#ffb74d' : '#ef9a9a';

/* ─── SUB-COMPONENTS ─── */
const Spinner = () => (
  <div className="adm-loading">
    <div className="adm-spinner" />
    LOADING...
  </div>
);

const EmptyState = ({ icon = '📭', text = 'No data found' }) => (
  <div className="adm-empty">
    <div className="adm-empty-icon">{icon}</div>
    <div className="adm-empty-text">{text}</div>
  </div>
);

const RoleBadge = ({ role, status }) => {
  if (status === 'PENDING') return <span className="adm-badge adm-badge-pending">⏳ PENDING</span>;
  if (status === 'REJECTED') return <span className="adm-badge adm-badge-rejected">✗ REJECTED</span>;
  if (role === 'admin') return <span className="adm-badge adm-badge-admin">⬡ ADMIN</span>;
  if (role === 'teacher') return <span className="adm-badge adm-badge-teacher">▲ TEACHER</span>;
  return <span className="adm-badge adm-badge-student">◆ STUDENT</span>;
};

const ProgressBar = ({ pct }) => (
  <div className="adm-progress-wrap">
    <div className="adm-progress-bar">
      <div className="adm-progress-fill" style={{ width: `${pct}%`, background: pctColor(pct) }} />
    </div>
    <span className="adm-progress-pct" style={{ color: pctColor(pct) }}>{pct}%</span>
  </div>
);

/* ─── ADD USER MODAL ─── */
const AddUserModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', contact: '', role: 'user' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/users/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const d = await res.json();
      if (res.ok) { onSuccess('User added successfully!'); onClose(); }
      else alert(d.error || 'Failed');
    } catch { alert('Network error'); }
    setSaving(false);
  };

  return (
    <div className="adm-modal-backdrop" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-title">ADD NEW USER</div>
        <div className="adm-modal-field">
          <label className="adm-modal-label">FULL NAME</label>
          <input className="adm-modal-input" placeholder="Enter full name"
            value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div className="adm-modal-row">
          <div className="adm-modal-field" style={{ flex: 1 }}>
            <label className="adm-modal-label">EMAIL</label>
            <input className="adm-modal-input" type="email" placeholder="email@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="adm-modal-field" style={{ flex: 1 }}>
            <label className="adm-modal-label">CONTACT</label>
            <input className="adm-modal-input" placeholder="10 digit number" maxLength={10}
              value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
          </div>
        </div>
        <div className="adm-modal-row">
          <div className="adm-modal-field" style={{ flex: 1 }}>
            <label className="adm-modal-label">PASSWORD</label>
            <input className="adm-modal-input" type="password" placeholder="Min 8 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="adm-modal-field" style={{ flex: 1 }}>
            <label className="adm-modal-label">ROLE</label>
            <select className="adm-modal-input adm-select"
              value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="user">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
        </div>
        <div className="adm-modal-btns">
          <button className="adm-modal-cancel" onClick={onClose}>CANCEL</button>
          <button className="adm-modal-submit" onClick={handleSubmit} disabled={saving}>
            {saving ? 'ADDING...' : 'ADD USER'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── USER DETAIL MODAL ─── */
const UserDetailModal = ({ user, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState(null);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (user.role === 'user' && user.domain) {
      fetch(`${API}/analytics?domain=${encodeURIComponent(user.domain)}`)
        .then(r => r.json())
        .then(d => {
          const st = (d.students || []).find(s => s._id === user._id || s._id === user._id?.toString());
          if (st) setAnalytics(st);
        }).catch(() => {});
      fetch(`${API}/analytics/student/${user._id}/submissions`)
        .then(r => r.json())
        .then(d => setSubmissions(d))
        .catch(() => {});
    }
  }, [user]);

  const attended = analytics?.classesAttended || 0;
  const total = analytics?.totalClasses || 0;
  const attPct = analytics?.attendance || 0;
  const assignDone = (submissions?.assignments || []).filter(a => a.submitted).length;
  const assignTotal = (submissions?.assignments || []).length;
  const projDone = (submissions?.projects || []).filter(p => p.submitted).length;
  const projTotal = (submissions?.projects || []).length;

  return (
    <div className="adm-modal-backdrop" onClick={onClose}>
      <div className="adm-modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div className="adm-avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
            {initials(user.fullName)}
          </div>
          <div>
            <div className="adm-modal-title" style={{ marginBottom: 4 }}>{user.fullName}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--body)' }}>{user.email}</div>
          </div>
        </div>

        {user.role === 'user' && (
          <div className="adm-tabs">
            {['overview', 'attendance', 'submissions'].map(t => (
              <button key={t} className={`adm-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {tab === 'overview' && (
          <>
            <div className="adm-detail-grid">
              <div className="adm-detail-item">
                <div className="adm-detail-key">ROLE</div>
                <div className="adm-detail-val">{user.role?.toUpperCase()}</div>
              </div>
              <div className="adm-detail-item">
                <div className="adm-detail-key">STATUS</div>
                <div className="adm-detail-val">{user.approvalStatus || 'N/A'}</div>
              </div>
              <div className="adm-detail-item">
                <div className="adm-detail-key">CONTACT</div>
                <div className="adm-detail-val">{user.contact || '—'}</div>
              </div>
              <div className="adm-detail-item">
                <div className="adm-detail-key">DOMAIN</div>
                <div className="adm-detail-val">{user.domain || '—'}</div>
              </div>
              <div className="adm-detail-item">
                <div className="adm-detail-key">REGISTERED</div>
                <div className="adm-detail-val">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</div>
              </div>
              <div className="adm-detail-item">
                <div className="adm-detail-key">APPROVED AT</div>
                <div className="adm-detail-val">{user.approvedAt ? new Date(user.approvedAt).toLocaleDateString() : '—'}</div>
              </div>
            </div>
            {user.role === 'user' && analytics && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--oswald)', letterSpacing: 2, color: 'var(--mint)', marginBottom: 10 }}>PERFORMANCE OVERVIEW</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { label: 'ATTENDANCE', val: `${attPct}%`, color: pctColor(attPct) },
                    { label: 'ASSIGNMENTS', val: `${assignTotal > 0 ? Math.round((assignDone / assignTotal) * 100) : 0}%`, color: '#64b5f6' },
                    { label: 'PROJECTS', val: `${projTotal > 0 ? Math.round((projDone / projTotal) * 100) : 0}%`, color: '#ffb74d' },
                  ].map(item => (
                    <div key={item.label} className="adm-detail-item" style={{ flex: 1, textAlign: 'center' }}>
                      <div className="adm-detail-key">{item.label}</div>
                      <div style={{ fontFamily: 'var(--stencil)', fontSize: 24, color: item.color }}>{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'attendance' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div className="adm-detail-item" style={{ flex: 1 }}>
                <div className="adm-detail-key">ATTENDED</div>
                <div className="adm-detail-val" style={{ fontSize: 22, fontFamily: 'var(--stencil)', color: 'var(--mint)' }}>{attended}</div>
              </div>
              <div className="adm-detail-item" style={{ flex: 1 }}>
                <div className="adm-detail-key">TOTAL</div>
                <div className="adm-detail-val" style={{ fontSize: 22, fontFamily: 'var(--stencil)' }}>{total}</div>
              </div>
              <div className="adm-detail-item" style={{ flex: 1 }}>
                <div className="adm-detail-key">PERCENTAGE</div>
                <div style={{ fontFamily: 'var(--stencil)', fontSize: 22, color: pctColor(attPct) }}>{attPct}%</div>
              </div>
            </div>
            <ProgressBar pct={attPct} />
          </div>
        )}

        {tab === 'submissions' && (
          <div>
            {!submissions ? <Spinner /> : (
              <>
                <div style={{ marginBottom: 12, fontFamily: 'var(--oswald)', fontSize: 11, letterSpacing: 1, color: 'var(--mint)' }}>
                  ASSIGNMENTS — {assignDone}/{assignTotal} SUBMITTED
                </div>
                {(submissions.assignments || []).slice(0, 6).map(a => (
                  <div key={a._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(135,209,185,0.08)' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--body)' }}>{a.title}</span>
                    <span className={`adm-badge ${a.submitted ? 'adm-badge-approved' : 'adm-badge-rejected'}`}>{a.submitted ? '✓ DONE' : '✗ PENDING'}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, marginBottom: 8, fontFamily: 'var(--oswald)', fontSize: 11, letterSpacing: 1, color: 'var(--mint)' }}>
                  PROJECTS — {projDone}/{projTotal} SUBMITTED
                </div>
                {(submissions.projects || []).slice(0, 6).map(p => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(135,209,185,0.08)' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--body)' }}>{p.title}</span>
                    <span className={`adm-badge ${p.submitted ? 'adm-badge-approved' : 'adm-badge-rejected'}`}>{p.submitted ? '✓ DONE' : '✗ PENDING'}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        <button className="adm-modal-cancel" style={{ marginTop: 20, width: '100%' }} onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
};

/* ─── SECTION: USERS ─── */
const UsersSection = ({ toast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users`);
      const d = await res.json();
      setUsers(Array.isArray(d) ? d : []);
    } catch { setUsers([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`${API}/users/update-role`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      if (res.ok) { toast('Role updated!'); fetchUsers(); }
    } catch { toast('Error updating role'); }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      const res = await fetch(`${API}/users/${userId}`, { method: 'DELETE' });
      if (res.ok) { toast('User deleted!'); fetchUsers(); }
    } catch { toast('Error deleting'); }
  };

  const filtered = users.filter(u => {
    const matchFilter = filter === 'all' || (filter === 'teacher' ? u.role === 'teacher' : u.role === 'user');
    const matchSearch = !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const teachers = users.filter(u => u.role === 'teacher').length;
  const students = users.filter(u => u.role === 'user').length;

  return (
    <div>
      <div className="adm-stats">
        {[
          { label: 'TOTAL USERS', val: users.length, icon: '👥', sub: 'All registered' },
          { label: 'TEACHERS', val: teachers, icon: '🎓', sub: 'Faculty members' },
          { label: 'STUDENTS', val: students, icon: '📚', sub: 'Enrolled users' },
        ].map(s => (
          <div key={s.label} className="adm-stat-card">
            <div className="adm-stat-label">{s.label}</div>
            <div className="adm-stat-num">{s.val}</div>
            <div className="adm-stat-sub">{s.sub}</div>
            <div className="adm-stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="adm-section-header">
        <span className="adm-section-title">USER MANAGEMENT</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="adm-filter-row">
            {['all', 'teacher', 'student'].map(f => (
              <button key={f} className={`adm-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="adm-btn-primary" onClick={() => setShowAdd(true)}>＋ ADD USER</button>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>USER</th>
                <th>ROLE</th>
                <th>DOMAIN</th>
                <th>STATUS</th>
                <th>CHANGE ROLE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--oswald)', letterSpacing: 2 }}>NO USERS FOUND</td></tr>
              ) : filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-avatar">{initials(u.fullName)}</div>
                      <div>
                        <div className="adm-user-name">{u.fullName}</div>
                        <div className="adm-user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><RoleBadge role={u.role} status={null} /></td>
                  <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'var(--oswald)' }}>{u.domain || '—'}</td>
                  <td>
                    <span className={`adm-badge ${u.approvalStatus === 'APPROVED' ? 'adm-badge-approved' : u.approvalStatus === 'PENDING' ? 'adm-badge-pending' : 'adm-badge-rejected'}`}>
                      {u.approvalStatus || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <select className="adm-select" value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}>
                      <option value="user">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-act-approve" style={{ background: 'rgba(21,101,192,0.15)', color: '#64b5f6', border: '1px solid rgba(21,101,192,0.3)' }} onClick={() => setDetail(u)}>👁 VIEW</button>
                      <button className="adm-btn-danger" onClick={() => handleDelete(u._id, u.fullName)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onSuccess={(msg) => { toast(msg); fetchUsers(); }} />}
      {detail && <UserDetailModal user={detail} onClose={() => setDetail(null)} />}
    </div>
  );
};

/* ─── SECTION: APPROVAL REQUESTS ─── */
const ApprovalsSection = ({ toast }) => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/pending`);
      const d = await res.json();
      setPending(Array.isArray(d) ? d : []);
    } catch { setPending([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${API}/users/${action}/${id}`, { method: 'PUT' });
      if (res.ok) { toast(`User ${action}d!`); fetchPending(); }
    } catch { toast('Error'); }
  };

  return (
    <div>
      <div className="adm-stats">
        <div className="adm-stat-card">
          <div className="adm-stat-label">PENDING APPROVALS</div>
          <div className="adm-stat-num">{pending.length}</div>
          <div className="adm-stat-sub">Awaiting review</div>
          <div className="adm-stat-icon">⏳</div>
        </div>
      </div>

      <div className="adm-section-header">
        <span className="adm-section-title">REGISTRATION REQUESTS</span>
        <button className="adm-filter-btn" onClick={fetchPending}>↻ REFRESH</button>
      </div>

      {loading ? <Spinner /> : pending.length === 0 ? (
        <div className="adm-table-wrap"><EmptyState icon="✅" text="ALL REQUESTS PROCESSED" /></div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>APPLICANT</th>
                <th>CONTACT</th>
                <th>REGISTERED ON</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {pending.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-avatar">{initials(u.fullName)}</div>
                      <div>
                        <div className="adm-user-name">{u.fullName}</div>
                        <div className="adm-user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--body)', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{u.contact || '—'}</td>
                  <td style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-act-btn adm-act-approve" onClick={() => handleAction(u._id, 'approve')}>✓ APPROVE</button>
                      <button className="adm-act-btn adm-act-reject" onClick={() => handleAction(u._id, 'reject')}>✗ REJECT</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─── SECTION: STUDENTS ─── */
const StudentsSection = ({ toast }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users?role=student`);
      const d = await res.json();
      const arr = Array.isArray(d) ? d : (d.students || []);
      setStudents(arr.filter(u => u.role === 'user'));
    } catch { setStudents([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleDomain = async (id, domain) => {
    const token = localStorage.getItem('token') || '';
    try {
      const res = await fetch(`${API}/users/${id}/domain`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain })
      });
      if (res.ok) { toast('Domain assigned!'); fetchStudents(); }
    } catch { toast('Error'); }
  };

  const filtered = students.filter(s =>
    !search || s.fullName?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const DOMAINS = ['', 'MEAN Stack', 'Java Full Stack', 'Python Developer', 'Cyber Security'];

  return (
    <div>
      <div className="adm-stats">
        {[
          { label: 'TOTAL STUDENTS', val: students.length, icon: '📚' },
          { label: 'WITH DOMAIN', val: students.filter(s => s.domain).length, icon: '🎯' },
          { label: 'NO DOMAIN', val: students.filter(s => !s.domain).length, icon: '❓' },
        ].map(s => (
          <div key={s.label} className="adm-stat-card">
            <div className="adm-stat-label">{s.label}</div>
            <div className="adm-stat-num">{s.val}</div>
            <div className="adm-stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="adm-section-header">
        <span className="adm-section-title">STUDENT ROSTER</span>
        <div className="adm-search" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <span className="adm-search-icon">🔍</span>
          <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>DOMAIN</th>
                <th>STATUS</th>
                <th>ASSIGN DOMAIN</th>
                <th>VIEW</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--oswald)', letterSpacing: 2 }}>NO STUDENTS FOUND</td></tr>
              ) : filtered.map(s => (
                <tr key={s._id}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-avatar">{initials(s.fullName)}</div>
                      <div>
                        <div className="adm-user-name">{s.fullName}</div>
                        <div className="adm-user-email">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {s.domain ? (
                      <span className="adm-badge adm-badge-student">{s.domain}</span>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'var(--oswald)' }}>UNASSIGNED</span>
                    )}
                  </td>
                  <td>
                    <span className={`adm-badge ${s.approvalStatus === 'APPROVED' ? 'adm-badge-approved' : 'adm-badge-pending'}`}>
                      {s.approvalStatus}
                    </span>
                  </td>
                  <td>
                    <select className="adm-select" value={s.domain || ''} onChange={e => handleDomain(s._id, e.target.value)}>
                      {DOMAINS.map(d => <option key={d} value={d}>{d || '— No Domain —'}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="adm-act-btn" style={{ background: 'rgba(21,101,192,0.15)', color: '#64b5f6', border: '1px solid rgba(21,101,192,0.3)' }} onClick={() => setDetail(s)}>
                      👁 DETAILS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && <UserDetailModal user={detail} onClose={() => setDetail(null)} />}
    </div>
  );
};

/* ─── SECTION: TEACHERS ─── */
const TeachersSection = ({ toast }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users`);
      const d = await res.json();
      setTeachers((Array.isArray(d) ? d : []).filter(u => u.role === 'teacher'));
    } catch { setTeachers([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  return (
    <div>
      <div className="adm-stats">
        <div className="adm-stat-card">
          <div className="adm-stat-label">TOTAL TEACHERS</div>
          <div className="adm-stat-num">{teachers.length}</div>
          <div className="adm-stat-sub">Active faculty</div>
          <div className="adm-stat-icon">🎓</div>
        </div>
      </div>

      <div className="adm-section-header">
        <span className="adm-section-title">FACULTY MANAGEMENT</span>
      </div>

      {loading ? <Spinner /> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>TEACHER</th>
                <th>CONTACT</th>
                <th>JOINED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--oswald)', letterSpacing: 2 }}>NO TEACHERS YET</td></tr>
              ) : teachers.map(t => (
                <tr key={t._id}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-avatar" style={{ background: 'linear-gradient(135deg, #c75a00, #ff8c00)' }}>{initials(t.fullName)}</div>
                      <div>
                        <div className="adm-user-name">{t.fullName}</div>
                        <div className="adm-user-email">{t.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--body)', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{t.contact || '—'}</td>
                  <td style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <button className="adm-act-btn" style={{ background: 'rgba(21,101,192,0.15)', color: '#64b5f6', border: '1px solid rgba(21,101,192,0.3)' }} onClick={() => setDetail(t)}>
                      👁 VIEW
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && <UserDetailModal user={detail} onClose={() => setDetail(null)} />}
    </div>
  );
};

/* ─── SECTION: OVERVIEW ─── */
const OverviewSection = () => {
  const [stats, setStats] = useState({ total: 0, teachers: 0, students: 0, pending: 0 });

  useEffect(() => {
    fetch(`${API}/users`).then(r => r.json()).then(d => {
      const arr = Array.isArray(d) ? d : [];
      setStats({
        total: arr.length,
        teachers: arr.filter(u => u.role === 'teacher').length,
        students: arr.filter(u => u.role === 'user').length,
        pending: arr.filter(u => u.approvalStatus === 'PENDING').length,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Users', val: stats.total, icon: '👥', color: 'var(--mint)' },
    { label: 'Teachers', val: stats.teachers, icon: '🎓', color: '#ffb74d' },
    { label: 'Students', val: stats.students, icon: '📚', color: '#64b5f6' },
    { label: 'Pending', val: stats.pending, icon: '⏳', color: '#ef9a9a' },
  ];

  return (
    <div>
      <div className="adm-stats">
        {cards.map(c => (
          <div key={c.label} className="adm-stat-card">
            <div className="adm-stat-label">{c.label.toUpperCase()}</div>
            <div className="adm-stat-num" style={{ color: c.color }}>{c.val}</div>
            <div className="adm-stat-icon">{c.icon}</div>
          </div>
        ))}
      </div>

      <div className="adm-overview-grid">
        <div className="adm-ov-card">
          <div className="adm-ov-title">SYSTEM SCOPE</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--body)', lineHeight: 1.8 }}>
            ✓ Manage user roles (student / teacher)<br />
            ✓ View student attendance & performance<br />
            ✓ Approve / reject registration requests<br />
            ✓ Assign domains to students<br />
            ✓ Add or remove users<br />
            ✗ Software-level configuration (Super Admin only)
          </div>
        </div>
        <div className="adm-ov-card">
          <div className="adm-ov-title">QUICK STATUS</div>
          {[
            { label: 'Teachers enrolled', val: `${stats.teachers}` },
            { label: 'Active students', val: `${stats.students}` },
            { label: 'Pending requests', val: `${stats.pending}` },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(135,209,185,0.08)' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--body)' }}>{item.label}</span>
              <span style={{ fontFamily: 'var(--stencil)', fontSize: 16, color: 'var(--mint)' }}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN COMPONENT ─── */
const Admin_Dashboard = () => {
  const [page, setPage] = useState('overview');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const nav = [
    { id: 'overview', label: 'OVERVIEW', icon: '◈', section: 'GENERAL' },
    { id: 'users', label: 'ALL USERS', icon: '◉', section: 'GENERAL' },
    { id: 'approvals', label: 'APPROVALS', icon: '◎', section: 'REQUESTS' },
    { id: 'students', label: 'STUDENTS', icon: '▣', section: 'MANAGEMENT' },
    { id: 'teachers', label: 'TEACHERS', icon: '▲', section: 'MANAGEMENT' },
  ];

  const sections = [...new Set(nav.map(n => n.section))];
  const currentNav = nav.find(n => n.id === page);

  return (
    <>
      <style>{CSS}</style>
      <div className="adm-root">
        {/* SIDEBAR */}
        <aside className="adm-sidebar">
          <div className="adm-brand">
            <div className="adm-brand-title">FORTUNE CLOUD</div>
            <div className="adm-brand-sub">ADMIN PANEL</div>
          </div>
          <nav className="adm-nav">
            {sections.map(sec => (
              <div key={sec} className="adm-nav-section">
                <div className="adm-nav-label">{sec}</div>
                {nav.filter(n => n.section === sec).map(n => (
                  <button key={n.id} className={`adm-nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
                    <span className="adm-nav-icon">{n.icon}</span>
                    {n.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="adm-sidebar-footer">
            <div className="adm-role-tag">
              <div className="adm-role-dot" />
              <span className="adm-role-text">ADMIN ACCESS</span>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="adm-main">
          <div className="adm-topbar">
            <div className="adm-page-title">{currentNav?.label}</div>
            <div className="adm-topbar-right">
              <div className="adm-search">
                <span className="adm-search-icon">🔍</span>
                <input placeholder="Quick search..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="adm-content">
            {page === 'overview' && <OverviewSection />}
            {page === 'users' && <UsersSection toast={showToast} />}
            {page === 'approvals' && <ApprovalsSection toast={showToast} />}
            {page === 'students' && <StudentsSection toast={showToast} />}
            {page === 'teachers' && <TeachersSection toast={showToast} />}
          </div>
        </div>
      </div>

      {toast && <div className="adm-toast">✓ {toast}</div>}
    </>
  );
};

export default Admin_Dashboard;