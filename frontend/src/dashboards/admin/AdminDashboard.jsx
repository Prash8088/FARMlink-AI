import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { RoleBadge, StatusBadge, VerifiedBadge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  Sprout,
  Building2,
  Truck,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserCheck,
  UserX,
  AlertTriangle,
  MapPin,
  TrendingUp,
  BarChart2
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user: currentAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab: overview | users | stats
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // State for metrics & data
  const [stats, setStats] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch dashboard summary
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch admin metrics'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users list
  const fetchUsers = useCallback(async () => {
    try {
      setTableLoading(true);
      const res = await adminService.getUsers({
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
        page: currentPage,
        limit: 10
      });
      if (res.success && res.data) {
        setUsersList(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch users list'
      });
    } finally {
      setTableLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter, currentPage]);

  // Fetch detailed statistics
  const fetchDetailedStats = useCallback(async () => {
    try {
      const res = await adminService.getStatistics();
      if (res.success && res.data) {
        setDetailedStats(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch detailed stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchDetailedStats();
  }, [fetchDashboardData, fetchDetailedStats]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Toggle user status (Activate / Deactivate)
  const handleToggleUserStatus = async (user) => {
    if (user._id === currentAdmin?._id) {
      setAlert({
        type: 'error',
        message: 'Security Guard: You cannot deactivate your own administrative account.'
      });
      return;
    }

    const nextStatus = !user.isActive;
    const actionLabel = nextStatus ? 'activate' : 'deactivate';

    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} account for "${user.fullName}" (${user.email})?`
      )
    ) {
      return;
    }

    try {
      const res = await adminService.updateUserStatus(user._id, nextStatus);
      if (res.success) {
        setAlert({
          type: 'success',
          message: res.message || `User account successfully ${actionLabel}d.`
        });
        // Refresh both list and dashboard counts
        fetchUsers();
        fetchDashboardData();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || `Failed to ${actionLabel} account.`
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-purple-900/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 text-purple-200 border border-purple-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
            <span>Master Administration Console</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform Command Center
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Real-time management of agricultural producers, wholesale buyers, logistics providers, and platform security policies.
          </p>

          {/* Tab Navigation */}
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Overview & Metrics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              User Directory ({stats?.totalUsers || 0})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'stats'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Geographic Distribution
            </button>
          </div>
        </div>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Primary Metrics Grid (Always visible across tabs for immediate context) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={stats ? stats.totalUsers : '...'}
          icon={Users}
          color="purple"
          badgeText="Real DB"
        />
        <StatCard
          title="Farmers"
          value={stats ? stats.totalFarmers : '...'}
          icon={Sprout}
          color="emerald"
          badgeText="Verified"
        />
        <StatCard
          title="Buyers"
          value={stats ? stats.totalBuyers : '...'}
          icon={Building2}
          color="blue"
          badgeText="Agro"
        />
        <StatCard
          title="Transporters"
          value={stats ? stats.totalTransporters : '...'}
          icon={Truck}
          color="amber"
          badgeText="Fleet"
        />
        <StatCard
          title="Active Accounts"
          value={stats ? stats.activeUsers : '...'}
          icon={CheckCircle2}
          color="emerald"
          badgeText="Live"
        />
        <StatCard
          title="Inactive Accounts"
          value={stats ? stats.inactiveUsers : '...'}
          icon={XCircle}
          color="rose"
          badgeText="Restricted"
        />
      </div>

      {/* TAB 1: OVERVIEW & RECENT REGISTRATIONS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent User Registrations</h3>
                <p className="text-xs text-slate-500">Live feed of latest platform sign-ups from MongoDB</p>
              </div>
              <button
                onClick={() => {
                  fetchDashboardData();
                  fetchUsers();
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Telemetry
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 px-4">Role</th>
                    <th className="pb-3 px-4">Mobile</th>
                    <th className="pb-3 px-4">Location</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4">Joined On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.recentRegistrations && stats.recentRegistrations.length > 0 ? (
                    stats.recentRegistrations.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pr-4">
                          <p className="font-bold text-slate-900">{u.fullName}</p>
                          <p className="text-slate-400 text-[11px]">{u.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">{u.phone}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {u.district}, {u.state}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge isActive={u.isActive} />
                        </td>
                        <td className="py-3 pl-4 text-slate-500">{formatDate(u.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No registrations recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('users')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                Go to Full User Management Directory →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL USER DIRECTORY & MANAGEMENT TABLE */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">User Management Table</h3>
              <p className="text-xs text-slate-500">
                Search, filter, inspect profiles, and activate/deactivate accounts
              </p>
            </div>
            <button
              onClick={fetchUsers}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${tableLoading ? 'animate-spin' : ''}`} />
              Reload Table
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Roles (Farmer, Buyer, Transporter, Admin)</option>
                <option value="farmer">Farmers Only</option>
                <option value="buyer">Buyers Only</option>
                <option value="transporter">Transporters Only</option>
                <option value="admin">Administrators Only</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Statuses (Active & Inactive)</option>
                <option value="active">Active Accounts Only</option>
                <option value="inactive">Deactivated Accounts Only</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pr-4">User Details</th>
                  <th className="pb-3 px-4">Role</th>
                  <th className="pb-3 px-4">Contact Phone</th>
                  <th className="pb-3 px-4">Location</th>
                  <th className="pb-3 px-4">Account Status</th>
                  <th className="pb-3 px-4">Registered</th>
                  <th className="pb-3 pl-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.length > 0 ? (
                  usersList.map((u) => {
                    const isSelf = u._id === currentAdmin?._id;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {u.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                {u.fullName}
                                {isSelf && (
                                  <span className="text-[10px] text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded font-semibold">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-slate-400 text-[11px]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{u.phone}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {u.village && <span>{u.village}, </span>}
                          {u.district}, {u.state}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge isActive={u.isActive} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{formatDate(u.createdAt)}</td>
                        <td className="py-3.5 pl-4 text-right">
                          {isSelf ? (
                            <span className="text-[11px] text-slate-400 italic">
                              Self (Protected)
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                                u.isActive
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {u.isActive ? (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  Activate
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      {tableLoading ? 'Loading users from database...' : 'No users match your search/filter criteria.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} Total Users)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PLATFORM DEMOGRAPHICS & STATE STATS */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Geographic Breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Geographic State Distribution</h3>
            </div>
            <p className="text-xs text-slate-500">Top user registrations by Indian state:</p>
            <div className="space-y-3 pt-2">
              {detailedStats?.stateDistribution && detailedStats.stateDistribution.length > 0 ? (
                detailedStats.stateDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item._id || 'Unassigned'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono font-bold text-slate-700">
                      {item.count} users
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No geographic data recorded.</p>
              )}
            </div>
          </div>

          {/* Role Breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <BarChart2 className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">Ecosystem Role Breakdown</h3>
            </div>
            <p className="text-xs text-slate-500">Registered user share across roles:</p>
            <div className="space-y-3 pt-2">
              {detailedStats?.roleDistribution && detailedStats.roleDistribution.length > 0 ? (
                detailedStats.roleDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <RoleBadge role={item._id} />
                    <span className="font-mono font-bold text-slate-800">{item.count} Accounts</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No role distribution data.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
