import React, { useState, useEffect, useCallback } from 'react';
import { 
  StudentSearch, Students, StudentManagement, 
  Subjects, TeacherAttendanceFlow, 
  MyPermits, PermitsModule, 
  Payments, Grades, UsersAdmin, LogsView, RolePermissionsView 
} from './App';

// --- MOBILE-FIRST DATA COMPONENTS ---

const MobileGradeCard = ({ g, subjects, students }) => { // eslint-disable-line no-unused-vars
  const sub = subjects.find(s => s.id === g.subject_id);
  const stu = students.find(s => s.id === g.student_id);
  const final = parseFloat(g.final) || 0;
  const statusColor = final >= 75 ? '#10b981' : (final > 0 ? '#f87171' : 'var(--text-dim)');

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '16px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
           <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--neon-blue)', marginBottom: '2px' }}>{sub?.subject_code || 'SUBJECT'}</div>
           <div style={{ fontSize: '15px', fontWeight: 800 }}>{stu?.full_name || 'Student'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '24px', fontWeight: 900, color: statusColor }}>{g.final || '--'}</div>
           <div style={{ fontSize: '9px', fontWeight: 900, opacity: 0.6 }}>FINAL GRADE</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
         {['P1', 'P2', 'MID', 'SF'].map((k, i) => (
           <div key={k} style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '8px', color: 'var(--text-dim)' }}>{k}</div>
             <div style={{ fontSize: '12px', fontWeight: 700 }}>{g[['prelim1', 'prelim2', 'midterm', 'semi_final'][i]] || '-'}</div>
           </div>
         ))}
      </div>
    </div>
  );
};

const MobileUserCard = ({ u }) => ( // eslint-disable-line no-unused-vars
  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '16px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '20px' }}>
      {u.username[0].toUpperCase()}
    </div>
    <div style={{ flex: 1 }}>
       <div style={{ fontSize: '15px', fontWeight: 800 }}>{u.full_name || u.username}</div>
       <div style={{ fontSize: '11px', color: 'var(--neon-blue)', fontWeight: 800, textTransform: 'uppercase' }}>{u.role}</div>
    </div>
    <div style={{ textAlign: 'right' }}>
       <div style={{ fontSize: '10px', color: u.is_active ? '#10b981' : '#f87171', fontWeight: 900 }}>{u.is_active ? 'ACTIVE' : 'INACTIVE'}</div>
    </div>
  </div>
);

const MobileLogItem = ({ l }) => ( // eslint-disable-line no-unused-vars
  <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
    <div style={{ fontSize: '20px' }}>{l.action?.includes('delete') ? '🗑️' : (l.action?.includes('add') ? '➕' : '📝')}</div>
    <div style={{ flex: 1 }}>
       <div style={{ fontSize: '13px', lineHeight: 1.4 }}>
         <span style={{ fontWeight: 800, color: 'var(--neon-blue)' }}>{l.username}</span> {l.action}
       </div>
       <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>{new Date(l.timestamp).toLocaleString()}</div>
    </div>
  </div>
);

// --- UI COMPONENTS ---

const GlassCard = ({ children, style = {}, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(12px)',
      borderRadius: '24px',
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      ...style
    }}
  >
    {children}
  </div>
);

// --- MOBILE DASHBOARD ---

