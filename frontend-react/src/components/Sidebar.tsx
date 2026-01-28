import { useNavigate } from "react-router-dom"
import { Button } from "@/ui/components/Button"
import { Icon } from "@/ui/icons"
import LogoMax from "@/assets/img/logomax.png"

interface SidebarProps {
  onCreateNewConversation: () => void
}

export default function Sidebar({ onCreateNewConversation }: SidebarProps) {
  const navigate = useNavigate()

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
        <button className="max-chat__nav-button max-chat__nav-button--active">Chat IA</button>
        <button className="max-chat__nav-button">Journal</button>
        <button className="max-chat__nav-button">Statistiques</button>
        <button className="max-chat__nav-button">Coachs</button>
      </nav>

      <div className="max-chat__premium">
        <Button fullWidth className="max-chat__premium-button" variant="primary">Passez Premium</Button>
        <p className="max-chat__premium-note">Vos échanges restent confidentiels et sécurisés</p>
      </div>
    </aside>
  )
}
