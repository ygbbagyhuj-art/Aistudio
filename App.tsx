import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DataCard from './components/DataCard';
import { IBGEState, IBGEMunicipality, ProcessedData, ExportFormat, WebAppIdea } from './types';
import { fetchStates, fetchMunicipalitiesByState, fetchMunicipalityIndicators } from './services/ibgeService';
import { generateCityInsight, generateBusinessTips, generateTourismHighlights, generateWebAppIdeas, generateDevPrompt } from './services/geminiService';

function App() {
  const [states, setStates] = useState<IBGEState[]>([]);
  const [municipalities, setMunicipalities] = useState<IBGEMunicipality[]>([]);
  
  const [selectedUf, setSelectedUf] = useState<string>('');
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string>('');
  const [citySearchTerm, setCitySearchTerm] = useState<string>('');
  
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [currentData, setCurrentData] = useState<ProcessedData | null>(null);

  // Gemini State
  const [insight, setInsight] = useState<string>('');
  const [businessTips, setBusinessTips] = useState<string>('');
  const [tourismHighlights, setTourismHighlights] = useState<string>('');
  
  // Web Apps Advanced State
  const [webAppIdeasList, setWebAppIdeasList] = useState<WebAppIdea[]>([]);
  const [devPrompt, setDevPrompt] = useState<string>('');
  
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loadingDevPrompt, setLoadingDevPrompt] = useState(false);

  // Initial Load (States)
  useEffect(() => {
    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const data = await fetchStates();
        setStates(data);
      } catch (err) {
        console.error("Critical: Failed to load states", err);
      } finally {
        setLoadingStates(false);
      }
    };
    loadStates();
  }, []);

  // Load Municipalities when UF changes
  useEffect(() => {
    if (!selectedUf) {
      setMunicipalities([]);
      setSelectedMunicipalityId('');
      setCitySearchTerm('');
      return;
    }

    const loadCities = async () => {
      setLoadingMunicipalities(true);
      setSelectedMunicipalityId(''); // Reset city selection
      setCitySearchTerm(''); // Reset search term
      setCurrentData(null);
      // Reset AI states
      setInsight('');
      setBusinessTips('');
      setTourismHighlights('');
      setWebAppIdeasList([]);
      setDevPrompt('');
      
      try {
        const data = await fetchMunicipalitiesByState(selectedUf);
        setMunicipalities(data);
      } catch (err) {
        console.error("Critical: Failed to load municipalities", err);
      } finally {
        setLoadingMunicipalities(false);
      }
    };
    loadCities();
  }, [selectedUf]);

  // Process data when Municipality changes
  useEffect(() => {
    if (!selectedMunicipalityId) {
      setCurrentData(null);
      setInsight('');
      setBusinessTips('');
      setTourismHighlights('');
      setWebAppIdeasList([]);
      setDevPrompt('');
      return;
    }

    const city = municipalities.find(m => m.id.toString() === selectedMunicipalityId);
    if (city) {
      // Basic data processing
      const processed: ProcessedData = {
        id: city.id,
        nome: city.nome,
        uf: city.microrregiao.mesorregiao.UF.sigla,
        microrregiao: city.microrregiao.nome,
        mesorregiao: city.microrregiao.mesorregiao.nome,
        regiao: city.microrregiao.mesorregiao.UF.regiao.nome
      };
      
      setCurrentData(processed);
      // Clear previous insights
      setInsight('');
      setBusinessTips('');
      setTourismHighlights('');
      setWebAppIdeasList([]);
      setDevPrompt('');

      // Parallel fetching of additional data
      // 1. Population and Area Indicators
      fetchMunicipalityIndicators(city.id).then(indicators => {
        setCurrentData(prev => {
            if (prev && prev.id === processed.id) {
                return { ...prev, ...indicators };
            }
            return prev;
        });
      });
    }
  }, [selectedMunicipalityId, municipalities]);

  // Filter municipalities based on search term
  const filteredMunicipalities = municipalities.filter(city => 
    city.nome.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  // AI Handlers
  const handleGenerateSummary = async () => {
    if (!currentData) return;
    setLoadingInsight(true);
    try {
      const text = await generateCityInsight(currentData.nome, currentData.uf);
      setInsight(text);
      setCurrentData(prev => prev ? { ...prev, summary: text } : null);
    } catch (e) {
      setInsight("Erro ao gerar resumo.");
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleGenerateBusiness = async () => {
    if (!currentData) return;
    setLoadingInsight(true);
    try {
      const text = await generateBusinessTips(currentData.nome, currentData.uf, currentData.populacao);
      setBusinessTips(text);
      setCurrentData(prev => prev ? { ...prev, businessTips: text } : null);
    } catch (e) {
      setBusinessTips("Erro ao gerar análise de negócios.");
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleGenerateTourism = async () => {
    if (!currentData) return;
    setLoadingInsight(true);
    try {
      const text = await generateTourismHighlights(currentData.nome, currentData.uf);
      setTourismHighlights(text);
      setCurrentData(prev => prev ? { ...prev, tourismHighlights: text } : null);
    } catch (e) {
      setTourismHighlights("Erro ao gerar guia turístico.");
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleGenerateWebAppIdeas = async () => {
    if (!currentData) return;
    setLoadingInsight(true);
    setDevPrompt(''); // Reset prompt if regenerating ideas
    try {
      const jsonString = await generateWebAppIdeas(currentData.nome, currentData.uf, currentData.populacao);
      const ideas: WebAppIdea[] = JSON.parse(jsonString);
      
      // Convert to string for display/export legacy support
      const ideasString = ideas.map(i => `${i.id}. ${i.title} (${i.category}): ${i.description}`).join('\n\n');
      
      setWebAppIdeasList(ideas);
      setCurrentData(prev => prev ? { ...prev, webAppIdeas: ideasString, webAppIdeasList: ideas } : null);
    } catch (e) {
      setWebAppIdeasList([]);
      console.error(e);
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleGenerateDevPrompt = async (idea: WebAppIdea) => {
    if (!currentData) return;
    setLoadingDevPrompt(true);
    try {
      const prompt = await generateDevPrompt(idea.title, idea.description, `${currentData.nome}-${currentData.uf}`);
      setDevPrompt(prompt);
    } catch (e) {
        setDevPrompt("Erro ao gerar o prompt de desenvolvimento.");
    } finally {
        setLoadingDevPrompt(false);
    }
  };

  const handleExport = (format: ExportFormat) => {
    if (!currentData) return;

    let content = '';
    let mimeType = '';
    let extension = '';
    let filenamePrefix = `pacote_${currentData.uf}_${currentData.nome.replace(/\s+/g, '_').toLowerCase()}`;

    // Export CSV (Full Data)
    if (format === ExportFormat.CSV) {
      const headers = [
        'id', 'nome', 'uf', 'microrregiao', 'mesorregiao', 'regiao', 
        'populacao_estimada', 'area_km2', 
        'resumo_geral', 'dicas_negocios', 'pontos_turisticos', 'ideias_web_apps'
      ];
      const values = [
        currentData.id,
        `"${currentData.nome}"`,
        currentData.uf,
        `"${currentData.microrregiao}"`,
        `"${currentData.mesorregiao}"`,
        `"${currentData.regiao}"`,
        currentData.populacao || '',
        currentData.area || '',
        `"${(currentData.summary || '').replace(/"/g, '""')}"`,
        `"${(currentData.businessTips || '').replace(/"/g, '""')}"`,
        `"${(currentData.tourismHighlights || '').replace(/"/g, '""')}"`,
        `"${(currentData.webAppIdeas || '').replace(/"/g, '""')}"`
      ];
      content = headers.join(',') + '\n' + values.join(',');
      mimeType = 'text/csv;charset=utf-8;';
      extension = 'csv';
    } 
    // Export Prompt Only
    else if (format === ExportFormat.PROMPT) {
      if (!devPrompt) return; // Guard clause
      content = devPrompt;
      mimeType = 'text/markdown;charset=utf-8;';
      extension = 'md';
      filenamePrefix = `prompt_dev_${currentData.nome.replace(/\s+/g, '_').toLowerCase()}`;
    }

    // Trigger Download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filenamePrefix}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Selecione a Localidade</h3>
              
              <div className="space-y-4">
                {/* State Selector */}
                <div>
                  <label htmlFor="uf" className="block text-sm font-medium text-slate-700 mb-1">Estado (UF)</label>
                  <select
                    id="uf"
                    value={selectedUf}
                    onChange={(e) => setSelectedUf(e.target.value)}
                    disabled={loadingStates}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-gov-500 focus:ring-gov-500 sm:text-sm py-2.5 px-3 border bg-slate-50 text-slate-900"
                  >
                    <option value="">Selecione um estado...</option>
                    {states.map((uf) => (
                      <option key={uf.id} value={uf.sigla}>{uf.nome} ({uf.sigla})</option>
                    ))}
                  </select>
                </div>

                {/* City Search & Selector */}
                <div>
                  <label htmlFor="citySearch" className="block text-sm font-medium text-slate-700 mb-1">Município</label>
                  
                  {/* Search Input */}
                  <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="citySearch"
                      placeholder="Filtrar cidade..."
                      value={citySearchTerm}
                      onChange={(e) => setCitySearchTerm(e.target.value)}
                      disabled={!selectedUf || loadingMunicipalities}
                      className="block w-full rounded-lg border-slate-300 pl-9 shadow-sm focus:border-gov-500 focus:ring-gov-500 sm:text-sm py-2 px-3 border bg-slate-50 text-slate-900 disabled:opacity-50 disabled:bg-slate-100 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Dropdown */}
                  <select
                    id="city"
                    value={selectedMunicipalityId}
                    onChange={(e) => setSelectedMunicipalityId(e.target.value)}
                    disabled={!selectedUf || loadingMunicipalities}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-gov-500 focus:ring-gov-500 sm:text-sm py-2.5 px-3 border bg-slate-50 text-slate-900 disabled:opacity-50 disabled:bg-slate-100"
                  >
                    <option value="">
                      {loadingMunicipalities 
                        ? 'Carregando cidades...' 
                        : filteredMunicipalities.length === 0 && citySearchTerm 
                          ? 'Nenhuma cidade encontrada' 
                          : 'Selecione um município...'}
                    </option>
                    {filteredMunicipalities.map((city) => (
                      <option key={city.id} value={city.id}>{city.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Fonte Oficial:</strong> Todos os dados são obtidos em tempo real através das APIs públicas do IBGE (servicodados.ibge.gov.br).
              </p>
            </div>
          </div>

          {/* Right Column: Data Display */}
          <div className="lg:col-span-8 h-full">
            <DataCard 
              data={currentData} 
              loading={loadingMunicipalities && selectedMunicipalityId === ''} 
              insight={insight}
              businessTips={businessTips}
              tourismHighlights={tourismHighlights}
              webAppIdeas={webAppIdeasList}
              generatedDevPrompt={devPrompt}
              loadingInsight={loadingInsight}
              loadingDevPrompt={loadingDevPrompt}
              onGenerateSummary={handleGenerateSummary}
              onGenerateBusiness={handleGenerateBusiness}
              onGenerateTourism={handleGenerateTourism}
              onGenerateWebAppIdeas={handleGenerateWebAppIdeas}
              onGenerateDevPrompt={handleGenerateDevPrompt}
            />

            {/* Export Buttons - Static at bottom of flow */}
            {currentData && (
              <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="text-sm text-slate-600">
                     <p className="font-medium text-slate-900">Exportar Dados</p>
                     <p>Baixe o pacote de dados ou o prompt técnico gerado.</p>
                   </div>
                   <div className="flex gap-3 w-full sm:w-auto">
                     <button
                      onClick={() => handleExport(ExportFormat.PROMPT)}
                      disabled={!devPrompt}
                      className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 border border-indigo-200 shadow-sm text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
                      title={!devPrompt ? "Gere um Prompt de Desenvolvimento na aba Web Apps primeiro" : "Baixar arquivo Markdown do prompt"}
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                      </svg>
                       Baixar Prompt (Dev)
                     </button>
                     <button
                      onClick={() => handleExport(ExportFormat.CSV)}
                      className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gov-600 hover:bg-gov-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-500"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                       Baixar CSV
                     </button>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;