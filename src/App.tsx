import { useApp, AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import Board from './pages/Board';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Team from './pages/Team';
import Tags from './pages/Tags';
import Settings from './pages/Settings';
import AuthPage from './components/auth/AuthPage';
import './App.css';

function MainApp() {
  const { isAuthenticated, isLoading, currentPage } = useApp();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        gap: '16px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }} />
        <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Loading workspace...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Layout>
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'tasks' && <TaskList />}
      {currentPage === 'board' && <Board />}
      {currentPage === 'calendar' && <Calendar />}
      {currentPage === 'analytics' && <Analytics />}
      {currentPage === 'team' && <Team />}
      {currentPage === 'tags' && <Tags />}
      {currentPage === 'settings' && <Settings />}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
