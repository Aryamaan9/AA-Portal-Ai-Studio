import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { exportSanctuaryData, importSanctuaryData } from '../../services/storage';
import { LLMProviderType, AIProviderConfig } from '../../types';
import { PROVIDER_PRESETS, callUniversalLLM } from '../../services/llm';
import {
  Download,
  Upload,
  ShieldCheck,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import {
  SegmentedControl,
  TextInput,
  PasswordInput,
  Button,
  Badge,
  Card,
  Group,
  Text,
  Anchor
} from '@mantine/core';
import { ResponsiveModal } from './ResponsiveModal';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, settings, updateSettings, refreshData, showToast } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'ai' | 'general' | 'cloud'>('ai');

  // General state
  const [userName, setUserName] = useState(settings.userName);

  // Cloud Sync state
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');

  // AI & BYOK State - Multi-Key & Provider Configuration
  const allProviders: LLMProviderType[] = [
    'openrouter',
    'kilo',
    'gemini',
    'deepseek',
    'groq',
    'openai',
    'moonshot',
    'zhipu',
    'nvidia',
    'custom'
  ];

  const initialProvider: LLMProviderType = settings.aiConfig?.provider || 'openrouter';
  const [activeProvider, setActiveProvider] = useState<LLMProviderType>(initialProvider);

  const [providerConfigs, setProviderConfigs] = useState<
    Record<LLMProviderType, { apiKey: string; model: string; baseUrl: string }>
  >(() => {
    const initial: Record<LLMProviderType, { apiKey: string; model: string; baseUrl: string }> = {} as any;
    allProviders.forEach((p) => {
      const preset = PROVIDER_PRESETS[p];
      const savedConfig = settings.providerConfigs?.[p];
      const savedKey =
        savedConfig?.apiKey ||
        settings.providerKeys?.[p] ||
        (settings.aiConfig?.provider === p ? settings.aiConfig.apiKey : '') ||
        (p === 'gemini' ? (settings.geminiApiKey || '') : '');
      let savedModel =
        savedConfig?.model ||
        (settings.aiConfig?.provider === p ? settings.aiConfig.model : '') ||
        preset.defaultModel;

      // Automatically migrate any obsolete or incompatible gemini-2.5 model strings to gemini-2.0-flash
      if (p === 'gemini' && (savedModel.startsWith('gemini-2.5') || !savedModel)) {
        savedModel = 'gemini-2.0-flash';
      }
      if (p === 'openrouter' && savedModel === 'google/gemini-2.5-flash') {
        savedModel = 'google/gemini-2.0-flash-001';
      }
      if (p === 'kilo' && savedModel === 'google/gemini-2.5-flash') {
        savedModel = 'google/gemini-2.0-flash';
      }

      const savedBaseUrl =
        savedConfig?.baseUrl ||
        (settings.aiConfig?.provider === p ? settings.aiConfig.baseUrl : '') ||
        preset.defaultBaseUrl;

      initial[p] = {
        apiKey: savedKey,
        model: savedModel,
        baseUrl: savedBaseUrl
      };
    });
    return initial;
  });

  // Test Connection status
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Android WebAPK / PWA state
  const [deferredPrompt, setDeferredPrompt] = useState<any>((window as any).__sanctuaryDeferredPrompt || null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).__sanctuaryDeferredPrompt = e;
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const currentPreset = PROVIDER_PRESETS[activeProvider] || PROVIDER_PRESETS.openrouter;
  const currentConfig = providerConfigs[activeProvider] || {
    apiKey: '',
    model: currentPreset.defaultModel,
    baseUrl: currentPreset.defaultBaseUrl
  };

  const handleProviderSelect = (newProvider: LLMProviderType) => {
    setActiveProvider(newProvider);
    setTestResult(null);
  };

  const updateActiveField = (field: 'apiKey' | 'model' | 'baseUrl', value: string) => {
    setProviderConfigs((prev) => ({
      ...prev,
      [activeProvider]: {
        ...prev[activeProvider],
        [field]: value
      }
    }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!currentConfig.apiKey.trim()) {
      setTestResult({ success: false, message: `Please enter an API Key for ${currentPreset.name} first.` });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const rawModel = currentConfig.model.trim() || currentPreset.defaultModel;
    let effectiveModel = rawModel;
    if (activeProvider === 'gemini' && (effectiveModel.startsWith('gemini-2.5') || !effectiveModel)) {
      effectiveModel = 'gemini-2.0-flash';
      updateActiveField('model', effectiveModel);
    }

    try {
      const config: AIProviderConfig = {
        provider: activeProvider,
        apiKey: currentConfig.apiKey.trim(),
        model: effectiveModel,
        baseUrl: currentConfig.baseUrl.trim() || undefined
      };

      const reply = await callUniversalLLM(config, [
        { role: 'system', content: 'You are a connection tester. Reply with "Connected" in 1 word.' },
        { role: 'user', content: 'Ping' }
      ]);

      if (reply) {
        setTestResult({
          success: true,
          message: `Connected successfully to ${currentPreset.name} (${config.model})!`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const savedConfigs: Partial<Record<LLMProviderType, { apiKey: string; model: string; baseUrl: string }>> = {};
    const savedKeys: Partial<Record<LLMProviderType, string>> = {};

    allProviders.forEach((p) => {
      const item = providerConfigs[p];
      if (item && item.apiKey.trim()) {
        let model = item.model.trim() || PROVIDER_PRESETS[p].defaultModel;
        if (p === 'gemini' && (model.startsWith('gemini-2.5') || !model)) {
          model = 'gemini-2.0-flash';
        }
        savedKeys[p] = item.apiKey.trim();
        savedConfigs[p] = {
          apiKey: item.apiKey.trim(),
          model,
          baseUrl: item.baseUrl.trim() || PROVIDER_PRESETS[p].defaultBaseUrl
        };
      }
    });

    const activeItem = providerConfigs[activeProvider];
    let effectiveActiveModel = activeItem?.model?.trim() || currentPreset.defaultModel;
    if (activeProvider === 'gemini' && (effectiveActiveModel.startsWith('gemini-2.5') || !effectiveActiveModel)) {
      effectiveActiveModel = 'gemini-2.0-flash';
    }

    const aiConfig: AIProviderConfig | undefined =
      activeItem && activeItem.apiKey.trim()
        ? {
            provider: activeProvider,
            apiKey: activeItem.apiKey.trim(),
            model: effectiveActiveModel,
            baseUrl: activeItem.baseUrl.trim() || undefined
          }
        : undefined;

    updateSettings({
      userName: userName.trim() || 'Aryamaan',
      supabaseUrl: supabaseUrl.trim() || undefined,
      supabaseAnonKey: supabaseAnonKey.trim() || undefined,
      aiConfig,
      providerConfigs: savedConfigs,
      providerKeys: savedKeys,
      geminiApiKey: providerConfigs.gemini?.apiKey.trim() || settings.geminiApiKey
    });
    setIsSettingsOpen(false);
  };

  const handleExport = () => {
    const dataStr = exportSanctuaryData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aryamaan-sanctuary-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Sanctuary data exported');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importSanctuaryData(content);
        if (result.success) {
          refreshData();
          showToast(`Imported ${result.quotesCount} quotes successfully`);
          setIsSettingsOpen(false);
        } else {
          showToast(`Import failed: ${result.error}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleInstallApp = async () => {
    const promptEvent = deferredPrompt || (window as any).__sanctuaryDeferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setIsStandalone(true);
        showToast('Aryamaan Sanctuary installed successfully!');
      }
      setDeferredPrompt(null);
    } else {
      showToast('To install: open browser menu (⋮) and tap "Add to Home screen" / "Install App".');
    }
  };

  if (!isSettingsOpen) return null;

  return (
    <ResponsiveModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Sanctuary Settings">
        <SegmentedControl
          value={activeTab}
          onChange={(val) => setActiveTab(val as any)}
          fullWidth
          size="sm"
          radius="md"
          color="teal"
          mb="lg"
          data={[
            { label: 'AI Models & BYOK', value: 'ai' },
            { label: 'Profile & Backup', value: 'general' },
            { label: 'Cloud Sync', value: 'cloud' }
          ]}
        />

        <form onSubmit={handleSave}>
          {/* TAB 1: AI MODELS & BYOK */}
          {activeTab === 'ai' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <Text size="sm" c="dimmed" lh={1.5}>
                  Bring Your Own Key (BYOK) for live reflections, vision parsing, and screenshot extraction.
                  Keys are preserved securely in your local browser.
                </Text>
              </div>

              {/* Provider Selection */}
              <div style={{ marginBottom: '1.25rem' }}>
                <Text size="xs" fw={600} mb={6} c="var(--text-primary)">
                  Select Active AI Provider
                </Text>
                <SegmentedControl
                  value={['gemini', 'openrouter', 'kilo'].includes(activeProvider) ? activeProvider : 'more'}
                  onChange={(val) => {
                    if (val !== 'more') {
                      handleProviderSelect(val as LLMProviderType);
                    }
                  }}
                  fullWidth
                  size="xs"
                  radius="md"
                  color="teal"
                  data={[
                    { label: 'Google Gemini', value: 'gemini' },
                    { label: 'OpenRouter', value: 'openrouter' },
                    { label: 'Kilo Gateway', value: 'kilo' },
                    { label: 'Other...', value: 'more' }
                  ]}
                />
              </div>

              {/* More Providers Dropdown (Only shown if 'more' or custom active) */}
              {(!['gemini', 'openrouter', 'kilo'].includes(activeProvider) || activeProvider === 'custom') && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">All Available Providers</label>
                  <select
                    className="form-input"
                    value={activeProvider}
                    onChange={(e) => handleProviderSelect(e.target.value as LLMProviderType)}
                    style={{ cursor: 'pointer', background: 'var(--bg-subtle)' }}
                  >
                    <option value="gemini">Google Gemini (Gemini 2.0 / 1.5 Flash)</option>
                    <option value="openrouter">OpenRouter (200+ Models)</option>
                    <option value="kilo">Kilo Gateway (500+ Models)</option>
                    <option value="deepseek">DeepSeek Official</option>
                    <option value="groq">Groq (Ultra-Fast Llama 3.3)</option>
                    <option value="openai">OpenAI (GPT-4o / o1 / o3-mini)</option>
                    <option value="moonshot">Moonshot AI / Kimi</option>
                    <option value="zhipu">Zhipu AI / GLM</option>
                    <option value="nvidia">NVIDIA NIM</option>
                    <option value="custom">Custom / Local Ollama</option>
                  </select>
                </div>
              )}
              {/* Active Provider Configuration Card */}
              <Card withBorder radius="md" p="md" mb="md" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-light)' }}>
                <Group justify="space-between" align="center" mb="xs">
                  <Group gap="xs">
                    <Text fw={600} size="sm" c="var(--text-primary)">
                      {currentPreset.name}
                    </Text>
                    <Badge color="teal" variant="light" size="sm">
                      Active Model
                    </Badge>
                  </Group>
                  <Anchor
                    href={currentPreset.docsUrl}
                    target="_blank"
                    size="xs"
                    c="teal"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <span>Get Key</span>
                    <ExternalLink size={11} />
                  </Anchor>
                </Group>

                {/* API Key */}
                <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                  <PasswordInput
                    label="API Key"
                    description={
                      activeProvider === 'gemini'
                        ? 'Paste your free Google AI Studio key (starts with AIzaSy...). Preserved privately in your browser.'
                        : 'Private in your browser. Switching providers will not erase this key.'
                    }
                    placeholder={currentPreset.placeholderKey}
                    value={currentConfig.apiKey}
                    onChange={(e) => updateActiveField('apiKey', e.target.value)}
                    size="sm"
                    radius="md"
                    styles={{
                      input: {
                        borderColor: currentConfig.apiKey.trim() ? 'var(--accent-gold)' : undefined,
                      }
                    }}
                  />
                  {currentConfig.apiKey.trim() && (
                    <Text size="xs" c="teal" fw={600} mt={4}>
                      ✓ Key Saved for {currentPreset.id}
                    </Text>
                  )}
                </div>

                {/* Model ID & Suggestions */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <TextInput
                    label="Model ID"
                    placeholder={currentPreset.defaultModel}
                    value={currentConfig.model}
                    onChange={(e) => updateActiveField('model', e.target.value)}
                    size="sm"
                    radius="md"
                    mb={6}
                  />
                  <Group gap={6}>
                    {currentPreset.modelSuggestions.map((m) => (
                      <Badge
                        key={m}
                        variant={currentConfig.model === m ? 'filled' : 'outline'}
                        color="teal"
                        size="xs"
                        style={{ cursor: 'pointer' }}
                        onClick={() => updateActiveField('model', m)}
                      >
                        {m}
                      </Badge>
                    ))}
                  </Group>
                </div>

                {/* Custom Base URL (if custom, openrouter, kilo, or nvidia) */}
                {(activeProvider === 'custom' ||
                  activeProvider === 'openrouter' ||
                  activeProvider === 'kilo' ||
                  activeProvider === 'nvidia') && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <TextInput
                      label="API Base URL"
                      placeholder={currentPreset.defaultBaseUrl}
                      value={currentConfig.baseUrl}
                      onChange={(e) => updateActiveField('baseUrl', e.target.value)}
                      size="sm"
                      radius="md"
                    />
                  </div>
                )}

                {/* Test Connection Button & Status */}
                <Group mt="md" align="center" gap="sm">
                  <Button
                    variant="light"
                    color="teal"
                    size="xs"
                    onClick={handleTestConnection}
                    loading={isTesting}
                    disabled={!currentConfig.apiKey.trim()}
                  >
                    {isTesting ? 'Testing connection...' : `Test ${currentPreset.name}`}
                  </Button>

                  {testResult && (
                    <Group gap={4}>
                      {testResult.success ? (
                        <CheckCircle size={15} color="#2e7d32" />
                      ) : (
                        <AlertCircle size={15} color="#c62828" />
                      )}
                      <Text size="xs" c={testResult.success ? 'teal' : 'red'}>
                        {testResult.message}
                      </Text>
                    </Group>
                  )}
                </Group>
              </Card>
            </div>
          )}

          {/* TAB 2: GENERAL PROFILE & BACKUP */}
          {activeTab === 'general' && (
            <div>
              {/* User Name */}
              <div className="form-group">
                <label className="form-label">Name / Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Aryamaan"
                />
              </div>

              {/* Data Portability (Export / Import) */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                <div className="form-label" style={{ marginBottom: '0.75rem' }}>
                  Data Ownership & Backup
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="button" className="btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Download size={14} />
                    <span>Export JSON</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Upload size={14} />
                    <span>Import JSON</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleImportFile}
                  />
                </div>
              </div>

              {/* Privacy Note */}
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}
              >
                <ShieldCheck size={18} color="var(--accent-gold)" />
                <span>Local-first architecture. Your keys, quotes, and reflections remain 100% private on your device.</span>
              </div>

              {/* Android Mobile App / PWA */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                <div className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Smartphone size={15} color="var(--accent-gold)" />
                  <span>Android & Mobile App</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                  {isStandalone
                    ? 'Aryamaan Sanctuary is currently running as an installed native app.'
                    : 'Install directly on your Android phone for full-screen view, custom app icon, and fast offline access.'}
                </p>
                {!isStandalone && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleInstallApp}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                    >
                      <Download size={14} />
                      <span>Install Android App</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CLOUD SYNC */}
          {activeTab === 'cloud' && (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Connect your Supabase database to sync in real-time across your phone, laptop, WhatsApp, and ChatGPT.
              </p>

              <div className="form-group">
                <label className="form-label">Supabase URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  style={{ marginBottom: '0.75rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supabase Anon Key</label>
                <input
                  type="password"
                  className="form-input"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="Supabase Anon / Public Key"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              background: 'var(--bg-card)',
              padding: '1rem 0',
              marginTop: '1.5rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              zIndex: 10
            }}
          >
            <Button variant="default" size="sm" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" color="teal" size="sm">
              Save Settings
            </Button>
          </div>
        </form>
    </ResponsiveModal>
  );
};
