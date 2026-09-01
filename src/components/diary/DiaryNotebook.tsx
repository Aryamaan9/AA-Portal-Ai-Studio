import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { ThreeSectionNote } from './ThreeSectionNote';
import { DiaryCard } from './DiaryCard';
import { Search, BookMarked, Sparkles } from 'lucide-react';

export const DiaryNotebook: React.FC = () => {
  const { diary } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    diary.forEach((d) => d.tags?.forEach((t) => set.add(t)));
    return ['All', ...Array.from(set)];
  }, [diary]);

  // Filtered diary entries
  const filteredDiary = useMemo(() => {
    return diary.filter((d) => {
      const matchesSearch =
        !searchQuery.trim() ||
        d.rawContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.refinedContent && d.refinedContent.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag =
        selectedTag === 'All' || (d.tags && d.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [diary, searchQuery, selectedTag]);

  return (
    <div className="diary-notebook-view">
      {/* Header Section */}
      <div className="vault-header-section" style={{ marginBottom: '1rem' }}>
        <div className="vault-title-wrap">
          <h1 className="vault-main-title">Notebook Journal</h1>
          <p className="vault-subtitle">
            A quiet paper canvas for your stream of consciousness.
          </p>
        </div>
        <div className="vault-stat-badge">
          <Sparkles size={13} color="var(--accent-gold)" />
          <span>{diary.length} {diary.length === 1 ? 'Page' : 'Pages'}</span>
        </div>
      </div>

      {/* Active Physical Paper Notebook */}
      <div style={{ marginBottom: '2.5rem' }}>
        <ThreeSectionNote />
      </div>

      {/* Timeline Controls: Search & Tags */}
      <div className="vault-controls-row">
        <div className="vault-search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="vault-search-input"
            placeholder="Search past notebook pages & reflections..."
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

      {/* Diary Entries List */}
      {filteredDiary.length === 0 ? (
        <div className="empty-vault-card">
          <BookMarked size={36} color="var(--accent-gold)" className="empty-icon" />
          <h3 className="empty-title">
            {diary.length === 0 ? 'Your Journal is Blank' : 'No matching entries found'}
          </h3>
          <p className="empty-desc">
            {diary.length === 0
              ? 'Write on the paper notebook above and click "Save Entry".'
              : 'Try clearing your search query or tag filter.'}
          </p>
        </div>
      ) : (
        <div className="diary-entries-stack">
          {filteredDiary.map((entry) => (
            <DiaryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
};
