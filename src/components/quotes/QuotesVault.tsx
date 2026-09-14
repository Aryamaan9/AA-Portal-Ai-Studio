import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { FastQuoteCapture } from './FastQuoteCapture';
import { Quote } from '../../types';
import {
  Search,
  BookOpen,
  Sparkles,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Trash2,
  Tag,
  Maximize2,
  Layers,
  Grid,
  Shield,
  Wind,
  Compass,
  Feather,
  Quote as QuoteIcon,
  Shuffle
} from 'lucide-react';

export type QuoteViewOption = 'zen' | 'manuscript' | 'shelves' | 'grid' | 'stream';

// ==========================================================================
// OPTION 1: ZEN READER DECK COMPONENT
// ==========================================================================
const ZenReaderDeck: React.FC<{ quotes: Quote[] }> = ({ quotes }) => {
  const { togglePinQuote, setContemplatingQuote, showToast } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const total = quotes.length;
  const safeIndex = total > 0 ? Math.min(currentIndex, total - 1) : 0;
  const currentQuote = quotes[safeIndex];

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setDirection('left');
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setDirection('right');
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  const handleRandom = useCallback(() => {
    if (total <= 1) return;
    let nextIdx = Math.floor(Math.random() * total);
    if (nextIdx === safeIndex) nextIdx = (safeIndex + 1) % total;
    setDirection('right');
    setCurrentIndex(nextIdx);
  }, [total, safeIndex]);

  const handleCopy = useCallback(() => {
    if (!currentQuote) return;
    const textToCopy = `"${currentQuote.text}" — ${currentQuote.author}${
      currentQuote.source ? ` (${currentQuote.source})` : ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Quote copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }, [currentQuote, showToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleCopy();
      } else if (e.key === 'p' || e.key === 'P') {
        if (currentQuote) {
          e.preventDefault();
          togglePinQuote(currentQuote.id);
        }
      } else if (e.key === 'm' || e.key === 'M' || e.key === 'Enter') {
        if (currentQuote) {
          e.preventDefault();
          setContemplatingQuote(currentQuote);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, handleCopy, currentQuote, togglePinQuote, setContemplatingQuote]);

  if (!currentQuote || total === 0) return null;
  const progressPercent = ((safeIndex + 1) / total) * 100;

  return (
    <div className="zen-reader-deck-container">
      <div className="zen-deck-header">
        <div className="zen-deck-meta-left">
          <span className="zen-deck-badge">
            <Sparkles size={13} color="var(--accent-gold)" />
            <span>Option 1: Zen Reader Deck</span>
          </span>
          <div className="zen-deck-tags">
            {currentQuote.tags && currentQuote.tags.length > 0 ? (
              currentQuote.tags.map((t) => (
                <span key={t} className="zen-tag-pill">
                  <Tag size={10} />
                  <span>{t}</span>
                </span>
              ))
            ) : (
              <span className="zen-tag-pill">Wisdom</span>
            )}
          </div>
        </div>

        <div className="zen-deck-meta-right">
          <button type="button" className="zen-deck-shuffle-btn" onClick={handleRandom} title="Random quote">
            <Shuffle size={13} />
            <span>Randomize</span>
          </button>
          <div className="zen-deck-counter">
            <span className="current-idx">{String(safeIndex + 1).padStart(2, '0')}</span>
            <span className="separator">/</span>
            <span className="total-count">{String(total).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <div className="zen-deck-progress-bar">
        <div className="zen-deck-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="zen-deck-card-wrapper">
        <button type="button" className="zen-carousel-nav-btn nav-prev" onClick={handlePrev} title="Previous (←)">
          <ChevronLeft size={22} />
        </button>

        <div key={currentQuote.id} className={`zen-focus-card animation-glide-${direction}`}>
          <div className="zen-watermark-icon" aria-hidden="true">
            <QuoteIcon size={88} />
          </div>

          <blockquote className="zen-quote-large-text">
            "{currentQuote.text}"
          </blockquote>

          <div className="zen-author-line">
            <span className="zen-author-name">— {currentQuote.author || 'Internal Wisdom'}</span>
            {currentQuote.source && currentQuote.source !== 'Direct Capture' && (
              <span className="zen-source-name">({currentQuote.source})</span>
            )}
          </div>

          {currentQuote.notes && (
            <div className="zen-personal-note-box">
              <div className="zen-note-header">
                <Feather size={12} color="var(--accent-gold)" />
                <span className="zen-note-title">Personal Anchor Note</span>
              </div>
              <p className="zen-note-content">{currentQuote.notes}</p>
            </div>
          )}

          <div className="zen-deck-actions-bar">
            <div className="zen-actions-left">
              <button type="button" className={`zen-action-btn ${copied ? 'is-active-success' : ''}`} onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button type="button" className={`zen-action-btn ${currentQuote.isPinned ? 'is-active-pinned' : ''}`} onClick={() => togglePinQuote(currentQuote.id)}>
                <Bookmark size={14} fill={currentQuote.isPinned ? 'var(--accent-gold)' : 'none'} />
                <span>{currentQuote.isPinned ? 'Anchored' : 'Pin'}</span>
              </button>

              <button type="button" className="zen-action-btn highlight-contemplate" onClick={() => setContemplatingQuote(currentQuote)}>
                <Maximize2 size={14} />
                <span>Contemplate</span>
              </button>
            </div>

            <div className="zen-actions-right">
              <button type="button" className="zen-action-btn next-primary-btn" onClick={handleNext}>
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <button type="button" className="zen-carousel-nav-btn nav-next" onClick={handleNext} title="Next (→)">
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="zen-deck-footer-hints">
        <span className="zen-hint-pill"><kbd>←</kbd> <kbd>→</kbd> Navigate</span>
        <span className="zen-hint-pill"><kbd>C</kbd> Copy</span>
        <span className="zen-hint-pill"><kbd>P</kbd> Pin</span>
        <span className="zen-hint-pill"><kbd>M</kbd> Contemplate</span>
      </div>
    </div>
  );
};

// ==========================================================================
// OPTION 2: LITERARY MANUSCRIPT STACK COMPONENT
// ==========================================================================
const ManuscriptFolio: React.FC<{ quote: Quote; index: number }> = ({ quote, index }) => {
  const { togglePinQuote, deleteQuote, setContemplatingQuote, showToast } = useData();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const citation = `"${quote.text}" — ${quote.author}${quote.source ? ` (${quote.source})` : ''}`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    showToast('Passage copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      className={`manuscript-folio ${quote.isPinned ? 'manuscript-pinned' : ''}`}
      onClick={() => setContemplatingQuote(quote)}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '2.2rem 2.4rem',
        marginBottom: '1.5rem',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
            Folio §{String(index + 1).padStart(2, '0')}
          </span>
          {quote.tags && quote.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {quote.tags.map((t) => (
                <span key={t} style={{ fontSize: '0.68rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {quote.isPinned && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', fontWeight: 600, color: 'var(--accent-gold)', backgroundColor: 'var(--accent-soft)', padding: '0.25rem 0.65rem', borderRadius: '9999px' }}>
            <Bookmark size={11} fill="var(--accent-gold)" />
            <span>Anchored</span>
          </span>
        )}
      </div>

      <blockquote style={{ fontFamily: 'var(--font-serif)', fontSize: '1.38rem', lineHeight: 1.72, color: 'var(--text-primary)', margin: 0 }}>
        “{quote.text}”
      </blockquote>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', fontSize: '0.9rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>— {quote.author || 'Anonymous'}</span>
        {quote.source && quote.source !== 'Direct Capture' && (
          <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>({quote.source})</span>
        )}
      </div>

      {quote.notes && (
        <div style={{ padding: '0.85rem 1.15rem', backgroundColor: 'var(--bg-subtle)', borderLeft: '2px solid var(--accent-gold)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-gold)', marginBottom: '0.2rem' }}>
            Personal Marginalia
          </div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-secondary)', margin: 0 }}>
            {quote.notes}
          </p>
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="zen-action-btn" onClick={() => setContemplatingQuote(quote)}>
            <Maximize2 size={12} />
            <span>Contemplate</span>
          </button>
          <button type="button" className="zen-action-btn" onClick={handleCopy}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Cite'}</span>
          </button>
          <button type="button" className={`zen-action-btn ${quote.isPinned ? 'is-active-pinned' : ''}`} onClick={() => togglePinQuote(quote.id)}>
            <Bookmark size={12} fill={quote.isPinned ? 'var(--accent-gold)' : 'none'} />
            <span>{quote.isPinned ? 'Anchored' : 'Anchor'}</span>
          </button>
        </div>
        <button type="button" className="zen-action-btn" onClick={() => deleteQuote(quote.id)}>
          <Trash2 size={12} color="#c62828" />
        </button>
      </div>
    </article>
  );
};

// ==========================================================================
// OPTION 3: THEME SHELVES COMPONENT
// ==========================================================================
const ThemeShelvesView: React.FC<{ quotes: Quote[] }> = ({ quotes }) => {
  const { togglePinQuote, setContemplatingQuote, showToast } = useData();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, q: Quote) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`"${q.text}" — ${q.author}`);
    setCopiedId(q.id);
    showToast('Quote copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = useMemo(() => {
    const pinned = quotes.filter((q) => q.isPinned);
    const stoic = quotes.filter((q) => q.tags?.some((t) => ['Stoicism', 'Resilience', 'Clarity'].includes(t)));
    const calm = quotes.filter((q) => q.tags?.some((t) => ['Peace', 'Calm', 'Presence', 'Mindfulness'].includes(t)));
    const rest = quotes.filter((q) => !pinned.includes(q) && !stoic.includes(q) && !calm.includes(q));

    return [
      { id: 'pinned', title: 'Daily Anchors & Pinned Wisdom', icon: <Bookmark size={15} color="var(--accent-gold)" />, items: pinned },
      { id: 'stoic', title: 'Stoicism & Inner Strength', icon: <Shield size={15} color="var(--accent-gold)" />, items: stoic },
      { id: 'calm', title: 'Calm & Flow', icon: <Wind size={15} color="var(--accent-gold)" />, items: calm },
      { id: 'all', title: 'Wisdom Vault Anthology', icon: <Compass size={15} color="var(--accent-gold)" />, items: rest.length > 0 ? rest : quotes }
    ].filter((cat) => cat.items.length > 0);
  }, [quotes]);

  return (
    <div className="theme-shelves-container">
      {categories.map((cat) => (
        <section key={cat.id} className="theme-shelf-section">
          <div className="shelf-header">
            <div className="shelf-title-group">
              <div className="shelf-icon-wrapper">{cat.icon}</div>
              <div>
                <h2 className="shelf-title">{cat.title}</h2>
              </div>
            </div>
            <span className="shelf-count-badge">{cat.items.length} quotes</span>
          </div>

          <div className="shelf-track-wrapper">
            <div className="shelf-scroll-track">
              {cat.items.map((quote) => (
                <article key={quote.id} className={`shelf-quote-card ${quote.isPinned ? 'pinned-shelf-card' : ''}`} onClick={() => setContemplatingQuote(quote)}>
                  <blockquote className="shelf-quote-body">
                    <p className="shelf-quote-text">"{quote.text}"</p>
                  </blockquote>
                  <div className="shelf-author-line">
                    <span className="shelf-author-name">— {quote.author}</span>
                  </div>
                  <div className="shelf-card-footer" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="shelf-action-btn" onClick={(e) => handleCopy(e, quote)}>
                      {copiedId === quote.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                    <button type="button" className="shelf-action-btn" onClick={() => togglePinQuote(quote.id)}>
                      <Bookmark size={12} fill={quote.isPinned ? 'var(--accent-gold)' : 'none'} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

// ==========================================================================
// OPTION 4: MINIMALIST FOCUS GRID COMPONENT
// ==========================================================================
const MinimalistFocusGrid: React.FC<{ quotes: Quote[] }> = ({ quotes }) => {
  const { togglePinQuote, deleteQuote, setContemplatingQuote, showToast } = useData();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, q: Quote) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`"${q.text}" — ${q.author}`);
    setCopiedId(q.id);
    showToast('Quote copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="minimalist-focus-grid density-auto">
      {quotes.map((quote) => (
        <article key={quote.id} className={`minimalist-focus-card ${quote.isPinned ? 'is-anchored' : ''}`} onClick={() => setContemplatingQuote(quote)}>
          <div className="focus-card-meta-bar">
            <span className="focus-tag-chip">{quote.tags?.[0] || 'Wisdom'}</span>
            {quote.isPinned && <span className="focus-anchor-badge"><Bookmark size={11} fill="var(--accent-gold)" /> Anchored</span>}
          </div>
          <div className="focus-quote-body-wrapper">
            <blockquote className="focus-quote-text">"{quote.text}"</blockquote>
          </div>
          <div className="focus-author-section">
            <span className="focus-author-name">— {quote.author}</span>
          </div>
          <div className="focus-card-actions-bar" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="focus-action-btn" onClick={(e) => handleCopy(e, quote)}>
              {copiedId === quote.id ? <Check size={13} /> : <Copy size={13} />}
              <span>Copy</span>
            </button>
            <button type="button" className="focus-action-btn" onClick={() => togglePinQuote(quote.id)}>
              <Bookmark size={13} fill={quote.isPinned ? 'var(--accent-gold)' : 'none'} />
              <span>{quote.isPinned ? 'Anchored' : 'Anchor'}</span>
            </button>
            <button type="button" className="focus-action-btn btn-danger" onClick={() => deleteQuote(quote.id)}>
              <Trash2 size={13} />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

// ==========================================================================
// OPTION 5: WISDOM INFINITE STREAM COMPONENT
// ==========================================================================
const InfiniteWisdomStream: React.FC<{ quotes: Quote[] }> = ({ quotes }) => {
  const { togglePinQuote, deleteQuote, setContemplatingQuote, showToast } = useData();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, q: Quote) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`"${q.text}" — ${q.author}`);
    setCopiedId(q.id);
    showToast('Quote copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="wisdom-nodes-stack" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {quotes.map((quote) => (
        <article key={quote.id} className={`wisdom-stream-node ${quote.isPinned ? 'stream-node-pinned' : ''}`} onClick={() => setContemplatingQuote(quote)}>
          <div className="stream-node-top">
            <span className="stream-tag-pill">#{quote.tags?.[0] || 'Wisdom'}</span>
            {quote.isPinned && <span className="stream-anchor-badge"><Bookmark size={12} /> Daily Anchor</span>}
          </div>
          <blockquote className="stream-serif-text">"{quote.text}"</blockquote>
          <div className="stream-attribution-row">
            <span className="stream-author-name">— {quote.author}</span>
          </div>
          {quote.notes && (
            <div className="stream-note-text" style={{ padding: '0.65rem 0.95rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              💭 {quote.notes}
            </div>
          )}
          <div className="stream-node-footer" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="stream-action-pill" onClick={(e) => handleCopy(e, quote)}>
              {copiedId === quote.id ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedId === quote.id ? 'Copied' : 'Copy'}</span>
            </button>
            <button type="button" className="stream-action-pill" onClick={() => togglePinQuote(quote.id)}>
              <Bookmark size={13} fill={quote.isPinned ? 'var(--accent-gold)' : 'none'} />
              <span>{quote.isPinned ? 'Anchored' : 'Anchor'}</span>
            </button>
            <button type="button" className="stream-action-icon danger" onClick={() => deleteQuote(quote.id)}>
              <Trash2 size={13} />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

// ==========================================================================
// MAIN QUOTES VAULT WITH 5 UX READING OPTIONS SWITCHER
// ==========================================================================
export const QuotesVault: React.FC = () => {
  const { quotes } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [viewOption, setViewOption] = useState<QuoteViewOption>('zen');

  const allTags = useMemo(() => {
    const set = new Set<string>();
    quotes.forEach((q) => q.tags?.forEach((t) => set.add(t)));
    return ['All', ...Array.from(set)];
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchesSearch =
        !searchQuery.trim() ||
        q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.notes && q.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === 'All' || (q.tags && q.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });
  }, [quotes, searchQuery, selectedTag]);

  return (
    <div className="quotes-vault-view">
      {/* Vault Header */}
      <div className="vault-header-section">
        <div className="vault-title-wrap">
          <h1 className="vault-main-title">Wisdom & Quotes Vault</h1>
          <p className="vault-subtitle">
            A quiet sanctuary for words that ground your spirit and restore perspective.
          </p>
        </div>

        <div className="vault-header-actions">
          <div className="vault-stat-badge">
            <Sparkles size={13} color="var(--accent-gold)" />
            <span>{quotes.length} Anchored Lines</span>
          </div>
        </div>
      </div>

      {/* 5 UX READING OPTIONS SELECTOR */}
      <div className="quote-ux-options-bar" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.85rem 1.15rem', backgroundColor: 'var(--bg-card)', border: 'var(--card-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-gold)' }}>
            Choose Reading Experience (5 UX Modes):
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`view-toggle-btn ${viewOption === 'zen' ? 'active' : ''}`}
            onClick={() => setViewOption('zen')}
          >
            <Layers size={13} />
            <span>1. Zen Deck (Carousel Focus)</span>
          </button>

          <button
            type="button"
            className={`view-toggle-btn ${viewOption === 'manuscript' ? 'active' : ''}`}
            onClick={() => setViewOption('manuscript')}
          >
            <BookOpen size={13} />
            <span>2. Literary Manuscript</span>
          </button>

          <button
            type="button"
            className={`view-toggle-btn ${viewOption === 'shelves' ? 'active' : ''}`}
            onClick={() => setViewOption('shelves')}
          >
            <Compass size={13} />
            <span>3. Theme Shelves</span>
          </button>

          <button
            type="button"
            className={`view-toggle-btn ${viewOption === 'grid' ? 'active' : ''}`}
            onClick={() => setViewOption('grid')}
          >
            <Grid size={13} />
            <span>4. Minimalist Focus Grid</span>
          </button>

          <button
            type="button"
            className={`view-toggle-btn ${viewOption === 'stream' ? 'active' : ''}`}
            onClick={() => setViewOption('stream')}
          >
            <Wind size={13} />
            <span>5. Infinite Stream</span>
          </button>
        </div>
      </div>

      {/* Fast 4-Field Capture Bar */}
      <FastQuoteCapture />

      {/* Search & Tags Bar */}
      <div className="vault-controls-row">
        <div className="vault-search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="vault-search-input"
            placeholder="Search quotes, authors, or personal notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {allTags.length > 1 && (
          <div className="vault-tags-scroll-wrap">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag-pill-filter ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Render Selected Quote Reading Mode */}
      {filteredQuotes.length === 0 ? (
        <div className="empty-vault-card">
          <BookOpen size={36} color="var(--accent-gold)" className="empty-icon" />
          <h2 className="empty-title">Your Wisdom Vault is Empty</h2>
          <p className="empty-desc">Capture a quote into the bar above or sync lines from your companion.</p>
        </div>
      ) : (
        <>
          {viewOption === 'zen' && <ZenReaderDeck quotes={filteredQuotes} />}
          {viewOption === 'manuscript' && (
            <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}>
              {filteredQuotes.map((q, idx) => (
                <ManuscriptFolio key={q.id} quote={q} index={idx} />
              ))}
            </div>
          )}
          {viewOption === 'shelves' && <ThemeShelvesView quotes={filteredQuotes} />}
          {viewOption === 'grid' && <MinimalistFocusGrid quotes={filteredQuotes} />}
          {viewOption === 'stream' && <InfiniteWisdomStream quotes={filteredQuotes} />}
        </>
      )}
    </div>
  );
};
