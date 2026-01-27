import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { requireAuth } from '~/lib/auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { user, profile, supabase } = await requireAuth(request, context);

  // جلب مشاريع المستخدم
  const { data: projects, count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(6);

  // جلب إحصائيات الاستخدام
  let totalUsageThisMonth = 0;
  try {
    const { data: usageStats } = await supabase
      .from('usage_logs')
      .select('tokens_input, tokens_output')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    totalUsageThisMonth =
      usageStats?.reduce((acc: number, log: any) => acc + (log.tokens_input || 0) + (log.tokens_output || 0), 0) || 0;
  } catch {
    // usage_logs table might not exist yet
  }

  return json({
    profile,
    projects: projects || [],
    projectCount: projectCount || 0,
    totalUsageThisMonth,
  });
}

export default function ClientDashboard() {
  const { profile, projects, projectCount, totalUsageThisMonth } = useLoaderData<typeof loader>();

  const usagePercent = profile.usage_limit > 0 ? Math.round((profile.usage_current / profile.usage_limit) * 100) : 0;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bolt-elements-textPrimary">أهلاً {profile.full_name || 'بك'}! 👋</h1>
          <p className="text-bolt-elements-textSecondary">إليك نظرة سريعة على مشاريعك</p>
        </div>
        <Link
          to="/editor/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors"
        >
          <div className="i-ph:plus" />
          مشروع جديد
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bolt-elements-background-depth-2 rounded-xl p-5 border border-bolt-elements-borderColor">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-accent-500/10">
              <div className="i-ph:folder text-2xl text-accent-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-bolt-elements-textPrimary">{projectCount}</p>
              <p className="text-sm text-bolt-elements-textSecondary">مشروع</p>
            </div>
          </div>
        </div>

        <div className="bg-bolt-elements-background-depth-2 rounded-xl p-5 border border-bolt-elements-borderColor">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <div className="i-ph:chart-bar text-2xl text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-bolt-elements-textPrimary">
                {totalUsageThisMonth.toLocaleString('ar')}
              </p>
              <p className="text-sm text-bolt-elements-textSecondary">توكن هذا الشهر</p>
            </div>
          </div>
        </div>

        <div className="bg-bolt-elements-background-depth-2 rounded-xl p-5 border border-bolt-elements-borderColor">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-bolt-elements-textSecondary">حد الاستخدام</span>
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                profile.plan === 'free'
                  ? 'bg-gray-500/20 text-gray-400'
                  : profile.plan === 'pro'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-purple-500/20 text-purple-400'
              }`}
            >
              {profile.plan === 'free' ? 'مجاني' : profile.plan === 'pro' ? 'Pro' : 'Enterprise'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-bolt-elements-background-depth-1 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-accent-500'
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-bolt-elements-textPrimary">{usagePercent}%</span>
          </div>
          <p className="text-xs text-bolt-elements-textSecondary mt-1">
            {profile.usage_current.toLocaleString('ar')} / {profile.usage_limit.toLocaleString('ar')}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">مشاريعي</h2>
          {projectCount > 6 && (
            <Link to="/dashboard/client/projects" className="text-sm text-accent-400 hover:underline">
              عرض الكل ({projectCount})
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="bg-bolt-elements-background-depth-2 rounded-xl border border-bolt-elements-borderColor p-12 text-center">
            <div className="i-ph:folder-open text-5xl mx-auto mb-4 text-bolt-elements-textSecondary opacity-50" />
            <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-2">لا توجد مشاريع بعد</h3>
            <p className="text-bolt-elements-textSecondary mb-4">ابدأ بإنشاء مشروعك الأول مع الذكاء الاصطناعي</p>
            <Link
              to="/editor/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors"
            >
              <div className="i-ph:plus" />
              إنشاء مشروع
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project: any) => (
              <Link
                key={project.id}
                to={`/editor/${project.id}`}
                className="bg-bolt-elements-background-depth-2 rounded-xl border border-bolt-elements-borderColor p-4 hover:border-accent-500/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent-500/10 group-hover:bg-accent-500/20 transition-colors">
                    <div className="i-ph:folder text-xl text-accent-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-bolt-elements-textPrimary truncate group-hover:text-accent-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-bolt-elements-textSecondary mt-1">
                      آخر تعديل: {new Date(project.updated_at).toLocaleDateString('ar')}
                    </p>
                  </div>
                </div>
                {project.description && (
                  <p className="text-sm text-bolt-elements-textSecondary mt-3 line-clamp-2">{project.description}</p>
                )}
              </Link>
            ))}

            <Link
              to="/editor/new"
              className="bg-bolt-elements-background-depth-2 rounded-xl border border-dashed border-bolt-elements-borderColor p-4 hover:border-accent-500/50 transition-colors flex flex-col items-center justify-center min-h-[120px] group"
            >
              <div className="p-3 rounded-full bg-bolt-elements-background-depth-3 group-hover:bg-accent-500/20 transition-colors mb-2">
                <div className="i-ph:plus text-xl text-bolt-elements-textSecondary group-hover:text-accent-400" />
              </div>
              <span className="text-sm text-bolt-elements-textSecondary group-hover:text-accent-400">مشروع جديد</span>
            </Link>
          </div>
        )}
      </div>

      {profile.plan === 'free' && usagePercent > 50 && (
        <div className="bg-gradient-to-r from-accent-500/20 to-purple-500/20 rounded-xl p-6 border border-accent-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-accent-500/20">
              <div className="i-ph:rocket text-2xl text-accent-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-bolt-elements-textPrimary">ترقية للحصول على المزيد</h3>
              <p className="text-sm text-bolt-elements-textSecondary">
                احصل على حد استخدام أعلى ومميزات إضافية مع خطة Pro
              </p>
            </div>
            <Link
              to="/pricing"
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors"
            >
              ترقية الآن
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
