import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { ResponsiveModal } from './ResponsiveModal';

const BREATH_PHASES = [
  { text: 'Inhale gently', duration: 4, instruction: 'Breathe in slowly through your nose...' },
  { text: 'Hold softly', duration: 4, instruction: 'Rest in the fullness of your breath...' },
  { text: 'Exhale completely', duration: 4, instruction: 'Release all tension out through your mouth...' },
  { text: 'Hold peacefully', duration: 4, instruction: 'Enjoy the quiet stillness in your body...' }
];

export const BreathModal: React.FC = () => {
  const { isBreathModalOpen, setIsBreathModalOpen } = useData();
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(4);

  useEffect(() => {
    if (!isBreathModalOpen) {
      setPhaseIndex(0);
      setSecondsRemaining(4);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setPhaseIndex((currPhase) => (currPhase + 1) % BREATH_PHASES.length);
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathModalOpen]);

  if (!isBreathModalOpen) return null;

  const currentPhase = BREATH_PHASES[phaseIndex];

  return (
    <ResponsiveModal
      isOpen={isBreathModalOpen}
      onClose={() => setIsBreathModalOpen(false)}
      title="Nervous System Reset"
      maxWidth="460px"
    >
      <div className="breath-modal-content">
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Slow 4-4-4-4 Box Breathing to down-regulate nervous system arousal and restore mental clarity.
        </p>

        <div className="breath-circle-wrapper">
          <div className="breath-circle-outer" />
          <div className="breath-circle-inner">
            <span className="breath-instruction">{currentPhase.text}</span>
            <span className="breath-seconds">{secondsRemaining}s</span>
          </div>
        </div>

        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1.5rem' }}>
          "{currentPhase.instruction}"
        </p>

        <div style={{ marginTop: '2rem' }}>
          <button className="btn-secondary" onClick={() => setIsBreathModalOpen(false)}>
            Finished Grounding
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
