import React, { useState, useEffect, createContext, useContext } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const GOOGLE_CLIENT_ID = "711205636822-gnr5u8gumdd6n3h41kauhn6enhbt160d.apps.googleusercontent.com";

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const googleLogin = async (credentialResponse) => {
    try {
      const credential = credentialResponse.credential;
      
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const userInfo = JSON.parse(jsonPayload);
      
      const userData = {
        id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        role: 'admin'
      };
      
      const mockToken = btoa(JSON.stringify(userData));
      
      setToken(mockToken);
      setUser(userData);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(email, password);
    if (!success) {
      alert('Error de autenticación');
    }
    
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const success = await googleLogin(credentialResponse);
    if (!success) {
      alert('Error de autenticación con Google');
    }
    setLoading(false);
  };

  const handleGoogleError = () => {
    alert('Error al iniciar sesión con Google');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">IM</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">IL MANDORLA</h1>
          <p className="text-gray-600 mb-1">Dashboard Administrativo</p>
          <p className="text-sm text-orange-600 font-medium">Sistema KUMIA Elite</p>
        </div>

        <div className="mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            locale="es"
            useOneTap={false}
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O continúa con</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
              placeholder="admin@ilmandorla.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Sistema KUMIA ELITE - Versión 2.0
          </p>
        </div>
      </div>
    </div>
  );
};

// Metrics Card Component
const MetricsCard = ({ title, value, icon, color, trend, onClick, loading = false }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-102 ${loading ? 'animate-pulse' : ''}`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-3">{icon}</span>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        <p className={`text-3xl font-bold ${color} mb-1`}>
          {loading ? '...' : value}
        </p>
        {trend && (
          <p className={`text-sm flex items-center ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-1">{trend.positive ? '↗' : '↘'}</span>
            {trend.percentage}% vs mes anterior
          </p>
        )}
      </div>
    </div>
  </div>
);

