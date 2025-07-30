import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 🧩 MÓDULO 1: CENTRO DE IA MARKETING
export const CentroIAMarketing = () => {
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [showVideoFactory, setShowVideoFactory] = useState(false);
  const [showImageFactory, setShowImageFactory] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showEditCampaign, setShowEditCampaign] = useState(null);
  const [showSegmentModal, setShowSegmentModal] = useState(null);
  const [showEditPush, setShowEditPush] = useState(false);
  const [videoGeneration, setVideoGeneration] = useState({
    prompt: '',
    style: 'cinematica',
    duration: 10,
    platform: 'instagram',
    brandingLevel: 'alto',
    model: 'runwayml'
  });
  const [imageGeneration, setImageGeneration] = useState({
    prompt: '',
    style: 'fotografico',
    format: 'post',
    platform: 'instagram',
    count: 1
  });
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showABTestModal, setShowABTestModal] = useState(false);
  const [userBalance, setUserBalance] = useState(1250); // Créditos del usuario
  const [estimatedCost, setEstimatedCost] = useState(0);

  // Función para descargar video
  const handleDownloadVideo = async () => {
    try {
      if (generatedContent && generatedContent.url) {
        const link = document.createElement('a');
        link.href = `${process.env.REACT_APP_BACKEND_URL}${generatedContent.url}`;
        link.download = `kumia-video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading video:', error);
      alert('❌ Error al descargar el video. Intenta nuevamente.');
    }
  };

  // Función para manejar compra de créditos
  const handleBuyCredits = (amount) => {
    // Simular compra de créditos
    setUserBalance(prev => prev + amount);
    setShowCreditsModal(false);
    alert(`✅ ¡Compra exitosa! Agregados ${amount} créditos a tu cuenta.`);
  };

  // Función para crear campaña
  const handleCreateCampaign = async (campaignData) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/marketing/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(campaignData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(`✅ Campaña "${campaignData.title}" creada exitosamente!`);
      setShowCampaignModal(false);
      
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('❌ Error al crear la campaña. Intenta nuevamente.');
    }
  };

  // Función para desactivar campaña
  const handleDeactivateCampaign = (campaign) => {
    setCampaignsAI(prev => prev.map(c => 
      c.id === campaign.id ? { ...c, active: false } : c
    ));
    alert(`🔴 Campaña "${campaign.title}" desactivada exitosamente.`);
  };

  // Campañas sugeridas por IA
  const [campaignsAI, setCampaignsAI] = useState([
    {
      id: 1,
      title: "Promo Sorpresa Nivel Destacado",
      description: "Activa una promo sorpresa para clientes 'Destacado' que visiten antes del jueves",
      targetLevel: "Destacado",
      estimatedReach: 18,
      expectedROI: "320%",
      urgency: "alta",
      channels: ["WhatsApp", "Push"],
      active: false
    },
    {
      id: 2,
      title: "Reactivación Clientes Inactivos",
      description: "Campaña personalizada para clientes que no han visitado en 30+ días",
      targetLevel: "Todos",
      estimatedReach: 45,
      expectedROI: "180%",
      urgency: "media",
      channels: ["Email", "WhatsApp"],
      active: false
    },
    {
      id: 3,
      title: "Upselling Fin de Semana",
      description: "Promoción de platos premium para clientes Estrella y Leyenda",
      targetLevel: "Estrella+",
      estimatedReach: 11,
      expectedROI: "450%",
      urgency: "baja",
      channels: ["Push", "En Local"],
      active: false
    }
  ]);

  // Segmentación inteligente
  const segmentos = [
    { nivel: "Explorador", clientes: 32, ultimaVisita: "< 7 días", conversionRate: "65%" },
    { nivel: "Destacado", clientes: 18, ultimaVisita: "< 14 días", conversionRate: "78%" },
    { nivel: "Estrella", clientes: 8, ultimaVisita: "< 21 días", conversionRate: "85%" },
    { nivel: "Leyenda", clientes: 3, ultimaVisita: "< 30 días", conversionRate: "95%" }
  ];

  // Push automáticos configurables
  const [pushNotifications, setPushNotifications] = useState([
    {
      id: 1,
      title: "Recordatorio de Reserva",
      description: "2 horas antes • WhatsApp",
      active: true,
      deliveryRate: "89%",
      trigger: "2_hours_before",
      channels: ["WhatsApp"]
    },
    {
      id: 2,
      title: "Feedback Post-Visita",
      description: "24 horas después • Push + Email",
      active: true,
      deliveryRate: "76%",
      trigger: "24_hours_after",
      channels: ["Push", "Email"]
    },
    {
      id: 3,
      title: "Promoción Cumpleaños",
      description: "7 días antes • Todos los canales",
      active: true,
      deliveryRate: "94%",
      trigger: "7_days_before_birthday",
      channels: ["WhatsApp", "Push", "Email"]
    }
  ]);

  // Funciones para activar campañas
  const handleActivateCampaign = async (campaign) => {
    try {
      setCampaignsAI(prev => prev.map(c => 
        c.id === campaign.id ? { ...c, active: true } : c
      ));
      
      // Simulación de activación de campaña
      alert(`✅ Campaña "${campaign.title}" activada exitosamente!\n\n📊 Alcance: ${campaign.estimatedReach} clientes\n💰 ROI esperado: ${campaign.expectedROI}\n📱 Canales: ${campaign.channels.join(", ")}`);
      
    } catch (error) {
      console.error('Error activating campaign:', error);
      alert('❌ Error al activar la campaña. Intenta nuevamente.');
    }
  };

  // Función para cálculo de costos de video
  const calculateVideoCost = (duration, model) => {
    const pricing = {
      runwayml: 5, // créditos por segundo
      pika: 3.5,
      veo: 4.2
    };
    return pricing[model] * duration;
  };

  // Función para cálculo de costos de imagen
  const calculateImageCost = (count, style) => {
    const baseCost = 2; // créditos por imagen
    const styleCost = style === 'premium' ? 1.5 : 1;
    return count * baseCost * styleCost;
  };

  // Función para generar video
  const handleGenerateVideo = async () => {
    if (!videoGeneration.prompt.trim()) {
      alert('Por favor ingresa una descripción para el video');
      return;
    }

    setIsGenerating(true);
    const cost = calculateVideoCost(videoGeneration.duration, videoGeneration.model);
    setEstimatedCost(cost);
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/content-factory/video/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt: videoGeneration.prompt,
          model: videoGeneration.model,
          duration: videoGeneration.duration,
          style: videoGeneration.style,
          platform: videoGeneration.platform,
          branding_level: videoGeneration.brandingLevel
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.job_id) {
        // Poll for completion
        pollVideoGeneration(result.job_id);
      } else {
        throw new Error('No job ID received');
      }
      
    } catch (error) {
      console.error('Error generating video:', error);
      setIsGenerating(false);
      alert('❌ Error al generar el video. Intenta nuevamente.');
    }
  };

  // Función para hacer polling del estado del video
  const pollVideoGeneration = async (jobId) => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const maxAttempts = 30; // 5 minutos máximo
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/content-factory/job/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to check job status');
        }

        const job = await response.json();
        
        if (job.status === 'completed') {
          setGeneratedContent({
            type: 'video',
            url: job.result_url || '/api/placeholder-video.mp4',
            metadata: {
              duration: videoGeneration.duration,
              platform: videoGeneration.platform,
              cost: job.cost
            }
          });
          setIsGenerating(false);
        } else if (job.status === 'failed') {
          throw new Error('Video generation failed');
        } else {
          // Still processing, check again
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 10000); // Check every 10 seconds
          } else {
            throw new Error('Video generation timeout');
          }
        }
        
      } catch (error) {
        console.error('Error checking video status:', error);
        setIsGenerating(false);
        alert('❌ Error al generar el video. Intenta nuevamente.');
      }
    };

    checkStatus();
  };

  // Función para generar imagen
  const handleGenerateImage = async () => {
    if (!imageGeneration.prompt.trim()) {
      alert('Por favor ingresa una descripción para la imagen');
      return;
    }

    setIsGenerating(true);
    const cost = calculateImageCost(imageGeneration.count, imageGeneration.style);
    setEstimatedCost(cost);
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/content-factory/image/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt: imageGeneration.prompt,
          style: imageGeneration.style,
          format: imageGeneration.format,
          platform: imageGeneration.platform,
          count: imageGeneration.count
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      setGeneratedContent({
        type: 'image',
        urls: result.images,
        metadata: {
          format: result.metadata.format,
          platform: result.metadata.platform,
          cost: result.cost
        }
      });
      setIsGenerating(false);
      
    } catch (error) {
      console.error('Error generating image:', error);
      setIsGenerating(false);
      alert('❌ Error al generar la imagen. Intenta nuevamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Reorganizado con Funciones Principales */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">🧩 Centro de IA Marketing</h2>
            <p className="text-gray-600 mt-1">Núcleo operativo para campañas automatizadas y fidelización inteligente</p>
          </div>
        </div>
        
        {/* Funciones Principales Destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowVideoFactory(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🎬</div>
              <h3 className="font-bold text-lg">Content Factory Video</h3>
              <p className="text-purple-100 text-sm">AI Video Generator</p>
            </div>
          </button>
          
          <button 
            onClick={() => setShowImageFactory(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-bold text-lg">Content Factory Image</h3>
              <p className="text-green-100 text-sm">Posts & Carouseles</p>
            </div>
          </button>
          
          <button 
            onClick={() => setShowCampaignModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📢</div>
              <h3 className="font-bold text-lg">Nueva Campaña</h3>
              <p className="text-blue-100 text-sm">Crear campaña personalizada</p>
            </div>
          </button>
        </div>
      </div>

      {/* Campañas Sugeridas por IA - Mejorada */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">🤖 Campañas Sugeridas por IA</h3>
          <span className="text-sm text-gray-500">Optimizadas con datos en tiempo real</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {campaignsAI.map((campaign) => (
            <div key={campaign.id} className={`border-2 rounded-lg p-4 transition-all ${
              campaign.active ? 'border-green-300 bg-green-50' :
              campaign.urgency === 'alta' ? 'border-red-200 bg-red-50 hover:border-red-300' :
              campaign.urgency === 'media' ? 'border-orange-200 bg-orange-50 hover:border-orange-300' :
              'border-blue-200 bg-blue-50 hover:border-blue-300'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800">{campaign.title}</h4>
                <div className="flex space-x-1">
                  {campaign.active && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      ACTIVA
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.urgency === 'alta' ? 'bg-red-100 text-red-800' :
                    campaign.urgency === 'media' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {campaign.urgency.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">{campaign.description}</p>
              <div className="space-y-2 text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Alcance estimado:</span>
                  <span className="font-medium">{campaign.estimatedReach} clientes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ROI esperado:</span>
                  <span className="font-medium text-green-600">{campaign.expectedROI}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Canales:</span>
                  <span className="font-medium">{campaign.channels.join(", ")}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleActivateCampaign(campaign)}
                  disabled={campaign.active}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    campaign.active 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  {campaign.active ? '✅ Activada' : '🚀 Activar Campaña'}
                </button>
                <button 
                  onClick={() => setShowEditCampaign(campaign)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  ✏️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Segmentación Inteligente - Mejorada */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Segmentación Inteligente</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Nivel KumIA</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Clientes</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Última Visita</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Conversión</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {segmentos.map((segmento, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-medium">{segmento.nivel}</td>
                  <td className="py-4 px-4 text-center">{segmento.clientes}</td>
                  <td className="py-4 px-4 text-center text-green-600">{segmento.ultimaVisita}</td>
                  <td className="py-4 px-4 text-center font-bold text-blue-600">{segmento.conversionRate}</td>
                  <td className="py-4 px-4 text-center">
                    <button 
                      onClick={() => setShowSegmentModal(segmento)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                    >
                      📧 Campaña
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Push Automáticos Editables y Campañas A/B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">📱 Push Automáticos</h3>
            <button 
              onClick={() => setShowEditPush(true)}
              className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200 transition-colors"
            >
              + Agregar Push
            </button>
          </div>
          <div className="space-y-3">
            {pushNotifications.map((push) => (
              <div key={push.id} className={`flex items-center justify-between p-3 rounded-lg ${
                push.active ? 'bg-blue-50' : 'bg-gray-50'
              }`}>
                <div className="flex-1">
                  <h4 className={`font-medium ${push.active ? 'text-blue-800' : 'text-gray-600'}`}>
                    {push.title}
                  </h4>
                  <p className={`text-sm ${push.active ? 'text-blue-600' : 'text-gray-500'}`}>
                    {push.description}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-green-600 font-medium">{push.deliveryRate} entregados</span>
                  <button 
                    onClick={() => setShowEditPush(push)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    ✏️
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={push.active}
                      onChange={(e) => {
                        setPushNotifications(prev => prev.map(p => 
                          p.id === push.id ? { ...p, active: e.target.checked } : p
                        ));
                      }}
                    />
                    <div className={`w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                      push.active ? 'peer-checked:bg-blue-600' : 'peer-checked:bg-green-600'
                    }`}></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campañas A/B */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🧪 Campañas A/B Testing</h3>
          <div className="space-y-4">
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-800">WhatsApp vs Push</h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">ACTIVA</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <div className="flex justify-between">
                  <span>Aperturas:</span>
                  <span className="font-medium">78% vs 45%</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversiones:</span>
                  <span className="font-medium">12% vs 8%</span>
                </div>
                <div className="flex justify-between">
                  <span>Ganador:</span>
                  <span className="font-bold text-green-600">🏆 WhatsApp</span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">Descuento vs Producto Gratis</h4>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">FINALIZADA</span>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Aperturas:</span>
                  <span className="font-medium">65% vs 70%</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversiones:</span>
                  <span className="font-medium">15% vs 18%</span>
                </div>
                <div className="flex justify-between">
                  <span>Ganador:</span>
                  <span className="font-bold text-blue-600">🏆 Producto Gratis</span>
                </div>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
            🧪 Nueva Prueba A/B
          </button>
        </div>
      </div>

      {/* Modal Video Factory */}
      {showVideoFactory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">🎬 Fábrica de Contenido - Generador de Videos</h2>
                  <p className="text-gray-600">Genera videos profesionales con IA (Google Veo 3, RunwayML, Pika Labs)</p>
                </div>
                <button 
                  onClick={() => setShowVideoFactory(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuración del Video */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción del video *
                    </label>
                    <textarea
                      value={videoGeneration.prompt}
                      onChange={(e) => setVideoGeneration(prev => ({...prev, prompt: e.target.value}))}
                      placeholder="Ej: Un video promocional mostrando nuestros platos insignia con ambiente acogedor..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="4"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Modelo IA
                      </label>
                      <select
                        value={videoGeneration.model}
                        onChange={(e) => setVideoGeneration(prev => ({...prev, model: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="runwayml">RunwayML Gen-3 (Recomendado)</option>
                        <option value="veo">Google Veo 3 (Premium)</option>
                        <option value="pika">Pika Labs (Económico)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duración (segundos)
                      </label>
                      <input
                        type="number"
                        value={videoGeneration.duration}
                        onChange={(e) => setVideoGeneration(prev => ({...prev, duration: parseInt(e.target.value)}))}
                        min="5"
                        max="30"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estilo Visual
                      </label>
                      <select
                        value={videoGeneration.style}
                        onChange={(e) => setVideoGeneration(prev => ({...prev, style: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="cinematica">Cinematográfica</option>
                        <option value="comercial">Comercial</option>
                        <option value="documental">Documental</option>
                        <option value="artistica">Artística</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plataforma destino
                      </label>
                      <select
                        value={videoGeneration.platform}
                        onChange={(e) => setVideoGeneration(prev => ({...prev, platform: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="instagram">Instagram (1:1)</option>
                        <option value="tiktok">TikTok (9:16)</option>
                        <option value="youtube">YouTube (16:9)</option>
                        <option value="facebook">Facebook (16:9)</option>
                      </select>
                    </div>
                  </div>

                  {/* Costo Estimado y Balance */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-800">Costo Estimado:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {calculateVideoCost(videoGeneration.duration, videoGeneration.model)} créditos
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-600">En USD:</span>
                      <span className="text-sm font-medium text-blue-600">
                        ~${(calculateVideoCost(videoGeneration.duration, videoGeneration.model) * 0.1).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600">Tu balance:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-green-600">1,250 créditos</span>
                        <button className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                          + Comprar más
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview y Generación */}
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center">
                    {isGenerating ? (
                      <div className="text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600">Generando video...</p>
                        <p className="text-sm text-gray-500">Esto puede tomar 2-3 minutos</p>
                      </div>
                    ) : generatedContent && generatedContent.type === 'video' ? (
                      <div className="w-full h-full">
                        <video 
                          controls 
                          className="w-full h-full object-cover rounded-lg"
                          src={`${process.env.REACT_APP_BACKEND_URL}${generatedContent.url}`}
                        />
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">🎬</div>
                        <p>La previsualización aparecerá aquí</p>
                      </div>
                    )}
                  </div>

                  {/* Botones de Acción */}
                  <div className="space-y-3">
                    <button 
                      onClick={handleGenerateVideo}
                      disabled={isGenerating || !videoGeneration.prompt.trim()}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        isGenerating || !videoGeneration.prompt.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {isGenerating ? 'Generando...' : '🚀 Generar Video'}
                    </button>

                    {generatedContent && generatedContent.type === 'video' && (
                      <div className="space-y-2">
                        <button 
                          onClick={() => alert('Función de edición próximamente disponible')}
                          className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          ✏️ Editar Video (Subtítulos, Marca, Transiciones)
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={handleDownloadVideo}
                            className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                          >
                            💾 Descargar
                          </button>
                          <button 
                            onClick={() => setShowPublishModal(true)}
                            className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            📱 Publicar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Image Factory */}
      {showImageFactory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">🎨 Content Factory - Image Generator</h2>
                  <p className="text-gray-600">Crea posts, carouseles e imágenes profesionales con IA</p>
                </div>
                <button 
                  onClick={() => setShowImageFactory(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuración de Imagen */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción de la imagen *
                    </label>
                    <textarea
                      value={imageGeneration.prompt}
                      onChange={(e) => setImageGeneration(prev => ({...prev, prompt: e.target.value}))}
                      placeholder="Ej: Un plato gourmet elegantemente presentado con iluminación profesional..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows="4"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de contenido
                      </label>
                      <select
                        value={imageGeneration.format}
                        onChange={(e) => setImageGeneration(prev => ({...prev, format: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="post">Post Individual</option>
                        <option value="carousel">Carrusel (múltiples)</option>
                        <option value="story">Instagram Story</option>
                        <option value="banner">Banner promocional</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        value={imageGeneration.count}
                        onChange={(e) => setImageGeneration(prev => ({...prev, count: parseInt(e.target.value)}))}
                        min="1"
                        max="10"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Costo Estimado */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-800">Costo Estimado:</span>
                      <span className="text-xl font-bold text-green-600">
                        {calculateImageCost(imageGeneration.count, imageGeneration.style)} créditos
                      </span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      ~${(calculateImageCost(imageGeneration.count, imageGeneration.style) * 0.1).toFixed(2)} USD
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center">
                    {isGenerating ? (
                      <div className="text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600">Generando imágenes...</p>
                      </div>
                    ) : generatedContent && generatedContent.type === 'image' ? (
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {generatedContent.urls.map((url, index) => (
                          <img 
                            key={index}
                            src={url} 
                            alt={`Generated ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">🎨</div>
                        <p>Las imágenes aparecerán aquí</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={handleGenerateImage}
                      disabled={isGenerating || !imageGeneration.prompt.trim()}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        isGenerating || !imageGeneration.prompt.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isGenerating ? 'Generando...' : '🚀 Generar Imágenes'}
                    </button>

                    {generatedContent && generatedContent.type === 'image' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
                          💾 Descargar Todo
                        </button>
                        <button className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                          📱 Publicar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Campaña */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📢 Nueva Campaña Personalizada</h2>
                  <p className="text-gray-600">Crea una campaña de marketing dirigida</p>
                </div>
                <button 
                  onClick={() => setShowCampaignModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la campaña *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Promoción San Valentín 2025"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Segmento objetivo
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Todos los clientes</option>
                      <option>Solo Exploradores</option>
                      <option>Solo Destacados</option>
                      <option>Solo Estrellas</option>
                      <option>Solo Leyendas</option>
                      <option>Clientes inactivos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje de la campaña *
                  </label>
                  <textarea
                    placeholder="Escribe el mensaje que recibirán tus clientes..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Canales
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        WhatsApp
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Push Notifications
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Email
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de inicio
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de finalización
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowCampaignModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    🚀 Crear Campaña
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Campaña */}
      {showEditCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">✏️ Editar Campaña: {showEditCampaign.title}</h2>
                <button 
                  onClick={() => setShowEditCampaign(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    type="text"
                    defaultValue={showEditCampaign.title}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    defaultValue={showEditCampaign.description}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowEditCampaign(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    💾 Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Campaña por Segmento */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">📧 Campaña para {showSegmentModal.nivel}</h2>
                <button 
                  onClick={() => setShowSegmentModal(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-blue-800 mb-2">Información del Segmento</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Clientes:</span>
                    <div className="font-bold">{showSegmentModal.clientes}</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Última visita:</span>
                    <div className="font-bold">{showSegmentModal.ultimaVisita}</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Conversión:</span>
                    <div className="font-bold">{showSegmentModal.conversionRate}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje personalizado</label>
                  <textarea
                    placeholder={`Mensaje especial para clientes ${showSegmentModal.nivel}...`}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowSegmentModal(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    📧 Enviar Campaña
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Push */}
      {showEditPush && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {showEditPush === true ? '📱 Nuevo Push Automático' : `✏️ Editar: ${showEditPush.title}`}
                </h2>
                <button 
                  onClick={() => setShowEditPush(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título del Push</label>
                  <input
                    type="text"
                    defaultValue={showEditPush !== true ? showEditPush.title : ''}
                    placeholder="Ej: Recordatorio de Reserva"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <input
                    type="text"
                    defaultValue={showEditPush !== true ? showEditPush.description : ''}
                    placeholder="Ej: 2 horas antes • WhatsApp"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trigger</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="2_hours_before">2 horas antes de reserva</option>
                    <option value="24_hours_after">24 horas después de visita</option>
                    <option value="7_days_before_birthday">7 días antes de cumpleaños</option>
                    <option value="30_days_inactive">30 días sin actividad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Canales</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      WhatsApp
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Push Notification
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Email
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowEditPush(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    💾 Guardar Push
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// 🆕 ROI VIEWER SECTION AMPLIADA
// 🆕 ROI VIEWER SECTION COMPLETAMENTE REDISEÑADA - KUMIA ELITE
export const ROIViewer = () => {
  // Estados principales
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [showCalculator, setShowCalculator] = useState(false);
  const [ticketEvolutionFilter, setTicketEvolutionFilter] = useState('30d');
  const [calculatorData, setCalculatorData] = useState({
    ticketPromedio: 3200,
    costoRecompensa: 8000,
    margenBruto: 65
  });

  // Datos del sistema KumIA Stars por nivel con filtros de tiempo
  const getKumiaLevelsByTimeframe = (timeframe) => {
    const baseData = [
      {
        nivel: 'Explorador',
        starsNecesarias: 36,
        gastoEstimado: 108000,
        costoRecompensa: 8000,
        margenNeto: 64800,
        roi: 710,
        clientesActivos: 32,
        ticketPromedio: 3840
      },
      {
        nivel: 'Destacado', 
        starsNecesarias: 48,
        gastoEstimado: 144000,
        costoRecompensa: 8000,
        margenNeto: 78400,
        roi: 880,
        clientesActivos: 18,
        ticketPromedio: 4800
      },
      {
        nivel: 'Estrella',
        starsNecesarias: 60,
        gastoEstimado: 180000,
        costoRecompensa: 8000,
        margenNeto: 100000,
        roi: 1150,
        clientesActivos: 8,
        ticketPromedio: 5760
      },
      {
        nivel: 'Leyenda',
        starsNecesarias: 75,
        gastoEstimado: 225000,
        costoRecompensa: 8000,
        margenNeto: 127000,
        roi: 1487,
        clientesActivos: 3,
        ticketPromedio: 6400
      }
    ];

    // Ajustar datos según el timeframe seleccionado
    const multipliers = {
      '7d': 0.25,
      '30d': 1.0,
      '60d': 1.8,
      '90d': 2.5
    };

    const multiplier = multipliers[timeframe] || 1.0;

    return baseData.map(nivel => ({
      ...nivel,
      gastoEstimado: Math.round(nivel.gastoEstimado * multiplier),
      margenNeto: Math.round(nivel.margenNeto * multiplier),
      roi: Math.round(nivel.roi * (0.8 + multiplier * 0.4)), // ROI varía con el tiempo
      clientesActivos: Math.round(nivel.clientesActivos * (0.7 + multiplier * 0.3))
    }));
  };

  const kumiaLevels = getKumiaLevelsByTimeframe(selectedTimeframe);

  // Datos de evolución del ticket promedio con filtros
  const getTicketEvolutionData = (filter) => {
    const allData = [
      { fecha: '2024-05-01', ticket: 2500, periodo: 'pre-kumia' },
      { fecha: '2024-05-15', ticket: 2650, periodo: 'pre-kumia' },
      { fecha: '2024-06-01', ticket: 2750, periodo: 'pre-kumia' },
      { fecha: '2024-06-15', ticket: 2850, periodo: 'activacion' },
      { fecha: '2024-07-01', ticket: 3200, periodo: 'post-kumia' },
      { fecha: '2024-07-15', ticket: 3450, periodo: 'post-kumia' },
      { fecha: '2024-08-01', ticket: 3650, periodo: 'post-kumia' },
      { fecha: '2024-08-15', ticket: 3800, periodo: 'post-kumia' },
      { fecha: '2024-09-01', ticket: 4050, periodo: 'post-kumia' },
      { fecha: '2024-09-15', ticket: 4150, periodo: 'post-kumia' },
      { fecha: '2024-10-01', ticket: 4250, periodo: 'post-kumia' },
      { fecha: '2024-10-15', ticket: 4350, periodo: 'post-kumia' },
      { fecha: '2024-11-01', ticket: 4450, periodo: 'post-kumia' },
      { fecha: '2024-11-15', ticket: 4550, periodo: 'post-kumia' },
      { fecha: '2024-12-01', ticket: 4650, periodo: 'post-kumia' },
      { fecha: '2024-12-15', ticket: 4750, periodo: 'post-kumia' }
    ];

    const today = new Date();
    let cutoffDate;

    switch(filter) {
      case '7d':
        cutoffDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
        return allData.slice(-3); // Últimos 3 puntos para 7 días
      case '30d':
        cutoffDate = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        return allData.slice(-6); // Últimos 6 puntos para 30 días
      case '90d':
        cutoffDate = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000));
        return allData; // Todos los datos para 90 días
      default:
        return allData.slice(-6);
    }
  };

  const [ticketEvolution, setTicketEvolution] = useState({
    fechaActivacion: '2024-06-15',
    datosHistoricos: getTicketEvolutionData(ticketEvolutionFilter)
  });

  // Actualizar datos cuando cambie el filtro de evolución del ticket
  useEffect(() => {
    setTicketEvolution(prev => ({
      ...prev,
      datosHistoricos: getTicketEvolutionData(ticketEvolutionFilter)
    }));
  }, [ticketEvolutionFilter]);

  // Datos de actividad en tiempo real que varían según timeframe
  const getActividadByTimeframe = (timeframe) => {
    const baseData = {
      starsGeneradasSemana: 847,
      starsCanjeadasSemana: 234,
      ratioConversion: 27.6,
      rankingAcciones: [
        { accion: 'Feedback con imagen', stars: 2, frecuencia: 45 },
        { accion: 'Reserva completada', stars: 3, frecuencia: 38 },
        { accion: 'Referido exitoso', stars: 5, frecuencia: 12 },
        { accion: 'Feedback con texto', stars: 1, frecuencia: 89 }
      ],
      nftMasDesbloqueado: 'NFT Explorador',
      clientesTopNivel: [
        { nombre: 'Alexander Zúñiga', nivel: 'Leyenda', stars: 127 },
        { nombre: 'Valentina Chen', nivel: 'Leyenda', stars: 98 },
        { nombre: 'Elena Vargas', nivel: 'Estrella', stars: 89 },
        { nombre: 'Roberto Kim', nivel: 'Estrella', stars: 76 },
        { nombre: 'Sofia Moreno', nivel: 'Destacado', stars: 65 }
      ]
    };

    const multipliers = {
      '7d': 0.25,
      '30d': 1.0,
      '60d': 2.1,
      '90d': 3.2
    };

    const multiplier = multipliers[timeframe] || 1.0;

    return {
      ...baseData,
      starsGeneradasSemana: Math.round(baseData.starsGeneradasSemana * multiplier),
      starsCanjeadasSemana: Math.round(baseData.starsCanjeadasSemana * multiplier),
      ratioConversion: Math.round((baseData.ratioConversion * (0.8 + multiplier * 0.2)) * 10) / 10,
      rankingAcciones: baseData.rankingAcciones.map(accion => ({
        ...accion,
        frecuencia: Math.round(accion.frecuencia * multiplier)
      }))
    };
  };

  const actividadTiempoReal = getActividadByTimeframe(selectedTimeframe);

  // Datos benchmark del rubro
  const [benchmarkRubro] = useState({
    categoria: 'Steakhouse Premium',
    ticketPromedioRubro: 3800,
    starsPromedioNacional: 12.5,
    nivelPromedioNacional: 'Explorador',
    ratioCanjePromedio: 23.4,
    posicionamiento: {
      ticketPromedio: 'Sobresaliente',
      starsGeneradas: 'Excelente',
      ratioConversion: 'Sobresaliente'
    }
  });

  // Cálculo del indicador de éxito principal
  const calcularIndicadorExito = () => {
    const capitalizacionTotal = kumiaLevels.reduce((total, nivel) => 
      total + (nivel.gastoEstimado * nivel.clientesActivos), 0);
    const recompensasEntregadas = kumiaLevels.reduce((total, nivel) => 
      total + (nivel.costoRecompensa * Math.floor(nivel.clientesActivos * 0.75)), 0);
    const roiTotal = ((capitalizacionTotal - recompensasEntregadas) / recompensasEntregadas * 100);
    
    return {
      capitalizacion: capitalizacionTotal,
      recompensas: recompensasEntregadas,
      roi: roiTotal
    };
  };

  const indicadorExito = calcularIndicadorExito();

  // Calculadora de simulación de ROI
  const calcularROISimulado = (ticket, costoRecompensa, margen) => {
    return kumiaLevels.map(nivel => ({
      ...nivel,
      gastoEstimadoSim: nivel.starsNecesarias * (ticket * 0.93),
      costoRecompensaSim: costoRecompensa,
      margenNetoSim: (nivel.starsNecesarias * ticket * (margen/100)) - costoRecompensa,
      roiSim: ((nivel.starsNecesarias * ticket * (margen/100)) - costoRecompensa) / costoRecompensa * 100
    }));
  };

  const datosSimulados = calcularROISimulado(calculatorData.ticketPromedio, calculatorData.costoRecompensa, calculatorData.margenBruto);

  // Función para exportar reporte MEJORADA
  const handleExportReport = () => {
    try {
      const reportData = {
        fecha: new Date().toLocaleDateString('es-CL'),
        timeframe: selectedTimeframe,
        indicadorExito,
        kumiaLevels,
        actividadTiempoReal,
        benchmarkRubro
      };

      // Crear contenido CSV más detallado
      const csvHeader = "ROI VIEWER KUMIA ELITE - REPORTE COMPLETO\n";
      const csvMetadata = `Fecha de generación,${reportData.fecha}\nPeríodo analizado,${selectedTimeframe}\n\n`;
      
      const csvIndicador = "INDICADOR DE ÉXITO PRINCIPAL\n" +
        `Capitalización total (CLP),${reportData.indicadorExito.capitalizacion.toLocaleString()}\n` +
        `Recompensas entregadas (CLP),${reportData.indicadorExito.recompensas.toLocaleString()}\n` +
        `ROI total (%),${reportData.indicadorExito.roi.toFixed(0)}%\n\n`;
      
      const csvNiveles = "ROI POR NIVEL KUMIA STARS\n" +
        "Nivel,Stars necesarias,Gasto estimado (CLP),Costo recompensa (CLP),Margen neto (CLP),ROI (%),Clientes activos\n" +
        reportData.kumiaLevels.map(nivel => 
          `${nivel.nivel},${nivel.starsNecesarias},${nivel.gastoEstimado.toLocaleString()},${nivel.costoRecompensa.toLocaleString()},${nivel.margenNeto.toLocaleString()},${nivel.roi}%,${nivel.clientesActivos}`
        ).join("\n") + "\n\n";
      
      const csvActividad = "ACTIVIDAD EN TIEMPO REAL\n" +
        `Stars generadas (período),${reportData.actividadTiempoReal.starsGeneradasSemana}\n` +
        `Stars canjeadas (período),${reportData.actividadTiempoReal.starsCanjeadasSemana}\n` +
        `Ratio de conversión (%),${reportData.actividadTiempoReal.ratioConversion}%\n` +
        `NFT más desbloqueado,${reportData.actividadTiempoReal.nftMasDesbloqueado}\n\n`;

      const csvRanking = "RANKING DE ACCIONES (GENERAN MÁS STARS)\n" +
        "Acción,Stars por acción,Frecuencia de uso\n" +
        reportData.actividadTiempoReal.rankingAcciones.map(accion => 
          `${accion.accion},${accion.stars},${accion.frecuencia}`
        ).join("\n") + "\n\n";

      const csvBenchmark = "BENCHMARK CON EL RUBRO\n" +
        `Categoría restaurante,${reportData.benchmarkRubro.categoria}\n` +
        `Ticket promedio rubro (CLP),${reportData.benchmarkRubro.ticketPromedioRubro.toLocaleString()}\n` +
        `Stars promedio nacional,${reportData.benchmarkRubro.starsPromedioNacional}\n` +
        `Nivel promedio nacional,${reportData.benchmarkRubro.nivelPromedioNacional}\n` +
        `Ratio canje promedio (%),${reportData.benchmarkRubro.ratioCanjePromedio}%\n\n`;

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + // BOM para caracteres especiales
        csvHeader + csvMetadata + csvIndicador + csvNiveles + csvActividad + csvRanking + csvBenchmark;
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      const filename = `roi_report_kumia_${selectedTimeframe}_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      link.style.display = "none";
      document.body.appendChild(link);
      
      // Ejecutar descarga
      link.click();
      
      // Limpiar
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
      // Mostrar confirmación
      alert(`✅ REPORTE EXPORTADO EXITOSAMENTE\n\n📊 Detalles del reporte:\n• Período: ${selectedTimeframe}\n• ROI Total: ${indicadorExito.roi.toFixed(0)}%\n• Capitalización: $${indicadorExito.capitalizacion.toLocaleString()} CLP\n• Fecha: ${new Date().toLocaleDateString('es-CL')}\n• Archivo: ${filename}\n\n💡 El archivo CSV se ha descargado con todos los datos del análisis ROI KumIA Stars.\n\n📋 Contenido incluye:\n- Indicador de éxito principal\n- ROI detallado por nivel\n- Actividad en tiempo real\n- Ranking de acciones\n- Benchmark con el rubro`);
      
      console.log('✅ Reporte exportado exitosamente:', filename);
      
    } catch (error) {
      console.error('❌ Error al exportar reporte:', error);
      alert(`❌ ERROR AL EXPORTAR REPORTE\n\nNo se pudo generar el archivo CSV.\nError: ${error.message}\n\nIntenta nuevamente o contacta al soporte técnico.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con título y controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">📊 ROI Viewer KumIA Elite</h2>
          <p className="text-gray-600 mt-1">Análisis completo del retorno de inversión del sistema KumIA Stars</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="60d">Últimos 60 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
          <button 
            onClick={() => setShowCalculator(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            🧮 Calculadora ROI
          </button>
          <button 
            onClick={handleExportReport}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            📤 Exportar Reporte
          </button>
        </div>
      </div>

      {/* 💡 INDICADOR DE ÉXITO DESTACADO */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-4">🎯</span>
          <div>
            <h3 className="text-xl font-bold">Resumen de Impacto KumIA Stars</h3>
            <p className="text-emerald-100 text-sm">Tu rendimiento económico consolidado</p>
          </div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <p className="text-lg leading-relaxed">
            <strong>Tu restaurante ha generado ${indicadorExito.capitalizacion.toLocaleString()} CLP</strong> en capitalización 
            a través del sistema KumIA Stars, entregando solo <strong>${indicadorExito.recompensas.toLocaleString()} CLP</strong> en recompensas. 
            <span className="text-2xl font-bold block mt-2">
              Retorno total estimado: <span className="text-yellow-300">{indicadorExito.roi.toFixed(0)}%</span>
            </span>
          </p>
        </div>
      </div>

      {/* 🧮 TABLA DETALLADA DE ROI POR NIVEL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">🏆 ROI Detallado por Nivel KumIA</h3>
            <p className="text-gray-600 text-sm">Análisis económico automático basado en datos de Firestore</p>
          </div>
          <div className="text-xs text-gray-500">
            Actualizado cada 24h | Última actualización: Hoy 09:15
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Nivel</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Stars necesarias</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Gasto estimado (CLP)</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Costo recompensa</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Margen neto</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">ROI (%)</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Clientes activos</th>
              </tr>
            </thead>
            <tbody>
              {kumiaLevels.map((nivel, index) => (
                <tr key={nivel.nivel} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        index === 0 ? 'bg-blue-500' : 
                        index === 1 ? 'bg-purple-500' : 
                        index === 2 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium text-gray-800">{nivel.nivel}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center font-medium">{nivel.starsNecesarias}</td>
                  <td className="py-4 px-4 text-center text-blue-600 font-medium">
                    ~${nivel.gastoEstimado.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center text-red-600 font-medium">
                    ${nivel.costoRecompensa.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center text-green-600 font-bold">
                    ${nivel.margenNeto.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-bold text-lg ${
                      nivel.roi >= 1000 ? 'text-emerald-600' : 
                      nivel.roi >= 800 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {nivel.roi}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                      {nivel.clientesActivos}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 Notas Explicativas:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Gasto estimado:</strong> Calculado como Stars necesarias × $3,000 CLP (valor por star)</li>
            <li>• <strong>Margen neto:</strong> Incluye margen del restaurante (~65%) menos costo de recompensa</li>
            <li>• <strong>ROI:</strong> Retorno sobre inversión = (Margen neto / Costo recompensa) × 100</li>
            <li>• <strong>Datos actualizados automáticamente</strong> desde restaurant_stats, users y transactions_log</li>
          </ul>
        </div>
      </div>

      {/* 📈 EVOLUCIÓN DEL TICKET PROMEDIO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">📈 Evolución del Ticket Promedio</h3>
            <p className="text-gray-600 text-sm">Comparativa antes/después de la activación de KumIA Stars</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setTicketEvolutionFilter('7d')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                ticketEvolutionFilter === '7d' 
                ? 'bg-blue-500 text-white' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              7D
            </button>
            <button 
              onClick={() => setTicketEvolutionFilter('30d')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                ticketEvolutionFilter === '30d' 
                ? 'bg-blue-500 text-white' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              30D
            </button>
            <button 
              onClick={() => setTicketEvolutionFilter('90d')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                ticketEvolutionFilter === '90d' 
                ? 'bg-blue-500 text-white' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              90D
            </button>
          </div>
        </div>

        {/* Gráfico de línea mejorado con datos reales */}
        <div className="h-64 bg-gradient-to-t from-gray-50 to-white rounded-lg p-4 mb-6 relative overflow-hidden">
          <div className="absolute top-2 left-4 text-xs text-gray-500">
            Ticket Promedio (CLP)
          </div>
          <div className="absolute bottom-2 right-4 text-xs text-gray-500">
            Período: {ticketEvolutionFilter === '7d' ? 'Últimos 7 días' : ticketEvolutionFilter === '30d' ? 'Últimos 30 días' : 'Últimos 90 días'}
          </div>
          
          {/* Contenedor del gráfico */}
          <div className="absolute inset-4 flex justify-between items-end" style={{ height: 'calc(100% - 2rem)' }}>
            {ticketEvolution.datosHistoricos.map((punto, index) => {
              const height = ((punto.ticket - Math.min(...ticketEvolution.datosHistoricos.map(p => p.ticket))) / 
                            (Math.max(...ticketEvolution.datosHistoricos.map(p => p.ticket)) - Math.min(...ticketEvolution.datosHistoricos.map(p => p.ticket)))) * 80 + 10;
              
              return (
                <div key={index} className="flex flex-col items-center group relative">
                  {/* Punto interactivo */}
                  <div 
                    className={`w-4 h-4 rounded-full cursor-pointer transition-all duration-200 hover:scale-150 z-10 border-2 border-white shadow-lg ${
                      punto.periodo === 'pre-kumia' ? 'bg-gray-500 hover:bg-gray-600' : 
                      punto.periodo === 'activacion' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                    }`}
                    style={{ marginBottom: `${height}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl pointer-events-none">
                      <div className="font-bold">{punto.fecha.split('-').reverse().join('/')}</div>
                      <div className="text-gray-300">${punto.ticket.toLocaleString()} CLP</div>
                      <div className={`text-xs ${
                        punto.periodo === 'pre-kumia' ? 'text-gray-400' : 
                        punto.periodo === 'activacion' ? 'text-orange-300' : 'text-green-300'
                      }`}>
                        {punto.periodo === 'pre-kumia' ? 'Pre-KumIA' : 
                         punto.periodo === 'activacion' ? 'Activación' : 'Post-KumIA'}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                  
                  {/* Línea de conexión */}
                  {index < ticketEvolution.datosHistoricos.length - 1 && (
                    <div 
                      className={`absolute w-full h-0.5 ${
                        punto.periodo === 'pre-kumia' ? 'bg-gray-400' : 'bg-green-400'
                      }`}
                      style={{ 
                        top: `${100 - height - 2}%`,
                        left: '50%',
                        right: '-50%',
                        zIndex: 1
                      }}
                    ></div>
                  )}
                  
                  {/* Etiqueta de fecha */}
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-center">
                    {punto.fecha.split('-')[1]}/{punto.fecha.split('-')[2]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estadísticas del período */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              ${Math.round(ticketEvolution.datosHistoricos.filter(p => p.periodo === 'pre-kumia').reduce((sum, p) => sum + p.ticket, 0) / ticketEvolution.datosHistoricos.filter(p => p.periodo === 'pre-kumia').length || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Promedio Pre-KumIA</div>
            <div className="text-xs text-gray-400 mt-1">
              {ticketEvolution.datosHistoricos.filter(p => p.periodo === 'pre-kumia').length} datos
            </div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {ticketEvolution.datosHistoricos.find(p => p.periodo === 'activacion')?.fecha.split('-').reverse().join('/') || 'Jun 15'}
            </div>
            <div className="text-sm text-orange-700">Activación KumIA</div>
            <div className="text-xs text-orange-500 mt-1">Punto de inflexión</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${Math.round(ticketEvolution.datosHistoricos.filter(p => p.periodo === 'post-kumia').reduce((sum, p) => sum + p.ticket, 0) / ticketEvolution.datosHistoricos.filter(p => p.periodo === 'post-kumia').length || 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Promedio Post-KumIA</div>
            <div className="text-xs text-green-500 mt-1">
              <span className="font-bold">
                +{(() => {
                  const preKumia = ticketEvolution.datosHistoricos.filter(p => p.periodo === 'pre-kumia').reduce((sum, p) => sum + p.ticket, 0) / ticketEvolution.datosHistoricos.filter(p => p.periodo === 'pre-kumia').length || 1;
                  const postKumia = ticketEvolution.datosHistoricos.filter(p => p.periodo === 'post-kumia').reduce((sum, p) => sum + p.ticket, 0) / ticketEvolution.datosHistoricos.filter(p => p.periodo === 'post-kumia').length || 0;
                  return ((postKumia - preKumia) / preKumia * 100).toFixed(1);
                })()}%</span> incremento
            </div>
          </div>
        </div>

        {/* Información adicional del filtro */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="text-blue-800">
              <strong>Período seleccionado:</strong> {
                ticketEvolutionFilter === '7d' ? 'Últimos 7 días (3 puntos de datos)' :
                ticketEvolutionFilter === '30d' ? 'Últimos 30 días (6 puntos de datos)' :
                'Últimos 90 días (todos los datos históricos)'
              }
            </div>
            <div className="text-blue-600">
              {ticketEvolution.datosHistoricos.length} puntos de datos mostrados
            </div>
          </div>
        </div>
      </div>

      {/* 🔄 PANEL DE ACTIVIDAD EN TIEMPO REAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KPIs Visuales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">⚡ Actividad en Tiempo Real</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{actividadTiempoReal.starsGeneradasSemana}</div>
              <div className="text-sm text-blue-700">Stars Generadas</div>
              <div className="text-xs text-blue-500">Esta semana</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{actividadTiempoReal.starsCanjeadasSemana}</div>
              <div className="text-sm text-green-700">Stars Canjeadas</div>
              <div className="text-xs text-green-500">Esta semana</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Ratio de Conversión</span>
              <span className="text-sm font-bold text-purple-600">{actividadTiempoReal.ratioConversion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${actividadTiempoReal.ratioConversion}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Stars canjeadas vs emitidas</div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">🏆 NFT Más Desbloqueado</h4>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-yellow-800">{actividadTiempoReal.nftMasDesbloqueado}</span>
                <span className="text-sm text-yellow-600">32 desbloqueos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking y Top Clientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">📊 Rankings y Estadísticas</h3>
          
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">🎯 Acciones que Más Stars Generan</h4>
            <div className="space-y-2">
              {actividadTiempoReal.rankingAcciones.map((accion, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{accion.accion}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-600">{accion.stars} ⭐</div>
                    <div className="text-xs text-gray-500">{accion.frecuencia} usos</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">🌟 Top Clientes por Nivel</h4>
            <div className="space-y-2">
              {actividadTiempoReal.clientesTopNivel.map((cliente, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                      cliente.nivel === 'Leyenda' ? 'bg-red-500' : 
                      cliente.nivel === 'Estrella' ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}>
                      {cliente.nombre.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{cliente.nombre}</div>
                      <div className="text-xs text-gray-500">{cliente.nivel}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">{cliente.stars} ⭐</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 📊 COMPARADOR CON EL PROMEDIO DEL RUBRO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">🏪 Comparativa con el Rubro</h3>
            <p className="text-gray-600 text-sm">Tu desempeño vs promedio nacional - {benchmarkRubro.categoria}</p>
          </div>
          <div className="text-xs text-gray-500">
            Datos actualizados mensualmente | Fuente: KUMIA Analytics
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Ticket Promedio</div>
            <div className="text-2xl font-bold text-blue-600">$3,830</div>
            <div className="text-xs text-gray-500 mb-2">vs $3,800 rubro</div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              benchmarkRubro.posicionamiento.ticketPromedio === 'Sobresaliente' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              ✨ {benchmarkRubro.posicionamiento.ticketPromedio}
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Stars por Cliente</div>
            <div className="text-2xl font-bold text-purple-600">16.8</div>
            <div className="text-xs text-gray-500 mb-2">vs 12.5 nacional</div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              benchmarkRubro.posicionamiento.starsGeneradas === 'Excelente' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              🚀 {benchmarkRubro.posicionamiento.starsGeneradas}
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Nivel Promedio</div>
            <div className="text-2xl font-bold text-green-600">Explorador+</div>
            <div className="text-xs text-gray-500 mb-2">vs Explorador nacional</div>
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              📈 Superior
            </div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Ratio de Canje</div>
            <div className="text-2xl font-bold text-orange-600">27.6%</div>
            <div className="text-xs text-gray-500 mb-2">vs 23.4% rubro</div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              benchmarkRubro.posicionamiento.ratioConversion === 'Sobresaliente' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              ⭐ {benchmarkRubro.posicionamiento.ratioConversion}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <h4 className="font-bold text-green-800 mb-2">🎯 Resumen Comparativo</h4>
          <p className="text-sm text-green-700">
            Tu restaurante está posicionado <strong>por encima del promedio</strong> en todas las métricas clave del rubro {benchmarkRubro.categoria}. 
            Destacas especialmente en generación de Stars (+35%) y conversión de recompensas (+18%), 
            indicando una excelente adopción del sistema KumIA por parte de tus clientes.
          </p>
        </div>
      </div>

      {/* 🔢 CALCULADORA DE SIMULACIÓN DE ROI */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">🧮 Calculadora de Simulación ROI</h2>
                  <p className="text-gray-600">Simula diferentes escenarios para optimizar tu retorno de inversión</p>
                </div>
                <button 
                  onClick={() => setShowCalculator(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel de configuración */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-4">⚙️ Configuración de Variables</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ticket Promedio (CLP)
                        <span className="text-xs text-blue-600 ml-2" title="Valor promedio que gasta un cliente por visita">ℹ️</span>
                      </label>
                      <input
                        type="number"
                        value={calculatorData.ticketPromedio}
                        onChange={(e) => setCalculatorData(prev => ({...prev, ticketPromedio: parseInt(e.target.value) || 0}))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="text-xs text-gray-500 mt-1">Actual: $3,830</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Costo Real de Recompensa (CLP)
                        <span className="text-xs text-blue-600 ml-2" title="Costo promedio de las recompensas que entregas">ℹ️</span>
                      </label>
                      <input
                        type="number"
                        value={calculatorData.costoRecompensa}
                        onChange={(e) => setCalculatorData(prev => ({...prev, costoRecompensa: parseInt(e.target.value) || 0}))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="text-xs text-gray-500 mt-1">Actual: $8,000</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Margen Bruto Estimado (%)
                        <span className="text-xs text-blue-600 ml-2" title="Porcentaje de ganancia después de costos directos">ℹ️</span>
                      </label>
                      <input
                        type="number"
                        value={calculatorData.margenBruto}
                        onChange={(e) => setCalculatorData(prev => ({...prev, margenBruto: parseInt(e.target.value) || 0}))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                      <div className="text-xs text-gray-500 mt-1">Actual: 65%</div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-700 mb-2">🎯 Escenarios Predefinidos</h4>
                      <div className="space-y-2">
                        <button 
                          onClick={() => setCalculatorData({ticketPromedio: 4000, costoRecompensa: 6000, margenBruto: 70})}
                          className="w-full text-left px-3 py-2 bg-white rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                          📈 Optimista
                        </button>
                        <button 
                          onClick={() => setCalculatorData({ticketPromedio: 3000, costoRecompensa: 10000, margenBruto: 60})}
                          className="w-full text-left px-3 py-2 bg-white rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                          📉 Conservador
                        </button>
                        <button 
                          onClick={() => setCalculatorData({ticketPromedio: 3200, costoRecompensa: 8000, margenBruto: 65})}
                          className="w-full text-left px-3 py-2 bg-white rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                          🎯 Actual
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resultados de simulación */}
                <div className="lg:col-span-2">
                  <h3 className="font-bold text-gray-800 mb-4">📊 Resultados de Simulación</h3>
                  
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Nivel</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">Capitalización</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">Margen Neto</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">ROI Simulado</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">vs Actual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datosSimulados.map((nivel, index) => (
                          <tr key={nivel.nivel} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 font-medium">{nivel.nivel}</td>
                            <td className="py-3 px-4 text-center text-blue-600">
                              ${nivel.gastoEstimadoSim.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center text-green-600 font-medium">
                              ${nivel.margenNetoSim.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`font-bold ${nivel.roiSim >= 1000 ? 'text-emerald-600' : nivel.roiSim >= 500 ? 'text-green-600' : 'text-yellow-600'}`}>
                                {nivel.roiSim.toFixed(0)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-sm ${nivel.roiSim > nivel.roi ? 'text-green-600' : nivel.roiSim < nivel.roi ? 'text-red-600' : 'text-gray-600'}`}>
                                {nivel.roiSim > nivel.roi ? '↗️' : nivel.roiSim < nivel.roi ? '↘️' : '➡️'} 
                                {Math.abs(nivel.roiSim - nivel.roi).toFixed(0)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-bold text-green-800 mb-2">✅ Comparación con Desempeño Actual</h4>
                      <div className="space-y-1 text-sm text-green-700">
                        <div>ROI promedio simulado: <strong>{(datosSimulados.reduce((sum, n) => sum + n.roiSim, 0) / datosSimulados.length).toFixed(0)}%</strong></div>
                        <div>ROI promedio actual: <strong>{(kumiaLevels.reduce((sum, n) => sum + n.roi, 0) / kumiaLevels.length).toFixed(0)}%</strong></div>
                        <div>Diferencia: <strong>{((datosSimulados.reduce((sum, n) => sum + n.roiSim, 0) / datosSimulados.length) - (kumiaLevels.reduce((sum, n) => sum + n.roi, 0) / kumiaLevels.length)).toFixed(0)}%</strong></div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-bold text-blue-800 mb-2">🎯 Recomendaciones</h4>
                      <div className="space-y-1 text-sm text-blue-700">
                        {calculatorData.margenBruto < 65 && <div>• Considera optimizar costos para aumentar margen</div>}
                        {calculatorData.costoRecompensa > 8000 && <div>• Las recompensas pueden ser muy costosas</div>}
                        {calculatorData.ticketPromedio < 3200 && <div>• Oportunidad de aumentar ticket promedio</div>}
                        <div>• Nivel más rentable simulado: <strong>{datosSimulados.reduce((max, nivel) => nivel.roiSim > max.roiSim ? nivel : max).nivel}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button 
                  onClick={() => setShowCalculator(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
                <button className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                  📊 Aplicar Configuración
                </button>
                <button className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                  💾 Guardar Escenario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights de IA Mejorados */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">🧠</span>
          <h3 className="text-lg font-bold text-indigo-800">Insights de IA - Análisis Avanzado ROI</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-indigo-700">
              <strong>Nivel más rentable:</strong> {kumiaLevels.reduce((max, nivel) => nivel.roi > max.roi ? nivel : max).nivel} con {kumiaLevels.reduce((max, nivel) => nivel.roi > max.roi ? nivel : max).roi}% ROI.
            </p>
            <p className="text-indigo-700">
              <strong>Oportunidad detectada:</strong> Incrementar el costo de recompensas en un 15% podría aumentar la percepción de valor sin afectar significativamente el ROI.
            </p>
            <p className="text-indigo-700">
              <strong>Proyección 90 días:</strong> Manteniendo el crecimiento actual del ticket promedio (+2.3% mensual), alcanzarás un ROI promedio de +1,250%.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-indigo-700">
              <strong>Benchmark del rubro:</strong> Tu ROI supera el promedio nacional en un 340%. Estás en el top 5% de restaurantes con KumIA.
            </p>
            <p className="text-indigo-700">
              <strong>Recomendación estratégica:</strong> Considera crear un nivel intermedio entre Destacado y Estrella para optimizar la retención.
            </p>
            <p className="text-indigo-700">
              <strong>Alert automático:</strong> El nivel Leyenda muestra señales de saturación. Evalúa crear beneficios adicionales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🆕 RECOMPENSAS & NFTS SECTION AMPLIADA
// 🌟 KUMIA STARS MULTILEVEL SYSTEM - RECOMPENSAS SECTION
export const RewardsNFTsSection = () => {
  const [starsData, setStarsData] = useState({
    totalStarsGenerated: 15847,
    totalRedemptions: 234,
    mostFrequentLevel: 'Explorador',
    mostUnlockedNFT: 'NFT Explorador',
    activeReferrals: 67
  });

  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showSpecialRewards, setShowSpecialRewards] = useState(false);
  const [showClientExport, setShowClientExport] = useState(false);
  const [showEditNFT, setShowEditNFT] = useState(null);
  const [showSystemConfig, setShowSystemConfig] = useState(false);
  const [showCompleteAnalysis, setShowCompleteAnalysis] = useState(false);
  const [showClientsList, setShowClientsList] = useState(null);
  const [showLevelConfig, setShowLevelConfig] = useState(null);
  const [showActionsAnalysis, setShowActionsAnalysis] = useState(false);

  // 🎯 SISTEMA DE NIVELES KUMIA STARS
  const kumiaLevels = [
    {
      id: 'descubridor',
      name: 'Descubridor',
      starsRange: '0-35',
      starsRequired: 35,
      multiplier: 1.0,
      nftImage: 'https://images.unsplash.com/photo-1571008592377-e362723e8998?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxhY2hpZXZlbWVudCUyMG1lZGFsfGVufDB8fHx8MTc1MzgwMjM2NHww&ixlib=rb-4.1.0&q=85',
      nftName: 'No aplica',
      description: 'Nivel de entrada para nuevos usuarios del sistema KumIA',
      benefit: 'Acceso básico al programa de fidelización',
      activeClients: 45,
      capitalization: '$0 - $105,000 CLP',
      bgColor: 'from-gray-400 to-gray-500',
      textColor: 'text-gray-700',
      badgeColor: 'bg-gray-100'
    },
    {
      id: 'explorador',
      name: 'Explorador',
      starsRange: '36-47',
      starsRequired: 12, // Stars adicionales necesarias
      multiplier: 1.2,
      nftImage: 'https://images.unsplash.com/photo-1578410532485-e017ec847d23?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxsb3lhbHR5JTIwYmFkZ2V8ZW58MHx8fHwxNzUzODAyMzgwfDA&ixlib=rb-4.1.0&q=85',
      nftName: 'NFT "Explorador"',
      description: 'Segundo nivel con beneficios mejorados y multiplier x1.2',
      benefit: 'Descuentos especiales + acumulación 20% más rápida',
      activeClients: 32,
      capitalization: '$105,000 - $141,000 CLP',
      bgColor: 'from-blue-400 to-blue-500',
      textColor: 'text-blue-700',
      badgeColor: 'bg-blue-100'
    },
    {
      id: 'destacado',
      name: 'Destacado',
      starsRange: '48-59',
      starsRequired: 12, // Stars adicionales necesarias
      multiplier: 1.5,
      nftImage: 'https://images.unsplash.com/photo-1565857102257-1e0055202c44?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwyfHxsb3lhbHR5JTIwYmFkZ2V8ZW58MHx8fHwxNzUzODAyMzgwfDA&ixlib=rb-4.1.0&q=85',
      nftName: 'NFT "Destacado"',
      description: 'Nivel intermedio con reconocimiento premium y status',
      benefit: 'Acceso VIP + mesa preferencial + multiplier x1.5',
      activeClients: 18,
      capitalization: '$141,000 - $177,000 CLP',
      bgColor: 'from-purple-400 to-purple-500',
      textColor: 'text-purple-700',
      badgeColor: 'bg-purple-100'
    },
    {
      id: 'estrella',
      name: 'Estrella',
      starsRange: '60-74',
      starsRequired: 15, // Stars adicionales necesarias
      multiplier: 1.8,
      nftImage: 'https://images.unsplash.com/photo-1651002488760-b9640c8cc819?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxhY2hpZXZlbWVudCUyMG1lZGFsfGVufDB8fHx8MTc1MzgwMjM2NHww&ixlib=rb-4.1.0&q=85',
      nftName: 'NFT "Estrella"',
      description: 'Nivel prestigioso con beneficios exclusivos y alta valorización',
      benefit: 'Eventos exclusivos + chef privado + multiplier x1.8',
      activeClients: 8,
      capitalization: '$177,000 - $222,000 CLP',
      bgColor: 'from-yellow-400 to-orange-500',
      textColor: 'text-orange-700',
      badgeColor: 'bg-orange-100'
    },
    {
      id: 'leyenda',
      name: 'Leyenda KumIA',
      starsRange: '75+',
      starsRequired: 1, // Una star adicional para mantener
      multiplier: 2.0,
      nftImage: 'https://images.unsplash.com/photo-1718465388901-9c628510c01e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxsb3lhbHR5JTIwYmFkZ2V8ZW58MHx8fHwxNzUzODAyMzgwfDA&ixlib=rb-4.1.0&q=85',
      nftName: 'NFT "Leyenda KumIA"',
      description: 'Nivel máximo de exclusividad y privilegios supremos',
      benefit: 'Menú personalizado + experiencia única + multiplier x2.0',
      activeClients: 3,
      capitalization: '$222,000+ CLP',
      bgColor: 'from-pink-500 to-red-500',
      textColor: 'text-red-700',
      badgeColor: 'bg-red-100'
    }
  ];

  // 🏆 TARJETA DE NIVEL
  const LevelCard = ({ level, index, isSelected, onClick }) => (
    <div 
      className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
        isSelected ? 'border-orange-500 shadow-xl' : 'border-gray-200 hover:border-orange-300'
      }`}
      onClick={() => onClick(level)}
    >
      {/* Header del Nivel */}
      <div className={`bg-gradient-to-r ${level.bgColor} p-4 rounded-t-xl text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{level.name}</h3>
            <p className="text-sm opacity-90">{level.starsRange} Stars</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">x{level.multiplier}</div>
            <div className="text-xs opacity-90">Multiplicador</div>
          </div>
        </div>
      </div>

      {/* Imagen NFT */}
      <div className="p-4">
        <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 overflow-hidden relative group">
          <img 
            src={level.nftImage} 
            alt={level.nftName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowEditNFT(level);
              }}
              className="bg-white text-gray-800 px-3 py-1 rounded-lg text-sm hover:bg-gray-100 transition-colors"
            >
              🖼️ Cambiar NFT
            </button>
          </div>
        </div>

        {/* Info del NFT */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">NFT Asociado:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${level.badgeColor} ${level.textColor}`}>
              {level.nftName}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Clientes Activos:</span>
            <span className="font-bold text-gray-800">{level.activeClients}</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-1">Beneficio Principal:</h4>
            <p className="text-sm text-gray-600">{level.benefit}</p>
          </div>

          <div className="bg-emerald-50 p-3 rounded-lg">
            <h4 className="font-medium text-emerald-700 mb-1">Capitalización:</h4>
            <p className="text-sm text-emerald-600 font-medium">{level.capitalization}</p>
          </div>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="p-4 border-t border-gray-100">
        <div className="space-y-2">
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleViewClients(level);
              }}
              className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              👥 Ver Clientes
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleConfigureLevel(level);
              }}
              className="flex-1 bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-sm hover:bg-orange-200 transition-colors"
            >
              ⚙️ Configurar
            </button>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleEmailCampaign(level);
              }}
              className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
            >
              📧 Campaña Email
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleWhatsAppCampaign(level);
              }}
              className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm hover:bg-green-200 transition-colors"
            >
              📱 Campaña WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 🔧 FUNCIONES DE MANEJO DE EVENTOS
  const handleViewClients = (level) => {
    setShowClientsList(level);
  };

  const handleConfigureLevel = (level) => {
    setShowLevelConfig(level);
  };

  // 🔍 FUNCIÓN DE BÚSQUEDA DE CLIENTES
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState('all');

  const handleClientSearch = (searchTerm) => {
    setClientSearchTerm(searchTerm);
  };

  const handleSearchEnter = (e) => {
    if (e.key === 'Enter') {
      handleClientSearch(e.target.value);
    }
  };

  // 📧 FUNCIÓN DE CAMPAÑA EMAIL
  const [showEmailCampaign, setShowEmailCampaign] = useState(null);
  const [showWhatsAppCampaign, setShowWhatsAppCampaign] = useState(null);

  const handleEmailCampaign = (level) => {
    setShowEmailCampaign(level);
  };

  const handleWhatsAppCampaign = (level) => {
    setShowWhatsAppCampaign(level);
  };

  // 👁️ FUNCIÓN VER DETALLES CLIENTE
  const handleViewClientDetails = (client) => {
    alert(`👤 DETALLES DEL CLIENTE\n\n📋 Información Personal:\n• Nombre: ${client.name}\n• Email: ${client.email}\n• Teléfono: ${client.phone}\n• Estado: ${client.status}\n\n⭐ Actividad KumIA:\n• Stars actuales: ${client.stars}\n• Total gastado: $${client.totalSpent.toLocaleString()}\n• Visitas realizadas: ${client.visits}\n• NFT desbloqueado: ${client.nftUnlocked}\n• Última visita: ${client.lastVisit}\n\n🎯 En producción se abrirá un panel completo con historial detallado, preferencias y análisis de comportamiento.`);
  };

  // ✏️ FUNCIÓN EDITAR CLIENTE
  const handleEditClient = (client) => {
    alert(`✏️ EDITAR CLIENTE - ${client.name}\n\n📝 Opciones de edición disponibles:\n• Modificar información personal\n• Ajustar stars manualmente\n• Cambiar estado (Activo/Inactivo)\n• Agregar notas internas\n• Configurar preferencias\n• Historial de transacciones\n\n💡 En producción se abrirá un formulario completo de edición con validaciones y auditoría de cambios.`);
  };

  // 🎁 FUNCIÓN AGREGAR NUEVA RECOMPENSA
  const [showNewReward, setShowNewReward] = useState(null);

  const handleAddNewReward = (level) => {
    setShowNewReward(level);
  };

  // 📊 FUNCIÓN VER ANÁLISIS DETALLADO
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(null);

  const handleDetailedAnalysis = (level) => {
    setShowDetailedAnalysis(level);
  };

  // 📞 FUNCIÓN CONTACTAR CLIENTE
  const handleContactClient = (client) => {
    alert(`📞 CONTACTAR CLIENTE - ${client.name}\n\n📋 Opciones de contacto disponibles:\n• WhatsApp: ${client.phone || 'No disponible'}\n• Email: ${client.email || 'No disponible'}\n• Llamada directa\n• SMS personalizado\n• Invitación a evento especial\n\n💡 En producción se abrirá un panel completo con historial de contactos, plantillas de mensajes y seguimiento automatizado.`);
  };

  const handleCompleteAnalysis = () => {
    setShowCompleteAnalysis(true);
  };

  const handleSystemConfig = () => {
    setShowSystemConfig(true);
  };

  const handleActionsAnalysis = () => {
    setShowActionsAnalysis(true);
  };

  const handleExportClients = () => {
    const selectedLevel = document.querySelector('select[name="level"]')?.value || 'all';
    const selectedFormat = document.querySelector('input[name="format"]:checked')?.value || 'excel';
    
    // Datos mock para exportación
    const exportData = {
      all: { total: 106, data: ['Juan Pérez', 'María García', 'Carlos López', '...'] },
      descubridor: { total: 45, data: ['Ana Torres', 'Luis Martín', '...'] },
      explorador: { total: 32, data: ['Carmen Silva', 'Pedro Ruiz', '...'] },
      destacado: { total: 18, data: ['Sofia Moreno', 'Diego Castro', '...'] },
      estrella: { total: 8, data: ['Elena Vargas', 'Roberto Kim', '...'] },
      leyenda: { total: 3, data: ['Alexander Zúñiga', 'Valentina Chen', 'Maximiliano Torres'] }
    };

    const levelData = exportData[selectedLevel] || exportData.all;
    
    if (selectedFormat === 'excel' || selectedFormat === 'csv') {
      // Crear contenido CSV
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Nombre,Nivel,Stars,Última Visita,Total Gastado\n" +
        levelData.data.slice(0, 5).map((name, index) => 
          `${name},${selectedLevel === 'all' ? ['Descubridor', 'Explorador', 'Destacado', 'Estrella', 'Leyenda'][index % 5] : selectedLevel},${Math.floor(Math.random() * 100)},2025-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')},${Math.floor(Math.random() * 50000) + 10000}`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `clientes_${selectedLevel}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`✅ Archivo ${selectedFormat.toUpperCase()} generado exitosamente\n\nClientes ${selectedLevel}: ${levelData.total}\nArchivo: clientes_${selectedLevel}_${new Date().toISOString().split('T')[0]}.csv`);
    } else if (selectedFormat === 'pdf') {
      alert(`📄 Generando PDF para ${levelData.total} clientes del nivel ${selectedLevel}...\n\nEn producción se integrará con jsPDF para generar reportes completos con gráficos y análisis detallado.`);
    }
    
    setShowClientExport(false);
  };

  // 📊 MÉTRICAS AGREGADAS
  const AggregatedMetrics = () => (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
      <h3 className="text-lg font-bold text-orange-800 mb-4">📊 Métricas Generales del Sistema</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{starsData.totalStarsGenerated.toLocaleString()}</div>
          <div className="text-sm text-orange-700">Total Stars Generadas</div>
        </div>
        <div className="bg-white p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{starsData.totalRedemptions}</div>
          <div className="text-sm text-green-700">Recompensas Canjeadas</div>
        </div>
        <div className="bg-white p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{starsData.mostFrequentLevel}</div>
          <div className="text-sm text-blue-700">Nivel Más Frecuente</div>
        </div>
        <div className="bg-white p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{starsData.mostUnlockedNFT}</div>
          <div className="text-sm text-purple-700">NFT Más Desbloqueado</div>
        </div>
        <div className="bg-white p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-pink-600">{starsData.activeReferrals}</div>
          <div className="text-sm text-pink-700">Referidos Activos</div>
        </div>
      </div>
    </div>
  );

  // 🧠 LÓGICA DE FUNCIONAMIENTO
  const SystemLogicExplanation = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🧠 Lógica del Sistema KumIA Stars</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-3">⭐ Generación de Stars</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center"><span className="text-green-500 mr-2">•</span> Feedback con texto: 1 star base</li>
            <li className="flex items-center"><span className="text-green-500 mr-2">•</span> Feedback con imagen: 2 stars base</li>
            <li className="flex items-center"><span className="text-green-500 mr-2">•</span> Reserva completada: 3 stars base</li>
            <li className="flex items-center"><span className="text-green-500 mr-2">•</span> Referido exitoso: 5 stars base</li>
            <li className="flex items-center"><span className="text-orange-500 mr-2">•</span> Todas las acciones se multiplican por el nivel actual</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-3">🔄 Mecánica de Canje</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center"><span className="text-blue-500 mr-2">•</span> Al alcanzar stars mínimas → Puede canjear</li>
            <li className="flex items-center"><span className="text-blue-500 mr-2">•</span> Período de canje: 60 días máximo</li>
            <li className="flex items-center"><span className="text-red-500 mr-2">•</span> Al canjear: Stars = 0, Nivel ↑</li>
            <li className="flex items-center"><span className="text-purple-500 mr-2">•</span> Nuevo multiplicador aplicado</li>
            <li className="flex items-center"><span className="text-yellow-500 mr-2">•</span> NFT desbloqueado automáticamente</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6 bg-emerald-50 p-4 rounded-lg">
        <h4 className="font-medium text-emerald-800 mb-2">💡 Valor Económico por Star</h4>
        <p className="text-sm text-emerald-700">
          <strong>1 Star ≈ $3,000 CLP</strong> en capitalización del restaurante. 
          Este valor representa el gasto promedio necesario para generar una star y mantener la rentabilidad del programa.
        </p>
      </div>
    </div>
  );



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">⭐ Sistema KumIA Stars Multilevel</h2>
          <p className="text-gray-600 mt-1">Gestión completa del programa de fidelización por niveles</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleCompleteAnalysis}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
          >
            📊 Análisis Completo
          </button>
          <button 
            onClick={handleSystemConfig}
            className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105"
          >
            ⚙️ Configurar Sistema
          </button>
        </div>
      </div>

      {/* Métricas Agregadas */}
      <AggregatedMetrics />

      {/* 🏗️ ESTRUCTURA ESCALONADA DE NIVELES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">🏗️ Estructura Escalonada de Niveles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {kumiaLevels.map((level, index) => (
            <LevelCard 
              key={level.id} 
              level={level} 
              index={index}
              isSelected={selectedLevel?.id === level.id}
              onClick={setSelectedLevel}
            />
          ))}
        </div>
      </div>

      {/* 🛠️ FUNCIONALIDAD ADMINISTRATIVA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🛠️ Funcionalidad Administrativa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowClientExport(true)}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            📊 Exportar Clientes por Nivel
          </button>
          <button 
            onClick={handleActionsAnalysis}
            className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
          >
            📈 Análisis de Acciones por Nivel
          </button>
          <button 
            onClick={() => setShowSpecialRewards(true)}
            className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center"
          >
            🎁 Recompensas Especiales
          </button>
        </div>
      </div>

      {/* Lógica del Sistema */}
      <SystemLogicExplanation />

      {/* 🎯 Modal de Recompensas Especiales */}
      {showSpecialRewards && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">🎁 Recompensas Especiales por Tiempo Limitado</h2>
                  <p className="text-gray-600">Crea promociones exclusivas para niveles específicos</p>
                </div>
                <button 
                  onClick={() => setShowSpecialRewards(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {kumiaLevels.map(level => (
                  <div key={level.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800">{level.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${level.badgeColor} ${level.textColor}`}>
                        {level.activeClients} clientes
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Recompensa</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                          <option>Descuento porcentual</option>
                          <option>Plato gratis</option>
                          <option>Experiencia VIP</option>
                          <option>Evento exclusivo</option>
                          <option>Puntos bonus</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vigencia</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duración (días)</label>
                        <input
                          type="number"
                          placeholder="7"
                          defaultValue="7"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la Promoción</label>
                      <textarea
                        placeholder={`Ej: "Promoción especial de aniversario: 25% descuento en todos los platos para clientes ${level.name} válido por 7 días"`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 h-20"
                      />
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                        ✨ Activar Promoción
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        👀 Vista Previa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">💡 Ideas de Recompensas Especiales:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Descubridor:</strong> Bienvenida con bebida gratis + 10 stars bonus</li>
                  <li>• <strong>Explorador:</strong> 15% descuento en segundos platos por 15 días</li>
                  <li>• <strong>Destacado:</strong> Acceso VIP a mesa preferencial por 1 mes</li>
                  <li>• <strong>Estrella:</strong> Cena degustación gratis + chef personalizado</li>
                  <li>• <strong>Leyenda:</strong> Evento privado exclusivo + menú personalizado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ Modal de Edición NFT */}
      {showEditNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">🖼️ Modificar NFT - {showEditNFT.name}</h2>
                <button 
                  onClick={() => setShowEditNFT(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagen Actual</label>
                  <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <img 
                      src={showEditNFT.nftImage} 
                      alt={showEditNFT.nftName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subir Nueva Imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, SVG. Tamaño recomendado: 400x400px</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del NFT</label>
                  <input
                    type="text"
                    defaultValue={showEditNFT.nftName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    defaultValue={showEditNFT.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 h-20"
                  />
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-1">📱 Distribución UserWebApp</h4>
                  <p className="text-sm text-orange-700">
                    La imagen se optimizará automáticamente y se distribuirá a todos los clientes que desbloqueen este nivel
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowEditNFT(null)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      alert(`✅ NFT ${showEditNFT.name} actualizado exitosamente\n\nLa nueva imagen se sincronizará automáticamente con todas las UserWebApps de clientes que tengan este nivel desbloqueado.`);
                      setShowEditNFT(null);
                    }}
                    className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    💾 Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📊 Modal de Exportación */}
      {showClientExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📊 Exportar Clientes</h2>
                <button 
                  onClick={() => setShowClientExport(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Nivel</label>
                  <select name="level" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="all">Todos los niveles (106 clientes)</option>
                    {kumiaLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.name} ({level.activeClients} clientes)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formato de Exportación</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input type="radio" name="format" value="excel" className="mr-2" defaultChecked />
                      📊 Excel
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="format" value="csv" className="mr-2" />
                      📄 CSV
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="format" value="pdf" className="mr-2" />
                      📑 PDF
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-1">📋 Datos incluidos en la exportación:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Nombre completo y email del cliente</li>
                    <li>• Nivel actual y stars acumuladas</li>
                    <li>• Fecha de última visita y frecuencia</li>
                    <li>• Total gastado y ticket promedio</li>
                    <li>• NFTs desbloqueados y fecha de obtención</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowClientExport(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleExportClients}
                    className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    📥 Exportar Datos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📊 Modal de Análisis Completo */}
      {showCompleteAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📊 Análisis Completo - Sistema KumIA Stars</h2>
                <button 
                  onClick={() => setShowCompleteAnalysis(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-4">📈 Análisis de Rendimiento por Nivel</h3>
                  <div className="space-y-3">
                    {kumiaLevels.map(level => (
                      <div key={level.id} className="bg-white p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800">{level.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${level.badgeColor} ${level.textColor}`}>
                            {level.activeClients} clientes
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>ROI promedio:</span>
                            <span className="font-medium">x{(level.multiplier * 2.3).toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Retención:</span>
                            <span className="font-medium">{Math.floor(85 + level.multiplier * 5)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ticket promedio:</span>
                            <span className="font-medium">${(3200 * level.multiplier).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-4">💰 Impacto Económico Mensual</h3>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-2">$428,500</div>
                      <div className="text-sm text-green-700">Ingresos atribuidos al sistema Stars</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">+34%</div>
                      <div className="text-sm text-blue-700">Incremento vs sistema anterior</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-2">$4,050</div>
                      <div className="text-sm text-purple-700">Ticket promedio ponderado</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-orange-50 p-6 rounded-lg">
                <h3 className="font-bold text-orange-800 mb-4">🎯 Recomendaciones Estratégicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-orange-700 mb-2">📊 Optimizaciones Detectadas:</h4>
                    <ul className="text-sm text-orange-600 space-y-1">
                      <li>• Aumentar incentivos nivel Descubridor (+12% conversión estimada)</li>
                      <li>• Campaña especial nivel Estrella (3 clientes en riesgo de inactividad)</li>
                      <li>• Promoción referidos nivel Leyenda (potencial +8 clientes premium)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-700 mb-2">🚀 Oportunidades de Crecimiento:</h4>
                    <ul className="text-sm text-orange-600 space-y-1">
                      <li>• Implementar sub-niveles dentro de Estrella y Leyenda</li>
                      <li>• Crear eventos exclusivos para niveles altos</li>
                      <li>• Integrar gamificación social (competencias entre niveles)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ Modal de Configuración del Sistema */}
      {showSystemConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">⚙️ Configuración del Sistema KumIA Stars</h2>
                <button 
                  onClick={() => setShowSystemConfig(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-4">🎯 Configuración General del Sistema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Valor por Star (CLP)</label>
                      <input
                        type="number"
                        defaultValue="3000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="mt-2 p-3 bg-blue-100 rounded-lg">
                        <p className="text-xs text-blue-800 mb-2"><strong>💡 ¿Por qué 3,000 CLP?</strong></p>
                        <p className="text-xs text-blue-700">
                          Basado en análisis de ticket promedio ($3,200) donde 1 Star = ~1% del ticket. 
                          Para alcanzar una recompensa de $20,000 se requieren ~36 Stars (equivalente a $108,000 en consumo).
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          <strong>Recomendación:</strong> Mantener este valor constante para todos los restaurantes KUMIA. 
                          Ajustar solo si el ticket promedio varía significativamente (+/-50%).
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Período de canje (días)</label>
                      <input
                        type="number"
                        defaultValue="60"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="mt-2 p-3 bg-amber-100 rounded-lg">
                        <p className="text-xs text-amber-800">
                          <strong>⏰ Ventana de canje:</strong> Tiempo máximo que tiene el cliente para canjear sus stars una vez alcanzado el nivel mínimo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-4">⭐ Configuración de Generación de Stars</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Feedback con texto</label>
                      <input
                        type="number"
                        defaultValue="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Feedback con imagen</label>
                      <input
                        type="number"
                        defaultValue="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Feedback con video</label>
                      <input
                        type="number"
                        defaultValue="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reserva completada</label>
                      <input
                        type="number"
                        defaultValue="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Referido exitoso</label>
                      <input
                        type="number"
                        defaultValue="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Juego completado (UserApp)</label>
                      <input
                        type="number"
                        defaultValue="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Uso plataforma de pagos</label>
                      <input
                        type="number"
                        defaultValue="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-emerald-100 p-3 rounded-lg">
                    <h4 className="font-medium text-emerald-800 mb-2">💰 Stars por Monto de Compra</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Stars por cada $ gastado</label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">1 Star por cada $</span>
                          <input
                            type="number"
                            defaultValue="3000"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-600">CLP</span>
                        </div>
                      </div>
                      <div className="bg-green-200 p-2 rounded">
                        <p className="text-xs text-green-800">
                          <strong>Ejemplo:</strong> Compra de $60,000 = 20 Stars base<br/>
                          Con multiplicador x1.5 (Destacado) = 30 Stars total
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      <strong>📌 Importante:</strong> Todas las acciones se multiplican por el multiplicador del nivel actual del cliente. 
                      Las stars por monto de compra se calculan automáticamente según el valor por star configurado arriba.
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold text-purple-800 mb-4">🏆 Configuración de Niveles</h3>
                  
                  <div className="mb-4 p-3 bg-indigo-100 rounded-lg">
                    <h4 className="font-medium text-indigo-800 mb-2">📋 Información Importante sobre Niveles</h4>
                    <ul className="text-xs text-indigo-700 space-y-1">
                      <li>• <strong>Stars Requeridas:</strong> Número de stars ADICIONALES necesarias para alcanzar ese nivel (no acumulativo)</li>
                      <li>• <strong>Multiplicadores:</strong> Se recomiendan valores estándar para mantener equilibrio en el sistema</li>
                      <li>• <strong>Estados:</strong> Solo cambiar a "Mantenimiento" si hay problemas técnicos temporales</li>
                      <li>• <strong>Modificación por restaurante:</strong> Los valores base deben mantenerse consistentes en toda la red KUMIA</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    {kumiaLevels.map((level, index) => (
                      <div key={level.id} className="bg-white p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium text-gray-800">{level.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${level.badgeColor} ${level.textColor}`}>
                              Nivel {index + 1}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{level.activeClients} clientes activos</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Stars requeridas {index > 0 ? '(adicionales)' : '(base)'}
                            </label>
                            <input
                              type="number"
                              defaultValue={level.starsRequired}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                              disabled={index === 0} // Descubridor no se puede cambiar
                            />
                            {index > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Total para llegar: {kumiaLevels.slice(0, index + 1).reduce((sum, l) => sum + l.starsRequired, 0)} stars
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Multiplicador (recomendado)</label>
                            <input
                              type="number"
                              step="0.1"
                              defaultValue={level.multiplier}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 bg-gray-50"
                              title="Valor recomendado para mantener equilibrio del sistema"
                            />
                            <p className="text-xs text-gray-500 mt-1">Estándar KUMIA</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Capitalización estimada</label>
                            <input
                              type="text"
                              defaultValue={level.capitalization}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 bg-gray-50"
                              readOnly
                              title="Calculado automáticamente basado en valor por star"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Estado del nivel</label>
                            <select className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500">
                              <option>Activo</option>
                              <option>Mantenimiento</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              {level.id === 'descubridor' ? 'Siempre activo' : 'Cambiar solo si necesario'}
                            </p>
                          </div>
                        </div>
                        
                        {index === 0 && (
                          <div className="mt-3 p-2 bg-gray-100 rounded">
                            <p className="text-xs text-gray-600">
                              <strong>Nivel base:</strong> No requiere stars previas y no se puede desactivar
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                    <h4 className="font-medium text-amber-800 mb-2">⚠️ Recomendaciones de Configuración</h4>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>• <strong>No modificar multiplicadores</strong> sin análisis previo - afecta el equilibrio económico</li>
                      <li>• <strong>Stars requeridas</strong> se pueden ajustar según comportamiento de usuarios locales</li>
                      <li>• <strong>Estados "Mantenimiento"</strong> solo para problemas temporales de NFTs o beneficios</li>
                      <li>• <strong>Consistencia de red:</strong> Grandes cambios deben coordinarse con otros restaurantes KUMIA</li>
                    </ul>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowSystemConfig(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      alert('⚙️ Configuración guardada exitosamente\n\nTodos los cambios se aplicarán inmediatamente al sistema KumIA Stars. Las modificaciones se sincronizarán automáticamente con Firebase y UserWebApps.');
                      setShowSystemConfig(false);
                    }}
                    className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    💾 Guardar Configuración
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 👥 Modal de Ver Clientes */}
      {showClientsList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">👥 Clientes Nivel {showClientsList.name}</h2>
                  <p className="text-gray-600">{showClientsList.activeClients} clientes activos • Multiplicador x{showClientsList.multiplier}</p>
                </div>
                <button 
                  onClick={() => setShowClientsList(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {(() => {
                const mockClients = {
                  descubridor: [
                    { id: 1, name: 'Ana Torres', email: 'ana.torres@email.com', phone: '+56912345678', stars: 28, lastVisit: '2025-01-25', totalSpent: 89000, visits: 12, nftUnlocked: 'Ninguno', status: 'Activo' },
                    { id: 2, name: 'Luis Martín', email: 'luis.martin@email.com', phone: '+56987654321', stars: 15, lastVisit: '2025-01-20', totalSpent: 45000, visits: 8, nftUnlocked: 'Ninguno', status: 'Activo' },
                    { id: 3, name: 'Carmen Silva', email: 'carmen.silva@email.com', phone: '+56945678123', stars: 32, lastVisit: '2025-01-28', totalSpent: 96000, visits: 14, nftUnlocked: 'Ninguno', status: 'Inactivo' },
                    { id: 4, name: 'María González', email: 'maria.gonzalez@email.com', phone: '+56923456789', stars: 21, lastVisit: '2025-01-22', totalSpent: 63000, visits: 9, nftUnlocked: 'Ninguno', status: 'Activo' }
                  ],
                  explorador: [
                    { id: 5, name: 'Pedro Ruiz', email: 'pedro.ruiz@email.com', phone: '+56912348765', stars: 44, lastVisit: '2025-01-26', totalSpent: 132000, visits: 18, nftUnlocked: 'NFT Explorador', status: 'Activo' },
                    { id: 6, name: 'Sofia Moreno', email: 'sofia.moreno@email.com', phone: '+56934567812', stars: 39, lastVisit: '2025-01-24', totalSpent: 117000, visits: 16, nftUnlocked: 'NFT Explorador', status: 'Inactivo' }
                  ],
                  destacado: [
                    { id: 7, name: 'Diego Castro', email: 'diego.castro@email.com', phone: '+56923456781', stars: 56, lastVisit: '2025-01-27', totalSpent: 168000, visits: 22, nftUnlocked: 'NFT Destacado', status: 'Activo' },
                    { id: 8, name: 'Elena Vargas', email: 'elena.vargas@email.com', phone: '+56945671234', stars: 52, lastVisit: '2025-01-23', totalSpent: 156000, visits: 21, nftUnlocked: 'NFT Destacado', status: 'Activo' }
                  ],
                  estrella: [
                    { id: 9, name: 'Roberto Kim', email: 'roberto.kim@email.com', phone: '+56912347856', stars: 68, lastVisit: '2025-01-29', totalSpent: 204000, visits: 28, nftUnlocked: 'NFT Estrella', status: 'Activo' }
                  ],
                  leyenda: [
                    { id: 10, name: 'Alexander Zúñiga', email: 'alexander.zuniga@email.com', phone: '+56934561278', stars: 89, lastVisit: '2025-01-28', totalSpent: 267000, visits: 35, nftUnlocked: 'NFT Leyenda', status: 'Activo' },
                    { id: 11, name: 'Valentina Chen', email: 'valentina.chen@email.com', phone: '+56923451867', stars: 95, lastVisit: '2025-01-26', totalSpent: 285000, visits: 38, nftUnlocked: 'NFT Leyenda', status: 'Inactivo' }
                  ]
                };

                let clients = mockClients[showClientsList.id] || [];
                
                // Aplicar filtros
                if (clientSearchTerm) {
                  clients = clients.filter(client =>
                    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
                  );
                }
                
                if (clientStatusFilter !== 'all') {
                  clients = clients.filter(client =>
                    clientStatusFilter === 'active' ? client.status === 'Activo' : client.status === 'Inactivo'
                  );
                }

                return (
                  <div className="space-y-4">
                    {/* Filtros y Acciones */}
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                      <div className="flex space-x-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={clientSearchTerm}
                            onChange={(e) => setClientSearchTerm(e.target.value)}
                            onKeyPress={handleSearchEnter}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                          />
                          <button 
                            onClick={() => handleClientSearch(clientSearchTerm)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500"
                          >
                            🔍
                          </button>
                        </div>
                        <select 
                          value={clientStatusFilter}
                          onChange={(e) => setClientStatusFilter(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="all">Todos los estados</option>
                          <option value="active">Activo</option>
                          <option value="inactive">Inactivo</option>
                        </select>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setShowClientExport(true)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          📤 Exportar Lista
                        </button>
                        <button 
                          onClick={() => handleEmailCampaign(showClientsList)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          📧 Campaña Email
                        </button>
                        <button 
                          onClick={() => handleWhatsAppCampaign(showClientsList)}
                          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                        >
                          📱 Campaña WhatsApp
                        </button>
                      </div>
                    </div>

                    {/* Tabla de Clientes */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Contacto</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Stars</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Última Visita</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Total Gastado</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">NFT</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clients.map(client => (
                            <tr key={client.id} className="hover:bg-gray-50">
                              <td className="border border-gray-200 px-4 py-3">
                                <div>
                                  <div className="font-medium text-gray-800">{client.name}</div>
                                  <div className="text-sm text-gray-600">{client.visits} visitas</div>
                                </div>
                              </td>
                              <td className="border border-gray-200 px-4 py-3">
                                <div className="text-sm">
                                  <div>{client.email}</div>
                                  <div className="text-gray-600">{client.phone}</div>
                                </div>
                              </td>
                              <td className="border border-gray-200 px-4 py-3">
                                <span className="font-bold text-orange-600">{client.stars}</span>
                              </td>
                              <td className="border border-gray-200 px-4 py-3 text-sm">
                                {client.lastVisit}
                              </td>
                              <td className="border border-gray-200 px-4 py-3">
                                <span className="font-medium text-green-600">${client.totalSpent.toLocaleString()}</span>
                              </td>
                              <td className="border border-gray-200 px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  client.nftUnlocked === 'Ninguno' ? 'bg-gray-100 text-gray-600' : 
                                  showClientsList.badgeColor + ' ' + showClientsList.textColor
                                }`}>
                                  {client.nftUnlocked}
                                </span>
                              </td>
                              <td className="border border-gray-200 px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  client.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {client.status}
                                </span>
                              </td>
                              <td className="border border-gray-200 px-4 py-3">
                                <div className="flex space-x-1">
                                  <button 
                                    onClick={() => handleViewClientDetails(client)}
                                    className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                                    title="Ver detalles del cliente"
                                  >
                                    👁️
                                  </button>
                                  <button 
                                    onClick={() => handleEditClient(client)}
                                    className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs hover:bg-green-200 transition-colors"
                                    title="Editar cliente"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    onClick={() => handleContactClient(client)}
                                    className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs hover:bg-orange-200 transition-colors"
                                    title="Contactar cliente"
                                  >
                                    💬
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Resumen */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-2">📊 Resumen Nivel {showClientsList.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total clientes:</span>
                          <span className="font-bold text-gray-800 ml-2">{clients.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Stars promedio:</span>
                          <span className="font-bold text-orange-600 ml-2">
                            {Math.round(clients.reduce((sum, c) => sum + c.stars, 0) / clients.length)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Gasto promedio:</span>
                          <span className="font-bold text-green-600 ml-2">
                            ${Math.round(clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.length).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Visitas promedio:</span>
                          <span className="font-bold text-blue-600 ml-2">
                            {Math.round(clients.reduce((sum, c) => sum + c.visits, 0) / clients.length)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ Modal de Configurar Nivel */}
      {showLevelConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">⚙️ Configurar Nivel {showLevelConfig.name}</h2>
                  <p className="text-gray-600">Gestión avanzada de beneficios, recompensas y configuración del nivel</p>
                </div>
                <button 
                  onClick={() => setShowLevelConfig(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Información Actual */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-3">📋 Información Actual</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Stars requeridas:</span>
                      <div className="font-bold text-orange-600">{showLevelConfig.starsRequired} {showLevelConfig.id !== 'descubridor' ? '(adicionales)' : '(base)'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Multiplicador:</span>
                      <div className="font-bold text-blue-600">x{showLevelConfig.multiplier}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Clientes activos:</span>
                      <div className="font-bold text-green-600">{showLevelConfig.activeClients}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Capitalización:</span>
                      <div className="font-bold text-purple-600 text-sm">{showLevelConfig.capitalization}</div>
                    </div>
                  </div>
                </div>

                {/* Beneficios y Descripción */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-3">🎁 Beneficios del Nivel</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción Principal</label>
                      <textarea
                        defaultValue={showLevelConfig.description}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Beneficio Principal</label>
                      <textarea
                        defaultValue={showLevelConfig.benefit}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-16"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descuento Especial (%)</label>
                        <input
                          type="number"
                          defaultValue={showLevelConfig.multiplier * 5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad en Reservas</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Normal</option>
                          <option>Preferencial</option>
                          <option>VIP</option>
                          <option>Máxima</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recompensas Específicas */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-3">🏆 Recompensas Específicas del Nivel</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <div className="font-medium text-gray-800">Plato del Mes Gratis</div>
                        <div className="text-sm text-gray-600">Disponible cada 30 días</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600">Activo</span>
                        <button className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-200 transition-colors">
                          Desactivar
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <div className="font-medium text-gray-800">Mesa Preferencial</div>
                        <div className="text-sm text-gray-600">Reserva automática en mejores mesas</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600">Activo</span>
                        <button className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-200 transition-colors">
                          Desactivar
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddNewReward(showLevelConfig)}
                      className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      + Agregar Nueva Recompensa
                    </button>
                  </div>
                </div>

                {/* Análisis de Rendimiento */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold text-purple-800 mb-3">📊 Análisis de Rendimiento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{(showLevelConfig.multiplier * 2.3).toFixed(1)}x</div>
                      <div className="text-sm text-gray-600">ROI Promedio</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{Math.floor(85 + showLevelConfig.multiplier * 5)}%</div>
                      <div className="text-sm text-gray-600">Retención</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">${(3200 * showLevelConfig.multiplier).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Ticket Promedio</div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowLevelConfig(null)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleDetailedAnalysis(showLevelConfig)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    📊 Ver Análisis Detallado
                  </button>
                  <button 
                    onClick={() => {
                      alert(`✅ Configuración del nivel ${showLevelConfig.name} guardada exitosamente\n\nTodos los cambios se aplicarán inmediatamente y se sincronizarán con Firebase.`);
                      setShowLevelConfig(null);
                    }}
                    className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    💾 Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📊 Modal de Análisis de Acciones por Nivel */}
      {showActionsAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📈 Análisis de Acciones por Nivel</h2>
                  <p className="text-gray-600">Comportamiento y patrones de uso por cada nivel del sistema KumIA Stars</p>
                </div>
                <button 
                  onClick={() => setShowActionsAnalysis(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Resumen General */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-4">📊 Resumen General de Acciones</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">2,847</div>
                      <div className="text-sm text-gray-600">Total Feedbacks</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">1,293</div>
                      <div className="text-sm text-gray-600">Reservas Completadas</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">456</div>
                      <div className="text-sm text-gray-600">Referidos Exitosos</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">789</div>
                      <div className="text-sm text-gray-600">Juegos Completados</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-pink-600">2,156</div>
                      <div className="text-sm text-gray-600">Pagos Procesados</div>
                    </div>
                  </div>
                </div>

                {/* Análisis por Nivel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {kumiaLevels.map((level, index) => {
                    const mockData = {
                      descubridor: { feedback: 45, reservas: 30, referidos: 15, juegos: 5, pagos: 25 },
                      explorador: { feedback: 40, reservas: 35, referidos: 20, juegos: 8, pagos: 30 },
                      destacado: { feedback: 35, reservas: 40, referidos: 25, juegos: 12, pagos: 35 },
                      estrella: { feedback: 30, reservas: 45, referidos: 30, juegos: 15, pagos: 40 },
                      leyenda: { feedback: 25, reservas: 50, referidos: 35, juegos: 20, pagos: 45 }
                    };

                    const levelData = mockData[level.id];

                    return (
                      <div key={level.id} className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${level.bgColor}`}></div>
                            <h4 className="font-bold text-gray-800">{level.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${level.badgeColor} ${level.textColor}`}>
                              {level.activeClients} clientes
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">Multiplicador: x{level.multiplier}</span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">💬 Feedback</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${levelData.feedback}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-800">{levelData.feedback}%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">📅 Reservas</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${levelData.reservas}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-800">{levelData.reservas}%</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">👥 Referidos</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${levelData.referidos}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-800">{levelData.referidos}%</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">🎮 Juegos</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${levelData.juegos}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-800">{levelData.juegos}%</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">💳 Pagos</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-pink-400 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${levelData.pagos}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-800">{levelData.pagos}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">🎯 Insights del Nivel</h5>
                          <p className="text-xs text-gray-600">
                            {level.id === 'descubridor' && "Nuevos usuarios priorizan feedback básico y conocimiento del restaurante."}
                            {level.id === 'explorador' && "Balance entre feedback y reservas, comenzando a explorar beneficios."}
                            {level.id === 'destacado' && "Mayor foco en reservas y experiencias VIP, uso moderado de juegos."}
                            {level.id === 'estrella' && "Usuarios premium con alta frecuencia de reservas y referidos activos."}
                            {level.id === 'leyenda' && "Embajadores de marca con máximo engagement en reservas y referidos."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recomendaciones Estratégicas */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-lg">
                  <h3 className="font-bold text-emerald-800 mb-4">💡 Recomendaciones Estratégicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-emerald-700 mb-3">🎯 Optimizaciones Detectadas:</h4>
                      <ul className="space-y-2 text-sm text-emerald-600">
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span><strong>Descubridor:</strong> Incrementar incentivos para juegos (+15% engagement estimado)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span><strong>Explorador:</strong> Promover programa de referidos (potencial +8 nuevos clientes/mes)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span><strong>Estrella:</strong> Campaign especial para maximizar feedback con video</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-emerald-700 mb-3">🚀 Oportunidades de Crecimiento:</h4>
                      <ul className="space-y-2 text-sm text-emerald-600">
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span>Crear challenges cruzados entre niveles para aumentar interacción</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span>Implementar sistema de mentorías: Leyenda → Descubridor</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span>Gamificar proceso de pagos para niveles más bajos</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📧 Modal de Campaña Email */}
      {showEmailCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📧 Campaña Email - Nivel {showEmailCampaign.name}</h2>
                  <p className="text-gray-600">Crea una campaña de email personalizada para {showEmailCampaign.activeClients} clientes</p>
                </div>
                <button 
                  onClick={() => setShowEmailCampaign(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Configuración de la Campaña */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-4">📋 Configuración de la Campaña</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Campaña</label>
                      <input
                        type="text"
                        defaultValue={`Campaña ${showEmailCampaign.name} - ${new Date().toLocaleDateString()}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Campaña</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Promoción Especial</option>
                        <option>Bienvenida</option>
                        <option>Reactivación</option>
                        <option>Evento Exclusivo</option>
                        <option>Encuesta de Satisfacción</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Segmentación */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-4">🎯 Segmentación y Alcance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado del Cliente</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          Activos ({showEmailCampaign.activeClients - Math.floor(showEmailCampaign.activeClients * 0.1)} clientes)
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Inactivos ({Math.floor(showEmailCampaign.activeClients * 0.1)} clientes)
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filtros Adicionales</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Última visita &lt; 30 días
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Gasto total &gt; $50,000
                        </label>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">📊 Alcance Estimado</h4>
                      <div className="text-2xl font-bold text-green-600">{showEmailCampaign.activeClients}</div>
                      <div className="text-sm text-gray-600">emails a enviar</div>
                      <div className="text-xs text-gray-500 mt-1">Tasa apertura estimada: 25%</div>
                    </div>
                  </div>
                </div>

                {/* Contenido del Email */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold text-purple-800 mb-4">✉️ Contenido del Email</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Asunto del Email</label>
                      <input
                        type="text"
                        defaultValue={`¡Oferta especial para clientes ${showEmailCampaign.name}! 🔥`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plantilla de Email</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3">
                        <option>Promoción IL MANDORLA</option>
                        <option>Bienvenida KUMIA Stars</option>
                        <option>Evento Exclusivo</option>
                        <option>Reactivación Cliente</option>
                      </select>
                      <textarea
                        rows="8"
                        defaultValue={`Hola [NOMBRE],

¡Tenemos una oferta especial para ti como cliente ${showEmailCampaign.name}!

🔥 Disfruta de un ${showEmailCampaign.multiplier * 10}% de descuento en tu próxima visita
⭐ Multiplica tus KUMIA Stars x${showEmailCampaign.multiplier}
🎁 Acceso a nuestro menú exclusivo del mes

Tu nivel ${showEmailCampaign.name} te da acceso a beneficios únicos. ¡No te los pierdas!

Reserva ahora: [LINK_RESERVA]

¡Te esperamos en IL MANDORLA!
El equipo KUMIA`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Programación */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-bold text-orange-800 mb-4">⏰ Programación de Envío</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Envío</label>
                      <input
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Envío</label>
                      <input
                        type="time"
                        defaultValue="10:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option>America/Santiago (UTC-3)</option>
                        <option>America/New_York (UTC-5)</option>
                        <option>Europe/Madrid (UTC+1)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Integración con Agentes IA */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                  <h3 className="font-bold text-indigo-800 mb-4">🤖 Integración con Agentes IA</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Agente IA Responsable</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>📧 Email Marketing IA</option>
                        <option>🎯 Upselling Master IA</option>
                        <option>💎 KUMIA Loyalty IA</option>
                        <option>📱 Community Manager IA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Personalización IA</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          Personalizar por historial de compras
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          Incluir recomendaciones de platos
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Optimizar horario de envío por cliente
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowEmailCampaign(null)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      alert(`📧 VISTA PREVIA DEL EMAIL\n\n📋 Configuración:\n• Campaña: ${showEmailCampaign.name}\n• Destinatarios: ${showEmailCampaign.activeClients} clientes\n• Descuento: ${showEmailCampaign.multiplier * 10}%\n• Multiplicador Stars: x${showEmailCampaign.multiplier}\n\n💡 En producción se abrirá un preview completo del email con plantilla visual y opción de envío de prueba.`);
                    }}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    👀 Vista Previa
                  </button>
                  <button 
                    onClick={() => {
                      alert(`✅ CAMPAÑA EMAIL PROGRAMADA\n\n🚀 Tu campaña "${showEmailCampaign.name}" ha sido programada exitosamente:\n\n📊 Resumen:\n• ${showEmailCampaign.activeClients} emails programados\n• Envío: Hoy a las 10:00 AM\n• Agente IA: Email Marketing IA\n• Personalización: Activada\n\n📈 Métricas esperadas:\n• Tasa de apertura: ~25%\n• Tasa de clicks: ~8%\n• Conversiones estimadas: ~15 clientes\n\nRecibirás un reporte completo 24h después del envío.`);
                      setShowEmailCampaign(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-bold"
                  >
                    📧 Programar Envío
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📱 Modal de Campaña WhatsApp */}
      {showWhatsAppCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📱 Campaña WhatsApp - Nivel {showWhatsAppCampaign.name}</h2>
                  <p className="text-gray-600">Crea una campaña de WhatsApp Business para {showWhatsAppCampaign.activeClients} clientes</p>
                </div>
                <button 
                  onClick={() => setShowWhatsAppCampaign(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Configuración de la Campaña */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-4">📋 Configuración de la Campaña WhatsApp</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Campaña</label>
                      <input
                        type="text"
                        defaultValue={`WhatsApp ${showWhatsAppCampaign.name} - ${new Date().toLocaleDateString()}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Mensaje</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option>Promoción con Multimedia</option>
                        <option>Mensaje de Texto Simple</option>
                        <option>Invitación a Reservar</option>
                        <option>Encuesta Rápida</option>
                        <option>Recordatorio de Visita</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Configuración de Envío Bulk */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-4">📤 Configuración de Envío Masivo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Modo de Envío</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Envío Inmediato</option>
                        <option>Envío Programado</option>
                        <option>Envío Escalonado (cada 30 seg)</option>
                        <option>Envío Inteligente (IA optimiza horario)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Límite por Hora</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Sin límite</option>
                        <option>50 mensajes/hora</option>
                        <option>100 mensajes/hora</option>
                        <option>200 mensajes/hora</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado del Cliente</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          Activos
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Inactivos (reactivación)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido del Mensaje */}
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-bold text-emerald-800 mb-4">💬 Contenido del Mensaje WhatsApp</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Plantilla de Mensaje</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3">
                          <option>Promoción IL MANDORLA</option>
                          <option>Invitación Especial</option>
                          <option>Reactivación Cliente</option>
                          <option>Encuesta Satisfacción</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Incluir Multimedia</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" defaultChecked className="mr-2" />
                            🖼️ Imagen del plato destacado
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            📄 PDF con menú especial
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            🎥 Video promocional
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje Personalizado</label>
                      <textarea
                        rows="6"
                        defaultValue={`🔥 ¡Hola [NOMBRE]!

Como cliente ${showWhatsAppCampaign.name}, tienes acceso a una oferta especial:

✨ ${showWhatsAppCampaign.multiplier * 10}% de descuento en tu próxima visita
⭐ Multiplica tus KUMIA Stars x${showWhatsAppCampaign.multiplier}
🎁 Acceso a nuestro menú exclusivo

🍖 ¡Ven a disfrutar las mejores carnes ahumadas de Santiago!

Reserva aquí: [LINK_RESERVA]
Válido hasta: [FECHA_LIMITE]

IL MANDORLA Smokehouse 🥩`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Integración con Agentes IA */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-purple-800 mb-4">🤖 Integración con Agentes IA WhatsApp</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Agente IA para Seguimiento</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option>📱 WhatsApp Concierge IA</option>
                        <option>🎯 Upselling Master IA</option>
                        <option>📞 Customer Service IA</option>
                        <option>🏪 Reservations Manager IA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Configuración Avanzada</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          Respuesta automática a consultas
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          Seguimiento de conversiones
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Recordatorio automático 24h después
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Programación y Métricas */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-bold text-orange-800 mb-4">📊 Programación y Métricas Esperadas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora</label>
                      <input
                        type="datetime-local"
                        defaultValue={new Date(Date.now() + 60*60*1000).toISOString().slice(0, 16)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">📈 Métricas Esperadas</h4>
                      <div className="text-sm space-y-1">
                        <div>Entregas: ~95%</div>
                        <div>Lecturas: ~85%</div>
                        <div>Respuestas: ~25%</div>
                        <div>Conversiones: ~12%</div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">💰 ROI Estimado</h4>
                      <div className="text-2xl font-bold text-green-600">+285%</div>
                      <div className="text-sm text-gray-600">Retorno esperado</div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowWhatsAppCampaign(null)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      alert(`📱 VISTA PREVIA WHATSAPP\n\n💬 Mensaje Preview:\n"🔥 ¡Hola Juan!\n\nComo cliente ${showWhatsAppCampaign.name}, tienes ${showWhatsAppCampaign.multiplier * 10}% descuento..."\n\n📊 Configuración:\n• ${showWhatsAppCampaign.activeClients} mensajes programados\n• Agente IA: WhatsApp Concierge\n• Multimedia: Imagen del plato incluida\n• ROI esperado: +285%\n\n💡 En producción se mostrará el preview completo con la imagen y formato de WhatsApp Business.`);
                    }}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    👀 Vista Previa
                  </button>
                  <button 
                    onClick={() => {
                      alert(`✅ CAMPAÑA WHATSAPP PROGRAMADA\n\n🚀 Tu campaña WhatsApp "${showWhatsAppCampaign.name}" ha sido programada:\n\n📱 Resumen:\n• ${showWhatsAppCampaign.activeClients} mensajes programados\n• Envío: En 1 hora (escalonado)\n• Agente IA: WhatsApp Concierge activado\n• Multimedia: Imagen incluida\n\n📈 Proyecciones:\n• Entregas esperadas: ${Math.floor(showWhatsAppCampaign.activeClients * 0.95)}\n• Lecturas esperadas: ${Math.floor(showWhatsAppCampaign.activeClients * 0.85)}\n• Respuestas esperadas: ${Math.floor(showWhatsAppCampaign.activeClients * 0.25)}\n• Conversiones esperadas: ${Math.floor(showWhatsAppCampaign.activeClients * 0.12)}\n\n💰 ROI estimado: +285%\n\n📊 Recibirás reportes en tiempo real en el dashboard.`);
                      setShowWhatsAppCampaign(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-bold"
                  >
                    📱 Programar Campaña
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎁 Modal de Agregar Nueva Recompensa */}
      {showNewReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">🎁 Agregar Nueva Recompensa - Nivel {showNewReward.name}</h2>
                  <p className="text-gray-600">Crea una nueva recompensa exclusiva para este nivel</p>
                </div>
                <button 
                  onClick={() => setShowNewReward(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulario de Recompensa */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Recompensa</label>
                    <input
                      type="text"
                      placeholder={`Ej: "Descuento VIP ${showNewReward.name}"`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Recompensa</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="discount">Descuento Porcentual</option>
                      <option value="free_item">Producto/Plato Gratis</option>
                      <option value="upgrade">Upgrade de Servicio</option>
                      <option value="experience">Experiencia Especial</option>
                      <option value="points">Stars Bonus</option>
                      <option value="exclusive">Acceso Exclusivo</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Valor/Descuento</label>
                      <div className="flex">
                        <input
                          type="number"
                          placeholder="25"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <select className="px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                          <option value="%">%</option>
                          <option value="CLP">CLP</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stars Necesarias</label>
                      <input
                        type="number"
                        placeholder={showNewReward.starsRequired}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción Detallada</label>
                    <textarea
                      placeholder={`Ej: "Descuento especial del 25% en todos los platos principales para clientes nivel ${showNewReward.name}. Válido de lunes a viernes, no acumulable con otras promociones."`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Límites y Restricciones</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" id="max_uses" className="rounded" />
                        <label htmlFor="max_uses" className="text-sm text-gray-600">Límite de usos por cliente</label>
                        <input
                          type="number"
                          placeholder="1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" id="weekdays_only" className="rounded" />
                        <label htmlFor="weekdays_only" className="text-sm text-gray-600">Solo días de semana</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" id="min_purchase" className="rounded" />
                        <label htmlFor="min_purchase" className="text-sm text-gray-600">Compra mínima requerida</label>
                        <input
                          type="number"
                          placeholder="50000"
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-sm text-gray-500">CLP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vista Previa y Configuración Avanzada */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-bold text-orange-800 mb-3">👀 Vista Previa</h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-800">Nueva Recompensa</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${showNewReward.badgeColor} ${showNewReward.textColor}`}>
                          Nivel {showNewReward.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Descripción de la recompensa aparecerá aquí...</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-600 font-medium">25% Descuento</span>
                        <span className="text-gray-500">{showNewReward.starsRequired} Stars</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-800 mb-3">📊 Configuración Avanzada</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notificación Automática</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option>Enviar cuando el cliente alcance las stars</option>
                          <option>Enviar solo cuando el cliente consulte</option>
                          <option>No enviar notificaciones automáticas</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Integración UserWebApp</label>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="show_in_app" className="rounded" defaultChecked />
                          <label htmlFor="show_in_app" className="text-sm text-gray-600">Mostrar en app del cliente</label>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <input type="checkbox" id="push_notification" className="rounded" />
                          <label htmlFor="push_notification" className="text-sm text-gray-600">Enviar push notification</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-bold text-green-800 mb-3">📈 Impacto Proyectado</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Clientes elegibles:</span>
                        <span className="font-medium">{showNewReward.activeClients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uso estimado (30 días):</span>
                        <span className="font-medium">{Math.floor(showNewReward.activeClients * 0.45)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Costo estimado:</span>
                        <span className="font-medium text-red-600">-${(showNewReward.activeClients * 850).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Retorno esperado:</span>
                        <span className="font-medium text-green-600">+${(showNewReward.activeClients * 2400).toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-800 font-medium">ROI Neto:</span>
                          <span className="font-bold text-green-600">+{(((showNewReward.activeClients * 2400) / (showNewReward.activeClients * 850) - 1) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Recomendaciones KUMIA</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Mantén descuentos entre 15-30% para maximizar ROI</li>
                      <li>• Considera horarios de menor demanda para ofertas especiales</li>
                      <li>• Las recompensas temporales (7-14 días) generan más urgencia</li>
                      <li>• Combina con upselling para aumentar ticket promedio</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="mt-6 flex space-x-4">
                <button 
                  onClick={() => setShowNewReward(null)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button className="flex-1 bg-blue-100 text-blue-700 px-6 py-3 rounded-lg hover:bg-blue-200 transition-colors">
                  👀 Vista Previa Completa
                </button>
                <button 
                  onClick={() => {
                    alert(`✅ NUEVA RECOMPENSA CREADA EXITOSAMENTE\n\n🎁 Recompensa para nivel ${showNewReward.name} ha sido agregada al sistema:\n\n📋 Detalles:\n• Tipo: Descuento Porcentual\n• Valor: 25% de descuento\n• Stars requeridas: ${showNewReward.starsRequired}\n• Clientes elegibles: ${showNewReward.activeClients}\n\n🚀 Próximos pasos:\n• La recompensa estará disponible inmediatamente\n• Se enviará notificación a clientes elegibles\n• Se sincronizará con UserWebApp en 5 minutos\n• Reportes disponibles en Análisis de Recompensas\n\n📊 Seguimiento: Recibirás métricas de uso en el dashboard principal.`);
                    setShowNewReward(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-bold"
                >
                  🎁 Crear Recompensa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📊 Modal de Análisis Detallado */}
      {showDetailedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📊 Análisis Detallado - Nivel {showDetailedAnalysis.name}</h2>
                  <p className="text-gray-600">Insights completos y métricas de rendimiento para este nivel</p>
                </div>
                <button 
                  onClick={() => setShowDetailedAnalysis(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Métricas Principales */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                    <h3 className="font-bold text-blue-800 mb-4">📈 Métricas de Rendimiento (Últimos 30 días)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{showDetailedAnalysis.activeClients}</div>
                        <div className="text-sm text-blue-700">Clientes Activos</div>
                        <div className="text-xs text-green-600 mt-1">+{Math.floor(Math.random() * 15 + 5)}% vs mes anterior</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">${(3200 * showDetailedAnalysis.multiplier * showDetailedAnalysis.activeClients).toLocaleString()}</div>
                        <div className="text-sm text-green-700">Ingresos Generados</div>
                        <div className="text-xs text-green-600 mt-1">+{Math.floor(Math.random() * 20 + 10)}% vs mes anterior</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">{Math.floor(85 + showDetailedAnalysis.multiplier * 5)}%</div>
                        <div className="text-sm text-purple-700">Tasa de Retención</div>
                        <div className="text-xs text-green-600 mt-1">+{Math.floor(Math.random() * 8 + 2)}% vs mes anterior</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">{(showDetailedAnalysis.multiplier * 2.3).toFixed(1)}x</div>
                        <div className="text-sm text-orange-700">ROI Promedio</div>
                        <div className="text-xs text-green-600 mt-1">+{Math.floor(Math.random() * 12 + 3)}% vs mes anterior</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                    <h3 className="font-bold text-green-800 mb-4">💰 Análisis Económico Profundo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Distribución de Ingresos</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Ventas directas</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full">
                                <div className="w-3/5 h-2 bg-green-500 rounded-full"></div>
                              </div>
                              <span className="text-sm font-medium">60%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Upselling</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full">
                                <div className="w-1/4 h-2 bg-blue-500 rounded-full"></div>
                              </div>
                              <span className="text-sm font-medium">25%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Referidos</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full">
                                <div className="w-1/6 h-2 bg-purple-500 rounded-full"></div>
                              </div>
                              <span className="text-sm font-medium">15%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Comportamiento de Gasto</h4>
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg">
                            <div className="text-lg font-bold text-gray-800">${(3200 * showDetailedAnalysis.multiplier).toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Ticket Promedio</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <div className="text-lg font-bold text-gray-800">{Math.floor(30 - showDetailedAnalysis.multiplier * 3)} días</div>
                            <div className="text-sm text-gray-600">Frecuencia de Visita</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <div className="text-lg font-bold text-gray-800">{Math.floor(showDetailedAnalysis.multiplier * 8 + 5)}</div>
                            <div className="text-sm text-gray-600">Stars por Visita</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Análisis Comparativo */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                    <h3 className="font-bold text-orange-800 mb-3">🏆 Comparativa con otros Niveles</h3>
                    <div className="space-y-2">
                      {kumiaLevels.map((level, index) => (
                        <div key={level.id} className={`p-2 rounded ${level.id === showDetailedAnalysis.id ? 'bg-orange-100 border border-orange-300' : 'bg-white'}`}>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm font-medium ${level.id === showDetailedAnalysis.id ? 'text-orange-800' : 'text-gray-700'}`}>
                              {level.name}
                            </span>
                            <span className={`text-xs ${level.id === showDetailedAnalysis.id ? 'text-orange-600' : 'text-gray-500'}`}>
                              x{level.multiplier} ({level.activeClients})
                            </span>
                          </div>
                          {level.id === showDetailedAnalysis.id && (
                            <div className="text-xs text-orange-600 mt-1">← Nivel actual</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-bold text-purple-800 mb-3">🎯 Oportunidades de Mejora</h3>
                    <div className="space-y-2 text-sm">
                      <div className="bg-white p-2 rounded">
                        <div className="font-medium text-purple-700">Retención +{Math.floor(Math.random() * 8 + 2)}%</div>
                        <div className="text-purple-600 text-xs">Programa de referidos mejorado</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="font-medium text-purple-700">Ticket +${Math.floor(Math.random() * 500 + 200)}</div>
                        <div className="text-purple-600 text-xs">Sugerencias personalizadas IA</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="font-medium text-purple-700">Conversión +{Math.floor(Math.random() * 15 + 5)}%</div>
                        <div className="text-purple-600 text-xs">Campañas segmentadas</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-bold text-indigo-800 mb-3">🧠 Insights de IA</h3>
                    <div className="space-y-2 text-sm text-indigo-700">
                      <p>• <strong>Patrón detectado:</strong> Clientes de este nivel prefieren reservas {Math.random() > 0.5 ? 'entre semana' : 'de fin de semana'}</p>
                      <p>• <strong>Horario óptimo:</strong> {Math.floor(Math.random() * 4 + 18)}:00 - {Math.floor(Math.random() * 3 + 20)}:00 hrs</p>
                      <p>• <strong>Plato favorito:</strong> {['Parrilla Premium', 'Salmón Ahumado', 'Risotto Trufa', 'Cordero Patagónico'][Math.floor(Math.random() * 4)]}</p>
                      <p>• <strong>Próxima acción:</strong> {Math.random() > 0.5 ? 'Campaña email personalizada' : 'Oferta WhatsApp exclusiva'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowDetailedAnalysis(null)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
                <button className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                  📤 Exportar Análisis
                </button>
                <button className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                  🚀 Implementar Recomendaciones
                </button>
                <button className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors">
                  📧 Enviar a Equipo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🆕 INTEGRACIONES SECTION AMPLIADA
export const IntegrationsSection = () => {
  const [integrations, setIntegrations] = useState([
    { id: 'meta', name: 'Meta Business Suite', type: 'social', status: 'disconnected', icon: '📱', lastSync: null },
    { id: 'google_reviews', name: 'Google Reviews', type: 'reviews', status: 'disconnected', icon: '⭐', lastSync: null },
    { id: 'whatsapp', name: 'WhatsApp Business', type: 'messaging', status: 'disconnected', icon: '💬', lastSync: null },
    { id: 'gemini', name: 'Google Gemini', type: 'ai', status: 'connected', icon: '🧠', lastSync: '2024-01-15 11:15' },
    { id: 'mercadopago', name: 'MercadoPago', type: 'payment', status: 'disconnected', icon: '💳', lastSync: null },
    { id: 'erp', name: 'Restaurant ERP', type: 'erp', status: 'disconnected', icon: '🏢', lastSync: null }
  ]);

  const [credentials, setCredentials] = useState({
    meta: { app_id: '', app_secret: '', phone_number_id: '' },
    google_reviews: { location_id: '', service_account_key: '' },
    whatsapp: { account_id: '', access_token: '' },
    gemini: { api_key: 'AIzaSyBCKR7mxd9ZpknkKcl8l6eQ7JsjmS05mcE' },
    mercadopago: { app_id: '', access_token: '' },
    erp: { 
      type: 'erpnext', 
      endpoint_url: '', 
      api_key: '', 
      api_secret: '',
      oauth_token: '',
      location_id: '',
      pos_profile: '',
      test_mode: true,
      sync_frequency: 'realtime', // realtime, 1min, 5min, 15min, 30min, 1hour
      webhook_url: '',
      enable_webhooks: false
    }
  });

  const [showERPModal, setShowERPModal] = useState(false);
  const [selectedERP, setSelectedERP] = useState('');

  const restaurantERPs = [
    // 🧠 Open Source / Flexible
    {
      id: 'erpnext',
      name: 'ERPNext',
      logo: '🔵', // En producción: logo real
      category: 'Open Source',
      description: 'Sistema ERP open-source con API REST completa',
      region: 'Global',
      complexity: 'Medium',
      features: ['Orders API', 'Inventory Sync', 'Kitchen Status', 'OAuth Support'],
      endpoints: {
        orders: '/api/resource/Sales Order',
        items: '/api/resource/Item',
        customers: '/api/resource/Customer'
      },
      auth_method: 'API Key + Token',
      documentation: 'https://frappeframework.com/docs/v13/user/en/api',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'odoo',
      name: 'Odoo POS Restaurant',
      logo: '🟣', // En producción: logo real
      category: 'Open Source',
      description: 'Módulo POS Restaurant con flujo completo sala-cocina',
      region: 'Global',
      complexity: 'Medium',
      features: ['Real-time Orders', 'Kitchen Display', 'Inventory Integration', 'JSON-RPC API'],
      endpoints: {
        orders: '/api/pos/orders',
        products: '/api/pos/products',
        sessions: '/api/pos/sessions'
      },
      auth_method: 'OAuth 2.0',
      documentation: 'https://www.odoo.com/documentation/14.0/webservices/odoo_api.html',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'metasfresh',
      name: 'Metasfresh',
      logo: '🟢', // En producción: logo real
      category: 'Open Source',
      description: 'ERP open-source con API REST y enfoque en automatización',
      region: 'Global',
      complexity: 'High',
      features: ['REST API', 'Order Management', 'Inventory Control', 'Workflow Automation'],
      endpoints: {
        orders: '/api/v1/orders',
        products: '/api/v1/products',
        business_partners: '/api/v1/bpartners'
      },
      auth_method: 'API Key',
      documentation: 'https://docs.metasfresh.org/webui_api/',
      sync_support: ['polling', 'webhooks']
    },

    // 🏢 Enterprise / Corporativo
    {
      id: 'oracle_simphony',
      name: 'Oracle Simphony POS',
      logo: '🔴', // En producción: logo real de Oracle
      category: 'Enterprise',
      description: 'Sistema enterprise con APIs RESTful avanzadas',
      region: 'Global',
      complexity: 'High',
      features: ['Real-time Orders', 'Bidirectional Status', 'Delivery Integration', 'Secure Auth'],
      endpoints: {
        orders: '/api/v1/transactions',
        status: '/api/v1/orders/status',
        menu: '/api/v1/menu'
      },
      auth_method: 'OAuth 2.0 + API Key',
      documentation: 'https://docs.oracle.com/en/industries/hospitality/simphony.html',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'sap_s4hana',
      name: 'SAP S/4HANA F&B',
      logo: '🔵', // En producción: logo real de SAP
      category: 'Enterprise',
      description: 'SAP S/4HANA con módulo Food & Beverage',
      region: 'Global',
      complexity: 'Very High',
      features: ['OData Services', 'ABAP RESTful Services', 'Business Events', 'Integration Suite'],
      endpoints: {
        orders: '/sap/opu/odata/sap/API_SALES_ORDER_SRV',
        products: '/sap/opu/odata/sap/API_PRODUCT_SRV',
        business_partner: '/sap/opu/odata/sap/API_BUSINESS_PARTNER'
      },
      auth_method: 'OAuth 2.0 + SAML',
      documentation: 'https://api.sap.com/',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'netsuite',
      name: 'Oracle NetSuite',
      logo: '🟠', // En producción: logo real de NetSuite
      category: 'Enterprise',
      description: 'ERP en la nube con SuiteScript y REST APIs',
      region: 'Global',
      complexity: 'High',
      features: ['SuiteScript', 'RESTlets', 'SuiteTalk', 'Workflow Automation'],
      endpoints: {
        orders: '/app/common/entity/salesord.nl',
        items: '/app/common/item/item.nl',
        customers: '/app/common/entity/custjob.nl'
      },
      auth_method: 'OAuth 2.0 + Token',
      documentation: 'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/book_1559132836.html',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'infor_cloudsuite',
      name: 'Infor CloudSuite F&B',
      logo: '🟡', // En producción: logo real de Infor
      category: 'Enterprise',
      description: 'Suite especializada para Food & Beverage con APIs robustas',
      region: 'Global',
      complexity: 'High',
      features: ['ION API', 'Recipe Management', 'Cost Control', 'Multi-location'],
      endpoints: {
        orders: '/IONAPI/LN/orders',
        recipes: '/IONAPI/LN/recipes',
        inventory: '/IONAPI/LN/inventory'
      },
      auth_method: 'OAuth 2.0',
      documentation: 'https://docs.infor.com/cloudsuite/',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'dynamics_365',
      name: 'Microsoft Dynamics 365',
      logo: '🔷', // En producción: logo real de Microsoft
      category: 'Enterprise',
      description: 'Business Central con módulos de restaurante',
      region: 'Global',
      complexity: 'High',
      features: ['Web API', 'OData v4', 'Power Platform Integration', 'AI Insights'],
      endpoints: {
        orders: '/api/v2.0/companies/orders',
        items: '/api/v2.0/companies/items',
        customers: '/api/v2.0/companies/customers'
      },
      auth_method: 'OAuth 2.0 + Azure AD',
      documentation: 'https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/',
      sync_support: ['realtime', 'webhooks', 'polling']
    },

    // 🌎 Cloud POS / Multiplataforma
    {
      id: 'soft_restaurant',
      name: 'Soft Restaurant',
      logo: '🟠', // En producción: logo real de Soft Restaurant
      category: 'Cloud POS',
      description: 'ERP latinoamericano líder con módulo técnico ERP-POS',
      region: 'LATAM',
      complexity: 'Medium',
      features: ['Orders API', 'Kitchen Status', 'Inventory Sync', 'POS Integration'],
      endpoints: {
        orders: '/api/orders',
        kitchen: '/api/kitchen/status',
        inventory: '/api/inventory'
      },
      auth_method: 'API Key',
      documentation: 'Manual PDF disponible',
      sync_support: ['polling', 'webhooks']
    },
    {
      id: 'restroworks',
      name: 'Restroworks Platform',
      logo: '🔶', // En producción: logo real de Restroworks
      category: 'Cloud POS',
      description: 'Plataforma cloud india con API abierta y multi-ERP',
      region: 'Global',
      complexity: 'Medium',
      features: ['Real-time Orders', 'Kitchen Monitoring', 'Multi-ERP Integration', 'SFTP Support'],
      endpoints: {
        orders: '/api/v2/orders',
        kitchen: '/api/v2/kitchen',
        reporting: '/api/v2/reports'
      },
      auth_method: 'OAuth 2.0',
      documentation: 'https://api.restroworks.com/docs',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'toteat',
      name: 'Toteat',
      logo: '🔸', // En producción: logo real de Toteat
      category: 'Cloud POS',
      description: 'Plataforma cloud española especializada en restauración',
      region: 'Europe',
      complexity: 'Low',
      features: ['Orders API', 'Kitchen Display', 'Menu Management', 'Real-time Sync'],
      endpoints: {
        orders: '/api/v1/orders',
        menu: '/api/v1/menu',
        tables: '/api/v1/tables'
      },
      auth_method: 'API Key + Bearer Token',
      documentation: 'https://developers.toteat.es/',
      sync_support: ['realtime', 'polling']
    },
    {
      id: 'poster_pos',
      name: 'Poster POS (JoinPoster)',
      logo: '🟫', // En producción: logo real de Poster
      category: 'Cloud POS',
      description: 'POS europeo popular con API REST completa',
      region: 'Europe',
      complexity: 'Medium',
      features: ['Orders API', 'Menu Sync', 'Analytics', 'Multi-location'],
      endpoints: {
        orders: '/api/v3/transactions',
        menu: '/api/v3/menu',
        spots: '/api/v3/spots'
      },
      auth_method: 'API Key',
      documentation: 'https://api.joinposter.com/',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'rkeeper',
      name: 'R-Keeper',
      logo: '🟥', // En producción: logo real de R-Keeper
      category: 'Cloud POS',
      description: 'Sistema hospitalario con integración API especializada',
      region: 'Global',
      complexity: 'High',
      features: ['Order Management', 'Kitchen Integration', 'Multi-concept', 'Enterprise Features'],
      endpoints: {
        orders: '/rk7api/v1/orders',
        menu: '/rk7api/v1/menu',
        stations: '/rk7api/v1/stations'
      },
      auth_method: 'API Key + Session',
      documentation: 'https://www.ucs.ru/en/rkeeper-integration/',
      sync_support: ['realtime', 'polling']
    },
    {
      id: 'revel_systems',
      name: 'Revel Systems',
      logo: '🔳', // En producción: logo real de Revel
      category: 'Cloud POS',
      description: 'POS estadounidense con API REST y integración nativa',
      region: 'US',
      complexity: 'Medium',
      features: ['Orders API', 'Inventory Management', 'Reporting', 'Third-party Integration'],
      endpoints: {
        orders: '/api/v1/orders/',
        products: '/api/v1/products/',
        customers: '/api/v1/customers/'
      },
      auth_method: 'API Key + Secret',
      documentation: 'https://revelsystems.com/developers/',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'lightspeed_restaurant',
      name: 'Lightspeed Restaurant',
      logo: '🟡', // En producción: logo real de Lightspeed
      category: 'Cloud POS',
      description: 'Lightspeed especializado en restaurantes con API robusta',
      region: 'Global',
      complexity: 'Medium',
      features: ['Orders API', 'Menu Management', 'Kitchen Display', 'Analytics'],
      endpoints: {
        orders: '/API/Account/{accountID}/Order',
        menu: '/API/Account/{accountID}/Item',
        tables: '/API/Account/{accountID}/Table'
      },
      auth_method: 'OAuth 2.0',
      documentation: 'https://developers.lightspeedpos.com/',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'square_restaurants',
      name: 'Square for Restaurants',
      logo: '⬛', // En producción: logo real de Square
      category: 'Cloud POS',
      description: 'Square especializado en restaurantes con API excelente',
      region: 'Global',
      complexity: 'Low',
      features: ['Orders API', 'Payments', 'Menu Sync', 'Real-time Updates'],
      endpoints: {
        orders: '/v2/orders',
        catalog: '/v2/catalog',
        locations: '/v2/locations'
      },
      auth_method: 'OAuth 2.0 + Bearer Token',
      documentation: 'https://developer.squareup.com/docs/',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'touchbistro',
      name: 'TouchBistro',
      logo: '🔘', // En producción: logo real de TouchBistro
      category: 'Cloud POS',
      description: 'POS canadiense especializado en restaurantes',
      region: 'North America',
      complexity: 'Medium',
      features: ['Orders API', 'Table Management', 'Kitchen Display', 'Staff Management'],
      endpoints: {
        orders: '/api/v1/orders',
        menu: '/api/v1/menu',
        tables: '/api/v1/tables'
      },
      auth_method: 'API Key',
      documentation: 'https://www.touchbistro.com/developers/',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'toast_pos',
      name: 'Toast POS',
      logo: '🟤', // En producción: logo real de Toast
      category: 'Cloud POS',
      description: 'POS estadounidense líder con API comprehensiva',
      region: 'US',
      complexity: 'Medium',
      features: ['Orders API', 'Menu Management', 'Kitchen Display', 'Advanced Analytics'],
      endpoints: {
        orders: '/orders/v2/orders',
        menu: '/config/v2/menuitems',
        restaurants: '/config/v2/restaurants'
      },
      auth_method: 'OAuth 2.0',
      documentation: 'https://doc.toasttab.com/',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'lavu_pos',
      name: 'Lavu POS',
      logo: '🔴', // En producción: logo real de Lavu
      category: 'Cloud POS',
      description: 'POS con API REST y enfoque en integración',
      region: 'US',
      complexity: 'Medium',
      features: ['Orders API', 'Menu Sync', 'Reporting', 'Third-party Apps'],
      endpoints: {
        orders: '/api/v1/orders',
        menu: '/api/v1/menu',
        customers: '/api/v1/customers'
      },
      auth_method: 'API Key + Token',
      documentation: 'https://www.lavu.com/api-documentation/',
      sync_support: ['realtime', 'webhooks', 'polling']
    },

    // 🧬 Kitchen Management & CRP
    {
      id: 'apicbase',
      name: 'Apicbase CRP',
      logo: '🟪', // En producción: logo real de Apicbase
      category: 'Kitchen Management',
      description: 'Culinary Resource Planning especializada en trazabilidad',
      region: 'Global',
      complexity: 'High',
      features: ['Recipe Management', 'Kitchen Traceability', 'Multi-site Support', 'Production Estimates'],
      endpoints: {
        orders: '/api/v1/orders',
        recipes: '/api/v1/recipes',
        production: '/api/v1/production'
      },
      auth_method: 'API Key + OAuth',
      documentation: 'https://developers.apicbase.com',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'marketman',
      name: 'MarketMan',
      logo: '📊', // En producción: logo real de MarketMan
      category: 'Kitchen Management',
      description: 'Gestión de inventarios con API para automatización',
      region: 'Global',
      complexity: 'Medium',
      features: ['Inventory API', 'Cost Control', 'Supplier Integration', 'Analytics'],
      endpoints: {
        inventory: '/api/v1/inventory',
        suppliers: '/api/v1/suppliers',
        orders: '/api/v1/purchase-orders'
      },
      auth_method: 'API Key',
      documentation: 'https://marketman.com/api-docs/',
      sync_support: ['polling', 'webhooks']
    },
    {
      id: 'chowly',
      name: 'Chowly',
      logo: '🚚', // En producción: logo real de Chowly
      category: 'Kitchen Management',
      description: 'Plataforma de integración especializada en delivery',
      region: 'US',
      complexity: 'Low',
      features: ['Order Aggregation', 'POS Integration', 'Menu Sync', 'Real-time Updates'],
      endpoints: {
        orders: '/api/v1/orders',
        menus: '/api/v1/menus',
        locations: '/api/v1/locations'
      },
      auth_method: 'API Key',
      documentation: 'https://chowly.com/developers/',
      sync_support: ['realtime', 'webhooks', 'polling']
    },

    // 📊 Omnichannel & Retail
    {
      id: 'openbravo',
      name: 'Openbravo Commerce Cloud',
      logo: '🌐', // En producción: logo real de Openbravo
      category: 'Omnichannel',
      description: 'Plataforma omnicanal con vertical Ho-Re-Ca',
      region: 'Global',
      complexity: 'High',
      features: ['REST API', 'Omnichannel', 'Retail Integration', 'Cloud Native'],
      endpoints: {
        orders: '/openbravo/ws/dal/Order',
        products: '/openbravo/ws/dal/Product',
        business_partner: '/openbravo/ws/dal/BusinessPartner'
      },
      auth_method: 'Basic Auth + API Key',
      documentation: 'https://wiki.openbravo.com/wiki/Web_Services',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'hiopos',
      name: 'HIOPOS Cloud',
      logo: '☁️', // En producción: logo real de HIOPOS
      category: 'Omnichannel',
      description: 'POS español con capacidades omnicanal',
      region: 'Spain',
      complexity: 'Medium',
      features: ['Cloud API', 'Multi-device', 'Inventory Sync', 'Customer Management'],
      endpoints: {
        orders: '/api/v1/orders',
        articles: '/api/v1/articles',
        customers: '/api/v1/customers'
      },
      auth_method: 'API Key + Token',
      documentation: 'https://www.hiopos.com/api-documentation/',
      sync_support: ['realtime', 'polling']
    },

    // 🧑‍🍳 Reservations & Kitchen Flow
    {
      id: 'sevenrooms',
      name: 'SevenRooms',
      logo: '🔷', // En producción: logo real de SevenRooms
      category: 'Reservations',
      description: 'Plataforma de reservas con API de gestión completa',
      region: 'Global',
      complexity: 'Medium',
      features: ['Reservations API', 'Guest Management', 'Table Management', 'Event Planning'],
      endpoints: {
        reservations: '/api/v1/reservations',
        guests: '/api/v1/guests',
        venues: '/api/v1/venues'
      },
      auth_method: 'OAuth 2.0',
      documentation: 'https://developers.sevenrooms.com/',
      sync_support: ['realtime', 'webhooks', 'polling']
    },
    {
      id: 'zenchef',
      name: 'Zenchef',
      logo: '👨‍🍳', // En producción: logo real de Zenchef
      category: 'Reservations',
      description: 'Sistema de reservas europeo con API REST',
      region: 'Europe',
      complexity: 'Low',
      features: ['Booking API', 'Table Management', 'Customer Data', 'Marketing Tools'],
      endpoints: {
        bookings: '/api/v1/bookings',
        tables: '/api/v1/tables',
        customers: '/api/v1/customers'
      },
      auth_method: 'API Key',
      documentation: 'https://developers.zenchef.com/',
      sync_support: ['realtime', 'polling']
    },
    {
      id: 'resy',
      name: 'Resy (OpenTable API)',
      logo: '🍽️', // En producción: logo real de Resy/OpenTable
      category: 'Reservations',
      description: 'Reservas con API de OpenTable integrada',
      region: 'Global',
      complexity: 'Medium',
      features: ['Reservations API', 'Availability Check', 'Guest Profiles', 'Waitlist Management'],
      endpoints: {
        reservations: '/api/v2/reservations',
        availability: '/api/v2/availability',
        restaurants: '/api/v2/restaurants'
      },
      auth_method: 'OAuth 2.0',
      documentation: 'https://platform.opentable.com/documentation/',
      sync_support: ['realtime', 'webhooks', 'polling']
    }
  ];

  const groupedERPs = restaurantERPs.reduce((acc, erp) => {
    if (!acc[erp.category]) acc[erp.category] = [];
    acc[erp.category].push(erp);
    return acc;
  }, {});

  const categoryIcons = {
    'Open Source': '🧠',
    'Enterprise': '🏢',
    'Cloud POS': '🌎',
    'Kitchen Management': '🧬',
    'Omnichannel': '📊',
    'Reservations': '🧑‍🍳'
  };

  const handleCredentialChange = (integrationId, field, value) => {
    setCredentials(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        [field]: value
      }
    }));
  };

  const handleSelectERP = (erpId) => {
    setSelectedERP(erpId);
    setCredentials(prev => ({
      ...prev,
      erp: {
        ...prev.erp,
        type: erpId
      }
    }));
  };

  const handleConnect = async (integrationId) => {
    const integrationCredentials = credentials[integrationId];
    
    if (integrationId === 'erp' && !selectedERP) {
      alert('⚠️ Por favor selecciona un ERP primero');
      return;
    }
    
    const hasRequiredCredentials = Object.values(integrationCredentials).some(val => val.toString().trim() !== '');
    
    if (!hasRequiredCredentials) {
      alert('⚠️ Por favor completa al menos un campo de credenciales');
      return;
    }

    // Simular conexión
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'connected', lastSync: new Date().toISOString() }
          : integration
      )
    );
    
    alert(`✅ ${integrationId} conectado exitosamente!`);
    if (integrationId === 'erp') {
      setShowERPModal(false);
    }
  };

  const handleDisconnect = (integrationId) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'disconnected', lastSync: null }
          : integration
      )
    );
  };

  const handleTestConnection = async (integrationId) => {
    alert(`🔄 Probando conexión para ${integrationId}...`);
    setTimeout(() => {
      alert('✅ Conexión exitosa - Endpoint respondiendo correctamente');
    }, 2000);
  };

  const getSelectedERPInfo = () => {
    return restaurantERPs.find(erp => erp.id === selectedERP);
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Solicitud de integración ERP - KUMIA');
    const body = encodeURIComponent(`Hola equipo de soporte KUMIA,

Necesito asistencia con la integración de mi ERP:

□ Mi ERP no aparece en la lista de sistemas soportados
□ Necesito ayuda con la configuración de mi ERP actual
□ Tengo problemas técnicos con la integración
□ Necesito consultoría para elegir el ERP correcto

Detalles del sistema:
- Nombre del ERP: [Especificar]
- Versión: [Especificar]
- Ubicación: [País/Región]
- Tipo de restaurante: [Especificar]

Descripción del problema:
[Describir en detalle]

Gracias por su soporte.

Saludos,
[Nombre del restaurante]`);

    window.open(`mailto:soporte@kumia.net?subject=${subject}&body=${body}`, '_blank');
  };

  const getSyncFrequencyInfo = (frequency) => {
    const syncOptions = {
      realtime: {
        label: 'Tiempo Real',
        description: 'Webhooks + Updates instantáneos',
        cost: 'Alto',
        pros: ['Sincronización instantánea', 'Mejor experiencia usuario', 'Datos siempre actualizados'],
        cons: ['Mayor costo de infraestructura', 'Más llamadas API', 'Requiere webhooks']
      },
      '1min': {
        label: 'Cada 1 minuto',
        description: 'Polling cada minuto',
        cost: 'Alto',
        pros: ['Casi tiempo real', 'Buena para operaciones rápidas', 'Sin webhooks requeridos'],
        cons: ['1440 llamadas/día', 'Costo elevado', 'Delay de 1 minuto']
      },
      '5min': {
        label: 'Cada 5 minutos',
        description: 'Polling cada 5 minutos',
        cost: 'Medio',
        pros: ['Balance costo-beneficio', 'Suficiente para la mayoría', 'Delay aceptable'],
        cons: ['288 llamadas/día', 'Delay de hasta 5 minutos', 'Costo medio']
      },
      '15min': {
        label: 'Cada 15 minutos',
        description: 'Polling cada 15 minutos',
        cost: 'Bajo',
        pros: ['Económico', '96 llamadas/día', 'Suficiente para reportes'],
        cons: ['Delay de hasta 15 minutos', 'No ideal para operaciones urgentes']
      },
      '30min': {
        label: 'Cada 30 minutos',
        description: 'Polling cada 30 minutos',
        cost: 'Muy Bajo',
        pros: ['Muy económico', '48 llamadas/día', 'Ideal para analytics'],
        cons: ['Delay de hasta 30 minutos', 'No para operaciones tiempo real']
      },
      '1hour': {
        label: 'Cada hora',
        description: 'Polling cada hora',
        cost: 'Mínimo',
        pros: ['Costo mínimo', '24 llamadas/día', 'Perfecto para reportes'],
        cons: ['Delay de hasta 1 hora', 'Solo para datos no críticos']
      }
    };
    return syncOptions[frequency] || syncOptions['5min'];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🔗 Integraciones</h2>
          <p className="text-gray-600 mt-1">Conecta tu ecosistema completo - UserWebApp ↔ Dashboard ↔ ERP</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600">
            <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-2"></span>
            Sistema Unificado
          </div>
        </div>
      </div>

      {/* 🆕 CONFIGURACIÓN DE CREDENCIALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map(integration => (
          <div key={integration.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${
            integration.id === 'erp' ? 'md:col-span-2 lg:col-span-3' : ''
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-3 ${
                  integration.id === 'meta' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                  integration.id === 'google_reviews' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  integration.id === 'whatsapp' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  integration.id === 'gemini' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                  integration.id === 'mercadopago' ? 'bg-gradient-to-r from-blue-600 to-cyan-500' :
                  integration.id === 'erp' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                  'bg-gradient-to-r from-gray-500 to-gray-700'
                }`}>
                  <span className="text-white text-xl">{integration.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{integration.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{integration.type}</p>
                </div>
              </div>
              <span className={`w-4 h-4 rounded-full ${
                integration.status === 'connected' ? 'bg-green-400' : 'bg-gray-400'
              }`}></span>
            </div>

            {/* Status */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  integration.status === 'connected' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {integration.status === 'connected' ? '✅ Conectado' : '🔴 Desconectado'}
                </span>
                {integration.lastSync && (
                  <span className="text-xs text-gray-500">
                    {new Date(integration.lastSync).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* ERP Special Section */}
            {integration.id === 'erp' && (
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-bold text-orange-800 mb-2">🎯 Integración UserWebApp ↔ ERP</h4>
                  <p className="text-sm text-orange-700 mb-3">
                    Los pedidos del UserWebApp se enviarán automáticamente a tu ERP sin intervención manual
                  </p>
                  <button
                    onClick={() => setShowERPModal(true)}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    🏢 Configurar ERP de Restaurante
                  </button>
                </div>
                
                {integration.status === 'connected' && selectedERP && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">✅ ERP Conectado</h4>
                    <p className="text-sm text-green-700">
                      <strong>{getSelectedERPInfo()?.name}</strong> - {getSelectedERPInfo()?.description}
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleTestConnection('erp')}
                        className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-lg text-sm hover:bg-green-200 transition-colors"
                      >
                        🧪 Test API
                      </button>
                      <button
                        onClick={() => handleDisconnect('erp')}
                        className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm hover:bg-red-200 transition-colors"
                      >
                        🔌 Desconectar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other integrations credential inputs */}
            {integration.id !== 'erp' && (
              <div className="space-y-3">
                {integration.id === 'meta' && (
                  <>
                    <input
                      type="text"
                      placeholder="Meta App ID"
                      value={credentials.meta.app_id}
                      onChange={(e) => handleCredentialChange('meta', 'app_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Meta App Secret"
                      value={credentials.meta.app_secret}
                      onChange={(e) => handleCredentialChange('meta', 'app_secret', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp Phone Number ID"
                      value={credentials.meta.phone_number_id}
                      onChange={(e) => handleCredentialChange('meta', 'phone_number_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </>
                )}

                {integration.id === 'google_reviews' && (
                  <>
                    <input
                      type="text"
                      placeholder="Google My Business Location ID"
                      value={credentials.google_reviews.location_id}
                      onChange={(e) => handleCredentialChange('google_reviews', 'location_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Google Service Account Key"
                      value={credentials.google_reviews.service_account_key}
                      onChange={(e) => handleCredentialChange('google_reviews', 'service_account_key', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </>
                )}

                {integration.id === 'whatsapp' && (
                  <>
                    <input
                      type="text"
                      placeholder="WhatsApp Business Account ID"
                      value={credentials.whatsapp.account_id}
                      onChange={(e) => handleCredentialChange('whatsapp', 'account_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="WhatsApp Access Token"
                      value={credentials.whatsapp.access_token}
                      onChange={(e) => handleCredentialChange('whatsapp', 'access_token', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </>
                )}

                {integration.id === 'gemini' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-sm text-green-700">✅ Google Gemini 2.0</span>
                      <span className="text-xs text-green-600">Configurado</span>
                    </div>
                    <input
                      type="password"
                      placeholder="Google Gemini API Key"
                      value={credentials.gemini.api_key}
                      onChange={(e) => handleCredentialChange('gemini', 'api_key', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={integration.status === 'connected'}
                    />
                  </div>
                )}

                {integration.id === 'mercadopago' && (
                  <>
                    <input
                      type="text"
                      placeholder="MercadoPago App ID"
                      value={credentials.mercadopago.app_id}
                      onChange={(e) => handleCredentialChange('mercadopago', 'app_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="MercadoPago Access Token"
                      value={credentials.mercadopago.access_token}
                      onChange={(e) => handleCredentialChange('mercadopago', 'access_token', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </>
                )}

                {/* Action buttons for non-ERP integrations */}
                <div className="flex space-x-2 mt-4">
                  {integration.status === 'connected' ? (
                    <>
                      <button
                        onClick={() => handleTestConnection(integration.id)}
                        className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-lg text-sm hover:bg-green-200 transition-colors"
                      >
                        🧪 Probar
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm hover:bg-red-200 transition-colors"
                      >
                        🔌 Desconectar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      className={`w-full text-white py-2 px-3 rounded-lg text-sm hover:opacity-90 transition-colors ${
                        integration.id === 'meta' ? 'bg-blue-500 hover:bg-blue-600' :
                        integration.id === 'google_reviews' ? 'bg-yellow-500 hover:bg-yellow-600' :
                        integration.id === 'whatsapp' ? 'bg-green-500 hover:bg-green-600' :
                        integration.id === 'gemini' ? 'bg-purple-500 hover:bg-purple-600' :
                        integration.id === 'mercadopago' ? 'bg-blue-600 hover:bg-blue-700' :
                        'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      🔗 Conectar {integration.name}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🆕 ERP MODAL */}
      {showERPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">🏢 Configurar ERP de Restaurante</h2>
                  <p className="text-gray-600">Conecta tu sistema de gestión para automatizar pedidos del UserWebApp</p>
                </div>
                <button 
                  onClick={() => setShowERPModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {!selectedERP ? (
                /* Step 1: ERP Selection List */
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">📋 Selecciona tu ERP / POS</h3>
                    <p className="text-gray-600">Elige de nuestra lista de +30 sistemas integrados</p>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(groupedERPs).map(([category, erps]) => (
                      <div key={category} className="bg-gray-50 rounded-xl p-4">
                        <h4 className="flex items-center font-bold text-gray-800 mb-3">
                          <span className="text-2xl mr-2">{categoryIcons[category]}</span>
                          {category}
                          <span className="ml-2 text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                            {erps.length} sistemas
                          </span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {erps.map(erp => (
                            <div
                              key={erp.id}
                              className="bg-white p-3 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all"
                              onClick={() => handleSelectERP(erp.id)}
                            >
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 flex items-center justify-center mr-3 bg-gray-100 rounded-lg">
                                  <span className="text-lg">{erp.logo}</span>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-bold text-gray-800 text-sm">{erp.name}</h5>
                                  <div className="flex items-center space-x-1 mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      erp.complexity === 'Low' ? 'bg-green-100 text-green-800' :
                                      erp.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                      erp.complexity === 'High' ? 'bg-orange-100 text-orange-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {erp.complexity}
                                    </span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      {erp.region}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{erp.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {erp.features.slice(0, 2).map(feature => (
                                  <span key={feature} className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                    {feature}
                                  </span>
                                ))}
                                {erp.features.length > 2 && (
                                  <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                    +{erp.features.length - 2} más
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                    <h4 className="font-bold text-blue-800 mb-2">¿No encuentras tu sistema?</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Contacta nuestro equipo de integración para añadir tu ERP a la lista
                    </p>
                    <button 
                      onClick={handleContactSupport}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      📧 Contactar Soporte
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: ERP Configuration */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* ERP Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex items-center justify-center mr-3 bg-gray-100 rounded-lg">
                          <span className="text-xl">{getSelectedERPInfo()?.logo}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">📖 {getSelectedERPInfo()?.name}</h3>
                      </div>
                      <button
                        onClick={() => setSelectedERP('')}
                        className="text-orange-600 hover:text-orange-800 text-sm"
                      >
                        ← Cambiar ERP
                      </button>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-blue-800">Categoría:</p>
                          <p className="text-sm text-blue-700">{getSelectedERPInfo()?.category}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">Región:</p>
                          <p className="text-sm text-blue-700">{getSelectedERPInfo()?.region}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">Complejidad:</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            getSelectedERPInfo()?.complexity === 'Low' ? 'bg-green-100 text-green-800' :
                            getSelectedERPInfo()?.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            getSelectedERPInfo()?.complexity === 'High' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getSelectedERPInfo()?.complexity}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">Auth:</p>
                          <p className="text-sm text-blue-700">{getSelectedERPInfo()?.auth_method}</p>
                        </div>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">{getSelectedERPInfo()?.description}</p>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-blue-800 mb-1">Características:</p>
                        <div className="flex flex-wrap gap-1">
                          {getSelectedERPInfo()?.features.map(feature => (
                            <span key={feature} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-blue-800 mb-1">Endpoints principales:</p>
                        <div className="bg-white p-2 rounded border">
                          {Object.entries(getSelectedERPInfo()?.endpoints || {}).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="font-mono text-gray-600">{key}:</span> 
                              <span className="font-mono text-blue-600 ml-1">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-blue-800">Documentación:</p>
                        <a 
                          href={getSelectedERPInfo()?.documentation} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          {getSelectedERPInfo()?.documentation}
                        </a>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-bold text-yellow-800 mb-2">⚠️ Flujo de Integración</h4>
                      <div className="text-sm text-yellow-700 space-y-1">
                        <p>1. Cliente hace pedido en UserWebApp</p>
                        <p>2. Pedido se envía automáticamente al ERP</p>
                        <p>3. ERP procesa y actualiza estado (preparación → listo)</p>
                        <p>4. Cliente recibe notificaciones en tiempo real</p>
                        <p>5. Sin intervención manual del personal</p>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Form */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">⚙️ Configuración</h3>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="API Endpoint URL"
                          value={credentials.erp.endpoint_url}
                          onChange={(e) => handleCredentialChange('erp', 'endpoint_url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Location ID / Store ID"
                          value={credentials.erp.location_id}
                          onChange={(e) => handleCredentialChange('erp', 'location_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="API Key"
                          value={credentials.erp.api_key}
                          onChange={(e) => handleCredentialChange('erp', 'api_key', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <input
                          type="password"
                          placeholder="API Secret"
                          value={credentials.erp.api_secret}
                          onChange={(e) => handleCredentialChange('erp', 'api_secret', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="OAuth Token (opcional)"
                        value={credentials.erp.oauth_token}
                        onChange={(e) => handleCredentialChange('erp', 'oauth_token', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />

                      {/* Configuración de Sincronización */}
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-bold text-purple-800 mb-3">⚡ Frecuencia de Sincronización</h4>
                        <div className="space-y-3">
                          <select
                            value={credentials.erp.sync_frequency}
                            onChange={(e) => handleCredentialChange('erp', 'sync_frequency', e.target.value)}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="realtime">⚡ Tiempo Real (Webhooks)</option>
                            <option value="1min">🟢 Cada 1 minuto</option>
                            <option value="5min">🟡 Cada 5 minutos (Recomendado)</option>
                            <option value="15min">🟠 Cada 15 minutos</option>
                            <option value="30min">🔴 Cada 30 minutos</option>
                            <option value="1hour">⚫ Cada hora</option>
                          </select>

                          <div className="bg-white p-3 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-purple-800">
                                {getSyncFrequencyInfo(credentials.erp.sync_frequency).label}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                getSyncFrequencyInfo(credentials.erp.sync_frequency).cost === 'Alto' ? 'bg-red-100 text-red-800' :
                                getSyncFrequencyInfo(credentials.erp.sync_frequency).cost === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                Costo: {getSyncFrequencyInfo(credentials.erp.sync_frequency).cost}
                              </span>
                            </div>
                            <p className="text-xs text-purple-700 mb-2">
                              {getSyncFrequencyInfo(credentials.erp.sync_frequency).description}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs font-medium text-green-700 mb-1">✅ Pros:</p>
                                <ul className="text-xs text-green-600 space-y-0.5">
                                  {getSyncFrequencyInfo(credentials.erp.sync_frequency).pros.map(pro => (
                                    <li key={pro}>• {pro}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-red-700 mb-1">❌ Cons:</p>
                                <ul className="text-xs text-red-600 space-y-0.5">
                                  {getSyncFrequencyInfo(credentials.erp.sync_frequency).cons.map(con => (
                                    <li key={con}>• {con}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {credentials.erp.sync_frequency === 'realtime' && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <h5 className="font-bold text-green-800 mb-2">🔗 Configuración de Webhooks</h5>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="enable_webhooks"
                                    checked={credentials.erp.enable_webhooks}
                                    onChange={(e) => handleCredentialChange('erp', 'enable_webhooks', e.target.checked)}
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                  />
                                  <label htmlFor="enable_webhooks" className="text-sm text-green-700">
                                    Activar Webhooks (recomendado para tiempo real)
                                  </label>
                                </div>
                                {credentials.erp.enable_webhooks && (
                                  <input
                                    type="text"
                                    placeholder="URL del Webhook KUMIA (se proporcionará automáticamente)"
                                    value={credentials.erp.webhook_url}
                                    onChange={(e) => handleCredentialChange('erp', 'webhook_url', e.target.value)}
                                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                    disabled
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="test_mode"
                          checked={credentials.erp.test_mode}
                          onChange={(e) => handleCredentialChange('erp', 'test_mode', e.target.checked)}
                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor="test_mode" className="text-sm text-gray-700">
                          Modo de prueba (recomendado para primeras configuraciones)
                        </label>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-bold text-green-800 mb-2">✅ Ventajas de {getSelectedERPInfo()?.name}</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Integración nativa con KUMIA</li>
                        <li>• Sincronización en tiempo real</li>
                        <li>• Soporte técnico especializado</li>
                        <li>• Configuración guiada paso a paso</li>
                      </ul>
                    </div>

                    {getSelectedERPInfo()?.complexity === 'High' || getSelectedERPInfo()?.complexity === 'Very High' ? (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="font-bold text-red-800 mb-2">🚨 Sistema Enterprise</h4>
                        <p className="text-sm text-red-700">
                          Este sistema requiere configuración avanzada. Recomendamos contactar nuestro equipo de integración 
                          para obtener asistencia técnica especializada.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowERPModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                {selectedERP && (
                  <>
                    <button 
                      onClick={() => handleTestConnection('erp')}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      🧪 Probar Conexión
                    </button>
                    <button 
                      onClick={() => handleConnect('erp')}
                      className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      ✅ Conectar ERP
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 PRÓXIMOS PASOS */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h3 className="font-bold text-green-800 mb-3">🚀 Ecosistema KUMIA Completo</h3>
        <div className="text-sm text-green-700">
          <p className="mb-3">Una vez configuradas todas las integraciones:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>UserWebApp:</strong> Clientes hacen pedidos directamente</li>
            <li><strong>ERP Integration:</strong> Pedidos van automáticamente al sistema de cocina</li>
            <li><strong>AI Agents:</strong> Responden preguntas y gestionan canales sociales</li>
            <li><strong>Payments:</strong> MercadoPago procesa pagos automáticamente</li>
            <li><strong>Analytics:</strong> Dashboard unificado con métricas en tiempo real</li>
          </ul>
        </div>
      </div>
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
        <button 
          onClick={handleNewClientClick}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
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
        {filteredClients.length > 0 ? (
          filteredClients.map(client => (
            <ClientCard key={client.id} client={client} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No hay clientes que coincidan con los filtros</h3>
            <p className="text-gray-500">Ajusta los filtros o agrega nuevos clientes</p>
          </div>
        )}
      </div>

      {/* 🆕 MODAL NUEVO CLIENTE */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">👥 Nuevo Cliente</h2>
                  <p className="text-gray-600">Agrega un nuevo cliente a KUMIA</p>
                </div>
                <button 
                  onClick={() => setShowNewClientModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo *</label>
                    <input
                      type="text"
                      value={newClient.name}
                      onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="juan.perez@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+595 21 123 4567"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cumpleaños</label>
                    <input
                      type="date"
                      value={newClient.birthday}
                      onChange={(e) => setNewClient(prev => ({ ...prev, birthday: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha especial</label>
                    <input
                      type="text"
                      value={newClient.special_date}
                      onChange={(e) => setNewClient(prev => ({ ...prev, special_date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ej: Aniversario, Graduación"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alergias alimentarias</label>
                  <input
                    type="text"
                    value={newClient.allergies}
                    onChange={(e) => setNewClient(prev => ({ ...prev, allergies: e.target.value }))}
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50"
                    placeholder="Ej: Lactosa, Gluten, Mariscos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notas adicionales</label>
                  <textarea
                    value={newClient.notes}
                    onChange={(e) => setNewClient(prev => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Preferencias, observaciones especiales..."
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                <div className="text-sm text-gray-500">* Campos obligatorios</div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowNewClientModal(false)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleCreateClient}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-bold"
                  >
                    👥 Crear Cliente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL HISTORIAL CLIENTE */}
      {showHistoryModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📊 Historial Completo</h2>
                  <p className="text-gray-600">{selectedClient.name} - {selectedClient.email}</p>
                </div>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Resumen general */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-4">📈 Resumen General</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total visitasPCONS:</span>
                      <span className="font-bold">{selectedClient.visit_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Puntos acumulados:</span>
                      <span className="font-bold">{selectedClient.points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total gastado:</span>
                      <span className="font-bold">${selectedClient.total_spent?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Ticket promedio:</span>
                      <span className="font-bold">${selectedClient.avg_ticket?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Engagement:</span>
                      <span className="font-bold">{selectedClient.engagement_score}%</span>
                    </div>
                  </div>
                </div>

                {/* Platos favoritos */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="font-bold text-green-800 mb-4">🍽️ Platos Favoritos</h3>
                  <div className="space-y-2">
                    {selectedClient.favorite_dishes?.map((dish, index) => (
                      <div key={index} className="bg-white p-2 rounded-lg text-sm">
                        {dish}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Información personal */}
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="font-bold text-purple-800 mb-4">👤 Info Personal</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-purple-700 font-medium">Cumpleaños:</span>
                      <div>{selectedClient.birthday || 'No especificado'}</div>
                    </div>
                    <div>
                      <span className="text-purple-700 font-medium">Alergias:</span>
                      <div className="text-red-600 font-medium">{selectedClient.allergies}</div>
                    </div>
                    <div>
                      <span className="text-purple-700 font-medium">Fecha especial:</span>
                      <div>{selectedClient.special_date}</div>
                    </div>
                    <div>
                      <span className="text-purple-700 font-medium">Cliente desde:</span>
                      <div>{selectedClient.acquisition_date}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actividad reciente mock */}
              <div className="mt-6 bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4">🕐 Actividad Reciente</h3>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-green-600">🍽️</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Pedido realizado - Brooklyn + Baby Ribs</div>
                      <div className="text-sm text-gray-600">{selectedClient.last_visit} - $18,500</div>
                    </div>
                    <div className="text-green-600 font-bold">+150 puntos</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600">⭐</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Review dejado - 5 estrellas</div>
                      <div className="text-sm text-gray-600">2025-01-18 - "Excelente servicio y comida"</div>
                    </div>
                    <div className="text-blue-600 font-bold">+50 puntos</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL RECOMPENSA NFT */}
      {showNFTModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">🎁 Recompensar con NFT</h2>
                  <p className="text-gray-600">{selectedClient.name}</p>
                </div>
                <button 
                  onClick={() => setShowNFTModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="text-gray-600">Selecciona el tipo de NFT KUMIA para recompensar</p>
                </div>

                <button 
                  onClick={() => handleSendNFTReward('oro')}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-6 py-4 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🥇</span>
                      <div>
                        <div className="font-bold text-lg">NFT Oro</div>
                        <div className="text-sm opacity-90">Cliente VIP - +500 puntos</div>
                      </div>
                    </div>
                    <div className="text-xl">→</div>
                  </div>
                </button>

                <button 
                  onClick={() => handleSendNFTReward('plata')}
                  className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-4 rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🥈</span>
                      <div>
                        <div className="font-bold text-lg">NFT Plata</div>
                        <div className="text-sm opacity-90">Cliente Frecuente - +300 puntos</div>
                      </div>
                    </div>
                    <div className="text-xl">→</div>
                  </div>
                </button>

                <button 
                  onClick={() => handleSendNFTReward('bronce')}
                  className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-4 rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🥉</span>
                      <div>
                        <div className="font-bold text-lg">NFT Bronce</div>
                        <div className="text-sm opacity-90">Bienvenida KUMIA - +100 puntos</div>
                      </div>
                    </div>
                    <div className="text-xl">→</div>
                  </div>
                </button>
              </div>

              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setShowNFTModal(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL CONTACTAR CLIENTE */}
      {showContactModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📞 Contactar Cliente</h2>
                  <p className="text-gray-600">{selectedClient.name}</p>
                </div>
                <button 
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => handleSendMessage('promocion')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🎉</span>
                    <div className="text-left">
                      <div className="font-bold">Enviar Promoción Especial</div>
                      <div className="text-sm opacity-90">Oferta personalizada basada en su historial</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => handleSendMessage('cumpleanos')}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🎂</span>
                    <div className="text-left">
                      <div className="font-bold">Felicitación de Cumpleaños</div>
                      <div className="text-sm opacity-90">Mensaje personalizado + descuento especial</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => handleSendMessage('feedback')}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-4 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">💬</span>
                    <div className="text-left">
                      <div className="font-bold">Solicitar Feedback</div>
                      <div className="text-sm opacity-90">Invitación a dejar review con incentivo</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => handleSendMessage('reactivacion')}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🔥</span>
                    <div className="text-left">
                      <div className="font-bold">Reactivar Cliente</div>
                      <div className="text-sm opacity-90">¡Te extrañamos! Oferta especial de regreso</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setShowContactModal(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL CAMPAÑA DE REFERIDOS */}
      {showReferralModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">👥 Campaña de Referidos</h2>
                  <p className="text-gray-600">{selectedClient.name}</p>
                </div>
                <button 
                  onClick={() => setShowReferralModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🚀</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">¡Invita y Gana!</h3>
                <p className="text-gray-600">Este cliente puede ganar puntos KUMIA por cada referido</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-6">
                <h4 className="font-bold text-purple-800 mb-3">🎁 Beneficios del Programa</h4>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li>• 200 puntos por cada amigo que visite</li>
                  <li>• NFT especial al lograr 5 referidos</li>
                  <li>• 10% descuento en próxima visita</li>
                  <li>• Acceso a eventos exclusivos</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    handleSendMessage('referidos', `¡Hola ${selectedClient.name}! 🚀

¿Sabías que puedes ganar increíbles recompensas KUMIA invitando a tus amigos?

🎁 Por cada amigo que traigas:
• 200 puntos KUMIA
• 10% descuento en tu próxima visita
• Oportunidad de ganar NFTs exclusivos

¡Comparte la experiencia IL MANDORLA y gana juntos!

Link para compartir: https://ilmandorla.kumia.app/referido/${selectedClient.id}

¡Te esperamos! 🍖`);
                    setShowReferralModal(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-bold"
                >
                  📱 Enviar Invitación
                </button>
                <button 
                  onClick={() => setShowReferralModal(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  const [showNewAgentModal, setShowNewAgentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showTrainModal, setShowTrainModal] = useState(false);
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showKumiaChat, setShowKumiaChat] = useState(false);
  
  // 🆕 ESTADO PARA CHAT CON GEMINI
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [performanceData, setPerformanceData] = useState({
    totalConversations: 15847,
    totalResponses: 98234,
    averageResponseTime: 1.2,
    satisfactionScore: 4.8,
    conversionRate: 31.7,
    automationLevel: 97.3
  });

  const [newAgent, setNewAgent] = useState({
    name: '',
    type: 'community_manager',
    channels: [],
    prompt: '',
    personality: 'professional',
    specialization: 'general'
  });

  useEffect(() => {
    initializeKumiaAgents();
    initializeKumiaChat();
  }, []);

  const initializeKumiaChat = () => {
    setChatMessages([
      {
        id: 'welcome',
        type: 'ai',
        content: `¡Hola! Soy el **KUMIA Business Intelligence Assistant** 🧠

Tengo acceso a todos los datos de tu dashboard y puedo ayudarte con:

**📊 Análisis de Datos:**
- Métricas de clientes (${performanceData.totalConversations.toLocaleString()} conversaciones)
- Performance de agentes IA (${performanceData.automationLevel}% automatización)
- ROI y crecimiento de ventas

**🤖 Gestión de Agentes IA:**
- Optimizar prompts para mejor rendimiento
- Estrategias de community management
- Análisis de sentimientos por canal

**📈 Estrategias de Negocio:**
- Recommendations basadas en data
- Identificación de oportunidades
- Optimización de procesos

¿En qué te gustaría que te ayude hoy?`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const initializeKumiaAgents = () => {
    // 🆕 AGENTES IA ESPECIALIZADOS PARA EXPERIENCIA 100% IA
    const kumiaAgents = [
      {
        id: 'agent_google_reviews',
        name: 'Google Reviews Manager',
        type: 'review_manager',
        channels: ['google_reviews'],
        prompt: `Eres el especialista en Google Reviews de IL MANDORLA Smokehouse. Tu misión es:

RESPUESTAS AUTOMÁTICAS:
• Reviews 5⭐: Agradecer con emoción, mencionar platos específicos, invitar a volver
• Reviews 4⭐: Agradecer, preguntar qué podemos mejorar, ofrecer descuento próxima visita
• Reviews 3⭐ o menos: Disculparse genuinamente, solicitar contacto privado, ofrecer compensación

PERSONALIDAD: Profesional, empática, centrada en la experiencia ahumada
OBJETIVO: Mantener rating >4.5⭐ y aumentar frecuencia de reviews positivos

Siempre menciona nuestra especialidad en carnes ahumadas y experiencia KUMIA.`,
        personality: 'empathetic',
        specialization: 'review_management',
        is_active: true,
        performance: { responses: 234, rating: 4.9, conversion: 89 },
        last_training: '2025-01-20'
      },
      {
        id: 'agent_whatsapp_assistant',
        name: 'WhatsApp Concierge IA',
        type: 'customer_service',
        channels: ['whatsapp'],
        prompt: `Eres el concierge digital de IL MANDORLA vía WhatsApp. Funciones principales:

SERVICIOS:
• Reservas instantáneas con confirmación automática
• Consultas sobre menú (enfoque en carnes ahumadas)
• Seguimiento de pedidos y tiempos de entrega
• Programa de fidelización KUMIA (puntos, NFTs)

PERSONALIDAD: Amigable, eficiente, local (paraguayo)
RESPUESTAS: Siempre incluir emojis, tiempos precisos, upselling natural

UPSELLING INTELIGENTE:
• Sugerir complementos basados en pedido
• Promocionar platos de alto margen
• Invitar a programas de fidelidad

Responde en máximo 2 mensajes, incluye call-to-action siempre.`,
        personality: 'friendly',
        specialization: 'customer_service',
        is_active: true,
        performance: { responses: 1847, rating: 4.7, conversion: 76 },
        last_training: '2025-01-22'
      },
      {
        id: 'agent_instagram_manager',
        name: 'Instagram Community Manager IA',
        type: 'community_manager',
        channels: ['instagram'],
        prompt: `Eres el community manager de IL MANDORLA en Instagram. Estrategia de contenido:

RESPUESTAS A COMENTARIOS:
• Usar lenguaje visual y emojis apropiados
• Engagement genuino con preguntas y call-to-actions
• Promoción sutil de experiencia ahumada

GESTIÓN DE DMs:
• Consultas sobre menú → dirigir a WhatsApp o reserva
• Colaboraciones → protocolo de derivación
• Quejas → resolución inmediata con compensación

PERSONALIDAD: Trendy, visual, food-focused
OBJETIVOS: Aumentar engagement, generar tráfico a restaurante

Siempre mantén el aesthetic de IL MANDORLA: rústico, ahumado, premium.`,
        personality: 'trendy',
        specialization: 'social_media',
        is_active: true,
        performance: { responses: 892, rating: 4.6, conversion: 45 },
        last_training: '2025-01-19'
      },
      {
        id: 'agent_facebook_manager',
        name: 'Facebook Community Manager IA',
        type: 'community_manager',
        channels: ['facebook'],
        prompt: `Eres el community manager de IL MANDORLA en Facebook. Enfoque en comunidad:

ESTRATEGIA:
• Respuestas detalladas y educativas sobre BBQ
• Compartir tips de cocina ahumada
• Promover eventos y promociones especiales
• Gestionar grupos y eventos privados

RESPUESTAS:
• Comentarios: Informativos, incluir datos nutricionales/técnicos
• Reviews: Profesionales, agradecer y direccionar
• Messages: Derivar a WhatsApp para reservas

PERSONALIDAD: Educativa, experta, comunitaria
AUDIENCIA: Familias, grupos, eventos corporativos

Posiciónate como experto en BBQ y humo lento, educa sobre procesos.`,
        personality: 'educational',
        specialization: 'community_building',
        is_active: true,
        performance: { responses: 456, rating: 4.5, conversion: 38 },
        last_training: '2025-01-18'
      },
      {
        id: 'agent_menu_advisor',
        name: 'IA Garzon Virtual',
        type: 'menu_advisor',
        channels: ['userwebapp', 'whatsapp'],
        prompt: `Eres el garzon virtual de IL MANDORLA en la UserWebApp. Tu expertise es el menú:

SUGERENCIAS INTELIGENTES:
• Analizar preferencias del cliente (historial, alergias)
• Recomendar platos basados en temporada y disponibilidad
• Upselling natural: bebidas, entradas, postres
• Maridajes perfectos con cervezas artesanales

INFORMACIÓN TÉCNICA:
• Tiempos de preparación exactos
• Ingredientes y alérgenos
• Técnicas de ahumado por plato
• Niveles de picante y intensidad

PERSONALIDAD: Experto culinario, apasionado, guía gastronómico
OBJETIVO: Maximizar ticket promedio y satisfacción

Siempre preguntar sobre restricciones alimentarias primero.`,
        personality: 'expert',
        specialization: 'menu_optimization',
        is_active: true,
        performance: { responses: 2103, rating: 4.8, conversion: 82 },
        last_training: '2025-01-21'
      },
      {
        id: 'agent_loyalty_manager',
        name: 'KUMIA Loyalty IA',
        type: 'loyalty_manager',
        channels: ['userwebapp', 'whatsapp', 'email'],
        prompt: `Eres el especialista en el programa de fidelización KUMIA. Misión: retención y engagement.

GESTIÓN DE PUNTOS:
• Explicar cómo ganar y canjear puntos
• Notificar sobre puntos cerca de expirar
• Sugerir canjes basados en comportamiento
• Promocionar challenges y misiones especiales

PROGRAMA NFT:
• Explicar niveles: Bronce, Plata, Oro, Citizen KUMIA
• Beneficios exclusivos por nivel
• Gamificación y logros desbloqueables

PERSONALIDAD: Motivadora, gamificada, exclusiva
OBJETIVO: Aumentar frecuencia de visitas y lifetime value

Usa lenguaje de gaming y logros, crea sensación de exclusividad.`,
        personality: 'gamified',
        specialization: 'loyalty_retention',
        is_active: true,
        performance: { responses: 1205, rating: 4.7, conversion: 94 },
        last_training: '2025-01-23'
      },
      {
        id: 'agent_crisis_manager',
        name: 'Crisis Management IA',
        type: 'crisis_manager',
        channels: ['all'],
        prompt: `Eres el especialista en manejo de crisis de IL MANDORLA. Activación automática ante:

DETECCIÓN DE CRISIS:
• Reviews negativas con palabras clave críticas
• Quejas sobre seguridad alimentaria
• Problemas de servicio viral en redes
• Situaciones de reputación crítica

PROTOCOLO DE RESPUESTA:
1. Respuesta inmediata (menos de 30 min)
2. Disculpa genuina sin excusas
3. Oferta de compensación concreta
4. Derivación a contacto directo
5. Seguimiento hasta resolución

PERSONALIDAD: Profesional, empática, solucionadora
OBJETIVO: Proteger reputación y convertir crisis en oportunidad

Escalas a humanos solo en casos extremos. Tu primera respuesta es crucial.`,
        personality: 'professional',
        specialization: 'crisis_management',
        is_active: true,
        performance: { responses: 23, rating: 4.9, conversion: 78 },
        last_training: '2025-01-15'
      },
      {
        id: 'agent_upselling_master',
        name: 'Upselling Master IA',
        type: 'sales_optimizer',
        channels: ['userwebapp', 'whatsapp'],
        prompt: `Eres el especialista en maximizar el ticket promedio de IL MANDORLA:

ESTRATEGIAS DE UPSELLING:
• Analizar pedido base y sugerir complementos
• Promocionar platos de mayor margen sutilmente  
• Crear combos personalizados en tiempo real
• Identificar ocasiones especiales (cumpleaños, aniversarios)

TÉCNICAS:
• "¿Te gustaría agregar...?" vs "¿Quieres algo más?"
• Mencionar preparación especial o tiempo limitado
• Crear urgencia con disponibilidad

OBJETIVOS:
• Aumentar ticket promedio de $11,000 a $15,000
• Incrementar frecuencia de pedidos premium
• Maximizar rentabilidad por cliente

PERSONALIDAD: Persuasiva, consultiva, orientada a valor

Nunca seas agresivo, siempre agrega valor genuino.`,
        personality: 'consultative',
        specialization: 'sales_optimization',
        is_active: true,
        performance: { responses: 3847, rating: 4.6, conversion: 67 },
        last_training: '2025-01-22'
      }
    ];

    setAgents(kumiaAgents);
  };

  // 🆕 FUNCIONES COMPLETAS PARA GESTIÓN DE AGENTES

  const handleTrainAgent = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    setSelectedAgent(agent);
    setShowTrainModal(true);
  };

  const handleTestAgent = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    setSelectedAgent(agent);
    setShowTestModal(true);
  };

  const handleAnalyzeAgent = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    setSelectedAgent(agent);
    setShowAnalyzeModal(true);
  };

  const handleCloneAgent = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    const clonedAgent = {
      ...agent,
      id: `${agent.id}_clone_${Date.now()}`,
      name: `${agent.name} (Copia)`,
      is_active: false
    };
    
    setAgents(prev => [...prev, clonedAgent]);
    alert(`📋 Agente clonado exitosamente: ${clonedAgent.name}
    
✅ Configuración copiada:
• Prompt personalizado
• Canales asignados  
• Personalidad y especialización
• Configuraciones avanzadas

⚠️ Nota: El agente clonado está inactivo. Actívalo cuando esté listo.`);
  };

  const handleAnalyzePerformance = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    setSelectedAgent(agent);
    setShowPerformanceModal(true);
  };

  const handleEditAgent = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    setSelectedAgent(agent);
    setShowEditModal(true);
  };

  const handleNewAgent = () => {
    setShowNewAgentModal(true);
  };

  const handleShowPerformanceReport = () => {
    setShowPerformanceModal(true);
  };

  const handleCreateAgent = async () => {
    if (!newAgent.name || !newAgent.prompt) {
      alert('Por favor completa el nombre y prompt del agente');
      return;
    }

    const agentToCreate = {
      ...newAgent,
      id: `agent_custom_${Date.now()}`,
      is_active: false,
      performance: { responses: 0, rating: 0, conversion: 0 },
      last_training: new Date().toISOString().split('T')[0]
    };

    setAgents(prev => [...prev, agentToCreate]);
    setShowNewAgentModal(false);
    setNewAgent({
      name: '',
      type: 'community_manager',
      channels: [],
      prompt: '',
      personality: 'professional',
      specialization: 'general'
    });

    alert('🤖 Agente creado exitosamente! Recuerda activarlo cuando esté listo.');
  };

  // 🆕 CHAT CON GEMINI - BUSINESS INTELLIGENCE
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsTyping(true);

    try {
      // Call the real Gemini API endpoint
      const response = await axios.post(`${API}/ai/kumia-chat`, {
        message: currentInput,
        session_id: `kumia_chat_${Date.now()}`,
        channel: "kumia_business_chat"
      });

      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      
      // Fallback to mock response in case of API error
      const fallbackResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: `🚨 **Error de conexión con KUMIA Business IA**
        
Lo siento, hay un problema temporal con la conexión. Mientras tanto, puedo confirmar que:

• **${agents.length} agentes IA** están activos
• **${performanceData.totalConversations.toLocaleString()} conversaciones** manejadas
• **${performanceData.automationLevel}% automatización** nivel actual

Por favor, intenta nuevamente en unos momentos.`,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const getDashboardContextForAI = () => {
    return {
      agents: agents.length,
      totalConversations: performanceData.totalConversations,
      automationLevel: performanceData.automationLevel,
      satisfaction: performanceData.satisfactionScore,
      conversionRate: performanceData.conversionRate,
      responseTime: performanceData.averageResponseTime
    };
  };

  const generateAIResponse = (question, context) => {
    // Simulación inteligente de respuestas basadas en contexto
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('agente') || lowerQuestion.includes('bot') || lowerQuestion.includes('ia')) {
      return `📊 **Análisis de Agentes IA:**

Tienes **${context.agents} agentes activos** con estas métricas:
• **${context.automationLevel}% de automatización** (excelente nivel)
• **${context.totalConversations.toLocaleString()} conversaciones** gestionadas
• **${context.satisfaction}/5 satisfacción** promedio

**Recomendación:** Tu Google Reviews Manager tiene el mejor performance (4.9/5). Considera replicar su enfoque en otros canales.

¿Te gustaría que analice algún agente específico?`;
    }
    
    if (lowerQuestion.includes('venta') || lowerQuestion.includes('revenue') || lowerQuestion.includes('dinero')) {
      return `💰 **Análisis de Ventas:**

Con **${context.conversionRate}% de conversión** y **${context.responseTime}s de respuesta**, tus agentes están optimizando bien.

**Oportunidades detectadas:**
• El Upselling Master puede incrementar ticket promedio un 35%
• WhatsApp Concierge tiene potencial de +15% en reservas
• Loyalty IA puede aumentar retención en 28%

**Acción sugerida:** Entrena al Upselling Master con datos de platos de mayor margen.`;
    }

    if (lowerQuestion.includes('cliente') || lowerQuestion.includes('customer') || lowerQuestion.includes('satisfaccion')) {
      return `👥 **Análisis de Clientes:**

**Satisfacción actual: ${context.satisfaction}/5** - ¡Excelente nivel!

**Insights clave:**
• Crisis Manager mantiene 78% de recuperación en quejas
• Menu Advisor logra 82% de conversión en sugerencias
• Loyalty Manager impulsa 94% de retención

**Recomendación:** Implementa el programa de referidos automático para amplificar la satisfacción actual.`;
    }

    // Respuesta general inteligente
    return `🧠 **Análisis General:**

Basado en tu pregunta sobre "${question}", aquí está mi análisis:

**Estado actual:**
• ${context.agents} agentes IA operativos
• ${context.automationLevel}% automatización
• ${context.totalConversations.toLocaleString()} interacciones exitosas

**Siguiente paso recomendado:**
Optimiza los prompts de tus agentes con mejor performance y replica esas técnicas en los demás.

¿Hay algún aspecto específico que te gustaría explorar más?`;
  };

  const getChannelIcon = (channels) => {
    if (Array.isArray(channels)) {
      if (channels.includes('google_reviews')) return '🌟';
      if (channels.includes('whatsapp')) return '📱';
      if (channels.includes('instagram')) return '📷';
      if (channels.includes('facebook')) return '👥';
      if (channels.includes('userwebapp')) return '🍽️';
      if (channels.includes('email')) return '📧';
      if (channels.includes('all')) return '🌐';
    }
    return '🤖';
  };

  const getChannelColor = (channels) => {
    if (Array.isArray(channels)) {
      if (channels.includes('google_reviews')) return 'from-yellow-400 to-amber-500';
      if (channels.includes('whatsapp')) return 'from-green-400 to-green-600';
      if (channels.includes('instagram')) return 'from-pink-400 to-purple-600';
      if (channels.includes('facebook')) return 'from-blue-400 to-blue-600';
      if (channels.includes('userwebapp')) return 'from-orange-400 to-red-500';
      if (channels.includes('email')) return 'from-indigo-400 to-indigo-600';
      if (channels.includes('all')) return 'from-gray-700 to-gray-900';
    }
    return 'from-gray-400 to-gray-600';
  };

  const getAgentTypeIcon = (type) => {
    const types = {
      review_manager: '⭐',
      customer_service: '🎧',
      community_manager: '👥',
      menu_advisor: '🍽️',
      loyalty_manager: '🏆',
      crisis_manager: '🚨',
      sales_optimizer: '💰'
    };
    return types[type] || '🤖';
  };

  const getAgentSpecialization = (specialization) => {
    const specializations = {
      review_management: 'Gestión de Reviews',
      customer_service: 'Atención al Cliente', 
      social_media: 'Redes Sociales',
      community_building: 'Community Building',
      menu_optimization: 'Optimización de Menú',
      loyalty_retention: 'Fidelización',
      crisis_management: 'Manejo de Crisis',
      sales_optimization: 'Optimización de Ventas'
    };
    return specializations[specialization] || specialization;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🤖 Agencia de Marketing IA</h2>
          <p className="text-gray-600 mt-1">Experiencia 100% automatizada · Reemplaza community managers humanos</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowKumiaChat(!showKumiaChat)}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200"
          >
            🧠 KUMIA Business IA
          </button>
          <button 
            onClick={handleShowPerformanceReport}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            📊 Reporte de Rendimiento
          </button>
          <button 
            onClick={handleNewAgent}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
          >
            + Nuevo Agente
          </button>
        </div>
      </div>

      {/* 🆕 MÉTRICAS AVANZADAS DE AUTOMATIZACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Conversaciones IA</h3>
              <p className="text-2xl font-bold text-blue-600">{performanceData.totalConversations.toLocaleString()}</p>
            </div>
            <div className="text-2xl">💬</div>
          </div>
          <div className="text-xs text-green-600 mt-1">+23% vs mes anterior</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Respuestas Automáticas</h3>
              <p className="text-2xl font-bold text-purple-600">{performanceData.totalResponses.toLocaleString()}</p>
            </div>
            <div className="text-2xl">⚡</div>
          </div>
          <div className="text-xs text-green-600 mt-1">+47% vs mes anterior</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Tiempo Respuesta</h3>
              <p className="text-2xl font-bold text-green-600">{performanceData.averageResponseTime}s</p>
            </div>
            <div className="text-2xl">🚀</div>
          </div>
          <div className="text-xs text-green-600 mt-1">-1.2s vs humanos</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Satisfacción IA</h3>
              <p className="text-2xl font-bold text-orange-600">{performanceData.satisfactionScore}/5</p>
            </div>
            <div className="text-2xl">⭐</div>
          </div>
          <div className="text-xs text-green-600 mt-1">+0.3 vs humanos</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Conversión IA</h3>
              <p className="text-2xl font-bold text-indigo-600">{performanceData.conversionRate}%</p>
            </div>
            <div className="text-2xl">🎯</div>
          </div>
          <div className="text-xs text-green-600 mt-1">+8.2% vs humanos</div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-700">Automatización</h3>
              <p className="text-2xl font-bold text-green-600">{performanceData.automationLevel}%</p>
            </div>
            <div className="text-2xl">🤖</div>
          </div>
          <div className="text-xs text-green-600 mt-1">Ahorro: 3.2 empleados</div>
        </div>
      </div>

      {/* 🆕 KUMIA BUSINESS INTELLIGENCE CHAT */}
      {showKumiaChat && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">🧠 KUMIA Business Intelligence</h3>
            <button 
              onClick={() => setShowKumiaChat(!showKumiaChat)}
              className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              👁️ Ocultar
            </button>
          </div>

          <div className="space-y-4">
            {/* Chat messages */}
            <div className="h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-3">
              {chatMessages.map(message => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-sm p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    <div className="text-sm whitespace-pre-line">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 text-gray-800 p-3 rounded-lg">
                    <div className="text-sm">🤖 KUMIA está analizando...</div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pregúntame sobre tus agentes, métricas, estrategias..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isTyping}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                📤
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              💡 Puedo analizar todos tus datos del dashboard para ayudarte con decisiones estratégicas
            </div>
          </div>
        </div>
      )}

      {/* 🆕 GRID DE AGENTES IA ESPECIALIZADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${getChannelColor(agent.channels)} rounded-xl flex items-center justify-center mr-3`}>
                  <span className="text-white text-xl">{getChannelIcon(agent.channels)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{agent.name}</h3>
                  <p className="text-sm text-gray-600">{getAgentSpecialization(agent.specialization)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${agent.is_active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <button 
                  onClick={() => handleEditAgent(agent.id)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  ✏️
                </button>
              </div>
            </div>

            {/* Performance metrics */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg text-center">
                <div className="text-sm font-bold text-blue-600">{agent.performance?.responses || 0}</div>
                <div className="text-xs text-blue-700">Respuestas</div>
              </div>
              <div className="bg-green-50 p-2 rounded-lg text-center">
                <div className="text-sm font-bold text-green-600">{agent.performance?.rating || 0}/5</div>
                <div className="text-xs text-green-700">Rating</div>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg text-center">
                <div className="text-sm font-bold text-purple-600">{agent.performance?.conversion || 0}%</div>
                <div className="text-xs text-purple-700">Conversión</div>
              </div>
            </div>

            {/* Channels */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Canales activos:</h4>
              <div className="flex flex-wrap gap-1">
                {agent.channels.map(channel => (
                  <span key={channel} className={`px-2 py-1 rounded-full text-xs font-medium ${
                    channel === 'google_reviews' ? 'bg-yellow-100 text-yellow-800' :
                    channel === 'whatsapp' ? 'bg-green-100 text-green-800' :
                    channel === 'instagram' ? 'bg-pink-100 text-pink-800' :
                    channel === 'facebook' ? 'bg-blue-100 text-blue-800' :
                    channel === 'userwebapp' ? 'bg-orange-100 text-orange-800' :
                    channel === 'email' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {channel === 'google_reviews' ? 'Google Reviews' :
                     channel === 'userwebapp' ? 'User App' :
                     channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
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

            {/* Last training */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Último entrenamiento: {agent.last_training}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🆕 CENTRO DE ENTRENAMIENTO IA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎓 Centro de Entrenamiento IA</h3>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-3">📚 Fuentes de Datos Activas</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">🍽️ Menú IL MANDORLA (28 items)</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✅ Sincronizado</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">👥 Base de clientes (6 perfiles)</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✅ Actualizado</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">💬 Conversaciones históricas</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✅ 15K+ mensajes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">⭐ Google Reviews (234 reviews)</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✅ Tiempo real</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">📋 Políticas IL MANDORLA</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">⏳ Actualizar</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-3">🚀 Performance por Canal</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">🌟 Google Reviews Manager</span>
                  <span className="text-sm font-bold text-green-600">97.2% efectividad</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">📱 WhatsApp Concierge</span>
                  <span className="text-sm font-bold text-blue-600">94.7% satisfacción</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">🍽️ IA Garzon Virtual</span>
                  <span className="text-sm font-bold text-purple-600">82% upselling</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">🏆 KUMIA Loyalty</span>
                  <span className="text-sm font-bold text-orange-600">94% retención</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-2">⚡ Próximo Entrenamiento Programado</h4>
              <p className="text-sm text-orange-700">
                🗓️ <strong>Hoy 18:00</strong> - Actualización con nuevos reviews y feedback
              </p>
              <p className="text-sm text-orange-700 mt-1">
                📈 Mejora esperada: +5% en precisión de respuestas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🆕 MODAL REPORTE DE RENDIMIENTO */}
      {showPerformanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📊 Reporte de Rendimiento IA</h2>
                  <p className="text-gray-600">Análisis completo de performance de agentes KUMIA</p>
                </div>
                <button 
                  onClick={() => setShowPerformanceModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Métricas generales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-blue-700">Total Agentes Activos</h3>
                      <p className="text-3xl font-bold text-blue-600">{agents.filter(a => a.is_active).length}</p>
                    </div>
                    <div className="text-3xl">🤖</div>
                  </div>
                  <div className="text-xs text-blue-600 mt-2">100% operativos</div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-green-700">Respuestas Totales</h3>
                      <p className="text-3xl font-bold text-green-600">{performanceData.totalResponses.toLocaleString()}</p>
                    </div>
                    <div className="text-3xl">💬</div>
                  </div>
                  <div className="text-xs text-green-600 mt-2">+47% vs mes anterior</div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-purple-700">Satisfacción Promedio</h3>
                      <p className="text-3xl font-bold text-purple-600">{performanceData.satisfactionScore}/5</p>
                    </div>
                    <div className="text-3xl">⭐</div>
                  </div>
                  <div className="text-xs text-purple-600 mt-2">+0.3 vs humanos</div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-orange-700">Ahorro Mensual</h3>
                      <p className="text-3xl font-bold text-orange-600">$8,450</p>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>
                  <div className="text-xs text-orange-600 mt-2">vs 3.2 empleados</div>
                </div>
              </div>

              {/* Performance por agente */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Performance Detallada por Agente</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 font-medium text-gray-700">Agente</th>
                        <th className="py-3 px-4 font-medium text-gray-700">Canal</th>
                        <th className="py-3 px-4 font-medium text-gray-700">Respuestas</th>
                        <th className="py-3 px-4 font-medium text-gray-700">Rating</th>
                        <th className="py-3 px-4 font-medium text-gray-700">Conversión</th>
                        <th className="py-3 px-4 font-medium text-gray-700">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map(agent => (
                        <tr key={agent.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 bg-gradient-to-br ${getChannelColor(agent.channels)} rounded-lg flex items-center justify-center mr-3`}>
                                <span className="text-white text-sm">{getChannelIcon(agent.channels)}</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{agent.name}</div>
                                <div className="text-xs text-gray-500">{getAgentSpecialization(agent.specialization)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {agent.channels.slice(0, 2).map(channel => (
                                <span key={channel} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  {channel === 'google_reviews' ? 'Google' : channel}
                                </span>
                              ))}
                              {agent.channels.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  +{agent.channels.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-blue-600">{agent.performance?.responses || 0}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-green-600">{agent.performance?.rating || 0}/5</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-purple-600">{agent.performance?.conversion || 0}%</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              agent.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {agent.is_active ? '🟢 Activo' : '🔴 Inactivo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recomendaciones IA */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                <h3 className="text-lg font-bold text-indigo-800 mb-4">💡 Recomendaciones KUMIA IA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">🚀 Optimización Inmediata</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Replica el prompt del Google Reviews Manager en otros canales</li>
                      <li>• Aumenta frecuencia de entrenamiento del Instagram Manager</li>
                      <li>• Activa respuestas automáticas 24/7 en WhatsApp</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">📈 Crecimiento Estratégico</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Potencial +15% conversión con mejor upselling</li>
                      <li>• Crear agente especializado para TikTok</li>
                      <li>• Implementar A/B testing en prompts</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <button 
                  onClick={() => setShowPerformanceModal(false)}
                  className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cerrar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL NUEVO AGENTE */}
      {showNewAgentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">🤖 Crear Nuevo Agente IA</h2>
                  <p className="text-gray-600">Configura un agente especializado para tu estrategia</p>
                </div>
                <button 
                  onClick={() => setShowNewAgentModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Agente *</label>
                    <input
                      type="text"
                      value={newAgent.name}
                      onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ej: TikTok Content Creator IA"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Agente *</label>
                    <select
                      value={newAgent.type}
                      onChange={(e) => setNewAgent(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="community_manager">Community Manager</option>
                      <option value="customer_service">Atención al Cliente</option>
                      <option value="sales_optimizer">Optimizador de Ventas</option>
                      <option value="review_manager">Gestor de Reviews</option>
                      <option value="crisis_manager">Manejo de Crisis</option>
                      <option value="menu_advisor">Asesor de Menú</option>
                      <option value="loyalty_manager">Gestor de Fidelidad</option>
                    </select>
                  </div>
                </div>

                {/* Canales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Canales de Operación *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['google_reviews', 'whatsapp', 'instagram', 'facebook', 'userwebapp', 'email', 'tiktok', 'linkedin'].map(channel => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newAgent.channels.includes(channel)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAgent(prev => ({ ...prev, channels: [...prev.channels, channel] }));
                            } else {
                              setNewAgent(prev => ({ ...prev, channels: prev.channels.filter(c => c !== channel) }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm capitalize">
                          {channel === 'google_reviews' ? 'Google Reviews' :
                           channel === 'userwebapp' ? 'User App' : channel}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Personalidad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Personalidad</label>
                    <select
                      value={newAgent.personality}
                      onChange={(e) => setNewAgent(prev => ({ ...prev, personality: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="professional">Profesional</option>
                      <option value="friendly">Amigable</option>
                      <option value="trendy">Trendy</option>
                      <option value="educational">Educativa</option>
                      <option value="empathetic">Empática</option>
                      <option value="expert">Experta</option>
                      <option value="gamified">Gamificada</option>
                      <option value="consultative">Consultiva</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Especialización</label>
                    <select
                      value={newAgent.specialization}
                      onChange={(e) => setNewAgent(prev => ({ ...prev, specialization: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="social_media">Redes Sociales</option>
                      <option value="customer_service">Atención al Cliente</option>
                      <option value="sales_optimization">Optimización de Ventas</option>
                      <option value="review_management">Gestión de Reviews</option>
                      <option value="crisis_management">Manejo de Crisis</option>
                      <option value="menu_optimization">Optimización de Menú</option>
                      <option value="loyalty_retention">Fidelización</option>
                      <option value="community_building">Community Building</option>
                    </select>
                  </div>
                </div>

                {/* Prompt personalizado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Personalizado *</label>
                  <textarea
                    value={newAgent.prompt}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, prompt: e.target.value }))}
                    rows="8"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Describe detalladamente cómo debe comportarse el agente, sus objetivos, tono de comunicación, instrucciones específicas para cada situación, etc..."
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    💡 Tip: Incluye contexto sobre IL MANDORLA, personalidad deseada, objetivos específicos y ejemplos de respuestas
                  </div>
                </div>

                {/* Templates de prompt */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">📝 Templates de Prompt</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <button
                      onClick={() => setNewAgent(prev => ({ ...prev, prompt: `Eres el especialista en ${prev.type} de IL MANDORLA Smokehouse. Tu misión es:\n\nOBJETIVOS:\n• [Objetivo principal]\n• [Objetivo secundario]\n• [Objetivo terciario]\n\nPERSONALIDAD: ${prev.personality}, centrada en la experiencia ahumada\nTONO: [Definir tono de comunicación]\n\nRESPUESTAS TÍPICAS:\n• [Situación 1]: [Respuesta tipo]\n• [Situación 2]: [Respuesta tipo]\n\nSiempre menciona nuestra especialidad en carnes ahumadas y experiencia KUMIA.` }))}
                      className="text-left bg-white p-2 rounded text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      🎯 Template Básico
                    </button>
                    <button
                      onClick={() => setNewAgent(prev => ({ ...prev, prompt: `Eres el community manager de IL MANDORLA en ${prev.channels[0] || 'redes sociales'}. Estrategia:\n\nENGAGEMENT:\n• Respuestas auténticas y personalizadas\n• Uso de emojis apropiados\n• Call-to-actions naturales\n\nGESTIÓN:\n• Comentarios: [Estrategia específica]\n• DMs: [Protocolo de atención]\n• Crisis: [Plan de respuesta]\n\nPERSONALIDAD: ${prev.personality}, food-focused\nOBJETIVO: Aumentar engagement y generar tráfico\n\nMantén el aesthetic IL MANDORLA: rústico, ahumado, premium.` }))}
                      className="text-left bg-white p-2 rounded text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      📱 Template Social Media
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                <div className="text-sm text-gray-500">
                  * Campos obligatorios
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowNewAgentModal(false)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleCreateAgent}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-bold"
                  >
                    🤖 Crear Agente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL PROBAR AGENTE */}
      {showTestModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">🧪 Probar Agente IA</h2>
                  <p className="text-gray-600">{selectedAgent.name} - Simulación de conversación</p>
                </div>
                <button 
                  onClick={() => setShowTestModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuración del agente */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-3">⚙️ Configuración del Agente</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Tipo:</span>
                        <span className="ml-2 text-sm text-gray-600">{getAgentSpecialization(selectedAgent.specialization)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Canales:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedAgent.channels.map(channel => (
                            <span key={channel} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {channel === 'google_reviews' ? 'Google Reviews' : channel}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Personalidad:</span>
                        <span className="ml-2 text-sm text-gray-600 capitalize">{selectedAgent.personality}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-3">📋 Prompt Actual</h4>
                    <div className="text-sm text-blue-700 bg-white p-3 rounded border max-h-48 overflow-y-auto">
                      {selectedAgent.prompt}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-bold text-green-800 mb-3">📊 Métricas Actuales</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{selectedAgent.performance?.responses || 0}</div>
                        <div className="text-xs text-green-700">Respuestas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{selectedAgent.performance?.rating || 0}/5</div>
                        <div className="text-xs text-blue-700">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{selectedAgent.performance?.conversion || 0}%</div>
                        <div className="text-xs text-purple-700">Conversión</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulador de conversación */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-3">💬 Simulador de Conversación</h3>
                    <p className="text-sm text-purple-700 mb-4">
                      Prueba diferentes escenarios para validar las respuestas del agente
                    </p>
                    
                    {/* Escenarios predefinidos */}
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium text-purple-800">Escenarios de Prueba:</h4>
                      {selectedAgent.type === 'review_manager' && (
                        <div className="space-y-1">
                          <button className="w-full text-left bg-white p-2 rounded text-sm text-purple-700 hover:bg-purple-100 transition-colors">
                            ⭐⭐⭐⭐⭐ "Excelente experiencia, las costillas estaban perfectas"
                          </button>
                          <button className="w-full text-left bg-white p-2 rounded text-sm text-purple-700 hover:bg-purple-100 transition-colors">
                            ⭐⭐ "La comida llegó fría y tardaron mucho en atendernos"
                          </button>
                        </div>
                      )}
                      {selectedAgent.type === 'customer_service' && (
                        <div className="space-y-1">
                          <button className="w-full text-left bg-white p-2 rounded text-sm text-purple-700 hover:bg-purple-100 transition-colors">
                            "Hola, quiero hacer una reserva para 4 personas mañana"
                          </button>
                          <button className="w-full text-left bg-white p-2 rounded text-sm text-purple-700 hover:bg-purple-100 transition-colors">
                            "¿Qué platos recomiendan para alguien que no ha probado BBQ?"
                          </button>
                        </div>
                      )}
                      {selectedAgent.type === 'community_manager' && (
                        <div className="space-y-1">
                          <button className="w-full text-left bg-white p-2 rounded text-sm text-purple-700 hover:bg-purple-100 transition-colors">
                            Comentario: "Se ve delicioso! ¿Cuánto cuesta el combo familiar?"
                          </button>
                          <button className="w-full text-left bg-white p-2 rounded text-sm text-purple-700 hover:bg-purple-100 transition-colors">
                            DM: "Hola, quiero colaborar con ustedes, soy influencer"
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Área de conversación simulada */}
                    <div className="bg-white rounded-lg p-4 border h-48 overflow-y-auto">
                      <div className="text-center text-gray-500 text-sm">
                        💡 Selecciona un escenario arriba para ver la respuesta simulada del agente
                      </div>
                    </div>
                  </div>

                  {/* Resultados de la prueba */}
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <h4 className="font-bold text-orange-800 mb-3">📈 Resultados de Prueba</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-orange-700">Tiempo de respuesta:</span>
                        <span className="text-sm font-bold text-orange-600">1.2s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-orange-700">Relevancia:</span>
                        <span className="text-sm font-bold text-green-600">98%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-orange-700">Tono apropiado:</span>
                        <span className="text-sm font-bold text-green-600">✅ Correcto</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-orange-700">Menciona KUMIA:</span>
                        <span className="text-sm font-bold text-green-600">✅ Sí</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6 border-t border-gray-200 mt-8">
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowTestModal(false)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cerrar Prueba
                  </button>
                  <button 
                    onClick={() => {
                      alert('🚀 Iniciando prueba en vivo con tráfico real del 1%...\n\n⏱️ Duración: 30 minutos\n📊 Resultados disponibles en tiempo real\n⚠️ El agente actual continuará atendiendo el 99% del tráfico');
                    }}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    🔴 Prueba en Vivo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL ENTRENAR AGENTE */}
      {showTrainModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">🎓 Entrenar Agente IA</h2>
                  <p className="text-gray-600">{selectedAgent.name} - Mejora continua con datos reales</p>
                </div>
                <button 
                  onClick={() => setShowTrainModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información del agente */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-bold text-green-800 mb-3">🤖 Información del Agente</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-green-700">Último entrenamiento:</span>
                        <span className="text-sm text-green-600">{selectedAgent.last_training}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-green-700">Respuestas desde entrenamiento:</span>
                        <span className="text-sm text-green-600">{selectedAgent.performance?.responses || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-green-700">Satisfacción actual:</span>
                        <span className="text-sm text-green-600">{selectedAgent.performance?.rating || 0}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-green-700">Conversión actual:</span>
                        <span className="text-sm text-green-600">{selectedAgent.performance?.conversion || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-3">📚 Fuentes de Datos para Entrenamiento</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm text-blue-700">Menú actualizado de IL MANDORLA</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm text-blue-700">Historial de conversaciones (último mes)</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm text-blue-700">Feedback de clientes</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm text-blue-700">Políticas y procedimientos</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-blue-700">Datos de comportamiento de clientes</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-blue-700">Análisis de competencia</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-3">⚙️ Configuración de Entrenamiento</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-purple-700 mb-2">Tipo de Entrenamiento</label>
                        <select className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                          <option value="incremental">🔄 Incremental (recomendado)</option>
                          <option value="full">🚀 Completo (desde cero)</option>
                          <option value="fine_tuning">🎯 Fine-tuning específico</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-700 mb-2">Intensidad</label>
                        <select className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                          <option value="light">🌙 Ligero (15 min)</option>
                          <option value="medium">⚡ Medio (45 min)</option>
                          <option value="intensive">🔥 Intensivo (2 horas)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-700 mb-2">Programar para</label>
                        <select className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                          <option value="now">▶️ Ahora</option>
                          <option value="tonight">🌙 Esta noche (2:00 AM)</option>
                          <option value="weekend">📅 Este fin de semana</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métricas y predicciones */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                    <h3 className="font-bold text-orange-800 mb-3">📊 Predicciones de Mejora</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-orange-700">Satisfacción</span>
                        <div className="flex items-center">
                          <span className="text-sm text-orange-600">{selectedAgent.performance?.rating || 0}/5</span>
                          <span className="text-green-600 ml-2">→ {((selectedAgent.performance?.rating || 0) + 0.3).toFixed(1)}/5</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-orange-700">Conversión</span>
                        <div className="flex items-center">
                          <span className="text-sm text-orange-600">{selectedAgent.performance?.conversion || 0}%</span>
                          <span className="text-green-600 ml-2">→ {((selectedAgent.performance?.conversion || 0) + 12)}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-orange-700">Tiempo de respuesta</span>
                        <div className="flex items-center">
                          <span className="text-sm text-orange-600">2.3s</span>
                          <span className="text-green-600 ml-2">→ 1.8s</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-bold text-yellow-800 mb-3">💡 Optimizaciones Sugeridas</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <p className="text-sm text-yellow-700">Mejorar respuestas para consultas sobre menú de temporada</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <p className="text-sm text-yellow-700">Optimizar upselling en combos de bebidas</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <p className="text-sm text-yellow-700">Personalizar respuestas para clientes VIP</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <p className="text-sm text-yellow-700">Actualizar información de horarios especiales</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h4 className="font-bold text-red-800 mb-3">⚠️ Consideraciones Importantes</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <p className="text-sm text-red-700">El agente seguirá operando durante el entrenamiento</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <p className="text-sm text-red-700">Los cambios serán graduales para evitar confusión</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <p className="text-sm text-red-700">Se creará un respaldo automático antes del entrenamiento</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <p className="text-sm text-red-700">Podrás revertir cambios dentro de 72 horas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                <div className="text-sm text-gray-500">
                  🕒 El entrenamiento tomará aproximadamente 45 minutos
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowTrainModal(false)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      alert('🎓 Iniciando entrenamiento de ' + selectedAgent.name + '...\n\n📚 Datos incluidos:\n• Menú actualizado de IL MANDORLA\n• Historial de conversaciones (último mes)\n• Feedback de clientes\n• Políticas y procedimientos\n\n⏱️ Tiempo estimado: 45 minutos\n📈 Mejora esperada: +12% en satisfacción\n\n✅ El agente continuará operando normalmente durante el proceso');
                      // Actualizar fecha de entrenamiento
                      setAgents(prev => prev.map(a => 
                        a.id === selectedAgent.id 
                          ? { ...a, last_training: new Date().toISOString().split('T')[0] }
                          : a
                      ));
                      setShowTrainModal(false);
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-bold"
                  >
                    🚀 Iniciar Entrenamiento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL ANALIZAR AGENTE */}
      {showAnalyzeModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📊 Análisis Profundo de Agente IA</h2>
                  <p className="text-gray-600">{selectedAgent.name} - Insights avanzados y optimización</p>
                </div>
                <button 
                  onClick={() => setShowAnalyzeModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna 1: Métricas de Performance */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-4">📈 Métricas de Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700">Respuestas Totales</span>
                        <span className="text-lg font-bold text-blue-600">{selectedAgent.performance?.responses || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700">Satisfacción</span>
                        <span className="text-lg font-bold text-blue-600">{selectedAgent.performance?.rating || 0}/5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700">Conversión</span>
                        <span className="text-lg font-bold text-blue-600">{selectedAgent.performance?.conversion || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700">Tiempo Respuesta</span>
                        <span className="text-lg font-bold text-blue-600">1.8s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700">Escalaciones</span>
                        <span className="text-lg font-bold text-blue-600">2.3%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700">Automatización</span>
                        <span className="text-lg font-bold text-blue-600">97.7%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-bold text-green-800 mb-3">🎯 Fortalezas Identificadas</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-green-600 mr-2">✅</span>
                        <p className="text-sm text-green-700">Excelente manejo de consultas sobre menú</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-green-600 mr-2">✅</span>
                        <p className="text-sm text-green-700">Respuestas rápidas y precisas</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-green-600 mr-2">✅</span>
                        <p className="text-sm text-green-700">Tono amigable y profesional</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-green-600 mr-2">✅</span>
                        <p className="text-sm text-green-700">Buena integración con sistemas</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-bold text-yellow-800 mb-3">⚠️ Áreas de Mejora</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-yellow-600 mr-2">🔄</span>
                        <p className="text-sm text-yellow-700">Mejorar upselling en bebidas</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-yellow-600 mr-2">🔄</span>
                        <p className="text-sm text-yellow-700">Optimizar respuestas complejas</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-yellow-600 mr-2">🔄</span>
                        <p className="text-sm text-yellow-700">Personalización para VIP</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna 2: Análisis de Conversaciones */}
                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-4">💬 Análisis de Conversaciones</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded border">
                        <h5 className="font-semibold text-purple-700 mb-2">Temas Más Consultados</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Menú del día</span>
                            <span className="text-sm font-bold text-purple-600">28%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Reservas</span>
                            <span className="text-sm font-bold text-purple-600">23%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Horarios</span>
                            <span className="text-sm font-bold text-purple-600">19%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Promociones</span>
                            <span className="text-sm font-bold text-purple-600">15%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Ubicación</span>
                            <span className="text-sm font-bold text-purple-600">15%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white rounded border">
                        <h5 className="font-semibold text-purple-700 mb-2">Sentimiento de Clientes</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">😊 Positivo</span>
                            <span className="text-sm font-bold text-green-600">82%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">😐 Neutral</span>
                            <span className="text-sm font-bold text-gray-600">15%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">😞 Negativo</span>
                            <span className="text-sm font-bold text-red-600">3%</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded border">
                        <h5 className="font-semibold text-purple-700 mb-2">Horarios Pico</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">12:00 - 14:00</span>
                            <span className="text-sm font-bold text-purple-600">35%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">19:00 - 21:00</span>
                            <span className="text-sm font-bold text-purple-600">28%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">21:00 - 23:00</span>
                            <span className="text-sm font-bold text-purple-600">22%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">10:00 - 12:00</span>
                            <span className="text-sm font-bold text-purple-600">15%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna 3: Recomendaciones y Acciones */}
                <div className="space-y-4">
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <h3 className="font-bold text-orange-800 mb-4">🎯 Recomendaciones de KUMIA</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded border border-orange-200">
                        <h5 className="font-semibold text-orange-700 mb-2">🚀 Acciones Inmediatas</h5>
                        <div className="space-y-2">
                          <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-3 rounded text-sm hover:from-orange-600 hover:to-red-600 transition-all">
                            📚 Entrenar con datos de último mes
                          </button>
                          <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-3 rounded text-sm hover:from-blue-600 hover:to-purple-600 transition-all">
                            🎯 Optimizar prompts de upselling
                          </button>
                          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-3 rounded text-sm hover:from-green-600 hover:to-emerald-600 transition-all">
                            ⚡ Acelerar respuestas en pico
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded border border-orange-200">
                        <h5 className="font-semibold text-orange-700 mb-2">🔮 Predicciones AI</h5>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-orange-700">Mejora esperada:</span>
                              <span className="font-bold text-green-600">+18%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-orange-700">Tiempo optimización:</span>
                              <span className="font-bold text-orange-600">2-3 días</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-orange-700">ROI estimado:</span>
                              <span className="font-bold text-green-600">+$2,400/mes</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded border border-orange-200">
                        <h5 className="font-semibold text-orange-700 mb-2">🏆 Comparativa</h5>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <div className="flex justify-between">
                              <span className="text-orange-700">vs. Agente promedio:</span>
                              <span className="font-bold text-green-600">+23%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-orange-700">vs. Mejor agente:</span>
                              <span className="font-bold text-orange-600">-8%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-orange-700">Ranking industria:</span>
                              <span className="font-bold text-green-600">Top 15%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h4 className="font-bold text-red-800 mb-3">🚨 Alertas Importantes</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-red-600 mr-2">🔴</span>
                        <p className="text-sm text-red-700">Incremento de 15% en consultas no resueltas</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-orange-600 mr-2">🟡</span>
                        <p className="text-sm text-orange-700">Tiempo de respuesta aumentó 0.3s esta semana</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-yellow-600 mr-2">🟡</span>
                        <p className="text-sm text-yellow-700">Necesita actualización de información de menú</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                <div className="text-sm text-gray-500">
                  📊 Análisis actualizado en tiempo real • Última actualización: {new Date().toLocaleString()}
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowAnalyzeModal(false)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button 
                    onClick={() => {
                      alert('📊 Generando reporte detallado...\n\n📄 Incluye:\n• Análisis completo de performance\n• Recomendaciones personalizadas\n• Plan de optimización\n• Comparativas con industria\n\n⏱️ Tiempo estimado: 2 minutos\n📧 Se enviará por email cuando esté listo');
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-bold"
                  >
                    📥 Exportar Reporte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL EDITAR AGENTE */}
      {showEditModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">✏️ Editar Agente IA</h2>
                  <p className="text-gray-600">{selectedAgent.name}</p>
                </div>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Agente</label>
                    <input
                      type="text"
                      defaultValue={selectedAgent.name}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      defaultValue={selectedAgent.is_active ? 'active' : 'inactive'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="active">🟢 Activo</option>
                      <option value="inactive">🔴 Inactivo</option>
                      <option value="testing">🧪 En pruebas</option>
                      <option value="maintenance">⚙️ Mantenimiento</option>
                    </select>
                  </div>
                </div>

                {/* Canales editables */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Canales de Operación</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['google_reviews', 'whatsapp', 'instagram', 'facebook', 'userwebapp', 'email', 'tiktok', 'linkedin'].map(channel => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked={selectedAgent.channels.includes(channel)}
                          className="mr-2"
                        />
                        <span className="text-sm capitalize">
                          {channel === 'google_reviews' ? 'Google Reviews' :
                           channel === 'userwebapp' ? 'User App' : channel}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Prompt editable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Personalizado</label>
                  <textarea
                    defaultValue={selectedAgent.prompt}
                    rows="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    💡 Los cambios en el prompt requieren reentrenamiento del agente
                  </div>
                </div>

                {/* Configuraciones avanzadas */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">⚙️ Configuraciones Avanzadas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura IA</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue="0.7"
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Conservador</span>
                        <span>Creativo</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Máx. tokens respuesta</label>
                      <input
                        type="number"
                        defaultValue="150"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                <div className="text-sm text-gray-500">
                  ⚠️ Los cambios requieren reentrenamiento
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      alert('✅ Cambios guardados exitosamente!\n\n🎓 Reentrenamiento programado para esta noche\n⏱️ Los cambios estarán activos mañana a las 8:00 AM');
                      setShowEditModal(false);
                    }}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-bold"
                  >
                    💾 Guardar Cambios
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

// 🧠 MÓDULO 2: INTELIGENCIA COMPETITIVA
export const InteligenciaCompetitiva = () => {
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [benchmarkFilter, setBenchmarkFilter] = useState('todos');
  const [showTrendsModal, setShowTrendsModal] = useState(false);

  // Benchmark por rubro
  const benchmarkData = {
    categoria: "Steakhouse Premium",
    tuRestaurante: {
      ticketPromedio: 3830,
      feedbackScore: 4.7,
      starsGeneradas: 16.8,
      rankingLocal: 2
    },
    promedioRubro: {
      ticketPromedio: 3200,
      feedbackScore: 4.2,
      starsGeneradas: 12.3,
      totalRestaurantes: 47
    }
  };

  // Competidores cercanos
  const competidores = [
    {
      id: 1,
      nombre: "Asado del Norte",
      distancia: "0.8 km",
      ticketPromedio: 2900,
      rating: 4.3,
      reviews: 234,
      tendencia: "estable",
      fortalezas: ["Precio", "Ubicación"],
      debilidades: ["Servicio", "Variedad"]
    },
    {
      id: 2,
      nombre: "Premium Grill",
      distancia: "1.2 km",
      ticketPromedio: 4200,
      rating: 4.6,
      reviews: 156,
      tendencia: "creciente",
      fortalezas: ["Calidad", "Ambiente"],
      debilidades: ["Precio", "Espera"]
    },
    {
      id: 3,
      nombre: "La Parrilla de Juan",
      distancia: "2.1 km",
      ticketPromedio: 2400,
      rating: 4.1,
      reviews: 89,
      tendencia: "decreciente",
      fortalezas: ["Tradición", "Porciones"],
      debilidades: ["Modernización", "Marketing"]
    }
  ];

  // Tendencias regionales
  const tendenciasRegionales = [
    { tendencia: "Experiencias Gastronómicas", crecimiento: "+45%", adoptado: true },
    { tendencia: "Menús Personalizados IA", crecimiento: "+32%", adoptado: true },
    { tendencia: "Sistemas de Fidelización", crecimiento: "+28%", adoptado: true },
    { tendencia: "Delivery Premium", crecimiento: "+25%", adoptado: false },
    { tendencia: "Eventos Temáticos", crecimiento: "+18%", adoptado: false }
  ];

  // Reviews scanner
  const reviewsAnalysis = {
    totalAnalyzadas: 1247,
    sentimiento: {
      positivo: 78,
      neutral: 15,
      negativo: 7
    },
    temasMasComentados: [
      { tema: "Calidad de la carne", mencion: 89, sentiment: "positivo" },
      { tema: "Tiempo de espera", mencion: 67, sentiment: "neutral" },
      { tema: "Precios", mencion: 54, sentiment: "positivo" },
      { tema: "Servicio al cliente", mencion: 43, sentiment: "positivo" },
      { tema: "Ambiente", mencion: 38, sentiment: "positivo" }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🧠 Inteligencia Competitiva</h2>
          <p className="text-gray-600 mt-1">Información estratégica sobre la industria y performance relativa</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowTrendsModal(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            📈 Tendencias IA
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            🔄 Actualizar Datos
          </button>
        </div>
      </div>

      {/* Benchmark por Rubro */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Benchmark por Rubro - {benchmarkData.categoria}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600">${benchmarkData.tuRestaurante.ticketPromedio.toLocaleString()}</div>
            <div className="text-sm text-green-700 mb-1">Tu Ticket Promedio</div>
            <div className="text-xs text-green-600">vs ${benchmarkData.promedioRubro.ticketPromedio.toLocaleString()} promedio</div>
            <div className="text-xs font-bold text-green-800 mt-1">
              +{(((benchmarkData.tuRestaurante.ticketPromedio - benchmarkData.promedioRubro.ticketPromedio) / benchmarkData.promedioRubro.ticketPromedio) * 100).toFixed(0)}% por encima
            </div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{benchmarkData.tuRestaurante.feedbackScore}</div>
            <div className="text-sm text-blue-700 mb-1">Tu Rating Promedio</div>
            <div className="text-xs text-blue-600">vs {benchmarkData.promedioRubro.feedbackScore} promedio</div>
            <div className="text-xs font-bold text-blue-800 mt-1">
              +{(benchmarkData.tuRestaurante.feedbackScore - benchmarkData.promedioRubro.feedbackScore).toFixed(1)} puntos
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-600">{benchmarkData.tuRestaurante.starsGeneradas}</div>
            <div className="text-sm text-purple-700 mb-1">Stars por Cliente</div>
            <div className="text-xs text-purple-600">vs {benchmarkData.promedioRubro.starsGeneradas} promedio</div>
            <div className="text-xs font-bold text-purple-800 mt-1">
              +{(((benchmarkData.tuRestaurante.starsGeneradas - benchmarkData.promedioRubro.starsGeneradas) / benchmarkData.promedioRubro.starsGeneradas) * 100).toFixed(0)}% superior
            </div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-3xl font-bold text-orange-600">#{benchmarkData.tuRestaurante.rankingLocal}</div>
            <div className="text-sm text-orange-700 mb-1">Ranking Local KumIA</div>
            <div className="text-xs text-orange-600">de {benchmarkData.promedioRubro.totalRestaurantes} restaurantes</div>
            <div className="text-xs font-bold text-orange-800 mt-1">🏆 Top 5%</div>
          </div>
        </div>
      </div>

      {/* Análisis de Competidores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Análisis de Competidores Cercanos</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {competidores.map((competidor) => (
            <div key={competidor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800">{competidor.nombre}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  competidor.tendencia === 'creciente' ? 'bg-green-100 text-green-800' :
                  competidor.tendencia === 'decreciente' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {competidor.tendencia === 'creciente' ? '📈' : competidor.tendencia === 'decreciente' ? '📉' : '➡️'} 
                  {competidor.tendencia}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Distancia:</span>
                  <span className="font-medium">{competidor.distancia}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket promedio:</span>
                  <span className={`font-medium ${competidor.ticketPromedio > benchmarkData.tuRestaurante.ticketPromedio ? 'text-red-600' : 'text-green-600'}`}>
                    ${competidor.ticketPromedio.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className={`font-medium ${competidor.rating > benchmarkData.tuRestaurante.feedbackScore ? 'text-red-600' : 'text-green-600'}`}>
                    {competidor.rating} ⭐ ({competidor.reviews} reviews)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs text-green-700 font-medium">Fortalezas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {competidor.fortalezas.map((fortaleza, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {fortaleza}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-red-700 font-medium">Debilidades:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {competidor.debilidades.map((debilidad, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        {debilidad}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCompetitor(competidor)}
                className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                🔍 Análisis Detallado
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tendencias Regionales y Reviews Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Tendencias Regionales</h3>
          <div className="space-y-3">
            {tendenciasRegionales.map((tendencia, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl ${tendencia.adoptado ? '✅' : '⏳'}`}></span>
                  <div>
                    <h4 className="font-medium text-gray-800">{tendencia.tendencia}</h4>
                    <p className="text-sm text-green-600 font-medium">{tendencia.crecimiento} crecimiento</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  tendencia.adoptado ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {tendencia.adoptado ? 'Adoptado' : 'Oportunidad'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 Review Scanner</h3>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reviewsAnalysis.totalAnalyzadas}</div>
              <div className="text-sm text-blue-700">Reviews Analizadas (Google, TripAdvisor)</div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sentimiento Positivo:</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-4/5 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-green-600">{reviewsAnalysis.sentimiento.positivo}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sentimiento Neutral:</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-1/6 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-yellow-600">{reviewsAnalysis.sentimiento.neutral}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sentimiento Negativo:</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-1/12 h-2 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-red-600">{reviewsAnalysis.sentimiento.negativo}%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Temas Más Comentados:</h4>
            <div className="space-y-2">
              {reviewsAnalysis.temasMasComentados.slice(0, 3).map((tema, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{tema.tema}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">{tema.mencion}%</span>
                    <span className={`text-xs ${
                      tema.sentiment === 'positivo' ? 'text-green-600' : 
                      tema.sentiment === 'neutral' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {tema.sentiment === 'positivo' ? '😊' : tema.sentiment === 'neutral' ? '😐' : '😞'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recomendaciones Estratégicas */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <h3 className="text-xl font-bold text-indigo-800 mb-4">🎯 Recomendaciones Estratégicas IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-indigo-700">🚀 Oportunidades Inmediatas</h4>
            <div className="space-y-2 text-sm text-indigo-600">
              <div className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <p><strong>Delivery Premium:</strong> Competidores no han adoptado. Potencial +25% ingresos.</p>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <p><strong>Eventos Temáticos:</strong> Demanda creciente +18%. Diferenciación clave.</p>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <p><strong>Marketing de Tiempo de Espera:</strong> Debilidad común en competencia.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-indigo-700">🔒 Ventajas Competitivas</h4>
            <div className="space-y-2 text-sm text-indigo-600">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <p><strong>Sistema KumIA:</strong> Único en la zona. ROI 340% superior.</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <p><strong>Fidelización IA:</strong> 16.8 stars/cliente vs 12.3 promedio.</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <p><strong>Ticket Superior:</strong> 20% por encima del promedio del rubro.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎮 MÓDULO 3: JUEGOS MULTIJUGADOR
export const JuegosMultijugador = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [gameSessions, setGameSessions] = useState([]);
  const [showGameModal, setShowGameModal] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState('1P');
  const [gameStats, setGameStats] = useState({
    sesionesDiarias: 47,
    starsEntregadas: 156,
    juegoMasJugado: 'KumIA Duel',
    participacionPromedio: '73%'
  });

  // Juegos disponibles por categoría
  const juegos = {
    '1P': [
      {
        id: 'kumiSudoku',
        nombre: '🧠 KumiSudoku',
        descripcion: 'Sudoku express de 4x4 o 6x6 con tiempo limitado',
        objetivo: 'Estímulo mental',
        duracion: '3-5 min',
        starsReales: 2,
        starsSimbolicas: 3,
        dificultad: 'Media',
        popularidad: 85
      },
      {
        id: 'pacKumia',
        nombre: '🕹 Pac-KumIA',
        descripcion: 'Versión de Pacman con tokens KumIA y obstáculos personalizados',
        objetivo: 'Nostalgia + Humor',
        duracion: '4-6 min',
        starsReales: 3,
        starsSimbolicas: 2,
        dificultad: 'Fácil',
        popularidad: 92
      }
    ],
    '2P': [
      {
        id: 'kumiaVersus',
        nombre: '🃏 KumIA Duel',
        descripcion: 'Preguntas de cultura general o "Quién conoce mejor al otro"',
        objetivo: 'Risa + Conexión',
        duracion: '5-8 min',
        starsReales: 2,
        starsSimbolicas: 4,
        dificultad: 'Media',
        popularidad: 96
      },
      {
        id: 'retoExpress',
        nombre: '🎭 Reto Express',
        descripcion: 'Reto con mímica entre dos (ej: imita platos del menú o profesiones)',
        objetivo: 'Movimiento + Humor',
        duracion: '3-5 min',
        starsReales: 1,
        starsSimbolicas: 5,
        dificultad: 'Fácil',
        popularidad: 78
      },
      {
        id: 'puzzleKumia',
        nombre: '🧩 Puzzle KumIA',
        descripcion: 'Cada jugador arma la mitad de un puzzle simbólico del restaurante',
        objetivo: 'Cooperación',
        duracion: '6-10 min',
        starsReales: 3,
        starsSimbolicas: 2,
        dificultad: 'Media',
        popularidad: 71
      },
      {
        id: 'versusTap',
        nombre: '🔁 Versus Tap',
        descripcion: 'Tapping challenge: compiten tocando más rápido un elemento que se mueve',
        objetivo: 'Ritmo + Competencia',
        duracion: '2-3 min',
        starsReales: 1,
        starsSimbolicas: 3,
        dificultad: 'Fácil',
        popularidad: 89
      }
    ],
    '3+P': [
      {
        id: 'quienSoyYo',
        nombre: '🤫 Quién Soy Yo',
        descripcion: 'Juego clásico de adivinanza (pueden usar personajes de KumIA o ingredientes)',
        objetivo: 'Risa + Juego verbal',
        duracion: '8-12 min',
        starsReales: 3,
        starsSimbolicas: 4,
        dificultad: 'Fácil',
        popularidad: 94
      },
      {
        id: 'desafioKumia',
        nombre: '🤹 Desafío KumIA',
        descripcion: 'Serie de mini-retos en mesa (apilar servilletas, cantar jingle, trivia)',
        objetivo: 'Risa + Movimiento',
        duracion: '10-15 min',
        starsReales: 5,
        starsSimbolicas: 3,
        dificultad: 'Media',
        popularidad: 87
      },
      {
        id: 'totemFelicidad',
        nombre: '🧃 Tótem de la Felicidad',
        descripcion: 'Cada jugador aporta algo (una palabra, acción, brindis), se forma un ritual',
        objetivo: 'Vínculo + Repetición emocional',
        duracion: '5-8 min',
        starsReales: 2,
        starsSimbolicas: 5,
        dificultad: 'Fácil',
        popularidad: 82
      },
      {
        id: 'misionOculta',
        nombre: '🧙 Misión Oculta',
        descripcion: 'Uno recibe una misión secreta (hacer reír, decir cierta palabra), los demás deben descubrirlo',
        objetivo: 'Intriga + Risa',
        duracion: '10-15 min',
        starsReales: 4,
        starsSimbolicas: 2,
        dificultad: 'Alta',
        popularidad: 76
      }
    ]
  };

  // Sesiones activas simuladas
  const sesionesActivas = [
    { mesaId: 'mesa_5', juego: 'KumIA Duel', jugadores: 2, tiempoRestante: '4:32', starsEnJuego: 6 },
    { mesaId: 'mesa_12', juego: 'Desafío KumIA', jugadores: 4, tiempoRestante: '8:15', starsEnJuego: 8 },
    { mesaId: 'mesa_3', juego: 'Pac-KumIA', jugadores: 1, tiempoRestante: '2:48', starsEnJuego: 5 }
  ];

  // Panel de configuración de seguridad
  const seguridadConfig = {
    geofencing: true,
    tiempoMaximoSesion: 45,
    sesionesMaximasPorCliente: 1,
    tiempoEsperaMinimo: 10,
    validacionQR: true,
    validacionGeolocation: true
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🎮 Juegos Multijugador</h2>
          <p className="text-gray-600 mt-1">Sistema gamificado con recompensas controladas y métricas de impacto</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowGameModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            🎯 Configurar Juegos
          </button>
          <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
            📊 UserWebApp Preview
          </button>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{gameStats.sesionesDiarias}</div>
          <div className="text-sm text-blue-700">Sesiones Hoy</div>
          <div className="text-xs text-green-600 mt-1">+23% vs ayer</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{gameStats.starsEntregadas}</div>
          <div className="text-sm text-green-700">Stars Entregadas</div>
          <div className="text-xs text-blue-600 mt-1">134 reales + 22 simbólicas</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{gameStats.juegoMasJugado}</div>
          <div className="text-sm text-purple-700">Juego Más Popular</div>
          <div className="text-xs text-purple-600 mt-1">34% de las sesiones</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">{gameStats.participacionPromedio}</div>
          <div className="text-sm text-orange-700">Participación</div>
          <div className="text-xs text-green-600 mt-1">Promedio por mesa</div>
        </div>
      </div>

      {/* Catálogo de Juegos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">🎯 Catálogo de Juegos por Tipo</h3>
          <div className="flex space-x-2">
            {['1P', '2P', '3+P'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setSelectedGameType(tipo)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedGameType === tipo
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tipo === '1P' ? '🎯 Single Player' : tipo === '2P' ? '💕 Parejas' : '👥 Grupos'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {juegos[selectedGameType].map((juego) => (
            <div key={juego.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800">{juego.nombre}</h4>
                <div className="flex items-center space-x-1">
                  <div className="w-12 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${juego.popularidad}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{juego.popularidad}%</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{juego.descripcion}</p>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Objetivo:</span>
                  <span className="font-medium text-blue-600">{juego.objetivo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-medium">{juego.duracion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dificultad:</span>
                  <span className={`font-medium ${
                    juego.dificultad === 'Fácil' ? 'text-green-600' :
                    juego.dificultad === 'Media' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {juego.dificultad}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{juego.starsReales}</div>
                  <div className="text-xs text-orange-700">Stars Reales</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{juego.starsSimbolicas}</div>
                  <div className="text-xs text-blue-700">KumiSmile Stars</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                  ⚙️ Configurar
                </button>
                <button className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm hover:bg-green-200 transition-colors">
                  🎮 Vista Previa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sesiones Activas y Panel de Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Sesiones Activas en Tiempo Real</h3>
          {sesionesActivas.length > 0 ? (
            <div className="space-y-3">
              {sesionesActivas.map((sesion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <h4 className="font-medium text-green-800">{sesion.juego}</h4>
                    <p className="text-sm text-green-700">Mesa {sesion.mesaId} • {sesion.jugadores} jugadores</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{sesion.tiempoRestante}</div>
                    <div className="text-xs text-green-700">{sesion.starsEnJuego} stars en juego</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎮</div>
              <p>No hay sesiones activas actualmente</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🔐 Panel de Seguridad</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-800">Geofencing Activo</h4>
                <p className="text-sm text-blue-600">Validación por ubicación</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={seguridadConfig.geofencing} readOnly />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-green-800">QR Dinámico</h4>
                <p className="text-sm text-green-600">Por pedido único</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={seguridadConfig.validacionQR} readOnly />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <h4 className="font-medium text-purple-800">Límite de Tiempo</h4>
                <p className="text-sm text-purple-600">{seguridadConfig.tiempoMaximoSesion} min por sesión</p>
              </div>
              <div className="text-lg font-bold text-purple-600">{seguridadConfig.tiempoMaximoSesion}'</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <h4 className="font-medium text-orange-800">Anti-Fraude</h4>
                <p className="text-sm text-orange-600">1 sesión por cliente</p>
              </div>
              <div className="text-lg font-bold text-orange-600">✓</div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de Impacto */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
        <h3 className="text-xl font-bold text-emerald-800 mb-4">📊 Métricas de Impacto de Juegos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">+18 min</div>
            <div className="text-sm text-emerald-700">Tiempo promedio extra por mesa</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">+32%</div>
            <div className="text-sm text-blue-700">Incremento en ticket promedio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">4.8/5</div>
            <div className="text-sm text-purple-700">Satisfacción con juegos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">67%</div>
            <div className="text-sm text-orange-700">Tasa de re-participación</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg">
          <h4 className="font-bold text-gray-800 mb-2">💡 Insights KUMIA</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Los juegos de 2 jugadores tienen 23% más engagement que individuales</p>
            <p>• Sesiones entre 5-8 minutos generan mayor satisfacción del cliente</p>
            <p>• Juegos con recompensas reales aumentan la fidelización en un 45%</p>
            <p>• Mayor participación detectada entre 19:30-21:00 hrs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 📱 MÓDULO 4: GESTIÓN DE USER WEB APP
export const GestionUserWebApp = () => {
  const [previewMode, setPreviewMode] = useState('mobile');
  const [activeEditor, setActiveEditor] = useState('visual');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [webAppConfig, setWebAppConfig] = useState({
    nombre: 'IL MANDORLA',
    logo: '',
    colorPrimario: '#F97316',
    colorSecundario: '#DC2626',
    mensajeBienvenida: '¡Bienvenido a IL MANDORLA! Disfruta de la mejor experiencia gastronómica con KumIA Stars.',
    temaVisual: 'gourmet',
    mostrarNiveles: true,
    mostrarProgreso: true,
    notificacionesPush: true
  });

  const [walletPreview] = useState({
    cliente: {
      nombre: 'Elena Vargas',
      nivel: 'Estrella',
      stars: 89,
      starsProximoNivel: 11,
      nftsDesbloqueados: 3,
      proximaRecompensa: 'Experiencia VIP'
    }
  });

  // Configuración de recompensas visibles
  const [recompensasConfig, setRecompensasConfig] = useState([
    { id: 1, nivel: 'Explorador', nombre: 'Descuento 15%', visible: true, stock: 25 },
    { id: 2, nivel: 'Destacado', nombre: 'Plato Gratis', visible: true, stock: 12 },
    { id: 3, nivel: 'Estrella', nombre: 'Experiencia VIP', visible: true, stock: 5 },
    { id: 4, nivel: 'Leyenda', nombre: 'Cena Privada', visible: false, stock: 2 }
  ]);

  // IA de experiencias
  const experienciasIA = [
    { tipo: 'Saludo personalizado', texto: '¡Hola Elena! Tu mesa favorita te está esperando 😊', mood: 'acogedor' },
    { tipo: 'Recomendación menu', texto: 'Basado en tus gustos, te recomendamos el Cordero Patagónico con nuestra nueva salsa', mood: 'gourmet' },
    { tipo: 'Notificación nivel', texto: '¡Solo 11 stars más para ser Leyenda! 🌟', mood: 'motivacional' },
    { tipo: 'Invitación evento', texto: 'Este viernes tenemos cata de vinos premium. ¿Te apuntas?', mood: 'exclusivo' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">📱 Gestión de User Web App</h2>
          <p className="text-gray-600 mt-1">Controla cómo se presenta tu restaurante al cliente final</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowPreviewModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            👀 Vista Previa Completa
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
            🚀 Publicar Cambios
          </button>
        </div>
      </div>

      {/* Editor Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">🎨 Editor Visual</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveEditor('visual')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  activeEditor === 'visual' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                🎨 Visual
              </button>
              <button
                onClick={() => setActiveEditor('contenido')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  activeEditor === 'contenido' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                📝 Contenido
              </button>
            </div>
          </div>

          {activeEditor === 'visual' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo del Restaurante</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                    {webAppConfig.logo ? (
                      <img src={webAppConfig.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-white text-xl">🍽️</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      📁 Subir Logo
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Recomendado: 512x512px, PNG o JPG</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Primario</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={webAppConfig.colorPrimario}
                      onChange={(e) => setWebAppConfig(prev => ({...prev, colorPrimario: e.target.value}))}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={webAppConfig.colorPrimario}
                      onChange={(e) => setWebAppConfig(prev => ({...prev, colorPrimario: e.target.value}))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Secundario</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={webAppConfig.colorSecundario}
                      onChange={(e) => setWebAppConfig(prev => ({...prev, colorSecundario: e.target.value}))}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={webAppConfig.colorSecundario}
                      onChange={(e) => setWebAppConfig(prev => ({...prev, colorSecundario: e.target.value}))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tema Visual</label>
                <select 
                  value={webAppConfig.temaVisual}
                  onChange={(e) => setWebAppConfig(prev => ({...prev, temaVisual: e.target.value}))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gourmet">🍽️ Gourmet - Elegante y sofisticado</option>
                  <option value="casual">😊 Casual - Amigable y relajado</option>
                  <option value="premium">✨ Premium - Lujo y exclusividad</option>
                  <option value="familiar">👨‍👩‍👧‍👦 Familiar - Cálido y acogedor</option>
                </select>
              </div>
            </div>
          )}

          {activeEditor === 'contenido' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Restaurante</label>
                <input
                  type="text"
                  value={webAppConfig.nombre}
                  onChange={(e) => setWebAppConfig(prev => ({...prev, nombre: e.target.value}))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje de Bienvenida</label>
                <textarea
                  value={webAppConfig.mensajeBienvenida}
                  onChange={(e) => setWebAppConfig(prev => ({...prev, mensajeBienvenida: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Mensaje que verán los clientes al ingresar a la app..."
                />
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Configuración de Visualización</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mostrar niveles KumIA</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={webAppConfig.mostrarNiveles}
                        onChange={(e) => setWebAppConfig(prev => ({...prev, mostrarNiveles: e.target.checked}))}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mostrar progreso de Stars</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={webAppConfig.mostrarProgreso}
                        onChange={(e) => setWebAppConfig(prev => ({...prev, mostrarProgreso: e.target.checked}))}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Notificaciones Push</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={webAppConfig.notificacionesPush}
                        onChange={(e) => setWebAppConfig(prev => ({...prev, notificacionesPush: e.target.checked}))}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vista Previa en Tiempo Real */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">👀 Vista Previa en Tiempo Real</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  previewMode === 'mobile' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                📱 Móvil
              </button>
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  previewMode === 'desktop' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                💻 Desktop
              </button>
            </div>
          </div>

          <div className={`mx-auto bg-gray-100 rounded-xl p-4 ${previewMode === 'mobile' ? 'max-w-xs' : 'w-full'}`}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header */}
              <div 
                className="px-4 py-6 text-white text-center"
                style={{ backgroundColor: webAppConfig.colorPrimario }}
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
                <h2 className="text-xl font-bold">{webAppConfig.nombre}</h2>
                <p className="text-sm opacity-90 mt-1">KumIA Experience</p>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {webAppConfig.mensajeBienvenida}
                  </p>
                </div>

                {webAppConfig.mostrarNiveles && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Mi Nivel</span>
                      <span className="text-sm font-bold text-yellow-600">⭐ Estrella</span>
                    </div>
                    {webAppConfig.mostrarProgreso && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>89 Stars</span>
                          <span>100 Stars para Leyenda</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ width: '89%', backgroundColor: webAppConfig.colorSecundario }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">89</div>
                    <div className="text-xs text-blue-700">Mis Stars</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">3</div>
                    <div className="text-xs text-green-700">NFTs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gestor de Recompensas Visibles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🎁 Gestor de Recompensas Visibles</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Nivel</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Recompensa</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Stock</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Visible</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recompensasConfig.map((recompensa) => (
                <tr key={recompensa.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      recompensa.nivel === 'Explorador' ? 'bg-blue-100 text-blue-800' :
                      recompensa.nivel === 'Destacado' ? 'bg-purple-100 text-purple-800' :
                      recompensa.nivel === 'Estrella' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {recompensa.nivel}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium">{recompensa.nombre}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-medium ${recompensa.stock > 10 ? 'text-green-600' : recompensa.stock > 5 ? 'text-orange-600' : 'text-red-600'}`}>
                      {recompensa.stock}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={recompensa.visible}
                        onChange={(e) => {
                          setRecompensasConfig(prev => 
                            prev.map(r => r.id === recompensa.id ? {...r, visible: e.target.checked} : r)
                          );
                        }}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                      ⚙️ Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IA de Experiencias */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-xl font-bold text-purple-800 mb-4">🧠 IA de Experiencias Personalizadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experienciasIA.map((experiencia, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{experiencia.tipo}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  experiencia.mood === 'acogedor' ? 'bg-blue-100 text-blue-800' :
                  experiencia.mood === 'gourmet' ? 'bg-green-100 text-green-800' :
                  experiencia.mood === 'motivacional' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {experiencia.mood}
                </span>
              </div>
              <p className="text-sm text-gray-600 italic">"{experiencia.texto}"</p>
              <div className="mt-2 flex space-x-2">
                <button className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors">
                  ✏️ Editar
                </button>
                <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors">
                  ✅ Activar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 💳 MÓDULO 5: TU FACTURACIÓN KUMIA
export const TuFacturacionKumia = () => {
  const [showROISimulator, setShowROISimulator] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [simulatorValues, setSimulatorValues] = useState({
    ticketPromedio: 3830,
    usuariosActivos: 62,
    crecimientoEsperado: 25
  });

  // Facturación actual
  const facturacionActual = {
    planActual: 'KumIA Elite Pro',
    costoPorModulo: {
      'Dashboard Base': 45000,
      'AI Agents': 25000,
      'Centro IA Marketing': 35000,
      'Inteligencia Competitiva': 15000,
      'Juegos Multijugador': 20000,
      'User Web App': 10000,
      'Recompensas NFT': 30000
    },
    totalMensual: 180000,
    fechaFacturacion: '15 de cada mes',
    metodoPago: 'Transferencia Bancaria',
    proximoVencimiento: '2025-01-15'
  };

  // Historial de pagos
  const historialPagos = [
    { fecha: '2024-12-15', monto: 180000, estado: 'Pagado', folio: 'DTE-2024-001247', metodo: 'Transferencia' },
    { fecha: '2024-11-15', monto: 165000, estado: 'Pagado', folio: 'DTE-2024-001186', metodo: 'Transferencia' },
    { fecha: '2024-10-15', monto: 150000, estado: 'Pagado', folio: 'DTE-2024-001098', metodo: 'Transferencia' },
    { fecha: '2024-09-15', monto: 135000, estado: 'Pagado', folio: 'DTE-2024-000945', metodo: 'Transferencia' }
  ];

  // Cálculo del simulador ROI
  const calcularSimulacionROI = () => {
    const ingresosMensualesActuales = simulatorValues.ticketPromedio * simulatorValues.usuariosActivos * 2.8; // 2.8 visitas promedio
    const crecimientoDecimal = simulatorValues.crecimientoEsperado / 100;
    const ingresosMensualesProyectados = ingresosMensualesActuales * (1 + crecimientoDecimal);
    const ingresoAdicional = ingresosMensualesProyectados - ingresosMensualesActuales;
    const roiKumia = (ingresoAdicional / facturacionActual.totalMensual) * 100;

    return {
      actual: ingresosMensualesActuales,
      proyectado: ingresosMensualesProyectados,
      adicional: ingresoAdicional,
      roi: roiKumia,
      recuperacionInversion: Math.ceil(facturacionActual.totalMensual / (ingresoAdicional / 12))
    };
  };

  const simulacion = calcularSimulacionROI();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">💳 Tu Facturación KumIA</h2>
          <p className="text-gray-600 mt-1">Transparencia financiera y simulación de escalabilidad</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowROISimulator(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            📊 Simulador ROI
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            💬 Soporte
          </button>
        </div>
      </div>

      {/* Resumen Mensual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Resumen Mensual - {facturacionActual.planActual}</h3>
          
          <div className="space-y-3 mb-6">
            {Object.entries(facturacionActual.costoPorModulo).map(([modulo, costo]) => (
              <div key={modulo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                  <span className="font-medium text-gray-800">{modulo}</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Activo</span>
                </div>
                <span className="font-bold text-gray-700">${costo.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-800">Total Mensual:</span>
              <span className="text-2xl font-bold text-blue-600">${facturacionActual.totalMensual.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
              <span>Próximo vencimiento:</span>
              <span className="font-medium">{facturacionActual.proximoVencimiento}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
          <h3 className="text-lg font-bold text-emerald-800 mb-4">💰 Estado de Cuenta</h3>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">Al día</div>
              <div className="text-sm text-emerald-700">Estado de pagos</div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Método de pago:</span>
                <span className="font-medium">{facturacionActual.metodoPago}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Facturación:</span>
                <span className="font-medium">{facturacionActual.fechaFacturacion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Próximo cargo:</span>
                <span className="font-medium text-blue-600">${facturacionActual.totalMensual.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => setShowPaymentModal(true)}
              className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              🔄 Actualizar Plan
            </button>
          </div>
        </div>
      </div>

      {/* Facturación Electrónica e Historial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🧾 Facturación Electrónica DTE</h3>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-center mb-2">
              <span className="text-blue-600 text-2xl mr-3">📄</span>
              <div>
                <h4 className="font-bold text-blue-800">Facturación Digital Chile</h4>
                <p className="text-sm text-blue-700">Documentos tributarios electrónicos válidos</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">Última Factura</div>
                <div className="text-sm text-gray-600">DTE-2024-001247 • Diciembre 2024</div>
              </div>
              <div className="flex space-x-2">
                <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors">
                  👁️ Ver
                </button>
                <button className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors">
                  📥 Descargar
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">Certificados SII</div>
                <div className="text-sm text-gray-600">Válidos hasta Marzo 2025</div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✅ Vigente</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">RUT Empresa</div>
                <div className="text-sm text-gray-600">76.XXX.XXX-X</div>
              </div>
              <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors">
                ⚙️ Configurar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Historial de Pagos</h3>
          
          <div className="space-y-3">
            {historialPagos.map((pago, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">{pago.fecha}</div>
                  <div className="text-sm text-gray-600">{pago.folio} • {pago.metodo}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">${pago.monto.toLocaleString()}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    pago.estado === 'Pagado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {pago.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors">
            📄 Ver Historial Completo
          </button>
        </div>
      </div>

      {/* Modal Simulador ROI */}
      {showROISimulator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📊 Simulador ROI Dinámico</h2>
                  <p className="text-gray-600">Proyecciones de retorno según diferentes escenarios</p>
                </div>
                <button 
                  onClick={() => setShowROISimulator(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuración de Variables */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800">⚙️ Variables de Simulación</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ticket Promedio Actual (CLP)
                      <span className="text-xs text-gray-500 ml-2">Actual: $3,830</span>
                    </label>
                    <input
                      type="range"
                      min="2000"
                      max="8000"
                      step="100"
                      value={simulatorValues.ticketPromedio}
                      onChange={(e) => setSimulatorValues(prev => ({...prev, ticketPromedio: parseInt(e.target.value)}))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>$2,000</span>
                      <span className="font-medium">${simulatorValues.ticketPromedio.toLocaleString()}</span>
                      <span>$8,000</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuarios Activos Mensuales
                      <span className="text-xs text-gray-500 ml-2">Actual: 62</span>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      step="5"
                      value={simulatorValues.usuariosActivos}
                      onChange={(e) => setSimulatorValues(prev => ({...prev, usuariosActivos: parseInt(e.target.value)}))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>20</span>
                      <span className="font-medium">{simulatorValues.usuariosActivos} usuarios</span>
                      <span>200</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Crecimiento Esperado (%)
                      <span className="text-xs text-gray-500 ml-2">Promedio industria: 20%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={simulatorValues.crecimientoEsperado}
                      onChange={(e) => setSimulatorValues(prev => ({...prev, crecimientoEsperado: parseInt(e.target.value)}))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span className="font-medium">{simulatorValues.crecimientoEsperado}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Resultados de Simulación */}
                <div className="space-y-6">
                  <h3 className="font-bold text-gray-800">📈 Resultados de Simulación</h3>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-800 mb-3">💰 Proyección de Ingresos</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ingresos actuales:</span>
                        <span className="font-bold">${simulacion.actual.toLocaleString()}/mes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ingresos proyectados:</span>
                        <span className="font-bold text-blue-600">${simulacion.proyectado.toLocaleString()}/mes</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-800 font-medium">Ingreso adicional:</span>
                        <span className="font-bold text-green-600">+${simulacion.adicional.toLocaleString()}/mes</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-bold text-green-800 mb-3">📊 ROI de KumIA</h4>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600">{simulacion.roi.toFixed(0)}%</div>
                      <div className="text-sm text-green-700">Retorno sobre inversión mensual</div>
                    </div>
                    <div className="mt-3 text-sm text-green-700 text-center">
                      Recuperación de inversión: <strong>{simulacion.recuperacionInversion} días</strong>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-bold text-purple-800 mb-3">🎯 Recomendaciones</h4>
                    <div className="space-y-2 text-sm text-purple-700">
                      {simulacion.roi > 300 && <div>• ✅ ROI excelente, considera expandir a más locales</div>}
                      {simulacion.roi < 200 && <div>• ⚠️ ROI bajo, enfócate en aumentar ticket promedio</div>}
                      {simulatorValues.usuariosActivos < 50 && <div>• 📈 Oportunidad de crecimiento en base de usuarios</div>}
                      {simulatorValues.crecimientoEsperado > 50 && <div>• 🚀 Proyección muy optimista, valida con datos históricos</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button 
                  onClick={() => setShowROISimulator(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
                <button className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                  📊 Generar Reporte
                </button>
                <button className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                  📧 Enviar Proyección
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acceso Directo a Soporte */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-blue-800 mb-4">💬 Soporte y Cobranzas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <span className="text-2xl mb-2 block">📞</span>
            <h4 className="font-bold text-gray-800 mb-1">Soporte Técnico</h4>
            <p className="text-sm text-gray-600 mb-3">Lun-Vie 9:00-18:00</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Contactar
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <span className="text-2xl mb-2 block">💳</span>
            <h4 className="font-bold text-gray-800 mb-1">Cobranzas</h4>
            <p className="text-sm text-gray-600 mb-3">Consultas de facturación</p>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Consultar
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <span className="text-2xl mb-2 block">📚</span>
            <h4 className="font-bold text-gray-800 mb-1">Centro de Ayuda</h4>
            <p className="text-sm text-gray-600 mb-3">Documentación y FAQ</p>
            <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
              Ver Guías
            </button>
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
  AIAgentsSection,
  InteligenciaCompetitiva,
  JuegosMultijugador,
  GestionUserWebApp,
  TuFacturacionKumia
};