import React from 'react';
import { useData } from '../../context/DataContext';
import { Copy, Check, Bookmark } from 'lucide-react';
import { ResponsiveModal } from './ResponsiveModal';

export const ContemplateModal: React.FC = () => {
  const { contemplatingQuote, setContemplatingQuote, togglePinQuote, showToast } = useData();
  const [copied, setCopied] = React.useState(false);

  if (!contemplatingQuote) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${contemplatingQuote.text}" — ${contemplatingQuote.author}`);
    setCopied(true);
    showToast('Quote copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ResponsiveModal
      isOpen={!!contemplatingQuote}
      onClose={() => setContemplatingQuote(null)}
      title="Contemplation Space"
      maxWidth="560px"
    >
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <blockquote className="contemplate-text">
          "{contemplatingQuote.text}"
        </blockquote>

        <div className="contemplate-author">
          {contemplatingQuote.author}
        </div>

        {contemplatingQuote.source && (
          <div className="contemplate-source">
            from {contemplatingQuote.source}
          </div>
        )}

        {contemplatingQuote.notes && (
          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '500px', margin: '1.5rem auto 0 auto' }}>
            Note: {contemplatingQuote.notes}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-light)'
          }}
        >
          <button className="anchor-action-btn" onClick={handleCopy}>
            {copied ? <Check size={14} color="var(--accent-gold)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            className="anchor-action-btn"
            onClick={() => togglePinQuote(contemplatingQuote.id)}
          >
            <Bookmark
              size={14}
              fill={contemplatingQuote.isPinned ? 'var(--accent-gold)' : 'none'}
              color={contemplatingQuote.isPinned ? 'var(--accent-gold)' : 'currentColor'}
            />
            <span>{contemplatingQuote.isPinned ? 'Pinned' : 'Pin to Home'}</span>
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
