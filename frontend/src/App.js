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

// Enhanced Clients Section
const ClientsSection = () => {
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);

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
            <p className="text-xs text-gray-500">
              Última visita: {new Date(client.last_visit || Date.now()).toLocaleDateString()}
            </p>
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
          <div className="text-2xl font-bold text-purple-600">{client.feedback_count || 0}</div>
          <div className="text-xs text-gray-600">Reviews</div>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 mb-1">Información Personal</div>
        <div className="text-sm">
          <p><strong>Cumpleaños:</strong> {client.birthday || 'No especificado'}</p>
          <p><strong>Alergias:</strong> {client.allergies || 'Ninguna'}</p>
          <p><strong>Fecha especial:</strong> {client.special_date || 'No especificado'}</p>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <button 
          onClick={() => handleRewardNFT(client.id)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-lg text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
        >
          🎁 Recompensar con NFT
        </button>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedClient(client)}
            className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
          >
            📊 Ver Historial
          </button>
          <button 
            onClick={() => handleContactClient(client.id)}
            className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm hover:bg-green-200 transition-colors"
          >
            📞 Contactar
          </button>
        </div>
        <button 
          onClick={() => handleActivateAutoReward(client.id)}
          className="w-full bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-sm hover:bg-orange-200 transition-colors"
        >
          ⚡ Activar Recompensa Automática
        </button>
      </div>
    </div>
  );

  const handleRewardNFT = (clientId) => {
    alert(`Recompensando con NFT al cliente ${clientId}`);
  };

  const handleContactClient = (clientId) => {
    alert(`Contactando al cliente ${clientId}`);
  };

  const handleActivateAutoReward = (clientId) => {
    alert(`Activando recompensa automática para cliente ${clientId}`);
  };

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

