import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Agendamentos = () => {
  const { makeRequest } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Estados dos filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    data_agendamento: '',
    horario: '',
    status: 'agendado',
    observacoes: ''
  });

  // Status disponíveis para visitas
  const statusOptions = [
    { value: 'agendado', label: 'Agendado', color: '#2563eb' },
    { value: 'lembrado', label: 'Lembrado', color: '#059669' },
    { value: 'compareceu', label: 'Compareceu', color: '#10b981' },
    { value: 'nao_compareceu', label: 'Não Compareceu', color: '#dc2626' },
    { value: 'fechado', label: 'Fechado', color: '#059669' },
    { value: 'nao_fechou', label: 'Não Fechou', color: '#ef4444' },
    { value: 'reagendado', label: 'Reagendado', color: '#8b5cf6' },
    { value: 'cancelado', label: 'Cancelado', color: '#6b7280' },
    { value: 'nao_passou_cpf', label: 'Não passou CPF', color: '#6366f1' },
    { value: 'aguardando_fechamento', label: 'Aguardando Fechamento', color: '#fbbf24' },
    { value: 'nao_quer_reagendar', label: 'Não quer reagendar', color: '#9ca3af' }
  ];

  useEffect(() => {
    fetchAgendamentos();
    fetchClientes();
  }, []);

  const fetchAgendamentos = async () => {
    try {
      const response = await makeRequest('/agendamentos');
      const data = await response.json();
      
      if (response.ok) {
        setAgendamentos(data);
      } else {
        console.error('Erro ao carregar visitas:', data.error);
        setMessage('Erro ao carregar visitas: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao carregar visitas:', error);
      setMessage('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await makeRequest('/clientes');
      const data = await response.json();
      
      if (response.ok) {
        setClientes(data);
      } else {
        console.error('Erro ao carregar clientes:', data.error);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingAgendamento) {
        response = await makeRequest(`/agendamentos/${editingAgendamento.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        response = await makeRequest('/agendamentos', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();
      
      if (response.ok) {
        setMessage(editingAgendamento ? 'Visita atualizada com sucesso!' : 'Visita criada com sucesso!');
        setShowModal(false);
        setEditingAgendamento(null);
        setFormData({
          cliente_id: '',
          data_agendamento: '',
          horario: '',
          status: 'agendado',
          observacoes: ''
        });
        fetchAgendamentos();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Erro ao salvar visita: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao salvar visita:', error);
      setMessage('Erro ao salvar visita');
    }
  };

  const handleEdit = (agendamento) => {
    setEditingAgendamento(agendamento);
    setFormData({
      cliente_id: agendamento.cliente_id || '',
      data_agendamento: agendamento.data_agendamento || '',
      horario: agendamento.horario || '',
      status: agendamento.status || 'agendado',
      observacoes: agendamento.observacoes || ''
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const updateStatus = async (agendamentoId, newStatus) => {
    try {
      const response = await makeRequest(`/agendamentos/${agendamentoId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Status da visita e indicação atualizados com sucesso!');
        fetchAgendamentos();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Erro ao atualizar status: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setMessage('Erro ao atualizar status');
    }
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const marcarComoLembrado = async (agendamentoId) => {
    try {
      const response = await makeRequest(`/agendamentos/${agendamentoId}/lembrado`, {
        method: 'PUT'
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Cliente marcado como lembrado!');
        fetchAgendamentos();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Erro ao marcar como lembrado: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao marcar como lembrado:', error);
      setMessage('Erro ao marcar como lembrado');
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarHorario = (horario) => {
    return horario.substring(0, 5); // Remove os segundos
  };

  const ehHoje = (data) => {
    const hoje = new Date().toISOString().split('T')[0];
    return data === hoje;
  };

  const ehPassado = (data) => {
    const hoje = new Date().toISOString().split('T')[0];
    return data < hoje;
  };

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      data_agendamento: '',
      horario: '',
      status: 'agendado',
      observacoes: ''
    });
    setEditingAgendamento(null);
    setShowModal(false);
  };

  const limparFiltros = () => {
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroStatus('');
  };

  // Aplicar filtros
  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    // Filtro por status
    const matchStatus = !filtroStatus || agendamento.status === filtroStatus;
    
    // Filtro por data
    let matchData = true;
    if (filtroDataInicio && filtroDataFim) {
      matchData = agendamento.data_agendamento >= filtroDataInicio && 
                  agendamento.data_agendamento <= filtroDataFim;
    } else if (filtroDataInicio) {
      matchData = agendamento.data_agendamento >= filtroDataInicio;
    } else if (filtroDataFim) {
      matchData = agendamento.data_agendamento <= filtroDataFim;
    }
    
    return matchStatus && matchData;
  });

  // Obter data atual para o input
  const hoje = new Date().toISOString().split('T')[0];

  // Verificar se há filtros ativos
  const temFiltrosAtivos = filtroDataInicio || filtroDataFim || filtroStatus;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gerenciar Visitas</h1>
        <p className="page-subtitle">Gerencie visitas e acompanhe o pipeline de vendas</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {/* Dashboard de Visitas */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">Agendadas</div>
          <div className="stat-value" style={{ color: '#2563eb' }}>
            {agendamentos.filter(a => a.status === 'agendado').length}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Lembradas</div>
          <div className="stat-value" style={{ color: '#059669' }}>
            {agendamentos.filter(a => a.status === 'lembrado').length}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Compareceram</div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {agendamentos.filter(a => a.status === 'compareceu').length}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Fechados</div>
          <div className="stat-value" style={{ color: '#059669' }}>
            {agendamentos.filter(a => a.status === 'fechado').length}
          </div>
        </div>
      </div>

      {/* Alerta para visitas de hoje */}
      {agendamentos.filter(a => ehHoje(a.data_agendamento)).length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
          <strong>Atenção!</strong> Você tem <strong>{agendamentos.filter(a => ehHoje(a.data_agendamento)).length}</strong> 
          visita(s) para hoje! Não se esqueça de fazer os lembretes.
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Lista de Visitas</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              style={{ position: 'relative' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 4h18M7 8h10M10 12h4M12 16h0" />
              </svg>
              Filtros
              {temFiltrosAtivos && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%'
                }} />
              )}
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Nova Visita
            </button>
          </div>
        </div>

        {/* Filtros - Só aparece quando mostrarFiltros é true */}
        {mostrarFiltros && (
          <div style={{ 
            padding: '1.5rem', 
            marginBottom: '1.5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '1rem' 
            }}>
              <h3 style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                color: '#1a1d23', 
                margin: 0
              }}>
                Filtros de Busca
              </h3>
              {temFiltrosAtivos && (
                <button 
                  onClick={limparFiltros}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                  Limpar Filtros
                </button>
              )}
            </div>
            


            <div className="grid grid-3">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Data Início</label>
                <input
                  type="date"
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Data Fim</label>
                <input
                  type="date"
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Status</label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="">Todos os status</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contador de resultados */}
            {temFiltrosAtivos && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '6px',
                color: '#4b5563',
                fontSize: '0.9rem'
              }}>
                Mostrando <strong>{agendamentosFiltrados.length}</strong> de {agendamentos.length} visita(s)
              </div>
            )}
          </div>
        )}

        {loading ? (
          <p>Carregando visitas...</p>
        ) : agendamentosFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>
            {temFiltrosAtivos 
              ? 'Nenhuma visita encontrada com os filtros aplicados.'
              : 'Nenhuma visita cadastrada ainda. Clique em "Nova Visita" para começar.'
            }
          </p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {agendamentosFiltrados.map(agendamento => {
                  const statusInfo = getStatusInfo(agendamento.status);
                  return (
                    <tr key={agendamento.id} style={{
                      backgroundColor: ehHoje(agendamento.data_agendamento) ? '#fef3c7' : 'transparent'
                    }}>
                      <td>
                        <strong>{agendamento.cliente_nome}</strong>
                        {agendamento.cliente_telefone && (
                          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                            {agendamento.cliente_telefone}
                          </div>
                        )}
                        {agendamento.observacoes && (
                          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            {agendamento.observacoes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{
                          fontWeight: ehHoje(agendamento.data_agendamento) ? 'bold' : 'normal',
                          color: ehHoje(agendamento.data_agendamento) ? '#f59e0b' : 'inherit'
                        }}>
                          {formatarData(agendamento.data_agendamento)}
                          {ehHoje(agendamento.data_agendamento) && (
                            <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                              HOJE
                            </div>
                          )}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#2563eb' }}>
                          {formatarHorario(agendamento.horario)}
                        </strong>
                      </td>
                      <td>
                        <select
                          value={agendamento.status}
                          onChange={(e) => updateStatus(agendamento.id, e.target.value)}
                          className="status-select"
                          style={{
                            backgroundColor: statusInfo.color + '10',
                            color: statusInfo.color,
                            border: `1px solid ${statusInfo.color}`
                          }}
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEdit(agendamento)}
                            className="btn-action"
                            title="Editar"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          {!agendamento.lembrado && !ehPassado(agendamento.data_agendamento) && agendamento.status === 'agendado' && (
                            <button
                              onClick={() => marcarComoLembrado(agendamento.id)}
                              className="btn-action btn-success"
                              title="Marcar como lembrado"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingAgendamento ? 'Editar Visita' : 'Nova Visita'}
              </h2>
              <button 
                className="close-btn"
                onClick={resetForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="form-group">
                <label className="form-label">Cliente *</label>
                <select
                  name="cliente_id"
                  className="form-select"
                  value={formData.cliente_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome} {cliente.telefone && `- ${cliente.telefone}`}
                    </option>
                  ))}
                </select>
                {clientes.length === 0 && (
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Nenhum cliente cadastrado. Cadastre um cliente primeiro.
                  </p>
                )}
              </div>



              <div className="grid grid-3">
                <div className="form-group">
                  <label className="form-label">Data da Visita *</label>
                  <input
                    type="date"
                    name="data_agendamento"
                    className="form-input"
                    value={formData.data_agendamento}
                    onChange={handleInputChange}
                    min={hoje}
                    required
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Horário *</label>
                  <input
                    type="time"
                    name="horario"
                    className="form-input"
                    value={formData.horario}
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea
                  name="observacoes"
                  className="form-textarea"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  placeholder="Informações adicionais sobre a visita..."
                  rows="3"
                  autoComplete="off"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingAgendamento ? 'Atualizar Visita' : 'Criar Visita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agendamentos; 