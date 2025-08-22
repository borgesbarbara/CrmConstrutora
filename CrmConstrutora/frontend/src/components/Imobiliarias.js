import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Imobiliarias = () => {
  const { makeRequest, user } = useAuth();
  const [imobiliarias, setClinicas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClinica, setEditingClinica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCity, setFiltroCity] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingClinica, setViewingClinica] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    nicho: '',
    telefone: '',
    email: '',
    status: 'ativo'
  });

  // Verificar se usuário é corretor
  const isConsultor = user?.tipo === 'consultor';

  // Estados brasileiros
  const estadosBrasileiros = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
  ];

  // Principais cidades por estado (sample - pode expandir)
  const cidadesPorEstado = {
    'SP': ['São Paulo', 'Campinas', 'Santos', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Ribeirão Preto', 'Sorocaba'],
    'RJ': ['Rio de Janeiro', 'Niterói', 'Nova Iguaçu', 'Duque de Caxias', 'Campos dos Goytacazes', 'Petrópolis', 'Volta Redonda'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves'],
    'ES': ['Vitória', 'Serra', 'Vila Velha', 'Cariacica', 'Linhares', 'Cachoeiro de Itapemirim', 'Colatina'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão'],
    'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Chapecó', 'Itajaí'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Ilhéus', 'Itabuna'],
    'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás'],
    'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho'],
    'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca'],
    'DF': ['Brasília', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Planaltina', 'Águas Claras', 'Guará'],
    'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Cáceres', 'Barra do Garças'],
    'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Aquidauana', 'Naviraí'],
    'AL': ['Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'União dos Palmares', 'Penedo'],
    'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'Estância', 'Tobias Barreto'],
    'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cajazeiras'],
    'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim'],
    'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Campo Maior', 'Barras'],
    'MA': ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Codó', 'Paço do Lumiar'],
    'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins'],
    'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Brasileia'],
    'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura'],
    'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí', 'Cantá'],
    'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão', 'Porto Grande'],
    'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tefé', 'Tabatinga'],
    'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal', 'Abaetetuba']
   };

  useEffect(() => {
    fetchClinicas();
  }, []);

  const fetchClinicas = async () => {
    try {
      const response = await makeRequest('/imobiliarias');
      const data = await response.json();
      
      if (response.ok) {
        setClinicas(data);
      } else {
        console.error('Erro ao carregar empreendimentos:', data.error);
        setMessage('Erro ao carregar empreendimentos: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao carregar empreendimentos:', error);
      setMessage('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingClinica) {
        response = await makeRequest(`/imobiliarias/${editingClinica.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        response = await makeRequest('/imobiliarias', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();
      
      if (response.ok) {
        setMessage(editingClinica ? 'Empreendimento atualizado com sucesso!' : 'Empreendimento cadastrado com sucesso!');
        setShowModal(false);
        setEditingClinica(null);
        setFormData({
          nome: '',
          endereco: '',
          bairro: '',
          cidade: '',
          estado: '',
          nicho: '',
          telefone: '',
          email: '',
          status: 'ativo'
        });
        fetchClinicas();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Erro ao salvar empreendimento: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao salvar empreendimento:', error);
      setMessage('Erro ao salvar empreendimento');
    }
  };

  const handleEdit = (imobiliaria) => {
    setEditingClinica(imobiliaria);
    setFormData({
      nome: imobiliaria.nome || '',
      endereco: imobiliaria.endereco || '',
      bairro: imobiliaria.bairro || '',
      cidade: imobiliaria.cidade || '',
      estado: imobiliaria.estado || '',
      nicho: imobiliaria.nicho || '',
      telefone: imobiliaria.telefone || '',
      email: imobiliaria.email || '',
      status: imobiliaria.status || 'ativo'
    });
    setShowModal(true);
  };

  const handleView = (imobiliaria) => {
    setViewingClinica(imobiliaria);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewingClinica(null);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return '';
    const numbers = telefone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
    }
    return telefone;
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      endereco: '',
      bairro: '',
      cidade: '',
      estado: '',
      nicho: '',
      telefone: '',
      email: '',
      status: 'ativo'
    });
    setEditingClinica(null);
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Limpar cidade se estado mudar
    if (name === 'estado') {
      setFormData(prev => ({
        ...prev,
        estado: value,
        cidade: '' // Limpar cidade quando estado muda
      }));
    }
  };

  const toggleStatus = async (imobiliaria) => {
    const novaStatus = imobiliaria.status === 'ativo' ? 'bloqueado' : 'ativo';
    const acao = novaStatus === 'ativo' ? 'desbloquear' : 'bloquear';
    
    if (!window.confirm(`Deseja ${acao} o empreendimento "${imobiliaria.nome}"?`)) {
      return;
    }

    // Buscar o empreendimento completo para garantir todos os campos
    const imobiliariaCompleta = imobiliarias.find(c => c.id === imobiliaria.id);
    if (!imobiliariaCompleta) {
      setMessage('Erro: empreendimento não encontrado.');
      return;
    }
    const imobiliariaParaAtualizar = { ...imobiliariaCompleta, status: novaStatus };

    try {
      const response = await makeRequest(`/imobiliarias/${imobiliaria.id}`, {
        method: 'PUT',
        body: JSON.stringify(imobiliariaParaAtualizar)
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Empreendimento ${acao}do com sucesso!`);
        fetchClinicas();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Erro ao alterar status: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setMessage('Erro ao alterar status do empreendimento');
    }
  };

  // Filtrar empreendimentos
  const imobiliariasFiltradas = imobiliarias.filter(imobiliaria => {
    const matchEstado = !filtroEstado || imobiliaria.estado === filtroEstado;
    const matchCidade = !filtroCity || imobiliaria.cidade?.toLowerCase().includes(filtroCity.toLowerCase());
    const matchStatus = !filtroStatus || imobiliaria.status === filtroStatus;
    return matchEstado && matchCidade && matchStatus;
  });

  // Obter listas únicas para filtros
  const estadosDisponiveis = [...new Set(imobiliarias
    .map(c => c.estado)
    .filter(estado => estado && estado.trim() !== '')
  )].sort();

  const cidadesDisponiveis = [...new Set(imobiliarias
    .filter(c => !filtroEstado || c.estado === filtroEstado)
    .map(c => c.cidade)
    .filter(cidade => cidade && cidade.trim() !== '')
  )].sort();

  // Obter cidades sugeridas baseadas no estado selecionado
  const cidadesSugeridas = formData.estado ? (cidadesPorEstado[formData.estado] || []) : [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isConsultor ? 'Visualizar Empreendimentos' : 'Gerenciar Empreendimentos'}</h1>
        <p className="page-subtitle">{isConsultor ? 'Visualize os empreendimentos parceiros' : 'Gerencie os empreendimentos parceiros'}</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Lista de Empreendimentos</h2>
          {!isConsultor && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Novo Empreendimento
            </button>
          )}
        </div>

        {/* Seção de Filtros */}
        <div style={{ 
          padding: '1.5rem', 
          marginBottom: '1.5rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
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
            {(filtroEstado || filtroCity || filtroStatus) && (
              <button 
                onClick={() => {
                  setFiltroEstado('');
                  setFiltroCity('');
                  setFiltroStatus('');
                }}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Limpar Filtros
              </button>
            )}
          </div>
          
          <div className="grid grid-3">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value);
                  setFiltroCity('');
                }}
                className="form-select"
              >
                <option value="">Todos os estados</option>
                {estadosDisponiveis.map(estado => {
                  const estadoInfo = estadosBrasileiros.find(e => e.sigla === estado);
                  return (
                    <option key={estado} value={estado}>
                      {estado} - {estadoInfo?.nome || estado}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Cidade</label>
              <select
                value={filtroCity}
                onChange={(e) => setFiltroCity(e.target.value)}
                className="form-select"
                disabled={!filtroEstado && cidadesDisponiveis.length > 20}
              >
                <option value="">Todas as cidades</option>
                {cidadesDisponiveis.slice(0, 50).map(cidade => (
                  <option key={cidade} value={cidade}>{cidade}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="form-select"
              >
                <option value="">Todos os empreendimentos</option>
                <option value="ativo">Desbloqueadas</option>
                <option value="bloqueado">Bloqueadas</option>
              </select>
            </div>
          </div>

          {(filtroEstado || filtroCity || filtroStatus) && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '6px',
              color: '#4b5563',
              fontSize: '0.9rem'
            }}>
              Mostrando <strong>{imobiliariasFiltradas.length}</strong> de {imobiliarias.length} empreendimento(s)
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : imobiliariasFiltradas.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            {filtroEstado || filtroCity || filtroStatus
              ? 'Nenhum empreendimento encontrado com os filtros aplicados.'
              : 'Nenhum empreendimento cadastrado ainda.'
            }
          </p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Endereço</th>
                  <th>Bairro</th>
                  <th>Cidade/Estado</th>
                  <th>Nicho</th>
                  <th>Contato</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {imobiliariasFiltradas.map(imobiliaria => (
                  <tr key={imobiliaria.id} className={imobiliaria.status === 'bloqueado' ? 'imobiliaria-bloqueada' : ''}>
                    <td>
                      <strong>{imobiliaria.nome}</strong>
                    </td>
                    <td>{imobiliaria.endereco || '-'}</td>
                    <td>{imobiliaria.bairro || '-'}</td>
                    <td>
                      {imobiliaria.cidade && imobiliaria.estado ? (
                        <span>{imobiliaria.cidade}/{imobiliaria.estado}</span>
                      ) : '-'}
                    </td>
                    <td>
                      {imobiliaria.nicho ? (
                        <span className="badge" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>
                          {imobiliaria.nicho}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      {imobiliaria.telefone && (
                        <div>{formatarTelefone(imobiliaria.telefone)}</div>
                      )}
                      {imobiliaria.email && (
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{imobiliaria.email}</div>
                      )}
                      {!imobiliaria.telefone && !imobiliaria.email && '-'}
                    </td>
                    <td>
                      <span className={`badge ${imobiliaria.status === 'ativo' ? 'badge-success' : 'badge-danger'}`}>
                        {imobiliaria.status === 'ativo' ? 'Desbloqueada' : 'Bloqueada'}
                      </span>
                    </td>
                    <td>
                      {isConsultor ? (
                        <button
                          onClick={() => handleView(imobiliaria)}
                          className="btn-action"
                          title="Visualizar"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(imobiliaria)}
                            className="btn-action"
                            title="Editar"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleStatus(imobiliaria)}
                            className="btn-action"
                            title={imobiliaria.status === 'ativo' ? 'Bloquear empreendimento' : 'Desbloquear empreendimento'}
                            style={{ marginLeft: '0.5rem' }}
                          >
                            {imobiliaria.status === 'ativo' ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <circle cx="12" cy="16" r="1"></circle>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <circle cx="12" cy="16" r="1"></circle>
                                <path d="M7 11V7a5 5 0 0 1 9.9 0"></path>
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleView(imobiliaria)}
                            className="btn-action"
                            title="Visualizar"
                            style={{ marginLeft: '0.5rem' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingClinica ? 'Editar Empreendimento' : 'Novo Empreendimento'}
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
                <label className="form-label">Nome do Empreendimento *</label>
                <input
                  type="text"
                  name="nome"
                  className="form-input"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Digite o nome do empreendimento"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Endereço (Rua e Número)</label>
                <input
                  type="text"
                  name="endereco"
                  className="form-input"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  placeholder="Ex: Rua das Flores, 123"
                />
              </div>

              <div className="grid grid-3">
                <div className="form-group">
                  <label className="form-label">Estado *</label>
                  <select
                    name="estado"
                    className="form-select"
                    value={formData.estado}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione o estado</option>
                    {estadosBrasileiros.map(estado => (
                      <option key={estado.sigla} value={estado.sigla}>
                        {estado.sigla} - {estado.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Cidade *</label>
                  {cidadesSugeridas.length > 0 && formData.cidade !== 'OUTRA' ? (
                    <select
                      name="cidade"
                      className="form-select"
                      value={formData.cidade}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione a cidade</option>
                      {cidadesSugeridas.map(cidade => (
                        <option key={cidade} value={cidade}>{cidade}</option>
                      ))}
                      <option value="OUTRA">Outra cidade</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="cidade"
                      className="form-input"
                      value={formData.cidade === 'OUTRA' ? '' : formData.cidade}
                      onChange={handleInputChange}
                      placeholder="Digite o nome da cidade"
                      disabled={!formData.estado}
                      required
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Bairro/Zona</label>
                  <input
                    type="text"
                    name="bairro"
                    className="form-input"
                    value={formData.bairro}
                    onChange={handleInputChange}
                    placeholder="Ex: Centro, Zona Sul"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nicho do Empreendimento *</label>
                <select
                  name="nicho"
                  className="form-select"
                  value={formData.nicho}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione o nicho</option>
                  <option value="Compra">Compra</option>
                  <option value="Venda">Venda</option>
                  <option value="Ambos">Ambos (Compra + Venda)</option>
                </select>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input
                    type="tel"
                    name="telefone"
                    className="form-input"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contato@imobiliaria.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status do Empreendimento</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="ativo">Desbloqueada (padrão)</option>
                  <option value="bloqueado">Bloqueada</option>
                </select>
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
                  {editingClinica ? 'Atualizar Empreendimento' : 'Cadastrar Empreendimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

             {/* Modal de Visualização */}
       {viewModalOpen && viewingClinica && (
         <div className="modal-overlay">
           <div className="modal" style={{ maxWidth: '600px' }}>
             <div className="modal-header">
               <h2 className="modal-title">
                 Detalhes do Empreendimento
               </h2>
               <button 
                 className="close-btn"
                 onClick={closeViewModal}
               >
                 ×
               </button>
             </div>
 
             <div style={{ padding: '1.5rem' }}>
               <div style={{ display: 'grid', gap: '1rem' }}>
                 <div>
                   <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Nome do Empreendimento</label>
                   <p style={{ margin: '0.25rem 0 0 0', color: '#1f2937' }}>{viewingClinica.nome}</p>
                 </div>
                 
                 {viewingClinica.endereco && (
                   <div>
                     <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Endereço</label>
                     <p style={{ margin: '0.25rem 0 0 0', color: '#1f2937' }}>{viewingClinica.endereco}</p>
                   </div>
                 )}
                 
                 {viewingClinica.bairro && (
                   <div>
                     <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Bairro</label>
                     <p style={{ margin: '0.25rem 0 0 0', color: '#1f2937' }}>{viewingClinica.bairro}</p>
                   </div>
                 )}
                 
                 {(viewingClinica.cidade || viewingClinica.estado) && (
                   <div>
                     <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Localização</label>
                     <p style={{ margin: '0.25rem 0 0 0', color: '#1f2937' }}>
                       {viewingClinica.cidade && viewingClinica.estado 
                         ? `${viewingClinica.cidade}, ${viewingClinica.estado}`
                         : viewingClinica.cidade || viewingClinica.estado
                       }
                     </p>
                   </div>
                 )}
                 
                 {viewingClinica.nicho && (
                   <div>
                     <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Nicho</label>
                     <p style={{ margin: '0.25rem 0 0 0', color: '#1f2937' }}>{viewingClinica.nicho}</p>
                   </div>
                 )}
                 
                 {viewingClinica.telefone && (
                   <div>
                     <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Telefone</label>
                     <p style={{ margin: '0.25rem 0 0 0', color: '#1f2937' }}>{formatarTelefone(viewingClinica.telefone)}</p>
                   </div>
                 )}
                 
                 {viewingClinica.email && (
                   <div>
                     <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>E-mail</label>
                     <p style={{ margin: '0.25rem 0 0 0', color: '#1f2937' }}>{viewingClinica.email}</p>
                   </div>
                 )}
                 
                 {viewingClinica.status && (
                   <div>
                     <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Status</label>
                     <p style={{ margin: '0.25rem 0 0 0', color: '#1f2937' }}>
                       <span className={`badge ${viewingClinica.status === 'ativo' ? 'badge-success' : 'badge-danger'}`}>
                         {viewingClinica.status === 'ativo' ? 'Desbloqueada' : 'Bloqueada'}
                       </span>
                     </p>
                   </div>
                 )}
                 
                 {viewingClinica.created_at && (
                   <div>
                     <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Data de Cadastro</label>
                     <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>{formatarData(viewingClinica.created_at)}</p>
                   </div>
                 )}
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                 <button 
                   type="button"
                   className="btn btn-secondary"
                   onClick={closeViewModal}
                 >
                   Fechar
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default Imobiliarias; 