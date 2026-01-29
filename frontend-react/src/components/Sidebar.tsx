import { useNavigate } from "react-router-dom"
import { Button } from "@/ui/components/Button"
import { Icon } from "@/ui/icons"
import LogoMax from "@/assets/img/logomax.png"

interface SidebarProps {
  onCreateNewConversation: () => void
}

export default function Sidebar({ onCreateNewConversation }: SidebarProps) {
  const navigate = useNavigate()
  const currentPath = window.location.pathname

  return (
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
        <button 
          className={`max-chat__nav-button ${currentPath === "/chatbot" ? "max-chat__nav-button--active" : ""}`}
          onClick={() => navigate("/chatbot")}
        >
          Chat IA
        </button>
        <button 
          className={`max-chat__nav-button ${currentPath === "/journal" ? "max-chat__nav-button--active" : ""}`}
          onClick={() => navigate("/journal")}
        >
          Journal
        </button>
        <button 
          className={`max-chat__nav-button ${currentPath === "/statistics" ? "max-chat__nav-button--active" : ""}`}
          onClick={() => navigate("/statistics")}
        >
          Statistiques
        </button>
        <button 
          className={`max-chat__nav-button ${currentPath === "/coaches" ? "max-chat__nav-button--active" : ""}`}
          onClick={() => navigate("/coaches")}
        >
          Coachs
        </button>
      </nav>

      <div className="max-chat__premium">
        <Button fullWidth className="max-chat__premium-button" variant="primary">Passez Premium</Button>
        <p className="max-chat__premium-note">Vos échanges restent confidentiels et sécurisés</p>
      </div>
    </aside>
  )
}
