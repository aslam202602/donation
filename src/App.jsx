import { useState, useEffect } from 'react';
import { Heart, Coins, User, Home, FileText, Activity, Users, Plus, Search, AlertCircle, CreditCard, X, Calendar, DollarSign, List, ShieldCheck, CheckCircle2, Lock, LogOut, Settings, History, Eye, EyeOff } from 'lucide-react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('payments'); // 'payments', 'donees', 'reports', 'settings'

  // --- REPORTS STATE ---
  const [reportStartDate, setReportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Default to first of the month
    return d.toISOString().split('T')[0];
  });
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);

  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [workingDate, setWorkingDate] = useState(() => new Date().toISOString().split('T')[0]); // YYYY-MM-DD

  // --- PASSWORD CHANGE STATE ---
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // --- ADMIN STATE ---
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ username: '', password: '', role: 'user' });
  const [userError, setUserError] = useState('');

  // --- AUDIT STATE ---
  const [auditLogs, setAuditLogs] = useState([]);

  // --- DONEE TAB STATE ---
  const [donees, setDonees] = useState([]);
  const [isAddingDonee, setIsAddingDonee] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [doneeForm, setDoneeForm] = useState({
    familyId: '',
    cnic: '',
    name: '',
    fatherName: '',
    address: '',
    status: 'Active',
    amount: ''
  });
  const [doneeError, setDoneeError] = useState('');

  // --- PAYMENTS TAB STATE ---
  const [payments, setPayments] = useState([]);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedDoneeId, setSelectedDoneeId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    setPaymentDate(workingDate);
  }, [workingDate]);

  // --- DATABASE & PERSISTENCE ---
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (window.dbApi) {
        const u = await window.dbApi.query('SELECT * FROM users');
        const a = await window.dbApi.query('SELECT * FROM audit_logs ORDER BY id DESC');
        const d = await window.dbApi.query('SELECT * FROM donees');
        const p = await window.dbApi.query('SELECT * FROM payments ORDER BY id DESC');
        if (u && u.length > 0) setUsers(u);
        if (a) setAuditLogs(a);
        if (d) setDonees(d);
        if (p) setPayments(p);
      } else {
        const u = localStorage.getItem('app_users');
        const a = localStorage.getItem('app_audit_logs');
        const d = localStorage.getItem('app_donees');
        const p = localStorage.getItem('app_payments');
        if (u) setUsers(JSON.parse(u));
        if (a) setAuditLogs(JSON.parse(a));
        if (d) setDonees(JSON.parse(d));
        if (p) setPayments(JSON.parse(p));
      }
      setDataLoaded(true);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    if (window.dbApi) {
      const saveToDb = async () => {
        await window.dbApi.execute('DELETE FROM donees');
        for (const d of donees) {
          await window.dbApi.execute('INSERT INTO donees (id, familyId, cnic, name, fatherName, address, status, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [d.id.toString(), d.familyId, d.cnic, d.name, d.fatherName, d.address, d.status, d.amount.toString()]);
        }
      };
      saveToDb();
    } else {
      localStorage.setItem('app_donees', JSON.stringify(donees));
    }
  }, [donees, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    if (window.dbApi) {
      const saveToDb = async () => {
        await window.dbApi.execute('DELETE FROM payments');
        for (const p of payments) {
          await window.dbApi.execute('INSERT INTO payments (id, date, doneeId, familyId, doneeName, amount) VALUES (?, ?, ?, ?, ?, ?)', [p.id.toString(), p.date, p.doneeId.toString(), p.familyId, p.doneeName, p.amount.toString()]);
        }
      };
      saveToDb();
    } else {
      localStorage.setItem('app_payments', JSON.stringify(payments));
    }
  }, [payments, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    if (window.dbApi) {
      const saveToDb = async () => {
        await window.dbApi.execute('DELETE FROM users');
        for (const u of users) {
          await window.dbApi.execute('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)', [u.id.toString(), u.username, u.password, u.role]);
        }
      };
      saveToDb();
    } else {
      localStorage.setItem('app_users', JSON.stringify(users));
    }
  }, [users, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    if (window.dbApi) {
      const saveToDb = async () => {
        await window.dbApi.execute('DELETE FROM audit_logs');
        for (const a of auditLogs) {
          await window.dbApi.execute('INSERT INTO audit_logs (id, timestamp, user, action, details) VALUES (?, ?, ?, ?, ?)', [a.id.toString(), a.timestamp, a.user, a.action, a.details]);
        }
      };
      saveToDb();
    } else {
      localStorage.setItem('app_audit_logs', JSON.stringify(auditLogs));
    }
  }, [auditLogs, dataLoaded]);

  // --- COMPUTED ---
  const selectedDonee = donees.find(d => d.id.toString() === selectedDoneeId);
  const filteredDonees = donees.filter(d =>
    d.familyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.cnic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const workingYear = new Date(workingDate).getFullYear();
  const workingMonth = new Date(workingDate).getMonth();

  const filteredPayments = payments.filter(p => {
    const pDate = new Date(p.date);
    const matchesMonthYear = pDate.getMonth() === workingMonth && pDate.getFullYear() === workingYear;
    const matchesSearch = p.familyId.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.doneeName.toLowerCase().includes(paymentSearch.toLowerCase());
    return matchesMonthYear && matchesSearch;
  });

  const sortedPayments = [...filteredPayments].sort((a, b) => new Date(b.date) - new Date(a.date));

  // --- PAYMENTS HANDLERS ---
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedDonee) return;

    // Check for duplicate payment within the same month/year
    const paymentMonth = new Date(workingDate).getMonth();
    const paymentYear = new Date(workingDate).getFullYear();

    const isDuplicateMonth = payments.some(p => {
      const existingPaymentDate = new Date(p.date);
      return p.doneeId === selectedDonee.id &&
        existingPaymentDate.getMonth() === paymentMonth &&
        existingPaymentDate.getFullYear() === paymentYear;
    });

    if (isDuplicateMonth) {
      setPaymentError(`A payment for ${selectedDonee.name} has already been recorded in ${new Date(workingDate).toLocaleString('default', { month: 'long', year: 'numeric' })}.`);
      return;
    }

    const newPayment = {
      id: Date.now(),
      date: workingDate,
      doneeId: selectedDonee.id,
      familyId: selectedDonee.familyId,
      doneeName: selectedDonee.name,
      amount: paymentAmount || selectedDonee.amount
    };

    setPayments([newPayment, ...payments]);
    logAudit('Payment Created', `Recorded payment of ${newPayment.amount} for ${newPayment.doneeName} (${newPayment.familyId})`);

    setIsAddingPayment(false);
    setSelectedDoneeId('');
    setPaymentDate(workingDate);
    setPaymentError('');
    setPaymentAmount('');
  };

  // --- DONEE HANDLERS ---
  const handleDoneeChange = (e) => {
    const { name, value } = e.target;
    setDoneeForm(prev => ({ ...prev, [name]: value }));
    if (doneeError) setDoneeError(''); // Clear error on edit
  };

  const handleDoneeSubmit = (e) => {
    e.preventDefault();

    // Check if a donee exactly matches this CNIC
    const matchingCnicIndex = donees.findIndex(d => d.cnic.toLowerCase() === doneeForm.cnic.toLowerCase());

    if (matchingCnicIndex !== -1) {
      // Edit Record Mode
      const updatedDonees = [...donees];
      updatedDonees[matchingCnicIndex] = {
        ...updatedDonees[matchingCnicIndex],
        ...doneeForm
      };
      setDonees(updatedDonees);
      logAudit('Donee Edited', `Updated details for CNIC: ${doneeForm.cnic} (${doneeForm.name})`);
    } else {
      // Add New Record Mode
      setDonees(prev => [...prev, { ...doneeForm, id: Date.now() }]);
      logAudit('Donee Created', `Registered new donee: ${doneeForm.name} (${doneeForm.cnic}) under Family ID ${doneeForm.familyId}`);
    }

    setIsAddingDonee(false);
    setDoneeForm({
      familyId: '',
      cnic: '',
      name: '',
      fatherName: '',
      address: '',
      status: 'Active',
      amount: ''
    });
    setDoneeError('');
  };

  // --- AUTH & ADMIN HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      setLoginForm({ username: '', password: '' });
      logAudit('User Login', `User '${user.username}' logged into the system.`, user.username);
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      logAudit('User Logout', `User '${currentUser.username}' logged out.`, currentUser.username);
    }
    setCurrentUser(null);
    setActiveTab('payments');
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (users.find(u => u.username === newUserForm.username)) {
      setUserError('Username already exists');
      return;
    }
    setUsers([...users, { ...newUserForm, id: Date.now() }]);
    logAudit('User Created', `Admin created new user: '${newUserForm.username}' with role '${newUserForm.role}'`);
    setIsAddingUser(false);
    setNewUserForm({ username: '', password: '', role: 'user' });
    setUserError('');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.current !== currentUser.password) {
      setPasswordError('Current password is completely incorrect.');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.new.length < 5) {
      setPasswordError('New password must be at least 5 characters long.');
      return;
    }

    // Update users array
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) return { ...u, password: passwordForm.new };
      return u;
    });
    setUsers(updatedUsers);

    // Update local state copy
    setCurrentUser({ ...currentUser, password: passwordForm.new });

    logAudit('Password Changed', `User '${currentUser.username}' updated their own password.`);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setPasswordSuccess('Password was successfully updated!');
    setTimeout(() => { setIsChangingPassword(false); setPasswordSuccess(''); }, 3000);
  };

  const logAudit = (action, details, specificUser = null) => {
    const actor = specificUser || (currentUser ? currentUser.username : 'System');
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: actor,
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // ==========================================
  // RENDER LOGIN SCREEN IF NOT AUTHENTICATED
  // ==========================================
  if (!currentUser) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>

        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--accent-primary)', width: '64px', height: '64px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Lock size={32} color="white" />
            </div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Donation / Zakat <span className="text-gradient">Payment</span></h1>
            <p style={{ color: 'var(--text-muted)' }}>Secure System Access</p>
          </div>

          {loginError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  style={{ paddingLeft: '2.75rem' }}
                  className="form-control"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  className="form-control"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Working Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="date"
                  required
                  value={workingDate}
                  onChange={(e) => setWorkingDate(e.target.value)}
                  style={{ paddingLeft: '2.75rem', paddingRight: '1rem', background: 'rgba(15, 23, 42, 0.6)' }}
                  className="form-control"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN AUTHENTICATED APPLICATION RENDER
  // ==========================================
  return (
    <div className="app-container">
      {/* Animated Background */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      {/* Header */}
      <header className="content-wrapper" style={{ flex: 'none', paddingBottom: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
              <Heart size={24} color="white" />
            </div>
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Donation / Zakat <span className="text-gradient">Payment</span></h1>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--glass-bg)', padding: '0.375rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
            <button
              onClick={() => setActiveTab('payments')}
              style={{
                background: activeTab === 'payments' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'payments' ? 'white' : 'var(--text-muted)',
                border: 'none', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)',
                fontFamily: 'Outfit', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Coins size={16} /> Payments
            </button>
            <button
              onClick={() => setActiveTab('donees')}
              style={{
                background: activeTab === 'donees' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'donees' ? 'white' : 'var(--text-muted)',
                border: 'none', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)',
                fontFamily: 'Outfit', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Users size={16} /> Manage Donees
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              style={{
                background: activeTab === 'reports' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'reports' ? 'white' : 'var(--text-muted)',
                border: 'none', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)',
                fontFamily: 'Outfit', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <FileText size={16} /> Reports
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                background: activeTab === 'settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'settings' ? 'white' : 'var(--text-muted)',
                border: 'none', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)',
                fontFamily: 'Outfit', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Settings size={16} /> Admin/Settings
            </button>
          </div>

          {/* User Profile Hook */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{currentUser.username}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{currentUser.role}</div>
            </div>
            <button onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s ease' }} title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="content-wrapper" style={{ padding: '2rem 1rem' }}>

        {/* =========================================
            PAYMENTS TAB
            ========================================= */}
        {activeTab === 'payments' && (
          <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Payment <span className="text-gradient">History</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Record and track all donee disbursements.</p>
              </div>
              <button onClick={() => setIsAddingPayment(true)} className="btn btn-primary" disabled={donees.length === 0}>
                <Plus size={20} /> Record Payment
              </button>
            </div>

            {/* Warning if no donees exist */}
            {donees.length === 0 && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', color: '#ef4444', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertCircle size={20} />
                <span>You must register at least one Donee before you can record a payment.</span>
              </div>
            )}

            {/* RECORD PAYMENT MODAL / INLINE CARD */}
            {isAddingPayment && donees.length > 0 && (
              <div className="glass-panel animate-fade-in" style={{ marginBottom: '2rem', border: '1px solid var(--accent-tertiary)', position: 'relative' }}>
                <button
                  onClick={() => setIsAddingPayment(false)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Record New Payment</h2>

                {paymentError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertCircle size={20} />
                    <span>{paymentError}</span>
                  </div>
                )}

                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <Calendar size={20} className="text-gradient" />
                  <span style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 500 }}>
                    Recording Payment for: <strong style={{ color: 'white' }}>{new Date(workingDate).toLocaleDateString()}</strong>
                  </span>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  <div className="form-group">
                    <label className="form-label">Select Donee</label>
                    <div style={{ position: 'relative' }}>
                      <Users size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                      <select
                        required
                        value={selectedDoneeId}
                        onChange={(e) => {
                          setSelectedDoneeId(e.target.value);
                          const d = donees.find(donee => donee.id.toString() === e.target.value);
                          if (d) setPaymentAmount(d.amount);
                        }}
                        style={{ paddingLeft: '2.75rem', appearance: 'none' }}
                        className="form-control"
                      >
                        <option value="" disabled>Search or select a Donee...</option>
                        {donees.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.cnic} - {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">Amount to Pay</label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="number"
                        required
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        style={{ paddingLeft: '2.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)' }}
                        className="form-control"
                        placeholder="Amount to pay"
                      />
                    </div>
                  </div>

                  {selectedDonee && (
                    <div className="animate-fade-in" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Donee Summary</h4>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Donor Name</span>
                        <span>{selectedDonee.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>CNIC</span>
                        <span>{selectedDonee.cnic}</span>
                      </div>
                      <div style={{ height: '1px', background: 'var(--glass-border)', margin: '1rem 0' }}></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-success)' }}>
                        <ShieldCheck size={18} />
                        <span style={{ fontSize: '0.875rem' }}>Verified matching profile parameters.</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" onClick={() => { setIsAddingPayment(false); setPaymentError(''); setPaymentAmount(''); }} className="btn btn-outline">Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={!selectedDonee}>Confirm Payment</button>
                  </div>
                </form>
              </div>
            )}

            {/* PAYMENTS SEARCH & TABLE PANEL */}
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>

              {/* Search Bar Area */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                  <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    placeholder="Search by Family ID or Donee Name..."
                    className="form-control"
                    style={{ paddingLeft: '3rem', background: 'rgba(15, 23, 42, 0.8)' }}
                  />
                </div>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{new Date(workingYear, workingMonth).toLocaleString('default', { month: 'short', year: 'numeric' })} Total:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-tertiary)' }}>
                    {sortedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Table Area */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Family ID</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Donee Name</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Amount Paid</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPayments.length > 0 ? (
                      sortedPayments.map((payment, index) => (
                        <tr key={payment.id} style={{ borderBottom: '1px solid var(--glass-border)', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.05)' } }}>
                          <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Calendar size={14} />
                              {new Date(payment.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{payment.familyId}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>{payment.doneeName}</td>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--accent-tertiary)' }}>{payment.amount}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span className="status-badge status-active">
                              <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Completed
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <List size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No payments recorded yet.</p>
                          {paymentSearch ?
                            <p style={{ fontSize: '0.9rem' }}>No results match your search for "{paymentSearch}".</p> :
                            <p style={{ fontSize: '0.9rem' }}>Click "Record Payment" to disburse funds to a Donee.</p>
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            DONEE MANAGEMENT TAB
            ========================================= */}
        {activeTab === 'donees' && (
          <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Donee <span className="text-gradient">Registry</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage and search permanent records of donees.</p>
              </div>
              <button onClick={() => setIsAddingDonee(true)} className="btn btn-primary">
                <Plus size={20} /> Add New Donee
              </button>
            </div>

            {/* ADD DONEE FORM MODAL OR INLINE CARD */}
            {isAddingDonee && (
              <div className="glass-panel animate-fade-in" style={{ marginBottom: '2rem', border: '1px solid var(--accent-primary)', position: 'relative' }}>
                <button
                  onClick={() => setIsAddingDonee(false)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Register New Donee</h2>

                {doneeError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertCircle size={20} />
                    <span>{doneeError}</span>
                  </div>
                )}

                <form onSubmit={handleDoneeSubmit}>
                  <div className="grid grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">CNIC</label>
                      <div style={{ position: 'relative' }}>
                        <CreditCard size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input name="cnic" value={doneeForm.cnic} onChange={handleDoneeChange} onBlur={() => {
                          const existing = donees.find(d => d.cnic.toLowerCase() === doneeForm.cnic.toLowerCase());
                          if (existing && !doneeForm.name) {
                            // Only auto-fill if they haven't started typing a name yet to avoid destroying their work
                            setDoneeForm({
                              ...existing
                            });
                          }
                        }} style={{ paddingLeft: '2.75rem' }} className="form-control" placeholder="Search CNIC to Edit, or enter New..." required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Family ID</label>
                      <div style={{ position: 'relative' }}>
                        <FileText size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input name="familyId" value={doneeForm.familyId} onChange={handleDoneeChange} style={{ paddingLeft: '2.75rem' }} className="form-control" placeholder="E.g. FAM-1029" required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Donee Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input name="name" value={doneeForm.name} onChange={handleDoneeChange} style={{ paddingLeft: '2.75rem' }} className="form-control" placeholder="Full Name" required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Father's Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input name="fatherName" value={doneeForm.fatherName} onChange={handleDoneeChange} style={{ paddingLeft: '2.75rem' }} className="form-control" placeholder="Father's Name" required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Monthly Amount</label>
                      <div style={{ position: 'relative' }}>
                        <Coins size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="number" name="amount" value={doneeForm.amount} onChange={handleDoneeChange} style={{ paddingLeft: '2.75rem' }} className="form-control" placeholder="Monthly target amount" required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <div style={{ position: 'relative' }}>
                        <Activity size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <select name="status" value={doneeForm.status} onChange={handleDoneeChange} style={{ paddingLeft: '2.75rem', appearance: 'none' }} className="form-control">
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Review">Review</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {doneeForm.familyId && donees.some(d => d.familyId.toLowerCase() === doneeForm.familyId.toLowerCase()) && (
                    <div className="animate-fade-in" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                      <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Users size={14} /> Registered Family Members for {doneeForm.familyId.toUpperCase()}
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {donees.filter(d => d.familyId.toLowerCase() === doneeForm.familyId.toLowerCase()).map(d => (
                          <span key={d.id} style={{
                            fontSize: '0.8rem',
                            background: d.cnic.toLowerCase() === doneeForm.cnic.toLowerCase() ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                            padding: '0.35rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            color: 'white',
                            border: d.cnic.toLowerCase() === doneeForm.cnic.toLowerCase() ? 'none' : '1px solid var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            {d.cnic.toLowerCase() === doneeForm.cnic.toLowerCase() && <User size={12} />}
                            {d.name} ({d.cnic})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <div style={{ position: 'relative' }}>
                      <Home size={18} style={{ position: 'absolute', left: '1rem', top: '20px', color: 'var(--text-muted)' }} />
                      <textarea name="address" value={doneeForm.address} onChange={handleDoneeChange} style={{ paddingLeft: '2.75rem', minHeight: '80px', resize: 'vertical' }} className="form-control" placeholder="Full residential address (Optional)"></textarea>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setIsAddingDonee(false)} className="btn btn-outline">Cancel</button>
                    <button type="submit" className="btn btn-primary">{donees.some(d => d.cnic.toLowerCase() === doneeForm.cnic.toLowerCase()) && doneeForm.cnic !== '' ? 'Update Donee' : 'Save Donee'}</button>
                  </div>
                </form>
              </div>
            )}

            {/* SEARCH & TABLE PANEL */}
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>

              {/* Search Bar Area */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                  <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Family ID or CNIC..."
                    className="form-control"
                    style={{ paddingLeft: '3rem', background: 'rgba(15, 23, 42, 0.8)' }}
                  />
                </div>
              </div>

              {/* Table Area */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Family ID</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>CNIC</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Donee Name</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Father Name</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Monthly Amount</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonees.length > 0 ? (
                      filteredDonees.map((donee, index) => (
                        <tr key={donee.id} style={{ borderBottom: '1px solid var(--glass-border)', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.05)' } }}>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{donee.familyId}</td>
                          <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{donee.cnic}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>{donee.name}</td>
                          <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{donee.fatherName}</td>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{donee.amount}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span className={`status-badge ${donee.status === 'Active' ? 'status-active' : ''}`}
                              style={{ ...(donee.status !== 'Active' ? { background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' } : {}) }}>
                              {donee.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <Users size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No donees found.</p>
                          {searchQuery ?
                            <p style={{ fontSize: '0.9rem' }}>No results match your search for "{searchQuery}".</p> :
                            <p style={{ fontSize: '0.9rem' }}>Click "Add New Donee" to register a family.</p>
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            REPORTS TAB
            ========================================= */}
        {activeTab === 'reports' && (() => {
          const reportPayments = payments.filter(p => p.date >= reportStartDate && p.date <= reportEndDate).sort((a, b) => new Date(b.date) - new Date(a.date));
          const totalAmount = reportPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

          return (
            <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Payment <span className="text-gradient">Reports</span></h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>View a summary of all payments within a specific timeframe.</p>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ marginBottom: 0, flex: '1 1 250px' }}>
                    <label className="form-label">Start Date</label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} className="form-control" style={{ paddingLeft: '2.75rem', background: 'rgba(15, 23, 42, 0.8)' }} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, flex: '1 1 250px' }}>
                    <label className="form-label">End Date</label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} className="form-control" style={{ paddingLeft: '2.75rem', background: 'rgba(15, 23, 42, 0.8)' }} />
                    </div>
                  </div>
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)', flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total Processed</span>
                    <span style={{ fontSize: '1.75rem', fontWeight: '700', color: '#38bdf8', lineHeight: 1 }}>{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Date</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Family ID</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Donee Name</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Amount Paid</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportPayments.length > 0 ? (
                        reportPayments.map((payment, index) => (
                          <tr key={`rep-${payment.id}`} style={{ borderBottom: '1px solid var(--glass-border)', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.05)' } }}>
                            <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={14} />
                                {new Date(payment.date).toLocaleDateString()}
                              </div>
                            </td>
                            <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{payment.familyId}</td>
                            <td style={{ padding: '1rem 1.5rem' }}>{payment.doneeName}</td>
                            <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--accent-tertiary)' }}>{payment.amount}</td>
                            <td style={{ padding: '1rem 1.5rem' }}>
                              <span className="status-badge status-active">
                                <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Completed
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                            <p style={{ fontSize: '1.1rem' }}>No payments found in this date range.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}
        {/* =========================================
            SETTINGS & AUDIT TAB
            ========================================= */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>System <span className="text-gradient">Settings</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage account security and view unalterable audit logs.</p>
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ alignItems: 'flex-start' }}>

              {/* Left Column: Security & Users */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Change Password Block */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={20} className="text-gradient" /> Change Account Password
                  </h3>

                  {passwordError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#22c55e', marginBottom: '1rem', fontSize: '0.875rem' }}>
                      {passwordSuccess}
                    </div>
                  )}

                  {!isChangingPassword ? (
                    <button onClick={() => setIsChangingPassword(true)} className="btn btn-outline" style={{ width: '100%' }}>Initialize Password Reset</button>
                  ) : (
                    <form onSubmit={handleChangePassword}>
                      <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input type="password" required value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className="form-control" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input type="password" required value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} className="form-control" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input type="password" required value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="form-control" />
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={() => { setIsChangingPassword(false); setPasswordError(''); }} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Password</button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Admin Only: User Management */}
                {currentUser.role === 'admin' ? (
                  <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--accent-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={20} className="text-gradient" /> User Management
                      </h3>
                      {!isAddingUser && (
                        <button onClick={() => setIsAddingUser(true)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                          <Plus size={16} /> Add User
                        </button>
                      )}
                    </div>

                    {userError && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        {userError}
                      </div>
                    )}

                    {isAddingUser ? (
                      <form onSubmit={handleAddUser} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Create New User Account</h4>
                        <div className="form-group">
                          <label className="form-label">Username</label>
                          <input type="text" required value={newUserForm.username} onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })} className="form-control" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Default Password</label>
                          <input type="text" required value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} className="form-control" placeholder="They can change this later" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Role</label>
                          <select value={newUserForm.role} onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })} className="form-control" style={{ appearance: 'none' }}>
                            <option value="user">Standard User</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button type="button" onClick={() => setIsAddingUser(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Account</button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {users.map(u => (
                          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <User size={18} color="var(--text-muted)" />
                              <span style={{ fontWeight: '500' }}>{u.username}</span>
                            </div>
                            <span className="status-badge" style={{ background: u.role === 'admin' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.1)', color: u.role === 'admin' ? '#38bdf8' : 'var(--text-muted)' }}>
                              {u.role.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="glass-panel" style={{ padding: '2rem', opacity: 0.6, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <ShieldCheck size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>User Management</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You must have Administrator privileges to register new application users.</p>
                  </div>
                )}
              </div>

              {/* Right Column: Audit Logs */}
              <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                  <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <History size={20} className="text-gradient" /> {currentUser.role === 'admin' ? 'System Audit Log' : 'My Activity Log'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {currentUser.role === 'admin' ? 'Immutable record of all system data modifications.' : 'Record of your recent account activity.'}
                  </p>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
                  {auditLogs.filter(log => currentUser.role === 'admin' || log.user === currentUser.username).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {auditLogs.filter(log => currentUser.role === 'admin' || log.user === currentUser.username).map(log => (
                        <div key={log.id} style={{ borderLeft: '2px solid var(--accent-tertiary)', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>@{log.user}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{log.action}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{log.details}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <List size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                      <p>No audit logs available to show.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
