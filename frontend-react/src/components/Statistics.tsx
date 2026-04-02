'use client';

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import LogoYellow from '@/assets/img/logo_yellow.png';
import { fetchConversationStats, fetchJournalEntries } from '@/services/chat.api';
import './styles/Statistics.css';

interface StatCard {
  label: string
  value: string | number
  subtext: string
}

interface EmotionStats {
  emotion: string
  emoji: string
  count: number
  percentage: number
}

const moodMeta: Record<string, { label: string; emoji: string }> = {
  super: { label: 'Joie', emoji: '😊' },
  bien: { label: 'Calme', emoji: '😌' },
  moyen: { label: 'Moyen', emoji: '😐' },
  triste: { label: 'Tristesse', emoji: '😢' },
  colere: { label: 'Colère', emoji: '😠' },
};

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function Statistics() {
  const { toggleSidebar } = useOutletContext<{ toggleSidebar: () => void }>();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [emotionStats, setEmotionStats] = useState<EmotionStats[]>([]);
  const [weeklyMoods, setWeeklyMoods] = useState<(string | null)[]>(Array(7).fill(null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, journalRes] = await Promise.all([
          fetchConversationStats(),
          fetchJournalEntries()
        ]);

        const s = statsRes.data;
        setStats([
          {
            label: 'Conversations',
            value: s.totalConversations,
            subtext: `${s.recentConversations} cette semaine`,
          },
          {
            label: 'Messages échangés',
            value: s.totalMessages,
            subtext: 'Au total',
          },
          {
            label: 'Actif cette semaine',
            value: s.recentConversations,
            subtext: 'Conversations récentes',
          },
          {
            label: 'Msgs / session',
            value: s.averageMessagesPerConversation,
            subtext: 'En moyenne',
          },
        ]);

        // Humeur de la semaine (lundi → dimanche de la semaine en cours)
        const entries: { mood: string; dateLogged: string }[] = journalRes.data;
        const now = new Date();
        const monday = new Date(now);
        const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0=lundi
        monday.setDate(now.getDate() - dayOfWeek);
        monday.setHours(0, 0, 0, 0);

        const weekly: (string | null)[] = Array(7).fill(null);
        entries.forEach(e => {
          if (!e.dateLogged || !e.mood) return;
          const d = new Date(e.dateLogged);
          const diff = Math.floor((d.getTime() - monday.getTime()) / 86400000);
          if (diff >= 0 && diff < 7) weekly[diff] = moodMeta[e.mood]?.emoji ?? '❓';
        });
        setWeeklyMoods(weekly);

        // Distribution des émotions à partir des entrées journal
        if (entries.length > 0) {
          const moodCounts = entries.reduce<Record<string, number>>((acc, e) => {
            if (e.mood) acc[e.mood] = (acc[e.mood] || 0) + 1;
            return acc;
          }, {});

          const total = entries.filter(e => e.mood).length;
          const computed: EmotionStats[] = Object.entries(moodCounts).map(([mood, count]) => ({
            emotion: moodMeta[mood]?.label ?? mood,
            emoji: moodMeta[mood]?.emoji ?? '❓',
            count,
            percentage: Math.round((count / total) * 100)
          }));
          computed.sort((a, b) => b.count - a.count);
          setEmotionStats(computed);
        }
      } catch (err) {
        console.error('Erreur chargement statistiques:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <main className="max-chat__main">
      <header className="max-chat__header">
        <div className="max-chat__header-left">
          <button
            type="button"
            className="max-chat__menu-burger"
            aria-label="Ouvrir le menu"
            onClick={toggleSidebar}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="max-chat__header-avatar">
            <img src={LogoYellow} alt="MAX Logo" />
          </div>

          <div className="max-chat__header-info">
            <h1 className="max-chat__title">Statistiques Bien-être</h1>
            <p className="max-chat__plan">Suivez votre progression et vos tendances émotionnelles</p>
          </div>
        </div>
      </header>

      <div className="statistics__container">
        {/* Stats Cards */}
        <div className="statistics__cards">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="statistics__card statistics__card--skeleton">
                <div className="statistics__skeleton-line statistics__skeleton-line--short" />
                <div className="statistics__skeleton-line statistics__skeleton-line--tall" />
                <div className="statistics__skeleton-line statistics__skeleton-line--medium" />
              </div>
            ))
            : stats.map((stat, index) => (
              <div key={index} className="statistics__card">
                <p className="statistics__card-label">{stat.label}</p>
                <h3 className="statistics__card-value">{stat.value}</h3>
                <p className="statistics__card-subtext">{stat.subtext}</p>
              </div>
            ))
          }
        </div>

        {/* Weekly Mood */}
        <div className="statistics__section">
          <div className="statistics__section-header">
            <h2 className="statistics__section-title">Humeur de la semaine</h2>
            <p className="statistics__section-subtitle">Vue d'ensemble de votre état émotionnel</p>
          </div>

          <div className="statistics__weekly-moods">
            {days.map((day, index) => (
              <div key={index} className="statistics__day">
                <span className="statistics__day-emoji">
                  {weeklyMoods[index] ?? '—'}
                </span>
                <span className="statistics__day-name">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emotions Distribution */}
        <div className="statistics__section">
          <div className="statistics__section-header">
            <h2 className="statistics__section-title">Distribution des émotions</h2>
            <p className="statistics__section-subtitle">
              {emotionStats.length > 0 ? 'Basé sur vos entrées journal' : 'Aucune donnée journal pour l\'instant'}
            </p>
          </div>

          {emotionStats.length > 0 ? (
            <div className="statistics__emotions">
              {emotionStats.map((stat, index) => (
                <div key={index} className="statistics__emotion-row">
                  <div className="statistics__emotion-info">
                    <span className="statistics__emotion-emoji">{stat.emoji}</span>
                    <span className="statistics__emotion-label">{stat.emotion}</span>
                  </div>

                  <div className="statistics__emotion-bar-container">
                    <div
                      className="statistics__emotion-bar"
                      style={{
                        width: `${stat.percentage}%`,
                        backgroundColor: index === 0 ? '#FFD700' : 'rgba(255, 215, 0, 0.7)'
                      }}
                    />
                  </div>

                  <span className="statistics__emotion-stats">
                    {stat.count} fois {stat.percentage}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="statistics__empty">
                Ajoutez des entrées dans votre journal émotionnel pour voir votre distribution d'émotions ici.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
