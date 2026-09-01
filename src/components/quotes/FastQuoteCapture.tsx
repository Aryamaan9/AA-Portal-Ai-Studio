import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const PRESET_MOOD_TAGS = ['Peace', 'Clarity', 'Resilience', 'Action', 'Perspective', 'Gratitude', 'Purpose'];

export const FastQuoteCapture: React.FC = () => {
  const { addQuote } = useData();

  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Wisdom']);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    addQuote({
      text: text.trim(),
      author: author.trim() || 'Internal Wisdom',
      notes: notes.trim() || undefined,
      tags: selectedTags.length ? selectedTags : ['Wisdom'],
      isPinned: false,
      source: 'Direct Capture'
    });

    setText('');
    setAuthor('');
    setNotes('');
    setSelectedTags(['Wisdom']);
    setIsExpanded(false);
  };

  return (
    <div className="fast-quote-capture-card">
      <form onSubmit={handleSubmit}>
        {/* Single-Line Quick Field */}
        <div className="capture-main-row">
          <BookOpen size={17} color="var(--accent-gold)" className="capture-icon" />
          <input
            type="text"
            className="capture-main-input"
            placeholder="Type or paste a quote to capture..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (!isExpanded && e.target.value.length > 0) {
                setIsExpanded(true);
              }
            }}
          />

          <button
            type="button"
            className="capture-expand-btn"
            onClick={() => setIsExpanded((prev) => !prev)}
            title={isExpanded ? 'Collapse fields' : 'Expand all 4 fields'}
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            <span>{isExpanded ? 'Less' : 'Details'}</span>
          </button>

          <button
            type="submit"
            className="btn-primary"
            disabled={!text.trim()}
            style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
          >
            <Plus size={14} />
            <span>Save</span>
          </button>
        </div>

        {/* Expanded 4 Fields (Source, Mood Tags, Personal Note) */}
        {isExpanded && (
          <div className="capture-expanded-body">
            <div className="capture-fields-grid">
              {/* Field 2: Source / Author */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Source / Author</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Marcus Aurelius, Meditations, or Podcast"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              {/* Field 3: Mood & Topic Tags */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mood / Topic Tag</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {PRESET_MOOD_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-filter-chip ${selectedTags.includes(tag) ? 'active' : ''}`}
                      onClick={() => handleTagToggle(tag)}
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Field 4: Personal Note / Reflection */}
            <div className="form-group" style={{ marginTop: '0.85rem', marginBottom: 0 }}>
              <label className="form-label">Personal Note (Why this quote matters to you)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Add your personal context or reflection..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ fontSize: '0.92rem' }}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
