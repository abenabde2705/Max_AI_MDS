'use client';

import { useState } from 'react';
import { Button } from '@/ui/components/Button';
import Sidebar from './Sidebar';
import LogoYellow from '@/assets/img/logo_yellow.png';
import './styles/Coaches.css';

interface Coach {
  id: string
  name: string
  specialty: string
  rating: number
  description: string
  specializations: string[]
  location: string
  availability: string
  price: string
  featured?: boolean
}

const coaches: Coach[] = [
  {
    id: '1',
    name: 'Dr. Sophie Martin',
    specialty: 'Psychologue clinicienne',
    rating: 4.9,
    description: 'Spécialisée en thérapie cognitive-comportementale et gestion du stress. 15 ans d\'expérience.',
    specializations: ['Anxiété', 'Stress'],
    location: 'Paris 8ème',
    availability: 'Disponible cette semaine',
    price: '80€/séance',
    featured: false,
  },
  {
    id: '2',
    name: 'Dr. Sophie Martin',
    specialty: 'Psychologue clinicienne',
    rating: 4.9,
    description: 'Spécialisée en thérapie cognitive-comportementale et gestion du stress. 15 ans d\'expérience.',
    specializations: ['Anxiété', 'Stress'],
    location: 'Paris 8ème',
    availability: 'Disponible cette semaine',
    price: '80€/séance',
  },
  {
    id: '3',
    name: 'Dr. Sophie Martin',
    specialty: 'Psychologue clinicienne',
    rating: 4.9,
    description: 'Spécialisée en thérapie cognitive-comportementale et gestion du stress. 15 ans d\'expérience.',
    specializations: ['Anxiété', 'Stress'],
    location: 'Paris 8ème',
    availability: 'Disponible cette semaine',
    price: '80€/séance',
  },
  {
    id: '4',
    name: 'Dr. Sophie Martin',
    specialty: 'Psychologue clinicienne',
    rating: 4.9,
    description: 'Spécialisée en thérapie cognitive-comportementale et gestion du stress. 15 ans d\'expérience.',
    specializations: ['Anxiété', 'Stress'],
    location: 'Paris 8ème',
    availability: 'Disponible cette semaine',
    price: '80€/séance',
  },
];

export default function Coaches() {
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
              <h1 className="max-chat__title">Professionnels recommandés</h1>
              <p className="max-chat__plan">
                Des coachs et thérapeutes qualifiés sélectionnés pour vous
              </p>
            </div>
          </div>
        </header>

        <div className="coaches__container">
          {/* Recommandations personnalisées */}
          <div className="coaches__recommendations">
            <div className="coaches__recommendations-title">Recommandations personnalisées</div>
            <p className="coaches__recommendations-text">
              Des professionnels sont sélectionnés en fonction de votre profil émotionnel et de vos besoins. L'IA ne remplace pas un professionnel, mais peut vous orienter vers le bon accompagnement.
            </p>
          </div>

          {/* Grille de coachs */}
          <div className="coaches__grid">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className={`coaches__card ${coach.featured ? 'coaches__card--featured' : ''}`}
              >
                <div className="coaches__card-header">
                  <div className="coaches__coach-info">
                    <h3 className="coaches__coach-name">{coach.name}</h3>
                    <p className="coaches__coach-specialty">{coach.specialty} 
                      <span className="coaches__rating-star"> ★</span>
                      <span className="coaches__rating-value">{coach.rating}</span>
                    </p>
                    
                  </div>
                </div>

                <p className="coaches__description">{coach.description}</p>

                <div className="coaches__details">
                  <div className="coaches__detail-row">
                    <span className="coaches__detail-icon">📍</span>
                    <span className="coaches__detail-text">{coach.location}</span>
                  </div>
                  <div className="coaches__detail-row">
                    <span className="coaches__detail-icon">📅</span>
                    <span className="coaches__detail-text">{coach.availability}</span>
                  </div>
                </div>

                <div className="coaches__specializations">
                  {coach.specializations.map((spec, index) => (
                    <span key={index} className="coaches__tag">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="coaches__footer">
                  <div className="coaches__price">
                    <span className="coaches__price-label">Tarif</span>
                    <span className="coaches__price-value">{coach.price}</span>
                  </div>
                  <Button className="coaches__button" variant="primary">
                    prendre rendez-vous
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
