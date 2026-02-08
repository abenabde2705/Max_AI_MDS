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
    <aside className="w-full lg:w-[260px] flex flex-row lg:flex-col gap-4 lg:gap-6 items-center lg:items-stretch p-4 lg:p-6 rounded-[50px] border border-white/25 bg-black/[0.001] shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23),0_0_5px_#651E79_inset] relative overflow-hidden">
      <div className="flex items-center gap-3">
        <button 
          className="w-11 h-11 rounded-full border-2 border-[#DAE63D] flex items-center justify-center bg-transparent cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={() => navigate("/")}
          title="Retour à l'accueil"
        >
          <Icon name="back" size="md" />
        </button>
        <img src={LogoMax} alt="MAX Logo" className="h-10 w-auto object-contain" />
      </div>

      <nav className="flex flex-row lg:flex-col flex-wrap lg:flex-nowrap gap-2.5 lg:gap-3 lg:pt-8">
        <button 
          className={`w-auto lg:w-[196px] h-[75px] px-4 lg:p-0 rounded-[40px] border-none bg-transparent font-black text-xl text-center cursor-pointer transition-all duration-200 ${currentPath === "/chatbot" ? "shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23),0_0_5px_#651E79_inset] text-[#DAE63D]" : "text-white/[0.78] hover:bg-white/[0.08]"}`}
          onClick={() => navigate("/chatbot")}
        >
          Chat IA
        </button>
        <button 
          className={`w-auto lg:w-[196px] h-[75px] px-4 lg:p-0 rounded-[40px] border-none bg-transparent font-black text-xl text-center cursor-pointer transition-all duration-200 ${currentPath === "/journal" ? "shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23),0_0_5px_#651E79_inset] text-[#DAE63D]" : "text-white/[0.78] hover:bg-white/[0.08]"}`}
          onClick={() => navigate("/journal")}
        >
          Journal
        </button>
        <button 
          className={`w-auto lg:w-[196px] h-[75px] px-4 lg:p-0 rounded-[40px] border-none bg-transparent font-black text-xl text-center cursor-pointer transition-all duration-200 ${currentPath === "/statistics" ? "shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23),0_0_5px_#651E79_inset] text-[#DAE63D]" : "text-white/[0.78] hover:bg-white/[0.08]"}`}
          onClick={() => navigate("/statistics")}
        >
          Statistiques
        </button>
        <button 
          className={`w-auto lg:w-[196px] h-[75px] px-4 lg:p-0 rounded-[40px] border-none bg-transparent font-black text-xl text-center cursor-pointer transition-all duration-200 ${currentPath === "/coaches" ? "shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23),0_0_5px_#651E79_inset] text-[#DAE63D]" : "text-white/[0.78] hover:bg-white/[0.08]"}`}
          onClick={() => navigate("/coaches")}
        >
          Coachs
        </button>
      </nav>

      <div className="mt-0 lg:mt-auto">
        <Button fullWidth className="font-bold" variant="primary">Passez Premium</Button>
        <p className="mt-2.5 text-[0.8rem] text-white/70 text-center leading-normal">Vos échanges restent confidentiels et sécurisés</p>
      </div>
    </aside>
  )
}
