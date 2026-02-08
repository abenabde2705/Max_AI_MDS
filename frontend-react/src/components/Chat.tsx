"use client"

import { useState, useEffect } from "react"
import { Button } from "@/ui/components/Button"
import { Input } from "@/ui/components/Input"
import { Icon } from "@/ui/icons"
import { colors } from "@/ui/tokens/colors"
import { useChat } from "@/hooks/useChat"
import { fetchUserProfile } from "@/services/chat.api"
import ChatHistoric from "./ChatHistoric"
import Sidebar from "./Sidebar"
import LogoPrincipal from "@/assets/img/Logo_principal.png"
import LogoYellow from "@/assets/img/logo_yellow.png"
const emotions = [
  { key: "super", label: "Super", icon: "😊" },
  { key: "bien", label: "Bien", icon: "😌" },
  { key: "triste", label: "Triste", icon: "😢" },
  { key: "colere", label: "En colère", icon: "😠" },
  { key: "fatigue", label: "Fatigué", icon: "😴" },
]

export default function MaxAIChat() {
  const [message, setMessage] = useState("")
  const [isHistoricOpen, setIsHistoricOpen] = useState(false)
  const [userInitials, setUserInitials] = useState('U')
  const { messages, conversations, isWaiting, sendMessage, switchConversation, cancelResponse, activeConversation, createNewConversation, removeConversation } = useChat()

  // Récupérer les initiales de l'utilisateur au chargement
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const response = await fetchUserProfile()
        const user = response.data.user || response.data
        
        if (!user) {
          console.warn('Aucune donnée utilisateur reçue')
          return
        }
        
        // Utiliser camelCase avec fallback
        const firstname = user.firstName || user.firstname || ''
        const lastname = user.lastName || user.lastname || ''
        
        if (firstname && lastname) {
          setUserInitials(`${firstname[0]}${lastname[0]}`.toUpperCase())
        } else if (firstname) {
          setUserInitials(firstname.substring(0, 2).toUpperCase())
        } else if (user.email) {
          setUserInitials(user.email.substring(0, 2).toUpperCase())
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error)
      }
    }
    
    loadUserInfo()
  }, [])

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message)
      setMessage("")
    }
  }

  const handleEmotionClick = (emotion: string) => {
    sendMessage(`Je me sens ${emotion.toLowerCase()}`)
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-b from-[#161A4D] via-[#470059] to-[#651E79] text-white overflow-hidden p-[30px]">
      <Sidebar onCreateNewConversation={createNewConversation} />

      <main className="flex-1 flex flex-col backdrop-blur-[4px]">
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 lg:p-6 border-b border-white/10 gap-3">
  <div className="flex items-center gap-3">
    <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
      <img src={LogoYellow} alt="MAX Logo" className="w-full h-full object-cover" />
    </div>

    <div className="flex flex-col gap-1">
      <h1 className="m-0 text-2xl lg:text-4xl font-bold">MAX - Assistant IA</h1>
      <p className="mt-0.5 mb-0 text-[0.9rem] text-[#DAE63D]">
        <strong className="font-bold mr-1.5">1/10 messages</strong> <span>Plan Free</span>
      </p>
    </div>
  </div>

  <div className="flex items-center gap-2 w-full lg:w-auto">
    <Button className="flex-1 lg:flex-initial lg:min-w-[180px] px-4 py-2.5 transition-colors duration-200" variant="primary" onClick={createNewConversation}>
      <Icon name="add" size="sm" />
      Nouvelle conversation
    </Button>

    <Button
      variant="outline"
      className="flex-1 lg:flex-initial lg:min-w-[180px] px-4 py-2.5 transition-colors duration-200 bg-transparent border border-white/20"
      onClick={() => setIsHistoricOpen(true)}
    >
      <Icon name="historic" size="sm" />
      Historique
    </Button>
  </div>
</header>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-[34px] h-[34px] rounded-[50%_50%_0_50%] bg-[#DAE63D] flex items-center justify-center text-[#161A4D] flex-shrink-0">
                  <img src={LogoPrincipal} alt="MAX" className="w-5 h-5 object-contain" />
                </div>
              )}
              <div className={`max-w-[540px] px-[18px] py-3.5 rounded-[22px] leading-normal border ${msg.role === "assistant" ? "bg-[#DAE63D] text-[#161A4D] border-transparent" : "bg-white/[0.08] text-white border-white/20"}`}>
                <p className="m-0">{msg.content}</p>
                {msg.timestamp && (
                  <span className="block text-[11px] opacity-60 mt-1.5 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              {msg.role === "user" && <div className="w-[34px] h-[34px] rounded-[50%_50%_50%_0] bg-[#DAE63D] text-[#161A4D] flex items-center justify-center font-bold flex-shrink-0">{userInitials}</div>}
            </div>
          ))}
          {isWaiting && (
            <div className="flex items-start gap-3">
              <div className="w-[34px] h-[34px] rounded-[50%_50%_0_50%] bg-[#DAE63D] flex items-center justify-center text-[#161A4D] flex-shrink-0">
                <img src={LogoPrincipal} alt="MAX" className="w-5 h-5 object-contain" />
              </div>
              <div className="max-w-[540px] px-[18px] py-3.5 rounded-[22px] leading-normal border bg-[#DAE63D] text-[#161A4D] border-transparent">
                <p className="m-0">...</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-5 lg:px-5 lg:py-6 flex flex-col gap-3.5 border-t border-white/10">
          <div className="flex justify-center gap-2.5 flex-wrap">
            {emotions.map((emotion) => {
              const bgClass = 
                emotion.key === "super" ? "bg-[#a855f7]/15" :
                emotion.key === "bien" ? "bg-[#f472b6]/15" :
                emotion.key === "triste" ? "bg-[#3b82f6]/15" :
                emotion.key === "colere" ? "bg-[#f87171]/15" :
                emotion.key === "fatigue" ? "bg-[#6b7280]/[0.18]" :
                "bg-white/5"
              
              return (
                <button
                  key={emotion.key}
                  onClick={() => handleEmotionClick(emotion.label)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-white/20 text-white font-semibold cursor-pointer transition-all duration-200 hover:bg-white/[0.12] active:translate-y-px ${bgClass}`}
                >
                  <span>{emotion.icon}</span>
                  <span>{emotion.label}</span>
                </button>
              )
            })}
          </div>

          <div className="relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isWaiting && handleSendMessage()}
              placeholder="Partagez ce que vous ressentez..."
              disabled={isWaiting}
            />
            {isWaiting ? (
              <button
                onClick={cancelResponse}
                className="absolute top-1/2 right-[10px] -translate-y-1/2 w-11 h-11 rounded-full bg-[#161A4D] hover:bg-[#1f2463] flex items-center justify-center transition-colors duration-200 border-none cursor-pointer"
              >
                <Icon name="close" size="md" />
              </button>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="absolute top-1/2 right-[10px] -translate-y-1/2 w-11 h-11 rounded-full bg-[#161A4D] hover:bg-[#1f2463] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200 border-none cursor-pointer"
              >
                <Icon name="send" size="md" />
              </button>
            )}
          </div>
        </div>
      </main>

      <ChatHistoric
        isOpen={isHistoricOpen}
        onClose={() => setIsHistoricOpen(false)}
        conversations={conversations}
        onSelectConversation={switchConversation}
        onDeleteConversation={removeConversation}
        activeConversation={activeConversation}
        userInitials={userInitials}
      />
    </div>
  )
}
