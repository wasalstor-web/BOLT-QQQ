import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';

// Agent types and their specializations
const AGENTS = {
  claude: {
    name: 'كلود',
    emoji: '🟣',
    specialty: ['analysis', 'writing', 'coding', 'complex-reasoning', 'arabic'],
    model: 'claude-3-haiku-20240307',
  },
  openai: {
    name: 'جي بي تي',
    emoji: '🟢',
    specialty: ['general', 'math', 'data', 'quick-answers', 'creative'],
    model: 'gpt-4o-mini',
  },
  google: {
    name: 'جيميناي',
    emoji: '🔵',
    specialty: ['research', 'facts', 'current-events', 'summarization'],
    model: 'gemini-1.5-flash',
  },
};

// Determine which agent to use based on the task
function selectAgent(message: string): keyof typeof AGENTS {
  const lowerMsg = message.toLowerCase();

  // Arabic text or complex analysis -> Claude
  if (/[\u0600-\u06FF]/.test(message) || lowerMsg.includes('حلل') || lowerMsg.includes('اكتب') || lowerMsg.includes('برمج')) {
    return 'claude';
  }

  // Math or data -> OpenAI
  if (/\d+[+\-*/=]/.test(message) || lowerMsg.includes('calculate') || lowerMsg.includes('احسب')) {
    return 'openai';
  }

  // Research or facts -> Google
  if (lowerMsg.includes('ابحث') || lowerMsg.includes('search') || lowerMsg.includes('معلومات عن')) {
    return 'google';
  }

  // Default to Claude for Arabic, OpenAI for English
  return /[\u0600-\u06FF]/.test(message) ? 'claude' : 'openai';
}

interface CloudflareEnv {
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  GOOGLE_GENERATIVE_AI_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

// Create model instances - NOW USES ENV VARIABLES (P0 FIX: No hardcoded keys)
function getModel(agentType: keyof typeof AGENTS, env: CloudflareEnv) {
  const ANTHROPIC_API_KEY = env?.ANTHROPIC_API_KEY;
  const OPENAI_API_KEY = env?.OPENAI_API_KEY;
  const GOOGLE_API_KEY = env?.GOOGLE_GENERATIVE_AI_API_KEY;

  switch (agentType) {
    case 'claude':
      if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');
      const anthropic = createAnthropic({ apiKey: ANTHROPIC_API_KEY });
      return anthropic(AGENTS.claude.model);
    case 'openai':
      if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');
      const openai = createOpenAI({ apiKey: OPENAI_API_KEY });
      return openai(AGENTS.openai.model);
    case 'google':
      if (!GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY not configured');
      const google = createGoogleGenerativeAI({ apiKey: GOOGLE_API_KEY });
      return google(AGENTS.google.model);
  }
}

// P0 FIX: Verify user authentication via Supabase
async function verifyAuth(request: Request, env: CloudflareEnv): Promise<{ user: any; error?: string }> {
  const SUPABASE_URL = env?.SUPABASE_URL || env?.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = env?.SUPABASE_ANON_KEY || env?.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { user: null, error: 'Supabase not configured' };
  }

  // Extract token from Authorization header or cookies
  const authHeader = request.headers.get('Authorization');
  const cookieHeader = request.headers.get('Cookie');

  let accessToken: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    accessToken = authHeader.substring(7);
  } else if (cookieHeader) {
    // Parse sb-access-token from cookies
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...val] = c.trim().split('=');
        return [key, val.join('=')];
      }),
    );
    accessToken = cookies['sb-access-token'] || cookies['sb-ocrtidqksqojdkinqcxk-auth-token'];

    // Try to parse JSON token if it's a Supabase auth token
    if (accessToken) {
      try {
        const parsed = JSON.parse(decodeURIComponent(accessToken));
        accessToken = parsed.access_token || accessToken;
      } catch {
        // Not JSON, use as-is
      }
    }
  }

  if (!accessToken) {
    return { user: null, error: 'No authentication token provided' };
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return { user: null, error: 'Invalid or expired token' };
    }

    return { user: data.user };
  } catch (err: any) {
    return { user: null, error: err.message || 'Auth verification failed' };
  }
}

interface AgentRequestBody {
  messages: Array<{ role: string; content: string }>;
  forceAgent?: string;
}

export async function action({ context, request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const env = (context.cloudflare?.env || {}) as CloudflareEnv;

  // P0 FIX: Verify authentication FIRST
  const { user, error: authError } = await verifyAuth(request, env);

  if (!user) {
    return json(
      {
        error: 'Unauthorized',
        message: authError || 'Authentication required to use AI agent',
        code: 'AUTH_REQUIRED',
      },
      { status: 401 },
    );
  }

  // Check if API keys are configured
  if (!env?.ANTHROPIC_API_KEY && !env?.OPENAI_API_KEY) {
    return json(
      {
        error: 'Service unavailable',
        message: 'AI service not configured',
        code: 'CONFIG_ERROR',
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as AgentRequestBody;
    const { messages, forceAgent } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'Messages required' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userMessage = typeof lastMessage.content === 'string' ? lastMessage.content : '';

    // Select agent (or use forced agent)
    const selectedAgent =
      forceAgent && AGENTS[forceAgent as keyof typeof AGENTS]
        ? (forceAgent as keyof typeof AGENTS)
        : selectAgent(userMessage);

    const agent = AGENTS[selectedAgent];
    const model = getModel(selectedAgent, env);

    const systemPrompt = `أنت ${agent.name} ${agent.emoji}، وكيل ذكاء اصطناعي متخصص.
أنت جزء من فريق متعدد الوكلاء يضم: كلود 🟣 (التحليل والكتابة)، جي بي تي 🟢 (الحسابات والإبداع)، جيميناي 🔵 (البحث والمعلومات).
أجب بشكل مختصر ومفيد. استخدم العربية إذا كان السؤال بالعربية.
في نهاية إجابتك، أضف سطر جديد ثم: "— ${agent.emoji} ${agent.name}"`;

    const result = await streamText({
      model,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
      maxTokens: 2048,
    });

    // Return streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send agent info first (includes user email for audit)
        const agentInfo = JSON.stringify({
          type: 'agent',
          agent: selectedAgent,
          name: agent.name,
          emoji: agent.emoji,
          user: user.email,
        });
        controller.enqueue(encoder.encode(`data: ${agentInfo}\n\n`));

        for await (const chunk of result.textStream) {
          const textData = JSON.stringify({ type: 'text', content: chunk });
          controller.enqueue(encoder.encode(`data: ${textData}\n\n`));
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Agent error:', error);
    return json({ error: error.message || 'Agent error' }, { status: 500 });
  }
}

// GET endpoint to list available agents (public - no auth required)
export async function loader() {
  return json({
    agents: Object.entries(AGENTS).map(([id, agent]) => ({
      id,
      name: agent.name,
      emoji: agent.emoji,
      specialty: agent.specialty,
    })),
  });
}






