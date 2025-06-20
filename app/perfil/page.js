'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('pt-PT'); // Format for Portugal/Angola
  } catch (e) {
    return 'Data inválida';
  }
};

export default function PerfilPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast({ title: "Erro", description: "Não foi possível carregar o perfil.", variant: "destructive" });
        } else {
          setProfile(data);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase, router, toast]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    setIsLoggingOut(false);
    if (error) {
      console.error('Logout error:', error);
      toast({ title: "Erro ao Sair", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sessão terminada." });
      router.push('/login');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 via-gray-900 to-black">
        <i className="fas fa-spinner fa-spin fa-3x text-orange-500"></i>
      </div>
    );
  }

  if (!profile) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 via-gray-900 to-black text-white">
            <p>Perfil não encontrado ou erro ao carregar.</p>
        </div>
     );
  }

  const initials = profile.nome ? profile.nome.split(' ').map(n => n[0]).join('').toUpperCase() : 'JS';

  return (
    <>
      <div className="container bg-gradient-to-br from-orange-900 via-gray-900 to-black">
          {/* Cabeçalho */}
          <header className="profile-header">
              <div className="profile-avatar">{initials}</div>
              <h1 className="profile-name">{profile.nome || 'João Silva'}</h1>
              <div className="profile-status">
                  <i className="fas fa-rocket"></i>
                  <span>Viajante Frequente</span>
              </div>
              
              <div className="stats-container">
                  <div className="stat-item">
                      <div className="stat-value">24</div>
                      <div className="stat-label">Viagens</div>
                  </div>
                  <div className="stat-item">
                      <div className="stat-value">12</div>
                      <div className="stat-label">Cidades</div>
                  </div>
                  <div className="stat-item">
                      <div className="stat-value">42K</div>
                      <div className="stat-label">Milhas</div>
                  </div>
              </div>
          </header>
          
          {/* Navegação */}
          <div className="profile-nav">
              <div className="profile-nav-item">Ônibus</div>
              <div className="profile-nav-item active">Voos</div>
              <div className="profile-nav-item">Comboio</div>
              <div className="profile-nav-item">Barco</div>
          </div>
          
          {/* Histórico */}
          <div className="section-title">
              Voos Anteriores
              <a href="#" className="see-all">Ver todos</a>
          </div>
          
          <div className="timeline">
              {/* Viagem recente */}
              <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                      <div className="trip-header">
                          <div>
                              <div className="trip-route">GRU → JFK</div>
                              <div className="trip-details">
                                  <div className="trip-detail">
                                      <i className="fas fa-plane"></i>
                                      <span>LATAM</span>
                                  </div>
                                  <div className="trip-detail">
                                      <i className="fas fa-clock"></i>
                                      <span>10h 30m</span>
                                  </div>
                              </div>
                          </div>
                          <div className="trip-date">15 MAI 2023</div>
                      </div>
                      
                      <div className="trip-image" style={{ backgroundImage: "url('https://picsum.photos/id/1036/800/600')" }}>
                          <div className="trip-location">Nova York, EUA</div>
                      </div>
                  </div>
              </div>
              
              {/* Viagem anterior */}
              <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                      <div className="trip-header">
                          <div>
                              <div className="trip-route">GRU → MIA</div>
                              <div className="trip-details">
                                  <div className="trip-detail">
                                      <i className="fas fa-plane"></i>
                                      <span>American Airlines</span>
                                  </div>
                                  <div className="trip-detail">
                                      <i className="fas fa-clock"></i>
                                      <span>8h 15m</span>
                                  </div>
                              </div>
                          </div>
                          <div className="trip-date">2 ABR 2023</div>
                      </div>
                      
                      <div className="trip-image" style={{ backgroundImage: "url('https://picsum.photos/id/1040/800/600')" }}>
                          <div className="trip-location">Miami, EUA</div>
                      </div>
                  </div>
              </div>
              
              {/* Viagem anterior */}
              <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                      <div className="trip-header">
                          <div>
                              <div className="trip-route">GRU → SSA</div>
                              <div className="trip-details">
                                  <div className="trip-detail">
                                      <i className="fas fa-plane"></i>
                                      <span>GOL</span>
                                  </div>
                                  <div className="trip-detail">
                                      <i className="fas fa-clock"></i>
                                      <span>2h 30m</span>
                                  </div>
                              </div>
                          </div>
                          <div className="trip-date">10 MAR 2023</div>
                      </div>
                      
                      <div className="trip-image" style={{ backgroundImage: "url('https://picsum.photos/id/1050/800/600')" }}>
                          <div className="trip-location">Salvador, Brasil</div>
                      </div>
                  </div>
              </div>
          </div>
          
          {/* Conquistas */}
          <div className="section-title badges-section">
              Conquistas
              <a href="#" className="see-all">5/12 desbloqueadas</a>
          </div>
          
          <div className="badges-grid">
              <div className="badge-card">
                  <div className="badge-icon">
                      <i className="fas fa-plane"></i>
                  </div>
                  <div className="badge-name">Primeiro Voo</div>
                  <div className="badge-date">JAN 2022</div>
              </div>
              
              <div className="badge-card">
                  <div className="badge-icon">
                      <i className="fas fa-globe-americas"></i>
                  </div>
                  <div className="badge-name">Costa a Costa</div>
                  <div className="badge-date">MAR 2022</div>
              </div>
              
              <div className="badge-card">
                  <div className="badge-icon">
                      <i className="fas fa-route"></i>
                  </div>
                  <div className="badge-name">10K Milhas</div>
                  <div className="badge-date">MAI 2022</div>
              </div>
              
              <div className="badge-card">
                  <div className="badge-icon">
                      <i className="fas fa-cloud-sun"></i>
                  </div>
                  <div className="badge-name">Viajante Experiente</div>
                  <div className="badge-date">AGO 2022</div>
              </div>
              
              <div className="badge-card">
                  <div className="badge-icon">
                      <i className="fas fa-business-time"></i>
                  </div>
                  <div className="badge-name">Classe Executiva</div>
                  <div className="badge-date">NOV 2022</div>
              </div>
              
              <div className="badge-card locked">
                  <div className="badge-icon locked">
                      <i className="fas fa-lock"></i>
                  </div>
                  <div className="badge-name">Explorador Global</div>
                  <div className="badge-date">?</div>
              </div>
          </div>
      </div>
      

      {/* Logout Button */}
      <div className="mt-8 text-center">
          <button
              onClick={handleLogout}
              className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
              disabled={isLoggingOut}
          >
              {isLoggingOut ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sign-out-alt mr-2"></i>}
              Terminar Sessão
          </button>
      </div>
    </>
  );
}
