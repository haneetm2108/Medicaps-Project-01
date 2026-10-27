import React, { useState } from 'react';
import {
  ShieldCheck,
  Bell,
  LogOut,
  UserCheck,
  ChevronDown,
  Building2,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, AnnouncementItem, api } from '../api/client';

interface HeaderProps {
  currentUser: UserProfile | null;
  demoUsers: Array<Pick<UserProfile, '_id' | 'name' | 'email' | 'role' | 'department' | 'position' | 'avatar'>>;
  announcements: AnnouncementItem[];
  onSwitchUser: (email: string) => void;
  onLogout: () => void;
  onRefresh: () => void;
  onOpenAnnouncements: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  demoUsers,
  announcements,
  onSwitchUser,
  onLogout,
  onRefresh,
  onOpenAnnouncements,
  activeTab,
  setActiveTab,
}) => {
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const unreadAnnouncements = announcements.filter((a) => !a.isRead);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'hr_admin':
        return 'HR Administrator';
      case 'manager':
        return 'Engineering Manager';
      case 'employee':
        return 'Employee';
      default:
        return 'User';
    }
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'hr_admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'employee':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight">StaffSync</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  HRMS Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-500">Secure Node.js &middot; MongoDB &middot; JWT RBAC</p>
            </div>
          </div>

          {/* Quick Role Simulator & User Controls */}
          {currentUser ? (
            <div className="flex items-center space-x-3">
              {/* Live Refresh button */}
              <button
                onClick={onRefresh}
                title="Refresh application state from backend"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadAnnouncements.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {showNotificationDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Announcements ({unreadAnnouncements.length} unread)
                      </span>
                      <button
                        onClick={() => {
                          setShowNotificationDropdown(false);
                          setActiveTab('announcements');
                        }}
                        className="text-xs font-medium text-indigo-600 hover:underline"
                      >
                        View all
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {announcements.slice(0, 4).map((ann) => (
                        <div
                          key={ann._id}
                          onClick={() => {
                            setShowNotificationDropdown(false);
                            setActiveTab('announcements');
                          }}
                          className={`p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            !ann.isRead ? 'bg-indigo-50/70 border border-indigo-100' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 truncate">{ann.title}</span>
                            {!ann.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 ml-1"></span>
                            )}
                          </div>
                          <p className="text-slate-600 line-clamp-1 mt-0.5">{ann.content}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            By {ann.createdBy?.name || 'HR'}
                          </span>
                        </div>
                      ))}
                      {announcements.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4">No active announcements</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Role Switcher Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
                  className="flex items-center space-x-2 pl-3 pr-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs font-medium text-slate-700 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Switch Role</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showSwitchDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Simulate as Real User
                    </div>
                    <div className="space-y-1">
                      {demoUsers.map((u) => (
                        <button
                          key={u.email}
                          onClick={() => {
                            setShowSwitchDropdown(false);
                            onSwitchUser(u.email);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                            currentUser.email === u.email
                              ? 'bg-indigo-50 text-indigo-900 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500">
                              {u.position} &middot; {u.department}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-[10px] rounded-full uppercase font-bold border ${getRoleBadgeStyle(
                              u.role
                            )}`}
                          >
                            {u.role.replace('_', ' ')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Current Authenticated Profile */}
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200 shrink-0">
                  <img
                    src={
                      currentUser.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`
                    }
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                    {currentUser.name}
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full font-bold border ${getRoleBadgeStyle(
                        currentUser.role
                      )}`}
                    >
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    {currentUser.position} &middot; {currentUser.department}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign out session"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Not authenticated</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
