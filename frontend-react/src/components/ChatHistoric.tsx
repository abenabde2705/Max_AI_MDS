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
        className={`fixed inset-0 bg-black/50 backdrop-blur-[4px] z-[999] ${isAnimating ? "animate-fade-in" : "animate-fade-out"}`}
        onClick={handleClose}
      ></div>

      {/* Side Popup */}
      <div className={`fixed top-0 right-0 w-full sm:w-[400px] h-screen bg-gradient-to-b from-[#161A4D] via-[#470059] to-[#651E79] shadow-[-4px_0_20px_rgba(0,0,0,0.3)] z-[1000] flex border border-[#DAE63D] rounded-l-[70px] flex-col ${isAnimating ? "animate-slide-in-right" : "animate-slide-out-right"}`}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-[#DAE63D] text-xl font-bold m-0">Historique des conversations</h2>
          <button className="bg-transparent border-none cursor-pointer p-3 flex items-center justify-center rounded-lg transition-colors duration-200 min-w-[44px] min-h-[44px] hover:bg-white/10" onClick={handleClose}>
            <Icon name="close" size="lg" color={colors.common.white} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/60 text-[0.95rem]">
              <p>Aucune conversation disponible</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {conversations.filter((conv) => conv && conv.id).map((conv) => (
                <div
                  key={conv.id}
                  className={`bg-white/5 border rounded-xl p-3 flex items-center gap-2 transition-all duration-200 w-full relative ${
                    activeConversation === conv.id 
                      ? "bg-[#DAE63D]/15 border-[#DAE63D]/30 shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23),0_0_5px_#651E79_inset]" 
                      : "border-white/10 hover:bg-white/10"
                  }`}
                >
                  <button
                    className="bg-transparent border-none p-1 flex items-center gap-3 cursor-pointer flex-1 text-left text-inherit hover:-translate-x-1 transition-transform duration-200"
                    onClick={() => {
                      onSelectConversation(conv.id)
                      handleClose()
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#DAE63D]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-[#DAE63D] uppercase">{userInitials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-base font-semibold m-0 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        {conv.title || `Conversation ${conv.id?.slice(0, 8) || 'Sans titre'}`}
                      </h3>
                      <p className="text-white/60 text-[0.85rem] m-0">
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
                    className="bg-white/20 border-none p-2 cursor-pointer rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 hover:bg-[#ff3b30]/15 hover:scale-110"
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
                    <Icon name="trash" size="sm" color={colors.common.white} />
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
