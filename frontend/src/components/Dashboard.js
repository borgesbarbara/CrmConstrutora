import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';


const Dashboard = () => {
  const { makeRequest, user } = useAuth();
  const [periodo, setPeriodo] = useState('total'); // total, semanal, mensal
  const [subPeriodo, setSubPeriodo] = useState(null); // para dias da semana
  const [semanaOpcao, setSemanaOpcao] = useState('atual'); // atual, proxima
  const [mesAno, setMesAno] = useState(new Date()); // para navegação mensal
  const [stats, setStats] = useState({
    totalIndicacoes: 0,
    totalAgendamentos: 0,
    agendamentosHoje: 0,
    leadsPorStatus: {},
    consultoresStats: [],
    comissaoTotalMes: 0,
    comissaoTotalGeral: 0,
    // Novas estatísticas por período
    agendamentosPeriodo: 0,
    valorPeriodo: 0,
    novosLeadsPeriodo: 0,
    // Estatísticas por dia da semana
    estatisticasPorDia: {},
    // Valores de fechamento
    totalFechamentos: 0,
    valorTotalFechamentos: 0,
    fechamentosPeriodo: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [periodo, subPeriodo, mesAno, semanaOpcao]);



  const calcularComissao = () => {
    return 5000; // R$ 5.000 por fechamento
  };

  const fetchStats = async () => {
    try {
      const [indicacoesRes, agendamentosRes, consultoresRes] = await Promise.all([
        makeRequest('/clientes'),
        makeRequest('/agendamentos'),
        makeRequest('/consultores')
      ]);

      const indicacoes = await indicacoesRes.json();
      const agendamentos = await agendamentosRes.json();
      const consultores = await consultoresRes.json();

      const hoje = new Date();
      const hojeStr = hoje.toISOString().split('T')[0];
      const agendamentosHoje = agendamentos.filter(a => a.data_agendamento === hojeStr).length;

      const leadsPorStatus = indicacoes.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {});



      // Calcular data de início e fim baseado no período selecionado
      let dataInicio = null;
      let dataFim = null;
      
      if (periodo === 'total') {
        // Sem filtro de data para total
        dataInicio = null;
        dataFim = null;
      } else if (periodo === 'semanal') {
        if (subPeriodo) {
          // Dia específico da semana
          dataInicio = new Date(subPeriodo);
          dataInicio.setHours(0, 0, 0, 0);
          dataFim = new Date(subPeriodo);
          dataFim.setHours(23, 59, 59, 999);
        } else {
          // Semana atual ou próxima
          dataInicio = new Date(hoje);
          
          if (semanaOpcao === 'proxima') {
            // Próxima semana
            dataInicio.setDate(hoje.getDate() + 7 - hoje.getDay()); // Próximo domingo
          } else {
            // Semana atual
            dataInicio.setDate(hoje.getDate() - hoje.getDay()); // Domingo atual
          }
          
          dataInicio.setHours(0, 0, 0, 0);
          dataFim = new Date(dataInicio);
          dataFim.setDate(dataInicio.getDate() + 6); // Sábado
          dataFim.setHours(23, 59, 59, 999);
        }
      } else if (periodo === 'mensal') {
        // Mês selecionado
        dataInicio = new Date(mesAno.getFullYear(), mesAno.getMonth(), 1);
        dataFim = new Date(mesAno.getFullYear(), mesAno.getMonth() + 1, 0);
        dataFim.setHours(23, 59, 59, 999);
      }

      // Filtrar dados por período
      const agendamentosPeriodo = dataInicio ? agendamentos.filter(a => {
        const data = new Date(a.data_agendamento);
        return data >= dataInicio && data <= dataFim;
      }).length : agendamentos.length;

      const fechamentosPeriodo = dataInicio ? agendamentos.filter(a => {
        const data = new Date(a.data_agendamento);
        return a.status === 'fechado' && data >= dataInicio && data <= dataFim;
      }).length : agendamentos.filter(a => a.status === 'fechado').length;

      const novosLeadsPeriodo = dataInicio ? indicacoes.filter(p => {
        const data = new Date(p.created_at);
        return data >= dataInicio && data <= dataFim;
      }).length : indicacoes.length;

      // Calcular estatísticas por dia da semana (apenas para visualização semanal)
      let estatisticasPorDia = {};
      if (periodo === 'semanal' && !subPeriodo) {
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        
        for (let i = 0; i < 7; i++) {
          const diaData = new Date(dataInicio);
          diaData.setDate(dataInicio.getDate() + i);
          const diaStr = diaData.toISOString().split('T')[0];
          
          estatisticasPorDia[diasSemana[i]] = {
            data: diaData,
            agendamentos: agendamentos.filter(a => a.data_agendamento === diaStr).length
          };
        }
      }



      // Calcular comissões
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();
      
      let comissaoTotalMes = 0;
      let comissaoTotalGeral = 0;

      // Inicializar mapa de consultores com TODOS os consultores
      const consultoresMap = {};
      consultores.forEach(c => {
        consultoresMap[c.nome] = {
          nome: c.nome,
          totalIndicacoes: 0,
          totalAgendamentos: 0,
          totalFechamentos: 0,
          valorFechado: 0,
          valorFechadoMes: 0,
          comissaoTotal: 0,
          comissaoMes: 0
        };
      });

      // Atualizar estatísticas dos consultores
      indicacoes.forEach(p => {
        if (p.consultor_nome && consultoresMap[p.consultor_nome]) {
          consultoresMap[p.consultor_nome].totalIndicacoes++;
        }
      });

      agendamentos.forEach(a => {
        if (a.consultor_nome && consultoresMap[a.consultor_nome]) {
          consultoresMap[a.consultor_nome].totalAgendamentos++;
        }
      });

      // Calcular fechamentos baseado em agendamentos com status "fechado"
      const agendamentosFechados = agendamentos.filter(a => a.status === 'fechado') || [];
      const valorTotal = (agendamentosFechados.length || 0) * 5000; // R$ 5.000 por fechamento
      
      agendamentosFechados.forEach(a => {
        if (a.consultor_nome && consultoresMap[a.consultor_nome]) {
          consultoresMap[a.consultor_nome].totalFechamentos++;
          consultoresMap[a.consultor_nome].valorFechado += 5000; // R$ 5.000 por fechamento
          
          const comissao = calcularComissao(); // R$ 5.000 por fechamento
          consultoresMap[a.consultor_nome].comissaoTotal += comissao;
          comissaoTotalGeral += comissao;

          // Verificar se é do mês atual
          const dataFechamento = new Date(a.data_agendamento);
          if (dataFechamento.getMonth() === mesAtual && dataFechamento.getFullYear() === anoAtual) {
            consultoresMap[a.consultor_nome].valorFechadoMes += 5000;
            consultoresMap[a.consultor_nome].comissaoMes += comissao;
            comissaoTotalMes += comissao;
          }
        }
      });

      const consultoresStats = Object.values(consultoresMap);

      setStats({
        totalIndicacoes: indicacoes.length || 0,
        totalAgendamentos: agendamentos.length || 0,
        totalFechamentos: agendamentosFechados.length || 0,
        valorTotalFechamentos: valorTotal || 0,
        agendamentosHoje: agendamentosHoje || 0,
        leadsPorStatus: leadsPorStatus || {},
        consultoresStats: consultoresStats || [],
        comissaoTotalMes: comissaoTotalMes || 0,
        comissaoTotalGeral: comissaoTotalGeral || 0,
        agendamentosPeriodo: agendamentosPeriodo || 0,
        fechamentosPeriodo: fechamentosPeriodo || 0,
        valorPeriodo: valorTotal || 0,
        novosLeadsPeriodo: novosLeadsPeriodo || 0,
        estatisticasPorDia: estatisticasPorDia || {}
      });
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setLoading(false);
    }
  };



  const formatCurrency = (value) => {
    if (value === undefined || value === null) {
      return 'R$ 0,00';
    }
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatCurrencyCompact = (value) => {
    if (value === undefined || value === null) {
      return 'R$ 0';
    }
    const numValue = Number(value);
    if (numValue >= 1000000) {
      return `R$ ${(numValue / 1000000).toFixed(1).replace('.', ',')}M`;
    } else if (numValue >= 1000) {
      return `R$ ${(numValue / 1000).toFixed(0)}k`;
    } else {
      return numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
  };

  const formatarMesAno = (data) => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${meses[data.getMonth()]} ${data.getFullYear()}`;
  };

  const navegarMes = (direcao) => {
    const novoMes = new Date(mesAno);
    novoMes.setMonth(mesAno.getMonth() + direcao);
    setMesAno(novoMes);
  };

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const obterPeriodoTexto = () => {
    let textoBase = '';
    
    if (periodo === 'total') {
      textoBase = 'Todos os dados';
    } else if (periodo === 'semanal') {
      if (subPeriodo) {
        const data = new Date(subPeriodo);
        textoBase = `${diasSemana[data.getDay()]}, ${data.toLocaleDateString('pt-BR')}`;
      } else {
        textoBase = semanaOpcao === 'proxima' ? 'Próxima semana' : 'Semana atual';
      }
    } else if (periodo === 'mensal') {
      textoBase = formatarMesAno(mesAno);
    }



    return textoBase;
  };

  const getStatusColor = (status) => {
    const colors = {
      lead: '#0ea5e9',
      agendado: '#3b82f6',
      compareceu: '#0891b2',
      fechado: '#000064',
      nao_fechou: '#6366f1',
      nao_compareceu: '#8b5cf6',
      reagendado: '#1e40af',
      nao_passou_cpf: '#4f46e5'
    };
    return colors[status] || '#64748b';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Bem-vindo, {user?.nome}
        </p>
      </div>

      {/* Filtro de Período */}
      <div style={{ 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            Visualizar por:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => { setPeriodo('total'); setSubPeriodo(null); }}
              className={`btn ${periodo === 'total' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Total
            </button>
            <button
              onClick={() => { setPeriodo('semanal'); setSubPeriodo(null); }}
              className={`btn ${periodo === 'semanal' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Semanal
            </button>
            <button
              onClick={() => { setPeriodo('mensal'); setSubPeriodo(null); }}
              className={`btn ${periodo === 'mensal' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Mensal
            </button>
          </div>
        </div>

        {/* Controles específicos por período */}
        {periodo === 'semanal' && (
          <div style={{ 
            paddingTop: '1rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            {/* Seleção de semana atual/próxima */}
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', marginRight: '0.5rem' }}>
                Período:
              </span>
              <button
                onClick={() => { setSemanaOpcao('atual'); setSubPeriodo(null); }}
                className={`btn ${semanaOpcao === 'atual' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
              >
                Semana Atual
              </button>
              <button
                onClick={() => { setSemanaOpcao('proxima'); setSubPeriodo(null); }}
                className={`btn ${semanaOpcao === 'proxima' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
              >
                Próxima Semana
              </button>
            </div>

            {/* Filtrar por dia específico */}
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', marginRight: '0.5rem' }}>
                Filtrar por dia:
              </span>
              <button
                onClick={() => setSubPeriodo(null)}
                className={`btn ${!subPeriodo ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
              >
                Semana Completa
              </button>
              {Object.entries(stats.estatisticasPorDia).map(([dia, dados]) => (
                <button
                  key={dia}
                  onClick={() => setSubPeriodo(dados.data)}
                  className={`btn ${subPeriodo && new Date(subPeriodo).getDay() === dados.data.getDay() ? 
                    'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>
        )}

        {periodo === 'mensal' && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => navegarMes(-1)}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            
            <span style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#1a1d23',
              minWidth: '200px',
              textAlign: 'center'
            }}>
              {formatarMesAno(mesAno)}
            </span>
            
            <button
              onClick={() => navegarMes(1)}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}


      </div>

      {/* Estatísticas detalhadas por dia (apenas no modo semanal) */}
      {periodo === 'semanal' && !subPeriodo && Object.keys(stats.estatisticasPorDia).length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1d23', marginBottom: '1rem' }}>
            Detalhamento por Dia da Semana
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '0.75rem' 
          }}>
            {Object.entries(stats.estatisticasPorDia).map(([dia, dados]) => (
              <div 
                key={dia}
                className="stat-card"
                style={{ 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }
                }}
                onClick={() => setSubPeriodo(dados.data)}
              >
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#1a1d23',
                  marginBottom: '0.5rem'
                }}>
                  {dia}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280',
                  marginBottom: '0.75rem'
                }}>
                  {dados.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.25rem',
                  fontSize: '0.75rem'
                }}>
                  <div style={{ color: '#2563eb' }}>
                    <strong>{dados.agendamentos}</strong> visit.
                  </div>
                  <div style={{ color: '#10b981' }}>

                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                    {formatCurrency(dados.valor)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs do Período - Apenas quando não é Total */}
      {periodo !== 'total' && (
        <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#000064', marginBottom: '1rem' }}>
          Resumo do Período - {obterPeriodoTexto()}
        </h3>
          <div className="stats-grid">
            <div className="stat-card" style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
              <div className="stat-label">Novos Leads</div>
              <div className="stat-value" style={{ color: '#0ea5e9' }}>{stats.novosLeadsPeriodo}</div>
              <div className="stat-subtitle" style={{ color: '#0284c7' }}>
                No período selecionado
              </div>
            </div>

            <div className="stat-card" style={{ backgroundColor: '#dbeafe', border: '1px solid #3b82f6' }}>
              <div className="stat-label">Visitas</div>
              <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.agendamentosPeriodo}</div>
              <div className="stat-subtitle" style={{ color: '#1d4ed8' }}>
                No período selecionado
              </div>
            </div>

            <div className="stat-card" style={{ backgroundColor: '#e0e7ff', border: '1px solid #6366f1' }}>
              <div className="stat-label">Fechamentos</div>
              <div className="stat-value" style={{ color: '#6366f1' }}>{stats.fechamentosPeriodo}</div>
              <div className="stat-subtitle" style={{ color: '#4f46e5' }}>
                No período selecionado
              </div>
            </div>



            <div className="stat-card" style={{ backgroundColor: '#f8fafc', border: '1px solid #000064' }}>
              <div className="stat-label">Valor Fechado</div>
              <div className="stat-value" style={{ color: '#000064' }}>{formatCurrency(stats.valorPeriodo)}</div>
              <div className="stat-subtitle" style={{ color: '#1e40af' }}>
                No período selecionado
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs Principais */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#000064', marginBottom: '1rem' }}>
          Totais Gerais
        </h3>
        <div className="stats-grid">
          <div className="stat-card" style={{ backgroundColor: '#e0f2fe', border: '1px solid #0891b2' }}>
            <div className="stat-label">Total de Indicações</div>
            <div className="stat-value" style={{ color: '#0891b2' }}>{stats.totalIndicacoes}</div>
            <div className="stat-change positive" style={{ color: '#0891b2' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              +12% este mês
            </div>
          </div>

          <div className="stat-card" style={{ backgroundColor: '#dbeafe', border: '1px solid #3b82f6' }}>
            <div className="stat-label">Visitas</div>
            <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.totalAgendamentos}</div>
            <div className="stat-change positive" style={{ color: '#3b82f6' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              {stats.agendamentosHoje} hoje
            </div>
          </div>

          <div className="stat-card" style={{ backgroundColor: '#e0e7ff', border: '1px solid #6366f1' }}>
            <div className="stat-label">Fechamentos</div>
            <div className="stat-value" style={{ color: '#6366f1' }}>{stats.totalFechamentos}</div>
            <div className="stat-change positive" style={{ color: '#6366f1' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              R$ 5.000 cada
            </div>
          </div>



          <div className="stat-card" style={{ backgroundColor: '#f0f9ff', border: '1px solid #000064' }}>
            <div className="stat-label">Valor Total</div>
            <div className="stat-value" style={{ color: '#000064' }}>{formatCurrency(stats.valorTotalFechamentos)}</div>
            <div className="stat-change positive" style={{ color: '#000064' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              +15% este mês
            </div>
          </div>
        </div>
      </div>

      {/* Card de Crédito */}
      <div className="stats-grid" style={{ marginTop: '2rem', gridTemplateColumns: '1fr' }}>
        <div className="stat-card" style={{ backgroundColor: '#dbeafe', border: '1px solid #3b82f6' }}>
          <div className="stat-label">Crédito Total</div>
          <div className="stat-value" style={{ color: '#000064' }}>
            {formatCurrency(stats.comissaoTotalGeral)}
          </div>
          <div className="stat-subtitle" style={{ color: '#1e40af' }}>
            Créditos acumulados
          </div>
        </div>
      </div>



      <div className="grid grid-2" style={{ gap: '2rem' }}>
        {/* Pipeline de Vendas */}
        <div className="card" style={{ minWidth: 0 }}>
          <div className="card-header">
            <h2 className="card-title">Pipeline de Vendas</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(stats.leadsPorStatus).map(([status, count]) => {
                const total = stats.totalIndicacoes || 1;
                const percentage = (count / total) * 100;
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>
                        {status.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: getStatusColor(status),
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ranking por indicações */}
        <div className="card" style={{ minWidth: 0 }}>
          <div className="card-header">
            <h2 className="card-title">🏆 Ranking por Indicações</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              Classificação por valor fechado
            </p>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(() => {
                // Ordenar consultores e calcular posições
                const consultoresOrdenados = [...stats.consultoresStats]
                  .sort((a, b) => b.valorFechado - a.valorFechado);
                
                let posicaoAtual = 0;
                const consultoresComPosicao = consultoresOrdenados.map((consultor) => {
                  const temAtividade = consultor.valorFechado > 0 || 
                                      consultor.totalAgendamentos > 0 || 
                                      consultor.totalIndicacoes > 0;
                  if (temAtividade) {
                    posicaoAtual++;
                    return { ...consultor, posicao: posicaoAtual, temAtividade };
                  }
                  return { ...consultor, posicao: null, temAtividade };
                });

                // Separar ativos e inativos
                const consultoresAtivos = consultoresComPosicao.filter(c => c.temAtividade);
                const consultoresInativos = consultoresComPosicao.filter(c => !c.temAtividade);

                return (
                  <>
                    {/* Top 3 em destaque */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '1rem',
                      marginBottom: '2rem'
                    }}>
                      {consultoresAtivos.slice(0, 3).map((consultor, idx) => (
                        <div 
                          key={idx}
                          style={{
                            padding: '1.5rem',
                            borderRadius: '16px',
                            background: idx === 0 ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' :
                                       idx === 1 ? 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)' :
                                                  'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
                            border: '2px solid',
                            borderColor: idx === 0 ? '#fbbf24' :
                                        idx === 1 ? '#9ca3af' : '#fb923c',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Medalha */}
                          <div style={{ 
                            fontSize: '3rem', 
                            marginBottom: '0.5rem' 
                          }}>
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                          </div>
                          
                          {/* Nome */}
                          <h3 style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: '700',
                            marginBottom: '0.5rem',
                            color: '#1e293b'
                          }}>
                            {consultor.nome}
                          </h3>
                          
                          {/* Posição */}
                          <div style={{ 
                            fontSize: '0.875rem', 
                            color: '#64748b',
                            marginBottom: '1rem'
                          }}>
                            {idx === 0 ? '👑 Líder do Ranking' :
                             idx === 1 ? '⭐ Vice-líder' : 
                                        '🌟 3º Lugar'}
                          </div>

                          {/* Estatísticas */}
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '0.5rem',
                            marginBottom: '1rem'
                          }}>
                            <div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                {consultor.totalIndicacoes}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Indicações
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3b82f6' }}>
                                {consultor.totalAgendamentos}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Visitas
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
                                {consultor.totalFechamentos}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Fechamentos
                              </div>
                            </div>

                          </div>

                          {/* Valores */}
                          <div style={{ 
                            padding: '1rem', 
                            background: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '12px',
                            marginTop: '1rem'
                          }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                              {formatCurrency(consultor.valorFechado)}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              Crédito: {formatCurrency(consultor.comissaoTotal)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                                {/* Restante dos corretores */}
            {consultoresAtivos.length > 3 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600', 
                          color: '#1e293b',
                          marginBottom: '1rem'
                        }}>
                          Demais Posições
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {consultoresAtivos.slice(3).map((consultor, idx) => (
                            <div 
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem',
                                background: '#ffffff',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                gap: '1rem'
                              }}
                            >
                              <div style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: '600',
                                color: '#6b7280',
                                minWidth: '50px'
                              }}>
                                {consultor.posicao}º
                              </div>
                              
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600' }}>{consultor.nome}</div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                  {consultor.posicao}ª posição
                                </div>
                              </div>

                              <div style={{ 
                                display: 'flex', 
                                gap: '2rem',
                                fontSize: '0.875rem'
                              }}>
                                <div style={{ textAlign: 'center' }}>
                                                  <div style={{ fontWeight: '600' }}>{consultor.totalIndicacoes}</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>indicações</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontWeight: '600', color: '#3b82f6' }}>{consultor.totalAgendamentos}</div>
                                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>visitas</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontWeight: '600', color: '#10b981' }}>{consultor.totalFechamentos}</div>
                                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>fechamentos</div>
                                </div>

                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '700', color: '#059669' }}>
                                  {formatCurrency(consultor.valorFechado)}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                  Crédito: {formatCurrency(consultor.comissaoTotal)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                                {/* Corretores inativos */}
            {consultoresInativos.length > 0 && (
                      <div>
                        <h4 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600', 
                          color: '#6b7280',
                          marginBottom: '1rem'
                        }}>
                          💤 Aguardando Primeira Venda
                        </h4>
                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: '0.75rem'
                        }}>
                          {consultoresInativos.map((consultor, idx) => (
                            <div 
                              key={idx}
                              style={{
                                padding: '1rem',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                textAlign: 'center',
                                opacity: 0.7
                              }}
                            >
                              <div style={{ 
                                fontSize: '1.5rem', 
                                marginBottom: '0.5rem' 
                              }}>
                                ⭕
          </div>
                              <div style={{ fontWeight: '600', color: '#64748b' }}>
                                {consultor.nome}
                              </div>
                              <div style={{ 
                                fontSize: '0.75rem', 
                                color: '#94a3b8',
                                marginTop: '0.25rem'
                              }}>
                                Sem vendas
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Conversão */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Taxa de Conversão do Funil</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0ea5e9' }}>
                {stats.totalIndicacoes}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Leads Totais
              </div>
            </div>

            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>

            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
                {stats.leadsPorStatus.agendado || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Agendados
              </div>
            </div>

            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>

            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0891b2' }}>
                {stats.leadsPorStatus.compareceu || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Compareceram
              </div>
            </div>

            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>

            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#000064' }}>
                {stats.leadsPorStatus.fechado || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Fechados
              </div>
            </div>
          </div>

          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            textAlign: 'center' 
          }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#000064' }}>
              {stats.totalIndicacoes > 0
                ? ((stats.leadsPorStatus.fechado || 0) / stats.totalIndicacoes * 100).toFixed(1)
                : 0}%
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              Taxa de Conversão Total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 