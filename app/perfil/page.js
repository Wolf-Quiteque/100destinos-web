'use client';

import React, { useState, useEffect } from 'react';
import './style.css';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

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
      <div className="profile-loading">
        <i className="fas fa-spinner fa-spin"></i>
      </div>
    );
  }

  if (!profile) {
     return (
        <div className="profile-error">
            <p>Perfil não encontrado ou erro ao carregar.</p>
        </div>
     );
  }

  const initials = profile.nome ? profile.nome.split(' ').map(n => n[0]).join('').toUpperCase() : 'JS';

  return (
    <div className="profile-page">
      <main className="profile-main">
        {/* Left Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-header">
            <div className="profile-avatar">{initials}</div>
            <h1 className="profile-name">{profile.nome || 'João Silva'}</h1>
            <div className="profile-status">
              <i className="fas fa-rocket"></i>
              <span>Viajante Frequente</span>
            </div>
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

          <div className="logout-btn-container">
            <button
              onClick={handleLogout}
              className="logout-btn"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-sign-out-alt"></i>
              )}
              <span>Terminar Sessão</span>
            </button>
          </div>
        </aside>

        {/* Right Content */}
        <div className="profile-content">
          <div className="profile-nav">
            <div className="profile-nav-item">Ônibus</div>
            <div className="profile-nav-item active">Voos</div>
            <div className="profile-nav-item">Comboio</div>
            <div className="profile-nav-item">Barco</div>
          </div>

          <div className="section-title">
            Voos Anteriores
            <a href="#" className="see-all">Ver todos</a>
          </div>
          
          <div className="timeline">
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
          </div>

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
          </div>
        </div>
      </main>
    </div>
  );
}
