import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  QrCode, BookOpen, ClipboardList, BarChart2, LogOut,
  Menu, X, CheckCircle, Clock, AlertTriangle, Wifi,
  WifiOff, Camera, Layers, Zap, Video, Calendar,
  CheckSquare, XSquare, Percent, Award, Bell, TrendingUp,
  User, Lock, Mail, Edit3, Save, Eye, EyeOff, RefreshCw,
  ShieldCheck, KeyRound
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import dayjs from 'dayjs';
// import './student_dashboard.css';
import '../styles/studentDashboard.css'

const NAV_ITEMS = [
  { id: 'dashboard',   icon: <Layers size={17}/>,       label: 'Dashboard'    },
  { id: 'attendance',  icon: <QrCode size={17}/>,        label: 'Attendance'   },
  { id: 'assignments', icon: <ClipboardList size={17}/>, label: 'Assignments'  },
  { id: 'projects',    icon: <BookOpen size={17}/>,      label: 'Projects'     },
  { id: 'analytics',   icon: <BarChart2 size={17}/>,     label: 'My Analytics' },
  { id: 'profile',     icon: <User size={17}/>,          label: 'My Profile'   },
];

/* ── SVG Ring ─────────────────────────────────────── */
const Ring = ({ pct, color, size = 78, stroke = 5, label }) => {
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (pct / 100) * circ;
  return (
    <div className="s-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(78,205,196,0.09)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)' }}/>
      </svg>
      <span className="s-ring-label">{label}</span>
    </div>
  );
};

/* ── Toast ────────────────────────────────────────── */
const ToastContainer = ({ toasts, removeToast }) => (
  <div className="s-toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`s-toast s-toast-${t.type}`}>
        {t.type === 'success' ? <CheckCircle size={15} className="s-toast-icon"/>
          : t.type === 'error' ? <AlertTriangle size={15} className="s-toast-icon"/>
          : <Bell size={15} className="s-toast-icon"/>}
        <span className="s-toast-msg">{t.message}</span>
        <button className="s-toast-close" onClick={() => removeToast(t.id)}><X size={13}/></button>
      </div>
    ))}
  </div>
);

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  const removeToast = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, toast, removeToast };
};

/* ── QR Scanner ───────────────────────────────────── */
const QRScanner = ({ onScan, onClose }) => {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const [error, setError]       = useState(null);
  const [scanning, setScanning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => { startCamera(); return () => stopCamera(); }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        intervalRef.current = setInterval(scanFrame, 300);
      }
    } catch { setError('Camera access denied. Please allow camera permissions.'); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject)
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    if (v.readyState !== v.HAVE_ENOUGH_DATA) return;
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    c.width = v.videoWidth; c.height = v.videoHeight;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const img = ctx.getImageData(0, 0, c.width, c.height);
    if (window.jsQR) {
      const code = window.jsQR(img.data, img.width, img.height);
      if (code) { stopCamera(); onScan(code.data); }
    }
  };

  return (
    <div className="s-scanner-overlay">
      <div className="s-scanner-modal">
        <button className="s-scanner-close" onClick={() => { stopCamera(); onClose(); }}>
          <X size={16}/>
        </button>
        <h3 className="s-scanner-title">Scan Attendance QR</h3>
        <p className="s-scanner-sub">Point at the QR code shown by your teacher</p>
        {error ? (
          <div className="s-scanner-error">
            <AlertTriangle size={34}/>
            <p>{error}</p>
          </div>
        ) : (
          <div className="s-scanner-frame">
            <video ref={videoRef} className="s-scanner-video" playsInline muted/>
            <canvas ref={canvasRef} style={{ display: 'none' }}/>
            <div className="s-scanner-line"/>
            <div className="s-sc s-sc-tl"/><div className="s-sc s-sc-tr"/>
            <div className="s-sc s-sc-bl"/><div className="s-sc s-sc-br"/>
            {scanning && (
              <div className="s-scanner-status">
                <Zap size={10}/> Scanning…
              </div>
            )}
          </div>
        )}
        <script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"/>
      </div>
    </div>
  );
};

/* ── Month Bar ────────────────────────────────────── */
const MonthBar = ({ month, present, total }) => {
  const pct = total ? Math.round((present / total) * 100) : 0;
  const color = pct >= 75 ? '#2ecc8f' : pct >= 50 ? '#f7c948' : '#e05c5c';
  return (
    <div className="s-month-col">
      <span className="s-month-pct">{pct}%</span>
      <div className="s-month-bar-track">
        <div className="s-month-bar-fill" style={{ height: `${pct}%`, background: color, borderRadius: '4px 4px 0 0' }}/>
      </div>
      <span className="s-month-name">{month}</span>
    </div>
  );
};

