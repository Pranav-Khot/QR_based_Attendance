


import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, QrCode, AlertTriangle, Users, BookOpen,
  ClipboardList, BarChart2, LogOut, Menu, X,
  CheckCircle, Clock, Bell, Award, TrendingUp,
  Search, Calendar, Layers, Zap, Trash2, Edit3,
  Save, UserCheck, RefreshCw, UserPlus, Video,
  Percent, Activity, ChevronDown
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import dayjs from 'dayjs';
import './teacher_dashboard.css';

const DOMAINS = ['MEAN Stack', 'Java Full Stack', 'Python Developer', 'Cyber Security'];

const NAV_ITEMS = [
  { id: 'dashboard',    icon: <Layers size={18}/>,       label: 'Dashboard'      },
  { id: 'domainassign', icon: <UserPlus size={18}/>,     label: 'Domain Assign'  },
  { id: 'lectures',     icon: <QrCode size={18}/>,        label: 'Lectures / QR'  },
  { id: 'students',     icon: <Users size={18}/>,         label: 'Students'       },
  { id: 'assignments',  icon: <ClipboardList size={18}/>, label: 'Assignments'    },
  { id: 'projects',     icon: <BookOpen size={18}/>,      label: 'Projects'       },
  { id: 'analytics',    icon: <BarChart2 size={18}/>,     label: 'Analytics'      },
];

// ── Ring SVG ─────────────────────────────────────────────────────────────────
const Ring = ({ pct, color, size = 80, stroke = 6, label }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="td-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(135,209,185,0.10)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)' }}/>
      </svg>
      <span className="td-ring-label">{label}</span>
    </div>
  );
};

