import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useNamespaces } from '../../api/hooks';
import { RESOURCE_CATEGORIES } from '../../types/k8s';
import { useState } from 'react';
import {
  LayoutDashboard, Network, ChevronDown, ChevronRight, Eye, CalendarClock,
  Box, Layers, Server, GitBranch, Timer, Clock, Globe, Route, Waypoints,
  Shield, FileText, Lock, UserCircle, HardDrive, Database, FolderOpen,
  Users, KeyRound, ShieldCheck, ShieldAlert, type LucideIcon
} from 'lucide-react';
import clsx from 'clsx';

const RESOURCE_ICONS: Record<string, LucideIcon> = {
  pods: Box, deployments: Layers, statefulsets: Server, daemonsets: GitBranch,
  replicasets: Layers, jobs: Timer, cronjobs: Clock,
  services: Globe, ingresses: Route, endpoints: Waypoints, networkpolicies: Shield,
  configmaps: FileText, secrets: Lock, pvs: HardDrive, pvcs: Database,
  storageclasses: FolderOpen,
  serviceaccounts: UserCircle, roles: Users, rolebindings: KeyRound,
  clusterroles: ShieldCheck, clusterrolebindings: ShieldAlert,
};

export function Sidebar() {
  const { namespace, setNamespace, sidebarOpen } = useApp();
  const { data: namespaces } = useNamespaces();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const location = useLocation();

  if (!sidebarOpen) return null;

  const toggleCategory = (cat: string) =>
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col z-20">
      <div className="h-14 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          K8s Dashboard
        </span>
      </div>

      <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-800">
        <select
          value={namespace}
          onChange={e => setNamespace(e.target.value)}
          className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Namespaces</option>
          {namespaces?.map((ns: string) => (
            <option key={ns} value={ns}>{ns}</option>
          ))}
        </select>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2">
        <NavLink
          to="/"
          className={({ isActive }) => clsx(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-1',
            isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' :
              'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>

        <NavLink
          to="/visualizer"
          className={({ isActive }) => clsx(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-1',
            isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' :
              'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <Network className="w-4 h-4" />
          Visualizer
        </NavLink>

        <NavLink
          to="/events"
          className={({ isActive }) => clsx(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-1',
            isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' :
              'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <CalendarClock className="w-4 h-4" />
          Events
        </NavLink>

        <div className="mt-3">
          {Object.entries(RESOURCE_CATEGORIES).map(([category, types]) => (
            <div key={category} className="mb-1">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-1 w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {collapsed[category] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {category}
              </button>
              {!collapsed[category] && (
                <div className="ml-1">
                  {types.map(type => {
                    const Icon = RESOURCE_ICONS[type] || Eye;
                    const isActive = location.pathname === `/resources/${type}`;
                    return (
                      <NavLink
                        key={type}
                        to={`/resources/${type}`}
                        className={clsx(
                          'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm',
                          isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' :
                            'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
