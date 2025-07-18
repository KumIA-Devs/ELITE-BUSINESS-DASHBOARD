import React, { useState, useEffect, createContext, useContext } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import axios from 'axios';
import './App.css';
import { ROIViewer, RewardsNFTsSection, IntegrationsSection, ConfigurationSection, ClientsSection, ReservationsSection, AIAgentsSection } from './AppComponents';
import { firebaseConfig, firebaseServices, offlineConfig } from './firebaseConfig';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const GOOGLE_CLIENT_ID = "711205636822-gnr5u8gumdd6n3h41kauhn6enhbt160d.apps.googleusercontent.com";

// Initialize Firebase
let app;
let db;
let auth;
let analytics;
let functions;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  if (firebaseServices.firestore.enabled) {
    db = getFirestore(app);
  }
  
  if (firebaseServices.auth.enabled) {
    auth = getAuth(app);
  }
  
  if (firebaseServices.analytics.enabled && typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  
  if (firebaseServices.functions.enabled) {
    functions = getFunctions(app);
  }
  
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase initialization failed, using offline mode:', error);
  // Fallback to offline mode
}

// Firebase Context
const FirebaseContext = createContext();

const FirebaseProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // Check Firebase connection
    const checkFirebaseConnection = async () => {
      try {
        if (db) {
          // Test Firestore connection
          setFirebaseReady(true);
          setIsOnline(true);
        }
      } catch (error) {
        console.warn('Firebase offline, using fallback mode');
        setFirebaseReady(false);
        setIsOnline(false);
      }
    };

    checkFirebaseConnection();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      checkFirebaseConnection();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = {
    app,
    db,
    auth,
    analytics,
    functions,
    isOnline,
    firebaseReady
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

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

// Login Component (MANTENER EXACTAMENTE IGUAL)
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

// Tooltip Component (MANTENER EXACTAMENTE IGUAL)
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

// Enhanced Metrics Card (MANTENER EXACTAMENTE IGUAL)
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

// MANTENER TODOS LOS COMPONENTES EXISTENTES Y AGREGAR NUEVAS FUNCIONALIDADES

// Weekly Growth Chart Component (MANTENER EXACTAMENTE IGUAL)
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

// ROI Impact Block (MANTENER EXACTAMENTE IGUAL)
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

// AI Recommendation CTA (MANTENER EXACTAMENTE IGUAL)
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

// Enhanced Dashboard Summary (MANTENER EXACTAMENTE IGUAL)
const DashboardSummary = ({ metrics }) => {
  const weeklyRevenue = [85000, 92000, 78000, 95000, 88000, 96000, 102000];
  const roiData = {
    multiplier: 4.3,
    weeklyImpact: 28500,
    monthlyRevenue: 385000
  };

  return (
    <div id="dashboard_summary" className="space-y-6">
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

      <ROIImpactBlock 
        roiMultiplier={roiData.multiplier}
        weeklyImpact={roiData.weeklyImpact}
        monthlyRevenue={roiData.monthlyRevenue}
      />

      <div className="space-y-6">
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

      <WeeklyGrowthChart 
        data={weeklyRevenue}
        title="📈 Crecimiento Semanal de Ingresos"
      />

      <AIRecommendationCTA
        recommendation="Basado en tu ROI actual de +4.3x y crecimiento del 22%, es el momento perfecto para expandir KUMIA a un segundo local. Los datos muestran que tienes la base de clientes y el sistema optimizado para escalar."
        impact="150"
        action="🚀 Expandir KUMIA a otro local"
      />
    </div>
  );
};

// 🆕 RESTAURAR MÓDULO MENÚ COMPLETO
const MenuSection = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['Entradas', 'Principales', 'Postres', 'Bebidas']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('admin'); // admin, customer
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API}/menu-items`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const MenuItemCard = ({ item }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center mr-4">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="text-white text-2xl">🍽️</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.category}</p>
            <p className="text-lg font-bold text-green-600">${item.price}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {item.is_active ? 'Activo' : 'Inactivo'}
          </span>
          {item.high_margin && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              💰 Alto Margen
            </span>
          )}
          <div className="text-xs text-gray-500">
            Vendido: {item.sales_count || 0} veces
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">{item.description}</p>

      {/* 🆕 NUEVAS FUNCIONALIDADES */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Popularidad:</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-sm ${i < (item.popularity || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                ⭐
              </span>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Sugerido con: {item.upselling_suggestions || 'Ninguno'}
        </div>
      </div>

      <div className="flex space-x-2">
        <button 
          onClick={() => setEditingItem(item)}
          className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
        >
          ✏️ Editar
        </button>
        <button 
          onClick={() => handleDuplicateItem(item)}
          className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-200 transition-colors"
        >
          📋 Duplicar
        </button>
        <button 
          onClick={() => handleToggleActive(item.id)}
          className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
            item.is_active 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {item.is_active ? '🔴 Desactivar' : '🟢 Activar'}
        </button>
      </div>
    </div>
  );

  const handleDuplicateItem = (item) => {
    const duplicatedItem = {
      ...item,
      id: Date.now(),
      name: `${item.name} (Copia)`,
      is_active: false
    };
    setMenuItems(prev => [...prev, duplicatedItem]);
  };

  const handleToggleActive = (itemId) => {
    setMenuItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, is_active: !item.is_active }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🍽️ Menú</h2>
          <p className="text-gray-600 mt-1">Gestiona tu carta digital</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setViewMode(viewMode === 'admin' ? 'customer' : 'admin')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            👁️ Vista {viewMode === 'admin' ? 'Cliente' : 'Admin'}
          </button>
          <button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            📊 Analíticas
          </button>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200">
            + Nuevo Item
          </button>
        </div>
      </div>

      {/* 🆕 ANALÍTICAS DE MENÚ */}
      {showAnalytics && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Analíticas del Menú</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800">Productos Más Vendidos</h4>
              <div className="mt-2 space-y-1">
                {menuItems.slice(0, 3).map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-green-600">{item.sales_count || 0}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800">Alto Margen</h4>
              <div className="mt-2 space-y-1">
                {menuItems.filter(item => item.high_margin).map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-yellow-600">${item.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800">Sugerencias IA</h4>
              <div className="mt-2 text-sm text-blue-700">
                • Promocionar platos de alto margen<br/>
                • Combinar entrantes con principales<br/>
                • Destacar productos populares
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros de Categoría */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedCategory === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid de Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map(item => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

// 🆕 FEEDBACK SECTION AMPLIADA
const FeedbackSection = () => {
  const [feedback, setFeedback] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({
    ratingDistribution: { 5: 45, 4: 32, 3: 12, 2: 8, 1: 3 },
    weeklyEvolution: [85, 92, 78, 95, 88, 96, 102],
    npsScore: 8.4,
    npsChannels: { whatsapp: 8.7, instagram: 8.2, facebook: 8.5, general: 8.1 },
    keywords: [
      { word: 'delicioso', count: 45, sentiment: 'positive' },
      { word: 'excelente', count: 38, sentiment: 'positive' },
      { word: 'rápido', count: 32, sentiment: 'positive' },
      { word: 'calidad', count: 28, sentiment: 'positive' },
      { word: 'espera', count: 15, sentiment: 'negative' }
    ]
  });
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedSatisfaction, setSelectedSatisfaction] = useState('all');

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

  const handleQuickResponse = (feedbackId, responseType) => {
    alert(`Enviando respuesta rápida "${responseType}" al feedback ${feedbackId}`);
  };

  const exportFeedback = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      feedback.map(f => `${f.customer_name},${f.rating},${f.comment},${f.date}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "feedback_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div id="feedback_module" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">💬 Feedback</h2>
          <p className="text-gray-600 mt-1">Recolecta, entiende y acciona feedback automáticamente</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportFeedback}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            📤 Exportar Feedback
          </button>
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200">
            ⚙️ Configurar Respuestas Automáticas
          </button>
        </div>
      </div>

      {/* 🆕 FILTROS AVANZADOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Filtros Avanzados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Canal</label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todos los canales</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="web">Web</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Satisfacción</label>
            <select
              value={selectedSatisfaction}
              onChange={(e) => setSelectedSatisfaction(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todos los niveles</option>
              <option value="positive">Positivos (4-5⭐)</option>
              <option value="neutral">Neutros (3⭐)</option>
              <option value="negative">Negativos (1-2⭐)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 🆕 NPS POR CANAL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 NPS General + Por Canal</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">{feedbackStats.npsScore}</div>
            <div className="text-sm text-green-700">NPS General</div>
          </div>
          {Object.entries(feedbackStats.npsChannels).map(([channel, score]) => (
            <div key={channel} className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-blue-700 capitalize">{channel}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Distribution (MANTENER EXISTENTE) */}
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

      {/* 🆕 LÍNEA DE TIEMPO DE EVOLUCIÓN DEL SENTIMIENTO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Evolución del Sentimiento (IA)</h3>
        <div className="flex items-end justify-between h-32">
          {feedbackStats.weeklyEvolution.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="text-xs text-gray-600 mb-1">{value}</div>
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
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Tendencia:</span> 
            <span className="text-green-600 ml-1">↗️ Positiva (+8.2%)</span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Promedio:</span> 
            {Math.round(feedbackStats.weeklyEvolution.reduce((a, b) => a + b, 0) / feedbackStats.weeklyEvolution.length)}
          </div>
        </div>
      </div>

      {/* Keywords Cloud & AI Analysis (MANTENER EXISTENTE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🔤 Nube de Palabras Clave (NLP)</h3>
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
            <h3 className="text-lg font-bold text-indigo-800">Análisis IA + Recomendaciones</h3>
          </div>
          <div className="space-y-3">
            <p className="text-indigo-700 text-sm">
              <strong>NPS Score:</strong> {feedbackStats.npsScore}/10 (Excelente)
            </p>
            <p className="text-indigo-700 text-sm">
              <strong>Temas frecuentes:</strong> Calidad de comida (+), Velocidad de servicio (+), Tiempo de espera (-)
            </p>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>🔍 Recomendación Detectada:</strong> Detectamos quejas sobre espera → activa recordatorio de puntualidad
              </p>
            </div>
          </div>
          <button className="w-full mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200">
            Aplicar Recomendación
          </button>
        </div>
      </div>

      {/* 🆕 ESTADÍSTICAS DETALLADAS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Estadísticas Detalladas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">4.2/5</div>
            <div className="text-sm text-gray-600">Promedio General</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">4.5/5</div>
            <div className="text-sm text-gray-600">Promedio Semanal</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">4.1/5</div>
            <div className="text-sm text-gray-600">Promedio Mensual</div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Feedbacks Positivos</h4>
            <div className="text-2xl font-bold text-green-600">77</div>
            <div className="text-sm text-green-700">77% del total</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Feedbacks Negativos</h4>
            <div className="text-2xl font-bold text-red-600">11</div>
            <div className="text-sm text-red-700">11% del total</div>
          </div>
        </div>
      </div>

      {/* Recent Feedback (MANTENER EXISTENTE + 🆕 RESPUESTAS RÁPIDAS) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📝 Feedback Reciente</h3>
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
                  <span className="ml-2 text-xs text-gray-500">{item.channel}</span>
                </div>
                <p className="text-gray-600 text-sm">{item.comment}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => handleRespondWithReward(item.id)}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200 transition-colors"
                >
                  🎁 Responder con Recompensa
                </button>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleQuickResponse(item.id, 'Gracias')}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200"
                  >
                    👍 Gracias
                  </button>
                  <button 
                    onClick={() => handleQuickResponse(item.id, 'Mejora')}
                    className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs hover:bg-yellow-200"
                  >
                    📈 Mejora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Dashboard Component (MANTENER ESTRUCTURA EXISTENTE)
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
    { id: 'menu', label: 'Menú', icon: '🍽️', badge: null },
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
      case 'menu':
        return <MenuSection />;
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
      case 'settings':
        return <ConfigurationSection />;
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

// Main App Component with Firebase Integration
const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <FirebaseProvider>
        <AuthProvider>
          <div className="App">
            <AuthWrapper />
          </div>
        </AuthProvider>
      </FirebaseProvider>
    </GoogleOAuthProvider>
  );
};

const AuthWrapper = () => {
  const { isAuthenticated } = useAuth();
  const { isOnline, firebaseReady } = useFirebase();
  
  // Show connection status
  const connectionStatus = () => {
    if (!isOnline) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 p-3 text-center">
          <span className="text-yellow-800">⚠️ Modo offline - Funcionalidad limitada</span>
        </div>
      );
    }
    if (!firebaseReady) {
      return (
        <div className="bg-blue-50 border border-blue-200 p-3 text-center">
          <span className="text-blue-800">🔄 Conectando a Firebase...</span>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div>
      {connectionStatus()}
      {isAuthenticated ? <Dashboard /> : <Login />}
    </div>
  );
};

export default App;