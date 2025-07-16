import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(email, password);
    if (!success) {
      alert('Error de autenticación');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">IM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">IL MANDORLA</h1>
          <p className="text-gray-600">Dashboard Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="admin@ilmandorla.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Sistema KUMIA ELITE - Powered by Emergent
          </p>
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
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [aiAgents, setAiAgents] = useState([]);
  const [nftRewards, setNftRewards] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        metricsRes,
        menuRes,
        customersRes,
        reservationsRes,
        feedbackRes,
        agentsRes,
        nftRes,
        integrationsRes,
        settingsRes
      ] = await Promise.all([
        axios.get(`${API}/dashboard/metrics`),
        axios.get(`${API}/menu`),
        axios.get(`${API}/customers`),
        axios.get(`${API}/reservations`),
        axios.get(`${API}/feedback`),
        axios.get(`${API}/ai-agents`),
        axios.get(`${API}/nft-rewards`),
        axios.get(`${API}/integrations`),
        axios.get(`${API}/settings`)
      ]);

      setMetrics(metricsRes.data);
      setMenuItems(menuRes.data);
      setCustomers(customersRes.data);
      setReservations(reservationsRes.data);
      setFeedback(feedbackRes.data);
      setAiAgents(agentsRes.data);
      setNftRewards(nftRes.data);
      setIntegrations(integrationsRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const MetricsCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricsCard
                title="Total Clientes"
                value={metrics.total_customers || 0}
                icon="👥"
                color="text-blue-600"
              />
              <MetricsCard
                title="Reservas Activas"
                value={metrics.total_reservations || 0}
                icon="📅"
                color="text-green-600"
              />
              <MetricsCard
                title="Puntos Entregados"
                value={metrics.total_points_delivered || 0}
                icon="⭐"
                color="text-yellow-600"
              />
              <MetricsCard
                title="NFTs Entregados"
                value={metrics.nfts_delivered || 0}
                icon="🎯"
                color="text-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Ingresos Totales</h3>
                <p className="text-3xl font-bold text-green-600">
                  ${metrics.total_revenue?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Rating Promedio</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {metrics.avg_rating?.toFixed(1) || 0}/5
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
              <div className="space-y-3">
                {feedback.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.customer_name}</p>
                      <p className="text-sm text-gray-600">{item.comment}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500">{'⭐'.repeat(item.rating)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'menu':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestión del Menú</h2>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                Agregar Ítem
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  {item.image_base64 && (
                    <img
                      src={`data:image/jpeg;base64,${item.image_base64}`}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-orange-600">${item.price}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Editar
                    </button>
                    <button className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors">
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestión de Clientes</h2>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                Agregar Cliente
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nivel NFT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Puntos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Visita
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            customer.nft_level === 'citizen_kumia' ? 'bg-purple-100 text-purple-800' :
                            customer.nft_level === 'oro' ? 'bg-yellow-100 text-yellow-800' :
                            customer.nft_level === 'plata' ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {customer.nft_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.points}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            Ver Perfil
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'ai-agents':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Agentes de IA Multicanal</h2>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                Crear Agente
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiAgents.map((agent) => (
                <div key={agent.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{agent.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      agent.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {agent.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Canal: </span>
                    <span className="font-medium capitalize">{agent.channel}</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Prompt:</span>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1 line-clamp-3">
                      {agent.prompt}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Editar
                    </button>
                    <button className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
                      Probar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Integraciones Externas</h2>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                Agregar Integración
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Google OAuth2', type: 'google_oauth', icon: '🔐' },
                { name: 'OpenAI', type: 'openai', icon: '🤖' },
                { name: 'Meta Business', type: 'meta', icon: '📱' },
                { name: 'TikTok Business', type: 'tiktok', icon: '🎵' },
                { name: 'Stripe', type: 'stripe', icon: '💳' },
                { name: 'MercadoPago', type: 'mercadopago', icon: '💰' }
              ].map((integration) => {
                const existingIntegration = integrations.find(i => i.type === integration.type);
                return (
                  <div key={integration.type} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{integration.icon}</span>
                        <h3 className="text-lg font-semibold">{integration.name}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        existingIntegration?.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {existingIntegration?.is_active ? 'Conectado' : 'Desconectado'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="password"
                        placeholder="API Key"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <button className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors">
                        {existingIntegration?.is_active ? 'Actualizar' : 'Conectar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return <div>Módulo en desarrollo</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">IM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">IL MANDORLA</h1>
                <p className="text-sm text-gray-600">Dashboard Administrativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Bienvenido, {user?.name}</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-200 mr-6">
            <nav className="p-4 space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'menu', label: 'Menú', icon: '🍽️' },
                { id: 'customers', label: 'Clientes', icon: '👥' },
                { id: 'reservations', label: 'Reservas', icon: '📅' },
                { id: 'feedback', label: 'Feedback', icon: '💬' },
                { id: 'ai-agents', label: 'Agentes IA', icon: '🤖' },
                { id: 'rewards', label: 'Recompensas', icon: '🎁' },
                { id: 'integrations', label: 'Integraciones', icon: '🔗' },
                { id: 'settings', label: 'Configuración', icon: '⚙️' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderDashboardContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <div className="App">
        <AuthWrapper />
      </div>
    </AuthProvider>
  );
};

const AuthWrapper = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <Dashboard /> : <Login />;
};

export default App;