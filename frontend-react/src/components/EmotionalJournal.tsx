"use client"

import { useState, useEffect } from "react"
import { Button } from "@/ui/components/Button"
import { Icon } from "@/ui/icons"
import Sidebar from "./Sidebar"
import LogoYellow from "@/assets/img/logo_yellow.png"
import "./styles/EmotionalJournal.css"

interface JournalEntry {
  id: string
  mood: "super" | "bien" | "moyen" | "triste" | "colere"
  moodEmoji: string
  moodLabel: string
  date: string
  description: string
  tags: string[]
}

const moodData = {
  super: { emoji: "😊", label: "Super", color: "#FFD700" },
  bien: { emoji: "😊", label: "Bien", color: "#FFD700" },
  moyen: { emoji: "😐", label: "Moyen", color: "#FFA500" },
  triste: { emoji: "😢", label: "Triste", color: "#87CEEB" },
  colere: { emoji: "😠", label: "En colère", color: "#FF6347" },
}

export default function EmotionalJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      mood: "bien",
      moodEmoji: "😊",
      moodLabel: "Bien",
      date: "Lundi 13 octobre 2025",
      description:
        "Aujourd'hui j'ai eu une conversation importante avec mon équipe. Je me sens écouté et valorisé.",
      tags: ["travail", "positif"],
    },
    {
      id: "2",
      mood: "moyen",
      moodEmoji: "😐",
      moodLabel: "Moyen",
      date: "Dimanche 12 octobre 2025",
      description: "Journée normale, quelques moments de stress mais rien d'insurmontable.",
      tags: ["stress", "routine"],
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    mood: "bien",
    description: "",
    tags: "",
  })

  const handleAddEntry = () => {
    if (formData.description.trim()) {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        mood: formData.mood as "super" | "bien" | "moyen" | "triste" | "colere",
        moodEmoji: moodData[formData.mood as keyof typeof moodData].emoji,
        moodLabel: moodData[formData.mood as keyof typeof moodData].label,
        date: new Date().toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        description: formData.description,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      }

      setEntries([newEntry, ...entries])
      setFormData({ mood: "bien", description: "", tags: "" })
      setShowModal(false)
    }
  }

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
              <h1 className="max-chat__title">Journal Émotionnel</h1>
            </div>
          </div>

          <div className="max-chat__header-actions">
            <Button
              className="max-chat__action-button"
              variant="primary"
              onClick={() => setShowModal(true)}
            >
              <Icon name="add" size="sm" />
              Nouvelle entrée
            </Button>
          </div>
        </header>

        <div className="emotional-journal__container">
          <div className="emotional-journal__entries">
            {entries.map((entry) => (
              <div key={entry.id} className="emotional-journal__entry">
                <div className="emotional-journal__entry-header">
                  <div className="emotional-journal__mood-badge">
                    <span className="emotional-journal__mood-emoji">{entry.moodEmoji}</span>
                    <span className="emotional-journal__mood-label">{entry.moodLabel}</span>
                  </div>
                  <span className="emotional-journal__date">{entry.date}</span>
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
        </div>
      </main>

      {showModal && (
        <div className="emotional-journal__modal-overlay" onClick={() => setShowModal(false)}>
          <div className="emotional-journal__modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="emotional-journal__modal-title">Nouvelle entrée</h2>

            <div className="emotional-journal__form-group">
              <label className="emotional-journal__form-label">Comment vous sentez-vous ?</label>
              <div className="emotional-journal__mood-selector">
                {Object.entries(moodData).map(([key, { emoji, label }]) => (
                  <button
                    key={key}
                    className={`emotional-journal__mood-option ${
                      formData.mood === key ? "emotional-journal__mood-option--active" : ""
                    }`}
                    onClick={() => setFormData({ ...formData, mood: key })}
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="emotional-journal__form-group">
              <label className="emotional-journal__form-label">Votre entrée</label>
              <textarea
                className="emotional-journal__textarea"
                placeholder="Partagez vos pensées et vos sentiments..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
              />
            </div>

            <div className="emotional-journal__form-group">
              <label className="emotional-journal__form-label">
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                className="emotional-journal__input"
                placeholder="travail, positif, stress..."
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            <div className="emotional-journal__modal-actions">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="emotional-journal__modal-button"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleAddEntry}
                className="emotional-journal__modal-button"
              >
                Ajouter l'entrée
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
