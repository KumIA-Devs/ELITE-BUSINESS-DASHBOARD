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

// Tooltip Component
const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className={`absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg transition-opacity duration-200 ${
          position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        } left-1/2 transform -translate-x-1/2 w-48`}>
          {content}
          <div className={`absolute left-1/2 transform -translate-x-1/2 ${
            position === 'top' ? 'top-full' : 'bottom-full'
          }`}>
            <div className={`border-4 border-transparent ${
              position === 'top' ? 'border-t-gray-900' : 'border-b-gray-900'
            }`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Metrics Card with Tooltip
const MetricsCard = ({ title, value, icon, color, trend, tooltip, category, onClick, loading = false }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 ${loading ? 'animate-pulse' : ''}`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-3 ${
          category === 'revenue' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
          category === 'engagement' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
          category === 'brand' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
          'bg-gradient-to-br from-orange-500 to-red-500'
        }`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="text-sm font-medium text-gray-600 mr-2">{title}</h3>
            <Tooltip content={tooltip}>
              <span className="text-gray-400 text-xs">ℹ️</span>
            </Tooltip>
          </div>
          <p className={`text-2xl font-bold ${color} mt-1`}>
            {loading ? '...' : value}
          </p>
        </div>
      </div>
    </div>
    
    {trend && (
      <div className="flex items-center justify-between">
        <div className={`flex items-center text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
          <span className="mr-1">{trend.positive ? '↗️' : '↘️'}</span>
          <span className="font-medium">{trend.percentage}%</span>
        </div>
        <div className="text-xs text-gray-500">{trend.period}</div>
      </div>
    )}
  </div>
);

// Weekly Growth Chart Component
const WeeklyGrowthChart = ({ data, title }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
    <div className="flex items-end justify-between h-40">
      {data.map((value, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="text-xs text-gray-600 mb-1">${value.toLocaleString()}</div>
          <div 
            className="bg-gradient-to-t from-orange-400 to-red-400 rounded-t-lg transition-all duration-500 w-8"
            style={{ height: `${(value / Math.max(...data)) * 100}%` }}
          ></div>
          <span className="text-xs text-gray-500 mt-1">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}
          </span>
        </div>
      ))}
    </div>
    <div className="mt-4 text-sm text-gray-600">
      <span className="font-medium">Promedio semanal: </span>
      ${Math.round(data.reduce((a, b) => a + b, 0) / data.length).toLocaleString()}
    </div>
  </div>
);

// ROI Impact Block
const ROIImpactBlock = ({ roiMultiplier, weeklyImpact, monthlyRevenue }) => (
  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
        <span className="text-white text-xl">🧠</span>
      </div>
      <div>
        <h3 className="text-lg font-bold text-emerald-800">Impacto generado por KUMIA esta semana</h3>
        <p className="text-sm text-emerald-700">Resultados tangibles de tu inversión</p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div className="bg-white rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-emerald-600">+{roiMultiplier}x</div>
        <div className="text-sm text-emerald-700">ROI Mensual</div>
      </div>
      <div className="bg-white rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-emerald-600">${weeklyImpact.toLocaleString()}</div>
        <div className="text-sm text-emerald-700">Ingresos Extra</div>
      </div>
      <div className="bg-white rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-emerald-600">${monthlyRevenue.toLocaleString()}</div>
        <div className="text-sm text-emerald-700">Facturación Mes</div>
      </div>
    </div>
    
    <div className="bg-emerald-600 text-white rounded-lg p-4 text-center">
      <p className="text-lg font-bold">
        "Este mes generaste un ROI de +{roiMultiplier}x. KUMIA está funcionando."
      </p>
    </div>
  </div>
);

// AI Recommendation CTA
const AIRecommendationCTA = ({ recommendation, impact, action }) => (
  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
          <span className="text-white text-xl">🚀</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-indigo-800">IA Sugiere: Expandir KUMIA</h3>
          <p className="text-sm text-indigo-700">Oportunidad de crecimiento detectada</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-indigo-600">Impacto Estimado</div>
        <div className="text-xl font-bold text-indigo-800">+{impact}%</div>
      </div>
    </div>
    
    <p className="text-indigo-700 mb-4">{recommendation}</p>
    
    <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
      {action}
    </button>
  </div>
);

// Enhanced Dashboard Summary
const DashboardSummary = ({ metrics }) => {
  const weeklyRevenue = [85000, 92000, 78000, 95000, 88000, 96000, 102000];
  const roiData = {
    multiplier: 4.3,
    weeklyImpact: 28500,
    monthlyRevenue: 385000
  };

  return (
    <div id="dashboard_summary" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">📈 Dashboard General</h2>
          <p className="text-gray-600 mt-1">Resumen ejecutivo de tu impacto KUMIA</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
            📊 Reporte Semanal
          </button>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
            🚀 Expandir KUMIA
          </button>
        </div>
      </div>

      {/* ROI Impact Block */}
      <ROIImpactBlock 
        roiMultiplier={roiData.multiplier}
        weeklyImpact={roiData.weeklyImpact}
        monthlyRevenue={roiData.monthlyRevenue}
      />

      {/* Metrics Cards - Reorganized by Priority */}
      <div className="space-y-6">
        {/* Priority 1: Revenue & Conversions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            💰 Impacto Económico
            <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Principal</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricsCard
              title="Ingresos Atribuidos"
              value={`$${(metrics.total_revenue || 0).toLocaleString()}`}
              icon="💰"
              color="text-green-600"
              category="revenue"
              trend={{ positive: true, percentage: 22.1, period: "vs mes anterior" }}
              tooltip="Ingresos directamente generados por las funciones KUMIA (IA, NFTs, automatizaciones)"
            />
            <MetricsCard
              title="ROI Mensual"
              value={`+${roiData.multiplier}x`}
              icon="📈"
              color="text-emerald-600"
              category="revenue"
              trend={{ positive: true, percentage: 15.2, period: "vs mes anterior" }}
              tooltip="Retorno de inversión: por cada $1 invertido en KUMIA, generas $4.3"
            />
            <MetricsCard
              title="Conversiones IA"
              value={metrics.ai_conversions || 0}
              icon="🤖"
              color="text-indigo-600"
              category="revenue"
              trend={{ positive: true, percentage: 28.9, period: "vs mes anterior" }}
              tooltip="Número de clientes convertidos a través de los agentes de IA"
            />
            <MetricsCard
              title="Ticket Promedio"
              value="$3,200"
              icon="💳"
              color="text-blue-600"
              category="revenue"
              trend={{ positive: true, percentage: 18.5, period: "vs mes anterior" }}
              tooltip="Valor promedio de consumo por cliente (incrementado 28% con KUMIA)"
            />
          </div>
        </div>

        {/* Priority 2: Customer Engagement */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            💜 Compromiso del Cliente
            <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Fidelización</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricsCard
              title="Clientes Activos"
              value={metrics.total_customers || 0}
              icon="👥"
              color="text-purple-600"
              category="engagement"
              trend={{ positive: true, percentage: 15.2, period: "vs mes anterior" }}
              tooltip="Clientes únicos que han interactuado con tu sistema KUMIA este mes"
            />
            <MetricsCard
              title="NFTs Entregados"
              value={metrics.nfts_delivered || 0}
              icon="🎁"
              color="text-pink-600"
              category="engagement"
              trend={{ positive: true, percentage: 12.3, period: "vs mes anterior" }}
              tooltip="Recompensas NFT entregadas que aumentan la fidelización y retención"
            />
            <MetricsCard
              title="Puntos Activos"
              value={metrics.total_points_delivered || 0}
              icon="⭐"
              color="text-yellow-600"
              category="engagement"
              trend={{ positive: true, percentage: 18.5, period: "vs mes anterior" }}
              tooltip="Puntos de fidelización acumulados por tus clientes"
            />
            <MetricsCard
              title="Feedback Positivo"
              value={`${metrics.total_feedback || 0} (95%)`}
              icon="💬"
              color="text-emerald-600"
              category="engagement"
              trend={{ positive: true, percentage: 8.7, period: "vs mes anterior" }}
              tooltip="Reviews y comentarios positivos recibidos a través del sistema"
            />
          </div>
        </div>

        {/* Priority 3: Brand Impact */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            🌟 Impacto de Marca
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Reputación</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricsCard
              title="Rating Promedio"
              value={`${(metrics.avg_rating || 0).toFixed(1)}/5`}
              icon="⭐"
              color="text-orange-600"
              category="brand"
              trend={{ positive: true, percentage: 4.2, period: "vs mes anterior" }}
              tooltip="Calificación promedio de tus clientes (mejorada con KUMIA)"
            />
            <MetricsCard
              title="Alcance Digital"
              value={metrics.total_audience || 0}
              icon="📱"
              color="text-blue-600"
              category="brand"
              trend={{ positive: true, percentage: 11.4, period: "vs mes anterior" }}
              tooltip="Número total de personas alcanzadas través de todos los canales digitales"
            />
            <MetricsCard
              title="NPS Score"
              value="8.7/10"
              icon="📊"
              color="text-indigo-600"
              category="brand"
              trend={{ positive: true, percentage: 6.8, period: "vs mes anterior" }}
              tooltip="Net Promoter Score: probabilidad de que te recomienden"
            />
            <MetricsCard
              title="Retención Cliente"
              value="85%"
              icon="🔄"
              color="text-cyan-600"
              category="brand"
              trend={{ positive: true, percentage: 12.5, period: "vs mes anterior" }}
              tooltip="Porcentaje de clientes que regresan (incrementado con programa de fidelización)"
            />
          </div>
        </div>
      </div>

      {/* Weekly Growth Chart */}
      <WeeklyGrowthChart 
        data={weeklyRevenue}
        title="📈 Crecimiento Semanal de Ingresos"
      />

      {/* AI Recommendation */}
      <AIRecommendationCTA
        recommendation="Basado en tu ROI actual de +4.3x y crecimiento del 22%, es el momento perfecto para expandir KUMIA a un segundo local. Los datos muestran que tienes la base de clientes y el sistema optimizado para escalar."
        impact="150"
        action="🚀 Expandir KUMIA a otro local"
      />
    </div>
  );
};

// Configuration Section - Complete Implementation
const ConfigurationSection = () => {
  const [activeConfigTab, setActiveConfigTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      businessName: 'IL MANDORLA SMOKEHOUSE',
      logo: 'https://images.app.goo.gl/HySig5BgebwJZG6B9',
      language: 'es',
      timezone: 'America/Mexico_City',
      businessHours: {
        monday: { open: '09:00', close: '22:00', active: true },
        tuesday: { open: '09:00', close: '22:00', active: true },
        wednesday: { open: '09:00', close: '22:00', active: true },
        thursday: { open: '09:00', close: '22:00', active: true },
        friday: { open: '09:00', close: '23:00', active: true },
        saturday: { open: '10:00', close: '23:00', active: true },
        sunday: { open: '10:00', close: '21:00', active: true }
      }
    },
    notifications: {
      email: true,
      whatsapp: true,
      frequency: 'daily',
      reportTime: '09:00'
    }
  });

  const configTabs = [
    { id: 'general', label: 'General', icon: '🏢', desc: 'Información básica del negocio' },
    { id: 'roles', label: 'Roles y Permisos', icon: '👥', desc: 'Gestión de usuarios y accesos' },
    { id: 'feedback', label: 'Feedback y Recompensas', icon: '🎁', desc: 'Sistema de recompensas y NFTs' },
    { id: 'ai', label: 'IA y Automatizaciones', icon: '🤖', desc: 'Configuración de agentes inteligentes' },
    { id: 'integrations', label: 'Integraciones', icon: '🔗', desc: 'Conexiones con servicios externos' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', desc: 'Personalización de métricas' },
    { id: 'notifications', label: 'Notificaciones', icon: '🔔', desc: 'Alertas y reportes automáticos' }
  ];

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // General Configuration Panel
  const GeneralConfig = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🏢 Información del Negocio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Comercial
              <Tooltip content="Nombre que aparece en todos los módulos y comunicaciones">
                <span className="text-gray-400 ml-1">ℹ️</span>
              </Tooltip>
            </label>
            <input
              type="text"
              value={settings.general.businessName}
              onChange={(e) => handleSettingChange('general', 'businessName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
              <Tooltip content="URL de tu logo que aparece en el dashboard y comunicaciones">
                <span className="text-gray-400 ml-1">ℹ️</span>
              </Tooltip>
            </label>
            <input
              type="url"
              value={settings.general.logo}
              onChange={(e) => handleSettingChange('general', 'logo', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma
              <Tooltip content="Idioma principal del sistema y comunicaciones automáticas">
                <span className="text-gray-400 ml-1">ℹ️</span>
              </Tooltip>
            </label>
            <select
              value={settings.general.language}
              onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona Horaria
              <Tooltip content="Zona horaria para reportes y automatizaciones">
                <span className="text-gray-400 ml-1">ℹ️</span>
              </Tooltip>
            </label>
            <select
              value={settings.general.timezone}
              onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="America/Mexico_City">México (GMT-6)</option>
              <option value="America/New_York">New York (GMT-5)</option>
              <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
              <option value="America/Bogota">Bogotá (GMT-5)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🕒 Horarios de Atención</h3>
        <div className="space-y-4">
          {Object.entries(settings.general.businessHours).map(([day, hours]) => (
            <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={hours.active}
                  onChange={(e) => handleSettingChange('general', 'businessHours', {
                    ...settings.general.businessHours,
                    [day]: { ...hours, active: e.target.checked }
                  })}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="font-medium text-gray-700 capitalize w-20">{day}</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => handleSettingChange('general', 'businessHours', {
                    ...settings.general.businessHours,
                    [day]: { ...hours, open: e.target.value }
                  })}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={!hours.active}
                />
                <span className="text-gray-500">-</span>
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => handleSettingChange('general', 'businessHours', {
                    ...settings.general.businessHours,
                    [day]: { ...hours, close: e.target.value }
                  })}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={!hours.active}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Roles and Permissions Panel
  const RolesConfig = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">👥 Gestión de Usuarios</h3>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            + Nuevo Usuario
          </button>
        </div>
        <div className="space-y-4">
          {[
            { name: 'Admin Principal', email: 'admin@ilmandorla.com', role: 'superadmin', status: 'active' },
            { name: 'Gerente Mesa', email: 'gerente@ilmandorla.com', role: 'admin', status: 'active' },
            { name: 'Staff Cocina', email: 'cocina@ilmandorla.com', role: 'colaborador', status: 'inactive' }
          ].map((user, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user.name.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
                <button className="text-gray-400 hover:text-gray-600">⚙️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔐 Permisos por Rol</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { role: 'SuperAdmin', permissions: ['dashboard', 'clientes', 'feedback', 'reservas', 'ia', 'recompensas', 'roi', 'integraciones', 'configuracion'] },
            { role: 'Admin', permissions: ['dashboard', 'clientes', 'feedback', 'reservas', 'ia', 'recompensas'] },
            { role: 'Colaborador', permissions: ['dashboard', 'clientes', 'reservas'] }
          ].map((roleConfig, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">{roleConfig.role}</h4>
              <div className="space-y-2">
                {['dashboard', 'clientes', 'feedback', 'reservas', 'ia', 'recompensas', 'roi', 'integraciones', 'configuracion'].map(permission => (
                  <div key={permission} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={roleConfig.permissions.includes(permission)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      readOnly
                    />
                    <span className="text-sm text-gray-700 capitalize">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Notifications Configuration
  const NotificationsConfig = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔔 Configuración de Notificaciones</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Notificaciones por Email</h4>
              <p className="text-sm text-gray-600">Recibe reportes y alertas por correo electrónico</p>
            </div>
            <button
              onClick={() => handleSettingChange('notifications', 'email', !settings.notifications.email)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.email ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Notificaciones por WhatsApp</h4>
              <p className="text-sm text-gray-600">Recibe alertas importantes por WhatsApp</p>
            </div>
            <button
              onClick={() => handleSettingChange('notifications', 'whatsapp', !settings.notifications.whatsapp)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.whatsapp ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.whatsapp ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia de Reportes
              </label>
              <select
                value={settings.notifications.frequency}
                onChange={(e) => handleSettingChange('notifications', 'frequency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Envío
              </label>
              <input
                type="time"
                value={settings.notifications.reportTime}
                onChange={(e) => handleSettingChange('notifications', 'reportTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📧 Plantillas de Comunicación</h3>
        <div className="space-y-4">
          {[
            { name: 'Reporte Diario', type: 'email', status: 'active' },
            { name: 'Alerta de Feedback Negativo', type: 'whatsapp', status: 'active' },
            { name: 'Campaña de Fidelización', type: 'email', status: 'inactive' },
            { name: 'Recordatorio de Reserva', type: 'whatsapp', status: 'active' }
          ].map((template, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{template.type === 'email' ? '📧' : '📱'}</span>
                <div>
                  <h4 className="font-medium text-gray-800">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.type === 'email' ? 'Email' : 'WhatsApp'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  template.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {template.status}
                </span>
                <button className="text-gray-400 hover:text-gray-600">✏️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConfigContent = () => {
    switch (activeConfigTab) {
      case 'general':
        return <GeneralConfig />;
      case 'roles':
        return <RolesConfig />;
      case 'notifications':
        return <NotificationsConfig />;
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Módulo en desarrollo</h3>
            <p className="text-gray-600">Esta sección estará disponible pronto</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">⚙️ Configuración</h2>
          <p className="text-gray-600 mt-1">Personaliza tu sistema KUMIA</p>
        </div>
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
          💾 Guardar Cambios
        </button>
      </div>

      <div className="flex space-x-6">
        {/* Configuration Tabs */}
        <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="space-y-2">
            {configTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveConfigTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeConfigTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl mr-3">{tab.icon}</span>
                <div>
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs opacity-75">{tab.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Content */}
        <div className="flex-1">
          {renderConfigContent()}
        </div>
      </div>
    </div>
  );
};

// Continue with other sections...
// [Rest of the components remain the same as in the previous implementation]

// Enhanced Clients Section with Smart Filters
const ClientsSection = () => {
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState('all');
  const [smartFilters, setSmartFilters] = useState({
    frequency: 'all',
    avgTicket: 'all',
    feedback: 'all'
  });

  const clientFilters = [
    { id: 'all', label: 'Todos', color: 'bg-gray-100', count: 48 },
    { id: 'ambassador', label: 'Embajadores', color: 'bg-purple-100', count: 12 },
    { id: 'recurrent', label: 'Recurrentes', color: 'bg-green-100', count: 23 },
    { id: 'new', label: 'Nuevos', color: 'bg-blue-100', count: 8 },
    { id: 'inactive', label: 'Inactivos', color: 'bg-red-100', count: 5 }
  ];

  const smartFilterOptions = [
    { id: 'frequency', label: 'Frecuencia', options: ['all', 'high', 'medium', 'low'] },
    { id: 'avgTicket', label: 'Ticket Promedio', options: ['all', 'premium', 'standard', 'basic'] },
    { id: 'feedback', label: 'Feedback', options: ['all', 'positive', 'neutral', 'negative'] }
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
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
        <div className="flex flex-col items-end space-y-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            client.nft_level === 'citizen_kumia' ? 'bg-purple-100 text-purple-800' :
            client.nft_level === 'oro' ? 'bg-yellow-100 text-yellow-800' :
            client.nft_level === 'plata' ? 'bg-gray-100 text-gray-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {client.nft_level}
          </span>
          <div className="flex items-center text-xs text-gray-500">
            <span className="text-green-600 mr-1">⭐</span>
            Potencial: Alto
          </div>
        </div>
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
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-lg text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
        >
          🎁 Recompensar con NFT
        </button>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewHistory(client.id)}
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
          onClick={() => handleInviteReferral(client.id)}
          className="w-full bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm hover:bg-indigo-200 transition-colors"
        >
          👥 Invitar a Campaña de Referidos
        </button>
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

  const handleViewHistory = (clientId) => {
    alert(`Visualizando historial completo del cliente ${clientId}`);
  };

  const handleContactClient = (clientId) => {
    alert(`Contactando al cliente ${clientId}`);
  };

  const handleInviteReferral = (clientId) => {
    alert(`Invitando cliente ${clientId} a campaña de referidos`);
  };

  const handleActivateAutoReward = (clientId) => {
    alert(`Activando recompensa automática para cliente ${clientId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">👥 Clientes</h2>
          <p className="text-gray-600 mt-1">Gestiona y activa tu comunidad</p>
        </div>
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
          + Nuevo Cliente
        </button>
      </div>

      {/* Dynamic Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-4">📊 Resumen Dinámico</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {clientFilters.slice(1).map(filter => (
            <div key={filter.id} className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filter.count}</div>
              <div className="text-sm text-blue-700">{filter.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Filtros Inteligentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {smartFilterOptions.map(filterOption => (
            <div key={filterOption.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {filterOption.label}
              </label>
              <select
                value={smartFilters[filterOption.id]}
                onChange={(e) => setSmartFilters(prev => ({ ...prev, [filterOption.id]: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {filterOption.options.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'Todos' : option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Main Filters */}
      <div className="flex flex-wrap gap-2">
        {clientFilters.map(filterItem => (
          <button
            key={filterItem.id}
            onClick={() => setFilter(filterItem.id)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === filterItem.id 
                ? 'bg-orange-500 text-white shadow-lg' 
                : `${filterItem.color} text-gray-700 hover:opacity-80`
            }`}
          >
            {filterItem.label}
            <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
              {filterItem.count}
            </span>
          </button>
        ))}
      </div>

      {/* Top Clients Highlight */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-bold text-purple-800 mb-4">🌟 Top Clientes con Potencial de Fidelización</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clients.slice(0, 3).map(client => (
            <div key={client.id} className="bg-white rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">{client.name.charAt(0)}</span>
              </div>
              <h4 className="font-medium text-gray-800">{client.name}</h4>
              <p className="text-sm text-gray-600">{client.points || 0} puntos</p>
              <button className="mt-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs hover:bg-purple-200 transition-colors">
                Enviar Upgrade NFT
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
};

// Dashboard Component with Enhanced Navigation
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
    { id: 'dashboard', label: 'Dashboard', icon: '📈', badge: 'NEW' },
    { id: 'clients', label: 'Clientes', icon: '👥', badge: '48' },
    { id: 'feedback', label: 'Feedback', icon: '💬', badge: '12' },
    { id: 'reservations', label: 'Reservas', icon: '📅', badge: '5' },
    { id: 'ai-agents', label: 'Agentes IA', icon: '🤖', badge: '4' },
    { id: 'rewards', label: 'Recompensas', icon: '🎁', badge: null },
    { id: 'roi-viewer', label: 'ROI Viewer', icon: '📊', badge: '+4.3x' },
    { id: 'integrations', label: 'Integraciones', icon: '🔗', badge: '2/5' },
    { id: 'settings', label: 'Configuración', icon: '⚙️', badge: null }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardSummary metrics={metrics} />;
      case 'clients':
        return <ClientsSection />;
      case 'settings':
        return <ConfigurationSection />;
      // Add other cases as needed
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
      {/* Enhanced Header */}
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
              <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                ROI +4.3x
              </div>
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
        {/* Enhanced Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeTab === item.id 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Enhanced CTA */}
          <div className="p-4 mt-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
              <h3 className="font-bold mb-2">🚀 Expandir KUMIA</h3>
              <p className="text-sm mb-3 opacity-90">Con tu ROI de +4.3x, es momento de crecer</p>
              <button className="w-full bg-white text-purple-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                Abrir Nuevo Local
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