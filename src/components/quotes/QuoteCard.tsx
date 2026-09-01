import React, { useState } from 'react';
import { Quote } from '../../types';
import { useData } from '../../context/DataContext';
import { Bookmark, Copy, Check, Trash2, Tag } from 'lucide-react';

interface QuoteCardProps {
  quote: Quote;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote }) => {
  const { togglePinQuote, deleteQuote, setContemplatingQuote, showToast } = useData();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `"${quote.text}" — ${quote.author}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Quote copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      className={`quote-card-item ${quote.isPinned ? 'pinned-card' : ''}`}
      onClick={() => setContemplatingQuote(quote)}
    >
      {/* Card Header: Source & Pin Status */}
      <div className="quote-card-top-row">
        <div className="quote-tags-row">
          {quote.tags && quote.tags.length > 0 ? (
            quote.tags.map((tag) => (
              <span key={tag} className="quote-tag-pill">
                <Tag size={9} />
                <span>{tag}</span>
              </span>
            ))
          ) : (
            <span className="quote-tag-pill">Wisdom</span>
          )}
        </div>

        {quote.isPinned && (
          <span className="quote-pinned-badge">
            <Bookmark size={11} />
            <span>Daily Anchor</span>
          </span>
        )}
      </div>

      {/* Quote Body */}
      <blockquote className="quote-body-text">
        "{quote.text}"
      </blockquote>

      {/* Author Credit */}
      <div className="quote-author-credit">
        — {quote.author || 'Internal Wisdom'}
        {quote.source && quote.source !== 'Direct Capture' && (
          <span className="quote-source-label">({quote.source})</span>
        )}
      </div>

      {/* Personal Note (if any) */}
      {quote.notes && (
        <div className="quote-personal-note-box">
          <span className="note-label">Personal Note:</span>
          <p className="note-content">{quote.notes}</p>
        </div>
      )}

      {/* Bottom Actions Row */}
      <div className="quote-card-footer" onClick={(e) => e.stopPropagation()}>
        <div className="quote-footer-left">
          <button
            className={`card-action-btn ${copied ? 'active-success' : ''}`}
            onClick={handleCopy}
            title="Copy Quote"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            className={`card-action-btn ${quote.isPinned ? 'active-pinned' : ''}`}
            onClick={() => togglePinQuote(quote.id)}
            title={quote.isPinned ? 'Unpin from Anchor' : 'Pin to Daily Anchor'}
          >
            <Bookmark size={13} />
            <span>{quote.isPinned ? 'Anchored' : 'Pin'}</span>
          </button>
        </div>

        <div className="quote-footer-right">
          <button
            className="card-action-btn danger-action"
            onClick={() => deleteQuote(quote.id)}
            title="Delete Quote"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </article>
  );
};
