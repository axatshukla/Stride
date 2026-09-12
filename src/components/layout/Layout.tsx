// ============================================================
// Layout Component
// ============================================================

import { useState, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ToastContainer from '../ui/Toast';
import TaskModal from '../tasks/TaskModal';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
      />
      <div className="app-main">
        <Navbar />
        <main className="app-content">
          {children}
        </main>
      </div>
      <ToastContainer />
      <TaskModal />
    </div>
  );
}
