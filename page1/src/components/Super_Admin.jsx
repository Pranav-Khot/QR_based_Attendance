// Super_Admin_Dashboard.jsx
// Fortune Cloud Technologies — Super Admin Panel
// Green stencil aesthetic inspired by Registration.css
// APIs: http://localhost:5001/api/...

import React, { useEffect, useState, useCallback } from 'react';

/* ─── INLINE STYLES ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Saira+Stencil+One&family=Oswald:wght@300;400;600;700&family=Barlow:wght@300;400;500;600&display=swap');

  :root {
    --dark:     #060F0B;
    --deep:     #0B1F15;
    --forest:   #1B5E4A;
    --mid:      #2E7D55;
    --accent:   #436850;
    --mint:     #87D1B9;
    --pale:     #ADBC9F;
    --cream:    #CEC0BB;
    --glass:    rgba(255,255,255,0.06);
    --glassh:   rgba(255,255,255,0.12);
    --border:   rgba(135,209,185,0.15);
    --gold:     #E6B84A;
    --amber:    #f57c00;
    --red:      #d32f2f;
    --blue:     #1565C0;
    --stencil:  'Saira Stencil One', cursive;
    --oswald:   'Oswald', sans-serif;
    --body:     'Barlow', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .sa-root {
    display: flex; height: 100vh; font-family: var(--body);
    background: var(--dark); color: white; overflow: hidden;
  }

  /* SIDEBAR */
  .sa-sidebar {
    width: 270px; flex-shrink: 0;
    background: var(--deep);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
  }
  .sa-sidebar::before {
    content: ''; position: absolute; bottom: -80px; left: -80px;
    width: 250px; height: 250px;
    background: radial-gradient(circle, rgba(135,209,185,0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  .sa-sidebar::after {
    content: ''; position: absolute; top: 0; right: 0;
    width: 2px; height: 100%;
    background: linear-gradient(to bottom, transparent, rgba(135,209,185,0.3), transparent);
  }
  .sa-brand {
    padding: 26px 22px 18px;
    border-bottom: 1px solid var(--border);
    position: relative;
  }
  .sa-brand-crown { font-size: 20px; margin-bottom: 6px; }
  .sa-brand-title {
    font-family: var(--stencil); font-size: 14px;
    color: var(--gold); letter-spacing: 2px; line-height: 1.3;
  }
  .sa-brand-sub {
    font-family: var(--oswald); font-size: 9px; font-weight: 300;
    color: rgba(230,184,74,0.5); letter-spacing: 3px; margin-top: 4px;
  }
  .sa-nav { flex: 1; padding: 14px 10px; overflow-y: auto; }
  .sa-nav-section { margin-bottom: 20px; }
  .sa-nav-label {
    font-family: var(--oswald); font-size: 9px; font-weight: 600;
    color: rgba(135,209,185,0.35); letter-spacing: 3px;
    padding: 0 12px; margin-bottom: 6px; text-transform: uppercase;
  }
  .sa-nav-item {
    display: flex; align-items: center; gap: 11px;
    padding: 10px 13px; border-radius: 10px; cursor: pointer;
    font-family: var(--oswald); font-size: 12px; font-weight: 400;
    color: rgba(255,255,255,0.5); letter-spacing: 0.5px;
    transition: all 0.25s ease; margin-bottom: 2px; border: none;
    background: transparent; width: 100%; text-align: left;
  }
  .sa-nav-item:hover { background: var(--glass); color: white; }
  .sa-nav-item.active {
    background: linear-gradient(135deg, rgba(27,94,74,0.6), rgba(46,125,85,0.4));
    color: var(--mint); border: 1px solid rgba(135,209,185,0.15);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  .sa-nav-item.gold-active {
    background: linear-gradient(135deg, rgba(230,184,74,0.15), rgba(230,184,74,0.08));
    color: var(--gold); border: 1px solid rgba(230,184,74,0.2);
  }
  .sa-nav-icon { font-size: 15px; flex-shrink: 0; }
  .sa-nav-badge {
    margin-left: auto; background: var(--gold); color: var(--dark);
    border-radius: 10px; font-size: 9px; font-weight: 800;
    padding: 2px 6px; font-family: var(--oswald);
  }
  .sa-sidebar-footer {
    padding: 14px; border-top: 1px solid var(--border);
  }
  .sa-role-tag {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(230,184,74,0.08); border: 1px solid rgba(230,184,74,0.25);
    border-radius: 10px; padding: 10px 14px; width: 100%;
  }
  .sa-role-dot { width: 8px; height: 8px; background: var(--gold); border-radius: 50%; box-shadow: 0 0 8px rgba(230,184,74,0.5); }
  .sa-role-text { font-family: var(--oswald); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: var(--gold); }

  /* MAIN */
  .sa-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .sa-topbar {
    padding: 16px 30px; background: var(--deep);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  }
  .sa-page-title { font-family: var(--stencil); font-size: 20px; color: var(--gold); letter-spacing: 2px; }
  .sa-topbar-right { display: flex; align-items: center; gap: 14px; }
  .sa-topbar-badge {
    background: rgba(230,184,74,0.1); border: 1px solid rgba(230,184,74,0.2);
    border-radius: 8px; padding: 6px 14px;
    font-family: var(--oswald); font-size: 11px; font-weight: 600; letter-spacing: 1px; color: var(--gold);
  }
  .sa-search {
    background: var(--glass); border: 1px solid var(--border); border-radius: 10px;
    padding: 8px 16px; display: flex; align-items: center; gap: 10px;
    transition: all 0.3s ease;
  }
  .sa-search:focus-within { border-color: var(--gold); }
  .sa-search input {
    background: transparent; border: none; outline: none;
    color: white; font-family: var(--body); font-size: 13px; width: 180px;
  }
  .sa-search input::placeholder { color: rgba(255,255,255,0.3); }
  .sa-content { flex: 1; overflow-y: auto; padding: 26px 30px; }

  /* STATS */
  .sa-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 14px; margin-bottom: 26px; }
  .sa-stat-card {
    background: var(--glass); border: 1px solid var(--border);
    border-radius: 14px; padding: 18px; position: relative; overflow: hidden;
    transition: transform 0.2s;
  }
  .sa-stat-card:hover { transform: translateY(-2px); }
  .sa-stat-card.gold-card { border-color: rgba(230,184,74,0.2); background: rgba(230,184,74,0.04); }
  .sa-stat-label { font-family: var(--oswald); font-size: 9px; font-weight: 600; letter-spacing: 2px; color: var(--mint); margin-bottom: 8px; }
  .sa-stat-label.gold { color: var(--gold); }
  .sa-stat-num { font-family: var(--stencil); font-size: 30px; color: white; line-height: 1; }
  .sa-stat-num.gold { color: var(--gold); }
  .sa-stat-sub { font-family: var(--body); font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 4px; }
  .sa-stat-icon { position: absolute; top: 16px; right: 16px; font-size: 20px; opacity: 0.25; }

  /* SECTION HEADER */
  .sa-section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px; flex-wrap: wrap; gap: 10px;
  }
  .sa-section-title { font-family: var(--stencil); font-size: 15px; color: var(--mint); letter-spacing: 1px; }
  .sa-section-title.gold { color: var(--gold); }

  /* BUTTONS */
  .sa-btn-primary {
    background: linear-gradient(135deg, var(--forest), var(--mid));
    border: none; border-radius: 10px; padding: 9px 18px;
    font-family: var(--oswald); font-size: 11px; font-weight: 700;
    color: white; cursor: pointer; letter-spacing: 1px; transition: all 0.2s;
    display: flex; align-items: center; gap: 8px;
  }
  .sa-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(27,94,74,0.4); }
  .sa-btn-gold {
    background: linear-gradient(135deg, rgba(230,184,74,0.2), rgba(230,184,74,0.1));
    border: 1px solid rgba(230,184,74,0.3); border-radius: 10px; padding: 9px 18px;
    font-family: var(--oswald); font-size: 11px; font-weight: 700;
    color: var(--gold); cursor: pointer; letter-spacing: 1px; transition: all 0.2s;
  }
  .sa-btn-gold:hover { background: rgba(230,184,74,0.25); transform: translateY(-1px); }
  .sa-btn-danger {
    background: rgba(211,47,47,0.1); border: 1px solid rgba(211,47,47,0.25);
    border-radius: 8px; padding: 7px 10px; color: #ef9a9a;
    cursor: pointer; transition: all 0.2s; font-size: 14px;
  }
  .sa-btn-danger:hover { background: rgba(211,47,47,0.25); }
  .sa-filter-btn {
    background: transparent; border: 1px solid var(--border); border-radius: 8px;
    padding: 6px 13px; font-family: var(--oswald); font-size: 11px; font-weight: 600;
    color: rgba(255,255,255,0.45); cursor: pointer; letter-spacing: 1px; transition: all 0.2s;
  }
  .sa-filter-btn.active { background: var(--forest); border-color: var(--mint); color: var(--mint); }
  .sa-filter-btn:hover:not(.active) { border-color: rgba(135,209,185,0.3); color: white; }

  /* TABLE */
  .sa-table-wrap {
    background: var(--glass); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden; overflow-x: auto;
  }
  .sa-table-wrap.gold-wrap { border-color: rgba(230,184,74,0.15); }
  .sa-table { width: 100%; border-collapse: collapse; min-width: 580px; }
  .sa-table thead tr { background: rgba(27,94,74,0.35); }
  .sa-table.gold-table thead tr { background: rgba(230,184,74,0.08); }
  .sa-table th {
    padding: 14px 18px; text-align: left;
    font-family: var(--oswald); font-size: 9px; font-weight: 700;
    letter-spacing: 2px; color: var(--mint); text-transform: uppercase;
    border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  .sa-table.gold-table th { color: var(--gold); border-bottom-color: rgba(230,184,74,0.15); }
  .sa-table td {
    padding: 13px 18px; border-bottom: 1px solid rgba(135,209,185,0.05);
    font-family: var(--body); font-size: 13px; color: rgba(255,255,255,0.8);
  }
  .sa-table tbody tr { transition: background 0.15s; }
  .sa-table tbody tr:hover { background: rgba(255,255,255,0.03); }
  .sa-table tbody tr:last-child td { border-bottom: none; }

  /* AVATAR */
  .sa-avatar {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, var(--forest), var(--mid));
    display: flex; align-items: center; justify-content: center;
    font-family: var(--oswald); font-size: 12px; font-weight: 700; color: white;
    flex-shrink: 0;
  }
  .sa-avatar.gold { background: linear-gradient(135deg, rgba(230,184,74,0.3), rgba(230,184,74,0.1)); color: var(--gold); }
  .sa-user-cell { display: flex; align-items: center; gap: 12px; }
  .sa-user-name { font-family: var(--oswald); font-size: 13px; font-weight: 600; color: white; }
  .sa-user-email { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; }

  /* BADGES */
  .sa-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 9px; border-radius: 6px;
    font-family: var(--oswald); font-size: 9px; font-weight: 700; letter-spacing: 1px;
  }
  .sa-badge-sa { background: rgba(230,184,74,0.15); color: var(--gold); border: 1px solid rgba(230,184,74,0.3); }
  .sa-badge-admin { background: rgba(21,101,192,0.2); color: #64b5f6; border: 1px solid rgba(21,101,192,0.3); }
  .sa-badge-teacher { background: rgba(245,124,0,0.15); color: #ffb74d; border: 1px solid rgba(245,124,0,0.3); }
  .sa-badge-student { background: rgba(27,94,74,0.3); color: var(--mint); border: 1px solid var(--border); }
  .sa-badge-pending { background: rgba(245,124,0,0.1); color: #ffb74d; border: 1px solid rgba(245,124,0,0.3); }
  .sa-badge-approved { background: rgba(27,94,74,0.3); color: var(--mint); border: 1px solid var(--border); }
  .sa-badge-rejected { background: rgba(211,47,47,0.15); color: #ef9a9a; border: 1px solid rgba(211,47,47,0.3); }
  .sa-badge-active { background: rgba(27,94,74,0.3); color: var(--mint); border: 1px solid var(--border); }
  .sa-badge-inactive { background: rgba(211,47,47,0.1); color: #ef9a9a; border: 1px solid rgba(211,47,47,0.2); }

  /* PROGRESS */
  .sa-progress-wrap { display: flex; align-items: center; gap: 10px; }
  .sa-progress-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; min-width: 70px; }
  .sa-progress-fill { height: 100%; border-radius: 2px; }
  .sa-progress-pct { font-family: var(--oswald); font-size: 11px; font-weight: 600; min-width: 34px; text-align: right; }

  /* SELECT */
  .sa-select {
    background: rgba(27,94,74,0.15); border: 1px solid var(--border);
    border-radius: 8px; padding: 7px 12px; color: white;
    font-family: var(--oswald); font-size: 11px; cursor: pointer; outline: none;
  }
  .sa-select option { background: var(--deep); }

  /* ACTIONS */
  .sa-actions { display: flex; align-items: center; gap: 7px; }
  .sa-act-btn {
    border: none; border-radius: 7px; padding: 6px 11px;
    font-family: var(--oswald); font-size: 10px; font-weight: 600;
    letter-spacing: 0.5px; cursor: pointer; transition: all 0.2s;
  }
  .sa-act-approve { background: rgba(27,94,74,0.3); color: var(--mint); border: 1px solid var(--border); }
  .sa-act-approve:hover { background: var(--forest); }
  .sa-act-reject { background: rgba(211,47,47,0.1); color: #ef9a9a; border: 1px solid rgba(211,47,47,0.3); }
  .sa-act-reject:hover { background: rgba(211,47,47,0.25); }
  .sa-act-view { background: rgba(21,101,192,0.12); color: #64b5f6; border: 1px solid rgba(21,101,192,0.25); }
  .sa-act-view:hover { background: rgba(21,101,192,0.25); }
  .sa-act-gold { background: rgba(230,184,74,0.1); color: var(--gold); border: 1px solid rgba(230,184,74,0.25); }
  .sa-act-gold:hover { background: rgba(230,184,74,0.2); }

  /* MODAL */
  .sa-modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px); z-index: 1000;
    display: flex; align-items: center; justify-content: center;
  }
  .sa-modal {
    background: var(--deep); border: 1px solid var(--border);
    border-radius: 22px; padding: 34px; width: 480px; max-width: 95vw;
    max-height: 88vh; overflow-y: auto;
    animation: saModalIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .sa-modal.gold-modal { border-color: rgba(230,184,74,0.2); }
  @keyframes saModalIn { from { transform: scale(0.88); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .sa-modal-title { font-family: var(--stencil); font-size: 16px; color: var(--mint); letter-spacing: 2px; margin-bottom: 22px; }
  .sa-modal-title.gold { color: var(--gold); }
  .sa-modal-field { margin-bottom: 14px; }
  .sa-modal-label { font-family: var(--oswald); font-size: 9px; font-weight: 700; letter-spacing: 2px; color: var(--mint); margin-bottom: 6px; display: block; }
  .sa-modal-label.gold { color: var(--gold); }
  .sa-modal-input {
    width: 100%; background: var(--glass); border: 1px solid var(--border);
    border-radius: 10px; padding: 10px 13px; color: white;
    font-family: var(--body); font-size: 13px; outline: none; transition: border-color 0.2s;
  }
  .sa-modal-input:focus { border-color: var(--mint); }
  .sa-modal-row { display: flex; gap: 12px; }
  .sa-modal-btns { display: flex; gap: 10px; margin-top: 22px; }
  .sa-modal-cancel {
    flex: 1; background: transparent; border: 1px solid var(--border);
    border-radius: 10px; padding: 11px; font-family: var(--oswald);
    font-size: 11px; font-weight: 600; letter-spacing: 1px; color: rgba(255,255,255,0.5);
    cursor: pointer; transition: all 0.2s;
  }
  .sa-modal-cancel:hover { background: var(--glass); color: white; }
  .sa-modal-submit {
    flex: 2; background: linear-gradient(135deg, var(--forest), var(--mid));
    border: none; border-radius: 10px; padding: 11px; font-family: var(--oswald);
    font-size: 11px; font-weight: 700; letter-spacing: 2px; color: white;
    cursor: pointer; transition: all 0.2s;
  }
  .sa-modal-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(27,94,74,0.4); }
  .sa-modal-submit.gold {
    background: linear-gradient(135deg, rgba(230,184,74,0.4), rgba(230,184,74,0.2));
    color: var(--gold); border: 1px solid rgba(230,184,74,0.3);
  }

  /* DETAIL GRID */
  .sa-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
  .sa-detail-item { background: var(--glass); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
  .sa-detail-key { font-family: var(--oswald); font-size: 9px; letter-spacing: 2px; color: rgba(135,209,185,0.5); margin-bottom: 3px; }
  .sa-detail-val { font-family: var(--oswald); font-size: 13px; color: white; }

  /* TABS */
  .sa-tabs { display: flex; gap: 4px; margin-bottom: 18px; background: rgba(0,0,0,0.25); border-radius: 12px; padding: 4px; }
  .sa-tab {
    flex: 1; padding: 8px; border: none; border-radius: 9px;
    font-family: var(--oswald); font-size: 11px; font-weight: 600; letter-spacing: 1px;
    cursor: pointer; background: transparent; color: rgba(255,255,255,0.4); transition: all 0.2s;
  }
  .sa-tab.active { background: var(--forest); color: white; }
  .sa-tab.gold-tab.active { background: rgba(230,184,74,0.2); color: var(--gold); }

  /* OVERVIEW CARDS */
  .sa-overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 14px; }
  .sa-ov-card {
    background: var(--glass); border: 1px solid var(--border);
    border-radius: 14px; padding: 20px;
  }
  .sa-ov-card.gold-ov { border-color: rgba(230,184,74,0.15); }
  .sa-ov-title { font-family: var(--stencil); font-size: 12px; color: var(--mint); letter-spacing: 1px; margin-bottom: 14px; }
  .sa-ov-title.gold { color: var(--gold); }

  /* CONFIG PANEL */
  .sa-config-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap: 14px; }
  .sa-config-card {
    background: var(--glass); border: 1px solid rgba(230,184,74,0.1);
    border-radius: 14px; padding: 22px;
  }
  .sa-config-title { font-family: var(--stencil); font-size: 12px; color: var(--gold); letter-spacing: 1px; margin-bottom: 16px; }
  .sa-config-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 0; border-bottom: 1px solid rgba(135,209,185,0.06);
  }
  .sa-config-item:last-child { border-bottom: none; }
  .sa-config-label { font-family: var(--oswald); font-size: 12px; color: rgba(255,255,255,0.7); letter-spacing: 0.5px; }
  .sa-config-desc { font-size: 11px; color: rgba(255,255,255,0.3); font-family: var(--body); margin-top: 2px; }

  /* TOGGLE */
  .sa-toggle { position: relative; display: inline-block; width: 40px; height: 22px; }
  .sa-toggle input { opacity: 0; width: 0; height: 0; }
  .sa-toggle-slider {
    position: absolute; cursor: pointer; inset: 0;
    background: rgba(255,255,255,0.1); border-radius: 22px;
    border: 1px solid var(--border); transition: 0.3s;
  }
  .sa-toggle-slider::before {
    content: ''; position: absolute; height: 14px; width: 14px;
    left: 3px; bottom: 3px; background: rgba(255,255,255,0.4);
    border-radius: 50%; transition: 0.3s;
  }
  .sa-toggle input:checked + .sa-toggle-slider { background: rgba(27,94,74,0.5); border-color: var(--mint); }
  .sa-toggle input:checked + .sa-toggle-slider::before { transform: translateX(18px); background: var(--mint); }

  /* SYSTEM LOG */
  .sa-log-item {
    padding: 10px 14px; border-radius: 8px; margin-bottom: 6px;
    background: var(--glass); border: 1px solid var(--border);
    display: flex; align-items: flex-start; gap: 12px;
  }
  .sa-log-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .sa-log-text { font-family: var(--body); font-size: 12px; color: rgba(255,255,255,0.7); }
  .sa-log-time { font-family: var(--oswald); font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 2px; letter-spacing: 1px; }

  /* TOAST */
  .sa-toast {
    position: fixed; bottom: 24px; right: 24px;
    background: rgba(27,94,74,0.9); border: 1px solid var(--mint);
    border-radius: 12px; padding: 12px 20px;
    font-family: var(--oswald); font-size: 12px; letter-spacing: 0.5px;
    color: white; z-index: 9999; animation: toastIn 0.3s ease;
  }
  @keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* LOADING / EMPTY */
  .sa-loading { text-align: center; padding: 50px; color: rgba(255,255,255,0.25); font-family: var(--oswald); letter-spacing: 2px; font-size: 11px; }
  .sa-spinner { width: 28px; height: 28px; border: 2px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .sa-empty { text-align: center; padding: 50px 20px; color: rgba(255,255,255,0.25); }
  .sa-empty-icon { font-size: 36px; margin-bottom: 10px; opacity: 0.4; }
  .sa-empty-text { font-family: var(--oswald); font-size: 11px; letter-spacing: 1px; }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(135,209,185,0.2); border-radius: 2px; }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .sa-sidebar { display: none; }
    .sa-topbar { padding: 12px 14px; }
    .sa-content { padding: 14px; }
    .sa-detail-grid { grid-template-columns: 1fr; }
    .sa-modal-row { flex-direction: column; }
    .sa-stats { grid-template-columns: repeat(2, 1fr); }
    .sa-config-grid { grid-template-columns: 1fr; }
    .sa-overview-grid { grid-template-columns: 1fr; }
  }
`;

const API = 'http://localhost:5001/api';
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const pctColor = (p) => p >= 75 ? '#87D1B9' : p >= 50 ? '#ffb74d' : '#ef9a9a';

const Spinner = () => (
  <div className="sa-loading">
    <div className="sa-spinner" />
    LOADING...
  </div>
);

const ProgressBar = ({ pct }) => (
  <div className="sa-progress-wrap">
    <div className="sa-progress-bar">
      <div className="sa-progress-fill" style={{ width: `${pct}%`, background: pctColor(pct) }} />
    </div>
    <span className="sa-progress-pct" style={{ color: pctColor(pct) }}>{pct}%</span>
  </div>
);

const RoleBadge = ({ role }) => {
  if (role === 'super_admin') return <span className="sa-badge sa-badge-sa">★ SUPER ADMIN</span>;
  if (role === 'admin') return <span className="sa-badge sa-badge-admin">⬡ ADMIN</span>;
  if (role === 'teacher') return <span className="sa-badge sa-badge-teacher">▲ TEACHER</span>;
  return <span className="sa-badge sa-badge-student">◆ STUDENT</span>;
};

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
      if (res.ok) { onSuccess('User added!'); onClose(); }
      else alert(d.error || 'Failed');
    } catch { alert('Network error'); }
    setSaving(false);
  };

  return (
    <div className="sa-modal-backdrop" onClick={onClose}>
      <div className="sa-modal" onClick={e => e.stopPropagation()}>
        <div className="sa-modal-title">ADD NEW USER</div>
        <div className="sa-modal-field">
          <label className="sa-modal-label">FULL NAME</label>
          <input className="sa-modal-input" placeholder="Full name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div className="sa-modal-row">
          <div className="sa-modal-field" style={{ flex: 1 }}>
            <label className="sa-modal-label">EMAIL</label>
            <input className="sa-modal-input" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="sa-modal-field" style={{ flex: 1 }}>
            <label className="sa-modal-label">CONTACT</label>
            <input className="sa-modal-input" placeholder="10 digits" maxLength={10} value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
          </div>
        </div>
        <div className="sa-modal-row">
          <div className="sa-modal-field" style={{ flex: 1 }}>
            <label className="sa-modal-label">PASSWORD</label>
            <input className="sa-modal-input" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="sa-modal-field" style={{ flex: 1 }}>
            <label className="sa-modal-label">ROLE</label>
            <select className="sa-modal-input sa-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="user">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="sa-modal-btns">
          <button className="sa-modal-cancel" onClick={onClose}>CANCEL</button>
          <button className="sa-modal-submit" onClick={handleSubmit} disabled={saving}>{saving ? 'ADDING...' : 'ADD USER'}</button>
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

  const attPct = analytics?.attendance || 0;
  const assignDone = (submissions?.assignments || []).filter(a => a.submitted).length;
  const assignTotal = (submissions?.assignments || []).length;
  const projDone = (submissions?.projects || []).filter(p => p.submitted).length;
  const projTotal = (submissions?.projects || []).length;

  return (
    <div className="sa-modal-backdrop" onClick={onClose}>
      <div className="sa-modal" style={{ width: 540 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div className="sa-avatar" style={{ width: 48, height: 48, fontSize: 17 }}>{initials(user.fullName)}</div>
          <div>
            <div className="sa-modal-title" style={{ marginBottom: 3 }}>{user.fullName}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--body)' }}>{user.email}</div>
          </div>
        </div>

        {user.role === 'user' && (
          <div className="sa-tabs">
            {['overview', 'attendance', 'submissions'].map(t => (
              <button key={t} className={`sa-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {tab === 'overview' && (
          <>
            <div className="sa-detail-grid">
              <div className="sa-detail-item"><div className="sa-detail-key">ROLE</div><div className="sa-detail-val">{user.role?.toUpperCase()}</div></div>
              <div className="sa-detail-item"><div className="sa-detail-key">STATUS</div><div className="sa-detail-val">{user.approvalStatus || 'N/A'}</div></div>
              <div className="sa-detail-item"><div className="sa-detail-key">CONTACT</div><div className="sa-detail-val">{user.contact || '—'}</div></div>
              <div className="sa-detail-item"><div className="sa-detail-key">DOMAIN</div><div className="sa-detail-val">{user.domain || '—'}</div></div>
              <div className="sa-detail-item"><div className="sa-detail-key">REGISTERED</div><div className="sa-detail-val">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</div></div>
              <div className="sa-detail-item"><div className="sa-detail-key">APPROVED</div><div className="sa-detail-val">{user.approvedAt ? new Date(user.approvedAt).toLocaleDateString() : '—'}</div></div>
            </div>
            {user.role === 'user' && analytics && (
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                {[
                  { label: 'ATTENDANCE', val: `${attPct}%`, color: pctColor(attPct) },
                  { label: 'ASSIGNMENTS', val: `${assignTotal > 0 ? Math.round((assignDone / assignTotal) * 100) : 0}%`, color: '#64b5f6' },
                  { label: 'PROJECTS', val: `${projTotal > 0 ? Math.round((projDone / projTotal) * 100) : 0}%`, color: '#ffb74d' },
                ].map(item => (
                  <div key={item.label} className="sa-detail-item" style={{ flex: 1, textAlign: 'center' }}>
                    <div className="sa-detail-key">{item.label}</div>
                    <div style={{ fontFamily: 'var(--stencil)', fontSize: 22, color: item.color }}>{item.val}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'attendance' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div className="sa-detail-item" style={{ flex: 1 }}>
                <div className="sa-detail-key">ATTENDED</div>
                <div style={{ fontFamily: 'var(--stencil)', fontSize: 22, color: 'var(--mint)' }}>{analytics?.classesAttended || 0}</div>
              </div>
              <div className="sa-detail-item" style={{ flex: 1 }}>
                <div className="sa-detail-key">TOTAL</div>
                <div style={{ fontFamily: 'var(--stencil)', fontSize: 22 }}>{analytics?.totalClasses || 0}</div>
              </div>
              <div className="sa-detail-item" style={{ flex: 1 }}>
                <div className="sa-detail-key">PERCENTAGE</div>
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
                <div style={{ fontFamily: 'var(--oswald)', fontSize: 10, letterSpacing: 1, color: 'var(--mint)', marginBottom: 10 }}>
                  ASSIGNMENTS — {assignDone}/{assignTotal}
                </div>
                {(submissions.assignments || []).slice(0, 5).map(a => (
                  <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(135,209,185,0.07)' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--body)' }}>{a.title}</span>
                    <span className={`sa-badge ${a.submitted ? 'sa-badge-approved' : 'sa-badge-rejected'}`}>{a.submitted ? '✓' : '✗'}</span>
                  </div>
                ))}
                <div style={{ fontFamily: 'var(--oswald)', fontSize: 10, letterSpacing: 1, color: 'var(--mint)', margin: '10px 0 8px' }}>
                  PROJECTS — {projDone}/{projTotal}
                </div>
                {(submissions.projects || []).slice(0, 5).map(p => (
                  <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(135,209,185,0.07)' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--body)' }}>{p.title}</span>
                    <span className={`sa-badge ${p.submitted ? 'sa-badge-approved' : 'sa-badge-rejected'}`}>{p.submitted ? '✓' : '✗'}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        <button className="sa-modal-cancel" style={{ marginTop: 18, width: '100%' }} onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
};

/* ─── OVERVIEW SECTION ─── */
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

  return (
    <div>
      <div className="sa-stats">
        {[
          { label: 'TOTAL USERS', val: stats.total, icon: '👥', gold: false },
          { label: 'TEACHERS', val: stats.teachers, icon: '🎓', gold: false },
          { label: 'STUDENTS', val: stats.students, icon: '📚', gold: false },
          { label: 'PENDING', val: stats.pending, icon: '⏳', gold: false },
          { label: 'SUPER ADMIN', val: 1, icon: '★', gold: true },
        ].map(s => (
          <div key={s.label} className={`sa-stat-card ${s.gold ? 'gold-card' : ''}`}>
            <div className={`sa-stat-label ${s.gold ? 'gold' : ''}`}>{s.label}</div>
            <div className={`sa-stat-num ${s.gold ? 'gold' : ''}`}>{s.val}</div>
            <div className="sa-stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="sa-overview-grid">
        <div className="sa-ov-card">
          <div className="sa-ov-title">ADMIN SCOPE</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--body)', lineHeight: 2 }}>
            ✓ Manage all users (add / remove / role change)<br />
            ✓ Approve / reject registration requests<br />
            ✓ View student performance & attendance<br />
            ✓ Assign course domains to students<br />
            ✓ Manage teacher faculty
          </div>
        </div>
        <div className="sa-ov-card gold-ov">
          <div className="sa-ov-title gold">SUPER ADMIN EXTRAS</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--body)', lineHeight: 2 }}>
            ★ Promote users to Admin role<br />
            ★ System feature flags & configuration<br />
            ★ Audit logs & system health monitoring<br />
            ★ Promote / demote Admin accounts<br />
            ★ Full unrestricted access to all data
          </div>
        </div>
        <div className="sa-ov-card">
          <div className="sa-ov-title">QUICK STATUS</div>
          {[
            { label: 'Teachers', val: stats.teachers },
            { label: 'Active Students', val: stats.students },
            { label: 'Pending Requests', val: stats.pending },
            { label: 'Total Users', val: stats.total },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(135,209,185,0.07)' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--body)' }}>{item.label}</span>
              <span style={{ fontFamily: 'var(--stencil)', fontSize: 16, color: 'var(--mint)' }}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── ALL USERS SECTION (full control) ─── */
const AllUsersSection = ({ toast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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
    } catch { toast('Error'); }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/users/${userId}`, { method: 'DELETE' });
      if (res.ok) { toast('User deleted!'); fetchUsers(); }
    } catch { toast('Error'); }
  };

  const filters = ['all', 'teacher', 'student', 'admin'];
  const filtered = users.filter(u => {
    if (filter === 'all') return true;
    if (filter === 'admin') return u.role === 'admin';
    if (filter === 'teacher') return u.role === 'teacher';
    if (filter === 'student') return u.role === 'user';
    return true;
  });

  return (
    <div>
      <div className="sa-stats">
        {[
          { label: 'TOTAL', val: users.length, icon: '👥' },
          { label: 'ADMINS', val: users.filter(u => u.role === 'admin').length, icon: '⬡' },
          { label: 'TEACHERS', val: users.filter(u => u.role === 'teacher').length, icon: '🎓' },
          { label: 'STUDENTS', val: users.filter(u => u.role === 'user').length, icon: '📚' },
        ].map(s => (
          <div key={s.label} className="sa-stat-card">
            <div className="sa-stat-label">{s.label}</div>
            <div className="sa-stat-num">{s.val}</div>
            <div className="sa-stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="sa-section-header">
        <span className="sa-section-title">ALL USERS</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {filters.map(f => (
              <button key={f} className={`sa-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="sa-btn-primary" onClick={() => setShowAdd(true)}>＋ ADD USER</button>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="sa-table-wrap">
          <table className="sa-table">
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
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--oswald)', letterSpacing: 2 }}>NO USERS FOUND</td></tr>
              ) : filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="sa-user-cell">
                      <div className="sa-avatar">{initials(u.fullName)}</div>
                      <div>
                        <div className="sa-user-name">{u.fullName}</div>
                        <div className="sa-user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><RoleBadge role={u.role} /></td>
                  <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'var(--oswald)' }}>{u.domain || '—'}</td>
                  <td>
                    <span className={`sa-badge ${u.approvalStatus === 'APPROVED' ? 'sa-badge-approved' : u.approvalStatus === 'PENDING' ? 'sa-badge-pending' : 'sa-badge-rejected'}`}>
                      {u.approvalStatus || 'N/A'}
                    </span>
                  </td>
                  <td>
                    {/* Super Admin can assign ALL roles including admin */}
                    <select className="sa-select" value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}>
                      <option value="user">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <div className="sa-actions">
                      <button className="sa-act-btn sa-act-view" onClick={() => setDetail(u)}>👁 VIEW</button>
                      <button className="sa-btn-danger" onClick={() => handleDelete(u._id, u.fullName)}>🗑</button>
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

/* ─── APPROVALS SECTION ─── */
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
      if (res.ok) { toast(`User ${action}d successfully!`); fetchPending(); }
    } catch { toast('Error'); }
  };

  return (
    <div>
      <div className="sa-stats">
        <div className="sa-stat-card">
          <div className="sa-stat-label">PENDING REQUESTS</div>
          <div className="sa-stat-num">{pending.length}</div>
          <div className="sa-stat-sub">Awaiting decision</div>
          <div className="sa-stat-icon">⏳</div>
        </div>
      </div>

      <div className="sa-section-header">
        <span className="sa-section-title">REGISTRATION REQUESTS</span>
        <button className="sa-filter-btn" onClick={fetchPending}>↻ REFRESH</button>
      </div>

      {loading ? <Spinner /> : pending.length === 0 ? (
        <div className="sa-table-wrap">
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'rgba(255,255,255,0.25)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
            <div style={{ fontFamily: 'var(--oswald)', letterSpacing: 2, fontSize: 12 }}>ALL REQUESTS PROCESSED</div>
          </div>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>APPLICANT</th>
                <th>CONTACT</th>
                <th>REGISTERED</th>
                <th>DECISION</th>
              </tr>
            </thead>
            <tbody>
              {pending.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="sa-user-cell">
                      <div className="sa-avatar">{initials(u.fullName)}</div>
                      <div>
                        <div className="sa-user-name">{u.fullName}</div>
                        <div className="sa-user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--body)' }}>{u.contact || '—'}</td>
                  <td style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--body)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="sa-actions">
                      <button className="sa-act-btn sa-act-approve" onClick={() => handleAction(u._id, 'approve')}>✓ APPROVE</button>
                      <button className="sa-act-btn sa-act-reject" onClick={() => handleAction(u._id, 'reject')}>✗ REJECT</button>
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

/* ─── STUDENTS SECTION ─── */
const StudentsSection = ({ toast }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users`);
      const d = await res.json();
      setStudents((Array.isArray(d) ? d : []).filter(u => u.role === 'user'));
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
      <div className="sa-stats">
        {[
          { label: 'TOTAL STUDENTS', val: students.length, icon: '📚' },
          { label: 'WITH DOMAIN', val: students.filter(s => s.domain).length, icon: '🎯' },
          { label: 'APPROVED', val: students.filter(s => s.approvalStatus === 'APPROVED').length, icon: '✅' },
          { label: 'PENDING', val: students.filter(s => s.approvalStatus === 'PENDING').length, icon: '⏳' },
        ].map(s => (
          <div key={s.label} className="sa-stat-card">
            <div className="sa-stat-label">{s.label}</div>
            <div className="sa-stat-num">{s.val}</div>
            <div className="sa-stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="sa-section-header">
        <span className="sa-section-title">STUDENT ROSTER</span>
        <div className="sa-search">
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>🔍</span>
          <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="sa-table-wrap">
          <table className="sa-table">
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
              {filtered.map(s => (
                <tr key={s._id}>
                  <td>
                    <div className="sa-user-cell">
                      <div className="sa-avatar">{initials(s.fullName)}</div>
                      <div>
                        <div className="sa-user-name">{s.fullName}</div>
                        <div className="sa-user-email">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {s.domain
                      ? <span className="sa-badge sa-badge-student">{s.domain}</span>
                      : <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--oswald)' }}>NONE</span>}
                  </td>
                  <td>
                    <span className={`sa-badge ${s.approvalStatus === 'APPROVED' ? 'sa-badge-approved' : 'sa-badge-pending'}`}>{s.approvalStatus}</span>
                  </td>
                  <td>
                    <select className="sa-select" value={s.domain || ''} onChange={e => handleDomain(s._id, e.target.value)}>
                      {DOMAINS.map(d => <option key={d} value={d}>{d || '— None —'}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="sa-act-btn sa-act-view" onClick={() => setDetail(s)}>👁 DETAILS</button>
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

/* ─── TEACHERS SECTION ─── */
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

  const handleDemote = async (id, name) => {
    if (!window.confirm(`Demote ${name} to Student?`)) return;
    try {
      const res = await fetch(`${API}/users/update-role`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, role: 'user' })
      });
      if (res.ok) { toast('Role changed!'); fetchTeachers(); }
    } catch { toast('Error'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete teacher ${name}?`)) return;
    try {
      const res = await fetch(`${API}/users/${id}`, { method: 'DELETE' });
      if (res.ok) { toast('Teacher removed!'); fetchTeachers(); }
    } catch { toast('Error'); }
  };

  return (
    <div>
      <div className="sa-stats">
        <div className="sa-stat-card">
          <div className="sa-stat-label">TOTAL TEACHERS</div>
          <div className="sa-stat-num">{teachers.length}</div>
          <div className="sa-stat-sub">Active faculty</div>
          <div className="sa-stat-icon">🎓</div>
        </div>
      </div>

      <div className="sa-section-header">
        <span className="sa-section-title">FACULTY MANAGEMENT</span>
      </div>

      {loading ? <Spinner /> : (
        <div className="sa-table-wrap">
          <table className="sa-table">
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
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--oswald)', letterSpacing: 2 }}>NO TEACHERS YET</td></tr>
              ) : teachers.map(t => (
                <tr key={t._id}>
                  <td>
                    <div className="sa-user-cell">
                      <div className="sa-avatar" style={{ background: 'linear-gradient(135deg, #bf6b00, #ff9800)' }}>{initials(t.fullName)}</div>
                      <div>
                        <div className="sa-user-name">{t.fullName}</div>
                        <div className="sa-user-email">{t.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--body)' }}>{t.contact || '—'}</td>
                  <td style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="sa-actions">
                      <button className="sa-act-btn sa-act-view" onClick={() => setDetail(t)}>👁 VIEW</button>
                      <button className="sa-act-btn sa-act-reject" onClick={() => handleDemote(t._id, t.fullName)}>↓ DEMOTE</button>
                      <button className="sa-btn-danger" onClick={() => handleDelete(t._id, t.fullName)}>🗑</button>
                    </div>
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

/* ─── SYSTEM CONFIG SECTION (Super Admin exclusive) ─── */
const SystemSection = ({ toast }) => {
  const [toggles, setToggles] = useState({
    registrations: true,
    googleLogin: true,
    emailNotifs: false,
    maintenanceMode: false,
    qrAttendance: true,
    assignmentSubmission: true,
    projectSubmission: true,
  });

  const toggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    toast('Setting updated!');
  };

  const logs = [
    { text: 'Super Admin login from Pune — session started', time: 'TODAY, 10:23 AM', color: '#87D1B9' },
    { text: 'User registration approved — Riya Sharma', time: 'TODAY, 09:48 AM', color: '#87D1B9' },
    { text: 'Role changed: user → teacher for Ramesh Patil', time: 'TODAY, 09:12 AM', color: '#ffb74d' },
    { text: 'User deleted — inactive account purged', time: 'YESTERDAY, 6:30 PM', color: '#ef9a9a' },
    { text: 'System backup completed successfully', time: 'YESTERDAY, 12:00 AM', color: '#87D1B9' },
    { text: 'New registration: Prakash Kulkarni — pending', time: '2 DAYS AGO', color: '#64b5f6' },
  ];

  const configs = [
    { key: 'registrations', label: 'Allow Registrations', desc: 'New users can register on the platform' },
    { key: 'googleLogin', label: 'Google OAuth Login', desc: 'Allow login via Google accounts' },
    { key: 'emailNotifs', label: 'Email Notifications', desc: 'Send emails for approvals & updates' },
    { key: 'qrAttendance', label: 'QR Attendance System', desc: 'Enable QR-based lecture attendance' },
    { key: 'assignmentSubmission', label: 'Assignment Submissions', desc: 'Students can submit assignments' },
    { key: 'projectSubmission', label: 'Project Submissions', desc: 'Students can submit project repos' },
    { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Restrict all access except Super Admin' },
  ];

  return (
    <div>
      <div className="sa-stats">
        {[
          { label: 'FEATURES ACTIVE', val: Object.values(toggles).filter(Boolean).length, icon: '⚡', gold: true },
          { label: 'FEATURES OFF', val: Object.values(toggles).filter(v => !v).length, icon: '⊘', gold: false },
          { label: 'SYSTEM STATUS', val: toggles.maintenanceMode ? '⚠' : '✓', icon: '', gold: !toggles.maintenanceMode },
        ].map(s => (
          <div key={s.label} className={`sa-stat-card ${s.gold ? 'gold-card' : ''}`}>
            <div className={`sa-stat-label ${s.gold ? 'gold' : ''}`}>{s.label}</div>
            <div className={`sa-stat-num ${s.gold ? 'gold' : ''}`}>{s.val}</div>
            <div className="sa-stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="sa-config-grid">
        <div>
          <div className="sa-section-header" style={{ marginBottom: 14 }}>
            <span className="sa-section-title gold">FEATURE FLAGS</span>
          </div>
          <div className="sa-table-wrap gold-wrap">
            <div style={{ padding: '8px 0' }}>
              {configs.map(c => (
                <div key={c.key} className="sa-config-item" style={{ padding: '14px 22px' }}>
                  <div>
                    <div className="sa-config-label">{c.label}</div>
                    <div className="sa-config-desc">{c.desc}</div>
                  </div>
                  <label className="sa-toggle">
                    <input type="checkbox" checked={toggles[c.key]} onChange={() => toggle(c.key)} />
                    <span className="sa-toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="sa-section-header" style={{ marginBottom: 14 }}>
            <span className="sa-section-title gold">AUDIT LOG</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} className="sa-log-item">
              <div className="sa-log-dot" style={{ background: log.color }} />
              <div>
                <div className="sa-log-text">{log.text}</div>
                <div className="sa-log-time">{log.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN COMPONENT ─── */
const Super_Admin = () => {
  const [page, setPage] = useState('overview');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const nav = [
    { id: 'overview', label: 'OVERVIEW', icon: '◈', section: 'GENERAL', gold: false },
    { id: 'users', label: 'ALL USERS', icon: '◉', section: 'GENERAL', gold: false },
    { id: 'approvals', label: 'APPROVALS', icon: '◎', section: 'REQUESTS', gold: false },
    { id: 'students', label: 'STUDENTS', icon: '▣', section: 'MANAGEMENT', gold: false },
    { id: 'teachers', label: 'TEACHERS', icon: '▲', section: 'MANAGEMENT', gold: false },
    { id: 'system', label: 'SYSTEM CONFIG', icon: '★', section: 'SUPER ADMIN', gold: true },
  ];

  const sections = [...new Set(nav.map(n => n.section))];
  const currentNav = nav.find(n => n.id === page);

  return (
    <>
      <style>{CSS}</style>
      <div className="sa-root">
        {/* SIDEBAR */}
        <aside className="sa-sidebar">
          <div className="sa-brand">
            <div className="sa-brand-crown">★</div>
            <div className="sa-brand-title">FORTUNE CLOUD</div>
            <div className="sa-brand-sub">SUPER ADMIN PANEL</div>
          </div>
          <nav className="sa-nav">
            {sections.map(sec => (
              <div key={sec} className="sa-nav-section">
                <div className="sa-nav-label">{sec}</div>
                {nav.filter(n => n.section === sec).map(n => (
                  <button
                    key={n.id}
                    className={`sa-nav-item ${page === n.id ? (n.gold ? 'gold-active' : 'active') : ''}`}
                    onClick={() => setPage(n.id)}
                  >
                    <span className="sa-nav-icon" style={{ color: n.gold ? 'var(--gold)' : 'inherit' }}>{n.icon}</span>
                    <span style={{ color: n.gold && page !== n.id ? 'rgba(230,184,74,0.6)' : 'inherit' }}>{n.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="sa-sidebar-footer">
            <div className="sa-role-tag">
              <div className="sa-role-dot" />
              <span className="sa-role-text">SUPER ADMIN</span>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="sa-main">
          <div className="sa-topbar">
            <div className="sa-page-title">{currentNav?.label}</div>
            <div className="sa-topbar-right">
              <div className="sa-topbar-badge">★ SUPER ADMIN</div>
              <div className="sa-search">
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>🔍</span>
                <input placeholder="Search..." />
              </div>
            </div>
          </div>

          <div className="sa-content">
            {page === 'overview' && <OverviewSection />}
            {page === 'users' && <AllUsersSection toast={showToast} />}
            {page === 'approvals' && <ApprovalsSection toast={showToast} />}
            {page === 'students' && <StudentsSection toast={showToast} />}
            {page === 'teachers' && <TeachersSection toast={showToast} />}
            {page === 'system' && <SystemSection toast={showToast} />}
          </div>
        </div>
      </div>

      {toast && <div className="sa-toast">✓ {toast}</div>}
    </>
  );
};

export default Super_Admin;