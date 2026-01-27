import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { requireDeveloper } from '~/lib/auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { supabase } = await requireDeveloper(request, context);

  // جلب الإحصائيات
  let stats = {
    total_users: 0,
    active_users: 0,
    total_projects: 0,
    total_conversations: 0,
    usage_today: 0,
    new_users_this_week: 0,
  };

  try {
    const { data } = await supabase.rpc('get_developer_stats');
    if (data) stats = data;
  } catch {
    // fallback to manual queries
    const [usersResult, projectsResult] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('projects').select('id', { count: 'exact' }),
    ]);
    stats.total_users = usersResult.count || 0;
    stats.total_projects = projectsResult.count || 0;
  }

  // جلب آخر المستخدمين
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, plan, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  // جلب آخر المشاريع
  const { data: recentProjects } = await supabase
    .from('projects')
    .select('id, name, user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return json({ stats, recentUsers: recentUsers || [], recentProjects: recentProjects || [] });
}

export default function AdminDashboard() {
  const { stats, recentUsers, recentProjects } = useLoaderData<typeof loader>();

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bolt-elements-textPrimary">لوحة تحكم المطور</h1>
          <p className="text-bolt-elements-textSecondary">مرحباً بك، إليك نظرة عامة على النظام</p>
        </div>
        <Link
          to="/editor/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors"
        >
          <div className="i-ph:plus" />
          مشروع جديد
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي المستخدمين" value={stats.total_users} icon="i-ph:users" color="purple" />
        <StatCard title="المستخدمين النشطين" value={stats.active_users} icon="i-ph:user-check" color="green" />
        <StatCard title="إجمالي المشاريع" value={stats.total_projects} icon="i-ph:folder" color="blue" />
        <StatCard title="المحادثات" value={stats.total_conversations} icon="i-ph:chat-circle" color="orange" />
      </div>

      <div className="bg-bolt-elements-background-depth-2 rounded-xl p-6 border border-bolt-elements-borderColor">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="i-ph:chart-line text-accent-400" />
          الاستخدام اليوم
        </h2>
        <div className="text-3xl font-bold text-accent-400">
          {(stats.usage_today || 0).toLocaleString('ar')}{' '}
          <span className="text-lg font-normal text-bolt-elements-textSecondary">توكن</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bolt-elements-background-depth-2 rounded-xl border border-bolt-elements-borderColor overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-bolt-elements-borderColor">
            <h2 className="font-semibold">آخر المستخدمين</h2>
            <Link to="/dashboard/admin/users" className="text-sm text-accent-400 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-bolt-elements-borderColor">
            {recentUsers.length === 0 ? (
              <div className="p-4 text-center text-bolt-elements-textSecondary">لا يوجد مستخدمين بعد</div>
            ) : (
              recentUsers.map((user: any) => (
                <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-bolt-elements-background-depth-3 flex items-center justify-center text-lg font-medium">
                    {user.full_name?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-bolt-elements-textPrimary truncate">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-xs text-bolt-elements-textSecondary">
                      {user.role === 'developer' ? 'مطور' : 'عميل'} • {user.plan}
                    </p>
                  </div>
                  <span className="text-xs text-bolt-elements-textSecondary">
                    {new Date(user.created_at).toLocaleDateString('ar')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-bolt-elements-background-depth-2 rounded-xl border border-bolt-elements-borderColor overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-bolt-elements-borderColor">
            <h2 className="font-semibold">آخر المشاريع</h2>
            <Link to="/dashboard/admin/projects" className="text-sm text-accent-400 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-bolt-elements-borderColor">
            {recentProjects.length === 0 ? (
              <div className="p-4 text-center text-bolt-elements-textSecondary">لا يوجد مشاريع بعد</div>
            ) : (
              recentProjects.map((project: any) => (
                <Link
                  key={project.id}
                  to={`/editor/${project.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-bolt-elements-background-depth-3 transition-colors"
                >
                  <div className="i-ph:folder text-2xl text-accent-400" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-bolt-elements-textPrimary truncate">{project.name}</p>
                    <p className="text-xs text-bolt-elements-textSecondary">
                      {new Date(project.created_at).toLocaleDateString('ar')}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-bolt-elements-background-depth-2 rounded-xl p-6 border border-bolt-elements-borderColor">
        <h2 className="text-lg font-semibold mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction href="/dashboard/admin/users" icon="i-ph:users" label="إدارة المستخدمين" color="purple" />
          <QuickAction href="/dashboard/admin/services" icon="i-ph:robot" label="إعدادات الخدمات" color="blue" />
          <QuickAction href="/dashboard/admin/analytics" icon="i-ph:chart-bar" label="التحليلات" color="green" />
          <QuickAction href="/settings" icon="i-ph:gear" label="إعدادات النظام" color="orange" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: 'purple' | 'blue' | 'green' | 'orange';
}) {
  const colors = {
    purple: 'bg-purple-500/10 text-purple-400',
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    orange: 'bg-orange-500/10 text-orange-400',
  };

  return (
    <div className="bg-bolt-elements-background-depth-2 rounded-xl p-5 border border-bolt-elements-borderColor">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-bolt-elements-textSecondary">{title}</p>
          <p className="text-2xl font-bold text-bolt-elements-textPrimary mt-1">{value.toLocaleString('ar')}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>
          <div className={`${icon} text-xl`} />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: string;
  label: string;
  color: 'purple' | 'blue' | 'green' | 'orange';
}) {
  const colors = {
    purple: 'hover:bg-purple-500/10 hover:border-purple-500/30',
    blue: 'hover:bg-blue-500/10 hover:border-blue-500/30',
    green: 'hover:bg-green-500/10 hover:border-green-500/30',
    orange: 'hover:bg-orange-500/10 hover:border-orange-500/30',
  };

  return (
    <Link
      to={href}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-bolt-elements-borderColor transition-colors ${colors[color]}`}
    >
      <div className={`${icon} text-2xl`} />
      <span className="text-sm text-center">{label}</span>
    </Link>
  );
}
