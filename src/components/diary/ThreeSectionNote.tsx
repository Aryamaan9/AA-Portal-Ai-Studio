import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { refineRawDiaryThought } from '../../services/diaryService';
import { Sparkles, Check, Bookmark, Lightbulb } from 'lucide-react';
import { SegmentedControl } from '@mantine/core';

type NotebookSection = 'raw' | 'polished' | 'highlights';

export const ThreeSectionNote: React.FC<{ onSaved?: () => void }> = ({ onSaved }) => {
  const { addDiaryEntry, settings, showToast } = useData();

  const [activeSection, setActiveSection] = useState<NotebookSection>('raw');
  const [rawContent, setRawContent] = useState('');
  const [refinedContent, setRefinedContent] = useState('');
  const [learnings, setLearnings] = useState<string[]>([]);
  const [newLearningInput, setNewLearningInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Quiet AI Polish & Highlight Extraction
  const handleAIRefine = async () => {
    if (!rawContent.trim()) {
      showToast('Write your raw thoughts on the notebook page first');
      return;
    }

    setIsRefining(true);
    try {
      const result = await refineRawDiaryThought(
        rawContent,
        settings.aiConfig,
        settings.geminiApiKey
      );

      setRefinedContent(result.refinedContent);
      setLearnings(result.learnings);
      setActiveSection('polished');
      showToast('Polished & Highlights Extracted ✨');
    } catch (err: any) {
      showToast(`Reflection error: ${err.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  const handleAddLearning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLearningInput.trim()) return;
    setLearnings((prev) => [...prev, newLearningInput.trim()]);
    setNewLearningInput('');
  };

  const handleRemoveLearning = (index: number) => {
    setLearnings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawContent.trim()) return;

    addDiaryEntry({
      date: new Date().toISOString().slice(0, 10),
      rawContent: rawContent.trim(),
      refinedContent: refinedContent.trim() || undefined,
      learnings: learnings.length > 0 ? learnings : undefined,
      tags: ['Journal'],
      source: 'web'
    });

    setRawContent('');
    setRefinedContent('');
    setLearnings([]);
    setActiveSection('raw');
    if (onSaved) onSaved();
  };

  return (
    <div className="moleskine-notebook-page style-ruled">
      {/* Spine Shadow & Red Guide Line */}
      <div className="paper-gutter-shadow" />
      <div className="paper-margin-red-line" />

      {/* Notebook Header & 3-Section Nav */}
      <div className="notebook-page-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '2px solid #E5DFD1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span className="notebook-page-num" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            pg. {new Date().getDate()}
          </span>

          <div className="paper-date-stamp" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <Bookmark size={13} color="var(--accent-gold)" />
            <time>
              {new Date().toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </time>
          </div>
        </div>

        {/* 3 SECTIONS: SegmentedControl */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <SegmentedControl
            size="xs"
            radius="xl"
            fullWidth
            color="teal"
            value={activeSection}
            onChange={(val) => setActiveSection(val as NotebookSection)}
            data={[
              { label: 'Raw Stream', value: 'raw' },
              { label: `Polished Essence ${refinedContent ? '✓' : ''}`, value: 'polished' },
              { label: `Key Highlights ${learnings.length > 0 ? `(${learnings.length})` : ''}`, value: 'highlights' }
            ]}
          />
        </div>
      </div>

      {/* SECTION 1: RAW STREAM */}
      {activeSection === 'raw' && (
        <div className="unified-paper-wrapper">
          <textarea
            className="unified-paper-textarea"
            rows={14}
            placeholder="Raw Stream: Unburden your mind freely without judgment..."
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* SECTION 2: POLISHED ESSENCE */}
      {activeSection === 'polished' && (
        <div className="unified-paper-wrapper" style={{ padding: '0.5rem 0' }}>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Polished Essence: The distilled core truth of your raw stream.
          </div>
          <textarea
            className="unified-paper-textarea"
            rows={10}
            placeholder="Click 'Polish & Reflect ✨' to auto-distill your raw thoughts, or type your polished reflection here..."
            value={refinedContent}
            onChange={(e) => setRefinedContent(e.target.value)}
          />
        </div>
      )}

      {/* SECTION 3: KEY HIGHLIGHTS & LEARNINGS */}
      {activeSection === 'highlights' && (
        <div className="notebook-highlights-section" style={{ padding: '0.5rem 0', minHeight: '280px' }}>
          <div style={{ marginBottom: '0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Key Highlights: Core realizations and life lessons extracted from this page.
          </div>

          {learnings.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              No highlights extracted yet. Click "Polish & Reflect ✨" or add your takeaways below.
            </p>
          ) : (
            <ul className="highlights-list">
              {learnings.map((item, index) => (
                <li key={index} className="highlight-item-row">
                  <Lightbulb size={14} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <span className="highlight-text">{item}</span>
                  <button
                    type="button"
                    className="btn-remove-highlight"
                    onClick={() => handleRemoveLearning(index)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddLearning} className="add-highlight-form">
            <input
              type="text"
              className="form-input"
              placeholder="Add a key highlight or realization..."
              value={newLearningInput}
              onChange={(e) => setNewLearningInput(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.45rem 0.85rem' }}>
              + Add
            </button>
          </form>
        </div>
      )}

      {/* Footer Controls */}
      <div className="notebook-footer-bar">
        <button
          type="button"
          className="btn-quiet-polish"
          onClick={handleAIRefine}
          disabled={isRefining || !rawContent.trim()}
        >
          <Sparkles size={14} color="var(--accent-gold)" />
          <span>{isRefining ? 'Distilling...' : 'Polish & Reflect ✨'}</span>
        </button>

        <button
          type="button"
          className="btn-primary notebook-save-btn"
          disabled={!rawContent.trim()}
          onClick={handleSubmit}
        >
          <Check size={14} />
          <span>Save Entry</span>
        </button>
      </div>
    </div>
  );
};