const MobileDashboard = ({ token, role, hasPerm, api }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); 
  const [examValue, setExamValue] = useState("");
  const [leaderForm, setLeaderForm] = useState({ founder: "", evp: "", quote: "" });
  const [bannerUrl, setBannerUrl] = useState("");
  const [staffList, setStaffList] = useState([]);

  const canEdit = hasPerm("dashboard", "write") || role === "developer";

  const loadData = useCallback(async () => {
    try {
      const c = await api("/dashboard/content", {}, token);
      setContent(c);
      setExamValue(c.next_examination || "");
      setLeaderForm(c.school_leadership || { founder: "Dr. Grace B. Talpis, MPA", evp: "Lito Talpis", quote: "" });
      setBannerUrl(c.banner_url || "/ybvc.webp");
      setStaffList(c.ybvc_staff || []);
      setLoading(false);
    } catch (e) { console.error(e); }
  }, [api, token]);

  useEffect(() => { loadData(); }, [loadData]);

  const save = async (type, value) => {
    try {
      await api("/dashboard/content", { method: "POST", body: { type, value } }, token);
      setEditing(null);
      loadData();
    } catch (e) { alert(e.message); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--neon-blue)', fontWeight: 800 }}>SYNCING...</div>;

  return (
    <div className="content-animate" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. Exam Schedule */}
      <GlassCard onClick={() => setEditing('exam')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--neon-blue)', letterSpacing: 1 }}>NEXT EXAMINATION</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 4 }}>{content?.next_examination || "Tap to Set"}</div>
          </div>
          <span style={{ fontSize: 24 }}>📅</span>
        </div>
      </GlassCard>

      {/* 2. Staff Directory (GRID LAYOUT) */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--neon-blue)', letterSpacing: 1 }}>STAFF DIRECTORY ({staffList.length})</div>
          {canEdit && <button onClick={() => setEditing('staff')} style={{ background: 'var(--accent-gradient)', border: 'none', color: 'white', padding: '6px 16px', borderRadius: 10, fontSize: 11, fontWeight: 900 }}>MANAGE</button>}
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '24px 20px',
          padding: '10px 5px'
        }}>
          {staffList.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 100, height: 100, borderRadius: '50%', 
                background: 'rgba(255,255,255,0.05)', 
                margin: '0 auto 12px', overflow: 'hidden', 
                border: '2px solid rgba(68, 215, 255, 0.3)',
                boxShadow: '0 0 20px rgba(68, 215, 255, 0.1)'
              }}>
                {s.image ? <img src={s.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Staff" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>👤</div>}
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
                {s.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--neon-blue)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {s.position || 'Staff'}
              </div>
            </div>
          ))}
          {canEdit && (
            <div 
              onClick={() => setEditing('staff')}
              style={{ 
                width: 100, height: 100, borderRadius: '50%', 
                border: '2px dashed rgba(255,255,255,0.2)', 
                margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: 32, color: 'var(--text-dim)',
                cursor: 'pointer'
              }}
            >+</div>
          )}
        </div>
      </GlassCard>

      {/* 3. Landing Page Banner */}
      <GlassCard onClick={() => setEditing('banner')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--neon-blue)', letterSpacing: 1 }}>LANDING PAGE BANNER</div>
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>TAP TO CHANGE</span>
        </div>
        <div style={{ width: '100%', height: 100, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <img src={bannerUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Banner" />
        </div>
      </GlassCard>

      {/* 4. School Leadership */}
      <GlassCard onClick={() => setEditing('founder')} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--neon-blue)', letterSpacing: 1, marginBottom: 8 }}>SCHOOL LEADERSHIP</div>
        <div style={{ fontSize: 28, marginBottom: 12 }}>🏛️</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{leaderForm.founder}</div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4, fontWeight: 600 }}>{leaderForm.evp}</div>
      </GlassCard>

      {/* MODALS */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: '#020617', zIndex: 6000, padding: '24px 20px', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s ease-out' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingTop: 'env(safe-area-inset-top)' }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#fff' }}>Edit {editing.toUpperCase()}</h2>
              <button onClick={() => setEditing(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%', fontSize: 20 }}>✕</button>
           </div>
           <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
              {editing === 'exam' && (
                <div>
                   <input value={examValue} onChange={e => setExamValue(e.target.value)} style={{ width: '100%', padding: 18, background: '#0f172a', border: '1px solid rgba(68, 215, 255, 0.3)', borderRadius: 16, color: 'white', fontSize: 18, marginBottom: 20 }} />
                   <button onClick={() => save('next_examination', examValue)} style={{ width: '100%', padding: 20, background: 'var(--accent-gradient)', border: 'none', borderRadius: 20, color: 'white', fontWeight: 900 }}>SAVE CHANGES</button>
                </div>
              )}
              {editing === 'banner' && (
                <div>
                   <img src={bannerUrl} style={{ width: '100%', height: 180, borderRadius: 16, objectFit: 'cover', marginBottom: 20 }} alt="Banner" />
                   <input type="file" onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setBannerUrl(reader.result);
                        reader.readAsDataURL(file);
                      }
                   }} style={{ marginBottom: 20 }} />
                   <button onClick={() => save('banner_url', bannerUrl)} style={{ width: '100%', padding: 20, background: 'var(--accent-gradient)', border: 'none', borderRadius: 20, color: 'white', fontWeight: 900 }}>UPLOAD & SAVE</button>
                </div>
              )}
              {editing === 'staff' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {staffList.map((s, i) => (
                    <div key={i} style={{ background: '#0f172a', padding: 20, borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
                       <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <label style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {s.image ? <img src={s.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Staff" /> : '📷'}
                            <input type="file" hidden onChange={e => {
                               const file = e.target.files[0];
                               if (file) {
                                 const reader = new FileReader();
                                 reader.onloadend = () => { const nl = [...staffList]; nl[i].image = reader.result; setStaffList(nl); };
                                 reader.readAsDataURL(file);
                               }
                            }} />
                          </label>
                          <div style={{ flex: 1 }}>
                             <input value={s.name} onChange={e => { const nl = [...staffList]; nl[i].name = e.target.value; setStaffList(nl); }} placeholder="Full Name" style={{ width: '100%', background: 'none', border: 'none', color: 'white', fontWeight: 800 }} />
                          </div>
                          <button onClick={() => setStaffList(staffList.filter((_, idx) => idx !== i))} style={{ color: '#f87171', background: 'none', border: 'none' }}>✕</button>
                       </div>
                    </div>
                  ))}
                  <button onClick={() => setStaffList([...staffList, { name: "", position: "", image: "" }])} style={{ width: '100%', padding: 18, background: 'none', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 20, color: 'white', fontWeight: 800 }}>+ ADD NEW STAFF</button>
                  <button onClick={() => save('ybvc_staff', staffList)} style={{ width: '100%', padding: 20, background: 'var(--accent-gradient)', border: 'none', borderRadius: 20, color: 'white', fontWeight: 900 }}>SAVE DIRECTORY</button>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

// --- MENU DRAWER ---

const MenuDrawer = ({ isOpen, onClose, role, onNavigate, hasPerm }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📈' },
    { id: 'search', label: 'Search Records', icon: '🔍' },
    { id: 'students', label: 'Add Student', icon: '➕' },
    { id: 'studentmgmt', label: 'Student Management', icon: '👥' },
    { id: 'attendance', label: 'Attendance', icon: '📝' },
    { id: 'grades', label: 'Grade Records', icon: '📊' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'users', label: 'User Accounts', icon: '👤' },
    { id: 'permissions', label: 'Permissions', icon: '🔐' },
    { id: 'logs', label: 'System Logs', icon: '📋' },
  ];

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 6000, background: 'rgba(2, 6, 23, 0.98)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: 'var(--neon-blue)' }}>Menu Hub</h2>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%' }}>✕</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {menuItems.map(item => (
          <div key={item.id} onClick={() => { onNavigate(item.id); onClose(); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 800, textAlign: 'center' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN LAYOUT ---

export function MobileLayout(props) {
  const { auth, content, stats, onLogout, onPageChange, activePage, api, token, role, hasPerm, subjects, permitsSemester, students, grades } = props; // eslint-disable-line no-unused-vars
  const [activeTab, setActiveTab] = useState('home');
  const [userSearch, setUserSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [allLogs, setAllLogs] = useState([]); // eslint-disable-line no-unused-vars
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (activePage === 'dashboard') setActiveTab('home');
    else if (activePage === 'attendance') setActiveTab('attendance');
    else if (['permits', 'mypermits'].includes(activePage)) setActiveTab('permits');
    else setActiveTab(null);
  }, [activePage]);

  useEffect(() => {
    if (activePage === 'grades' && token) {
      setLoadingGrades(true);
      api('/grades', {}, token)
        .then(r => { setLocalGrades(Array.isArray(r) ? r : []); setLoadingGrades(false); })
        .catch(() => setLoadingGrades(false));
    }
    if (activePage === 'logs' && token) api('/logs', {}, token).then(r => setAllLogs(r || []));
    if (activePage === 'users' && token) api('/users', {}, token).then(r => setAllUsers(r || []));
  }, [activePage, token, api]);

  const [localGrades, setLocalGrades] = useState([]); // eslint-disable-line no-unused-vars
  const [loadingGrades, setLoadingGrades] = useState(false); // eslint-disable-line no-unused-vars

  useEffect(() => {
    if (activePage === 'grades' && token) {
      setLoadingGrades(true);
      api('/grades', {}, token)
        .then(r => { setLocalGrades(Array.isArray(r) ? r : []); setLoadingGrades(false); })
        .catch(() => setLoadingGrades(false));
    }
  }, [activePage, token, api]);

  const renderContent = () => {
    const getPerms = (mod) => ({ canWrite: hasPerm(mod, "write"), canDelete: hasPerm(mod, "delete") });

    switch (activePage) {
      case 'dashboard':
        return <MobileDashboard token={token} role={role} hasPerm={hasPerm} api={api} content={content} stats={stats} auth={auth} />;

      case 'grades':
        return <div className="module-content"><Grades {...props} allSubjects={subjects} canWrite={hasPerm("grades", "write")} canDelete={hasPerm("grades", "delete")} /></div>;

      case 'logs':
        return <div className="module-content"><LogsView {...props} {...getPerms("logs")} /></div>;

      case 'users':
        const filteredUsers = (Array.isArray(allUsers) ? allUsers : []).filter(u => 
          (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
          (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) ||
          (u.role || '').toLowerCase().includes(userSearch.toLowerCase())
        );
        return (
          <div className="content-animate module-content">
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>User Management</h2>
            <div className="glass-card" style={{ marginBottom: 20, padding: 12 }}>
              <input 
                type="text" 
                placeholder="🔍 Search users by name, role..." 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ margin: 0, padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: 'none' }}
              />
            </div>
            <UsersAdmin {...props} allUsers={filteredUsers} {...getPerms("users")} />
          </div>
        );

      case 'permissions':
        return <div className="module-content"><RolePermissionsView {...props} /></div>;

      case 'search': return <div className="module-content"><StudentSearch {...props} {...getPerms("students")} /></div>;
      case 'students': return <div className="module-content"><Students {...props} {...getPerms("students")} /></div>;
      case 'student_manage': return <div className="module-content"><StudentManagement {...props} {...getPerms("students")} /></div>;
      case 'subjects': return <div className="module-content"><Subjects {...props} {...getPerms("subjects")} /></div>;
      case 'attendance': return <div className="module-content"><TeacherAttendanceFlow {...props} allSubjects={subjects} authFullName={auth?.full_name} authUsername={auth?.username} {...getPerms("attendance")} /></div>;
      case 'permits': return <div className="module-content"><PermitsModule {...props} semesterId={permitsSemester} username={auth?.username} full_name={auth?.full_name} {...getPerms("permits")} /></div>;
      case 'mypermits': return <div className="module-content"><MyPermits token={token} /></div>;
      case 'payments': return <div className="module-content"><Payments {...props} {...getPerms("payments")} /></div>;
      
      default: return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>Loading module...</div>;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at top right, #0f172a, #020617)', 
      color: 'white', 
      paddingBottom: 120, 
      fontFamily: "'Inter', sans-serif",
      overflowX: 'hidden', // Extreme Lock
      maxWidth: '100vw',
      position: 'relative',
      touchAction: 'pan-y' // Disable horizontal swiping
    }}>
      <style>{`
        /* MASTER MOBILE SHIELD: Force everything to stack vertically */
        .mobile-content-wrapper > .content-animate > .glass-card,
        .mobile-content-wrapper > div > .glass-card { 
          width: 100% !important; 
          margin: 0 0 16px 0 !important; 
          background: rgba(255,255,255,0.03) !important; 
          backdrop-filter: blur(12px) !important; 
          border-radius: 24px !important; 
          border: 1px solid rgba(255,255,255,0.08) !important; 
          padding: 20px !important;
          box-sizing: border-box !important;
          overflow: hidden !important; /* Fix image leak */
        }

        /* GLOBAL IMAGE SHIELD: No image can ever be wider than the screen */
        .mobile-content-wrapper img {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
        }
        
        /* MASTER MOBILE SHIELD: Force everything to stack vertically */
        .mobile-content-wrapper div {
           max-width: 100% !important;
        }

        /* MASTER MOBILE SHIELD: Force stacking ONLY in modules, not dashboard */
        .module-content div[style*="display: flex"],
        .module-content div[style*="display:flex"],
        .module-content div[style*="display: grid"],
        .module-content div[style*="display:grid"] {
           display: flex !important;
           flex-direction: column !important;
           grid-template-columns: 1fr !important;
           align-items: stretch !important;
           width: 100% !important;
           box-sizing: border-box !important;
           gap: 12px !important;
        }

        /* Protect dashboard and lock horizontal overflow */
        .mobile-content-wrapper {
           overflow-x: hidden !important;
           max-width: 100vw !important;
           position: relative !important;
        }

        .mobile-content-wrapper > div:first-child div[style*="display: flex"] {
           flex-direction: row; 
           max-width: 100% !important;
        }

        /* Ensure card headers and content don't overflow */
        .mobile-content-wrapper .glass-card > div,
        .mobile-content-wrapper .content-animate > div {
           width: 100% !important;
           box-sizing: border-box !important;
           padding-left: 0 !important;
           padding-right: 0 !important;
        }

        /* TRANSFORM TABLES INTO MOBILE CARDS */
        .mobile-content-wrapper table, 
        .mobile-content-wrapper tbody, 
        .mobile-content-wrapper tr, 
        .mobile-content-wrapper td {
          display: block !important;
          width: 100% !important;
        }
        .mobile-content-wrapper tr {
          background: rgba(255,255,255,0.03) !important;
          margin-bottom: 16px !important;
          padding: 16px !important;
          border-radius: 16px !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
        }
        .mobile-content-wrapper td {
          text-align: left !important;
          padding: 8px 0 !important;
          border: none !important;
        }
        .mobile-content-wrapper thead { display: none !important; }

        /* Fix forms and payment menus */
        .mobile-content-wrapper .form-container, 
        .mobile-content-wrapper form, 
        .mobile-content-wrapper .payment-form {
           display: flex !important; 
           flex-direction: column !important; 
           align-items: stretch !important; 
        }

        .mobile-content-wrapper label { text-align: left !important; margin-bottom: 8px !important; font-weight: 800 !important; font-size: 11px !important; color: var(--neon-blue) !important; text-transform: uppercase !important; }
        .mobile-content-wrapper input, .mobile-content-wrapper select, .mobile-content-wrapper textarea { width: 100% !important; background: rgba(0,0,0,0.2) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; padding: 14px !important; color: white !important; font-size: 16px !important; margin-bottom: 16px !important; }
        .mobile-content-wrapper button { width: 100% !important; padding: 16px !important; border-radius: 16px !important; font-weight: 900 !important; }
        .mobile-content-wrapper table { display: block !important; overflow-x: auto !important; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      <div style={{ padding: '30px 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--neon-blue)', fontWeight: 900, letterSpacing: 2 }}>PORTAL MOBILE</div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>{activePage.toUpperCase()}</div>
        </div>
        <div onClick={() => setProfileOpen(true)} style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
          {auth?.username[0].toUpperCase()}
        </div>
      </div>

      <div style={{ padding: '0 24px' }} className="mobile-content-wrapper">
        {renderContent()}
      </div>

      <div style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', height: '75px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(68, 215, 255, 0.2)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 2000 }}>
        {[
          { id: 'home', icon: '🏠', label: 'Home' },
          { id: 'attendance', icon: '📝', label: 'Attendance' },
          { id: 'permits', icon: '🎫', label: 'Permits' },
          { id: 'more', icon: '☰', label: 'Menu' }
        ].map(tab => (
          <div key={tab.id} onClick={() => tab.id === 'more' ? setMenuOpen(true) : onPageChange(tab.id === 'home' ? 'dashboard' : tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: activeTab === tab.id ? 'var(--neon-blue)' : 'var(--text-dim)', opacity: activeTab === tab.id ? 1 : 0.6 }}>
            <span style={{ fontSize: 24 }}>{tab.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 900 }}>{tab.label}</span>
          </div>
        ))}
      </div>

      <MenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} role={role} onNavigate={onPageChange} hasPerm={hasPerm} />

      {profileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(2, 6, 23, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
           <div style={{ background: '#0f172a', width: '100%', maxWidth: 320, borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '32px 24px', textAlign: 'center', background: 'var(--accent-gradient)' }}>
                 <div style={{ fontWeight: 900, fontSize: '18px' }}>{auth?.full_name || auth?.username}</div>
                 <div style={{ fontSize: '11px', opacity: 0.7, textTransform: 'uppercase' }}>{role}</div>
              </div>
              <div style={{ padding: '16px' }}>
                 <button onClick={onLogout} style={{ width: '100%', padding: '14px', background: '#f87171', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 900 }}>LOGOUT</button>
                 <button onClick={() => setProfileOpen(false)} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', marginTop: 10 }}>Close</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
