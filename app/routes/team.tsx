import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { getUser } from '~/lib/supabase/client';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { DashboardHeader } from '~/components/layout/sidebar';
import * as Avatar from '@radix-ui/react-avatar';
import {
  UserPlus,
  Mail,
  MoreVertical,
  Shield,
  Edit3,
  Trash2,
  Crown,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [
    { title: 'الفريق - مبسط إديتر' },
    { name: 'description', content: 'إدارة أعضاء الفريق' },
  ];
};

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: Date;
  lastActive?: Date;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    role: 'owner',
    status: 'active',
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date(),
  },
  {
    id: '2',
    name: 'سارة أحمد',
    email: 'sara@example.com',
    role: 'admin',
    status: 'active',
    joinedAt: new Date('2024-03-20'),
    lastActive: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '3',
    name: 'محمد علي',
    email: 'mohammed@example.com',
    role: 'editor',
    status: 'active',
    joinedAt: new Date('2024-05-10'),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '4',
    name: 'فاطمة خالد',
    email: 'fatima@example.com',
    role: 'viewer',
    status: 'pending',
    joinedAt: new Date('2025-01-20'),
  },
];

const roleLabels = {
  owner: { label: 'المالك', color: 'from-yellow-500 to-orange-500', icon: Crown },
  admin: { label: 'مدير', color: 'from-purple-500 to-blue-500', icon: Shield },
  editor: { label: 'محرر', color: 'from-blue-500 to-cyan-500', icon: Edit3 },
  viewer: { label: 'مشاهد', color: 'from-gray-500 to-gray-600', icon: null },
};

export default function TeamPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const { user: currentUser } = await getUser();
        // تم تعطيل التحقق مؤقتاً
        // if (!currentUser) {
        //   navigate('/login');
        //   return;
        // }
        setUser(currentUser || { email: 'demo@example.com', user_metadata: { name: 'مستخدم تجريبي' } });
      } catch (err) {
        console.error('Team error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const filteredMembers = mockTeamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLastActive = (date?: Date) => {
    if (!date) return 'لم يتصل بعد';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 5) return 'متصل الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={{
        name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'المستخدم',
        email: user?.email || '',
        avatar: user?.user_metadata?.avatar_url,
      }}
    >
      <div className="p-6 lg:p-8" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <DashboardHeader
            title="الفريق"
            subtitle={`${mockTeamMembers.length} أعضاء`}
          />

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <UserPlus className="h-5 w-5" />
            <span>دعوة عضو</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="بحث عن عضو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-11 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, index) => {
            const roleInfo = roleLabels[member.role];
            const RoleIcon = roleInfo.icon;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar.Root className="h-14 w-14 rounded-full overflow-hidden">
                        <Avatar.Image src={member.avatar} alt={member.name} className="object-cover" />
                        <Avatar.Fallback className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${roleInfo.color} text-white text-lg font-bold`}>
                          {member.name.charAt(0)}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      {member.status === 'active' && (
                        <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-gray-900" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium flex items-center gap-2">
                        {member.name}
                        {RoleIcon && <RoleIcon className="h-4 w-4 text-yellow-500" />}
                      </h3>
                      <p className="text-gray-400 text-sm">{member.email}</p>
                    </div>
                  </div>

                  <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${roleInfo.color} text-white`}>
                    {roleInfo.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatLastActive(member.lastActive)}
                  </span>
                </div>

                {member.status === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-yellow-400 text-sm text-center">في انتظار القبول</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
            >
              <h2 className="text-xl font-bold text-white mb-4">دعوة عضو جديد</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">الدور</label>
                  <select className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50">
                    <option value="viewer">مشاهد</option>
                    <option value="editor">محرر</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium"
                >
                  إرسال الدعوة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
