import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// 🆕 ROI VIEWER SECTION AMPLIADA
export const ROIViewer = () => {
  const [roiData, setRoiData] = useState({
    monthlyIncrease: 4.3,
    averageTicket: { before: 2500, after: 3200 },
    attributedRevenue: 145000,
    channelRevenue: {
      whatsapp: 45000,
      instagram: 32000,
      tiktok: 28000,
      web: 40000
    },
    monthlyComparison: {
      current: 145000,
      previous: 119000,
      growth: 21.8
    }
  });
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [projectionData, setProjectionData] = useState({
    next30: 175000,
    next60: 210000,
    next90: 245000
  });

  // 🆕 ROI POR CANAL
  const ChannelROICard = ({ channel, revenue, growth, icon, color }) => (
    <div className={`bg-gradient-to-r ${color} p-6 rounded-xl text-white`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{icon}</span>
          <h3 className="font-bold text-lg">{channel}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">${revenue.toLocaleString()}</div>
          <div className="text-sm opacity-90">+{growth}%</div>
        </div>
      </div>
      <div className="bg-white bg-opacity-20 rounded-full h-2">
        <div 
          className="bg-white h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(growth * 2, 100)}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">📊 ROI Viewer</h2>
          <p className="text-gray-600 mt-1">Impacto económico detallado del sistema KUMIA</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="30d">Últimos 30 días</option>
            <option value="60d">Últimos 60 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            📤 Exportar Reporte
          </button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-4xl font-bold text-green-600">+{roiData.monthlyIncrease}x</div>
          <div className="text-sm text-gray-600">ROI Mensual</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-4xl font-bold text-blue-600">${roiData.attributedRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Ingresos Atribuidos</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-4xl font-bold text-purple-600">${roiData.averageTicket.after.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Ticket Promedio</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-4xl font-bold text-orange-600">+{roiData.monthlyComparison.growth}%</div>
          <div className="text-sm text-gray-600">Crecimiento Mensual</div>
        </div>
      </div>

      {/* 🆕 COMPARATIVA HISTÓRICA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Comparativa Histórica</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">${roiData.monthlyComparison.current.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Últimos 30 días</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">${roiData.monthlyComparison.previous.toLocaleString()}</div>
            <div className="text-sm text-gray-600">30 días anteriores</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">+{roiData.monthlyComparison.growth}%</div>
            <div className="text-sm text-gray-600">Crecimiento</div>
          </div>
        </div>
      </div>

      {/* ROI por Canal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ChannelROICard
          channel="WhatsApp"
          revenue={roiData.channelRevenue.whatsapp}
          growth={35}
          icon="📱"
          color="from-green-500 to-emerald-500"
        />
        <ChannelROICard
          channel="Instagram"
          revenue={roiData.channelRevenue.instagram}
          growth={28}
          icon="📸"
          color="from-pink-500 to-rose-500"
        />
        <ChannelROICard
          channel="TikTok"
          revenue={roiData.channelRevenue.tiktok}
          growth={42}
          icon="🎵"
          color="from-purple-500 to-violet-500"
        />
        <ChannelROICard
          channel="Web"
          revenue={roiData.channelRevenue.web}
          growth={18}
          icon="🌐"
          color="from-blue-500 to-indigo-500"
        />
      </div>

      {/* 🆕 PROYECCIÓN DE RETORNO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔮 Proyección de Retorno</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">${projectionData.next30.toLocaleString()}</div>
            <div className="text-sm text-blue-700">Próximos 30 días</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">${projectionData.next60.toLocaleString()}</div>
            <div className="text-sm text-purple-700">Próximos 60 días</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">${projectionData.next90.toLocaleString()}</div>
            <div className="text-sm text-green-700">Próximos 90 días</div>
          </div>
        </div>
      </div>

      {/* 🆕 ANÁLISIS DE VALOR POR CLIENTE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Análisis de Valor por Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Ingreso Promedio por Cliente</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Clientes Nuevos</span>
                <span className="font-bold text-green-600">$2,850</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Clientes Recurrentes</span>
                <span className="font-bold text-blue-600">$4,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Clientes VIP</span>
                <span className="font-bold text-purple-600">$6,750</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Costo vs Retención</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Costo de Adquisición</span>
                <span className="font-bold text-red-600">$125</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Costo de Retención</span>
                <span className="font-bold text-orange-600">$45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">LTV Promedio</span>
                <span className="font-bold text-green-600">$8,950</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights de IA */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">🧠</span>
          <h3 className="text-lg font-bold text-indigo-800">Insights de IA</h3>
        </div>
        <div className="space-y-3">
          <p className="text-indigo-700">
            <strong>Canal más rentable:</strong> WhatsApp representa el 65% de tus ingresos este mes con una tasa de conversión del 35%.
          </p>
          <p className="text-indigo-700">
            <strong>Oportunidad detectada:</strong> Los clientes que usan NFTs gastan 40% más. Considera expandir el programa.
          </p>
          <p className="text-indigo-700">
            <strong>Proyección:</strong> Manteniendo el ritmo actual, alcanzarás un ROI de +5.2x en los próximos 60 días.
          </p>
        </div>
      </div>
    </div>
  );
};

// 🆕 RECOMPENSAS & NFTS SECTION AMPLIADA
export const RewardsNFTsSection = () => {
  const [rewards, setRewards] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [weeklyRedemptions, setWeeklyRedemptions] = useState([45, 52, 38, 67, 43, 71, 59]);
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  useEffect(() => {
    fetchRewards();
    fetchTopClients();
    fetchCampaigns();
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

  const fetchCampaigns = async () => {
    // Mock data para campañas
    setCampaigns([
      { id: 1, name: 'Campaña Navidad', status: 'active', rewards: 25, engagement: 78 },
      { id: 2, name: 'Clientes VIP', status: 'active', rewards: 12, engagement: 95 },
      { id: 3, name: 'Verano 2024', status: 'completed', rewards: 56, engagement: 82 }
    ]);
  };

  // 🆕 MÉTRICAS DE IMPACTO
  const ImpactMetrics = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Métricas de Impacto</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">+42%</div>
          <div className="text-sm text-green-700">Retorno por NFT</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">$125</div>
          <div className="text-sm text-blue-700">Costo por Adquisición</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">87%</div>
          <div className="text-sm text-purple-700">Tasa de Retención</div>
        </div>
      </div>
    </div>
  );

  // 🆕 SIMULADOR DE PUNTOS
  const PointsSimulator = () => {
    const [simulationData, setSimulationData] = useState({
      visits: 5,
      avgSpend: 3200,
      pointsPerDollar: 1,
      estimatedReturn: 0
    });

    const calculateReturn = () => {
      const totalSpend = simulationData.visits * simulationData.avgSpend;
      const totalPoints = totalSpend * simulationData.pointsPerDollar;
      const estimatedReturn = totalPoints * 0.05; // 5% return rate
      setSimulationData(prev => ({ ...prev, estimatedReturn }));
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🧮 Simulador de Puntos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visitas por mes</label>
              <input
                type="number"
                value={simulationData.visits}
                onChange={(e) => setSimulationData(prev => ({ ...prev, visits: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gasto promedio</label>
              <input
                type="number"
                value={simulationData.avgSpend}
                onChange={(e) => setSimulationData(prev => ({ ...prev, avgSpend: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={calculateReturn}
              className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Calcular Retorno
            </button>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Resultado Estimado</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-purple-700">Puntos generados:</span>
                <span className="font-bold text-purple-800">{(simulationData.visits * simulationData.avgSpend).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-purple-700">Retorno estimado:</span>
                <span className="font-bold text-purple-800">${simulationData.estimatedReturn.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
        <div className="flex flex-col items-end">
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {nft.points_required} pts
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Estado: {nft.status || 'Activo'}
          </span>
        </div>
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
          ✏️ Editar
        </button>
        <button className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm hover:bg-green-200 transition-colors">
          ✅ Activar
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🎁 Recompensas & NFTs</h2>
          <p className="text-gray-600 mt-1">Gamificación para retención y engagement</p>
        </div>
        <button 
          onClick={() => setShowCreateCampaign(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
        >
          🚀 Crear Nueva Campaña de Fidelización
        </button>
      </div>

      {/* Métricas de Impacto */}
      <ImpactMetrics />

      {/* Weekly Redemptions Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4">📊 Canjes Semanales</h3>
        <div className="flex items-end justify-between h-32">
          {weeklyRedemptions.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="text-xs text-gray-600 mb-1">{value}</div>
              <div 
                className="bg-gradient-to-t from-purple-400 to-pink-400 rounded-t-lg transition-all duration-500 w-8"
                style={{ height: `${(value / 80) * 100}%` }}
              ></div>
              <span className="text-xs text-gray-500 mt-1">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 🆕 CAMPAÑAS ACTIVAS VS PASADAS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Campañas Activas vs Pasadas</h3>
        <div className="space-y-4">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  campaign.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <div>
                  <h4 className="font-medium text-gray-800">{campaign.name}</h4>
                  <p className="text-sm text-gray-600">{campaign.rewards} recompensas entregadas</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{campaign.engagement}%</div>
                  <div className="text-xs text-gray-600">Engagement</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status === 'active' ? 'Activa' : 'Completada'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🆕 HISTORIAL DE UPGRADES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Historial de Upgrades</h3>
        <div className="space-y-3">
          {[
            { client: 'Juan Pérez', from: 'Bronce', to: 'Plata', date: '2024-01-15', impact: '+25% gasto' },
            { client: 'María García', from: 'Plata', to: 'Oro', date: '2024-01-12', impact: '+40% visitas' },
            { client: 'Carlos López', from: 'Oro', to: 'Citizen KUMIA', date: '2024-01-08', impact: '+60% referidos' }
          ].map((upgrade, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">↗</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{upgrade.client}</h4>
                  <p className="text-sm text-gray-600">{upgrade.from} → {upgrade.to}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">{upgrade.impact}</div>
                <div className="text-xs text-gray-500">{upgrade.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulador de Puntos */}
      <PointsSimulator />

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

      {/* 🆕 EDITOR DE NIVELES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ Editor de Niveles</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['Bronce', 'Plata', 'Oro', 'Citizen KUMIA'].map(level => (
            <div key={level} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">{level}</h4>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Puntos requeridos"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="Beneficios"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="w-full bg-purple-100 text-purple-700 px-3 py-2 rounded text-sm hover:bg-purple-200 transition-colors">
                  Actualizar
                </button>
              </div>
            </div>
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

// 🆕 INTEGRACIONES SECTION AMPLIADA
export const IntegrationsSection = () => {
  const [integrations, setIntegrations] = useState([
    { id: 'meta', name: 'Meta Business Suite', type: 'social', status: 'connected', icon: '👥', lastSync: '2024-01-15 10:30' },
    { id: 'stripe', name: 'Stripe', type: 'payment', status: 'disconnected', icon: '💳', lastSync: null },
    { id: 'openai', name: 'OpenAI', type: 'ai', status: 'connected', icon: '🤖', lastSync: '2024-01-15 11:15' },
    { id: 'n8n', name: 'n8n Automation', type: 'automation', status: 'error', icon: '🔄', lastSync: '2024-01-14 15:20' },
    { id: 'tiktok', name: 'TikTok Business', type: 'social', status: 'disconnected', icon: '🎵', lastSync: null }
  ]);

  const [showCustomERP, setShowCustomERP] = useState(false);
  const [customIntegration, setCustomIntegration] = useState({
    name: '',
    url: '',
    authMethod: 'token',
    apiKey: '',
    syncFrequency: '24h'
  });

  const handleToggleIntegration = (id) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, status: integration.status === 'connected' ? 'disconnected' : 'connected' }
          : integration
      )
    );
  };

  const handleTestConnection = async (integrationId) => {
    alert(`Probando conexión para ${integrationId}...`);
    // Simular test
    setTimeout(() => {
      alert('✅ Conexión exitosa');
    }, 2000);
  };

  const handleRetryConnection = (integrationId) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'connected', lastSync: new Date().toISOString() }
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

      {/* 🆕 ESTADO VISUAL DETALLADO */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              integration.status === 'connected' ? 'bg-green-500' : 
              integration.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm font-medium">
              {integration.status === 'connected' ? '🟢 Conectado' : 
               integration.status === 'error' ? '🔴 Error' : '🔴 Desconectado'}
            </span>
          </div>
          {integration.status === 'error' && (
            <button
              onClick={() => handleRetryConnection(integration.id)}
              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
            >
              🔄 Reintentar
            </button>
          )}
        </div>
        
        {/* 🆕 FECHA DE ÚLTIMA SINCRONIZACIÓN */}
        <div className="text-xs text-gray-500 mb-2">
          {integration.lastSync ? (
            <span>Última sincronización: {new Date(integration.lastSync).toLocaleString()}</span>
          ) : (
            <span>Sin sincronización</span>
          )}
        </div>
        
        <p className="text-xs text-gray-600">
          {integration.status === 'connected' 
            ? 'Integración activa y funcionando correctamente' 
            : integration.status === 'error' 
            ? 'Error en la conexión. Verificar credenciales'
            : 'Configurar credenciales para activar'}
        </p>
      </div>

      {/* 🆕 LOG DE ERRORES */}
      {integration.status === 'error' && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-1">🚨 Log de Errores</h4>
          <div className="text-xs text-red-700">
            • Error de autenticación: Token expirado<br/>
            • Último intento: {integration.lastSync}<br/>
            • Reintentos automáticos: 3/3
          </div>
        </div>
      )}

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
          <button 
            onClick={() => handleTestConnection(integration.id)}
            className="w-full bg-orange-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors"
          >
            🧪 Probar Conexión
          </button>
        </div>
      )}

      {/* 🆕 INFORMACIÓN CONTEXTUAL */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-1">❓ ¿Qué activa esta integración?</h4>
        <p className="text-xs text-blue-700">
          {integration.id === 'meta' && 'Gestión automática de WhatsApp, Instagram y Facebook. Sincronización de mensajes y métricas.'}
          {integration.id === 'stripe' && 'Procesamiento de pagos y suscripciones. Seguimiento de transacciones en tiempo real.'}
          {integration.id === 'openai' && 'Capacidades de IA para chatbots, análisis de sentimientos y automatización de respuestas.'}
          {integration.id === 'n8n' && 'Automatización de workflows y procesos. Triggers personalizados y acciones en cadena.'}
          {integration.id === 'tiktok' && 'Gestión de contenido y engagement en TikTok. Análisis de performance y audiencia.'}
        </p>
      </div>
    </div>
  );

  return (
    <div id="integration_panel" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🔗 Integraciones</h2>
          <p className="text-gray-600 mt-1">Conexiones sin necesidad de técnico externo</p>
        </div>
        <button 
          onClick={() => setShowCustomERP(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105"
        >
          ➕ Conectar ERP/CRM Personalizado
        </button>
      </div>

      {/* Integration Status Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4">📊 Estado de Integraciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">
              {integrations.filter(i => i.status === 'error').length}
            </div>
            <div className="text-sm text-yellow-700">Con Errores</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {integrations.length}
            </div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map(integration => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {/* 🆕 WEBHOOK TESTER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔧 Webhook Tester Integrado</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL del Webhook</label>
            <input
              type="url"
              placeholder="https://tu-webhook.com/endpoint"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Método HTTP</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="POST">POST</option>
              <option value="GET">GET</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payload de Prueba</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              placeholder='{"test": "data", "timestamp": "2024-01-15T10:30:00Z"}'
            />
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            🚀 Probar Webhook
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
            📋 Historial de Pruebas
          </button>
        </div>
      </div>

      {/* 🆕 MODAL ERP/CRM PERSONALIZADO */}
      {showCustomERP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold mb-4">🏢 Conectar ERP/CRM Personalizado</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Sistema</label>
                <input
                  type="text"
                  value={customIntegration.name}
                  onChange={(e) => setCustomIntegration(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Poster POS, Oracle Micros, HubSpot"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL del Endpoint API</label>
                <input
                  type="url"
                  value={customIntegration.url}
                  onChange={(e) => setCustomIntegration(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://tu-erp.com/api/v1/webhook"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Método de Autenticación</label>
                  <select
                    value={customIntegration.authMethod}
                    onChange={(e) => setCustomIntegration(prev => ({ ...prev, authMethod: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="token">Token API</option>
                    <option value="apikey">API Key</option>
                    <option value="oauth">OAuth 2.0</option>
                    <option value="basic">Basic Auth</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia de Sincronización</label>
                  <select
                    value={customIntegration.syncFrequency}
                    onChange={(e) => setCustomIntegration(prev => ({ ...prev, syncFrequency: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="1h">Cada hora</option>
                    <option value="4h">Cada 4 horas</option>
                    <option value="24h">Cada 24 horas</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credenciales</label>
                <input
                  type="password"
                  value={customIntegration.apiKey}
                  onChange={(e) => setCustomIntegration(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Tu API Key o Token"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* 🆕 EJEMPLOS SUGERIDOS */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">💡 Ejemplos Sugeridos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button className="text-left text-sm text-blue-700 hover:bg-blue-100 p-2 rounded">
                    📊 Poster POS - Sistema de punto de venta
                  </button>
                  <button className="text-left text-sm text-blue-700 hover:bg-blue-100 p-2 rounded">
                    🏢 Oracle Micros - Gestión restaurantes
                  </button>
                  <button className="text-left text-sm text-blue-700 hover:bg-blue-100 p-2 rounded">
                    📈 HubSpot - CRM y marketing
                  </button>
                  <button className="text-left text-sm text-blue-700 hover:bg-blue-100 p-2 rounded">
                    💼 Salesforce - Gestión de clientes
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowCustomERP(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleTestConnection('custom')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  🧪 Probar Conexión
                </button>
                <button 
                  onClick={() => setShowCustomERP(false)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  ✅ Conectar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🆕 CONFIGURATION SECTION AMPLIADA - KUMIA ELITE
export const ConfigurationSection = () => {
  const [activeConfigTab, setActiveConfigTab] = useState('general');
  const [businessInfo, setBusinessInfo] = useState({
    name: 'IL MANDORLA SMOKEHOUSE',
    address: 'Av. Revolución 1234, Ciudad de México',
    phone: '+52 55 1234 5678',
    email: 'info@ilmandorla.com',
    instagram: '@ilmandorla',
    facebook: 'IL MANDORLA Official',
    tiktok: '@ilmandorla',
    whatsapp: '+52 55 1234 5678',
    hours: {
      monday: { open: '09:00', close: '22:00', active: true },
      tuesday: { open: '09:00', close: '22:00', active: true },
      wednesday: { open: '09:00', close: '22:00', active: true },
      thursday: { open: '09:00', close: '22:00', active: true },
      friday: { open: '09:00', close: '23:00', active: true },
      saturday: { open: '10:00', close: '23:00', active: true },
      sunday: { open: '10:00', close: '21:00', active: true }
    },
    cuisineType: 'Smokehouse Premium',
    logo: 'https://images.app.goo.gl/HySig5BgebwJZG6B9',
    brandColors: {
      primary: '#FF6B35',
      secondary: '#FFFFFF',
      accent: '#FF8C42'
    },
    aiAvatar: 'https://images.app.goo.gl/ai-avatar-example'
  });

  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Administrador', permissions: ['all'], users: 2, description: 'Acceso completo al sistema' },
    { id: 'supervisor', name: 'Supervisor', permissions: ['dashboard', 'menu', 'customers', 'reservations', 'feedback'], users: 3, description: 'Gestión operativa' },
    { id: 'staff', name: 'Personal', permissions: ['menu', 'reservations'], users: 8, description: 'Acceso básico' }
  ]);

  const [integrations, setIntegrations] = useState([
    { id: 'meta', name: 'Meta Business Suite', status: 'active', config: { pageId: 'IL_MANDORLA_PAGE', accessToken: '****' } },
    { id: 'whatsapp', name: 'WhatsApp Cloud API', status: 'active', config: { phoneNumber: '+525512345678', apiKey: '****' } },
    { id: 'openai', name: 'OpenAI', status: 'active', config: { model: 'gpt-4o', apiKey: '****' } },
    { id: 'stripe', name: 'Stripe', status: 'inactive', config: { publicKey: '', secretKey: '' } },
    { id: 'crm', name: 'CRM Externo', status: 'inactive', config: { endpoint: '', credentials: '' } },
    { id: 'erp', name: 'ERP Local', status: 'inactive', config: { webhook: '', jsonCredentials: '' } }
  ]);

  const [notifications, setNotifications] = useState({
    newFeedback: { whatsapp: true, email: true, telegram: false },
    newReservation: { whatsapp: true, email: true, telegram: false },
    campaignActivated: { whatsapp: true, email: false, telegram: false },
    intervals: {
      feedback: 'immediate',
      reservations: 'immediate',
      reports: 'daily'
    },
    testMode: false
  });

  const configTabs = [
    { id: 'general', label: 'General', icon: '🏢', desc: 'Información del Negocio' },
    { id: 'roles', label: 'Roles y Permisos', icon: '👥', desc: 'Gestión de usuarios y accesos' },
    { id: 'integrations', label: 'Integraciones', icon: '🔗', desc: 'Conexiones externas' },
    { id: 'notifications', label: 'Notificaciones', icon: '🔔', desc: 'Alertas y reportes' }
  ];

  const handleBusinessInfoChange = (field, value) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveBusinessInfo = () => {
    // Auto-save functionality
    alert('Información del negocio guardada automáticamente');
  };

  const handleTestIntegration = (integrationId) => {
    alert(`Probando integración: ${integrationId}`);
  };

  const handleTestNotification = (channel, type) => {
    alert(`Enviando notificación de prueba por ${channel} para ${type}`);
  };

  // 🆕 GENERAL - INFORMACIÓN DEL NEGOCIO
  const GeneralConfig = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🏢 Información Básica del Negocio</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Negocio</label>
            <input
              type="text"
              value={businessInfo.name}
              onChange={(e) => handleBusinessInfoChange('name', e.target.value)}
              onBlur={handleSaveBusinessInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="IL MANDORLA SMOKEHOUSE"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Cocina</label>
            <input
              type="text"
              value={businessInfo.cuisineType}
              onChange={(e) => handleBusinessInfoChange('cuisineType', e.target.value)}
              onBlur={handleSaveBusinessInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Smokehouse Premium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
            <input
              type="text"
              value={businessInfo.address}
              onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
              onBlur={handleSaveBusinessInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Av. Revolución 1234, Ciudad de México"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input
              type="tel"
              value={businessInfo.phone}
              onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
              onBlur={handleSaveBusinessInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="+52 55 1234 5678"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={businessInfo.email}
              onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
              onBlur={handleSaveBusinessInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="info@ilmandorla.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
            <input
              type="tel"
              value={businessInfo.whatsapp}
              onChange={(e) => handleBusinessInfoChange('whatsapp', e.target.value)}
              onBlur={handleSaveBusinessInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="+52 55 1234 5678"
            />
          </div>
        </div>
      </div>

      {/* Redes Sociales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📱 Redes Sociales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
            <input
              type="text"
              value={businessInfo.instagram}
              onChange={(e) => handleBusinessInfoChange('instagram', e.target.value)}
              onBlur={handleSaveBusinessInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="@ilmandorla"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
            <input
              type="text"
              value={businessInfo.facebook}
              onChange={(e) => handleBusinessInfoChange('facebook', e.target.value)}
              onBlur={handleSaveBusinessInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="IL MANDORLA Official"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
            <input
              type="text"
              value={businessInfo.tiktok}
              onChange={(e) => handleBusinessInfoChange('tiktok', e.target.value)}
              onBlur={handleSaveBusinessInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="@ilmandorla"
            />
          </div>
        </div>
      </div>

      {/* Horarios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🕒 Horarios de Atención</h3>
        
        <div className="space-y-4">
          {Object.entries(businessInfo.hours).map(([day, hours]) => (
            <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={hours.active}
                  onChange={(e) => handleBusinessInfoChange('hours', {
                    ...businessInfo.hours,
                    [day]: { ...hours, active: e.target.checked }
                  })}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-3 font-medium text-gray-800 capitalize">{day}</span>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => handleBusinessInfoChange('hours', {
                    ...businessInfo.hours,
                    [day]: { ...hours, open: e.target.value }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-gray-600">-</span>
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => handleBusinessInfoChange('hours', {
                    ...businessInfo.hours,
                    [day]: { ...hours, close: e.target.value }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎨 Branding y Colores</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Primario</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={businessInfo.brandColors.primary}
                onChange={(e) => handleBusinessInfoChange('brandColors', {
                  ...businessInfo.brandColors,
                  primary: e.target.value
                })}
                className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={businessInfo.brandColors.primary}
                onChange={(e) => handleBusinessInfoChange('brandColors', {
                  ...businessInfo.brandColors,
                  primary: e.target.value
                })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="#FF6B35"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Secundario</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={businessInfo.brandColors.secondary}
                onChange={(e) => handleBusinessInfoChange('brandColors', {
                  ...businessInfo.brandColors,
                  secondary: e.target.value
                })}
                className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={businessInfo.brandColors.secondary}
                onChange={(e) => handleBusinessInfoChange('brandColors', {
                  ...businessInfo.brandColors,
                  secondary: e.target.value
                })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Vista Previa del Branding</h4>
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: businessInfo.brandColors.primary }}
            >
              IM
            </div>
            <div>
              <h5 className="font-bold text-gray-800">{businessInfo.name}</h5>
              <p className="text-sm text-gray-600">{businessInfo.cuisineType}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 🆕 ROLES Y PERMISOS
  const RolesConfig = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Gestión de Roles y Permisos</h3>
        
        <div className="space-y-4">
          {roles.map(role => (
            <div key={role.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">{role.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{role.name}</h4>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{role.users} usuarios</span>
                  <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                    Editar
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Dashboard', 'Menú', 'Clientes', 'Reservas', 'Feedback', 'IA', 'Recompensas', 'Configuración'].map(permission => (
                  <div key={permission} className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={role.permissions.includes('all') || role.permissions.includes(permission.toLowerCase())}
                      readOnly
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105">
          + Crear Nuevo Rol
        </button>
      </div>

      {/* Historial de Actividad */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Historial de Actividad</h3>
        
        <div className="space-y-3">
          {[
            { user: 'Admin Principal', action: 'Creó nuevo usuario', time: 'Hace 2 horas', type: 'create' },
            { user: 'Supervisor Mesa', action: 'Modificó permisos de rol', time: 'Hace 4 horas', type: 'update' },
            { user: 'Staff Cocina', action: 'Accedió al módulo de menú', time: 'Hace 6 horas', type: 'access' },
            { user: 'Admin Principal', action: 'Exportó lista de permisos', time: 'Hace 1 día', type: 'export' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  activity.type === 'create' ? 'bg-green-100 text-green-600' :
                  activity.type === 'update' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'access' ? 'bg-purple-100 text-purple-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  <span className="text-sm font-bold">
                    {activity.type === 'create' ? '+' : activity.type === 'update' ? '✏️' : activity.type === 'access' ? '👁️' : '📤'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{activity.user}</p>
                  <p className="text-xs text-gray-600">{activity.action}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors">
          📤 Exportar Permisos Actuales
        </button>
      </div>
    </div>
  );

  // 🆕 INTEGRACIONES
  const IntegrationsConfig = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔗 Integraciones Activas</h3>
        
        <div className="space-y-4">
          {integrations.map(integration => (
            <div key={integration.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    integration.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className="text-sm font-bold">
                      {integration.id === 'meta' ? '📘' : 
                       integration.id === 'whatsapp' ? '📱' :
                       integration.id === 'openai' ? '🤖' :
                       integration.id === 'stripe' ? '💳' :
                       integration.id === 'crm' ? '👥' : '🔧'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{integration.name}</h4>
                    <p className="text-sm text-gray-600">
                      {integration.status === 'active' ? 'Conectado y funcionando' : 'Pendiente de configuración'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    integration.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {integration.status === 'active' ? '🟢 Activo' : '🔴 Inactivo'}
                  </span>
                  <button 
                    onClick={() => handleTestIntegration(integration.id)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                  >
                    🧪 Probar
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    ⚙️ Configurar
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(integration.config).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 capitalize">{key}:</span>
                    <span className="text-gray-800 font-mono">
                      {typeof value === 'string' && value.includes('*') ? value : '****'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CRM/ERP Externos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔧 Conexiones Externas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">CRM Externo</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint de API</label>
                <input
                  type="url"
                  placeholder="https://api.tu-crm.com/webhook"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Token de Autenticación</label>
                <input
                  type="password"
                  placeholder="API Token"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-3">ERP Local</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://tu-erp.local/webhook"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Archivo de Credenciales JSON</label>
                <input
                  type="file"
                  accept=".json"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">🔧 Webhook Tester</h4>
          <p className="text-sm text-blue-700 mb-3">Prueba tus webhooks antes de activarlos</p>
          <div className="flex space-x-2">
            <input
              type="url"
              placeholder="https://tu-webhook.com/test"
              className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              🧪 Probar Webhook
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 🆕 NOTIFICACIONES
  const NotificationsConfig = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔔 Configuración de Alertas</h3>
        
        <div className="space-y-6">
          {[
            { id: 'newFeedback', label: 'Nuevo Feedback', icon: '💬', desc: 'Recibe notificaciones cuando llegue feedback nuevo' },
            { id: 'newReservation', label: 'Nueva Reserva', icon: '📅', desc: 'Alertas para nuevas reservas' },
            { id: 'campaignActivated', label: 'Campaña Activada', icon: '🎯', desc: 'Notificaciones de campañas de marketing' }
          ].map(alert => (
            <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{alert.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-800">{alert.label}</h4>
                    <p className="text-sm text-gray-600">{alert.desc}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm mr-2">📱</span>
                    <span className="text-sm text-gray-700">WhatsApp</span>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({
                      ...prev,
                      [alert.id]: {
                        ...prev[alert.id],
                        whatsapp: !prev[alert.id].whatsapp
                      }
                    }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      notifications[alert.id].whatsapp ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      notifications[alert.id].whatsapp ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm mr-2">📧</span>
                    <span className="text-sm text-gray-700">Email</span>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({
                      ...prev,
                      [alert.id]: {
                        ...prev[alert.id],
                        email: !prev[alert.id].email
                      }
                    }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      notifications[alert.id].email ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      notifications[alert.id].email ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm mr-2">📨</span>
                    <span className="text-sm text-gray-700">Telegram</span>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({
                      ...prev,
                      [alert.id]: {
                        ...prev[alert.id],
                        telegram: !prev[alert.id].telegram
                      }
                    }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      notifications[alert.id].telegram ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      notifications[alert.id].telegram ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intervalos de Notificación */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">⏰ Intervalos de Notificación</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
            <select 
              value={notifications.intervals.feedback}
              onChange={(e) => setNotifications(prev => ({
                ...prev,
                intervals: { ...prev.intervals, feedback: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="immediate">Inmediato</option>
              <option value="hourly">Cada hora</option>
              <option value="daily">Diario</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reservas</label>
            <select 
              value={notifications.intervals.reservations}
              onChange={(e) => setNotifications(prev => ({
                ...prev,
                intervals: { ...prev.intervals, reservations: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="immediate">Inmediato</option>
              <option value="hourly">Cada hora</option>
              <option value="daily">Diario</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reportes</label>
            <select 
              value={notifications.intervals.reports}
              onChange={(e) => setNotifications(prev => ({
                ...prev,
                intervals: { ...prev.intervals, reports: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pruebas en Vivo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🧪 Pruebas en Vivo</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleTestNotification('whatsapp', 'feedback')}
            className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-green-600 mr-2">📱</span>
            <span className="text-green-800 font-medium">Probar WhatsApp</span>
          </button>
          
          <button 
            onClick={() => handleTestNotification('email', 'reservations')}
            className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-blue-600 mr-2">📧</span>
            <span className="text-blue-800 font-medium">Probar Email</span>
          </button>
          
          <button 
            onClick={() => handleTestNotification('telegram', 'campaigns')}
            className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <span className="text-purple-600 mr-2">📨</span>
            <span className="text-purple-800 font-medium">Probar Telegram</span>
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-yellow-800">Modo de Prueba</h4>
              <p className="text-sm text-yellow-700">Activa para enviar notificaciones solo a administradores</p>
            </div>
            <button
              onClick={() => setNotifications(prev => ({
                ...prev,
                testMode: !prev.testMode
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.testMode ? 'bg-yellow-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.testMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
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
      case 'integrations':
        return <IntegrationsConfig />;
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
          <p className="text-gray-600 mt-1">Personaliza tu sistema KUMIA Elite</p>
        </div>
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
          💾 Guardar Cambios
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de Configuración */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Secciones</h3>
            <div className="space-y-2">
              {configTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveConfigTab(tab.id)}
                  className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-200 ${
                    activeConfigTab === tab.id
                      ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
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
        </div>

        {/* Contenido Principal */}
        <div className="lg:w-3/4">
          {renderConfigContent()}
        </div>
      </div>
    </div>
  );
};

// 🆕 CLIENTS SECTION AMPLIADA
export const ClientsSection = () => {
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState('all');
  const [smartFilters, setSmartFilters] = useState({
    frequency: 'all',
    avgTicket: 'all',
    feedback: 'all'
  });
  
  // 🆕 ESTADO PARA MODALES Y FUNCIONALIDADES
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    allergies: '',
    special_date: '',
    notes: ''
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
    initializeIlMandorlaClients();
  }, []);

  const initializeIlMandorlaClients = () => {
    // Clientes diversos de IL MANDORLA con datos realistas
    const ilMandorlaClients = [
      {
        id: 'client_1',
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@gmail.com',
        phone: '+595 21 456789',
        visit_count: 12,
        points: 2450,
        feedback_count: 4,
        nft_level: 'oro',
        last_visit: '2025-01-15',
        birthday: '1985-03-15',
        allergies: 'Ninguna',
        special_date: 'Aniversario 2023-06-10',
        total_spent: 145000,
        avg_ticket: 12083,
        status: 'ambassador',
        acquisition_date: '2023-08-15',
        referrals_made: 3,
        favorite_dishes: ['Brooklyn', 'Baby Ribs', 'Cerveza Artesanal'],
        engagement_score: 95
      },
      {
        id: 'client_2', 
        name: 'Sofia Rodriguez',
        email: 'sofia.rodriguez@hotmail.com',
        phone: '+595 21 987654',
        visit_count: 8,
        points: 1680,
        feedback_count: 6,
        nft_level: 'plata',
        last_visit: '2025-01-20',
        birthday: '1992-11-22',
        allergies: 'Lactosa',
        special_date: 'Cumpleaños hija 2024-05-14',
        total_spent: 89500,
        avg_ticket: 11187,
        status: 'recurrent',
        acquisition_date: '2024-02-10',
        referrals_made: 2,
        favorite_dishes: ['Pulled Pork', 'Nachos', 'Jugos Naturales'],
        engagement_score: 87
      },
      {
        id: 'client_3',
        name: 'Roberto Silva',
        email: 'roberto.silva@empresa.com.py',
        phone: '+595 21 345678',
        visit_count: 15,
        points: 3250,
        feedback_count: 8,
        nft_level: 'citizen_kumia',
        last_visit: '2025-01-22',
        birthday: '1978-07-30',
        allergies: 'Mariscos',
        special_date: 'Almuerzo ejecutivo mensual',
        total_spent: 198000,
        avg_ticket: 13200,
        status: 'ambassador',
        acquisition_date: '2023-11-05',
        referrals_made: 5,
        favorite_dishes: ['Plato de Carne Individual', 'Para Compartir x4', 'Vinos'],
        engagement_score: 98
      },
      {
        id: 'client_4',
        name: 'Ana Gutierrez',
        email: 'ana.gutierrez@universidad.edu.py',
        phone: '+595 21 567890',
        visit_count: 4,
        points: 820,
        feedback_count: 2,
        nft_level: 'bronce',
        last_visit: '2025-01-18',
        birthday: '1995-12-03',
        allergies: 'Gluten',
        special_date: 'No especificado',
        total_spent: 34500,
        avg_ticket: 8625,
        status: 'new',
        acquisition_date: '2024-12-15',
        referrals_made: 0,
        favorite_dishes: ['Ensalada', 'Jugos Naturales'],
        engagement_score: 65
      },
      {
        id: 'client_5',
        name: 'Diego Paredes',
        email: 'diego.paredes@startup.com',
        phone: '+595 21 234567',
        visit_count: 6,
        points: 1340,
        feedback_count: 3,
        nft_level: 'plata',
        last_visit: '2025-01-19',
        birthday: '1988-09-17',
        allergies: 'Ninguna',
        special_date: 'Reuniones de trabajo',
        total_spent: 67800,
        avg_ticket: 11300,
        status: 'recurrent',
        acquisition_date: '2024-07-20',
        referrals_made: 1,
        favorite_dishes: ['Choripán', 'Cerveza Artesanal', 'Empanadas'],
        engagement_score: 78
      },
      {
        id: 'client_6',
        name: 'Patricia Benitez',
        email: 'patricia.benitez@consultora.py',
        phone: '+595 21 876543',
        visit_count: 2,
        points: 380,
        feedback_count: 1,
        nft_level: 'bronce',
        last_visit: '2024-12-28',
        birthday: '1980-04-25',
        allergies: 'Frutos secos',
        special_date: 'No especificado',
        total_spent: 18900,
        avg_ticket: 9450,
        status: 'inactive',
        acquisition_date: '2024-11-10',
        referrals_made: 0,
        favorite_dishes: ['Pizza 4 Quesos'],
        engagement_score: 45
      }
    ];

    setClients(ilMandorlaClients);
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      if (response.data && response.data.length > 0) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Si no hay datos en el backend, usar los datos iniciales
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

  // 🆕 FUNCIONES COMPLETAS PARA BOTONES
  const handleRewardNFT = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client);
    setShowNFTModal(true);
  };

  const handleViewHistory = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client);
    setShowHistoryModal(true);
  };

  const handleContactClient = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client);
    setShowContactModal(true);
  };

  const handleInviteReferral = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client);
    setShowReferralModal(true);
  };

  const handleActivateAutoReward = async (clientId) => {
    try {
      const client = clients.find(c => c.id === clientId);
      
      // Actualizar estado del cliente
      const updatedClients = clients.map(c => 
        c.id === clientId 
          ? { ...c, auto_rewards_active: !c.auto_rewards_active }
          : c
      );
      
      setClients(updatedClients);
      
      // Mostrar confirmación
      const status = client.auto_rewards_active ? 'desactivadas' : 'activadas';
      alert(`✅ Recompensas automáticas ${status} para ${client.name}
      
🔥 Sistema KUMIA configurado:
• Puntos automáticos por visita
• NFTs por fidelidad
• Ofertas personalizadas
• Notificaciones push`);
      
    } catch (error) {
      console.error('Error activating auto rewards:', error);
    }
  };

  const handleNewClientClick = () => {
    setShowNewClientModal(true);
  };

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.email) {
      alert('Por favor completa el nombre y email');
      return;
    }

    try {
      const clientToCreate = {
        ...newClient,
        id: `client_${Date.now()}`,
        visit_count: 0,
        points: 0,
        feedback_count: 0,
        nft_level: 'bronce',
        last_visit: new Date().toISOString().split('T')[0],
        total_spent: 0,
        avg_ticket: 0,
        status: 'new',
        acquisition_date: new Date().toISOString().split('T')[0],
        referrals_made: 0,
        favorite_dishes: [],
        engagement_score: 50,
        auto_rewards_active: false
      };

      // Enviar al backend
      await axios.post(`${API}/customers`, clientToCreate);
      
      // Actualizar estado local
      setClients(prev => [...prev, clientToCreate]);
      setShowNewClientModal(false);
      
      // Reset form
      setNewClient({
        name: '',
        email: '',
        phone: '',
        birthday: '',
        allergies: '',
        special_date: '',
        notes: ''
      });
      
      alert('¡Cliente creado exitosamente!');
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error al crear el cliente. Intenta de nuevo.');
    }
  };

  const handleSendNFTReward = async (nftType) => {
    try {
      const rewardData = {
        client_id: selectedClient.id,
        nft_type: nftType,
        reward_date: new Date().toISOString(),
        points_awarded: nftType === 'oro' ? 500 : nftType === 'plata' ? 300 : 100
      };

      // Enviar recompensa
      await axios.post(`${API}/nft-rewards`, rewardData);
      
      // Actualizar cliente
      const updatedClients = clients.map(c => 
        c.id === selectedClient.id 
          ? { ...c, nft_level: nftType, points: c.points + rewardData.points_awarded }
          : c
      );
      
      setClients(updatedClients);
      setShowNFTModal(false);
      
      alert(`🎁 NFT ${nftType.toUpperCase()} enviado exitosamente a ${selectedClient.name}!
      
✅ ${rewardData.points_awarded} puntos añadidos
🎉 WhatsApp enviado automáticamente
📱 Notificación push activada`);
      
    } catch (error) {
      console.error('Error sending NFT reward:', error);
      alert('Error al enviar recompensa NFT. Intenta de nuevo.');
    }
  };

  const handleSendMessage = async (messageType, customMessage = '') => {
    try {
      const messageData = {
        client_id: selectedClient.id,
        message_type: messageType,
        message: customMessage,
        sent_date: new Date().toISOString()
      };

      // Enviar mensaje
      await axios.post(`${API}/client-messages`, messageData);
      
      setShowContactModal(false);
      
      alert(`📱 Mensaje enviado exitosamente a ${selectedClient.name}!
      
✅ WhatsApp: ${selectedClient.phone}
📧 Email: ${selectedClient.email}
🎯 Tipo: ${messageType}`);
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar mensaje. Intenta de nuevo.');
    }
  };

  const filteredClients = clients.filter(client => {
    if (filter !== 'all' && client.status !== filter) return false;
    
    // Smart filters
    if (smartFilters.frequency !== 'all') {
      const frequency = client.visit_count > 10 ? 'high' : client.visit_count > 5 ? 'medium' : 'low';
      if (frequency !== smartFilters.frequency) return false;
    }
    
    if (smartFilters.avgTicket !== 'all') {
      const ticket = client.avg_ticket > 12000 ? 'premium' : client.avg_ticket > 8000 ? 'standard' : 'basic';
      if (ticket !== smartFilters.avgTicket) return false;
    }
    
    return true;
  });

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

// 🆕 RESERVAS SECTION AMPLIADA
export const ReservationsSection = () => {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRate, setAttendanceRate] = useState(87.5);
  const [frequentCustomers, setFrequentCustomers] = useState([]);
  
  // 🆕 ESTADO PARA MODAL DE NUEVA RESERVA
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [reservationForm, setReservationForm] = useState({
    customer_name: '',
    customer_email: '',
    whatsapp_phone: '',
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '',
    guests: 2,
    special_notes: '',
    allergies: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReservations();
    fetchFrequentCustomers();
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API}/tables`);
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      // Fallback mock data
      setTables([
        // Tables for 2 persons (1-6)
        ...Array.from({length: 6}, (_, i) => ({
          id: `table_${i+1}`,
          number: i+1,
          capacity: 2,
          status: 'available',
          location: 'main_floor'
        })),
        // Tables for 4 persons (7-18)
        ...Array.from({length: 12}, (_, i) => ({
          id: `table_${i+7}`,
          number: i+7,
          capacity: 4,
          status: 'available',
          location: 'main_floor'
        })),
        // Tables for 6 persons (19-20)
        ...Array.from({length: 2}, (_, i) => ({
          id: `table_${i+19}`,
          number: i+19,
          capacity: 6,
          status: 'available',
          location: 'terrace'
        }))
      ]);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${API}/reservations`);
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const fetchFrequentCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      const frequent = response.data.filter(customer => customer.visit_count > 5);
      setFrequentCustomers(frequent);
    } catch (error) {
      console.error('Error fetching frequent customers:', error);
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

  const exportCalendar = () => {
    alert('Exportando calendario a .ics');
  };

  // 🆕 FUNCIONES PARA NUEVA RESERVA
  const openNewReservationModal = () => {
    setShowNewReservationModal(true);
    setSelectedTable(null);
    setReservationForm({
      customer_name: '',
      customer_email: '',
      whatsapp_phone: '',
      reservation_date: new Date().toISOString().split('T')[0],
      reservation_time: '',
      guests: 2,
      special_notes: '',
      allergies: ''
    });
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setReservationForm(prev => ({
      ...prev,
      table_id: table.id
    }));
  };

  const handleFormChange = (field, value) => {
    setReservationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = ['customer_name', 'customer_email', 'whatsapp_phone', 'reservation_date', 'reservation_time'];
    for (let field of required) {
      if (!reservationForm[field]) {
        alert(`Por favor completa el campo: ${field.replace('_', ' ')}`);
        return false;
      }
    }
    
    if (!selectedTable) {
      alert('Por favor selecciona una mesa');
      return false;
    }

    if (reservationForm.guests > selectedTable.capacity) {
      alert(`La mesa seleccionada tiene capacidad para ${selectedTable.capacity} personas, pero has indicado ${reservationForm.guests} invitados`);
      return false;
    }

    return true;
  };

  const submitReservation = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const reservationData = {
        ...reservationForm,
        table_id: selectedTable.id
      };

      const response = await axios.post(`${API}/reservations/new`, reservationData);
      
      if (response.data.success) {
        alert('🎉 ¡Reserva creada exitosamente!\n\n✅ Confirmación enviada por email\n📱 Mensaje de WhatsApp enviado\n🤖 IA conversacional iniciada');
        setShowNewReservationModal(false);
        fetchReservations(); // Refresh reservations list
      } else {
        alert('Error al crear la reserva. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Error al crear la reserva. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTableStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-300 text-green-800';
      case 'occupied': return 'bg-red-100 border-red-300 text-red-800';
      case 'reserved': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getCapacityIcon = (capacity) => {
    switch (capacity) {
      case 2: return '👫';
      case 4: return '👨‍👩‍👧‍👦';
      case 6: return '👨‍👩‍👧‍👦👫';
      default: return '🪑';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">📅 Reservas</h2>
          <p className="text-gray-600 mt-1">Visualiza y gestiona reservas activas, futuras y canceladas</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportCalendar}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            📤 Exportar Calendario
          </button>
          <button 
            onClick={openNewReservationModal}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
          >
            + Nueva Reserva
          </button>
        </div>
      </div>

      {/* 🆕 MÉTRICAS DE RESERVAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Tasa de Asistencia</h3>
              <p className="text-2xl font-bold text-green-600">{attendanceRate}%</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Reservas Hoy</h3>
              <p className="text-2xl font-bold text-blue-600">{reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length}</p>
            </div>
            <div className="text-2xl">📅</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Clientes Frecuentes</h3>
              <p className="text-2xl font-bold text-purple-600">{frequentCustomers.length}</p>
            </div>
            <div className="text-2xl">🎯</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Revenue Proyectado</h3>
              <p className="text-2xl font-bold text-orange-600">$15,600</p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(option => (
          <button
            key={option.id}
            onClick={() => setFilter(option.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === option.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.icon} {option.label}
          </button>
        ))}
      </div>

      {/* Lista de Reservas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Reservas de {filter === 'today' ? 'Hoy' : filter === 'week' ? 'Esta Semana' : 'Próximos Eventos'}</h3>
        <div className="space-y-4">
          {reservations.map(reservation => (
            <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{reservation.customer_name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{reservation.customer_name}</h4>
                    <p className="text-sm text-gray-600">{reservation.date} - {reservation.time}</p>
                    <p className="text-sm text-gray-600">{reservation.guests} personas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reservation.status}
                  </span>
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
              {reservation.special_requests && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700"><strong>Solicitudes especiales:</strong> {reservation.special_requests}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 🆕 MODAL NUEVA RESERVA */}
      {showNewReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              {/* Header del Modal */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📅 Nueva Reserva</h2>
                  <p className="text-gray-600">Sistema completo de reservas KUMIA</p>
                </div>
                <button 
                  onClick={() => setShowNewReservationModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 👆 FORMULARIO DE RESERVA */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                    <h3 className="text-lg font-bold text-orange-800 mb-4">👤 Datos del Cliente</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo *</label>
                        <input
                          type="text"
                          value={reservationForm.customer_name}
                          onChange={(e) => handleFormChange('customer_name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Nombre del cliente"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          value={reservationForm.customer_email}
                          onChange={(e) => handleFormChange('customer_email', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="email@ejemplo.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp *</label>
                        <input
                          type="tel"
                          value={reservationForm.whatsapp_phone}
                          onChange={(e) => handleFormChange('whatsapp_phone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="+595 21 123 4567"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-4">📅 Detalles de la Reserva</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                          <input
                            type="date"
                            value={reservationForm.reservation_date}
                            onChange={(e) => handleFormChange('reservation_date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Hora *</label>
                          <input
                            type="time"
                            value={reservationForm.reservation_time}
                            onChange={(e) => handleFormChange('reservation_time', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de personas *</label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={reservationForm.guests}
                            onChange={(e) => handleFormChange('guests', parseInt(e.target.value))}
                            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                          />
                          <span className="text-sm text-gray-600">👥 personas</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notas especiales</label>
                        <textarea
                          value={reservationForm.special_notes}
                          onChange={(e) => handleFormChange('special_notes', e.target.value)}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Instrucciones especiales, ocasión especial, etc."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">⚠️ Alergias alimentarias</label>
                        <textarea
                          value={reservationForm.allergies}
                          onChange={(e) => handleFormChange('allergies', e.target.value)}
                          rows="2"
                          className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50"
                          placeholder="Alergias importantes que debemos conocer para preparar el servicio"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🪑 SELECTOR DE MESAS */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-bold text-green-800 mb-4">🪑 Seleccionar Mesa</h3>
                    
                    <div className="space-y-4">
                      {/* Filtros por capacidad */}
                      <div className="flex gap-2 mb-4">
                        <span className="text-sm font-medium text-gray-700">Filtrar por capacidad:</span>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">👫 2 pers</button>
                        <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">👨‍👩‍👧‍👦 4 pers</button>
                        <button className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">👨‍👩‍👧‍👦👫 6 pers</button>
                      </div>

                      {/* Grid de mesas */}
                      <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                        {tables.map(table => (
                          <div
                            key={table.id}
                            onClick={() => handleTableSelect(table)}
                            className={`
                              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                              ${selectedTable?.id === table.id 
                                ? 'border-orange-500 bg-orange-100' 
                                : getTableStatusColor(table.status)
                              }
                              ${table.status !== 'available' ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-1">{getCapacityIcon(table.capacity)}</div>
                              <div className="text-sm font-bold">Mesa {table.number}</div>
                              <div className="text-xs text-gray-600">{table.capacity} pers</div>
                              <div className="text-xs mt-1">
                                {table.status === 'available' ? '✅ Libre' : 
                                 table.status === 'occupied' ? '🔴 Ocupada' : 
                                 table.status === 'reserved' ? '🟡 Reservada' : '⚠️ Mantenimiento'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Información de mesa seleccionada */}
                      {selectedTable && (
                        <div className="bg-white p-4 rounded-lg border border-green-300">
                          <h4 className="font-bold text-green-800 mb-2">Mesa Seleccionada</h4>
                          <div className="text-sm text-gray-700">
                            <p><strong>Mesa:</strong> #{selectedTable.number}</p>
                            <p><strong>Capacidad:</strong> {selectedTable.capacity} personas</p>
                            <p><strong>Ubicación:</strong> {selectedTable.location === 'main_floor' ? 'Salón principal' : 'Terraza'}</p>
                            {reservationForm.guests > selectedTable.capacity && (
                              <p className="text-red-600 mt-2">
                                ⚠️ La mesa tiene capacidad para {selectedTable.capacity} personas, pero has indicado {reservationForm.guests} invitados
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview de confirmaciones */}
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-purple-800 mb-4">🚀 Automatizaciones KUMIA</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✅</span>
                        <span>Email de confirmación automático</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">📱</span>
                        <span>WhatsApp con detalles de reserva</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">🤖</span>
                        <span>IA conversacional iniciada</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">🔗</span>
                        <span>Link a UserWebApp enviado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                <div className="text-sm text-gray-500">
                  * Campos obligatorios
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowNewReservationModal(false)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={submitReservation}
                    disabled={isSubmitting || !selectedTable}
                    className={`px-8 py-3 rounded-lg font-bold text-white transition-all duration-200 ${
                      isSubmitting || !selectedTable
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transform hover:scale-105 shadow-lg'
                    }`}
                  >
                    {isSubmitting ? '⏳ Creando reserva...' : '📅 Agendar Reserva'}
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

// 🆕 AGENTES IA SECTION AMPLIADA
export const AIAgentsSection = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [performanceData, setPerformanceData] = useState({
    totalConversations: 1243,
    averageResponseTime: 2.3,
    satisfactionScore: 4.6,
    conversionRate: 23.4
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API}/ai-agents`);
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleTrainAgent = (agentId) => {
    alert(`Entrenando agente ${agentId} con nueva información`);
  };

  const handleTestAgent = (agentId) => {
    alert(`Iniciando prueba conversacional con agente ${agentId}`);
  };

  const handleCloneAgent = (agentId) => {
    alert(`Clonando configuración del agente ${agentId}`);
  };

  const handleAnalyzePerformance = (agentId) => {
    alert(`Analizando rendimiento detallado del agente ${agentId}`);
  };

  const getChannelIcon = (channel) => {
    const icons = {
      whatsapp: '📱',
      instagram: '📸',
      facebook: '👥',
      tiktok: '🎵',
      general: '💬'
    };
    return icons[channel] || '🤖';
  };

  const getChannelColor = (channel) => {
    const colors = {
      whatsapp: 'from-green-400 to-green-600',
      instagram: 'from-pink-400 to-purple-600',
      facebook: 'from-blue-400 to-blue-600',
      tiktok: 'from-gray-800 to-gray-900',
      general: 'from-indigo-400 to-indigo-600'
    };
    return colors[channel] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🤖 Agentes IA</h2>
          <p className="text-gray-600 mt-1">Gestiona y optimiza tus asistentes de IA</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
            📊 Reporte de Rendimiento
          </button>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200">
            + Nuevo Agente
          </button>
        </div>
      </div>

      {/* 🆕 MÉTRICAS DE RENDIMIENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Conversaciones</h3>
              <p className="text-2xl font-bold text-blue-600">{performanceData.totalConversations.toLocaleString()}</p>
            </div>
            <div className="text-2xl">💬</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Tiempo de Respuesta</h3>
              <p className="text-2xl font-bold text-green-600">{performanceData.averageResponseTime}s</p>
            </div>
            <div className="text-2xl">⚡</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Satisfacción</h3>
              <p className="text-2xl font-bold text-purple-600">{performanceData.satisfactionScore}/5</p>
            </div>
            <div className="text-2xl">⭐</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Conversión</h3>
              <p className="text-2xl font-bold text-orange-600">{performanceData.conversionRate}%</p>
            </div>
            <div className="text-2xl">🎯</div>
          </div>
        </div>
      </div>

      {/* Grid de Agentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${getChannelColor(agent.channel)} rounded-xl flex items-center justify-center mr-3`}>
                  <span className="text-white text-xl">{getChannelIcon(agent.channel)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{agent.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{agent.channel}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  agent.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {agent.is_active ? '🟢 Activo' : '🔴 Inactivo'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Prompt Personalizado:</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg line-clamp-3">
                {agent.prompt}
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleTestAgent(agent.id)}
                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  🧪 Probar
                </button>
                <button 
                  onClick={() => handleTrainAgent(agent.id)}
                  className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm hover:bg-green-200 transition-colors"
                >
                  🎓 Entrenar
                </button>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleCloneAgent(agent.id)}
                  className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                >
                  📋 Clonar
                </button>
                <button 
                  onClick={() => handleAnalyzePerformance(agent.id)}
                  className="flex-1 bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-sm hover:bg-orange-200 transition-colors"
                >
                  📊 Analizar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🆕 SECCIÓN DE ENTRENAMIENTO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎓 Centro de Entrenamiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Datos de Entrenamiento</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Menú actualizado</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Activo</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Políticas de reserva</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Activo</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Información de eventos</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pendiente</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Rendimiento por Canal</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">📱 WhatsApp</span>
                <span className="text-sm font-medium text-green-600">94.2%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">📸 Instagram</span>
                <span className="text-sm font-medium text-blue-600">88.7%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">👥 Facebook</span>
                <span className="text-sm font-medium text-purple-600">91.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  ROIViewer,
  RewardsNFTsSection,
  IntegrationsSection,
  ConfigurationSection,
  ClientsSection,
  ReservationsSection,
  AIAgentsSection
};