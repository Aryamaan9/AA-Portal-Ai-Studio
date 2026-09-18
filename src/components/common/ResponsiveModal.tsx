import React from 'react';
import { Modal } from '@mantine/core';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  hideHeader?: boolean;
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '640px',
  hideHeader = false
}) => {
  const isMobile = useIsMobile();

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      zIndex={2000}
      title={hideHeader ? null : title}
      fullScreen={isMobile}
      size={maxWidth}
      radius={isMobile ? 0 : 'lg'}
      padding="md"
      withCloseButton={!hideHeader}
      centered
      transitionProps={{ transition: 'fade-up', duration: 200 }}
      styles={{
        header: {
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '0.75rem',
          marginBottom: '1rem',
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
        },
        title: {
          fontFamily: 'var(--font-serif)',
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
        },
        content: {
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
        },
        body: {
          paddingBottom: isMobile ? '5rem' : '1.5rem',
        }
      }}
    >
      {children}
    </Modal>
  );
};

