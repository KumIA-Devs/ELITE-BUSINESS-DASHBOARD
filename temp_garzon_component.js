// 👨‍💼 GESTIÓN GARZÓN WEBAPP - COMPLETE WAITER MANAGEMENT SYSTEM
export const GestionGarzonWebApp = () => {
  const [activeSection, setActiveSection] = useState('team-management');
  const [showAddWaiterModal, setShowAddWaiterModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState(null);
  
  // Mock data for waiters
  const [waiters, setWaiters] = useState([
    {
      id: 1,
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@ilmandorla.com',
      phone: '+595 21 123456',
      avatar: null,
      rating: 4.8,
      totalOrders: 234,
      avgDeliveryTime: 12.5, // minutes
      customerSatisfaction: 96,
      shiftsThisWeek: 5,
      hoursWorked: 42,
      tips: 450000,
      bonusPoints: 89,
      status: 'active',
      shift: 'morning',
      startDate: '2024-01-15',
      performance: {
        speed: 92,
        quality: 96,
        sales: 88,
        teamwork: 94
      },
      goals: {
        ordersTarget: 300,
        current: 234,
        satisfaction: 95,
        currentSatisfaction: 96
      },
      alerts: ['Excelente rendimiento esta semana', 'Cliente VIP asignado mesa 5']
    },
    {
      id: 2,
      name: 'Ana Rodriguez',
      email: 'ana.rodriguez@ilmandorla.com',
      phone: '+595 21 234567',
      avatar: null,
      rating: 4.6,
      totalOrders: 189,
      avgDeliveryTime: 14.2,
      customerSatisfaction: 92,
      shiftsThisWeek: 4,
      hoursWorked: 35,
      tips: 380000,
      bonusPoints: 67,
      status: 'active',
      shift: 'evening',
      startDate: '2024-03-01',
      performance: {
        speed: 88,
        quality: 94,
        sales: 85,
        teamwork: 91
      },
      goals: {
        ordersTarget: 250,
        current: 189,
        satisfaction: 93,
        currentSatisfaction: 92
      },
      alerts: ['Mejorar tiempo de entrega', 'Buen feedback en redes sociales']
    },
    {
      id: 3,
      name: 'Diego Paredes',
      email: 'diego.paredes@ilmandorla.com',
      phone: '+595 21 345678',
      avatar: null,
      rating: 4.9,
      totalOrders: 312,
      avgDeliveryTime: 10.8,
      customerSatisfaction: 98,
      shiftsThisWeek: 6,
      hoursWorked: 48,
      tips: 620000,
      bonusPoints: 134,
      status: 'active',
      shift: 'full-time',
      startDate: '2023-11-10',
      performance: {
        speed: 98,
        quality: 97,
        sales: 95,
        teamwork: 96
      },
      goals: {
        ordersTarget: 350,
        current: 312,
        satisfaction: 97,
        currentSatisfaction: 98
      },
      alerts: ['🏆 Top performer del mes', 'Mentor asignado para nuevos']
    }
  ]);

  // Sections configuration
  const sections = [
    { id: 'team-management', label: 'Gestión de Equipo', icon: '👥', desc: 'Administra garzones y métricas' },
    { id: 'global-metrics', label: 'Métricas Globales', icon: '📊', desc: 'Rendimiento general del equipo' },
    { id: 'performance-analysis', label: 'Análisis de Rendimiento', icon: '📈', desc: 'Rankings y comparativas' },
    { id: 'incentives', label: 'Sistema de Incentivos', icon: '🏆', desc: 'Bonos y recompensas' }
  ];

  // Individual Waiter Management Section
  const TeamManagementSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">👥 Gestión Individual de Garzones</h3>
        <button
          onClick={() => setShowAddWaiterModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          ➕ Agregar Garzón
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {waiters.map(waiter => (
          <div key={waiter.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
            {/* Waiter Header */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
                {waiter.avatar ? (
                  <img src={waiter.avatar} alt={waiter.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">{waiter.name.split(' ').map(n => n[0]).join('')}</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{waiter.name}</h4>
                <p className="text-sm text-gray-600">{waiter.email}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    waiter.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {waiter.status === 'active' ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{waiter.rating}</div>
                <div className="text-xs text-blue-700">Rating</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{waiter.totalOrders}</div>
                <div className="text-xs text-green-700">Órdenes</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{waiter.avgDeliveryTime}min</div>
                <div className="text-xs text-yellow-700">Tiempo Prom.</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{waiter.customerSatisfaction}%</div>
                <div className="text-xs text-purple-700">Satisfacción</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedWaiter(waiter)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                📊 Ver Detalles
              </button>
              <button
                onClick={() => { setSelectedWaiter(waiter); setShowShiftModal(true); }}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                ⏰ Gestionar Turno
              </button>
            </div>

            {/* Alerts */}
            {waiter.alerts.length > 0 && (
              <div className="mt-4 space-y-2">
                {waiter.alerts.map((alert, index) => (
                  <div key={index} className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200">
                    💡 {alert}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Global Metrics Section
  const GlobalMetricsSection = () => {
    const teamStats = {
      totalWaiters: waiters.length,
      activeWaiters: waiters.filter(w => w.status === 'active').length,
      avgRating: (waiters.reduce((sum, w) => sum + w.rating, 0) / waiters.length).toFixed(1),
      totalOrders: waiters.reduce((sum, w) => sum + w.totalOrders, 0),
      avgDeliveryTime: (waiters.reduce((sum, w) => sum + w.avgDeliveryTime, 0) / waiters.length).toFixed(1),
      avgSatisfaction: Math.round(waiters.reduce((sum, w) => sum + w.customerSatisfaction, 0) / waiters.length),
      totalTips: waiters.reduce((sum, w) => sum + w.tips, 0),
      totalHours: waiters.reduce((sum, w) => sum + w.hoursWorked, 0)
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">📊 Métricas Globales del Equipo</h3>
          <div className="flex space-x-3">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              📈 Reporte Semanal
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              📊 Exportar Datos
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-blue-800 font-medium">Equipo Total</h4>
              <span className="text-blue-600">👥</span>
            </div>
            <div className="text-3xl font-bold text-blue-700">{teamStats.totalWaiters}</div>
            <div className="text-sm text-blue-600">({teamStats.activeWaiters} activos)</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-green-800 font-medium">Rating Promedio</h4>
              <span className="text-green-600">⭐</span>
            </div>
            <div className="text-3xl font-bold text-green-700">{teamStats.avgRating}</div>
            <div className="text-sm text-green-600">sobre 5.0</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-yellow-800 font-medium">Órdenes Totales</h4>
              <span className="text-yellow-600">📋</span>
            </div>
            <div className="text-3xl font-bold text-yellow-700">{teamStats.totalOrders}</div>
            <div className="text-sm text-yellow-600">este mes</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-purple-800 font-medium">Satisfacción</h4>
              <span className="text-purple-600">😊</span>
            </div>
            <div className="text-3xl font-bold text-purple-700">{teamStats.avgSatisfaction}%</div>
            <div className="text-sm text-purple-600">promedio</div>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">📊 Distribución de Rendimiento</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-700 mb-3">Por Velocidad de Entrega</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">Excelente (&lt;12 min)</span>
                  <span className="font-bold text-green-600">
                    {waiters.filter(w => w.avgDeliveryTime < 12).length} garzones
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="text-sm">Bueno (12-15 min)</span>
                  <span className="font-bold text-yellow-600">
                    {waiters.filter(w => w.avgDeliveryTime >= 12 && w.avgDeliveryTime <= 15).length} garzones
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm">Mejorar (&gt;15 min)</span>
                  <span className="font-bold text-red-600">
                    {waiters.filter(w => w.avgDeliveryTime > 15).length} garzones
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 mb-3">Por Satisfacción del Cliente</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">Excelente (&gt;95%)</span>
                  <span className="font-bold text-green-600">
                    {waiters.filter(w => w.customerSatisfaction > 95).length} garzones
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="text-sm">Bueno (90-95%)</span>
                  <span className="font-bold text-yellow-600">
                    {waiters.filter(w => w.customerSatisfaction >= 90 && w.customerSatisfaction <= 95).length} garzones
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm">Mejorar (&lt;90%)</span>
                  <span className="font-bold text-red-600">
                    {waiters.filter(w => w.customerSatisfaction < 90).length} garzones
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KumIA Recommendations */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
          <h4 className="text-lg font-bold text-orange-800 mb-4">💡 Recomendaciones KumIA</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h5 className="font-medium text-orange-700 mb-2">🎯 Optimización Sugerida</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Capacitación en velocidad para Ana Rodriguez</li>
                <li>• Diego Paredes como mentor de nuevos garzones</li>
                <li>• Redistribuir cargas en horario pico</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h5 className="font-medium text-orange-700 mb-2">📈 Oportunidades de Crecimiento</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Implementar bonos por velocidad de entrega</li>
                <li>• Sistema de reconocimiento semanal</li>
                <li>• Programa de desarrollo de liderazgo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Performance Analysis Section
  const PerformanceAnalysisSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">📈 Análisis de Rendimiento y Rankings</h3>
        <div className="flex space-x-3">
          <select className="border border-gray-300 rounded-lg px-4 py-2">
            <option>Esta semana</option>
            <option>Este mes</option>
            <option>Último trimestre</option>
          </select>
          <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
            📊 Comparar Períodos
          </button>
        </div>
      </div>

      {/* Performance Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">🏆 Ranking por Rating</h4>
          <div className="space-y-3">
            {waiters
              .sort((a, b) => b.rating - a.rating)
              .map((waiter, index) => (
                <div key={waiter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{waiter.name}</div>
                      <div className="text-sm text-gray-600">{waiter.totalOrders} órdenes</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">{waiter.rating}</div>
                    <div className="text-sm text-gray-600">rating</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">⚡ Ranking por Velocidad</h4>
          <div className="space-y-3">
            {waiters
              .sort((a, b) => a.avgDeliveryTime - b.avgDeliveryTime)
              .map((waiter, index) => (
                <div key={waiter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white font-bold ${
                      index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-400' : index === 2 ? 'bg-purple-400' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{waiter.name}</div>
                      <div className="text-sm text-gray-600">{waiter.customerSatisfaction}% satisfacción</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">{waiter.avgDeliveryTime}min</div>
                    <div className="text-sm text-gray-600">promedio</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Detailed Performance Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">📊 Análisis Detallado de Performance</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Garzón</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Velocidad</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Calidad</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Ventas</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Trabajo en Equipo</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {waiters.map(waiter => (
                <tr key={waiter.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">
                          {waiter.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="font-medium text-gray-800">{waiter.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      waiter.performance.speed >= 95 ? 'bg-green-100 text-green-800' :
                      waiter.performance.speed >= 90 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {waiter.performance.speed}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      waiter.performance.quality >= 95 ? 'bg-green-100 text-green-800' :
                      waiter.performance.quality >= 90 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {waiter.performance.quality}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      waiter.performance.sales >= 95 ? 'bg-green-100 text-green-800' :
                      waiter.performance.sales >= 90 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {waiter.performance.sales}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      waiter.performance.teamwork >= 95 ? 'bg-green-100 text-green-800' :
                      waiter.performance.teamwork >= 90 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {waiter.performance.teamwork}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {Math.round((waiter.performance.speed + waiter.performance.quality + waiter.performance.sales + waiter.performance.teamwork) / 4)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Incentives System Section
  const IncentivesSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">🏆 Sistema de Incentivos y Bonificaciones</h3>
        <button
          onClick={() => setShowIncentiveModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          ➕ Crear Incentivo
        </button>
      </div>

      {/* Monthly Goals Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">🎯 Progreso de Metas Mensuales</h4>
        <div className="space-y-4">
          {waiters.map(waiter => (
            <div key={waiter.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">
                      {waiter.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{waiter.name}</div>
                    <div className="text-sm text-gray-600">Meta: {waiter.goals.ordersTarget} órdenes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">
                    {Math.round((waiter.goals.current / waiter.goals.ordersTarget) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">completado</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((waiter.goals.current / waiter.goals.ordersTarget) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>{waiter.goals.current} / {waiter.goals.ordersTarget} órdenes</span>
                <span>{waiter.goals.ordersTarget - waiter.goals.current} restantes</span>
              </div>

              {/* Potential Bonus */}
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-800">Bono por cumplimiento:</span>
                  <span className="font-bold text-green-600">$50.000</span>
                </div>
                {waiter.goals.current >= waiter.goals.ordersTarget && (
                  <div className="text-xs text-green-700 mt-1">🎉 ¡Meta cumplida! Bono disponible</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bonus Programs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">💰 Programas de Bonificación Activos</h4>
          <div className="space-y-4">
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-green-800">🏃 Bonus por Velocidad</h5>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Activo</span>
              </div>
              <p className="text-sm text-green-700">$10.000 extra por mantener tiempo promedio &lt;12 min durante la semana</p>
              <div className="text-xs text-green-600 mt-2">Elegibles: Diego Paredes</div>
            </div>

            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-blue-800">⭐ Bonus por Rating</h5>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Activo</span>
              </div>
              <p className="text-sm text-blue-700">$15.000 por mantener rating superior a 4.8 durante el mes</p>
              <div className="text-xs text-blue-600 mt-2">Elegibles: Carlos Mendoza, Diego Paredes</div>
            </div>

            <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-purple-800">👥 Bonus de Trabajo en Equipo</h5>
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">Activo</span>
              </div>
              <p className="text-sm text-purple-700">$20.000 por ayudar en capacitación de nuevos garzones</p>
              <div className="text-xs text-purple-600 mt-2">Elegibles: Diego Paredes (mentor activo)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">🎁 Sistema de Reconocimiento</h4>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-medium text-yellow-800 mb-2">🏆 Garzón del Mes</h5>
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs font-bold">DP</span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Diego Paredes</div>
                  <div className="text-sm text-gray-600">94.75% rendimiento promedio</div>
                </div>
              </div>
              <div className="text-sm text-yellow-700">
                Premio: $100.000 + día libre extra + reconocimiento público
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-gray-700">🌟 Próximos Reconocimientos</h5>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Mejor Feedback del Cliente</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Diego (98%)</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Mayor Crecimiento</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Ana (+12%)</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Mejor Compañero</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Carlos</span>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium">
              🏆 Otorgar Reconocimiento
            </button>
          </div>
        </div>
      </div>

      {/* Tip Distribution System */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h4 className="text-lg font-bold text-blue-800 mb-4">💳 Sistema Inteligente de Distribución de Propinas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-blue-700 mb-3">📊 Distribución Actual (Semanal)</h5>
            <div className="space-y-2">
              {waiters.map(waiter => (
                <div key={waiter.id} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="text-sm font-medium text-gray-800">{waiter.name}</span>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">${waiter.tips.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {Math.round((waiter.tips / waiters.reduce((sum, w) => sum + w.tips, 0)) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-blue-700 mb-3">⚙️ Configuración del Sistema</h5>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span>Base equitativa:</span>
                <span className="font-medium">40%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span>Por rendimiento:</span>
                <span className="font-medium">35%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span>Por horas trabajadas:</span>
                <span className="font-medium">20%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span>Bonus especiales:</span>
                <span className="font-medium">5%</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
              ⚙️ Ajustar Distribución
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'team-management':
        return <TeamManagementSection />;
      case 'global-metrics':
        return <GlobalMetricsSection />;
      case 'performance-analysis':
        return <PerformanceAnalysisSection />;
      case 'incentives':
        return <IncentivesSection />;
      default:
        return <TeamManagementSection />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">👨‍💼 Gestión Garzón WebApp</h2>
          <p className="text-gray-600 mt-1">Sistema integral de gestión de equipo para optimizar rendimiento y cultura laboral</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            📱 Abrir App Garzón
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
            📊 Reporte General
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Módulos</h3>
            <div className="space-y-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl mr-3">{section.icon}</span>
                  <div>
                    <div className="font-medium">{section.label}</div>
                    <div className="text-xs opacity-75">{section.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {renderActiveSection()}
        </div>
      </div>

      {/* Add Waiter Modal */}
      {showAddWaiterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">➕ Agregar Nuevo Garzón</h2>
                <button
                  onClick={() => setShowAddWaiterModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Carlos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Mendoza"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="carlos.mendoza@ilmandorla.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+595 21 123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Turno preferido</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="morning">Mañana (6:00 - 14:00)</option>
                    <option value="evening">Tarde (14:00 - 22:00)</option>
                    <option value="night">Noche (22:00 - 6:00)</option>
                    <option value="full-time">Tiempo Completo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setShowAddWaiterModal(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    alert('✅ Garzón agregado exitosamente');
                    setShowAddWaiterModal(false);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-bold"
                >
                  👨‍💼 Agregar Garzón
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shift Management Modal */}
      {showShiftModal && selectedWaiter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">⏰ Gestión de Turnos</h2>
                <button
                  onClick={() => { setShowShiftModal(false); setSelectedWaiter(null); }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">👨‍💼 {selectedWaiter.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Turno actual:</span>
                      <span className="ml-2 font-medium">{selectedWaiter.shift}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Horas semana:</span>
                      <span className="ml-2 font-medium">{selectedWaiter.hoursWorked}h</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar nuevo turno</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="morning">🌅 Mañana (6:00 - 14:00)</option>
                    <option value="evening">🌆 Tarde (14:00 - 22:00)</option>
                    <option value="night">🌙 Noche (22:00 - 6:00)</option>
                    <option value="full-time">⏰ Tiempo Completo</option>
                    <option value="flexible">🔄 Horario Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Días de la semana</label>
                  <div className="grid grid-cols-7 gap-2">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                      <label key={day} className="flex items-center justify-center">
                        <input type="checkbox" className="sr-only" />
                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-orange-600">
                          {day}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">💡 Recomendación KumIA</h4>
                  <p className="text-sm text-green-700">
                    Basado en el rendimiento de {selectedWaiter.name}, recomendamos mantener 
                    el turno actual para maximizar su productividad y satisfacción laboral.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => { setShowShiftModal(false); setSelectedWaiter(null); }}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    alert('✅ Turno actualizado exitosamente');
                    setShowShiftModal(false);
                    setSelectedWaiter(null);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-bold"
                >
                  ⏰ Actualizar Turno
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};