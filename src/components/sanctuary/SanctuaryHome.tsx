import React, { useState, useMemo } from 'react';
import './SanctuaryHome.css';
import { useData } from '../../context/DataContext';
import { Quote } from '../../types';
import {
  Sparkles,
  Wind,
  ArrowRight,
  Bookmark,
  Maximize2,
  RefreshCw,
  BookMarked,
  BookOpen,
  Feather,
  Quote as QuoteIcon,
  ChevronRight,
  Tag,
  Copy,
  Check
} from 'lucide-react';

const MOOD_CHECKIN_PILLS = [
  'Overwhelmed with decisions',
  'Anxious about the future',
  'Feeling scattered & unfocused',
  'Carrying heavy fatigue',
  'Quietly grateful & present',
  'Seeking clarity on a dilemma'
];

const DEFAULT_ANCHOR_QUOTE: Quote = {
  id: 'default_anchor',
  text: 'You have power over your mind — not outside events. Realize this, and you will find strength.',
  author: 'Marcus Aurelius',
  source: 'Meditations',
  tags: ['Stoicism', 'Clarity', 'Inner Strength'],
  isPinned: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const SanctuaryHome: React.FC = () => {
  const {
    quotes,
    diary,
    setActiveTab,
    setIsBreathModalOpen,
    sendCompanionMessage,
    setContemplatingQuote,
    togglePinQuote,
    showToast
  } = useData();

  const [feelingInput, setFeelingInput] = useState('');
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [anchorIndex, setAnchorIndex] = useState(0);

  // 1. DAILY ANCHOR QUOTE SELECTION
  const availableAnchors = useMemo(() => {
    const pinned = quotes.filter((q) => q.isPinned);
    if (pinned.length > 0) return pinned;
    if (quotes.length > 0) return quotes;
    return [DEFAULT_ANCHOR_QUOTE];
  }, [quotes]);

  const currentAnchor: Quote = availableAnchors[anchorIndex % availableAnchors.length] || DEFAULT_ANCHOR_QUOTE;

  const handleNextAnchor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorIndex((prev) => (prev + 1) % availableAnchors.length);
  };

  const handleCopyQuote = (e: React.MouseEvent, quote: Quote) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
    setCopiedQuoteId(quote.id);
    showToast('Quote copied to clipboard');
    setTimeout(() => setCopiedQuoteId(null), 2000);
  };

  // 2. MIND MIRROR SUBMISSION
  const handleReflectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feelingInput.trim()) return;
    const text = feelingInput.trim();
    setFeelingInput('');
    await sendCompanionMessage(text);
    setActiveTab('companion');
  };

  const handleChipClick = (chip: string) => {
    setFeelingInput(chip);
  };

  // 3. RECENT ITEMS PREVIEW
  const latestDiaryEntry = diary && diary.length > 0 ? diary[0] : null;
  const highlightQuote = useMemo(() => {
    const pool = quotes.filter((q) => q.id !== currentAnchor.id);
    return pool.length > 0 ? pool[0] : (quotes[0] || null);
  }, [quotes, currentAnchor.id]);

  return (
    <div className="sanctuary-home-view">
      {/* Ambient Glow Atmosphere */}
      <div className="sanctuary-ambient-glow" aria-hidden="true" />

      {/* Hero Greeting Banner */}
      <header className="sanctuary-hero-banner">
        <div className="sanctuary-hero-eyebrow">
          <Sparkles size={13} color="var(--accent-gold)" />
          <span>Sanctuary &middot; Aryamaan</span>
        </div>
        <h1 className="sanctuary-hero-title">Quiet your mind. Enter your sanctuary.</h1>
        <p className="sanctuary-hero-subtitle">
          A quiet harbor for unvarnished thoughts, grounded contemplation, and timeless perspectives.
        </p>
      </header>

      {/* SECTION 1: DAILY ANCHOR QUOTE HERO CARD */}
      <section className="sanctuary-daily-anchor-card">
        <div className="anchor-card-top-bar">
          <div className="anchor-badge-group">
            <span className="anchor-eyebrow-pill">
              <Sparkles size={12} className="anchor-gold-icon" />
              <span>Daily Anchor</span>
            </span>
            {currentAnchor.tags && currentAnchor.tags.length > 0 && (
              <span className="anchor-tag-label">
                #{currentAnchor.tags[0]}
              </span>
            )}
          </div>

          <div className="anchor-controls">
            {availableAnchors.length > 1 && (
              <button
                type="button"
                className="anchor-icon-btn"
                onClick={handleNextAnchor}
                title="Cycle to next anchor quote"
              >
                <RefreshCw size={13} />
                <span className="btn-label-desktop">Cycle</span>
              </button>
            )}

            <button
              type="button"
              className={`anchor-icon-btn ${currentAnchor.isPinned ? 'is-active-pinned' : ''}`}
              onClick={() => togglePinQuote(currentAnchor.id)}
              title={currentAnchor.isPinned ? 'Unpin from Anchor' : 'Pin as Daily Anchor'}
            >
              <Bookmark
                size={13}
                fill={currentAnchor.isPinned ? 'var(--accent-gold)' : 'none'}
              />
              <span className="btn-label-desktop">{currentAnchor.isPinned ? 'Anchored' : 'Pin'}</span>
            </button>

            <button
              type="button"
              className="anchor-icon-btn highlight-action"
              onClick={() => setContemplatingQuote(currentAnchor)}
              title="Open full-screen contemplation space"
            >
              <Maximize2 size={13} />
              <span>Contemplate</span>
            </button>
          </div>
        </div>

        <div className="anchor-quote-content" onClick={() => setContemplatingQuote(currentAnchor)}>
          <QuoteIcon className="anchor-watermark-icon" size={68} aria-hidden="true" />
          <blockquote className="anchor-quote-serif">
            "{currentAnchor.text}"
          </blockquote>
          <div className="anchor-author-line">
            <span className="anchor-author-name">— {currentAnchor.author || 'Internal Wisdom'}</span>
            {currentAnchor.source && (
              <span className="anchor-source-tag">({currentAnchor.source})</span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: MIND MIRROR & GROUNDING COMPANION CARD */}
      <section className="home-mind-mirror-block">
        <div className="mirror-header-row">
          <div className="section-label-group">
            <div className="mirror-icon-badge">
              <Feather size={15} color="var(--accent-gold)" />
            </div>
            <div>
              <h2 className="section-label-title">Mind Mirror & Grounding Companion</h2>
              <p className="section-label-subtitle">Speak freely without filter. Whatever is alive, heavy, or in flux.</p>
            </div>
          </div>

          <button
            type="button"
            className="breath-trigger-pill"
            onClick={() => setIsBreathModalOpen(true)}
            title="Take a 1-minute box breath"
          >
            <span className="breath-pulse-dot" />
            <Wind size={13} />
            <span>Slow Exhale (4-4-4-4)</span>
          </button>
        </div>

        <form onSubmit={handleReflectSubmit} className="mirror-input-form">
          <div className="mirror-textarea-wrapper">
            <textarea
              className="mirror-home-textarea"
              rows={4}
              placeholder="What is occupying your mind right now? Speak unfiltered..."
              value={feelingInput}
              onChange={(e) => setFeelingInput(e.target.value)}
              autoFocus
            />
            {feelingInput.trim().length > 0 && (
              <div className="mirror-char-hint">
                {feelingInput.trim().length} chars
              </div>
            )}
          </div>

          <div className="mirror-home-footer">
            <div className="mirror-pills-wrap">
              <span className="mirror-quick-label">Or ground into a state:</span>
              <div className="mirror-chips-list">
                {MOOD_CHECKIN_PILLS.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    className={`mood-prompt-chip ${feelingInput === pill ? 'is-selected' : ''}`}
                    onClick={() => handleChipClick(pill)}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary mirror-submit-btn"
              disabled={!feelingInput.trim()}
            >
              <span>Reflect & Ground</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 3: RECENT REFLECTIONS & VAULT WISDOM PREVIEW GRID */}
      <section className="sanctuary-preview-grid">
        {/* CARD A: RECENT NOTEBOOK JOURNAL ENTRY */}
        <div className="preview-card journal-preview-card">
          <div className="preview-card-header">
            <div className="preview-header-title-group">
              <BookMarked size={15} color="var(--accent-gold)" />
              <span className="preview-card-title">Recent Journal Page</span>
            </div>
            {latestDiaryEntry && (
              <span className="preview-date-badge">{latestDiaryEntry.date}</span>
            )}
          </div>

          <div className="preview-card-body">
            {latestDiaryEntry ? (
              <div className="preview-journal-content" onClick={() => setActiveTab('diary')}>
                {latestDiaryEntry.title && (
                  <h3 className="preview-journal-heading">{latestDiaryEntry.title}</h3>
                )}
                <p className="preview-journal-snippet">
                  {latestDiaryEntry.rawContent.slice(0, 190)}
                  {latestDiaryEntry.rawContent.length > 190 ? '...' : ''}
                </p>

                {latestDiaryEntry.refinedContent && (
                  <div className="preview-distilled-strip">
                    <span className="distilled-mini-badge">Essence</span>
                    <p className="distilled-mini-text">{latestDiaryEntry.refinedContent}</p>
                  </div>
                )}

                {latestDiaryEntry.tags && latestDiaryEntry.tags.length > 0 && (
                  <div className="preview-tags-row">
                    {latestDiaryEntry.tags.slice(0, 3).map((t) => (
                      <span key={t} className="quote-tag-pill">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="preview-empty-state" onClick={() => setActiveTab('diary')}>
                <BookMarked size={28} className="empty-state-icon" />
                <p className="empty-state-text">Your notebook is blank and awaiting today's reflections.</p>
                <span className="empty-state-cta">Write first page →</span>
              </div>
            )}
          </div>

          <div className="preview-card-footer">
            <button
              type="button"
              className="preview-footer-action"
              onClick={() => setActiveTab('diary')}
            >
              <span>Open Notebook Journal</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD B: WISDOM VAULT HIGHLIGHT */}
        <div className="preview-card wisdom-preview-card">
          <div className="preview-card-header">
            <div className="preview-header-title-group">
              <BookOpen size={15} color="var(--accent-gold)" />
              <span className="preview-card-title">Vault Wisdom Highlight</span>
            </div>
            {highlightQuote && highlightQuote.tags && highlightQuote.tags.length > 0 && (
              <span className="preview-tag-pill">
                <Tag size={10} />
                <span>{highlightQuote.tags[0]}</span>
              </span>
            )}
          </div>

          <div className="preview-card-body">
            {highlightQuote ? (
              <div className="preview-quote-content">
                <blockquote
                  className="preview-quote-text"
                  onClick={() => setContemplatingQuote(highlightQuote)}
                >
                  "{highlightQuote.text}"
                </blockquote>
                <div className="preview-author-row">
                  <span className="preview-author-name">— {highlightQuote.author || 'Internal Wisdom'}</span>
                  {highlightQuote.source && (
                    <span className="preview-source-sub">({highlightQuote.source})</span>
                  )}
                </div>

                <div className="preview-quick-actions-bar">
                  <button
                    type="button"
                    className="card-action-btn"
                    onClick={(e) => handleCopyQuote(e, highlightQuote)}
                    title="Copy quote"
                  >
                    {copiedQuoteId === highlightQuote.id ? <Check size={12} color="var(--accent-gold)" /> : <Copy size={12} />}
                    <span>{copiedQuoteId === highlightQuote.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    className="card-action-btn"
                    onClick={() => setContemplatingQuote(highlightQuote)}
                    title="Contemplate quote"
                  >
                    <Maximize2 size={12} />
                    <span>Contemplate</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="preview-empty-state" onClick={() => setActiveTab('quotes')}>
                <BookOpen size={28} className="empty-state-icon" />
                <p className="empty-state-text">Your wisdom vault is ready to store timeless quotes.</p>
                <span className="empty-state-cta">Add a quote →</span>
              </div>
            )}
          </div>

          <div className="preview-card-footer">
            <button
              type="button"
              className="preview-footer-action"
              onClick={() => setActiveTab('quotes')}
            >
              <span>Explore Vault ({quotes.length})</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
