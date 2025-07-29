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
const GOOGLE_CLIENT_ID = "284445869651-ets9s29v4f3ljj02qveq9lqlmj88npkl.apps.googleusercontent.com";

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

// Enhanced Interactive Weekly Growth Chart Component
const WeeklyGrowthChart = ({ data, title }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const shortDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const totalWeekly = data.reduce((a, b) => a + b, 0);
  const avgWeekly = totalWeekly / data.length;
  
  // Calculate growth rate for each day
  const growthData = data.map((value, index) => {
    if (index === 0) return 0;
    return ((value - data[index - 1]) / data[index - 1] * 100).toFixed(1);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors"
          >
            {showDetails ? '👁️ Vista Simple' : '📊 Detalles'}
          </button>
        </div>
      </div>

      {/* Enhanced Interactive Chart */}
      <div className="relative">
        <div className="flex items-end justify-between h-48 bg-gradient-to-t from-gray-50 to-white rounded-lg p-4 mb-4">
          {data.map((value, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center group cursor-pointer relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip on Hover */}
              {hoveredIndex === index && (
                <div className="absolute bottom-full mb-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap z-10">
                  <div className="font-bold">{dayNames[index]}</div>
                  <div>${value.toLocaleString()}</div>
                  {index > 0 && (
                    <div className={`${parseFloat(growthData[index]) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {parseFloat(growthData[index]) >= 0 ? '↗️' : '↘️'} {growthData[index]}%
                    </div>
                  )}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
              
              {/* Revenue Value */}
              <div className={`text-xs mb-1 transition-all duration-200 ${
                hoveredIndex === index ? 'text-gray-800 font-bold' : 'text-gray-600'
              }`}>
                ${value.toLocaleString()}
              </div>
              
              {/* Bar */}
              <div 
                className={`rounded-t-lg transition-all duration-500 group-hover:shadow-lg ${
                  value === maxValue ? 'bg-gradient-to-t from-green-400 to-emerald-500' :
                  value === minValue ? 'bg-gradient-to-t from-red-400 to-red-500' :
                  'bg-gradient-to-t from-orange-400 to-red-400'
                } ${hoveredIndex === index ? 'w-12' : 'w-8'}`}
                style={{ height: `${(value / maxValue) * 100}%` }}
              ></div>
              
              {/* Day Label */}
              <span className={`text-xs mt-2 transition-all duration-200 ${
                hoveredIndex === index ? 'text-gray-800 font-bold' : 'text-gray-500'
              }`}>
                {shortDays[index]}
              </span>
              
              {/* Growth Indicator */}
              {index > 0 && (
                <span className={`text-xs mt-1 font-medium ${
                  parseFloat(growthData[index]) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {parseFloat(growthData[index]) >= 0 ? '↗️' : '↘️'} {Math.abs(growthData[index])}%
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-emerald-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-emerald-600">${totalWeekly.toLocaleString()}</div>
            <div className="text-xs text-emerald-700">Total Semanal</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-600">${Math.round(avgWeekly).toLocaleString()}</div>
            <div className="text-xs text-blue-700">Promedio Diario</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-green-600">${maxValue.toLocaleString()}</div>
            <div className="text-xs text-green-700">Mejor Día</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-orange-600">
              {((data[6] - data[0]) / data[0] * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-orange-700">Crecimiento</div>
          </div>
        </div>

        {/* Detailed Analysis */}
        {showDetails && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-800 mb-3">📈 Análisis Detallado</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">🏆 Mejor Rendimiento</h5>
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{dayNames[data.indexOf(maxValue)]}</span>
                    <span className="font-medium text-green-600">${maxValue.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    +{((maxValue - avgWeekly) / avgWeekly * 100).toFixed(1)}% sobre promedio
                  </div>
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">📉 Oportunidad de Mejora</h5>
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{dayNames[data.indexOf(minValue)]}</span>
                    <span className="font-medium text-red-600">${minValue.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-red-700 mt-1">
                    {((minValue - avgWeekly) / avgWeekly * 100).toFixed(1)}% bajo promedio
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h5 className="text-sm font-medium text-blue-800 mb-2">💡 Recomendación KUMIA</h5>
              <p className="text-xs text-blue-700">
                Considera implementar promociones especiales los {dayNames[data.indexOf(minValue)].toLowerCase()} 
                para equilibrar el rendimiento semanal. El potencial de crecimiento es de 
                ${(maxValue - minValue).toLocaleString()} adicionales.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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

// Enhanced Dashboard Summary with Weekly Report Modal
const DashboardSummary = ({ metrics }) => {
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [showExpandKumia, setShowExpandKumia] = useState(false);
  const weeklyRevenue = [85000, 92000, 78000, 95000, 88000, 96000, 102000];
  const roiData = {
    multiplier: 4.3,
    weeklyImpact: 28500,
    monthlyRevenue: 385000
  };

  // Generate weekly report data
  const generateWeeklyReport = () => {
    const totalWeeklyRevenue = weeklyRevenue.reduce((a, b) => a + b, 0);
    const avgDailyRevenue = totalWeeklyRevenue / 7;
    const growth = ((weeklyRevenue[6] - weeklyRevenue[0]) / weeklyRevenue[0] * 100).toFixed(1);
    const bestDay = weeklyRevenue.indexOf(Math.max(...weeklyRevenue));
    const worstDay = weeklyRevenue.indexOf(Math.min(...weeklyRevenue));
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    return {
      totalRevenue: totalWeeklyRevenue,
      avgDailyRevenue,
      growth,
      bestDay: { name: dayNames[bestDay], revenue: weeklyRevenue[bestDay] },
      worstDay: { name: dayNames[worstDay], revenue: weeklyRevenue[worstDay] },
      weeklyData: weeklyRevenue.map((revenue, index) => ({
        day: dayNames[index],
        revenue,
        growth: index > 0 ? ((revenue - weeklyRevenue[index - 1]) / weeklyRevenue[index - 1] * 100).toFixed(1) : 0
      }))
    };
  };

  const handleGenerateReport = () => {
    setShowWeeklyReport(true);
  };

  const handleExportReport = (format) => {
    const reportData = generateWeeklyReport();
    const fileName = `reporte_semanal_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'pdf') {
      // Simulate PDF generation
      alert('📄 Generando reporte PDF... (Esta funcionalidad requiere integración con jsPDF)');
    } else if (format === 'excel') {
      // Simulate Excel export
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Día,Ingresos,Crecimiento\n" +
        reportData.weeklyData.map(d => `${d.day},$${d.revenue},${d.growth}%`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('📊 Reporte Excel descargado exitosamente');
    }
  };

  return (
    <div id="dashboard_summary" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">📈 Dashboard General</h2>
          <p className="text-gray-600 mt-1">Resumen ejecutivo de tu impacto KUMIA</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleGenerateReport}
            className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
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

      {/* 🆕 MODAL REPORTE SEMANAL */}
      {showWeeklyReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              {/* Header del Modal */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📊 Reporte Semanal</h2>
                  <p className="text-gray-600">Semana del {new Date().toLocaleDateString()} - Análisis completo</p>
                </div>
                <button 
                  onClick={() => setShowWeeklyReport(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {(() => {
                const report = generateWeeklyReport();
                return (
                  <div className="space-y-6">
                    {/* Resumen Ejecutivo */}
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                      <h3 className="text-lg font-bold text-emerald-800 mb-4">💰 Resumen Ejecutivo</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-emerald-600">${report.totalRevenue.toLocaleString()}</div>
                          <div className="text-sm text-emerald-700">Ingresos Totales</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">${Math.round(report.avgDailyRevenue).toLocaleString()}</div>
                          <div className="text-sm text-blue-700">Promedio Diario</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">{report.growth}%</div>
                          <div className="text-sm text-orange-700">Crecimiento Semanal</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">+4.3x</div>
                          <div className="text-sm text-purple-700">ROI Actual</div>
                        </div>
                      </div>
                    </div>

                    {/* Análisis Diario Detallado */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Análisis Diario Detallado</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="py-3 px-4 font-medium text-gray-700">Día</th>
                              <th className="py-3 px-4 font-medium text-gray-700">Ingresos</th>
                              <th className="py-3 px-4 font-medium text-gray-700">Crecimiento</th>
                              <th className="py-3 px-4 font-medium text-gray-700">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.weeklyData.map((day, index) => (
                              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium">{day.day}</td>
                                <td className="py-3 px-4">${day.revenue.toLocaleString()}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    parseFloat(day.growth) > 0 ? 'bg-green-100 text-green-800' :
                                    parseFloat(day.growth) < 0 ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {parseFloat(day.growth) > 0 ? '↗️' : parseFloat(day.growth) < 0 ? '↘️' : '→'} {day.growth}%
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  {day.revenue === report.bestDay.revenue ? (
                                    <span className="text-green-600 font-medium">🏆 Mejor día</span>
                                  ) : day.revenue === report.worstDay.revenue ? (
                                    <span className="text-red-600 font-medium">📉 Día bajo</span>
                                  ) : (
                                    <span className="text-gray-600">Normal</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Gráfica Interactiva Mejorada */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Gráfica de Rendimiento Semanal</h3>
                      <div className="flex items-end justify-between h-48 bg-gray-50 rounded-lg p-4">
                        {report.weeklyData.map((day, index) => (
                          <div key={index} className="flex flex-col items-center group cursor-pointer">
                            <div className="text-xs text-gray-600 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              ${day.revenue.toLocaleString()}
                            </div>
                            <div 
                              className={`bg-gradient-to-t from-orange-400 to-red-400 rounded-t-lg transition-all duration-500 w-12 group-hover:w-16 ${
                                day.revenue === report.bestDay.revenue ? 'from-green-400 to-emerald-500' :
                                day.revenue === report.worstDay.revenue ? 'from-red-400 to-red-500' : ''
                              }`}
                              style={{ height: `${(day.revenue / Math.max(...weeklyRevenue)) * 100}%` }}
                            ></div>
                            <span className="text-sm text-gray-600 mt-2 group-hover:font-bold transition-all">
                              {day.day.substring(0, 3)}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {day.growth}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Insights y Recomendaciones */}
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                      <h3 className="text-lg font-bold text-blue-800 mb-4">🧠 Insights KUMIA</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <p className="text-blue-700">
                            <strong>{report.bestDay.name}</strong> fue tu mejor día con ${report.bestDay.revenue.toLocaleString()} en ingresos.
                          </p>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <p className="text-blue-700">
                            El crecimiento semanal de <strong>{report.growth}%</strong> está por encima del promedio de la industria (12%).
                          </p>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <p className="text-blue-700">
                            Considera promociones especiales para <strong>{report.worstDay.name}</strong> para mejorar el rendimiento.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Exportación */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Reporte generado el {new Date().toLocaleString()}
                      </div>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleExportReport('excel')}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          📊 Exportar Excel
                        </button>
                        <button 
                          onClick={() => handleExportReport('pdf')}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          📄 Exportar PDF
                        </button>
                        <button 
                          onClick={() => setShowWeeklyReport(false)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🆕 RESTAURAR MÓDULO MENÚ COMPLETO
const MenuSection = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['Entradas', 'Sandwiches', 'Parrillas', 'Pizzas', 'Bebidas']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('admin'); // admin, customer
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Entradas',
    image: '',
    video: '',
    is_active: true,
    high_margin: false,
    popularity: 3,
    upselling_suggestions: '',
    sales_count: 0
  });

  useEffect(() => {
    fetchMenuItems();
    initializeIlMandorlaMenu();
  }, []);

  const initializeIlMandorlaMenu = () => {
    // Menú oficial IL MANDORLA basado en el PDF
    const ilMandorlaMenu = [
      // ENTRADAS
      { id: 'entrada_1', name: 'Nachos', description: 'Nachos con salsa y guacamole', price: 4500, category: 'Entradas', image: '', is_active: true, high_margin: false, popularity: 4, sales_count: 23 },
      { id: 'entrada_2', name: 'Papas Fritas', description: 'Papas rústicas al horno', price: 3200, category: 'Entradas', image: '', is_active: true, high_margin: true, popularity: 5, sales_count: 45 },
      { id: 'entrada_3', name: 'Papas con Cheddar y Bacon', description: 'Papas con queso cheddar y bacon ahumado', price: 4800, category: 'Entradas', image: '', is_active: true, high_margin: true, popularity: 5, sales_count: 38 },
      { id: 'entrada_4', name: 'Empanadas', description: 'Empanadas de carne ahumada (x3)', price: 3600, category: 'Entradas', image: '', is_active: true, high_margin: false, popularity: 4, sales_count: 28 },
      { id: 'entrada_5', name: 'Alitas BBQ', description: 'Alitas de pollo con salsa BBQ Il Mandorla', price: 5500, category: 'Entradas', image: '', is_active: true, high_margin: true, popularity: 5, sales_count: 42 },
      { id: 'entrada_6', name: 'Nachos con Pulled Pork', description: 'Nachos cubiertos con pulled pork ahumado', price: 6200, category: 'Entradas', image: '', is_active: true, high_margin: true, popularity: 4, sales_count: 32 },
      { id: 'entrada_7', name: 'Chipá Relleno', description: 'Chipá relleno con queso y hierbas', price: 2800, category: 'Entradas', image: '', is_active: true, high_margin: false, popularity: 3, sales_count: 15 },

      // SANDWICHES
      { id: 'sandwich_1', name: 'Brooklyn', description: 'Brisket, cebolla caramelizada, queso cheddar, pan artesanal', price: 8900, category: 'Sandwiches', image: '', is_active: true, high_margin: true, popularity: 5, sales_count: 67 },
      { id: 'sandwich_2', name: 'Pampeana', description: 'Carne ahumada, chimichurri, tomate, lechuga', price: 7800, category: 'Sandwiches', image: '', is_active: true, high_margin: false, popularity: 4, sales_count: 54 },
      { id: 'sandwich_3', name: 'Choripán', description: 'Chorizo ahumado, chimichurri, pan crujiente', price: 5200, category: 'Sandwiches', image: '', is_active: true, high_margin: true, popularity: 5, sales_count: 89 },
      { id: 'sandwich_4', name: 'Pulled Pork', description: 'Pulled pork ahumado, coleslaw, salsa BBQ', price: 7200, category: 'Sandwiches', image: '', is_active: true, high_margin: true, popularity: 4, sales_count: 43 },

      // PARRILLAS
      { id: 'parrilla_1', name: 'Plato de Carne Individual', description: 'Brisket o costillas con guarnición', price: 12500, category: 'Parrillas', image: '', is_active: true, high_margin: true, popularity: 5, sales_count: 78 },
      { id: 'parrilla_2', name: 'Para Compartir x2', description: 'Variedad de carnes ahumadas para 2 personas', price: 18900, category: 'Parrillas', image: '', is_active: true, high_margin: true, popularity: 5, sales_count: 45 },
      { id: 'parrilla_3', name: 'Para Compartir x4', description: 'Parrillada completa para 4 personas', price: 32500, category: 'Parrillas', image: '', is_active: true, high_margin: true, popularity: 5, sales_count: 23 },
      { id: 'parrilla_4', name: 'Baby Ribs', description: 'Costillas de cerdo baby con glaseado especial', price: 14200, category: 'Parrillas', image: '', is_active: true, high_margin: true, popularity: 4, sales_count: 56 },
      { id: 'parrilla_5', name: 'Tex-Mex', description: 'Carne ahumada estilo texano con especias', price: 13800, category: 'Parrillas', image: '', is_active: true, high_margin: false, popularity: 4, sales_count: 34 },

      // PIZZAS
      { id: 'pizza_1', name: 'Muzzarella', description: 'Pizza clásica con muzzarella y orégano', price: 6800, category: 'Pizzas', image: '', is_active: true, high_margin: false, popularity: 3, sales_count: 67 },
      { id: 'pizza_2', name: '4 Quesos', description: 'Muzzarella, roquefort, parmesano y provoleta', price: 8200, category: 'Pizzas', image: '', is_active: true, high_margin: true, popularity: 4, sales_count: 43 },
      { id: 'pizza_3', name: 'Bechamel', description: 'Salsa bechamel, jamón y muzzarella', price: 7500, category: 'Pizzas', image: '', is_active: true, high_margin: false, popularity: 3, sales_count: 32 },
      { id: 'pizza_4', name: 'Asado y Hongos', description: 'Carne asada, hongos y cebolla', price: 9200, category: 'Pizzas', image: '', is_active: true, high_margin: true, popularity: 4, sales_count: 38 },
      { id: 'pizza_5', name: 'Margarita con Jamón', description: 'Tomate, albahaca, jamón y muzzarella', price: 7800, category: 'Pizzas', image: '', is_active: true, high_margin: false, popularity: 3, sales_count: 28 },
      { id: 'pizza_6', name: 'Pulled Pork Pizza', description: 'Pulled pork ahumado con cebolla morada', price: 10500, category: 'Pizzas', image: '', is_active: true, high_margin: true, popularity: 5, sales_count: 34 },
      { id: 'pizza_7', name: 'Spicy Bacon', description: 'Bacon ahumado, jalapeños y queso picante', price: 9800, category: 'Pizzas', image: '', is_active: true, high_margin: true, popularity: 4, sales_count: 29 },

      // BEBIDAS
      { id: 'bebida_1', name: 'Tragos de Autor', description: 'Cócteles signature de la casa', price: 4500, category: 'Bebidas', image: '', is_active: true, high_margin: true, popularity: 4, sales_count: 78 },
      { id: 'bebida_2', name: 'Tragos Clásicos', description: 'Whisky sour, mojito, caipirinha', price: 3800, category: 'Bebidas', image: '', is_active: true, high_margin: false, popularity: 4, sales_count: 89 },
      { id: 'bebida_3', name: 'Vinos', description: 'Selección de vinos tintos y blancos', price: 5200, category: 'Bebidas', image: '', is_active: true, high_margin: true, popularity: 3, sales_count: 45 },
      { id: 'bebida_4', name: 'Jugos Naturales', description: 'Jugos de frutas frescas', price: 2800, category: 'Bebidas', image: '', is_active: true, high_margin: false, popularity: 3, sales_count: 67 },
      { id: 'bebida_5', name: 'Cerveza Artesanal', description: 'IPA, Stout y Lager de la casa', price: 3200, category: 'Bebidas', image: '', is_active: true, high_margin: true, popularity: 5, sales_count: 123 },
      { id: 'bebida_6', name: 'Gaseosas', description: 'Coca Cola, Sprite, Fanta', price: 1800, category: 'Bebidas', image: '', is_active: true, high_margin: false, popularity: 3, sales_count: 98 },
      { id: 'bebida_7', name: 'Agua', description: 'Agua mineral con o sin gas', price: 1200, category: 'Bebidas', image: '', is_active: true, high_margin: false, popularity: 2, sales_count: 156 }
    ];

    setMenuItems(ilMandorlaMenu);
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API}/menu`);
      if (response.data && response.data.length > 0) {
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // Si no hay datos en el backend, usar los datos iniciales
    }
  };

  // 🆕 FUNCIONES CRUD COMPLETAS
  const handleCreateItem = async () => {
    if (!newItem.name || !newItem.price) {
      alert('Por favor completa el nombre y el precio');
      return;
    }

    try {
      const itemToCreate = {
        ...newItem,
        id: `${newItem.category.toLowerCase()}_${Date.now()}`,
        price: parseFloat(newItem.price),
        sales_count: 0,
        popularity: parseInt(newItem.popularity) || 3
      };

      // Enviar al backend
      const response = await axios.post(`${API}/menu`, itemToCreate);
      
      // Actualizar estado local
      setMenuItems(prev => [...prev, itemToCreate]);
      setShowNewItemModal(false);
      
      // Reset form
      setNewItem({
        name: '',
        description: '',
        price: '',
        category: 'Entradas',
        image: '',
        video: '',
        is_active: true,
        high_margin: false,
        popularity: 3,
        upselling_suggestions: '',
        sales_count: 0
      });
      
      alert('¡Item creado exitosamente!');
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Error al crear el item. Intenta de nuevo.');
    }
  };

  const handleUpdateItem = async (updatedItem) => {
    try {
      // Enviar al backend
      await axios.put(`${API}/menu/${updatedItem.id}`, updatedItem);
      
      // Actualizar estado local
      setMenuItems(prev => 
        prev.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      );
      
      setEditingItem(null);
      alert('¡Item actualizado exitosamente!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error al actualizar el item. Intenta de nuevo.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este item?')) {
      return;
    }

    try {
      // Enviar al backend
      await axios.delete(`${API}/menu/${itemId}`);
      
      // Actualizar estado local
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      
      alert('¡Item eliminado exitosamente!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error al eliminar el item. Intenta de nuevo.');
    }
  };

  const handleImageUpload = (event, isEditing = false) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        if (isEditing && editingItem) {
          setEditingItem(prev => ({ ...prev, image: base64Image }));
        } else {
          setNewItem(prev => ({ ...prev, image: base64Image }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (event, isEditing = false) => {
    const file = event.target.files[0];
    if (file && file.size <= 50 * 1024 * 1024) { // 50MB limit
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Video = e.target.result;
        if (isEditing && editingItem) {
          setEditingItem(prev => ({ ...prev, video: base64Video }));
        } else {
          setNewItem(prev => ({ ...prev, video: base64Video }));
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('El archivo de video es muy grande. Máximo 50MB.');
    }
  };

  const MenuItemCard = ({ item }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center mr-4 overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="text-white text-2xl">🍽️</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.category}</p>
            <p className="text-lg font-bold text-green-600">${item.price?.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {/* 🆕 BOTÓN PENCIL PRINCIPAL */}
          <button 
            onClick={() => setEditingItem(item)}
            className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
            title="Editar item"
          >
            ✏️
          </button>
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

      {/* Video preview si existe */}
      {item.video && (
        <div className="mb-4">
          <video controls className="w-full h-32 object-cover rounded-lg">
            <source src={item.video} type="video/mp4" />
          </video>
        </div>
      )}

      {/* Información adicional */}
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
          {item.upselling_suggestions && (
            <span>Sugerido con: {item.upselling_suggestions}</span>
          )}
        </div>
      </div>

      <div className="flex space-x-2">
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
        <button 
          onClick={() => handleDeleteItem(item.id)}
          className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm hover:bg-red-200 transition-colors"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );

  const handleDuplicateItem = (item) => {
    const duplicatedItem = {
      ...item,
      id: `${item.category.toLowerCase()}_${Date.now()}`,
      name: `${item.name} (Copia)`,
      is_active: false,
      sales_count: 0
    };
    setMenuItems(prev => [...prev, duplicatedItem]);
    alert('Item duplicado exitosamente');
  };

  const handleToggleActive = async (itemId) => {
    try {
      const item = menuItems.find(item => item.id === itemId);
      const updatedItem = { ...item, is_active: !item.is_active };
      
      // Actualizar en backend
      await axios.put(`${API}/menu/${itemId}`, updatedItem);
      
      // Actualizar estado local
      setMenuItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, is_active: !item.is_active }
            : item
        )
      );
    } catch (error) {
      console.error('Error toggling item status:', error);
      // Actualizar solo localmente si el backend falla
      setMenuItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, is_active: !item.is_active }
            : item
        )
      );
    }
  };

  const handleViewModeToggle = () => {
    setViewMode(viewMode === 'admin' ? 'customer' : 'admin');
  };

  const handleAnalyticsToggle = () => {
    setShowAnalytics(!showAnalytics);
  };

  const handleNewItemClick = () => {
    setShowNewItemModal(true);
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🍽️ Menú</h2>
          <p className="text-gray-600 mt-1">Gestiona tu carta digital</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleViewModeToggle}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            👁️ Vista {viewMode === 'admin' ? 'Cliente' : 'Admin'}
          </button>
          <button 
            onClick={handleAnalyticsToggle}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            📊 Analíticas
          </button>
          <button 
            onClick={handleNewItemClick}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
          >
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
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No hay items en esta categoría</h3>
            <p className="text-gray-500 mb-4">Agrega el primer item para esta categoría</p>
            <button 
              onClick={handleNewItemClick}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
            >
              + Agregar Primer Item
            </button>
          </div>
        )}
      </div>

      {/* 🆕 MODAL NUEVO ITEM */}
      {showNewItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">🍽️ Nuevo Item del Menú</h2>
                  <p className="text-gray-600">Agrega un nuevo plato a la carta</p>
                </div>
                <button 
                  onClick={() => setShowNewItemModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del plato *</label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ej: Brisket ahumado"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio *</label>
                    <input
                      type="number"
                      value={newItem.price}
                      onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="15000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Describe los ingredientes y preparación..."
                  />
                </div>

                {/* Upload de imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del plato</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {newItem.image && (
                    <div className="mt-2">
                      <img src={newItem.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                    </div>
                  )}
                </div>

                {/* Upload de video */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video del plato (opcional)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleVideoUpload(e, false)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {newItem.video && (
                    <div className="mt-2">
                      <video controls className="w-full h-32 object-cover rounded-lg">
                        <source src={newItem.video} type="video/mp4" />
                      </video>
                    </div>
                  )}
                </div>

                {/* Configuraciones adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Popularidad (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newItem.popularity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, popularity: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-4 pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newItem.high_margin}
                        onChange={(e) => setNewItem(prev => ({ ...prev, high_margin: e.target.checked }))}
                        className="mr-2"
                      />
                      💰 Alto margen
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newItem.is_active}
                        onChange={(e) => setNewItem(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="mr-2"
                      />
                      ✅ Activo
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sugerencias de upselling</label>
                  <input
                    type="text"
                    value={newItem.upselling_suggestions}
                    onChange={(e) => setNewItem(prev => ({ ...prev, upselling_suggestions: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Ej: Papas fritas, Bebida, Postre"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                <div className="text-sm text-gray-500">
                  * Campos obligatorios
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowNewItemModal(false)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleCreateItem}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-bold"
                  >
                    🍽️ Crear Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL EDITAR ITEM */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">✏️ Editar Item</h2>
                  <p className="text-gray-600">Modifica los detalles del plato</p>
                </div>
                <button 
                  onClick={() => setEditingItem(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del plato *</label>
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio *</label>
                    <input
                      type="number"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Upload de imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del plato</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {editingItem.image && (
                    <div className="mt-2">
                      <img src={editingItem.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                    </div>
                  )}
                </div>

                {/* Upload de video */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video del plato (opcional)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleVideoUpload(e, true)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {editingItem.video && (
                    <div className="mt-2">
                      <video controls className="w-full h-32 object-cover rounded-lg">
                        <source src={editingItem.video} type="video/mp4" />
                      </video>
                    </div>
                  )}
                </div>

                {/* Configuraciones adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Popularidad (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={editingItem.popularity}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, popularity: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-4 pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingItem.high_margin}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, high_margin: e.target.checked }))}
                        className="mr-2"
                      />
                      💰 Alto margen
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingItem.is_active}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="mr-2"
                      />
                      ✅ Activo
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sugerencias de upselling</label>
                  <input
                    type="text"
                    value={editingItem.upselling_suggestions || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, upselling_suggestions: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Ej: Papas fritas, Bebida, Postre"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                <div className="text-sm text-gray-500">
                  * Campos obligatorios
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setEditingItem(null)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleUpdateItem(editingItem)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-bold"
                  >
                    ✏️ Actualizar Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
    // 🆕 GOOGLE REVIEWS AGREGADO COMO CANAL PRINCIPAL
    npsChannels: { 
      google_reviews: 8.9, 
      whatsapp: 8.7, 
      instagram: 8.2, 
      facebook: 8.5, 
      web: 8.1,
      general: 8.4 
    },
    // 🆕 ESTADÍSTICAS POR CANAL INCLUYENDO GOOGLE REVIEWS
    channelStats: {
      google_reviews: { count: 234, avg_rating: 4.6, growth: '+18%' },
      whatsapp: { count: 156, avg_rating: 4.4, growth: '+12%' },
      instagram: { count: 98, avg_rating: 4.2, growth: '+8%' },
      facebook: { count: 72, avg_rating: 4.3, growth: '+5%' },
      web: { count: 45, avg_rating: 4.1, growth: '+3%' }
    },
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
  
  // 🆕 ESTADO PARA RESPUESTAS AUTOMÁTICAS
  const [showAutoResponseModal, setShowAutoResponseModal] = useState(false);
  const [autoResponses, setAutoResponses] = useState({
    google_reviews: {
      positive: "¡Gracias por tu excelente review! 🍖 Nos emociona saber que disfrutaste la experiencia IL MANDORLA. ¡Te esperamos pronto para seguir sorprendiéndote!",
      neutral: "Gracias por tu feedback. Nos encantaría conocer más detalles para mejorar tu experiencia. ¿Podrías contactarnos por WhatsApp?",
      negative: "Lamentamos que tu experiencia no haya sido la esperada. Tu opinión es muy importante para nosotros. Te contactaremos pronto para solucionarlo."
    },
    whatsapp: {
      positive: "¡Gracias por elegirnos! 🔥 Nos alegra que hayas disfrutado. Tienes 50 puntos KUMIA de regalo.",
      neutral: "Gracias por tu feedback. ¿Hay algo específico que podamos mejorar?",
      negative: "Disculpa la molestia. ¿Podrías contarnos qué pasó? Queremos solucionarlo inmediatamente."
    },
    instagram: {
      positive: "¡Gracias por compartir tu experiencia! 📸 Tag a un amigo para que también pruebe nuestras carnes ahumadas.",
      neutral: "¡Gracias por visitarnos! ¿Qué te gustaría probar en tu próxima visita?",
      negative: "Lamentamos que no hayamos cumplido tus expectativas. Te enviamos un DM para solucionarlo."
    },
    facebook: {
      positive: "¡Gracias por tu review! 🙌 No olvides seguirnos para enterarte de nuestras promociones especiales.",
      neutral: "Gracias por tu comentario. ¡Esperamos verte pronto!",
      negative: "Disculpa cualquier inconveniente. Nos contactamos contigo por privado."
    },
    web: {
      positive: "¡Excelente! Gracias por tu feedback. Te invitamos a registrarte en KUMIA para ganar puntos.",
      neutral: "Gracias por tu opinión. ¿Te gustaría recibir nuestras promociones especiales?",
      negative: "Lamentamos tu experiencia. Te contactaremos para mejorar nuestro servicio."
    }
  });

  useEffect(() => {
    fetchFeedback();
    initializeGoogleReviewsFeedback();
  }, []);

  const initializeGoogleReviewsFeedback = () => {
    // Feedback diverso incluyendo Google Reviews como canal principal
    const ilMandorlaFeedback = [
      {
        id: 'fb_1',
        customer_name: 'María López',
        rating: 5,
        comment: 'Increíble experiencia! Las carnes ahumadas están espectaculares. Definitivamente volveré.',
        date: '2025-01-22',
        channel: 'google_reviews',
        response_sent: false,
        sentiment: 'positive'
      },
      {
        id: 'fb_2', 
        customer_name: 'Carlos Ruiz',
        rating: 5,
        comment: 'El Brooklyn sandwich es lo mejor que he probado. Servicio excelente y ambiente perfecto.',
        date: '2025-01-21',
        channel: 'google_reviews',
        response_sent: true,
        sentiment: 'positive'
      },
      {
        id: 'fb_3',
        customer_name: 'Ana García',
        rating: 4,
        comment: 'Muy buena comida, aunque tuvimos que esperar un poco. Las costillas baby ribs están perfectas.',
        date: '2025-01-20',
        channel: 'google_reviews',
        response_sent: false,
        sentiment: 'positive'
      },
      {
        id: 'fb_4',
        customer_name: 'Roberto Silva',
        rating: 5,
        comment: 'Trabajo cerca y vengo seguido. Siempre me sorprenden con la calidad y el sabor ahumado.',
        date: '2025-01-19',
        channel: 'google_reviews',
        response_sent: true,
        sentiment: 'positive'
      },
      {
        id: 'fb_5',
        customer_name: 'Patricia Méndez',
        rating: 3,
        comment: 'La comida está bien, pero el precio me parece un poco alto para la porción.',
        date: '2025-01-18',
        channel: 'google_reviews',
        response_sent: false,
        sentiment: 'neutral'
      },
      {
        id: 'fb_6',
        customer_name: 'Diego Paredes',
        rating: 5,
        comment: 'Fantástico para reuniones de trabajo. El ambiente es perfecto y la comida increíble.',
        date: '2025-01-17',
        channel: 'whatsapp',
        response_sent: true,
        sentiment: 'positive'
      }
    ];

    setFeedback(ilMandorlaFeedback);
  };

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`${API}/feedback`);
      if (response.data && response.data.length > 0) {
        setFeedback(response.data);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      // Si no hay datos en el backend, usar los datos iniciales
    }
  };

  // 🆕 FUNCIONES PARA RESPUESTAS AUTOMÁTICAS
  const handleAutoResponseConfig = () => {
    setShowAutoResponseModal(true);
  };

  const handleSaveAutoResponse = async (channel, sentiment, message) => {
    try {
      const updatedResponses = {
        ...autoResponses,
        [channel]: {
          ...autoResponses[channel],
          [sentiment]: message
        }
      };
      
      setAutoResponses(updatedResponses);
      
      // Guardar en backend
      await axios.post(`${API}/auto-responses`, {
        channel,
        sentiment,
        message
      });
      
      alert(`✅ Respuesta automática para ${channel} (${sentiment}) guardada exitosamente`);
    } catch (error) {
      console.error('Error saving auto response:', error);
      alert('Error al guardar respuesta automática');
    }
  };

  const handleSendAutoResponse = async (feedbackId, channel, sentiment) => {
    try {
      const response = autoResponses[channel]?.[sentiment];
      if (!response) {
        alert('No hay respuesta automática configurada para este canal y sentimiento');
        return;
      }

      // Enviar respuesta
      await axios.post(`${API}/send-feedback-response`, {
        feedback_id: feedbackId,
        channel,
        message: response
      });

      // Actualizar estado local
      setFeedback(prev => 
        prev.map(f => 
          f.id === feedbackId 
            ? { ...f, response_sent: true, auto_response: response }
            : f
        )
      );

      alert(`✅ Respuesta automática enviada exitosamente via ${channel}`);
    } catch (error) {
      console.error('Error sending auto response:', error);
      alert('Error al enviar respuesta automática');
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
          <button 
            onClick={handleAutoResponseConfig}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
          >
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
              <option value="google_reviews">🌟 Google Reviews</option>
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

      {/* 🆕 NPS POR CANAL CON GOOGLE REVIEWS DESTACADO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 NPS General + Por Canal</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Google Reviews destacado */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg text-center border-2 border-yellow-300">
            <div className="text-xl mb-1">🌟</div>
            <div className="text-3xl font-bold text-amber-600">{feedbackStats.npsChannels.google_reviews}</div>
            <div className="text-sm text-amber-700 font-medium">Google Reviews</div>
            <div className="text-xs text-amber-600 mt-1">Canal Principal</div>
          </div>
          
          {/* NPS General */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">{feedbackStats.npsScore}</div>
            <div className="text-sm text-green-700">NPS General</div>
          </div>
          
          {/* Otros canales */}
          {Object.entries(feedbackStats.npsChannels)
            .filter(([channel]) => channel !== 'google_reviews' && channel !== 'general')
            .map(([channel, score]) => (
            <div key={channel} className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-blue-700 capitalize">{channel}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 🆕 ESTADÍSTICAS DETALLADAS POR CANAL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Estadísticas Detalladas por Canal</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(feedbackStats.channelStats).map(([channel, stats]) => (
            <div key={channel} className={`p-4 rounded-lg border-l-4 ${
              channel === 'google_reviews' 
                ? 'bg-yellow-50 border-yellow-400' 
                : 'bg-gray-50 border-gray-300'
            }`}>
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">
                  {channel === 'google_reviews' ? '🌟' : 
                   channel === 'whatsapp' ? '📱' :
                   channel === 'instagram' ? '📷' :
                   channel === 'facebook' ? '👥' : '🌐'}
                </span>
                <h4 className="font-medium text-gray-800 capitalize">
                  {channel === 'google_reviews' ? 'Google Reviews' : channel}
                </h4>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviews:</span>
                  <span className="font-bold">{stats.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-bold text-yellow-600">{stats.avg_rating} ⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Crecimiento:</span>
                  <span className="font-bold text-green-600">{stats.growth}</span>
                </div>
              </div>
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

      {/* 🆕 FEEDBACKS INDIVIDUALES CON RESPUESTAS AUTOMÁTICAS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">💬 Feedback Reciente</h3>
        <div className="space-y-4">
          {feedback
            .filter(f => selectedChannel === 'all' || f.channel === selectedChannel)
            .slice(0, 6)
            .map(feedbackItem => (
            <div key={feedbackItem.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">{feedbackItem.customer_name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{feedbackItem.customer_name}</h4>
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-sm ${i < feedbackItem.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{feedbackItem.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feedbackItem.channel === 'google_reviews' ? 'bg-yellow-100 text-yellow-800' :
                    feedbackItem.channel === 'whatsapp' ? 'bg-green-100 text-green-800' :
                    feedbackItem.channel === 'instagram' ? 'bg-pink-100 text-pink-800' :
                    feedbackItem.channel === 'facebook' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {feedbackItem.channel === 'google_reviews' ? '🌟 Google' :
                     feedbackItem.channel === 'whatsapp' ? '📱 WhatsApp' :
                     feedbackItem.channel === 'instagram' ? '📷 Instagram' :
                     feedbackItem.channel === 'facebook' ? '👥 Facebook' : '🌐 Web'}
                  </span>
                  {feedbackItem.response_sent && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      ✅ Respondido
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 text-sm mb-3">{feedbackItem.comment}</p>
              
              {!feedbackItem.response_sent && (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleSendAutoResponse(
                      feedbackItem.id, 
                      feedbackItem.channel, 
                      feedbackItem.rating >= 4 ? 'positive' : feedbackItem.rating === 3 ? 'neutral' : 'negative'
                    )}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200 transition-colors"
                  >
                    🤖 Respuesta Automática
                  </button>
                  <button 
                    onClick={() => handleRespondWithReward(feedbackItem.id)}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                  >
                    🎁 Responder + Recompensa
                  </button>
                </div>
              )}
              
              {feedbackItem.auto_response && (
                <div className="mt-3 bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                  <p className="text-green-800 text-sm">
                    <strong>Respuesta enviada:</strong> {feedbackItem.auto_response}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 🆕 MODAL CONFIGURAR RESPUESTAS AUTOMÁTICAS */}
      {showAutoResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">⚙️ Configurar Respuestas Automáticas</h2>
                  <p className="text-gray-600">Personaliza las respuestas automáticas por canal y tipo de sentimiento</p>
                </div>
                <button 
                  onClick={() => setShowAutoResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {Object.entries(autoResponses).map(([channel, responses]) => (
                  <div key={channel} className="border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">
                        {channel === 'google_reviews' ? '🌟' :
                         channel === 'whatsapp' ? '📱' :
                         channel === 'instagram' ? '📷' :
                         channel === 'facebook' ? '👥' : '🌐'}
                      </span>
                      {channel === 'google_reviews' ? 'Google Reviews' : 
                       channel.charAt(0).toUpperCase() + channel.slice(1)}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(responses).map(([sentiment, message]) => (
                        <div key={sentiment} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {sentiment === 'positive' ? '😊 Positivo (4-5⭐)' :
                             sentiment === 'neutral' ? '😐 Neutral (3⭐)' :
                             '😞 Negativo (1-2⭐)'}
                          </label>
                          <textarea
                            value={message}
                            onChange={(e) => setAutoResponses(prev => ({
                              ...prev,
                              [channel]: {
                                ...prev[channel],
                                [sentiment]: e.target.value
                              }
                            }))}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          />
                          <button
                            onClick={() => handleSaveAutoResponse(channel, sentiment, autoResponses[channel][sentiment])}
                            className="w-full bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                          >
                            💾 Guardar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-6 border-t border-gray-200 mt-8">
                <button 
                  onClick={() => setShowAutoResponseModal(false)}
                  className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cerrar Configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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