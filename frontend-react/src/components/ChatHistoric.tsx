import { useState, useEffect } from "react"
import { Icon } from "@/ui/icons"
import { colors } from "@/ui/tokens/colors"

interface ChatHistoricProps {
  isOpen: boolean
  onClose: () => void
  conversations: any[]
  onSelectConversation: (id: string) => void
  activeConversation: string | null
}

export default function ChatHistoric({
  isOpen,
  onClose,
  conversations,
  onSelectConversation,
  activeConversation,
}: ChatHistoricProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = () => {
    onClose()
  }

  if (!isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className={`historic-overlay ${isAnimating ? "" : "historic-overlay--closing"}`}
        onClick={handleClose}
      ></div>

      {/* Side Popup */}
      <div className={`historic-popup ${isAnimating ? "" : "historic-popup--closing"}`}>
        <div className="historic-header">
          <h2>Historique des conversations</h2>
          <button className="historic-close" onClick={handleClose}>
            <Icon name="close" size="md" color={colors.common.white} />
          </button>
        </div>

        <div className="historic-content">
          {conversations.length === 0 ? (
            <div className="historic-empty">
              <p>Aucune conversation disponible</p>
            </div>
          ) : (
            <div className="historic-list">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`historic-item ${
                    activeConversation === conv.id ? "historic-item--active" : ""
                  }`}
                  onClick={() => {
                    onSelectConversation(conv.id)
                    handleClose()
                  }}
                >
                  <div className="historic-item-icon">
                    <Icon name="chat" size="sm" color={colors.brand.tertiary} />
                  </div>
                  <div className="historic-item-content">
                    <h3 className="historic-item-title">
                      {conv.title || `Conversation ${conv.id.slice(0, 8)}`}
                    </h3>
                    <p className="historic-item-date">
                      {new Date(conv.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
