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
import { Textarea, Button, Badge, Card, Text, Group, Stack } from '@mantine/core';

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
    setActiveTab('companion');
    sendCompanionMessage(text);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Group gap="xs" wrap="nowrap">
            <Badge
              variant="light"
              color="yellow"
              size="sm"
              radius="xl"
              leftSection={<Sparkles size={12} color="var(--accent-gold)" />}
              styles={{ root: { textTransform: 'none', fontWeight: 600 } }}
            >
              Daily Anchor
            </Badge>
            {currentAnchor.tags && currentAnchor.tags.length > 0 && (
              <Badge variant="outline" color="gray" size="sm" radius="xl" styles={{ root: { textTransform: 'none' } }}>
                #{currentAnchor.tags[0]}
              </Badge>
            )}
          </Group>

          <Group gap="xs" wrap="nowrap">
            {availableAnchors.length > 1 && (
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                radius="sm"
                leftSection={<RefreshCw size={13} />}
                onClick={handleNextAnchor}
                title="Cycle to next anchor quote"
              >
                Cycle
              </Button>
            )}

            <Button
              variant={currentAnchor.isPinned ? 'light' : 'subtle'}
              color={currentAnchor.isPinned ? 'yellow' : 'gray'}
              size="xs"
              radius="sm"
              leftSection={<Bookmark size={13} fill={currentAnchor.isPinned ? 'var(--accent-gold)' : 'none'} />}
              onClick={() => togglePinQuote(currentAnchor.id)}
              title={currentAnchor.isPinned ? 'Unpin from Anchor' : 'Pin as Daily Anchor'}
            >
              {currentAnchor.isPinned ? 'Anchored' : 'Pin'}
            </Button>

            <Button
              variant="light"
              color="teal"
              size="xs"
              radius="sm"
              leftSection={<Maximize2 size={13} />}
              onClick={() => setContemplatingQuote(currentAnchor)}
              title="Open full-screen contemplation space"
            >
              Contemplate
            </Button>
          </Group>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Group gap="sm" wrap="nowrap" align="flex-start">
            <div className="mirror-icon-badge" style={{ marginTop: '2px' }}>
              <Feather size={15} color="var(--accent-gold)" />
            </div>
            <div>
              <h2 className="section-label-title" style={{ margin: 0 }}>Mind Mirror & Grounding Companion</h2>
              <p className="section-label-subtitle" style={{ margin: '2px 0 0 0' }}>Speak freely without filter. Whatever is alive, heavy, or in flux.</p>
            </div>
          </Group>

          <Button
            variant="outline"
            color="teal"
            size="xs"
            radius="xl"
            leftSection={<Wind size={13} />}
            onClick={() => setIsBreathModalOpen(true)}
            title="Take a 1-minute box breath"
          >
            Slow Exhale (4-4-4-4)
          </Button>
        </div>

        <form onSubmit={handleReflectSubmit} className="mirror-input-form">
          <div style={{ marginBottom: '1rem' }}>
            <Textarea
              placeholder="What is occupying your mind right now? Speak unfiltered..."
              value={feelingInput}
              onChange={(e) => setFeelingInput(e.target.value)}
              autosize
              minRows={3}
              maxRows={8}
              size="md"
              radius="md"
              styles={{
                input: {
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-light)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                }
              }}
            />
            {feelingInput.trim().length > 0 && (
              <Text size="xs" c="dimmed" ta="right" mt={4}>
                {feelingInput.trim().length} chars
              </Text>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <Text size="xs" fw={600} c="dimmed" mb={6} tt="uppercase" style={{ letterSpacing: '0.05em' }}>
                Or ground into a state:
              </Text>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.35rem' }} className="hide-scrollbar">
                {MOOD_CHECKIN_PILLS.map((pill) => (
                  <Badge
                    key={pill}
                    variant={feelingInput === pill ? 'filled' : 'outline'}
                    color="teal"
                    size="sm"
                    radius="xl"
                    style={{ cursor: 'pointer', textTransform: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                    onClick={() => handleChipClick(pill)}
                  >
                    {pill}
                  </Badge>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                color="teal"
                size="sm"
                radius="md"
                disabled={!feelingInput.trim()}
                rightSection={<ArrowRight size={14} />}
              >
                Reflect & Ground
              </Button>
            </div>
          </div>
        </form>
      </section>

      {/* SECTION 3: RECENT REFLECTIONS & VAULT WISDOM PREVIEW GRID */}
      <section className="sanctuary-preview-grid">
        {/* CARD A: RECENT NOTEBOOK JOURNAL ENTRY */}
        <Card withBorder radius="md" shadow="xs" p="md" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)' }}>
          <Group justify="space-between" align="center" mb="sm">
            <Group gap="xs">
              <BookMarked size={16} color="var(--accent-gold)" />
              <Text fw={600} size="sm">Recent Journal Page</Text>
            </Group>
            {latestDiaryEntry && (
              <Badge variant="light" color="gray" size="xs">
                {latestDiaryEntry.date}
              </Badge>
            )}
          </Group>

          <div style={{ minHeight: '120px', cursor: 'pointer' }} onClick={() => setActiveTab('diary')}>
            {latestDiaryEntry ? (
              <Stack gap="xs">
                {latestDiaryEntry.title && (
                  <Text fw={700} size="md" style={{ fontFamily: 'var(--font-serif)' }}>
                    {latestDiaryEntry.title}
                  </Text>
                )}
                <Text size="sm" c="dimmed" lineClamp={3}>
                  {latestDiaryEntry.rawContent}
                </Text>

                {latestDiaryEntry.refinedContent && (
                  <div className="preview-distilled-strip">
                    <span className="distilled-mini-badge">Essence</span>
                    <p className="distilled-mini-text">{latestDiaryEntry.refinedContent}</p>
                  </div>
                )}

                {latestDiaryEntry.tags && latestDiaryEntry.tags.length > 0 && (
                  <Group gap={4} mt={4}>
                    {latestDiaryEntry.tags.slice(0, 3).map((t) => (
                      <Badge key={t} variant="outline" size="xs" color="teal">#{t}</Badge>
                    ))}
                  </Group>
                )}
              </Stack>
            ) : (
              <Stack align="center" justify="center" gap="xs" py="md">
                <BookMarked size={28} color="var(--text-muted)" />
                <Text size="sm" c="dimmed" ta="center">Your notebook is blank and awaiting today's reflections.</Text>
                <Text size="xs" fw={600} c="teal">Write first page →</Text>
              </Stack>
            )}
          </div>

          <Button
            variant="subtle"
            color="teal"
            fullWidth
            mt="md"
            rightSection={<ChevronRight size={14} />}
            onClick={() => setActiveTab('diary')}
            styles={{ root: { borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', height: 'auto' } }}
          >
            Open Notebook Journal
          </Button>
        </Card>

        {/* CARD B: WISDOM VAULT HIGHLIGHT */}
        <Card withBorder radius="md" shadow="xs" p="md" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)' }}>
          <Group justify="space-between" align="center" mb="sm">
            <Group gap="xs">
              <BookOpen size={16} color="var(--accent-gold)" />
              <Text fw={600} size="sm">Vault Wisdom Highlight</Text>
            </Group>
            {highlightQuote && highlightQuote.tags && highlightQuote.tags.length > 0 && (
              <Badge variant="light" color="yellow" size="xs" leftSection={<Tag size={10} />}>
                {highlightQuote.tags[0]}
              </Badge>
            )}
          </Group>

          <div style={{ minHeight: '120px' }}>
            {highlightQuote ? (
              <Stack gap="xs">
                <blockquote
                  className="preview-quote-text"
                  style={{ cursor: 'pointer', margin: 0 }}
                  onClick={() => setContemplatingQuote(highlightQuote)}
                >
                  "{highlightQuote.text}"
                </blockquote>
                <Group gap="xs">
                  <Text size="xs" fw={600} c="dimmed">— {highlightQuote.author || 'Internal Wisdom'}</Text>
                  {highlightQuote.source && (
                    <Text size="xs" c="dimmed">({highlightQuote.source})</Text>
                  )}
                </Group>

                <Group gap="xs" mt="xs">
                  <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    leftSection={copiedQuoteId === highlightQuote.id ? <Check size={12} color="var(--accent-gold)" /> : <Copy size={12} />}
                    onClick={(e) => handleCopyQuote(e, highlightQuote)}
                  >
                    {copiedQuoteId === highlightQuote.id ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    variant="subtle"
                    color="teal"
                    size="xs"
                    leftSection={<Maximize2 size={12} />}
                    onClick={() => setContemplatingQuote(highlightQuote)}
                  >
                    Contemplate
                  </Button>
                </Group>
              </Stack>
            ) : (
              <Stack align="center" justify="center" gap="xs" py="md">
                <BookOpen size={28} color="var(--text-muted)" />
                <Text size="sm" c="dimmed" ta="center">Your wisdom vault is ready to store timeless quotes.</Text>
                <Text size="xs" fw={600} c="teal" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('quotes')}>Add a quote →</Text>
              </Stack>
            )}
          </div>

          <Button
            variant="subtle"
            color="teal"
            fullWidth
            mt="md"
            rightSection={<ChevronRight size={14} />}
            onClick={() => setActiveTab('quotes')}
            styles={{ root: { borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', height: 'auto' } }}
          >
            Explore Vault ({quotes.length})
          </Button>
        </Card>
      </section>
    </div>
  );
};
