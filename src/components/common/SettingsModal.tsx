import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { exportSanctuaryData, importSanctuaryData } from '../../services/storage';
import { LLMProviderType, AIProviderConfig } from '../../types';
import { PROVIDER_PRESETS, callUniversalLLM } from '../../services/llm';
import {
  X,
  Download,
  Upload,
  ShieldCheck,
  Cpu,
  Database,
  User,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Smartphone
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, settings, updateSettings, refreshData, showToast } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'ai' | 'general' | 'cloud'>('ai');

  // General state
  const [userName, setUserName] = useState(settings.userName);

  // Cloud Sync state
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');

  // AI & BYOK State
  const initialProvider: LLMProviderType = settings.aiConfig?.provider || 'openrouter';
  const [provider, setProvider] = useState<LLMProviderType>(initialProvider);
  const [apiKey, setApiKey] = useState(settings.aiConfig?.apiKey || settings.geminiApiKey || '');
  const [model, setModel] = useState(
    settings.aiConfig?.model || PROVIDER_PRESETS[initialProvider].defaultModel
  );
  const [baseUrl, setBaseUrl] = useState(
    settings.aiConfig?.baseUrl || PROVIDER_PRESETS[initialProvider].defaultBaseUrl
  );

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

  const currentPreset = PROVIDER_PRESETS[provider];

  const handleProviderChange = (newProvider: LLMProviderType) => {
    setProvider(newProvider);
    const preset = PROVIDER_PRESETS[newProvider];
    setModel(preset.defaultModel);
    setBaseUrl(preset.defaultBaseUrl);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API Key first' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const config: AIProviderConfig = {
        provider,
        apiKey: apiKey.trim(),
        model: model.trim(),
        baseUrl: baseUrl.trim() || undefined
      };

      const reply = await callUniversalLLM(config, [
        { role: 'system', content: 'You are a connection tester. Reply with "Connected" in 1 word.' },
        { role: 'user', content: 'Ping' }
      ]);

      if (reply) {
        setTestResult({
          success: true,
          message: `Connected successfully to ${currentPreset.name} (${model})!`
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

    const aiConfig: AIProviderConfig | undefined = apiKey.trim()
      ? {
          provider,
          apiKey: apiKey.trim(),
          model: model.trim() || currentPreset.defaultModel,
          baseUrl: baseUrl.trim() || undefined
        }
      : undefined;

    updateSettings({
      userName: userName.trim() || 'Aryamaan',
      supabaseUrl: supabaseUrl.trim() || undefined,
      supabaseAnonKey: supabaseAnonKey.trim() || undefined,
      aiConfig,
      geminiApiKey: provider === 'gemini' ? apiKey.trim() : settings.geminiApiKey
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
    <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
      <div className="modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Sanctuary Settings</h2>
          <button className="modal-close-btn" onClick={() => setIsSettingsOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Settings Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <Cpu size={15} />
            <span>AI Models & BYOK</span>
          </button>
          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <User size={15} />
            <span>Profile & Backup</span>
          </button>
          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'cloud' ? 'active' : ''}`}
            onClick={() => setActiveTab('cloud')}
          >
            <Database size={15} />
            <span>Cloud Sync</span>
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* TAB 1: AI MODELS & BYOK */}
          {activeTab === 'ai' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Bring Your Own Key (BYOK) for live empathetic reflections, Socratic inquiry, and thought parsing. Supports OpenRouter (200+ models), DeepSeek, Kimi, GLM, NVIDIA NIM, Gemini, Groq, OpenAI, and custom endpoints.
                </p>
              </div>

              {/* Provider Selector */}
              <div className="form-group">
                <label className="form-label">AI Provider</label>
                <select
                  className="form-input"
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value as LLMProviderType)}
                  style={{ cursor: 'pointer', background: 'var(--bg-subtle)' }}
                >
                  <option value="openrouter">OpenRouter (Recommended: 200+ Models in 1 key)</option>
                  <option value="deepseek">DeepSeek Official (deepseek-chat / deepseek-reasoner)</option>
                  <option value="moonshot">Moonshot AI / Kimi (moonshot-v1-auto)</option>
                  <option value="zhipu">Zhipu AI / GLM (glm-4-plus / glm-4-flash)</option>
                  <option value="nvidia">NVIDIA NIM (build.nvidia.com)</option>
                  <option value="gemini">Google Gemini (Gemini 1.5 / 2.0 Flash)</option>
                  <option value="groq">Groq (Ultra-Fast Llama 3.3)</option>
                  <option value="openai">OpenAI (GPT-4o / o1 / o3-mini)</option>
                  <option value="custom">Custom / Kilocode / Local Ollama</option>
                </select>
              </div>

              {/* API Key */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    API Key
                  </label>
                  <a
                    href={currentPreset.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
                  >
                    <span>Get Key</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
                <input
                  type="password"
                  className="form-input"
                  placeholder={currentPreset.placeholderKey}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestResult(null);
                  }}
                />
              </div>

              {/* Model ID & Suggestions */}
              <div className="form-group">
                <label className="form-label">Model ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={currentPreset.defaultModel}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={{ marginBottom: '0.4rem' }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {currentPreset.modelSuggestions.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`tag-filter-chip ${model === m ? 'active' : ''}`}
                      style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}
                      onClick={() => setModel(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Base URL (if custom or needed) */}
              {(provider === 'custom' || provider === 'openrouter' || provider === 'nvidia') && (
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">API Base URL</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={currentPreset.defaultBaseUrl}
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                  />
                </div>
              )}

              {/* Test Connection Button & Status */}
              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleTestConnection}
                  disabled={isTesting || !apiKey.trim()}
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                >
                  {isTesting ? 'Testing connection...' : 'Test Connection'}
                </button>

                {testResult && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      color: testResult.success ? '#2e7d32' : '#c62828'
                    }}
                  >
                    {testResult.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
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
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