// Feedback Section
const FeedbackSection = () => {
  const [feedback, setFeedback] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({
    ratingDistribution: { 5: 45, 4: 32, 3: 12, 2: 8, 1: 3 },
    weeklyEvolution: [85, 92, 78, 95, 88, 96, 102],
    npsScore: 8.4,
    keywords: [
      { word: 'delicioso', count: 45, sentiment: 'positive' },
      { word: 'excelente', count: 38, sentiment: 'positive' },
      { word: 'rápido', count: 32, sentiment: 'positive' },
      { word: 'calidad', count: 28, sentiment: 'positive' },
      { word: 'espera', count: 15, sentiment: 'negative' }
    ]
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`${API}/feedback`);
      setFeedback(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const FeedbackCard = ({ rating, count, percentage }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">⭐</span>
          <span className="text-lg font-bold">{rating}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{count}</div>
          <div className="text-sm text-gray-600">{percentage}%</div>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );

  const handleRespondWithReward = (feedbackId) => {
    alert(`Respondiendo con recompensa automática al feedback ${feedbackId}`);
  };

  return (
    <div id="feedback_module" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">💬 Feedback</h2>
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200">
          Configurar Respuestas Automáticas
        </button>
      </div>

      {/* Rating Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(feedbackStats.ratingDistribution).reverse().map(([rating, count]) => (
          <FeedbackCard 
            key={rating}
            rating={rating}
            count={count}
            percentage={(count / 100) * 100}
          />
        ))}
      </div>

      {/* Weekly Evolution Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4">📈 Evolución Semanal</h3>
        <div className="flex items-end justify-between h-32">
          {feedbackStats.weeklyEvolution.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="bg-gradient-to-t from-orange-400 to-red-400 rounded-t-lg transition-all duration-500"
                style={{ height: `${(value / 120) * 100}%`, width: '20px' }}
              ></div>
              <span className="text-xs text-gray-600 mt-1">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords Cloud & AI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold mb-4">🔤 Palabras Clave IA</h3>
          <div className="flex flex-wrap gap-2">
            {feedbackStats.keywords.map(keyword => (
              <span
                key={keyword.word}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  keyword.sentiment === 'positive' 
                    ? 'bg-green-100 text-green-800' 
                    : keyword.sentiment === 'negative'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
                style={{ fontSize: `${Math.max(12, keyword.count / 3)}px` }}
              >
                {keyword.word} ({keyword.count})
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🤖</span>
            <h3 className="text-lg font-bold text-indigo-800">Análisis IA</h3>
          </div>
          <p className="text-indigo-700 mb-4">
            NPS Score: <strong>{feedbackStats.npsScore}/10</strong> (Excelente)
          </p>
          <p className="text-indigo-700 mb-4">
            Temas frecuentes: Calidad de comida (+), Velocidad de servicio (+), Tiempo de espera (-)
          </p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200">
            Ver Recomendaciones Detalladas
          </button>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4">📝 Feedback Reciente</h3>
        <div className="space-y-4">
          {feedback.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="font-medium text-gray-800">{item.customer_name}</span>
                  <div className="flex ml-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{item.comment}</p>
              </div>
              <button 
                onClick={() => handleRespondWithReward(item.id)}
                className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200 transition-colors"
              >
                Responder con Recompensa
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Reservations Section
const ReservationsSection = () => {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${API}/reservations`);
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const filterOptions = [
    { id: 'today', label: 'Hoy', icon: '📅' },
    { id: 'week', label: 'Esta semana', icon: '📆' },
    { id: 'upcoming', label: 'Próximo evento', icon: '🎉' }
  ];

  const handleConfirmReservation = (id) => {
    alert(`Confirmando reserva ${id}`);
  };

  const handleCancelReservation = (id) => {
    alert(`Cancelando reserva ${id}`);
  };

  const handleRescheduleReservation = (id) => {
    alert(`Reagendando reserva ${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">📅 Reservas</h2>
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200">
          Nueva Reserva
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(option => (
          <button
            key={option.id}
            onClick={() => setFilter(option.id)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === option.id 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4">📅 Vista Calendario</h3>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, index) => (
            <div 
              key={index}
              className={`h-10 rounded-lg border border-gray-200 flex items-center justify-center text-sm cursor-pointer hover:bg-orange-50 transition-colors ${
                index % 7 === 0 ? 'bg-orange-100' : ''
              }`}
            >
              {index % 3 === 0 ? (
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              ) : (
                <span className="text-gray-600">{((index % 31) + 1)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4">📋 Lista de Reservas</h3>
        <div className="space-y-4">
          {reservations.map((reservation, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">{reservation.customer_name?.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{reservation.customer_name}</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-4">👥 {reservation.guests} personas</span>
                      <span className="mr-4">🕒 {reservation.time}</span>
                      <span>📞 {reservation.phone}</span>
                    </div>
                  </div>
                </div>
                {reservation.special_requests && (
                  <p className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg">
                    💭 {reservation.special_requests}
                  </p>
                )}
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">
                  🤖 Este cliente cumple años el 15 de este mes
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleConfirmReservation(reservation.id)}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200 transition-colors"
                >
                  ✅ Confirmar
                </button>
                <button 
                  onClick={() => handleRescheduleReservation(reservation.id)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  🔄 Reagendar
                </button>
                <button 
                  onClick={() => handleCancelReservation(reservation.id)}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm hover:bg-red-200 transition-colors"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// AI Agents Section
const AIAgentsSection = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API}/ai-agents`);
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching AI agents:', error);
    }
  };

  const channels = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '📱', color: 'from-green-500 to-emerald-500' },
    { id: 'instagram', name: 'Instagram', icon: '📸', color: 'from-pink-500 to-rose-500' },
    { id: 'facebook', name: 'Facebook', icon: '👥', color: 'from-blue-500 to-indigo-500' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'from-purple-500 to-violet-500' }
  ];

  const AgentCard = ({ agent, channel }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 bg-gradient-to-br ${channel.color} rounded-xl flex items-center justify-center mr-4`}>
            <span className="text-white text-xl">{channel.icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{channel.name}</h3>
            <p className="text-sm text-gray-600">{agent?.name || 'Asistente IA'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {agent?.is_active && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              🟢 Activo
            </span>
          )}
          {agent?.training_active && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              🔄 Entrenando
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{agent?.total_conversations || 0}</div>
          <div className="text-xs text-gray-600">Conversaciones</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{agent?.useful_responses || 0}</div>
          <div className="text-xs text-gray-600">Respuestas Útiles</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{agent?.conversion_rate || 0}%</div>
          <div className="text-xs text-gray-600">Conversión</div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Actual</label>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            {agent?.prompt || `Eres un asistente de ${channel.name} para IL MANDORLA. Mantén un tono amigable y profesional...`}
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button 
          onClick={() => handleEditAgent(agent, channel)}
          className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
        >
          ✏️ Editar Prompt
        </button>
        <button 
          onClick={() => handleTrainAgent(agent?.id)}
          className="flex-1 bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-sm hover:bg-orange-200 transition-colors"
        >
          🎯 Entrenar
        </button>
      </div>
    </div>
  );

  const handleEditAgent = (agent, channel) => {
    setSelectedAgent({ ...agent, channel });
    setEditMode(true);
  };

  const handleTrainAgent = (agentId) => {
    alert(`Entrenando agente ${agentId}`);
  };

  const handleSaveAgent = () => {
    setEditMode(false);
    setSelectedAgent(null);
  };

  return (
    <div id="agent_training_view" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">🤖 Agentes IA</h2>
        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200">
          Configurar Nuevo Agente
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {channels.map(channel => {
          const agent = agents.find(a => a.channel === channel.id);
          return (
            <AgentCard key={channel.id} agent={agent} channel={channel} />
          );
        })}
      </div>

      {/* Training Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4">🎯 Entrenar Agente IA</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sugerencias de Prompts</label>
            <div className="space-y-2">
              {[
                'Incrementar conversiones: Menciona ofertas especiales',
                'Mejorar experiencia: Pregunta sobre preferencias',
                'Fidelizar clientes: Ofrecer programa de puntos',
                'Upselling: Sugerir complementos'
              ].map((suggestion, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="text-sm text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Métricas de Rendimiento</label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasa de Respuesta</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Satisfacción</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-sm font-medium">92%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conversiones</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="text-sm font-medium">78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Editar Agente {selectedAgent.channel}</h3>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={selectedAgent.prompt}
              onChange={(e) => setSelectedAgent({ ...selectedAgent, prompt: e.target.value })}
              placeholder="Escribe el prompt del agente..."
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button 
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveAgent}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Rewards & NFTs Section
const RewardsNFTsSection = () => {
  const [rewards, setRewards] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [weeklyRedemptions, setWeeklyRedemptions] = useState([45, 52, 38, 67, 43, 71, 59]);

  useEffect(() => {
    fetchRewards();
    fetchTopClients();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await axios.get(`${API}/nft-rewards`);
      setRewards(response.data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const fetchTopClients = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      const sortedClients = response.data.sort((a, b) => (b.points || 0) - (a.points || 0));
      setTopClients(sortedClients.slice(0, 5));
    } catch (error) {
      console.error('Error fetching top clients:', error);
    }
  };

  const NFTCard = ({ nft }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
            nft.level === 'citizen_kumia' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
            nft.level === 'oro' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
            nft.level === 'plata' ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
            'bg-gradient-to-br from-orange-500 to-red-500'
          }`}>
            <span className="text-white text-xl">🎁</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{nft.name}</h3>
            <p className="text-sm text-gray-600">{nft.level}</p>
          </div>
        </div>
        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
          {nft.points_required} pts
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4">{nft.description}</p>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Beneficios</h4>
        <div className="space-y-1">
          {Object.entries(nft.attributes || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-gray-600">{key}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <button className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-200 transition-colors">
          Editar
        </button>
        <button className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm hover:bg-green-200 transition-colors">
          Activar
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">🎁 Recompensas & NFTs</h2>
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
          Crear Nueva Campaña de Fidelización
        </button>
      </div>

      {/* Weekly Redemptions Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4">📊 Canjes Semanales</h3>
        <div className="flex items-end justify-between h-32">
          {weeklyRedemptions.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="bg-gradient-to-t from-purple-400 to-pink-400 rounded-t-lg transition-all duration-500"
                style={{ height: `${(value / 80) * 100}%`, width: '30px' }}
              ></div>
              <span className="text-xs text-gray-600 mt-1">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Clients Ranking */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4">🏆 Ranking de Clientes Más Fieles</h3>
        <div className="space-y-4">
          {topClients.map((client, index) => (
            <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-500' : 
                  'bg-gray-300'
                }`}>
                  <span className="text-white font-bold text-sm">#{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{client.name}</h4>
                  <p className="text-sm text-gray-600">{client.nft_level}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">{client.points || 0}</div>
                <div className="text-sm text-gray-600">puntos</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NFTs Grid */}
      <div>
        <h3 className="text-lg font-bold mb-4">🎯 NFTs Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map(nft => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      </div>

      {/* Create New Reward */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-bold text-purple-800 mb-4">✨ Crear Nueva Recompensa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre de la recompensa"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Seleccionar nivel</option>
            <option value="bronce">Bronce</option>
            <option value="plata">Plata</option>
            <option value="oro">Oro</option>
            <option value="citizen_kumia">Citizen KUMIA</option>
          </select>
          <input
            type="number"
            placeholder="Puntos requeridos"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Crear Recompensa
          </button>
        </div>
      </div>
    </div>
  );
};

// Integrations Section
const IntegrationsSection = () => {
  const [integrations, setIntegrations] = useState([
    { id: 'meta', name: 'Meta Business Suite', type: 'social', status: 'connected', icon: '👥' },
    { id: 'stripe', name: 'Stripe', type: 'payment', status: 'disconnected', icon: '💳' },
    { id: 'openai', name: 'OpenAI', type: 'ai', status: 'connected', icon: '🤖' },
    { id: 'n8n', name: 'n8n Automation', type: 'automation', status: 'disconnected', icon: '🔄' },
    { id: 'tiktok', name: 'TikTok Business', type: 'social', status: 'disconnected', icon: '🎵' }
  ]);

  const handleToggleIntegration = (id) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, status: integration.status === 'connected' ? 'disconnected' : 'connected' }
          : integration
      )
    );
  };

  const IntegrationCard = ({ integration }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
            <span className="text-2xl">{integration.icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{integration.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{integration.type}</p>
          </div>
        </div>
        <button
          onClick={() => handleToggleIntegration(integration.id)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            integration.status === 'connected' ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              integration.status === 'connected' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            integration.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium">
            {integration.status === 'connected' ? '🟢 Conectado' : '🔴 Desconectado'}
          </span>
        </div>
        <p className="text-xs text-gray-600">
          {integration.status === 'connected' 
            ? 'Integración activa y funcionando correctamente' 
            : 'Configurar credenciales para activar'}
        </p>
      </div>

      {integration.status === 'disconnected' && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="API Key"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            placeholder="API Secret"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button className="w-full bg-orange-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors">
            Validar Conexión
          </button>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-1">¿Qué activa esta integración?</h4>
        <p className="text-xs text-blue-700">
          {integration.id === 'meta' && 'Gestión automática de WhatsApp, Instagram y Facebook'}
          {integration.id === 'stripe' && 'Procesamiento de pagos y suscripciones'}
          {integration.id === 'openai' && 'Capacidades de IA para chatbots y análisis'}
          {integration.id === 'n8n' && 'Automatización de workflows y procesos'}
          {integration.id === 'tiktok' && 'Gestión de contenido y engagement en TikTok'}
        </p>
      </div>
    </div>
  );

  return (
    <div id="integration_panel" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">🔗 Configuración / Integraciones</h2>
        <button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200">
          Agregar Nueva Integración
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map(integration => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {/* Integration Status Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4">📊 Estado de Integraciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {integrations.filter(i => i.status === 'connected').length}
            </div>
            <div className="text-sm text-green-700">Conectadas</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">
              {integrations.filter(i => i.status === 'disconnected').length}
            </div>
            <div className="text-sm text-red-700">Desconectadas</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {integrations.length}
            </div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
        </div>
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
      case 'feedback':
        return <FeedbackSection />;
      case 'reservations':
        return <ReservationsSection />;
      case 'ai-agents':
        return <AIAgentsSection />;
      case 'rewards':
        return <RewardsNFTsSection />;
      case 'roi-viewer':
        return <ROIViewer />;
      case 'integrations':
        return <IntegrationsSection />;
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