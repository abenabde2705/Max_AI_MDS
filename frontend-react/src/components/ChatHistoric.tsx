import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Icon } from "@/ui/icons"
import { colors } from "@/ui/tokens/colors"

interface ChatHistoricProps {
  isOpen: boolean
  onClose: () => void
  conversations: any[]
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  activeConversation: string | null
  userInitials: string
}

export default function ChatHistoric({
  isOpen,
  onClose,
  conversations,
  onSelectConversation,
  onDeleteConversation,
  activeConversation,
  userInitials,
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
              {conversations.filter((conv) => conv && conv.id).map((conv) => (
                <div
                  key={conv.id}
                  className={`historic-item ${
                    activeConversation === conv.id ? "historic-item--active" : ""
                  }`}
                >
                  <button
                    className="historic-item-button"
                    onClick={() => {
                      onSelectConversation(conv.id)
                      handleClose()
                    }}
                  >
                    <div className="historic-item-icon">
                      <span className="historic-item-initials">{userInitials}</span>
                    </div>
                    <div className="historic-item-content">
                      <h3 className="historic-item-title">
                        {conv.title || `Conversation ${conv.id?.slice(0, 8) || 'Sans titre'}`}
                      </h3>
                      <p className="historic-item-date">
                        {conv.createdAt ? (
                          <>
                            {new Date(conv.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                            {" à "}
                            {new Date(conv.createdAt).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </>
                        ) : 'Date inconnue'}
                      </p>
                    </div>
                  </button>
                  <button
                    className="historic-item-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      const confirmDelete = () => {
                        onDeleteConversation(conv.id)
                        toast.success('Conversation supprimée avec succès')
                      }
                      
                      toast.info(
                        <div>
                          <p>Voulez-vous vraiment supprimer cette conversation ?</p>
                          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => {
                                confirmDelete()
                                toast.dismiss()
                              }}
                              style={{
                                padding: '6px 12px',
                                background: '#ff3b30',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              Supprimer
                            </button>
                            <button
                              onClick={() => toast.dismiss()}
                              style={{
                                padding: '6px 12px',
                                background: '#888',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              Annuler
                            </button>
                          </div>
                        </div>,
                        {
                          autoClose: false,
                          closeButton: false,
                        }
                      )
                    }}
                    title="Supprimer la conversation"
                  >
                    <Icon name="trash" size="sm" color={colors.semantic.error} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
