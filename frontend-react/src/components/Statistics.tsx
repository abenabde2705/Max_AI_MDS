'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import LogoYellow from '@/assets/img/logo_yellow.png';
import './styles/Statistics.css';

interface StatCard {
  label: string
  value: string | number
  subtext: string
  icon?: string
}

interface EmotionStats {
  emotion: string
  emoji: string
  count: number
  percentage: number
}

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const dayEmojis = ['😊', '😌', '😊', '😢', '😌', '😊', '😐'];

const emotionStats: EmotionStats[] = [
  { emotion: 'Joie', emoji: '😊', count: 15, percentage: 35 },
  { emotion: 'Calme', emoji: '😌', count: 12, percentage: 28 },
  { emotion: 'Anxiété', emoji: '😰', count: 8, percentage: 19 },
  { emotion: 'Tristesse', emoji: '😢', count: 5, percentage: 12 },
  { emotion: 'Colère', emoji: '😠', count: 3, percentage: 6 },
];

export default function Statistics() {
  const [stats] = useState<StatCard[]>([
    {
      label: 'Conversations',
      value: '24',
      subtext: '+3 cette semaine',
    },
    {
      label: 'Jours suivis',
      value: '45',
      subtext: 'Consécutifs',
    },
    {
      label: 'Score bien-être',
      value: '78%',
      subtext: '+12% ce mois',
    },
    {
      label: 'Objectifs atteints',
      value: '8/10',
      subtext: 'Ce mois',
    },
  ]);

  return (
    <div className="max-chat">
      <Sidebar onCreateNewConversation={() => {}} />

      <main className="max-chat__main">
        <header className="max-chat__header">
          <div className="max-chat__header-left">
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
            {stats.map((stat, index) => (
              <div key={index} className="statistics__card">
                <p className="statistics__card-label">{stat.label}</p>
                <h3 className="statistics__card-value">{stat.value}</h3>
                <p className="statistics__card-subtext">{stat.subtext}</p>
              </div>
            ))}
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
                  <span className="statistics__day-emoji">{dayEmojis[index]}</span>
                  <span className="statistics__day-name">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emotions Distribution */}
          <div className="statistics__section">
            <div className="statistics__section-header">
              <h2 className="statistics__section-title">Distribution des émotions</h2>
              <p className="statistics__section-subtitle">Ce mois-ci</p>
            </div>

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
          </div>
        </div>
      </main>
    </div>
  );
}
