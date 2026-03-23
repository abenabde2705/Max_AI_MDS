# Max_AI_MDS
# Workflow dev local :

                                                                                                                                        
                                                                                                                                                            
  # Terminal 1 — garder ouvert toute la session                                                                                                             
  ssh -L 0.0.0.0:11434:localhost:11434 ubuntu@135.125.179.70 -N                                                                                             
                                                                                                                                                            
  # Terminal 2 — une seule fois (si le réseau n'existe pas)                                                                                                 
  docker network create web 2>/dev/null || true

  # Terminal 2 — à chaque session
  docker compose -f docker-compose.local.yml up -d --build
