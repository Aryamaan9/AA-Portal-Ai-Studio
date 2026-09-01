import React, { useState } from 'react';
import { DiaryEntry } from '../../types';
import { useData } from '../../context/DataContext';
import { Trash2, Sparkles, Bookmark, Feather, Lightbulb } from 'lucide-react';

type SectionTab = 'raw' | 'polished' | 'highlights';

export const DiaryCard: React.FC<{ entry: DiaryEntry }> = ({ entry }) => {
  const { deleteDiaryEntry } = useData();
  const [activeTab, setActiveTab] = useState<SectionTab>('raw');

  return (
    <article className="moleskine-notebook-card style-ruled">
      {/* Spine Shadow & Red Guide Line */}
      <div className="paper-gutter-shadow" aria-hidden="true" />
      <div className="paper-margin-red-line" aria-hidden="true" />

      {/* Card Header & Section Picker */}
      <div className="notebook-card-header">
        <div className="notebook-header-left">
          <span className="notebook-page-num">Entry</span>

          {/* 3 SECTION TABS */}
          <div className="paper-style-picker">
            <button
              type="button"
              className={`style-toggle-btn ${activeTab === 'raw' ? 'active' : ''}`}
              onClick={() => setActiveTab('raw')}
            >
              <Feather size={11} style={{ marginRight: '0.2rem' }} />
              Raw Stream
            </button>

            {entry.refinedContent && (
              <button
                type="button"
                className={`style-toggle-btn ${activeTab === 'polished' ? 'active' : ''}`}
                onClick={() => setActiveTab('polished')}
              >
                <Sparkles size={11} style={{ marginRight: '0.2rem' }} />
                Polished Essence
              </button>
            )}

            {entry.learnings && entry.learnings.length > 0 && (
              <button
                type="button"
                className={`style-toggle-btn ${activeTab === 'highlights' ? 'active' : ''}`}
                onClick={() => setActiveTab('highlights')}
              >
                <Lightbulb size={11} style={{ marginRight: '0.2rem' }} />
                Key Highlights ({entry.learnings.length})
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="paper-date-stamp">
            <Bookmark size={11} color="var(--accent-gold)" />
            <time>{entry.date}</time>
          </div>

          <button
            type="button"
            className="card-action-btn"
            onClick={() => deleteDiaryEntry(entry.id)}
            title="Delete Entry"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* SECTION CONTENT DISPLAY */}
      {activeTab === 'raw' && (
        <div className="notebook-entry-body">
          {entry.rawContent}
        </div>
      )}

      {activeTab === 'polished' && entry.refinedContent && (
        <div className="notebook-appended-reflection" style={{ margin: '0.5rem 0 1rem' }}>
          <div className="reflection-gold-bar" />
          <div className="reflection-body-text">
            <span className="reflection-label">Distilled Essence:</span>
            <p className="reflection-text">{entry.refinedContent}</p>
          </div>
        </div>
      )}

      {activeTab === 'highlights' && entry.learnings && entry.learnings.length > 0 && (
        <ul className="highlights-list" style={{ margin: '0.5rem 0 1rem' }}>
          {entry.learnings.map((item, index) => (
            <li key={index} className="highlight-item-row">
              <Lightbulb size={14} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <span className="highlight-text">{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Tags Row */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="quote-tags-row" style={{ marginTop: '0.5rem' }}>
          {entry.tags.map((t) => (
            <span key={t} className="quote-tag-pill">
              #{t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};