/* ══════════════════════════════════════════════════ */
/* ═══════════════ STUDENT DASHBOARD ═══════════════ */
/* ══════════════════════════════════════════════════ */
const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [isLoaded, setIsLoaded]           = useState(false);
  const { toasts, toast, removeToast }    = useToast();

  const [student, setStudent]             = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const studentRef = useRef(null);

  const [liveLecture, setLiveLecture]     = useState(null);
  const [showScanner, setShowScanner]     = useState(false);
  const [scanResult, setScanResult]       = useState(null);
  const [scanning, setScanning]           = useState(false);

  const [attendance, setAttendance]       = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  const [assignments, setAssignments]     = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [submitForm, setSubmitForm]       = useState({ assignmentId: '', fileUrl: '', note: '' });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting]       = useState(false);

  const [projects, setProjects]           = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm]     = useState({ projectId: '', repoUrl: '', note: '' });
  const [submittingProject, setSubmittingProject] = useState(false);

  const [monthlyStats, setMonthlyStats]   = useState([]);

  /* ── Profile state ── */
  const [profileTab, setProfileTab]       = useState('info');   // 'info' | 'password' | 'reset'

  // Edit name
  const [editingName, setEditingName]     = useState(false);
  const [nameValue, setNameValue]         = useState('');
  const [savingName, setSavingName]       = useState(false);

  // Change password
  const [pwForm, setPwForm]               = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw]               = useState({ current: false, newPw: false, confirm: false });
  const [savingPw, setSavingPw]           = useState(false);

  // Reset password via email
  const [resetEmail, setResetEmail]       = useState('');
  const [resetSent, setResetSent]         = useState(false);
  const [sendingReset, setSendingReset]   = useState(false);

  const token       = localStorage.getItem('token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  /* ── loaded animation trigger ── */
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── fetch helpers ── */
  const fetchAttendance = useCallback(async () => {
    try {
      const res = await axios.get('/api/attendance/mine', { headers: authHeaders });
      setAttendance(res.data.records || res.data || []);
    } catch { toast('Failed to load attendance', 'error'); }
    finally { setLoadingAttendance(false); }
  }, [token]);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await axios.get('/api/assignments/mine', { headers: authHeaders });
      setAssignments(res.data.assignments || res.data || []);
    } catch { toast('Failed to load assignments', 'error'); }
    finally { setLoadingAssignments(false); }
  }, [token]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get('/api/projects/mine', { headers: authHeaders });
      setProjects(res.data.projects || res.data || []);
    } catch { toast('Failed to load projects', 'error'); }
    finally { setLoadingProjects(false); }
  }, [token]);

  const fetchLiveLecture = useCallback(async (domain) => {
    if (!domain) return;
    try {
      const res = await axios.get(`/api/lectures/live?domain=${encodeURIComponent(domain)}`, { headers: authHeaders });
      setLiveLecture(res.data.lecture || null);
    } catch { setLiveLecture(null); }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    try {
      const res  = await axios.get('/api/auth/me', { headers: authHeaders });
      const user = res.data.user || res.data;
      if (user.fullName && !user.name) user.name = user.fullName;
      setStudent(user);
      studentRef.current = user;
      if (user.domain) fetchLiveLecture(user.domain);
    } catch { toast('Failed to load profile', 'error'); }
    finally { setLoadingProfile(false); }
  }, [token]);

  useEffect(() => {
    fetchProfile(); fetchAttendance(); fetchAssignments(); fetchProjects();
  }, []);

  /* live lecture polling 30s */
  useEffect(() => {
    const domain = studentRef.current?.domain;
    if (!domain) return;
    const iv = setInterval(() => fetchLiveLecture(domain), 30000);
    return () => clearInterval(iv);
  }, [student?.domain]);

  /* reload data when domain assigned */
  useEffect(() => {
    if (student?.domain) {
      fetchAssignments(); fetchProjects(); fetchAttendance();
    }
  }, [student?.domain]);

  /* monthly analytics */
  useEffect(() => {
    if (activeSection === 'analytics' && attendance.length > 0) {
      const map = {};
      attendance.forEach(a => {
        const key = dayjs(a.date || a.createdAt).format('MMM YY');
        if (!map[key]) map[key] = { present: 0, total: 0, ts: dayjs(a.date || a.createdAt).valueOf() };
        map[key].total++;
        if (a.present) map[key].present++;
      });
      const sorted = Object.entries(map)
        .sort((a, b) => a[1].ts - b[1].ts)
        .slice(-6)
        .map(([month, d]) => ({ month, ...d }));
      setMonthlyStats(sorted);
    }
  }, [activeSection, attendance]);

  /* ── QR scan handler ── */
  const handleQRScan = async (qrValue) => {
    setShowScanner(false);
    setScanning(true);
    setScanResult(null);
    try {
      const res = await axios.post('/api/attendance/mark', { lectureId: qrValue.trim() }, { headers: authHeaders });
      setScanResult({ success: true, message: res.data.message || 'Attendance marked!', zoomLink: res.data.zoomLink || '', lectureId: qrValue.trim() });
      toast('✅ Attendance marked!', 'success');
      fetchAttendance();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark attendance. QR may be expired.';
      setScanResult({ success: false, message: msg, zoomLink: '' });
      toast(msg, 'error');
    } finally { setScanning(false); }
  };

  const handleJoinMeeting = async (lectureId, zoomLink) => {
    if (!lectureId) { if (zoomLink) window.open(zoomLink, '_blank'); return; }
    try {
      const res = await axios.post('/api/attendance/join', { lectureId }, { headers: authHeaders });
      fetchAttendance();
      const link = res.data.zoomLink || zoomLink;
      if (link) window.open(link, '_blank');
      if (res.data.marked) toast('✅ Attendance marked & joining!', 'success');
    } catch {
      if (zoomLink) window.open(zoomLink, '_blank');
      fetchAttendance();
    }
  };

  /* ── Submit assignment ── */
  const submitAssignment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/assignments/submit', submitForm, { headers: authHeaders });
      setShowSubmitModal(false);
      setSubmitForm({ assignmentId: '', fileUrl: '', note: '' });
      await fetchAssignments();
      toast('✅ Assignment submitted!', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Submission failed', 'error'); }
    finally { setSubmitting(false); }
  };

  /* ── Submit project ── */
  const submitProject = async (e) => {
    e.preventDefault();
    setSubmittingProject(true);
    try {
      await axios.post('/api/projects/submit', projectForm, { headers: authHeaders });
      setShowProjectModal(false);
      setProjectForm({ projectId: '', repoUrl: '', note: '' });
      await fetchProjects();
      toast('🚀 Project submitted!', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Submission failed', 'error'); }
    finally { setSubmittingProject(false); }
  };

  /* ── Derived ── */
  const attended      = attendance.filter(a => a.present).length;
  const total         = attendance.length;
  const attPct        = total ? Math.round((attended / total) * 100) : 0;
  const submitted     = assignments.filter(a => a.submitted).length;
  const taskPct       = assignments.length ? Math.round((submitted / assignments.length) * 100) : 0;
  const displayName   = student?.name || student?.fullName || 'Student';

  /* ── Profile handlers ── */
  const startEditName = () => {
    setNameValue(student?.name || student?.fullName || '');
    setEditingName(true);
  };

  const saveName = async () => {
    if (!nameValue.trim()) { toast('Name cannot be empty', 'error'); return; }
    setSavingName(true);
    try {
      const res = await axios.patch('/api/auth/update-profile', { name: nameValue.trim() }, { headers: authHeaders });
      const updated = res.data.user || res.data;
      setStudent(prev => ({ ...prev, name: updated.name || nameValue.trim(), fullName: updated.fullName || nameValue.trim() }));
      setEditingName(false);
      toast('✅ Name updated successfully!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update name', 'error');
    } finally { setSavingName(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast('New passwords do not match', 'error'); return; }
    if (pwForm.newPw.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    setSavingPw(true);
    try {
      await axios.post('/api/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw }, { headers: authHeaders });
      setPwForm({ current: '', newPw: '', confirm: '' });
      toast('🔒 Password changed successfully!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally { setSavingPw(false); }
  };

  const sendResetEmail = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) { toast('Enter your email address', 'error'); return; }
    setSendingReset(true);
    try {
      await axios.post('/api/auth/forgot-password', { email: resetEmail.trim() });
      setResetSent(true);
      toast('📧 Reset link sent to your email!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to send reset email', 'error');
    } finally { setSendingReset(false); }
  };

  if (loadingProfile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0b2318', flexDirection: 'column', gap: 16 }}>
      <div className="s-spinner"/>
      <p style={{ color: 'rgba(78,205,196,0.5)', fontFamily: 'Nunito,sans-serif' }}>Loading your dashboard…</p>
    </div>
  );

  return (
    <div className={`s-container ${isLoaded ? 's-loaded' : ''}`}>

      <ToastContainer toasts={toasts} removeToast={removeToast}/>

      {/* Overlay */}
      {sidebarOpen && <div className="s-overlay" onClick={() => setSidebarOpen(false)}/>}

      {/* Hamburger */}
      <button
        className={`s-hamburger ${sidebarOpen ? 's-ham-active' : ''}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={17}/> : <Menu size={17}/>}
      </button>

      {/* ══ SIDEBAR ══ */}
      <aside className={`s-sidebar ${sidebarOpen ? 's-sidebar-open' : ''}`}>
        <div className="s-sidebar-inner">

          {/* Logo */}
          <div className="s-logo">
            <div className="s-logo-icon">🎓</div>
            <span className="s-logo-text">FC</span>
          </div>

          {/* Profile */}
          <div className="s-profile-pill">
            <div className="s-profile-avatar">
              {displayName[0]?.toUpperCase() || 'S'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p className="s-profile-name">{displayName}</p>
              {student?.domain
                ? <p className="s-profile-domain"><span className="s-domain-dot"/>{student.domain}</p>
                : <p className="s-no-domain-text">No domain assigned</p>
              }
            </div>
          </div>

          {/* Nav */}
          <nav className="s-nav">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item.id}
                className={`s-nav-item ${activeSection === item.id ? 's-nav-active' : ''}`}
                style={{ animationDelay: `${0.14 + i * 0.06}s` }}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              >
                <span className="s-nav-icon">{item.icon}</span>
                {item.label}
                {activeSection === item.id && <span className="s-nav-indicator"/>}
              </button>
            ))}
          </nav>

          {/* Live pill */}
          {liveLecture && (
            <div className="s-live-pill" onClick={() => { setActiveSection('attendance'); setSidebarOpen(false); }}>
              <span className="s-pulse-red"/>
              Live: {liveLecture.subject}
            </div>
          )}

          <button className="s-logout-btn"
            onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>
            <LogOut size={14}/> Logout
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="s-main">

        {/* Topbar */}
        <div className="s-topbar">
          <div>
            <h1 className="s-page-title">{NAV_ITEMS.find(n => n.id === activeSection)?.label}</h1>
            <p className="s-page-date">{dayjs().format('dddd, DD MMMM YYYY')}</p>
          </div>
          <div className="s-topbar-right">
            {liveLecture && (
              <div className="s-live-topbar-pill">
                <span className="s-pulse-red"/>
                Live: {liveLecture.subject}
              </div>
            )}
            <div className="s-avatar">{displayName[0]?.toUpperCase() || 'S'}</div>
          </div>
        </div>

        {/* ══ DASHBOARD ══ */}
        {activeSection === 'dashboard' && (
          <div className="s-section">

            {/* Hero */}
            <div className="s-hero">
              <div className="s-hero-shapes">
                <div className="s-hs s-hs1"/><div className="s-hs s-hs2"/><div className="s-hs s-hs3"/>
              </div>
              <div className="s-hero-left">
                <p className="s-hero-label">👋 Welcome back,</p>
                <h2 className="s-hero-title">
                  Hey, <span className="s-hero-accent">{displayName.split(' ')[0]}</span>!
                </h2>
                {student?.domain
                  ? <p className="s-hero-sub">Domain: <strong style={{ color: '#a8e063' }}>{student.domain}</strong></p>
                  : <p className="s-hero-sub s-hero-warn">⚠️ No domain assigned yet. Contact your teacher.</p>
                }
                {liveLecture
                  ? <button className="s-hero-btn s-hero-btn-live" onClick={() => setActiveSection('attendance')}>
                      <Zap size={14}/> Live Class — Scan QR
                    </button>
                  : <button className="s-hero-btn" onClick={() => setActiveSection('assignments')}>
                      <ClipboardList size={14}/> View Assignments
                    </button>
                }
              </div>
              <div className="s-hero-emoji">📚</div>
            </div>

            {/* No-domain banner */}
            {!student?.domain && (
              <div className="s-no-domain-banner">
                <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: 2 }}/>
                <div>
                  <p className="s-ndb-title">Domain Not Assigned</p>
                  <p className="s-ndb-sub">Ask your teacher to assign you to a learning domain. Attendance QR, assignments, and projects will appear once assigned.</p>
                </div>
              </div>
            )}

            {/* Stat cards */}
            <div className="s-stats-grid">
              {[
                { label: 'Attendance',       val: `${attPct}%`,                          ring: attPct,                               color: attPct >= 75 ? '#2ecc8f' : '#e05c5c', delay: '0.5s'  },
                { label: 'Classes Attended', val: `${attended}/${total}`,                 ring: attPct,                               color: '#4ecdc4',                             delay: '0.6s'  },
                { label: 'Tasks Submitted',  val: `${submitted}/${assignments.length}`,   ring: taskPct,                              color: '#a8e063',                             delay: '0.7s'  },
                { label: 'Projects',         val: projects.length,                        ring: Math.min(projects.length * 20, 100),  color: '#f7c948',                             delay: '0.8s'  },
              ].map((st, i) => (
                <div key={i} className="s-stat-card" style={{ animationDelay: st.delay }}>
                  <Ring pct={st.ring} color={st.color} label={st.val} size={78} stroke={5}/>
                  <p className="s-stat-label">{st.label}</p>
                </div>
              ))}
            </div>

            {/* Bottom panels */}
            <div className="s-bottom-grid">
              <div className="s-panel">
                <h3 className="s-panel-title">Recent Attendance</h3>
                {loadingAttendance ? (
                  <div className="s-loading"><div className="s-spinner"/></div>
                ) : attendance.length === 0 ? (
                  <p className="s-muted">No records yet.</p>
                ) : attendance.slice(0, 7).map((a, i) => (
                  <div key={i} className="s-att-row">
                    <span className={`s-att-dot ${a.present ? 's-dot-present' : 's-dot-absent'}`}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="s-att-subject" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.subject || '—'}
                      </p>
                      <p className="s-att-date">{dayjs(a.date || a.createdAt).format('DD MMM, hh:mm A')}</p>
                    </div>
                    <span className={`s-att-badge ${a.present ? 's-badge-present' : 's-badge-absent'}`}>
                      {a.present ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="s-panel">
                <h3 className="s-panel-title">Pending Assignments</h3>
                {loadingAssignments ? (
                  <div className="s-loading"><div className="s-spinner"/></div>
                ) : assignments.filter(a => !a.submitted).length === 0 ? (
                  <p className="s-muted">All caught up! 🎉</p>
                ) : assignments.filter(a => !a.submitted).map(a => (
                  <div key={a._id} className="s-assign-row">
                    <div className="s-assign-icon"><ClipboardList size={13}/></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="s-assign-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.title}
                      </p>
                      <p className="s-assign-due">Due: {dayjs(a.due).format('DD MMM')}</p>
                    </div>
                    <button className="s-submit-quick-btn"
                      onClick={() => { setSubmitForm({ ...submitForm, assignmentId: a._id }); setShowSubmitModal(true); }}>
                      Submit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ ATTENDANCE ══ */}
        {activeSection === 'attendance' && (
          <div className="s-section">
            {!student?.domain ? (
              <div className="s-no-domain-banner">
                <AlertTriangle size={26} style={{ flexShrink: 0, marginTop: 2 }}/>
                <div>
                  <p className="s-ndb-title">No Domain Assigned</p>
                  <p className="s-ndb-sub">Ask your teacher to assign a domain. Live QR codes will appear here automatically.</p>
                </div>
              </div>
            ) : liveLecture ? (
              <div className="s-live-card">
                <span className="s-llc-badge"><span className="s-pulse-red"/>LIVE NOW</span>
                <h3 className="s-llc-subject">{liveLecture.subject}</h3>
                <p className="s-llc-meta">{liveLecture.division} · Started {dayjs(liveLecture.startTime).format('hh:mm A')}</p>
                <p className="s-llc-expires">
                  <Clock size={12}/> QR expires at {dayjs(liveLecture.startTime).add(5, 'minute').format('hh:mm A')}
                </p>

                {scanResult ? (
                  <div className="s-scan-result">
                    {scanResult.success
                      ? <CheckCircle size={50} className="s-scan-ok"/>
                      : <AlertTriangle size={50} className="s-scan-fail"/>
                    }
                    <p className="s-scan-msg">{scanResult.message}</p>
                    {scanResult.success && scanResult.zoomLink && (
                      <a href={scanResult.zoomLink} target="_blank" rel="noreferrer" className="s-join-btn">
                        <Video size={16}/> Join Lecture
                      </a>
                    )}
                    <button className="s-scan-again-btn" onClick={() => setScanResult(null)}>Scan Again</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start', padding: '20px 0' }}>
                    {/* QR display */}
                    <div style={{ padding: 12, background: '#fff', borderRadius: 14, flexShrink: 0 }}>
                      <QRCodeSVG value={liveLecture._id} size={190} bgColor="#ffffff" fgColor="#0b2318" level="H" style={{ borderRadius: 8, display: 'block' }}/>
                      <p style={{ textAlign: 'center', fontSize: '0.62rem', color: '#00a854', marginTop: 7, fontWeight: 700 }}>
                        Scan to mark YOUR attendance
                      </p>
                    </div>
                    {/* Actions */}
                    <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <p style={{ color: 'var(--s-text-muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                        Scan the QR code to mark attendance, then click <strong style={{ color: '#2ecc8f' }}>Join Lecture</strong> to enter the meeting.
                      </p>
                      {scanning ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--s-text-muted)' }}>
                          <div className="s-spinner s-spinner-sm"/>
                          <span style={{ fontSize: '0.88rem' }}>Marking attendance…</span>
                        </div>
                      ) : (
                        <button className="s-scan-btn" onClick={() => setShowScanner(true)}>
                          <Camera size={18}/> Scan QR
                        </button>
                      )}
                      {liveLecture.zoomLink && (
                        <button
                          onClick={() => handleJoinMeeting(liveLecture._id, liveLecture.zoomLink)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '9px 20px',
                            background: 'rgba(46,204,143,0.12)',
                            border: '1px solid rgba(46,204,143,0.28)',
                            borderRadius: 9, color: '#2ecc8f', fontWeight: 700,
                            cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'Oswald,sans-serif',
                            transition: 'all 0.3s', width: 'fit-content',
                          }}>
                          <Video size={15}/> Join Lecture (marks attendance)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="s-no-live-card">
                <WifiOff size={42} style={{ opacity: 0.25 }}/>
                <h3>No live class right now</h3>
                <p>
                  When your teacher starts a lecture for <strong style={{ color: '#4ecdc4' }}>{student?.domain}</strong>,
                  the QR will appear here automatically.
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.76rem', color: 'var(--s-text-muted)' }}>
                  <Wifi size={11}/> Checking every 30 seconds…
                </p>
              </div>
            )}

            {/* History table */}
            <div className="s-panel" style={{ marginTop: 16 }}>
              <div className="s-section-header">
                <h3 className="s-panel-title" style={{ margin: 0 }}>
                  Attendance History
                  <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--s-text-muted)', fontWeight: 400 }}>
                    {attended}/{total} ({attPct}%)
                  </span>
                </h3>
              </div>
              {loadingAttendance ? (
                <div className="s-loading"><div className="s-spinner"/></div>
              ) : attendance.length === 0 ? (
                <p className="s-muted">No attendance records yet.</p>
              ) : (
                <div className="s-table-wrap" style={{ maxHeight: 400, overflowY: 'auto' }}>
                  <table className="s-table" style={{ minWidth: 500 }}>
                    <thead>
                      <tr>
                        {['#', 'Subject', 'Date', 'Time', 'Status', 'Action'].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((a, i) => (
                        <tr key={i}>
                          <td style={{ color: 'var(--s-text-muted)' }}>{i + 1}</td>
                          <td style={{ fontWeight: 500 }}>{a.subject || '—'}</td>
                          <td style={{ color: 'var(--s-text-muted)', whiteSpace: 'nowrap' }}>{dayjs(a.date || a.createdAt).format('DD MMM YYYY')}</td>
                          <td style={{ color: 'var(--s-text-muted)', whiteSpace: 'nowrap' }}>{dayjs(a.date || a.createdAt).format('hh:mm A')}</td>
                          <td>
                            <span className={`s-att-badge ${a.present ? 's-badge-present' : 's-badge-absent'}`}>
                              {a.present ? '✅ Present' : '❌ Absent'}
                            </span>
                          </td>
                          <td>
                            {a.present && a.zoomLink
                              ? <a href={a.zoomLink} target="_blank" rel="noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', background: 'rgba(46,204,143,0.10)', border: '1px solid rgba(46,204,143,0.20)', borderRadius: 7, color: '#2ecc8f', fontSize: '0.73rem', fontWeight: 700, textDecoration: 'none' }}>
                                  <Video size={10}/> Join
                                </a>
                              : <span style={{ color: 'var(--s-text-muted)' }}>—</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ ASSIGNMENTS ══ */}
        {activeSection === 'assignments' && (
          <div className="s-section">
            {loadingAssignments ? (
              <div className="s-loading"><div className="s-spinner"/> Loading assignments…</div>
            ) : assignments.length === 0 ? (
              <div className="s-empty">
                <ClipboardList size={42} style={{ opacity: 0.25 }}/>
                <p>No assignments yet.</p>
              </div>
            ) : (
              <div className="s-cards-list">
                {assignments.map(a => (
                  <div key={a._id} className={`s-task-card ${a.submitted ? 's-task-done' : ''}`}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="s-task-domain">{a.domain}</span>
                      <h4 className="s-task-title">{a.title}</h4>
                      {a.description && <p className="s-task-desc">{a.description}</p>}
                      <p className="s-task-due"><Calendar size={11}/> Due: {dayjs(a.due).format('DD MMM YYYY')}</p>
                    </div>
                    <div className="s-task-right">
                      {a.submitted ? (
                        <span className="s-submitted-badge">
                          <CheckCircle size={13}/> Submitted
                          {a.reviewStatus && (
                            <span className={`s-review-tag s-review-${a.reviewStatus?.toLowerCase() || 'pending'}`}>
                              {a.reviewStatus}
                            </span>
                          )}
                        </span>
                      ) : (
                        <button className="s-submit-btn"
                          onClick={() => { setSubmitForm({ assignmentId: a._id, fileUrl: '', note: '' }); setShowSubmitModal(true); }}>
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Modal */}
            {showSubmitModal && (
              <div className="s-modal-overlay">
                <div className="s-modal">
                  <button className="s-modal-close" onClick={() => setShowSubmitModal(false)}><X size={15}/></button>
                  <div className="s-modal-icon">📤</div>
                  <h2>Submit Assignment</h2>
                  <form onSubmit={submitAssignment}>
                    <input type="url" placeholder="File / Drive link (https://…)"
                      value={submitForm.fileUrl}
                      onChange={e => setSubmitForm({ ...submitForm, fileUrl: e.target.value })} required/>
                    <textarea rows={3} placeholder="Note to teacher (optional)"
                      value={submitForm.note}
                      onChange={e => setSubmitForm({ ...submitForm, note: e.target.value })}/>
                    <div className="s-modal-buttons">
                      <button type="button" className="s-cancel-btn" onClick={() => setShowSubmitModal(false)}>Cancel</button>
                      <button type="submit" className="s-btn-primary" disabled={submitting}>
                        {submitting ? 'Submitting…' : 'Submit'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ PROJECTS ══ */}
        {activeSection === 'projects' && (
          <div className="s-section">
            {loadingProjects ? (
              <div className="s-loading"><div className="s-spinner"/> Loading projects…</div>
            ) : projects.length === 0 ? (
              <div className="s-empty">
                <BookOpen size={42} style={{ opacity: 0.25 }}/>
                <p>No projects assigned yet.</p>
              </div>
            ) : (
              <div className="s-cards-list">
                {projects.map(p => (
                  <div key={p._id} className="s-task-card">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="s-task-domain s-project-domain">{p.domain}</span>
                      <h4 className="s-task-title">{p.title}</h4>
                      {p.description && <p className="s-task-desc">{p.description}</p>}
                      <p className="s-task-due"><Calendar size={11}/> Deadline: {dayjs(p.deadline).format('DD MMM YYYY')}</p>
                    </div>
                    <div className="s-task-right">
                      <span className={`s-status-badge ${p.status === 'completed' ? 's-status-completed' : 's-status-ongoing'}`}>
                        {p.status || 'Ongoing'}
                      </span>
                      {p.submitted ? (
                        <span className="s-submitted-badge"><CheckCircle size={13}/> Submitted</span>
                      ) : (
                        <button className="s-submit-btn"
                          onClick={() => { setProjectForm({ projectId: p._id, repoUrl: '', note: '' }); setShowProjectModal(true); }}>
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Project Submit Modal */}
            {showProjectModal && (
              <div className="s-modal-overlay">
                <div className="s-modal">
                  <button className="s-modal-close" onClick={() => setShowProjectModal(false)}><X size={15}/></button>
                  <div className="s-modal-icon">🚀</div>
                  <h2>Submit Project</h2>
                  <form onSubmit={submitProject}>
                    <input type="url" placeholder="GitHub / Repo link (https://…)"
                      value={projectForm.repoUrl}
                      onChange={e => setProjectForm({ ...projectForm, repoUrl: e.target.value })} required/>
                    <textarea rows={3} placeholder="Summary / note (optional)"
                      value={projectForm.note}
                      onChange={e => setProjectForm({ ...projectForm, note: e.target.value })}/>
                    <div className="s-modal-buttons">
                      <button type="button" className="s-cancel-btn" onClick={() => setShowProjectModal(false)}>Cancel</button>
                      <button type="submit" className="s-btn-primary" disabled={submittingProject}>
                        {submittingProject ? 'Submitting…' : '🚀 Submit Project'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {activeSection === 'analytics' && (
          <div className="s-section">

            <div className="s-analytics-summary">
              {[
                { icon: <Percent size={18}/>,      val: `${attPct}%`,              label: 'Attendance Rate',   warn: attPct < 75,                        color: '#4ecdc4' },
                { icon: <CheckSquare size={18}/>,  val: `${attended}/${total}`,    label: 'Classes Attended',  warn: false,                              color: '#2ecc8f' },
                { icon: <XSquare size={18}/>,      val: total - attended,          label: 'Classes Missed',    warn: (total - attended) > 3,             color: '#e05c5c' },
                { icon: <ClipboardList size={18}/>,val: `${submitted}/${assignments.length}`, label: 'Tasks Done',  warn: submitted < assignments.length, color: '#f7c948' },
                { icon: <Award size={18}/>,        val: projects.filter(p => p.submitted).length, label: 'Projects Done', warn: false,                 color: '#a8e063' },
                { icon: <TrendingUp size={18}/>,   val: assignments.length,        label: 'Total Assignments', warn: false,                              color: '#4ecdc4' },
              ].map((c, i) => (
                <div key={i} className={`s-an-card ${c.warn ? 's-an-warn' : ''}`}>
                  <div style={{ color: c.warn ? '#e05c5c' : c.color }}>{c.icon}</div>
                  <p className="s-an-val" style={{ color: c.warn ? '#e05c5c' : undefined }}>{c.val}</p>
                  <p className="s-an-label">{c.label}</p>
                  {c.warn && <p className="s-an-warning-note">⚠️ Below threshold</p>}
                </div>
              ))}
            </div>

            {/* Monthly bars */}
            <div className="s-panel" style={{ marginBottom: 18 }}>
              <div className="s-section-header">
                <h3 className="s-panel-title" style={{ margin: 0 }}>Monthly Attendance</h3>
                <span style={{ fontSize: '0.73rem', color: 'var(--s-text-muted)' }}>Last 6 months</span>
              </div>
              {monthlyStats.length === 0 ? (
                <p className="s-muted">Not enough data yet.</p>
              ) : (
                <div className="s-month-bars">
                  {monthlyStats.map((m, i) => (
                    <MonthBar key={i} month={m.month} present={m.present} total={m.total}/>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
                {[['#2ecc8f', '≥75% Good'], ['#f7c948', '50–74% At Risk'], ['#e05c5c', '<50% Critical']].map(([c, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: c, flexShrink: 0 }}/>
                    <span style={{ fontSize: '0.7rem', color: 'var(--s-text-muted)' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {attPct < 75 && total > 0 && (
              <div className="s-att-alert" style={{ maxWidth: '100%', marginBottom: 18 }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }}/>
                <div>
                  <strong>Attendance below 75%</strong><br/>
                  You need <strong>{Math.max(0, Math.ceil((0.75 * total - attended) / 0.25))}</strong> more consecutive classes to reach 75%.
                </div>
              </div>
            )}

            {/* Full log */}
            <div className="s-panel" style={{ marginBottom: 18 }}>
              <h3 className="s-panel-title">Full Attendance Log</h3>
              {loadingAttendance ? (
                <div className="s-loading"><div className="s-spinner"/></div>
              ) : attendance.length === 0 ? (
                <p className="s-muted">No records yet.</p>
              ) : (
                <div className="s-table-wrap" style={{ maxHeight: 460, overflowY: 'auto' }}>
                  <table className="s-table" style={{ minWidth: 480 }}>
                    <thead>
                      <tr>
                        {['#', 'Subject', 'Date', 'Day', 'Time', 'Status'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((a, i) => {
                        const d = dayjs(a.date || a.createdAt);
                        return (
                          <tr key={i}>
                            <td style={{ color: 'var(--s-text-muted)' }}>{i + 1}</td>
                            <td style={{ fontWeight: 500 }}>{a.subject || '—'}</td>
                            <td style={{ color: 'var(--s-text-muted)', whiteSpace: 'nowrap' }}>{d.format('DD MMM YYYY')}</td>
                            <td style={{ color: 'var(--s-text-muted)' }}>{d.format('ddd')}</td>
                            <td style={{ color: 'var(--s-text-muted)', whiteSpace: 'nowrap' }}>{d.format('hh:mm A')}</td>
                            <td>
                              <span className={`s-att-badge ${a.present ? 's-badge-present' : 's-badge-absent'}`}>
                                {a.present ? '✅ Present' : '❌ Absent'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Assignment performance */}
            <div className="s-panel">
              <h3 className="s-panel-title">Assignment Performance</h3>
              {assignments.length === 0 ? (
                <p className="s-muted">No assignments yet.</p>
              ) : (
                <div className="s-table-wrap" style={{ maxHeight: 340, overflowY: 'auto' }}>
                  <table className="s-table" style={{ minWidth: 400 }}>
                    <thead>
                      <tr>
                        {['Assignment', 'Due Date', 'Status', 'Review'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map(a => (
                        <tr key={a._id}>
                          <td style={{ fontWeight: 500 }}>{a.title}</td>
                          <td style={{ color: 'var(--s-text-muted)', whiteSpace: 'nowrap' }}>{dayjs(a.due).format('DD MMM YYYY')}</td>
                          <td>
                            <span className={`s-att-badge ${a.submitted ? 's-badge-present' : 's-badge-absent'}`}>
                              {a.submitted ? '✅ Submitted' : '⏳ Pending'}
                            </span>
                          </td>
                          <td>
                            {a.reviewStatus
                              ? <span style={{ fontSize: '0.78rem', color: '#4ecdc4' }}>{a.reviewStatus}</span>
                              : <span style={{ color: 'var(--s-text-muted)' }}>—</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showScanner && <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)}/>}
    </div>
  );
};

export default StudentDashboard;