'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/ui/icons';
import LogoYellow from '@/assets/img/logo_yellow.png';
import { fetchJournalEntries, deleteJournalEntry } from '@/services/chat.api';
import './styles/EmotionalJournal.css';

interface JournalEntry {
  id: string
  mood: 'super' | 'bien' | 'moyen' | 'triste' | 'colere'
  moodEmoji: string
  moodLabel: string
  date: string
  description: string
  tags: string[]
}

const moodData = {
  super: { emoji: '😊', label: 'Super', color: '#FFD700' },
  bien: { emoji: '😊', label: 'Bien', color: '#FFD700' },
  moyen: { emoji: '😐', label: 'Moyen', color: '#FFA500' },
  triste: { emoji: '😢', label: 'Triste', color: '#87CEEB' },
  colere: { emoji: '😠', label: 'En colère', color: '#FF6347' },
};

function toDisplayEntry(raw: { id: string; mood: string; description: string; tags: string[]; dateLogged: string }): JournalEntry {
  const mood = raw.mood as keyof typeof moodData;
  return {
    id: raw.id,
    mood,
    moodEmoji: moodData[mood]?.emoji ?? '😐',
    moodLabel: moodData[mood]?.label ?? raw.mood,
    date: new Date(raw.dateLogged).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    description: raw.description,
    tags: raw.tags || [],
  };
}

export default function EmotionalJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    try {
      const res = await fetchJournalEntries();
      setEntries(res.data.map(toDisplayEntry));
    } catch (err) {
      console.error('Erreur chargement journal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteJournalEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Erreur suppression entrée:', err);
    }
  };

  return (
      <main className="max-chat__main">
        <header className="max-chat__header">
          <div className="max-chat__header-left">
            <div className="max-chat__header-avatar">
              <img src={LogoYellow} alt="MAX Logo" />
            </div>

            <div className="max-chat__header-info">
              <h1 className="max-chat__title">Journal Émotionnel</h1>
              <p className="max-chat__subtitle">Résumés automatiques de vos conversations</p>
            </div>
          </div>
        </header>

        <div className="emotional-journal__container">
          {loading ? (
            <p className="emotional-journal__loading">Chargement...</p>
          ) : entries.length === 0 ? (
            <p className="emotional-journal__empty">
              Aucune entrée pour l'instant. Les résumés apparaîtront automatiquement après vos conversations avec Max.
            </p>
          ) : (
            <div className="emotional-journal__entries">
              {entries.map((entry) => (
                <div key={entry.id} className="emotional-journal__entry">
                  <div className="emotional-journal__entry-header">
                    <div className="emotional-journal__mood-badge">
                      <span className="emotional-journal__mood-emoji">{entry.moodEmoji}</span>
                      <span className="emotional-journal__mood-label">{entry.moodLabel}</span>
                    </div>
                    <span className="emotional-journal__date">{entry.date}</span>
                    <button
                      className="emotional-journal__delete-btn"
                      onClick={() => handleDeleteEntry(entry.id)}
                      aria-label="Supprimer l'entrée"
                    >
                      <Icon name="trash" size="sm" />
                    </button>
                  </div>

                  <p className="emotional-journal__description">{entry.description}</p>

                  <div className="emotional-journal__tags">
                    {entry.tags.map((tag, index) => (
                      <span key={index} className="emotional-journal__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
  );
}
