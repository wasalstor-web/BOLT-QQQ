import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class OpenAIProvider extends BaseProvider {
  name = 'OpenAI';
  getApiKeyLink = 'https://platform.openai.com/api-keys';

  config = {
    apiTokenKey: 'OPENAI_API_KEY',
  };

  staticModels: ModelInfo[] = [
    // GPT-5.2 Series (Latest)
    { name: 'gpt-5.2-pro', label: 'GPT-5.2 Pro', provider: 'OpenAI', maxTokenAllowed: 256000, maxCompletionTokens: 32000 },
    { name: 'gpt-5.2', label: 'GPT-5.2', provider: 'OpenAI', maxTokenAllowed: 256000, maxCompletionTokens: 16000 },
    { name: 'gpt-5.2-codex', label: 'GPT-5.2 Codex', provider: 'OpenAI', maxTokenAllowed: 256000, maxCompletionTokens: 32000 },
    // GPT-5.1 Series
    { name: 'gpt-5.1', label: 'GPT-5.1', provider: 'OpenAI', maxTokenAllowed: 200000, maxCompletionTokens: 16000 },
    { name: 'gpt-5.1-codex', label: 'GPT-5.1 Codex', provider: 'OpenAI', maxTokenAllowed: 200000, maxCompletionTokens: 32000 },
    // GPT-5 Series
    { name: 'gpt-5-pro', label: 'GPT-5 Pro', provider: 'OpenAI', maxTokenAllowed: 200000, maxCompletionTokens: 32000 },
    { name: 'gpt-5', label: 'GPT-5', provider: 'OpenAI', maxTokenAllowed: 200000, maxCompletionTokens: 16000 },
    { name: 'gpt-5-codex', label: 'GPT-5 Codex', provider: 'OpenAI', maxTokenAllowed: 200000, maxCompletionTokens: 32000 },
    { name: 'gpt-5-mini', label: 'GPT-5 Mini', provider: 'OpenAI', maxTokenAllowed: 128000, maxCompletionTokens: 8000 },
    { name: 'gpt-5-nano', label: 'GPT-5 Nano', provider: 'OpenAI', maxTokenAllowed: 128000, maxCompletionTokens: 4000 },
    // GPT-4.1 Series
    { name: 'gpt-4.1', label: 'GPT-4.1', provider: 'OpenAI', maxTokenAllowed: 128000, maxCompletionTokens: 16000 },
    { name: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', provider: 'OpenAI', maxTokenAllowed: 128000, maxCompletionTokens: 8000 },
    { name: 'gpt-4.1-nano', label: 'GPT-4.1 Nano', provider: 'OpenAI', maxTokenAllowed: 128000, maxCompletionTokens: 4000 },
    // GPT-4o Series
    { name: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI', maxTokenAllowed: 128000, maxCompletionTokens: 16000 },
    { name: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI', maxTokenAllowed: 128000, maxCompletionTokens: 16000 },
    // o1 Series (Reasoning)
    { name: 'o1', label: 'o1 (Reasoning)', provider: 'OpenAI', maxTokenAllowed: 200000, maxCompletionTokens: 100000 },
    { name: 'o1-pro', label: 'o1 Pro (Reasoning)', provider: 'OpenAI', maxTokenAllowed: 200000, maxCompletionTokens: 100000 },
  ];

  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;

    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: '',
      defaultApiTokenKey: 'OPENAI_API_KEY',
    });

    if (!apiKey) {
      throw new Error('Missing API key for ' + this.name + ' provider');
    }

    const openai = createOpenAI({
      apiKey,
    });

    return openai(model);
  }
}
