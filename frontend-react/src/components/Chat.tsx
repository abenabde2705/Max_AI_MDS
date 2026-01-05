"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/ui/components/Button"
import { Input } from "@/ui/components/Input"
import { Icon } from "@/ui/icons"
import { colors } from "@/ui/tokens/colors"
import LogoPrincipal from "@/assets/img/Logo_principal.png"
import LogoYellow from "@/assets/img/logo_yellow.png"
import LogoMax from "@/assets/img/logomax.png"
const emotions = [
  { key: "super", label: "Super", icon: "😊" },
  { key: "bien", label: "Bien", icon: "😌" },
  { key: "triste", label: "Triste", icon: "😢" },
  { key: "colere", label: "En colère", icon: "😠" },
  { key: "fatigue", label: "Fatigué", icon: "😴" },
]

export default function MaxAIChat() {
  const navigate = useNavigate()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjour, je suis là pour vous écouter et vous soutenir. Comment vous sentez-vous aujourd'hui ?",
    },
    {
      role: "user",
      content: "Bonjour, je suis fatigué",
    },
  ])

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { role: "user", content: message }])
      setMessage("")
    }
  }

  const handleEmotionClick = (emotion: string) => {
    setMessages([...messages, { role: "user", content: `Je me sens ${emotion.toLowerCase()}` }])
  }

  return (
    <div className="max-chat">
      <aside className="max-chat__sidebar">
        <div className="max-chat__logo">
          <button 
            className="max-chat__logo-icon"
            onClick={() => navigate("/")}
            title="Retour à l'accueil"
          >
            <Icon name="back" size="md" />
          </button>
 <img src={LogoMax} alt="MAX Logo" className="max-chat__logo-image" />
         </div>

        <nav className="max-chat__nav">
          <button className="max-chat__nav-button max-chat__nav-button--active">Chat IA</button>
          <button className="max-chat__nav-button">Journal</button>
          <button className="max-chat__nav-button">Statistiques</button>
          <button className="max-chat__nav-button">Coachs</button>
        </nav>

        <div className="max-chat__premium">
          <Button fullWidth className="max-chat__premium-button">Passez Premium</Button>
          <p className="max-chat__premium-note">Vos échanges restent confidentiels et sécurisés</p>
        </div>
      </aside>

      <main className="max-chat__main">
        <header className="max-chat__header">
  <div className="max-chat__header-left">
    <div className="max-chat__header-avatar">
      <img src={LogoYellow} alt="MAX Logo" />
    </div>

    <div className="max-chat__header-info">
      <h1 className="max-chat__title">MAX - Assistant IA</h1>
      <p className="max-chat__plan">
        <strong>1/10 messages</strong> <span>Plan Free</span>
      </p>
    </div>
  </div>

  <div className="max-chat__header-actions">
    <Button className="max-chat__action-button">
      <Icon name="add" size="sm" />
      Nouvelle conversation
    </Button>

    <Button
      variant="outline"
      className="max-chat__action-button max-chat__action-button--ghost"
    >
      <Icon name="historic" size="sm" color={colors.brand.tertiary} />
      Historique
    </Button>
  </div>
</header>

        <div className="max-chat__messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-chat__message-row ${msg.role === "user" ? "max-chat__message-row--user" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="max-chat__badge">
                  <img src={LogoPrincipal} alt="MAX" className="max-chat__badge-logo" />
                </div>
              )}
              <div className={`max-chat__bubble ${msg.role === "assistant" ? "max-chat__bubble--assistant" : "max-chat__bubble--user"}`}>
                <p className="max-chat__bubble-text">{msg.content}</p>
              </div>
              {msg.role === "user" && <div className="max-chat__user-avatar">M</div>}
            </div>
          ))}
        </div>

        <div className="max-chat__input-area">
          <div className="max-chat__emotions">
            {emotions.map((emotion) => (
              <button
                key={emotion.key}
                onClick={() => handleEmotionClick(emotion.label)}
                className={`max-chat__emotion-button max-chat__emotion-button--${emotion.key}`}
              >
                <span>{emotion.icon}</span>
                <span>{emotion.label}</span>
              </button>
            ))}
          </div>

          <div className="max-chat__input-wrapper">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Partagez ce que vous ressentez..."
              className="max-chat__input"
            />
            <Button onClick={handleSendMessage} size="icon" className="max-chat__send">
              <Icon name="send" size="md" color={colors.brand.primary} />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
