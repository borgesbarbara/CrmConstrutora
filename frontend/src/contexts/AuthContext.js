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

  const safeFetch = async (url, options = {}) => {
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

      const responseClone = response.clone();
      
      if (response.status === 401) {
        logout();
        throw new Error('Sessão expirada');
      }

      if (!response.ok) {
        let errorMessage = 'Erro na requisição';
        try {
          const errorData = await responseClone.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      throw error;
    }
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

      if (!response.ok) {
        let errorMessage = 'Erro na requisição';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, senha) => {
    try {
      const response = await safeFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

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
      const response = await safeFetch('/auth/verify-token');
      const data = await response.json();
      
      console.log('Token válido - usuário autenticado:', data.usuario.nome || data.usuario.email);
      setUser(data.usuario);
      setToken(currentToken);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('404')) {
        console.log('⚠️ API não disponível - mantendo dados locais temporariamente');
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setToken(currentToken);
          } catch (parseError) {
            clearAllData();
          }
        }
      } else {
        clearAllData();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Iniciando verificação de autenticação...');
    
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      console.log('📊 Estado inicial:', { 
        hasUser: !!savedUser, 
        hasToken: !!savedToken,
        tokenState: !!token 
      });

      if ((savedUser && !savedToken) || (!savedUser && savedToken)) {
        console.log('⚠️ Dados inconsistentes no localStorage - limpando');
        clearAllData();
        setLoading(false);
        return;
      }
      
      if (savedUser && savedToken && (!token || token.trim() === '' || token === 'null')) {
        console.log('⚠️ Token inválido mas usuário salvo - limpando');
        clearAllData();
        setLoading(false);
        return;
      }
      
      if (savedUser) {
        JSON.parse(savedUser);
      }
      
    } catch (error) {
      console.log('💥 Dados corrompidos no localStorage - limpando');
      clearAllData();
      setLoading(false);
      return;
    }

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