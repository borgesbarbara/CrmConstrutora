import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    lembradosHoje: 0,
    totalPacientes: 0,
    fechamentosHoje: 0,
    fechamentosMes: 0,
    valorTotalMes: 0,
    ticketMedio: 0,
    totalFechamentos: 0,
    estatisticasConsultores: []
  });
  const [pipelineStats, setPipelineStats] = useState({
    leads: 0,
    agendados: 0,
    compareceram: 0,
    fechados: 0,
    naoFecharam: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchPipelineStats();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setLoading(false);
    }
  };

  const fetchPipelineStats = async () => {
    try {
      // Buscar estatísticas de pacientes por status
      const pacientesResponse = await axios.get('/api/pacientes');
      const pacientes = pacientesResponse.data;

      // Buscar estatísticas de agendamentos por status
      const agendamentosResponse = await axios.get('/api/agendamentos');
      const agendamentos = agendamentosResponse.data;

      // Contar por status
      const pipelineData = {
        leads: pacientes.filter(p => p.status === 'lead').length,
        agendados: pacientes.filter(p => p.status === 'agendado').length + 
                  agendamentos.filter(a => a.status === 'agendado').length,
        compareceram: pacientes.filter(p => p.status === 'compareceu').length + 
                     agendamentos.filter(a => a.status === 'compareceu').length,
        fechados: pacientes.filter(p => p.status === 'fechado').length + 
                 agendamentos.filter(a => a.status === 'fechado').length,
        naoFecharam: pacientes.filter(p => p.status === 'nao_fechou').length + 
                    agendamentos.filter(a => a.status === 'nao_fechou').length,
        naoCompareceram: agendamentos.filter(a => a.status === 'nao_compareceu').length,
        reagendados: pacientes.filter(p => p.status === 'reagendado').length + 
                    agendamentos.filter(a => a.status === 'reagendado').length
      };

      setPipelineStats(pipelineData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do pipeline:', error);
    }
  };

  const hoje = new Date().toLocaleDateString('pt-BR');

  // Calcular taxa de conversão
  const taxaConversao = pipelineStats.leads > 0 
    ? Math.round((pipelineStats.fechados / pipelineStats.leads) * 100)
    : 0;

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">📊 Dashboard</h1>
          <p className="page-subtitle">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Dashboard</h1>
        <p className="page-subtitle">Visão geral da sua operação - {hoje}</p>
      </div>

      {/* Pipeline de Vendas */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🎯 Pipeline de Vendas</h2>
          <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#10b981' }}>
            Taxa de Conversão: {taxaConversao}%
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card" style={{ borderLeftColor: '#fbbf24' }}>
            <div className="stat-number" style={{ color: '#fbbf24' }}>{pipelineStats.leads}</div>
            <div className="stat-label">🔍 Leads</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#60a5fa' }}>
            <div className="stat-number" style={{ color: '#60a5fa' }}>{pipelineStats.agendados}</div>
            <div className="stat-label">📅 Agendados</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#34d399' }}>
            <div className="stat-number" style={{ color: '#34d399' }}>{pipelineStats.compareceram}</div>
            <div className="stat-label">🎯 Compareceram</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
            <div className="stat-number" style={{ color: '#10b981' }}>{pipelineStats.fechados}</div>
            <div className="stat-label">💰 Fechados</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
            <div className="stat-number" style={{ color: '#ef4444' }}>{pipelineStats.naoFecharam}</div>
            <div className="stat-label">❌ Não Fecharam</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#f87171' }}>
            <div className="stat-number" style={{ color: '#f87171' }}>{pipelineStats.naoCompareceram}</div>
            <div className="stat-label">🚫 Não Compareceram</div>
          </div>
        </div>


      </div>

      {/* Estatísticas Diárias */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-number">{stats.agendamentosHoje}</div>
          <div className="stat-label">Agendamentos Hoje</div>
        </div>
        <div className="stat-card success">
          <div className="stat-number">{stats.lembradosHoje}</div>
          <div className="stat-label">Lembrados Hoje</div>
        </div>
        <div className="stat-card info">
          <div className="stat-number">{stats.totalPacientes}</div>
          <div className="stat-label">Total de Pacientes</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-number">
            {stats.agendamentosHoje > 0 
              ? Math.round((stats.lembradosHoje / stats.agendamentosHoje) * 100)
              : 0}%
          </div>
          <div className="stat-label">Taxa de Lembrados Hoje</div>
        </div>
      </div>

      {/* Estatísticas de Fechamentos */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">💰 Fechamentos</h2>
          <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#10b981' }}>
            Ticket Médio: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(stats.ticketMedio)}
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
            <div className="stat-number" style={{ color: '#10b981' }}>{stats.fechamentosHoje}</div>
            <div className="stat-label">💰 Fechamentos Hoje</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#059669' }}>
            <div className="stat-number" style={{ color: '#059669' }}>{stats.fechamentosMes}</div>
            <div className="stat-label">📊 Fechamentos no Mês</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#047857' }}>
            <div className="stat-number" style={{ color: '#047857' }}>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                maximumFractionDigits: 0
              }).format(stats.valorTotalMes)}
            </div>
            <div className="stat-label">💸 Faturamento do Mês</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#065f46' }}>
            <div className="stat-number" style={{ color: '#065f46' }}>{stats.totalFechamentos}</div>
            <div className="stat-label">🎯 Total de Fechamentos</div>
          </div>
        </div>
      </div>

      {/* Cards dos Consultores */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🩺 Acompanhamento por Consultor</h2>
        </div>
        
        {stats.estatisticasConsultores.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>
            Nenhum consultor cadastrado ainda.
          </p>
        ) : (
          <div className="grid grid-3">
            {stats.estatisticasConsultores.map(consultor => (
              <div key={consultor.id} className="card" style={{ margin: 0 }}>
                <h3 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '600', 
                  marginBottom: '1rem',
                  color: '#2d3748',
                  borderBottom: '2px solid #667eea',
                  paddingBottom: '0.5rem'
                }}>
                  {consultor.nome}
                </h3>
                
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    background: '#f7fafc',
                    borderRadius: '6px'
                  }}>
                    <span>Total Agendamentos:</span>
                    <strong style={{ color: '#667eea' }}>{consultor.total_agendamentos}</strong>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    background: '#f0fff4',
                    borderRadius: '6px'
                  }}>
                    <span>Total Lembrados:</span>
                    <strong style={{ color: '#4CAF50' }}>{consultor.total_lembrados}</strong>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    background: '#fffbf0',
                    borderRadius: '6px'
                  }}>
                    <span>Agendamentos Hoje:</span>
                    <strong style={{ color: '#ff9800' }}>{consultor.agendamentos_hoje}</strong>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    background: '#f0f9ff',
                    borderRadius: '6px'
                  }}>
                    <span>Taxa de Conversão:</span>
                    <strong style={{ color: '#2196f3' }}>
                      {consultor.total_agendamentos > 0 
                        ? Math.round((consultor.total_lembrados / consultor.total_agendamentos) * 100)
                        : 0}%
                    </strong>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    background: '#f0fdf4',
                    borderRadius: '6px'
                  }}>
                    <span>Fechamentos no Mês:</span>
                    <strong style={{ color: '#10b981' }}>{consultor.fechamentos_mes || 0}</strong>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    background: '#ecfdf5',
                    borderRadius: '6px'
                  }}>
                    <span>Valor Total Mês:</span>
                    <strong style={{ color: '#059669' }}>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(consultor.valor_total_mes || 0)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo de Ações Rápidas */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">⚡ Ações Rápidas</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/pacientes'}
            style={{ padding: '1.5rem', flexDirection: 'column', gap: '0.5rem' }}
          >
            <span style={{ fontSize: '2rem' }}>👥</span>
            Novo Paciente
          </button>
          <button 
            className="btn btn-success"
            onClick={() => window.location.href = '/agendamentos'}
            style={{ padding: '1.5rem', flexDirection: 'column', gap: '0.5rem' }}
          >
            <span style={{ fontSize: '2rem' }}>📅</span>
            Novo Agendamento
          </button>
          <button 
            className="btn"
            onClick={() => window.location.href = '/fechamentos'}
            style={{ 
              padding: '1.5rem', 
              flexDirection: 'column', 
              gap: '0.5rem',
              background: '#10b981',
              color: 'white',
              border: 'none'
            }}
          >
            <span style={{ fontSize: '2rem' }}>💰</span>
            Novo Fechamento
          </button>
          <button 
            className="btn btn-warning"
            onClick={() => window.location.href = '/consultores'}
            style={{ padding: '1.5rem', flexDirection: 'column', gap: '0.5rem' }}
          >
            <span style={{ fontSize: '2rem' }}>🩺</span>
            Novo Consultor
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/clinicas'}
            style={{ padding: '1.5rem', flexDirection: 'column', gap: '0.5rem' }}
          >
            <span style={{ fontSize: '2rem' }}>🏥</span>
            Nova Clínica
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 