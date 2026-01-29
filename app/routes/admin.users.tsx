import { useState } from 'react';
import { motion } from 'framer-motion';
import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { useRequireAuth } from '~/lib/auth/useAuth';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Shield,
  Crown,
  Code,
  Eye,
  Mail,
  Calendar,
  MoreVertical,
  ArrowLeft,
  Loader2,
  X,
  Check,
  Ban,
  UserPlus,
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'إدارة المستخدمين - مبسط إديتر' }, { name: 'description', content: 'إدارة مستخدمي النظام' }];
};

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'client';
  status: 'active' | 'suspended' | 'pending';
  plan: 'free' | 'pro' | 'enterprise';
  projects: number;
  createdAt: string;
  lastLogin: string;
  avatar?: string;
}

const roleConfig = {
  admin: { label: 'مشرف', icon: Shield, color: 'bg-purple-500/20 text-purple-400' },
  developer: { label: 'مطور', icon: Code, color: 'bg-blue-500/20 text-blue-400' },
  client: { label: 'عميل', icon: Eye, color: 'bg-gray-500/20 text-gray-400' },
};

const statusConfig = {
  active: { label: 'نشط', color: 'bg-green-500/20 text-green-400' },
  suspended: { label: 'موقوف', color: 'bg-red-500/20 text-red-400' },
  pending: { label: 'معلق', color: 'bg-yellow-500/20 text-yellow-400' },
};

const planConfig = {
  free: { label: 'مجاني', color: 'bg-gray-500/20 text-gray-400' },
  pro: { label: 'Pro', color: 'bg-blue-500/20 text-blue-400' },
  enterprise: { label: 'Enterprise', color: 'bg-purple-500/20 text-purple-400' },
};

const mockUsers: User[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    role: 'admin',
    status: 'active',
    plan: 'enterprise',
    projects: 12,
    createdAt: '2024-01-15',
    lastLogin: '2024-06-10',
  },
  {
    id: '2',
    name: 'سارة علي',
    email: 'sara@example.com',
    role: 'developer',
    status: 'active',
    plan: 'pro',
    projects: 8,
    createdAt: '2024-02-20',
    lastLogin: '2024-06-09',
  },
  {
    id: '3',
    name: 'محمد خالد',
    email: 'mohammed@example.com',
    role: 'developer',
    status: 'active',
    plan: 'pro',
    projects: 5,
    createdAt: '2024-03-10',
    lastLogin: '2024-06-08',
  },
  {
    id: '4',
    name: 'ليلى أحمد',
    email: 'layla@example.com',
    role: 'client',
    status: 'pending',
    plan: 'free',
    projects: 2,
    createdAt: '2024-04-05',
    lastLogin: '2024-06-05',
  },
  {
    id: '5',
    name: 'عمر حسن',
    email: 'omar@example.com',
    role: 'client',
    status: 'suspended',
    plan: 'free',
    projects: 0,
    createdAt: '2024-01-30',
    lastLogin: '2024-05-01',
  },
  {
    id: '6',
    name: 'فاطمة محمود',
    email: 'fatima@example.com',
    role: 'developer',
    status: 'active',
    plan: 'pro',
    projects: 15,
    createdAt: '2024-02-15',
    lastLogin: '2024-06-10',
  },
  {
    id: '7',
    name: 'خالد سعيد',
    email: 'khaled@example.com',
    role: 'client',
    status: 'active',
    plan: 'enterprise',
    projects: 3,
    createdAt: '2024-05-01',
    lastLogin: '2024-06-09',
  },
];

export default function AdminUsersPage() {
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if user is admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">غير مصرح</h1>
          <p className="text-gray-400 mb-6">ليس لديك صلاحية الوصول لهذه الصفحة</p>
          <Link to="/dashboard" className="px-6 py-3 bg-purple-600 text-white rounded-xl">
            العودة للوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.includes(searchQuery) || u.email.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setUsers(
      users.map((u) => {
        if (u.id === id) {
          return { ...u, status: u.status === 'active' ? 'suspended' : 'active' };
        }

        return u;
      }),
    );
  };

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">إدارة المستخدمين</h1>
                <p className="text-gray-400 text-sm">{users.length} مستخدم مسجل</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>إضافة مستخدم</span>
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
          >
            <div className="p-2 rounded-lg w-fit mb-3 bg-purple-500/20">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">إجمالي المستخدمين</p>
            <span className="text-2xl font-bold text-white">{users.length}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
          >
            <div className="p-2 rounded-lg w-fit mb-3 bg-green-500/20">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">نشطون</p>
            <span className="text-2xl font-bold text-white">{users.filter((u) => u.status === 'active').length}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
          >
            <div className="p-2 rounded-lg w-fit mb-3 bg-blue-500/20">
              <Crown className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Pro</p>
            <span className="text-2xl font-bold text-white">{users.filter((u) => u.plan === 'pro').length}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
          >
            <div className="p-2 rounded-lg w-fit mb-3 bg-purple-500/20">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">مشرفون</p>
            <span className="text-2xl font-bold text-white">{users.filter((u) => u.role === 'admin').length}</span>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث عن مستخدم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white placeholder-gray-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white"
          >
            <option value="all">كل الأدوار</option>
            <option value="admin">مشرف</option>
            <option value="developer">مطور</option>
            <option value="client">عميل</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="suspended">موقوف</option>
            <option value="pending">معلق</option>
          </select>
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">المستخدم</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">الدور</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">الحالة</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">الباقة</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">المشاريع</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">آخر دخول</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => {
                  const RoleIcon = roleConfig[u.role].icon;
                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{u.name}</p>
                            <p className="text-gray-400 text-sm">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit ${roleConfig[u.role].color}`}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {roleConfig[u.role].label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm ${statusConfig[u.status].color}`}>
                          {statusConfig[u.status].label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm ${planConfig[u.plan].color}`}>
                          {planConfig[u.plan].label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-400">{u.projects}</td>
                      <td className="py-4 px-6 text-gray-400">{new Date(u.lastLogin).toLocaleDateString('ar-SA')}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              u.status === 'active' ? 'hover:bg-red-500/20' : 'hover:bg-green-500/20'
                            }`}
                          >
                            {u.status === 'active' ? (
                              <Ban className="w-4 h-4 text-red-400" />
                            ) : (
                              <Check className="w-4 h-4 text-green-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {filteredUsers.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">لا يوجد مستخدمون</h3>
            <p className="text-gray-400">لم يتم العثور على مستخدمين يطابقون بحثك</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
