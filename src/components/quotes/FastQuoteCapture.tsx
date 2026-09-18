import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Card, TextInput, Textarea, Button, Badge, Group, Stack, Collapse, Text } from '@mantine/core';

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
    <Card
      withBorder
      radius="md"
      shadow="xs"
      p="sm"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-light)',
        marginBottom: '1rem'
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="xs">
          {/* Main capture row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}
          >
            <TextInput
              placeholder="Type or paste a quote to capture..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (!isExpanded && e.target.value.length > 0) {
                  setIsExpanded(true);
                }
              }}
              leftSection={<BookOpen size={16} color="var(--accent-gold)" />}
              size="sm"
              radius="md"
              style={{ flex: '1 1 200px' }}
              styles={{
                input: {
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem'
                }
              }}
            />

            <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
              <Button
                type="button"
                variant="subtle"
                color="gray"
                size="sm"
                radius="md"
                onClick={() => setIsExpanded((prev) => !prev)}
                rightSection={isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                styles={{ root: { padding: '0 0.5rem', height: '36px' } }}
              >
                {isExpanded ? 'Less' : 'Details'}
              </Button>

              <Button
                type="submit"
                color="teal"
                size="sm"
                radius="md"
                disabled={!text.trim()}
                leftSection={<Plus size={14} />}
                styles={{ root: { height: '36px' } }}
              >
                Save
              </Button>
            </Group>
          </div>

          {/* Expanded 4 Fields (Source, Mood Tags, Personal Note) */}
          <Collapse in={isExpanded}>
            <Stack gap="sm" pt="xs" style={{ borderTop: '1px solid var(--border-light)', marginTop: '0.25rem' }}>
              {/* Field 2: Source / Author */}
              <TextInput
                label="Source / Author"
                placeholder="e.g. Marcus Aurelius, Meditations, or Podcast"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                size="xs"
                radius="sm"
                styles={{
                  label: { color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '2px' },
                  input: { backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }
                }}
              />

              {/* Field 3: Mood & Topic Tags */}
              <div>
                <Text size="xs" fw={600} c="dimmed" mb={4} style={{ fontSize: '0.78rem' }}>
                  Mood / Topic Tags
                </Text>
                <Group gap="xs" wrap="wrap">
                  {PRESET_MOOD_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'filled' : 'outline'}
                      color="teal"
                      size="sm"
                      radius="xl"
                      style={{ cursor: 'pointer', textTransform: 'none' }}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </div>

              {/* Field 4: Personal Note / Reflection */}
              <Textarea
                label="Personal Note (Why this quote matters to you)"
                placeholder="Add your personal context or reflection..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                autosize
                minRows={2}
                maxRows={4}
                size="xs"
                radius="sm"
                styles={{
                  label: { color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '2px' },
                  input: { backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }
                }}
              />
            </Stack>
          </Collapse>
        </Stack>
      </form>
    </Card>
  );
};
