import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Send, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { ResponsiveModal } from './ResponsiveModal';

interface WhatsAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIMULATOR_EXAMPLES = [
  'Today was actually a really good day.',
  'Quote: The obstacle is the way. — Marcus Aurelius',
  "I've been thinking that maybe I should explore studying abroad.",
  'Todo: Call CA tomorrow.',
  'Feeling 7/10 today. Much better than yesterday.'
];

export const WhatsAppSimulatorModal: React.FC<WhatsAppSimulatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { refreshData, showToast, setActiveTab } = useData();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [responseLog, setResponseLog] = useState<{
    original: string;
    category: string;
    reply: string;
    timestamp: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSend = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setResponseLog(null);

    try {
      const res = await fetch('http://localhost:3001/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, from: '+1-555-ARYAMAAN' })
      });

      if (res.ok) {
        const data = await res.json();
        setResponseLog({
          original: text,
          category: data.category,
          reply: data.reply,
          timestamp: new Date().toLocaleTimeString()
        });
        refreshData();
        showToast(data.reply);
      } else {
        showToast('Webhook returned error');
      }
    } catch (err: any) {
      showToast(`Could not connect to backend server: ${err.message}`);
    } finally {
      setIsSending(false);
      setMessage('');
    }
  };

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} title="WhatsApp Ingestion Simulator" maxWidth="580px">
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Test your natural language capture pipeline right now. Type any thought, quote, task, or feeling exactly as you would on WhatsApp:
        </p>

        {/* Quick Example Chips */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Click an example to test:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {SIMULATOR_EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                className="mood-pill"
                style={{ textAlign: 'left', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem' }}
                onClick={() => handleSend(ex)}
              >
                <Sparkles size={12} style={{ display: 'inline', marginRight: '0.35rem', color: 'var(--accent-gold)' }} />
                <span>"{ex}"</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(message);
          }}
          style={{ marginTop: '1rem' }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Type message to WhatsApp..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
              autoFocus
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={!message.trim() || isSending}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {isSending ? 'Sending...' : <Send size={15} />}
            </button>
          </div>
        </form>

        {/* Response Simulation Display */}
        {responseLog && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--accent-gold)',
              animation: 'slideDown 0.3s var(--ease-gentle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--accent-gold)' }}>
                AI Classification: {responseLog.category.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {responseLog.timestamp}
              </span>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
              <strong>Message:</strong> "{responseLog.original}"
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <CheckCircle size={14} color="var(--accent-gold)" />
              <span>{responseLog.reply}</span>
            </div>

            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                onClick={() => {
                  onClose();
                  if (responseLog.category === 'quote') {
                    setActiveTab('quotes');
                  } else {
                    setActiveTab('sanctuary');
                  }
                }}
              >
                <span>View in Dashboard</span>
                <ArrowRight size={12} style={{ marginLeft: '0.3rem' }} />
              </button>
            </div>
          </div>
        )}
    </ResponsiveModal>
  );
};
