import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  CalendarDays, 
  Clock, 
  TrendingUp, 
  Settings as SettingsIcon,
  MessageSquare
} from 'lucide-react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { UpdatePassword } from './pages/UpdatePassword';
import { Dashboard } from './pages/Dashboard';
import { Availability } from './pages/Availability';
import { Leads } from './pages/Leads';
import { Assessments } from './pages/Assessments';
import { Sales } from './pages/Sales';
import { LeadDetail } from './pages/LeadDetail';
import { Appointments } from './pages/Appointments';
import { Settings } from './pages/Settings';
import { HelpSupport } from './pages/HelpSupport';
import { supabase } from './supabaseClient';
import { useSession } from './hooks/useSession';
import { usePracticeId } from './hooks/usePracticeId';
import { PracticeGate } from './components/PracticeGate';

function Layout({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const location = useLocation();
  const { practice, loading: loadingPractice, error: practiceError } = usePracticeId();

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img 
            src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/fdd5f772-73a3-4208-fd11-f03e2a90eb00/public" 
            alt="Spinal Decompression" 
            className="brand-logo"
          />
        </div>
        
        <nav className="nav-menu">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
          </Link>
          
          <div className="nav-group">
            <span className="nav-group-title">Patients</span>
            <Link to="/leads" className={`nav-link ${isActive('/leads') ? 'active' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={18} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>Leads Center</span>
                  <span className="nav-helper">Initial inquiries</span>
                </div>
              </div>
            </Link>
            {/* 
            <Link to="/assessments" className={`nav-link ${isActive('/assessments') ? 'active' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ClipboardList size={18} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>Assessments</span>
                  <span className="nav-helper">Quiz completed</span>
                </div>
              </div>
            </Link>
            */}
            <Link to="/appointments" className={`nav-link ${isActive('/appointments') ? 'active' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CalendarDays size={18} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>Booking Center</span>
                  <span className="nav-helper">Scheduled sessions</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="nav-group">
            <span className="nav-group-title">Practice</span>
            <Link to="/availability" className={`nav-link ${isActive('/availability') ? 'active' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={18} />
                <span>Availability</span>
              </div>
            </Link>
            <Link to="/sales" className={`nav-link ${isActive('/sales') ? 'active' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={18} />
                <span>Sales & Outcomes</span>
              </div>
            </Link>
            <Link to="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <SettingsIcon size={18} />
                <span>Settings</span>
              </div>
            </Link>
          </div>

          <div className="nav-group">
            <span className="nav-group-title">Support</span>
            <Link to="/support" className={`nav-link ${isActive('/support') ? 'active' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MessageSquare size={18} />
                <span>Help & Support</span>
              </div>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          {session && (
            <>
              <div className="user-info">
                <span className="user-email">{session.user.email}</span>
                {loadingPractice ? (
                  <span className="user-practice" style={{ opacity: 0.5 }}>Loading...</span>
                ) : practice?.name ? (
                  <span className="user-practice">Practice: {practice.name}</span>
                ) : (
                  <span className="no-practice-pill">No practice linked</span>
                )}
              </div>
              <button className="btn btn-outline" style={{ width: '100%', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </aside>

      <main className="main-content">
        <PracticeGate practice={practice} loading={loadingPractice} error={practiceError}>
          {children}
        </PracticeGate>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><Layout><Leads /></Layout></ProtectedRoute>} />
        <Route path="/leads/:id" element={<ProtectedRoute><Layout><LeadDetail /></Layout></ProtectedRoute>} />
        <Route path="/assessments" element={<ProtectedRoute><Layout><Assessments /></Layout></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><Layout><Appointments /></Layout></ProtectedRoute>} />
        <Route path="/availability" element={<ProtectedRoute><Layout><Availability /></Layout></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute><Layout><Sales /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Layout><HelpSupport /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}