// ── Toast System ──────────────────────────────────────────────────────────────
const ToastContainer = ({ toasts, removeToast }) => (
  <div className="td-toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`td-toast td-toast-${t.type}`}>
        {t.type === 'success' ? <CheckCircle size={16} className="td-toast-icon"/>
          : t.type === 'error' ? <AlertTriangle size={16} className="td-toast-icon"/>
          : <Bell size={16} className="td-toast-icon"/>}
        <span className="td-toast-msg">{t.message}</span>
        <button onClick={() => removeToast(t.id)} className="td-toast-close"><X size={14}/></button>
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
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, toast, removeToast };
};

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const TeacherDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [isLoaded, setIsLoaded]           = useState(false);
  const { toasts, toast, removeToast }    = useToast();

  const token       = localStorage.getItem('token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  // ── Students ───────────────────────────────────────────────
  const [allStudents, setAllStudents]         = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentSearch, setStudentSearch]     = useState('');
  const [selectedDomain, setSelectedDomain]   = useState('');
  const [editingDomain, setEditingDomain]     = useState({});
  const [savingDomain, setSavingDomain]       = useState({});

  // ── Domain Assign ──────────────────────────────────────────
  const [daSearch, setDaSearch]   = useState('');
  const [daEditMap, setDaEditMap] = useState({});
  const [daSaving, setDaSaving]   = useState({});
  const [daSuccess, setDaSuccess] = useState({});

  // ── Lectures ───────────────────────────────────────────────
  const [sessions, setSessions]               = useState([]);
  const [loadingLectures, setLoadingLectures] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentQR, setCurrentQR]             = useState(null);
  const [creatingLecture, setCreatingLecture] = useState(false);
  const [qrSecondsLeft, setQrSecondsLeft]     = useState(null);
  const [formData, setFormData]               = useState({
    subject: '', division: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '', durationMinutes: 60, zoomLink: '',
  });

  // ── Assignments ────────────────────────────────────────────
  const [assignments, setAssignments]               = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [showAssignModal, setShowAssignModal]       = useState(false);
  const [assignForm, setAssignForm]                 = useState({ title: '', domain: DOMAINS[0], due: '', description: '' });
  const [creatingAssignment, setCreatingAssignment] = useState(false);

  // ── Projects ───────────────────────────────────────────────
  const [projects, setProjects]               = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm]         = useState({ title: '', domain: DOMAINS[0], deadline: '', description: '' });
  const [creatingProject, setCreatingProject] = useState(false);

  // ── Analytics ──────────────────────────────────────────────
  const [analyticsDomain, setAnalyticsDomain]               = useState(DOMAINS[0]);
  const [analyticsEmailSearch, setAnalyticsEmailSearch]     = useState('');
  const [analyticsStudents, setAnalyticsStudents]           = useState([]);
  const [loadingAnalytics, setLoadingAnalytics]             = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail]   = useState(null);
  const [studentAttendanceDetail, setStudentAttendanceDetail] = useState([]);
  const [studentAssignmentDetail, setStudentAssignmentDetail] = useState([]);
  const [studentProjectDetail, setStudentProjectDetail]     = useState([]);
  const [loadingDetail, setLoadingDetail]                   = useState(false);
  const assignmentSectionRef = useRef(null);
  const projectSectionRef    = useRef(null);

  // ── Trigger loaded class for CSS animations ────────────────
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  // ─────────────────────────────────────────────────────────
  // FETCH FUNCTIONS
  // ─────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const res = await axios.get('/api/users?role=student', { headers: authHeaders });
      const raw = res.data.students || res.data || [];
      setAllStudents(
        raw
          .filter(s => s?.role === 'user' && s?.approvalStatus === 'APPROVED')
          .map(s => ({ ...s, name: s.name || s.fullName || '' }))
      );
    } catch { toast('Failed to load students', 'error'); }
    finally { setLoadingStudents(false); }
  }, [token]);

  const fetchLectures = useCallback(async () => {
    setLoadingLectures(true);
    try {
      const res = await axios.get('/api/lectures', { headers: authHeaders });
      setSessions(Array.isArray(res.data.lectures || res.data) ? (res.data.lectures || res.data) : []);
    } catch { toast('Failed to load lectures', 'error'); }
    finally { setLoadingLectures(false); }
  }, [token]);

  const fetchAssignments = useCallback(async () => {
    setLoadingAssignments(true);
    try {
      const res = await axios.get('/api/assignments', { headers: authHeaders });
      setAssignments(res.data.assignments || res.data || []);
    } catch { toast('Failed to load assignments', 'error'); }
    finally { setLoadingAssignments(false); }
  }, [token]);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const res = await axios.get('/api/projects', { headers: authHeaders });
      setProjects(res.data.projects || res.data || []);
    } catch { toast('Failed to load projects', 'error'); }
    finally { setLoadingProjects(false); }
  }, [token]);

  const fetchAnalytics = useCallback(async (domain) => {
    setLoadingAnalytics(true);
    setAnalyticsStudents([]);
    try {
      const res = await axios.get(`/api/analytics?domain=${encodeURIComponent(domain)}`, { headers: authHeaders });
      setAnalyticsStudents(
        (res.data.students || []).map(s => ({ ...s, name: s.name || s.fullName || '' }))
      );
    } catch {
      toast('Failed to load analytics', 'error');
      setAnalyticsStudents([]);
    } finally { setLoadingAnalytics(false); }
  }, [token]);

  useEffect(() => {
    fetchStudents(); fetchLectures(); fetchAssignments(); fetchProjects();
  }, []);

  useEffect(() => {
    if (activeSection === 'analytics') fetchAnalytics(analyticsDomain);
  }, [analyticsDomain, activeSection]);

  useEffect(() => {
    const iv = setInterval(() => {
      if (['students','domainassign','dashboard'].includes(activeSection)) fetchStudents();
    }, 30000);
    return () => clearInterval(iv);
  }, [activeSection, fetchStudents]);

  useEffect(() => {
    if (!currentQR) return;
    const tick = () => {
      const diff = dayjs(currentQR.expiresAt).diff(dayjs(), 'second');
      setQrSecondsLeft(diff > 0 ? diff : 0);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [currentQR]);

  // ─────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────
  const assignDomain = async (studentId, domain) => {
    setSavingDomain(prev => ({ ...prev, [studentId]: true }));
    try {
      await axios.patch(`/api/users/${studentId}/domain`, { domain }, { headers: authHeaders });
      setAllStudents(prev => prev.map(s => s._id === studentId ? { ...s, domain } : s));
      setEditingDomain(prev => { const n = { ...prev }; delete n[studentId]; return n; });
      toast(`Domain assigned: ${domain}`, 'success');
      if (activeSection === 'analytics') fetchAnalytics(analyticsDomain);
    } catch (err) { toast(err.response?.data?.message || 'Failed to assign domain', 'error'); }
    finally { setSavingDomain(prev => { const n = { ...prev }; delete n[studentId]; return n; }); }
  };

  const daAssign = async (studentId) => {
    const domain = daEditMap[studentId];
    if (!domain) { toast('Select a domain first', 'error'); return; }
    setDaSaving(prev => ({ ...prev, [studentId]: true }));
    try {
      await axios.patch(`/api/users/${studentId}/domain`, { domain }, { headers: authHeaders });
      setAllStudents(prev => prev.map(s => s._id === studentId ? { ...s, domain } : s));
      setDaEditMap(prev => { const n = { ...prev }; delete n[studentId]; return n; });
      setDaSuccess(prev => ({ ...prev, [studentId]: true }));
      setTimeout(() => setDaSuccess(prev => { const n = { ...prev }; delete n[studentId]; return n; }), 3000);
      toast(`Domain "${domain}" assigned successfully`, 'success');
      if (activeSection === 'analytics') fetchAnalytics(analyticsDomain);
    } catch (err) { toast(err.response?.data?.message || 'Failed to assign domain', 'error'); }
    finally { setDaSaving(prev => { const n = { ...prev }; delete n[studentId]; return n; }); }
  };

  const createLecture = async (e) => {
    e.preventDefault();
    setCreatingLecture(true);
    const payload = {
      subject: formData.subject, division: formData.division,
      startTime: `${formData.date}T${formData.startTime}:00`,
      durationMinutes: Number(formData.durationMinutes),
      zoomLink: formData.zoomLink || '',
    };
    try {
      const res = await axios.post('/api/lectures/create', payload, { headers: authHeaders });
      const newLecture = res.data.lecture || res.data;
      setSessions(prev => [newLecture, ...prev]);
      const expiryTime = new Date(new Date(payload.startTime).getTime() + 5 * 60 * 1000);
      setCurrentQR({
        id: newLecture._id, subject: newLecture.subject, division: newLecture.division,
        startTime: payload.startTime, expiresAt: expiryTime, zoomLink: newLecture.zoomLink || '',
      });
      const cnt = allStudents.filter(s => s.domain === formData.division).length;
      setShowCreateModal(false);
      setFormData({ subject: '', division: '', date: new Date().toISOString().split('T')[0], startTime: '', durationMinutes: 60, zoomLink: '' });
      setActiveSection('lectures');
      toast(`✅ Lecture created! QR live for 5 min. ${cnt} students in "${newLecture.division}" notified.`, 'success', 5000);
    } catch (err) { toast(err.response?.data?.message || 'Failed to create lecture', 'error'); }
    finally { setCreatingLecture(false); }
  };

  const isQRValid = () => currentQR && dayjs().isBefore(dayjs(currentQR.expiresAt));

  const createAssignment = async (e) => {
    e.preventDefault();
    setCreatingAssignment(true);
    try {
      const res = await axios.post('/api/assignments', assignForm, { headers: authHeaders });
      setAssignments(prev => [res.data.assignment || res.data, ...prev]);
      setAssignForm({ title: '', domain: DOMAINS[0], due: '', description: '' });
      setShowAssignModal(false);
      toast(`Assignment "${assignForm.title}" created for ${assignForm.domain}`, 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to create assignment', 'error'); }
    finally { setCreatingAssignment(false); }
  };

  const deleteAssignment = async (id, title) => {
    setAssignments(prev => prev.map(a => a._id === id ? { ...a, _deleting: true } : a));
    try {
      await axios.delete(`/api/assignments/${id}`, { headers: authHeaders });
      setAssignments(prev => prev.filter(a => a._id !== id));
      toast(`Assignment "${title}" deleted`, 'info');
    } catch {
      toast('Failed to delete assignment', 'error');
      setAssignments(prev => prev.map(a => a._id === id ? { ...a, _deleting: false } : a));
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    setCreatingProject(true);
    try {
      const res = await axios.post('/api/projects', projectForm, { headers: authHeaders });
      setProjects(prev => [res.data.project || res.data, ...prev]);
      setProjectForm({ title: '', domain: DOMAINS[0], deadline: '', description: '' });
      setShowProjectModal(false);
      toast(`Project "${projectForm.title}" created for ${projectForm.domain}`, 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to create project', 'error'); }
    finally { setCreatingProject(false); }
  };

  const deleteProject = async (id, title) => {
    setProjects(prev => prev.map(p => p._id === id ? { ...p, _deleting: true } : p));
    try {
      await axios.delete(`/api/projects/${id}`, { headers: authHeaders });
      setProjects(prev => prev.filter(p => p._id !== id));
      toast(`Project "${title}" deleted`, 'info');
    } catch {
      toast('Failed to delete project', 'error');
      setProjects(prev => prev.map(p => p._id === id ? { ...p, _deleting: false } : p));
    }
  };

  const fetchStudentDetail = async (student) => {
    setSelectedStudentDetail(student);
    setLoadingDetail(true);
    setStudentAttendanceDetail([]); setStudentAssignmentDetail([]); setStudentProjectDetail([]);
    try {
      const studentId = student._id || student.id;
      const [attendanceRes, submissionRes] = await Promise.all([
        axios.get(`/api/attendance/student/${studentId}`, { headers: authHeaders }),
        axios.get(`/api/analytics/student/${studentId}/submissions`, { headers: authHeaders }),
      ]);
      setStudentAttendanceDetail(attendanceRes.data.records || []);
      setStudentAssignmentDetail(submissionRes.data.assignments || []);
      setStudentProjectDetail(submissionRes.data.projects || []);
    } catch { toast('Failed to load student attendance', 'error'); }
    finally { setLoadingDetail(false); }
  };

  // ─────────────────────────────────────────────────────────
  // DERIVED STATE
  // ─────────────────────────────────────────────────────────
  const domainCounts    = DOMAINS.reduce((acc, d) => { acc[d] = allStudents.filter(s => s.domain === d).length; return acc; }, {});
  const unassignedCount = allStudents.filter(s => !s.domain).length;

  const filteredStudents = allStudents.filter(s => {
    const ok  = s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || s.email?.toLowerCase().includes(studentSearch.toLowerCase());
    const dom = !selectedDomain || s.domain === selectedDomain || (selectedDomain === '__none__' && !s.domain);
    return ok && dom;
  });

  const daFiltered = allStudents.filter(s =>
    !daSearch || s.email?.toLowerCase().includes(daSearch.toLowerCase()) || s.name?.toLowerCase().includes(daSearch.toLowerCase())
  );

  const avgAttendance = analyticsStudents.length
    ? Math.round(analyticsStudents.reduce((sum, s) => sum + (s.attendance || 0), 0) / analyticsStudents.length) : 0;

  const analyticsFiltered = analyticsStudents.filter(s =>
    !analyticsEmailSearch || s.email?.toLowerCase().includes(analyticsEmailSearch.toLowerCase()) || s.name?.toLowerCase().includes(analyticsEmailSearch.toLowerCase())
  );

  const fmtCountdown = (secs) => {
    if (!secs || secs <= 0) return '00:00';
    return `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className={`td-container ${isLoaded ? 'td-loaded' : ''}`}>

      <ToastContainer toasts={toasts} removeToast={removeToast}/>

      {/* Overlay */}
      {sidebarOpen && <div className="td-overlay" onClick={() => setSidebarOpen(false)}/>}

      {/* Hamburger */}
      <button className={`td-hamburger ${sidebarOpen ? 'td-ham-active' : ''}`} onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={18}/> : <Menu size={18}/>}
      </button>

      {/* ── SIDEBAR ── */}
      <aside className={`td-sidebar ${sidebarOpen ? 'td-sidebar-open' : ''}`}>
        <div className="td-sidebar-inner">
          <div className="td-logo">
            <div className="td-logo-icon">🎓</div>
            <span className="td-logo-text">FC</span>
          </div>

          <nav className="td-nav">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item.id}
                className={`td-nav-item ${activeSection === item.id ? 'td-nav-active' : ''}`}
                style={{ animationDelay: `${0.15 + i * 0.06}s` }}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              >
                <span className="td-nav-icon">{item.icon}</span>
                {item.label}
                {item.id === 'domainassign' && unassignedCount > 0 && (
                  <span className="td-nav-badge">{unassignedCount}</span>
                )}
                {activeSection === item.id && <span className="td-nav-indicator"/>}
              </button>
            ))}
          </nav>

          {currentQR && isQRValid() && (
            <div className="td-sidebar-qr-badge" onClick={() => setActiveSection('lectures')}>
              <span className="td-pulse-dot"/>
              Live QR · {fmtCountdown(qrSecondsLeft)}
            </div>
          )}

          <button className="td-logout-btn" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>
            <LogOut size={15}/> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="td-main">

        {/* Topbar */}
        <div className="td-topbar">
          <div>
            <h1 className="td-page-title">{NAV_ITEMS.find(n => n.id === activeSection)?.label}</h1>
            <p className="td-page-date">{dayjs().format('dddd, DD MMMM YYYY')}</p>
          </div>
          <div className="td-topbar-right">
            {currentQR && isQRValid() && (
              <div className="td-qr-live-pill">
                <span className="td-pulse-dot"/>
                QR Live · {currentQR.subject} · <strong>{fmtCountdown(qrSecondsLeft)}</strong>
              </div>
            )}
            <div className="td-avatar">T</div>
          </div>
        </div>

        {/* ══ DASHBOARD ══ */}
        {activeSection === 'dashboard' && (
          <div className="td-section-content">
            {/* Hero Banner */}
            <div className="td-hero-banner">
              <div className="td-hero-shapes">
                <div className="td-hs td-hs1"/><div className="td-hs td-hs2"/><div className="td-hs td-hs3"/>
              </div>
              <div className="td-hero-left">
                <p className="td-hero-date">👋 Welcome back, Teacher</p>
                <h2 className="td-hero-title">Ready to <span className="td-hero-accent">inspire</span> today?</h2>
                <p className="td-hero-sub">
                  {sessions.length} lectures · {assignments.length} assignments · {unassignedCount > 0 ? `${unassignedCount} students need domain` : 'All students assigned'}
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="td-hero-btn" onClick={() => setShowCreateModal(true)}>
                    <Plus size={15}/> Create Lecture + QR
                  </button>
                  {unassignedCount > 0 && (
                    <button className="td-hero-btn td-hero-btn-warn" onClick={() => setActiveSection('domainassign')}>
                      <UserPlus size={15}/> Assign Domains ({unassignedCount})
                    </button>
                  )}
                </div>
              </div>
              <div className="td-hero-emoji">👨‍🏫</div>
            </div>

            {/* Stat Cards */}
            <div className="td-stats-grid">
              {[
                { label: 'Total Students', val: allStudents.length,  color: 'var(--td-mint)',    ring: Math.min(allStudents.length * 5, 100) },
                { label: 'Lectures',       val: sessions.length,     color: 'var(--td-primary)', ring: Math.min(sessions.length * 10, 100) },
                { label: 'Assignments',    val: assignments.length,  color: 'var(--td-success)', ring: Math.min(assignments.length * 20, 100) },
                { label: 'Unassigned',     val: unassignedCount,     color: unassignedCount > 0 ? 'var(--td-warning)' : 'var(--td-success)', ring: unassignedCount > 0 ? Math.round(unassignedCount / Math.max(allStudents.length, 1) * 100) : 100 },
              ].map((st, i) => (
                <div key={i} className="td-stat-card" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                  <Ring pct={st.ring} color={st.color} label={st.val} size={80} stroke={6}/>
                  <p className="td-stat-label">{st.label}</p>
                </div>
              ))}
            </div>

            {/* Bottom Panels */}
            <div className="td-bottom-grid">
              <div className="td-panel">
                <h3 className="td-panel-title">Recent Lectures</h3>
                <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                  {sessions.length === 0
                    ? <p className="td-muted">No lectures yet.</p>
                    : sessions.slice(0, 8).map(ss => (
                      <div key={ss._id} className="td-lecture-row">
                        <div className="td-lecture-dot" style={{ background: 'var(--td-primary)' }}/>
                        <div>
                          <p className="td-lecture-name">{ss.subject}</p>
                          <p className="td-lecture-meta">{ss.division} · {dayjs(ss.startTime).format('DD MMM, hh:mm A')}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
              <div className="td-panel">
                <h3 className="td-panel-title">Domain Overview</h3>
                {DOMAINS.map(d => (
                  <div key={d} className="td-domain-row">
                    <span className="td-domain-name">{d}</span>
                    <span className="td-domain-count">{domainCounts[d] || 0} students</span>
                  </div>
                ))}
                {unassignedCount > 0 && (
                  <div className="td-domain-row" onClick={() => setActiveSection('domainassign')} style={{ cursor: 'pointer' }}>
                    <span className="td-domain-name" style={{ color: 'var(--td-warning)' }}>⚠️ Unassigned</span>
                    <span className="td-domain-count" style={{ color: 'var(--td-warning)', borderColor: 'rgba(253,198,68,0.25)' }}>{unassignedCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ DOMAIN ASSIGN ══ */}
        {activeSection === 'domainassign' && (
          <div className="td-section-content">
            <div className="td-da-stats">
              <div className="td-da-stat td-da-stat-total">
                <span className="td-da-stat-val">{allStudents.length}</span>
                <span className="td-da-stat-label">Total</span>
              </div>
              {DOMAINS.map(d => (
                <div key={d} className="td-da-stat">
                  <span className="td-da-stat-val">{domainCounts[d] || 0}</span>
                  <span className="td-da-stat-label">{d.split(' ')[0]}</span>
                </div>
              ))}
              {unassignedCount > 0 && (
                <div className="td-da-stat td-da-stat-warn">
                  <span className="td-da-stat-val">{unassignedCount}</span>
                  <span className="td-da-stat-label">Unassigned</span>
                </div>
              )}
              <button className="td-btn-secondary" style={{ marginLeft: 'auto', alignSelf: 'center' }} onClick={fetchStudents}>
                <RefreshCw size={14}/> Refresh
              </button>
            </div>

            <div className="td-da-searchbar">
              <Search size={15} className="td-da-search-icon"/>
              <input className="td-da-search-inp" placeholder="Search by name or email…" value={daSearch} onChange={e => setDaSearch(e.target.value)}/>
              {daSearch && <button className="td-da-clear-btn" onClick={() => setDaSearch('')}><X size={12}/></button>}
            </div>

            {loadingStudents ? (
              <div className="td-da-loading"><div className="td-da-spinner"/> Loading students…</div>
            ) : daFiltered.length === 0 ? (
              <div className="td-da-empty"><span>👥</span><p>{daSearch ? 'No students match your search.' : 'No students found.'}</p></div>
            ) : (
              <div className="td-da-table-wrap">
                <table className="td-da-table">
                  <thead>
                    <tr>
                      {['#', 'Student', 'Email', 'Registered', 'Current Domain', 'Assign Domain', 'Action'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {daFiltered.map((st, idx) => (
                      <tr key={st._id} className={daSuccess[st._id] ? 'td-da-row-success' : ''}>
                        <td className="td-da-idx">{idx + 1}</td>
                        <td>
                          <div className="td-da-student-cell">
                            <div className="td-da-avatar">{(st.name || 'S')[0].toUpperCase()}</div>
                            <span className="td-da-name">{st.name || '—'}</span>
                          </div>
                        </td>
                        <td><span className="td-da-email">{st.email}</span></td>
                        <td><span className="td-da-date">{dayjs(st.createdAt).format('DD MMM YYYY')}</span></td>
                        <td>
                          {daSuccess[st._id]
                            ? <span className="td-da-domain-pill td-da-domain-ok"><CheckCircle size={10}/> {st.domain}</span>
                            : st.domain
                              ? <span className="td-da-domain-pill td-da-domain-set">{st.domain}</span>
                              : <span className="td-da-domain-pill td-da-domain-none">Not assigned</span>
                          }
                        </td>
                        <td>
                          <select className="td-da-select" value={daEditMap[st._id] ?? st.domain ?? ''}
                            onChange={e => setDaEditMap(prev => ({ ...prev, [st._id]: e.target.value }))}>
                            <option value="">— Select Domain —</option>
                            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </td>
                        <td>
                          {daSuccess[st._id]
                            ? <span className="td-da-assigned-flash"><CheckCircle size={13}/> Done!</span>
                            : (
                              <button className="td-da-assign-btn"
                                disabled={daSaving[st._id] || !daEditMap[st._id] || daEditMap[st._id] === st.domain}
                                onClick={() => daAssign(st._id)}>
                                {daSaving[st._id]
                                  ? <><div className="td-da-spinner" style={{ width: 12, height: 12, borderWidth: 2 }}/> <span className="td-da-saving">Saving…</span></>
                                  : <><UserCheck size={13}/> {st.domain ? 'Update' : 'Assign'}</>
                                }
                              </button>
                            )
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allStudents.length > 0 && allStudents.every(s => s.domain) && (
                  <div className="td-da-all-assigned"><CheckCircle size={16}/> All students have been assigned a domain!</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ LECTURES ══ */}
        {activeSection === 'lectures' && (
          <div className="td-section-content">
            <div className="td-section-header">
              <span className="td-section-subtitle">Manage Lectures & QR Attendance</span>
              <button className="td-btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={15}/> New Lecture + QR</button>
            </div>

            {currentQR && (
              <div className={`td-qr-card ${isQRValid() ? 'td-qr-live' : 'td-qr-expired'}`}>
                <div className="td-qr-header">
                  <QrCode size={20} style={{ color: 'var(--td-mint)' }}/>
                  <h3>Live QR — {currentQR.subject} <span>({currentQR.division})</span></h3>
                  {isQRValid() && (
                    <span className="td-live-badge"><span className="td-pulse-dot"/>LIVE</span>
                  )}
                </div>

                {isQRValid() ? (
                  <div className="td-qr-body">
                    <div className="td-qr-frame">
                      <div className="td-qr-scan-line"/>
                      <div className="td-qr-corner td-c-tl"/><div className="td-qr-corner td-c-tr"/>
                      <div className="td-qr-corner td-c-bl"/><div className="td-qr-corner td-c-br"/>
                      <QRCodeSVG value={currentQR.id} size={200} bgColor="#ffffff" fgColor="#052214" level="H" style={{ borderRadius: 8, display: 'block' }}/>
                    </div>
                    <div className="td-qr-info">
                      <div className="td-qr-countdown">
                        <div className={`td-countdown-ring ${qrSecondsLeft <= 60 ? 'td-countdown-urgent' : ''}`}>
                          <span className="td-countdown-num">{fmtCountdown(qrSecondsLeft)}</span>
                          <span className="td-countdown-sub">Time Remaining</span>
                        </div>
                      </div>
                      <div className="td-qr-validity">
                        <Clock size={14}/>
                        Expires at {dayjs(currentQR.expiresAt).format('hh:mm:ss A')}
                      </div>
                      <div className="td-qr-domain">
                        <Users size={13}/>
                        <strong>{domainCounts[currentQR.division] || 0} students</strong> in {currentQR.division}
                      </div>
                      {currentQR.zoomLink && (
                        <button className="td-zoom-btn" onClick={() => window.open(currentQR.zoomLink, '_blank')}>
                          <Video size={14}/> Join Meeting
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="td-qr-expired-body">
                    <AlertTriangle size={44}/>
                    <p>QR Code Expired</p>
                    <button className="td-btn-primary" onClick={() => setShowCreateModal(true)}>Generate New QR</button>
                  </div>
                )}
              </div>
            )}

            <div className="td-panel">
              <div className="td-section-header">
                <h3 className="td-panel-title" style={{ margin: 0 }}>All Lectures ({sessions.length})</h3>
                <button className="td-btn-secondary" onClick={fetchLectures}><RefreshCw size={13}/> Refresh</button>
              </div>
              {loadingLectures ? (
                <div className="td-da-loading"><div className="td-da-spinner"/> Loading…</div>
              ) : sessions.length === 0 ? (
                <p className="td-muted">No lectures yet. Create your first! 🎉</p>
              ) : (
                <div className="td-sessions-grid">
                  {sessions.map(ss => (
                    <div key={ss._id} className="td-session-card">
                      <span className="td-session-badge">{ss.division}</span>
                      <h4>{ss.subject}</h4>
                      <p>{dayjs(ss.startTime).format('DD MMM YYYY, hh:mm A')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ STUDENTS ══ */}
        {activeSection === 'students' && (
          <div className="td-section-content">
            <div className="td-section-header">
              <span className="td-section-subtitle">All Students ({allStudents.length})</span>
              <button className="td-btn-secondary" onClick={fetchStudents}><RefreshCw size={14}/> Refresh</button>
            </div>

            {/* Domain filter tabs */}
            <div className="td-domain-tabs">
              {[['', `All (${allStudents.length})`],
                ...DOMAINS.map(d => [d, `${d.split(' ')[0]} (${domainCounts[d] || 0})`]),
                ...(unassignedCount > 0 ? [['__none__', `⚠️ Unassigned (${unassignedCount})`]] : [])
              ].map(([val, label]) => (
                <button key={val} className={`td-domain-tab ${selectedDomain === val ? 'td-tab-active' : ''} ${val === '__none__' ? 'td-tab-warn' : ''}`}
                  onClick={() => setSelectedDomain(val)}>{label}</button>
              ))}
            </div>

            <div className="td-search-row">
              <Search size={15}/>
              <input className="td-search-inp" placeholder="Search by name or email…" value={studentSearch} onChange={e => setStudentSearch(e.target.value)}/>
            </div>

            {loadingStudents ? (
              <div className="td-da-loading"><div className="td-da-spinner"/> Loading students…</div>
            ) : (
              <div className="td-student-grid">
                {filteredStudents.length === 0 ? (
                  <div className="td-panel" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
                    <Users size={40} style={{ color: 'var(--td-text-muted)', marginBottom: 12 }}/>
                    <p className="td-muted">No students found.</p>
                  </div>
                ) : filteredStudents.map(st => (
                  <div key={st._id} className="td-student-card">
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div className="td-student-avatar">{(st.name || 'S')[0].toUpperCase()}</div>
                      <div style={{ minWidth: 0 }}>
                        <p className="td-student-name">{st.name || '—'}</p>
                        <p className="td-student-email">{st.email}</p>
                      </div>
                    </div>
                    <div className="td-domain-assign-row">
                      {editingDomain[st._id] !== undefined ? (
                        <>
                          <select className="td-domain-select" value={editingDomain[st._id]}
                            onChange={e => setEditingDomain(prev => ({ ...prev, [st._id]: e.target.value }))}>
                            <option value="">No Domain</option>
                            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <button className="td-save-btn" disabled={savingDomain[st._id]}
                            onClick={() => assignDomain(st._id, editingDomain[st._id])}>
                            {savingDomain[st._id] ? '…' : <Save size={13}/>}
                          </button>
                          <button className="td-cancel-btn"
                            onClick={() => setEditingDomain(prev => { const n = { ...prev }; delete n[st._id]; return n; })}>
                            <X size={13}/>
                          </button>
                        </>
                      ) : (
                        <>
                          <span className={`td-assigned-domain ${st.domain ? 'td-domain-set' : 'td-domain-unset'}`}>
                            {st.domain || 'Not assigned'}
                          </span>
                          <button className="td-edit-domain-btn"
                            onClick={() => setEditingDomain(prev => ({ ...prev, [st._id]: st.domain || '' }))}>
                            <Edit3 size={12}/> {st.domain ? 'Change' : 'Assign'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ ASSIGNMENTS ══ */}
        {activeSection === 'assignments' && (
          <div className="td-section-content">
            <div className="td-section-header">
              <span className="td-section-subtitle">{assignments.length} total assignments</span>
              <button className="td-btn-primary" onClick={() => setShowAssignModal(true)}><Plus size={15}/> Assign</button>
            </div>
            {loadingAssignments ? (
              <div className="td-da-loading"><div className="td-da-spinner"/> Loading…</div>
            ) : assignments.length === 0 ? (
              <div className="td-panel" style={{ textAlign: 'center', padding: 48 }}>
                <ClipboardList size={44} style={{ color: 'var(--td-text-muted)', marginBottom: 12 }}/>
                <p className="td-muted">No assignments yet. Create your first!</p>
              </div>
            ) : (
              <div className="td-cards-list">
                {assignments.map(a => (
                  <div key={a._id} className="td-task-card" style={{ opacity: a._deleting ? 0.4 : 1 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="td-task-domain">{a.domain}</span>
                      <h4 className="td-task-title">{a.title}</h4>
                      {a.description && <p className="td-task-desc">{a.description}</p>}
                      <p className="td-task-due">
                        <Calendar size={11}/> Due: {dayjs(a.due).format('DD MMM YYYY')} &nbsp;·&nbsp;
                        <Users size={11}/> {domainCounts[a.domain] || 0} students &nbsp;·&nbsp;
                        <CheckCircle size={11}/> {a.submissionsCount || 0} submitted
                      </p>
                    </div>
                    <div className="td-task-right">
                      <span className={`td-status-badge td-status-ongoing`}>Active</span>
                      <button className="td-del-btn" disabled={a._deleting} onClick={() => deleteAssignment(a._id, a.title)}>
                        {a._deleting ? <div className="td-da-spinner" style={{ width: 12, height: 12, borderWidth: 2 }}/> : <Trash2 size={14}/>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ PROJECTS ══ */}
        {activeSection === 'projects' && (
          <div className="td-section-content">
            <div className="td-section-header">
              <span className="td-section-subtitle">{projects.length} total projects</span>
              <button className="td-btn-primary" onClick={() => setShowProjectModal(true)}><Plus size={15}/> New Project</button>
            </div>
            {loadingProjects ? (
              <div className="td-da-loading"><div className="td-da-spinner"/> Loading…</div>
            ) : projects.length === 0 ? (
              <div className="td-panel" style={{ textAlign: 'center', padding: 48 }}>
                <BookOpen size={44} style={{ color: 'var(--td-text-muted)', marginBottom: 12 }}/>
                <p className="td-muted">No projects yet.</p>
              </div>
            ) : (
              <div className="td-cards-list">
                {projects.map(p => (
                  <div key={p._id} className="td-task-card" style={{ opacity: p._deleting ? 0.4 : 1 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="td-task-domain td-project-domain">{p.domain}</span>
                      <h4 className="td-task-title">{p.title}</h4>
                      {p.description && <p className="td-task-desc">{p.description}</p>}
                      <p className="td-task-due">
                        <Calendar size={11}/> Deadline: {dayjs(p.deadline).format('DD MMM YYYY')} &nbsp;·&nbsp;
                        <Users size={11}/> {domainCounts[p.domain] || 0} students &nbsp;·&nbsp;
                        <CheckCircle size={11}/> {p.submissionsCount || 0} submitted
                      </p>
                    </div>
                    <div className="td-task-right">
                      <span className={`td-status-badge ${p.status === 'completed' ? 'td-status-completed' : 'td-status-ongoing'}`}>{p.status || 'ongoing'}</span>
                      <button className="td-del-btn" disabled={p._deleting} onClick={() => deleteProject(p._id, p.title)}>
                        {p._deleting ? <div className="td-da-spinner" style={{ width: 12, height: 12, borderWidth: 2 }}/> : <Trash2 size={14}/>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {activeSection === 'analytics' && (
          <div className="td-section-content">
            <div className="td-panel" style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--td-text-muted)', marginBottom: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Choose Domain</p>
              <div className="td-domain-tabs">
                {DOMAINS.map(d => (
                  <button key={d} className={`td-domain-tab ${analyticsDomain === d ? 'td-tab-active' : ''}`}
                    onClick={() => { setAnalyticsDomain(d); setSelectedStudentDetail(null); setAnalyticsEmailSearch(''); }}>
                    {d} <span style={{ opacity: 0.6, fontWeight: 400 }}>({domainCounts[d] || 0})</span>
                  </button>
                ))}
                <button className="td-btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => fetchAnalytics(analyticsDomain)}>
                  <RefreshCw size={13}/> Refresh
                </button>
              </div>
            </div>

            <div className="td-analytics-summary">
              {[
                { icon: <TrendingUp size={18}/>, val: `${avgAttendance}%`,                                               label: 'Avg Attendance',    color: 'var(--td-mint)'    },
                { icon: <CheckCircle size={18}/>, val: analyticsStudents.filter(s => (s.attendance || 0) >= 75).length,  label: 'Regular (≥75%)',    color: 'var(--td-success)' },
                { icon: <AlertTriangle size={18}/>, val: analyticsStudents.filter(s => (s.attendance || 0) < 75 && s.totalClasses > 0).length, label: 'At Risk (<75%)', color: 'var(--td-danger)'  },
                { icon: <Users size={18}/>, val: analyticsStudents.length,                                                label: 'Domain Students',   color: 'var(--td-primary)' },
              ].map((c, i) => (
                <div key={i} className="td-an-card">
                  <div>{c.icon}</div>
                  <p className="td-an-val">{c.val}</p>
                  <p className="td-an-label">{c.label}</p>
                </div>
              ))}
            </div>

            <div className="td-search-row" style={{ marginBottom: 16 }}>
              <Search size={15}/>
              <input className="td-search-inp" placeholder={`Search student in ${analyticsDomain}…`}
                value={analyticsEmailSearch} onChange={e => setAnalyticsEmailSearch(e.target.value)}/>
            </div>

            <div className="td-panel">
              <h3 className="td-panel-title">Student Performance — {analyticsDomain}</h3>
              {loadingAnalytics ? (
                <div className="td-da-loading"><div className="td-da-spinner"/> Loading analytics…</div>
              ) : analyticsFiltered.length === 0 ? (
                <p className="td-muted">{analyticsEmailSearch ? `No students match "${analyticsEmailSearch}"` : `No students in ${analyticsDomain} yet.`}</p>
              ) : (
                <div className="td-table-wrap">
                  <table className="td-table">
                    <thead>
                      <tr>
                        {['Student', 'Email', 'Attendance', 'Classes', 'Tasks', 'Status', 'Details'].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsFiltered.map(st => (
                        <tr key={st.email || st._id}>
                          <td>
                            <div className="td-table-student">
                              <div className="td-sm-avatar">{(st.name || '?')[0].toUpperCase()}</div>
                              <span className="td-table-name">{st.name}</span>
                            </div>
                          </td>
                          <td><span className="td-table-email">{st.email}</span></td>
                          <td>
                            <div className="td-progress-row">
                              <div className="td-progress-bar">
                                <div className="td-progress-fill"
                                  style={{ width: `${st.attendance || 0}%`, background: (st.attendance || 0) >= 75 ? 'var(--td-success)' : 'var(--td-danger)' }}/>
                              </div>
                              <span className="td-progress-pct" style={{ color: (st.attendance || 0) >= 75 ? 'var(--td-success)' : 'var(--td-danger)' }}>
                                {st.attendance || 0}%
                              </span>
                            </div>
                          </td>
                          <td>{st.classesAttended}/{st.totalClasses}</td>
                          <td>{st.tasksCompleted}/{st.totalTasks}</td>
                          <td>
                            <span className={`td-student-badge ${(st.attendance || 0) >= 75 ? 'td-badge-ok' : 'td-badge-warn'}`}>
                              {(st.attendance || 0) >= 75 ? '✅ Regular' : '⚠️ At Risk'}
                            </span>
                          </td>
                          <td>
                            <button className="td-btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                              onClick={() => fetchStudentDetail(st)}>View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Student detail */}
            {selectedStudentDetail && (
              <div className="td-panel" style={{ marginTop: 20, borderColor: 'rgba(135,209,185,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="td-student-avatar">{(selectedStudentDetail.name || 'S')[0].toUpperCase()}</div>
                    <div>
                      <h3 className="td-student-name">{selectedStudentDetail.name}</h3>
                      <p className="td-student-email">{selectedStudentDetail.email}</p>
                    </div>
                  </div>
                  <button className="td-modal-close" onClick={() => setSelectedStudentDetail(null)}><X size={16}/></button>
                </div>

                <div className="td-stats-grid" style={{ marginBottom: 20 }}>
                  {[
                    { label: 'Attendance',  val: `${selectedStudentDetail.attendance || 0}%`, color: (selectedStudentDetail.attendance || 0) >= 75 ? 'var(--td-success)' : 'var(--td-danger)' },
                    { label: 'Present',     val: selectedStudentDetail.classesAttended ?? studentAttendanceDetail.filter(a => a.present).length, color: 'var(--td-success)' },
                    { label: 'Absent',      val: studentAttendanceDetail.filter(a => !a.present).length, color: 'var(--td-danger)' },
                    { label: 'Total',       val: selectedStudentDetail.totalClasses ?? studentAttendanceDetail.length, color: 'var(--td-mint)' },
                    { label: 'Assignments', val: studentAssignmentDetail.filter(a => a.submitted).length, color: 'var(--td-primary)' },
                    { label: 'Projects',    val: studentProjectDetail.filter(p => p.submitted).length,    color: 'var(--td-warning)' },
                  ].map((c, i) => (
                    <div key={i} className="td-stat-card" style={{ cursor: 'default' }}>
                      <p style={{ fontSize: '1.4rem', fontWeight: 800, color: c.color }}>{c.val}</p>
                      <p className="td-stat-label">{c.label}</p>
                    </div>
                  ))}
                </div>

                <h4 className="td-panel-title">Full Attendance Log</h4>
                {loadingDetail ? (
                  <div className="td-da-loading"><div className="td-da-spinner"/> Loading records…</div>
                ) : studentAttendanceDetail.length === 0 ? (
                  <p className="td-muted">No records found.</p>
                ) : (
                  <div className="td-table-wrap">
                    <table className="td-table">
                      <thead><tr>{['#', 'Subject', 'Date', 'Day', 'Time', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                      <tbody>
                        {studentAttendanceDetail.map((a, i) => {
                          const d = dayjs(a.date || a.createdAt);
                          return (
                            <tr key={i}>
                              <td>{i + 1}</td>
                              <td>{a.subject || '—'}</td>
                              <td>{d.format('DD MMM YYYY')}</td>
                              <td>{d.format('ddd')}</td>
                              <td>{d.format('hh:mm A')}</td>
                              <td><span className={`td-student-badge ${a.present ? 'td-badge-ok' : 'td-badge-warn'}`}>{a.present ? '✅ Present' : '❌ Absent'}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div ref={assignmentSectionRef} style={{ marginTop: 24 }}>
                  <h4 className="td-panel-title">Assignment Submissions</h4>
                  {loadingDetail ? <p className="td-muted">Loading…</p>
                    : studentAssignmentDetail.length === 0 ? <p className="td-muted">No assignments available.</p>
                    : (
                      <div className="td-table-wrap">
                        <table className="td-table">
                          <thead><tr>{['Assignment', 'Due', 'Status', 'Submitted At', 'Link', 'Note'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                          <tbody>
                            {studentAssignmentDetail.map(item => (
                              <tr key={item._id}>
                                <td>{item.title}</td>
                                <td>{item.due ? dayjs(item.due).format('DD MMM YYYY') : '—'}</td>
                                <td><span className={`td-student-badge ${item.submitted ? 'td-badge-ok' : 'td-badge-warn'}`}>{item.submitted ? 'Submitted' : 'Pending'}</span></td>
                                <td>{item.submittedAt ? dayjs(item.submittedAt).format('DD MMM YYYY, hh:mm A') : '—'}</td>
                                <td>{item.fileUrl ? <a href={item.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--td-mint)' }}>Open Link</a> : '—'}</td>
                                <td>{item.note || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                </div>

                <div ref={projectSectionRef} style={{ marginTop: 24 }}>
                  <h4 className="td-panel-title">Project Submissions</h4>
                  {loadingDetail ? <p className="td-muted">Loading…</p>
                    : studentProjectDetail.length === 0 ? <p className="td-muted">No projects available.</p>
                    : (
                      <div className="td-table-wrap">
                        <table className="td-table">
                          <thead><tr>{['Project', 'Deadline', 'Status', 'Submitted At', 'Repo Link', 'Note'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                          <tbody>
                            {studentProjectDetail.map(item => (
                              <tr key={item._id}>
                                <td>{item.title}</td>
                                <td>{item.deadline ? dayjs(item.deadline).format('DD MMM YYYY') : '—'}</td>
                                <td><span className={`td-student-badge ${item.submitted ? 'td-badge-ok' : 'td-badge-warn'}`}>{item.submitted ? 'Submitted' : 'Pending'}</span></td>
                                <td>{item.submittedAt ? dayjs(item.submittedAt).format('DD MMM YYYY, hh:mm A') : '—'}</td>
                                <td>{item.repoUrl ? <a href={item.repoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--td-gold)' }}>Open Repo</a> : '—'}</td>
                                <td>{item.note || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ══ CREATE LECTURE MODAL ══ */}
      {showCreateModal && (
        <div className="td-modal-overlay">
          <div className="td-modal">
            <button className="td-modal-close" onClick={() => setShowCreateModal(false)}><X size={16}/></button>
            <div className="td-modal-icon">🎓</div>
            <h2>Create Lecture + QR</h2>
            <p className="td-modal-sub">QR expires 5 minutes after start time</p>
            <form onSubmit={createLecture}>
              <select value={formData.division} onChange={e => setFormData({ ...formData, division: e.target.value })} required>
                <option value="">Select Domain / Batch</option>
                {DOMAINS.map(d => <option key={d}>{d}</option>)}
              </select>
              <input type="text" placeholder="Subject Name" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required/>
              <div className="td-form-row">
                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required/>
                <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required/>
              </div>
              <input type="number" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })} min="15" placeholder="Duration (minutes)"/>
              <input type="url" placeholder="Google Meet / Zoom Link (optional)" value={formData.zoomLink} onChange={e => setFormData({ ...formData, zoomLink: e.target.value })}/>
              {formData.division && (
                <div className="td-modal-info">
                  <Users size={13}/>
                  <strong>{domainCounts[formData.division] || 0} students</strong> will be notified in "{formData.division}"
                </div>
              )}
              <div className="td-modal-buttons">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="td-btn-primary" disabled={creatingLecture}>
                  {creatingLecture ? <><div className="td-da-spinner" style={{ width: 14, height: 14, borderWidth: 2 }}/> Creating…</> : '🚀 Create & Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ ASSIGNMENT MODAL ══ */}
      {showAssignModal && (
        <div className="td-modal-overlay">
          <div className="td-modal">
            <button className="td-modal-close" onClick={() => setShowAssignModal(false)}><X size={16}/></button>
            <div className="td-modal-icon">📋</div>
            <h2>Create Assignment</h2>
            <p className="td-modal-sub">Assign to students in a domain</p>
            <form onSubmit={createAssignment}>
              <select value={assignForm.domain} onChange={e => setAssignForm({ ...assignForm, domain: e.target.value })} required>
                {DOMAINS.map(d => <option key={d}>{d}</option>)}
              </select>
              <input placeholder="Assignment title" value={assignForm.title} onChange={e => setAssignForm({ ...assignForm, title: e.target.value })} required/>
              <textarea placeholder="Description (optional)" rows={3} value={assignForm.description} onChange={e => setAssignForm({ ...assignForm, description: e.target.value })}/>
              <input type="date" value={assignForm.due} onChange={e => setAssignForm({ ...assignForm, due: e.target.value })} required/>
              {assignForm.domain && (
                <div className="td-modal-info">
                  <Users size={13}/>
                  Assigns to <strong>{domainCounts[assignForm.domain] || 0} students</strong> in "{assignForm.domain}"
                </div>
              )}
              <div className="td-modal-buttons">
                <button type="button" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="td-btn-primary" disabled={creatingAssignment}>
                  {creatingAssignment ? 'Creating…' : 'Assign to Domain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ PROJECT MODAL ══ */}
      {showProjectModal && (
        <div className="td-modal-overlay">
          <div className="td-modal">
            <button className="td-modal-close" onClick={() => setShowProjectModal(false)}><X size={16}/></button>
            <div className="td-modal-icon">📁</div>
            <h2>Create Project</h2>
            <p className="td-modal-sub">Assign a project to a domain</p>
            <form onSubmit={createProject}>
              <select value={projectForm.domain} onChange={e => setProjectForm({ ...projectForm, domain: e.target.value })} required>
                {DOMAINS.map(d => <option key={d}>{d}</option>)}
              </select>
              <input placeholder="Project title" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} required/>
              <textarea placeholder="Description (optional)" rows={3} value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}/>
              <input type="date" value={projectForm.deadline} onChange={e => setProjectForm({ ...projectForm, deadline: e.target.value })} required/>
              {projectForm.domain && (
                <div className="td-modal-info">
                  <Users size={13}/>
                  Assigns to <strong>{domainCounts[projectForm.domain] || 0} students</strong> in "{projectForm.domain}"
                </div>
              )}
              <div className="td-modal-buttons">
                <button type="button" onClick={() => setShowProjectModal(false)}>Cancel</button>
                <button type="submit" className="td-btn-primary" disabled={creatingProject}>
                  {creatingProject ? 'Creating…' : 'Assign Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;