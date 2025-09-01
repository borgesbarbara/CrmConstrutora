import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    return savedToken && savedToken !== 'null' && savedToken.trim() !== '' ? savedToken : null;
  });

  const API_BASE_URL = config.api.baseUrl;

  const clearAllData = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const makeRequest = async (url, options = {}) => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const currentToken = localStorage.getItem('token');
    if (currentToken && currentToken !== 'null' && currentToken.trim() !== '') {
      headers.Authorization = `Bearer ${currentToken}`;
    }

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers
      });

      if (response.status === 401) {
        logout();
        throw new Error('Sessão expirada');
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, senha) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      const contentType = response.headers.get('content-type');
      let data;
      
      try {
        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text();
          throw new Error('Servidor retornou resposta inválida');
        }
        
        data = await response.json();
      } catch (jsonError) {
        const textResponse = await response.text();
        throw new Error('Erro ao processar resposta do servidor');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro no login');
      }

      const { token: newToken, usuario } = data;
      
      if (!newToken || !usuario) {
        throw new Error('Resposta incompleta do servidor');
      }
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(usuario));
      setToken(newToken);
      setUser(usuario);

      return { success: true, user: usuario };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    clearAllData();
  };

  const verifyToken = async () => {
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken || currentToken === 'null' || currentToken.trim() === '') {
      console.log('Nenhum token válido encontrado - redirecionando para login');
      clearAllData();
      setLoading(false);
      return;
    }

    console.log('Verificando token...');
    try {
      const response = await makeRequest('/auth/verify-token');
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('Token válido - usuário autenticado:', data.usuario.nome || data.usuario.email);
          setUser(data.usuario);
          setToken(currentToken);
          localStorage.setItem('user', JSON.stringify(data.usuario));
        } catch (jsonError) {
          console.error('❌ Erro ao fazer parse do JSON no verify-token:', jsonError);
          clearAllData();
        }
      } else {
        console.log('Token inválido - fazendo logout');
        clearAllData();
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      clearAllData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Iniciando verificação de autenticação...');
    
    // Verificar se há dados corrompidos e limpar se necessário
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      console.log('📊 Estado inicial:', { 
        hasUser: !!savedUser, 
        hasToken: !!savedToken,
        tokenState: !!token 
      });

      // Se há dados inconsistentes, limpar tudo
      if ((savedUser && !savedToken) || (!savedUser && savedToken)) {
        console.log('⚠️ Dados inconsistentes no localStorage - limpando');
        clearAllData();
        setLoading(false);
        return;
      }
      
      // Se há usuário salvo mas token é inválido
      if (savedUser && savedToken && (!token || token.trim() === '' || token === 'null')) {
        console.log('⚠️ Token inválido mas usuário salvo - limpando');
        clearAllData();
        setLoading(false);
        return;
      }
      
      // Tentar fazer parse do usuário se existir
      if (savedUser) {
        JSON.parse(savedUser);
      }
      
    } catch (error) {
      console.log('💥 Dados corrompidos no localStorage - limpando');
      clearAllData();
      setLoading(false);
      return;
    }

    // Se chegou até aqui, verificar token
    verifyToken();
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    makeRequest,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.tipo === 'admin',
    isConsultor: user?.tipo === 'consultor'
  };

  // Log do estado atual para debug
  console.log('🔍 AuthContext State:', {
    hasUser: !!user,
    hasToken: !!token,
    loading,
    isAuthenticated: !!user && !!token,
    userType: user?.tipo
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 