import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { useRequireAuth } from '~/lib/auth/useAuth';
import {
  Bot,
  Send,
  ArrowLeft,
  Loader2,
  Sparkles,
  Brain,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  MessageSquare,
  Zap,
  Code,
  Search,
  Calculator,
  PenTool,
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Mbasit Agent - مبسط إديتر' }, { name: 'description', content: 'وكيل ذكي متعدد النماذج' }];
};

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent?: { name: string; emoji: string; id: string };
  isTyping?: boolean;
}

interface Agent {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

const AGENTS: Agent[] = [
  { id: 'claude', name: 'Claude', emoji: '🟣', color: 'purple', description: 'التحليل والكتابة والبرمجة' },
  { id: 'openai', name: 'GPT', emoji: '🟢', color: 'green', description: 'الحسابات والإبداع' },
  { id: 'google', name: 'Gemini', emoji: '🔵', color: 'blue', description: 'البحث والمعلومات' },
];

const QUICK_PROMPTS = [
  { icon: Code, label: 'اكتب كود', prompt: 'اكتب لي كود', color: 'text-purple-400' },
  { icon: PenTool, label: 'اكتب نص', prompt: 'اكتب لي نص عن', color: 'text-blue-400' },
  { icon: Calculator, label: 'احسب', prompt: 'احسب لي', color: 'text-green-400' },
  { icon: Search, label: 'ابحث', prompt: 'ابحث عن معلومات حول', color: 'text-orange-400' },
];

export default function MbasitAgent() {
  const { isAdmin, loading: authLoading } = useRequireAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          forceAgent: selectedAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let agentInfo: any = null;

      while (reader) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace('data: ', ''));

            if (data.type === 'agent') {
              agentInfo = { name: data.name, emoji: data.emoji, id: data.agent };
            } else if (data.type === 'text') {
              fullContent += data.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id ? { ...m, content: fullContent, agent: agentInfo, isTyping: true } : m,
                ),
              );
            } else if (data.type === 'done') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id ? { ...m, content: fullContent, agent: agentInfo, isTyping: false } : m,
                ),
              );
            }
          } catch {}
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id ? { ...m, content: 'عذراً، حدث خطأ. حاول مرة أخرى.', isTyping: false } : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedAgent(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0f1a] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-blue-500 to-green-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">Mbasit Agent</h1>
                <p className="text-xs text-gray-500">Multi-AI Assistant</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Agent Selector */}
      <div className="max-w-5xl mx-auto w-full px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedAgent(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              !selectedAgent
                ? 'bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20 text-white border border-white/20'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-1" />
            تلقائي
          </button>
          {AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedAgent === agent.id
                  ? `bg-${agent.color}-500/20 text-white border border-${agent.color}-500/50`
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span>{agent.emoji}</span>
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-green-500/20 flex items-center justify-center">
                <Bot className="w-10 h-10 text-white/60" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">مرحباً! أنا Mbasit Agent</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                وكيل ذكي يجمع بين Claude و GPT و Gemini لمساعدتك في أي مهمة
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt.prompt + ' ')}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center gap-2"
                  >
                    <prompt.icon className={`w-4 h-4 ${prompt.color}`} />
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {message.role === 'assistant' && message.agent && (
                      <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                        <span>{message.agent.emoji}</span>
                        <span>{message.agent.name}</span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                        {message.isTyping && <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />}
                      </div>
                    </div>
                    {message.role === 'assistant' && !message.isTyping && message.content && (
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/5 bg-black/20 backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 bg-white/5 rounded-2xl border border-white/10 p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا..."
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none px-3 py-2 max-h-32 text-sm"
              style={{ minHeight: '40px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-all"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">Mbasit Agent • Claude + GPT + Gemini</p>
        </div>
      </div>
    </div>
  );
}