// ROI Viewer Panel
const ROIViewer = () => {
  const [roiData, setRoiData] = useState({
    monthlyIncrease: 4.3,
    averageTicket: { before: 2500, after: 3200 },
    attributedRevenue: 145000,
    channelRevenue: {
      whatsapp: 45000,
      instagram: 32000,
      tiktok: 28000,
      web: 40000
    }
  });

  return (
    <div id="roi_viewer_panel" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">📊 ROI Viewer</h2>
        <button className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
          Retorno +{roiData.monthlyIncrease}x
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <div className="text-sm text-green-700 font-medium mb-1">Ticket Promedio</div>
          <div className="text-2xl font-bold text-green-800">
            ${roiData.averageTicket.after.toLocaleString()}
          </div>
          <div className="text-xs text-green-600">
            +{((roiData.averageTicket.after - roiData.averageTicket.before) / roiData.averageTicket.before * 100).toFixed(1)}% vs antes
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-sm text-blue-700 font-medium mb-1">Ingresos Atribuidos</div>
          <div className="text-2xl font-bold text-blue-800">
            ${roiData.attributedRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-blue-600">Este mes</div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="text-sm text-purple-700 font-medium mb-1">Canal Top</div>
          <div className="text-2xl font-bold text-purple-800">
            WhatsApp
          </div>
          <div className="text-xs text-purple-600">
            ${roiData.channelRevenue.whatsapp.toLocaleString()}
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="text-sm text-orange-700 font-medium mb-1">Crecimiento</div>
          <div className="text-2xl font-bold text-orange-800">
            +{roiData.monthlyIncrease}x
          </div>
          <div className="text-xs text-orange-600">ROI mensual</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">🤖</span>
          <span className="text-sm font-medium text-gray-700">Análisis IA</span>
        </div>
        <p className="text-sm text-gray-600">
          Tu retorno estimado es <strong>+{roiData.monthlyIncrease}x</strong> en los últimos 30 días. 
          El canal WhatsApp está generando el mayor impacto con ${roiData.channelRevenue.whatsapp.toLocaleString()} en ingresos atribuidos.
        </p>
      </div>
    </div>
  );
};

// Dashboard Summary Section
const DashboardSummary = ({ metrics }) => {
  const [aiRecommendation, setAiRecommendation] = useState("Activar campaña de NFTs para clientes recurrentes puede incrementar retención en 23%");

  return (
    <div id="dashboard_summary" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">📈 Dashboard General</h2>
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105">
          Expandir KUMIA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <MetricsCard
          title="Clientes Únicos"
          value={metrics.total_customers || 0}
          icon="👥"
          color="text-blue-600"
          trend={{ positive: true, percentage: 15.2 }}
        />
        <MetricsCard
          title="Feedback Recibido"
          value={metrics.total_feedback || 0}
          icon="💬"
          color="text-green-600"
          trend={{ positive: true, percentage: 8.7 }}
        />
        <MetricsCard
          title="NFTs Entregados"
          value={metrics.nfts_delivered || 0}
          icon="🎁"
          color="text-purple-600"
          trend={{ positive: true, percentage: 12.3 }}
        />
        <MetricsCard
          title="Puntos Activos"
          value={metrics.total_points_delivered || 0}
          icon="⭐"
          color="text-yellow-600"
          trend={{ positive: true, percentage: 18.5 }}
        />
        <MetricsCard
          title="Ingresos Atribuidos"
          value={`$${(metrics.total_revenue || 0).toLocaleString()}`}
          icon="💰"
          color="text-green-600"
          trend={{ positive: true, percentage: 22.1 }}
        />
        <MetricsCard
          title="Rating Promedio"
          value={`${(metrics.avg_rating || 0).toFixed(1)}/5`}
          icon="⭐"
          color="text-orange-600"
          trend={{ positive: true, percentage: 4.2 }}
        />
        <MetricsCard
          title="Conversiones IA"
          value={metrics.ai_conversions || 0}
          icon="🤖"
          color="text-indigo-600"
          trend={{ positive: true, percentage: 28.9 }}
        />
        <MetricsCard
          title="Audiencia Total"
          value={metrics.total_audience || 0}
          icon="📈"
          color="text-rose-600"
          trend={{ positive: true, percentage: 11.4 }}
        />
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">🤖</span>
          <h3 className="text-lg font-bold text-indigo-800">IA te recomienda</h3>
        </div>
        <p className="text-indigo-700 mb-4">{aiRecommendation}</p>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200">
          Aplicar Recomendación
        </button>
      </div>
    </div>
  );
};

// Clients Section
const ClientsSection = () => {
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState('all');

  const clientFilters = [
    { id: 'all', label: 'Todos', color: 'bg-gray-100' },
    { id: 'ambassador', label: 'Embajador', color: 'bg-purple-100' },
    { id: 'recurrent', label: 'Recurrente', color: 'bg-green-100' },
    { id: 'new', label: 'Nuevo', color: 'bg-blue-100' },
    { id: 'inactive', label: 'Inactivo', color: 'bg-red-100' }
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const ClientCard = ({ client }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center mr-4">
            <span className="text-white font-bold text-lg">{client.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{client.name}</h3>
            <p className="text-sm text-gray-600">{client.email}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          client.nft_level === 'citizen_kumia' ? 'bg-purple-100 text-purple-800' :
          client.nft_level === 'oro' ? 'bg-yellow-100 text-yellow-800' :
          client.nft_level === 'plata' ? 'bg-gray-100 text-gray-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {client.nft_level}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{client.visit_count || 0}</div>
          <div className="text-xs text-gray-600">Visitas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{client.points || 0}</div>
          <div className="text-xs text-gray-600">Puntos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{client.total_spent || 0}</div>
          <div className="text-xs text-gray-600">Total $</div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button className="flex-1 bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-sm hover:bg-orange-200 transition-colors">
          Recompensar
        </button>
        <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors">
          Historial
        </button>
        <button className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-200 transition-colors">
          Activar NFT
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">👥 Clientes</h2>
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200">
          Nuevo Cliente
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {clientFilters.map(filterItem => (
          <button
            key={filterItem.id}
            onClick={() => setFilter(filterItem.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === filterItem.id 
                ? 'bg-orange-500 text-white' 
                : `${filterItem.color} text-gray-700 hover:opacity-80`
            }`}
          >
            {filterItem.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/metrics`);
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📈' },
    { id: 'clients', label: 'Clientes', icon: '👥' },
    { id: 'feedback', label: 'Feedback', icon: '💬' },
    { id: 'reservations', label: 'Reservas', icon: '📅' },
    { id: 'ai-agents', label: 'Agentes IA', icon: '🤖' },
    { id: 'rewards', label: 'Recompensas', icon: '🎁' },
    { id: 'roi-viewer', label: 'ROI Viewer', icon: '📊' },
    { id: 'integrations', label: 'Integraciones', icon: '🔗' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardSummary metrics={metrics} />;
      case 'clients':
        return <ClientsSection />;
      case 'roi-viewer':
        return <ROIViewer />;
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Módulo en construcción</h3>
            <p className="text-gray-600">Esta sección estará disponible pronto</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-bold text-lg">IM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">IL MANDORLA</h1>
                <p className="text-sm text-gray-600">Sistema KUMIA Elite</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user?.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-105"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* CTA Global */}
          <div className="p-4 mt-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
              <h3 className="font-bold mb-2">🚀 Expandir KUMIA</h3>
              <p className="text-sm mb-3 opacity-90">Refiere a un colega o abre otra sede</p>
              <button className="w-full bg-white text-purple-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                Referir Ahora
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <div className="App">
          <AuthWrapper />
        </div>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

const AuthWrapper = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <Dashboard /> : <Login />;
};

export default App;