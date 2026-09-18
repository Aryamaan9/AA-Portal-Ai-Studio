import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useData } from '../../context/DataContext';
import { ResponsiveModal } from '../common/ResponsiveModal';
import { extractQuoteFromImage, ExtractedQuoteData } from '../../services/llm';
import {
  Image as ImageIcon,
  Camera as CameraIcon,
  Clipboard,
  Sparkles,
  Check,
  RotateCcw,
  BookOpen,
  AlertCircle,
  Key,
  Tag,
  User,
  Quote as QuoteIcon
} from 'lucide-react';

interface ScreenshotIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageBase64?: string | null;
}

export const ScreenshotIngestModal: React.FC<ScreenshotIngestModalProps> = ({
  isOpen,
  onClose,
  initialImageBase64
}) => {
  const { settings, addQuote, setIsSettingsOpen, showToast } = useData();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<ExtractedQuoteData | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [editedAuthor, setEditedAuthor] = useState<string>('');
  const [editedTags, setEditedTags] = useState<string>('');
  const [editedNotes, setEditedNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core Vision AI extraction
  const processImage = useCallback(
    async (base64Str: string, type: string) => {
      setImagePreview(base64Str);
      setErrorMessage(null);
      setExtractedData(null);

      const aiConfig = settings.aiConfig || (settings.geminiApiKey ? {
        provider: 'gemini' as const,
        apiKey: settings.geminiApiKey,
        model: 'gemini-1.5-flash'
      } : null);

      if (!aiConfig || !aiConfig.apiKey.trim()) {
        setErrorMessage(
          'Please set your AI API key in Settings (e.g. Free Google Gemini or OpenRouter) to enable automatic screenshot extraction.'
        );
        return;
      }

      setIsProcessing(true);
      try {
        const result = await extractQuoteFromImage(aiConfig, base64Str, type);
        setExtractedData(result);
        setEditedText(result.text);
        setEditedAuthor(result.author);
        setEditedTags(result.tags.join(', '));
        setEditedNotes(result.notes || '');
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to extract quote from screenshot.');
      } finally {
        setIsProcessing(false);
      }
    },
    [settings]
  );

  // 1. Mobile Native Gallery Picker via @capacitor/camera
  const handlePickFromGallery = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });

      if (photo.base64String) {
        const format = photo.format || 'jpeg';
        const fullBase64 = `data:image/${format};base64,${photo.base64String}`;
        processImage(fullBase64, `image/${format}`);
      }
    } catch (e: any) {
      // If user cancelled, do nothing. If not available, fallback to file input.
      if (e?.message !== 'User cancelled photos app') {
        fileInputRef.current?.click();
      }
    }
  };

  // 2. Mobile Native Camera Capture via @capacitor/camera
  const handleTakePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      if (photo.base64String) {
        const format = photo.format || 'jpeg';
        const fullBase64 = `data:image/${format};base64,${photo.base64String}`;
        processImage(fullBase64, `image/${format}`);
      }
    } catch (e: any) {
      if (e?.message !== 'User cancelled photos app') {
        fileInputRef.current?.click();
      }
    }
  };

  // 3. Fallback standard HTML file input (works on all mobile & desktop browsers)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = file.type || 'image/jpeg';
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      processImage(base64, type);
    };
    reader.readAsDataURL(file);
  };

  // 4. Mobile Clipboard Paste
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              processImage(base64, imageType);
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      showToast('No screenshot found in clipboard. Please copy an image first.');
    } catch (e) {
      showToast('Clipboard access restricted. Try choosing from gallery.');
    }
  };

  // Auto-process initial image if passed
  useEffect(() => {
    if (initialImageBase64 && isOpen) {
      processImage(initialImageBase64, 'image/png');
    }
  }, [initialImageBase64, isOpen, processImage]);

  const handleClose = () => {
    setImagePreview(null);
    setExtractedData(null);
    setErrorMessage(null);
    setIsProcessing(false);
    onClose();
  };

  const handleSave = () => {
    if (!editedText.trim()) return;

    const tagsArray = editedTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addQuote({
      text: editedText.trim(),
      author: editedAuthor.trim() || 'Unknown',
      source: 'Screenshot Ingestion',
      tags: tagsArray.length > 0 ? tagsArray : ['Wisdom'],
      notes: editedNotes.trim(),
      isPinned: false
    });

    showToast('Quote saved from screenshot!');
    handleClose();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Capture from Screenshot"
      maxWidth="560px"
    >
      {/* Hidden file input for web fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* STEP 1: MOBILE SELECTION ACTIONS */}
        {!imagePreview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.5rem 0' }}>
              Select a screenshot from Instagram, Twitter, or books. AI will isolate the quote and eliminate social media clutter.
            </p>

            {/* Primary Action 1: Gallery / Screenshots */}
            <button
              type="button"
              onClick={handlePickFromGallery}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1.5px solid var(--accent-gold)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ImageIcon size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                  Choose from Gallery / Screenshots
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Opens your phone photo album or screenshots
                </div>
              </div>
            </button>

            {/* Primary Action 2: Camera Photo */}
            <button
              type="button"
              onClick={handleTakePhoto}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.9rem 1.25rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CameraIcon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                  Take Photo with Camera
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Capture a quote directly from a physical book
                </div>
              </div>
            </button>

            {/* Primary Action 3: Paste from Clipboard */}
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.9rem 1.25rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Clipboard size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                  Paste from Clipboard
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  If you copied a screenshot or image
                </div>
              </div>
            </button>
          </div>
        )}

        {/* STEP 2: PROCESSING STATE */}
        {isProcessing && (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Screenshot preview"
                style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: 'var(--radius-md)', objectFit: 'contain', border: '1px solid var(--border-light)' }}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.95rem' }}>
              <Sparkles size={18} className="animate-spin" />
              <span>Sanctuary Vision AI is analyzing screenshot...</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Auto-detecting quote text, author, and filtering out Instagram buttons
            </p>
          </div>
        )}

        {/* STEP 3: ERROR STATE */}
        {errorMessage && !isProcessing && (
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.35rem' }}>
                  Extraction Paused
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {errorMessage}
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => {
                    handleClose();
                    setIsSettingsOpen(true);
                  }}
                >
                  <Key size={14} />
                  <span>Configure Free AI Key</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & SAVE EXTRACTED WISDOM */}
        {extractedData && !isProcessing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} color="var(--accent-gold)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Wisdom Cleanly Isolated
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setExtractedData(null);
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <RotateCcw size={12} />
                <span>Choose another</span>
              </button>
            </div>

            {/* Editable Quote */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <QuoteIcon size={12} /> Quote Text
              </label>
              <textarea
                rows={4}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="mirror-home-textarea"
                style={{ fontSize: '0.98rem', lineHeight: 1.55, fontFamily: 'var(--font-serif)', padding: '0.75rem' }}
              />
            </div>

            {/* Author & Tags */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <User size={12} /> Author
                </label>
                <input
                  type="text"
                  value={editedAuthor}
                  onChange={(e) => setEditedAuthor(e.target.value)}
                  className="sidebar-search-field"
                  style={{ padding: '0.65rem 0.75rem', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Tag size={12} /> Tags
                </label>
                <input
                  type="text"
                  value={editedTags}
                  onChange={(e) => setEditedTags(e.target.value)}
                  className="sidebar-search-field"
                  style={{ padding: '0.65rem 0.75rem', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'block' }}>
                Context / Reflection (Optional)
              </label>
              <input
                type="text"
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Why did this resonate?"
                className="sidebar-search-field"
                style={{ padding: '0.65rem 0.75rem', fontSize: '0.9rem' }}
              />
            </div>

            {/* Save Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', minHeight: '48px', fontSize: '0.95rem', fontWeight: 600 }}
                onClick={handleSave}
              >
                <BookOpen size={17} />
                <span>Save to Wisdom Vault</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1, minHeight: '48px', fontSize: '0.9rem' }}
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
};
