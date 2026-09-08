import React, { useState } from 'react';
import { Sidebar, NavItemKey } from '@/components/layout/Sidebar';
import { Header, SolverStatusType } from '@/components/layout/Header';
import { StatusBar } from '@/components/layout/StatusBar';
import { DashboardView } from '@/components/views/DashboardView';
import { MareyView } from '@/components/views/MareyView';
import { DemandsView } from '@/components/views/DemandsView';

import { SolverView } from '@/components/views/SolverView';
import { LifecycleView } from '@/components/views/LifecycleView';
import { SettingsView } from '@/components/views/SettingsView';
import { MOCK_DEMANDS } from '@/data/mockData';

export const App: React.FC = () => {
  // Navigation State
  const [activeNav, setActiveNav] = useState<NavItemKey>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // System Controls State
  const [chaosMode, setChaosMode] = useState<boolean>(false);
  const [solverStatus, setSolverStatus] = useState<SolverStatusType>('idle');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>('SOLV-2026-BPL-0941');
  const [lastSolveTime, setLastSolveTime] = useState<string>('19:42:08 IST');
  const [solveDurationSec, setSolveDurationSec] = useState<number>(1.84);

  // Handler for running the solver
  const handleRunSolver = () => {
    if (solverStatus === 'solving') return;

    setSolverStatus('solving');
    const startTime = Date.now();

    setTimeout(() => {
      const elapsed = Number(((Date.now() - startTime) / 1000).toFixed(2));
      setSolverStatus('done');
      setSolveDurationSec(elapsed);
      const now = new Date();
      setLastSolveTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} IST`
      );
      setActiveSessionId(`SOLV-2026-BPL-${Math.floor(1000 + Math.random() * 9000)}`);
    }, 1600);
  };

  // Nav Title Helper
  const getNavTitle = (): { title: string; subtitle?: string } => {
    switch (activeNav) {
      case 'dashboard':
        return {
          title: 'Corridor Overview',
          subtitle: 'Live Operations & Block Schedule Dashboard',
        };
      case 'marey':
        return {
          title: 'Marey Time-Space Diagram',
          subtitle: 'Interactive Stringline Timetable & Block Bands (D3.js)',
        };
      case 'demands':

        return {
          title: 'Block Demands',
          subtitle: 'TMS, SMMS & TDMS Maintenance Requests',
        };
      case 'solver':
        return {
          title: 'AI Scheduling Cockpit',
          subtitle: 'CP-SAT Optimization & Explainable Reasoning (XAI)',
        };
      case 'lifecycle':
        return {
          title: 'Block Lifecycle',
          subtitle: 'Proposal to Line Clear Execution Pipeline',
        };
      case 'settings':
        return {
          title: 'System Settings',
          subtitle: 'Corridor Rules & Kavach Constraints',
        };
      default:
        return { title: 'LINE CLEAR' };
    }
  };

  const navMeta = getNavTitle();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* 1. Left Sidebar (Fixed / Desktop w-64, Drawer on Mobile) */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={(key) => setActiveNav(key)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        demandCount={MOCK_DEMANDS.length}
        activeClashes={0}
      />

      {/* 2. Main Wrapper (Offset on desktop for w-64 sidebar) */}
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-64">
        {/* Top Header */}
        <Header
          title={navMeta.title}
          subtitle={navMeta.subtitle}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          chaosMode={chaosMode}
          onChaosModeChange={(chaos) => setChaosMode(chaos)}
          solverStatus={solverStatus}
          onRunSolver={handleRunSolver}
          unreadAlertCount={3}
        />

        {/* Center Main Content Area (Scrollable) */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 railway-grid">
          <div className="mx-auto max-w-7xl">
            {activeNav === 'dashboard' && (
              <DashboardView
                chaosMode={chaosMode}
                onRunSolver={handleRunSolver}
                solverStatus={solverStatus}
                onNavigate={(view) => setActiveNav(view as any)}
              />
            )}

            {activeNav === 'marey' && (
              <MareyView
                chaosMode={chaosMode}
                onChaosModeChange={(chaos) => setChaosMode(chaos)}
              />
            )}

            {activeNav === 'demands' && <DemandsView />}


            {activeNav === 'solver' && (
              <SolverView
                solverStatus={solverStatus}
                onRunSolver={handleRunSolver}
              />
            )}

            {activeNav === 'lifecycle' && <LifecycleView />}

            {activeNav === 'settings' && <SettingsView />}
          </div>
        </main>

        {/* Bottom Status Bar */}
        <StatusBar
          isConnected={isConnected}
          onToggleConnection={() => setIsConnected(!isConnected)}
          activeSessionId={activeSessionId}
          lastSolveTime={lastSolveTime}
          solveDurationSec={solveDurationSec}
          optimalityGap={0.0}
        />
      </div>
    </div>
  );
};

export default App;
