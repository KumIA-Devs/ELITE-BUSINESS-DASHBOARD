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

// 🆕 CONFIGURATION SECTION AMPLIADA
export const ConfigurationSection = () => {
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
    feedback: {
      autoFeedback: true,
      feedbackFrequency: 'post_visit',
      surveyTypes: ['satisfaction', 'nps', 'product_rating'],
      rewardsFeedback: true
    },
    ai: {
      whatsappActive: true,
      instagramActive: true,
      tiktokActive: false,
      autonomyLevel: 'medium',
      voiceTone: 'friendly'
    },
    dashboard: {
      visibleKPIs: ['revenue', 'customers', 'feedback', 'nfts'],
      metricsOrder: ['economic', 'engagement', 'brand'],
      alertsActive: true
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

  // 🆕 SECCIÓN FEEDBACK Y RECOMPENSAS
  const FeedbackRewardsConfig = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Configuración de Feedback</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Feedback Automático</h4>
              <p className="text-sm text-gray-600">Solicitar feedback automáticamente después de cada visita</p>
            </div>
            <button
              onClick={() => handleSettingChange('feedback', 'autoFeedback', !settings.feedback.autoFeedback)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.feedback.autoFeedback ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.feedback.autoFeedback ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia de Encuestas</label>
            <select
              value={settings.feedback.feedbackFrequency}
              onChange={(e) => handleSettingChange('feedback', 'feedbackFrequency', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="post_visit">Después de cada visita</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="custom">Personalizada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipos de Encuestas</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'satisfaction', label: 'Satisfacción General', icon: '😊' },
                { id: 'nps', label: 'NPS Score', icon: '📊' },
                { id: 'product_rating', label: 'Calificación de Productos', icon: '⭐' }
              ].map(survey => (
                <div key={survey.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={settings.feedback.surveyTypes.includes(survey.id)}
                    onChange={(e) => {
                      const newTypes = e.target.checked 
                        ? [...settings.feedback.surveyTypes, survey.id]
                        : settings.feedback.surveyTypes.filter(t => t !== survey.id);
                      handleSettingChange('feedback', 'surveyTypes', newTypes);
                    }}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div className="ml-3">
                    <span className="mr-2">{survey.icon}</span>
                    <span className="text-sm text-gray-700">{survey.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎁 Configuración de NFTs</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Puntos por Visita</label>
              <input
                type="number"
                placeholder="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Puntos por Dólar Gastado</label>
              <input
                type="number"
                placeholder="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Niveles de NFT</label>
            <div className="space-y-2">
              {[
                { level: 'Bronce', points: 1000, color: 'bg-orange-100 text-orange-800' },
                { level: 'Plata', points: 2500, color: 'bg-gray-100 text-gray-800' },
                { level: 'Oro', points: 5000, color: 'bg-yellow-100 text-yellow-800' },
                { level: 'Citizen KUMIA', points: 10000, color: 'bg-purple-100 text-purple-800' }
              ].map(tier => (
                <div key={tier.level} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tier.color}`}>
                      {tier.level}
                    </span>
                    <span className="ml-3 text-sm text-gray-700">{tier.points} puntos</span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    ✏️ Editar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 🆕 SECCIÓN IA Y AUTOMATIZACIONES
  const AIAutomationConfig = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🤖 Activación de IA por Canal</h3>
        
        <div className="space-y-4">
          {[
            { id: 'whatsapp', label: 'WhatsApp', icon: '📱', active: settings.ai.whatsappActive },
            { id: 'instagram', label: 'Instagram', icon: '📸', active: settings.ai.instagramActive },
            { id: 'tiktok', label: 'TikTok', icon: '🎵', active: settings.ai.tiktokActive }
          ].map(channel => (
            <div key={channel.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{channel.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-800">{channel.label}</h4>
                  <p className="text-sm text-gray-600">Activar agente IA para {channel.label}</p>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('ai', `${channel.id}Active`, !channel.active)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  channel.active ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  channel.active ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ Configuración de Comportamiento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Autonomía</label>
            <select
              value={settings.ai.autonomyLevel}
              onChange={(e) => handleSettingChange('ai', 'autonomyLevel', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="low">Bajo - Solo respuestas básicas</option>
              <option value="medium">Medio - Recomendaciones simples</option>
              <option value="high">Alto - Iniciativa completa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tono de Voz</label>
            <select
              value={settings.ai.voiceTone}
              onChange={(e) => handleSettingChange('ai', 'voiceTone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="friendly">Amigable</option>
              <option value="professional">Profesional</option>
              <option value="casual">Casual</option>
              <option value="enthusiastic">Entusiasta</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📝 Historial de Prompts Activos</h3>
        
        <div className="space-y-3">
          {[
            { channel: 'WhatsApp', prompt: 'Asistente amigable para reservas y consultas...', updated: '2024-01-15' },
            { channel: 'Instagram', prompt: 'Respuestas visuales y trendy para engagement...', updated: '2024-01-12' },
            { channel: 'TikTok', prompt: 'Tono joven y dinámico para audiencia Gen Z...', updated: '2024-01-10' }
          ].map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{item.channel}</h4>
                <span className="text-xs text-gray-500">{item.updated}</span>
              </div>
              <p className="text-sm text-gray-600">{item.prompt}</p>
              <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                ✏️ Editar Prompt
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 🆕 SECCIÓN DASHBOARD PERSONALIZABLE
  const DashboardConfig = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 KPIs Visibles en Inicio</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'revenue', label: 'Ingresos Atribuidos', icon: '💰', category: 'economic' },
            { id: 'customers', label: 'Clientes Activos', icon: '👥', category: 'engagement' },
            { id: 'feedback', label: 'Feedback Positivo', icon: '💬', category: 'engagement' },
            { id: 'nfts', label: 'NFTs Entregados', icon: '🎁', category: 'engagement' },
            { id: 'roi', label: 'ROI Mensual', icon: '📈', category: 'economic' },
            { id: 'rating', label: 'Rating Promedio', icon: '⭐', category: 'brand' }
          ].map(kpi => (
            <div key={kpi.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={settings.dashboard.visibleKPIs.includes(kpi.id)}
                onChange={(e) => {
                  const newKPIs = e.target.checked 
                    ? [...settings.dashboard.visibleKPIs, kpi.id]
                    : settings.dashboard.visibleKPIs.filter(k => k !== kpi.id);
                  handleSettingChange('dashboard', 'visibleKPIs', newKPIs);
                }}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <div className="ml-3 flex items-center">
                <span className="mr-2">{kpi.icon}</span>
                <span className="text-sm text-gray-700">{kpi.label}</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  kpi.category === 'economic' ? 'bg-green-100 text-green-800' :
                  kpi.category === 'engagement' ? 'bg-purple-100 text-purple-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {kpi.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔄 Orden de Métricas</h3>
        
        <div className="space-y-3">
          {[
            { id: 'economic', label: 'Impacto Económico', desc: 'Ingresos, ROI, conversiones' },
            { id: 'engagement', label: 'Compromiso del Cliente', desc: 'Clientes, NFTs, puntos' },
            { id: 'brand', label: 'Impacto de Marca', desc: 'Rating, alcance, NPS' }
          ].map((section, index) => (
            <div key={section.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-medium text-gray-800">{section.label}</h4>
                  <p className="text-sm text-gray-600">{section.desc}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {index > 0 && (
                  <button className="text-gray-400 hover:text-gray-600">
                    ↑
                  </button>
                )}
                {index < 2 && (
                  <button className="text-gray-400 hover:text-gray-600">
                    ↓
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🚨 Alertas Automáticas</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Alertas por Variaciones</h4>
              <p className="text-sm text-gray-600">Notificar cuando las métricas cambien significativamente</p>
            </div>
            <button
              onClick={() => handleSettingChange('dashboard', 'alertsActive', !settings.dashboard.alertsActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.dashboard.alertsActive ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.dashboard.alertsActive ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Umbral de Alerta (%)</label>
              <input
                type="number"
                placeholder="15"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período de Comparación</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // El resto del código de configuración se mantiene igual...
  
  const renderConfigContent = () => {
    switch (activeConfigTab) {
      case 'feedback':
        return <FeedbackRewardsConfig />;
      case 'ai':
        return <AIAutomationConfig />;
      case 'dashboard':
        return <DashboardConfig />;
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

        <div className="flex-1">
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

export default {
  ROIViewer,
  RewardsNFTsSection,
  IntegrationsSection,
  ConfigurationSection,
  ClientsSection
};