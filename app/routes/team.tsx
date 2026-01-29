import { useState } from 'react';
import { motion } from 'framer-motion';
import type { MetaFunction } from '@remix-run/cloudflare';
import { useRequireAuth } from '~/lib/auth/useAuth';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { DashboardHeader } from '~/components/layout/sidebar';
import {
  Users,
  Plus,
  Mail,
  MoreVertical,
  Shield,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Loader2,
  Search,
  X,
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'الفريق - مبسط إديتر' }, { name: 'description', content: 'إدارة فريق العمل' }];
};

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
}

const roleLabels: Record<string, { label: string; color: string }> = {
  owner: { label: 'المالك', color: 'bg-yellow-500/20 text-yellow-400' },
  admin: { label: 'مدير', color: 'bg-purple-500/20 text-purple-400' },
  developer: { label: 'مطور', color: 'bg-blue-500/20 text-blue-400' },
  viewer: { label: 'مشاهد', color: 'bg-gray-500/20 text-gray-400' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'نشط', color: 'bg-green-500/20 text-green-400' },
  pending: { label: 'معلق', color: 'bg-yellow-500/20 text-yellow-400' },
  inactive: { label: 'غير نشط', color: 'bg-red-500/20 text-red-400' },
};

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    role: 'owner',
    status: 'active',
    joinedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'سارة علي',
    email: 'sara@example.com',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'محمد خالد',
    email: 'mohammed@example.com',
    role: 'developer',
    status: 'active',
    joinedAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'ليلى أحمد',
    email: 'layla@example.com',
    role: 'developer',
    status: 'pending',
    joinedAt: '2024-04-05',
  },
  {
    id: '5',
    name: 'عمر حسن',
    email: 'omar@example.com',
    role: 'viewer',
    status: 'inactive',
    joinedAt: '2024-01-30',
  },
];

export default function TeamPage() {
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [members, setMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'developer' | 'viewer'>('developer');

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

  const filteredMembers = members.filter(
    (member) => member.name.includes(searchQuery) || member.email.includes(searchQuery),
  );

  const handleInvite = () => {
    if (!inviteEmail) {
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setMembers([...members, newMember]);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <DashboardLayout
      user={{
        name: user.name || user.email?.split('@')[0] || 'المستخدم',
        email: user.email || '',
        avatar: user.avatar,
      }}
    >
      <div className="p-6 lg:p-8" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <DashboardHeader title="الفريق" subtitle="إدارة أعضاء فريقك" />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>دعوة عضو</span>
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'إجمالي الأعضاء', value: members.length, icon: Users, color: 'purple' },
            {
              label: 'نشطون',
              value: members.filter((m) => m.status === 'active').length,
              icon: UserCheck,
              color: 'green',
            },
            {
              label: 'معلقون',
              value: members.filter((m) => m.status === 'pending').length,
              icon: UserX,
              color: 'yellow',
            },
            {
              label: 'المديرون',
              value: members.filter((m) => m.role === 'admin' || m.role === 'owner').length,
              icon: Crown,
              color: 'blue',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
            >
              <div
                className={`p-2 rounded-lg w-fit mb-3 ${
                  stat.color === 'purple'
                    ? 'bg-purple-500/20'
                    : stat.color === 'green'
                      ? 'bg-green-500/20'
                      : stat.color === 'yellow'
                        ? 'bg-yellow-500/20'
                        : 'bg-blue-500/20'
                }`}
              >
                <stat.icon
                  className={`h-5 w-5 ${
                    stat.color === 'purple'
                      ? 'text-purple-400'
                      : stat.color === 'green'
                        ? 'text-green-400'
                        : stat.color === 'yellow'
                          ? 'text-yellow-400'
                          : 'text-blue-400'
                  }`}
                />
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث عن عضو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white placeholder-gray-500"
          />
        </div>

        {/* Members List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">العضو</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">الدور</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">الحالة</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">تاريخ الانضمام</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.name}</p>
                          <p className="text-gray-400 text-sm">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm ${roleLabels[member.role].color}`}>
                        {roleLabels[member.role].label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm ${statusLabels[member.status].color}`}>
                        {statusLabels[member.status].label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400">{new Date(member.joinedAt).toLocaleDateString('ar-SA')}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {member.role !== 'owner' && (
                          <>
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">دعوة عضو جديد</h3>
                <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">الدور</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white"
                  >
                    <option value="admin">مدير</option>
                    <option value="developer">مطور</option>
                    <option value="viewer">مشاهد</option>
                  </select>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInvite}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium"
                >
                  إرسال الدعوة
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
