import React, { useState, useEffect } from 'react';
import { ProcessedData, WebAppIdea } from '../types';

interface DataCardProps {
  data: ProcessedData | null;
  loading: boolean;
  
  // AI State
  insight: string;
  businessTips: string;
  tourismHighlights: string;
  webAppIdeas: WebAppIdea[];
  generatedDevPrompt: string;
  
  loadingInsight: boolean;
  loadingDevPrompt: boolean;
  
  // Actions
  onGenerateSummary: () => void;
  onGenerateBusiness: () => void;
  onGenerateTourism: () => void;
  onGenerateWebAppIdeas: () => void;
  onGenerateDevPrompt: (idea: WebAppIdea) => void;
}

type TabType = 'summary' | 'business' | 'tourism' | 'webapps';

const DataCard: React.FC<DataCardProps> = ({ 
  data, 
  loading, 
  insight, 
  businessTips, 
  tourismHighlights, 
  webAppIdeas,
  generatedDevPrompt,
  loadingInsight, 
  loadingDevPrompt,
  onGenerateSummary, 
  onGenerateBusiness, 
  onGenerateTourism,
  onGenerateWebAppIdeas,
  onGenerateDevPrompt
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeIdeaId, setActiveIdeaId] = useState<number | null>(null);

  // Reset copy state when tab changes
  useEffect(() => {
    setCopySuccess(false);
  }, [activeTab, data]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center h-full flex flex-col justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-slate-300 mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-slate-500 font-medium">Selecione um município para visualizar os dados.</p>
      </div>
    );
  }

  // Specialized Renderer for Web Apps Tab
  const renderWebAppContent = () => {
    if (loadingInsight && webAppIdeas.length === 0) {
       return (
        <div className="flex gap-2 items-center text-sm text-indigo-700 py-8 justify-center">
          <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Gerando ideias de apps com Gemini AI...</span>
        </div>
      );
    }

    if (webAppIdeas && webAppIdeas.length > 0) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                    {webAppIdeas.map((idea) => (
                        <div 
                            key={idea.id} 
                            className={`p-4 border rounded-lg transition-all ${
                                activeIdeaId === idea.id 
                                ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200' 
                                : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                            }`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-slate-800">{idea.title}</h4>
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                                            {idea.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-snug">{idea.description}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setActiveIdeaId(idea.id);
                                        onGenerateDevPrompt(idea);
                                    }}
                                    disabled={loadingDevPrompt}
                                    className="shrink-0 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md border border-indigo-100 transition-colors disabled:opacity-50"
                                >
                                    {loadingDevPrompt && activeIdeaId === idea.id ? 'Gerando...' : 'Criar App'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Result Area for Dev Prompt */}
                {generatedDevPrompt && (
                    <div className="mt-6 border-t border-indigo-100 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                Prompt de Desenvolvimento
                            </h4>
                            <button
                                onClick={() => handleCopy(generatedDevPrompt)}
                                className={`text-xs px-2 py-1 rounded border transition-colors ${
                                    copySuccess ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                                }`}
                            >
                                {copySuccess ? 'Copiado!' : 'Copiar Prompt'}
                            </button>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-xs text-indigo-100 font-mono whitespace-pre-wrap">{generatedDevPrompt}</pre>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="text-center py-6">
            <div className="mb-3 flex justify-center">
                <div className="bg-indigo-100 p-2 rounded-full">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                    </svg>
                </div>
            </div>
            <p className="text-sm text-indigo-400 italic mb-4">Ideias de Web Apps específicas para a cidade.</p>
            <button 
                onClick={onGenerateWebAppIdeas}
                className="inline-flex items-center gap-2 px-4 py-2 border border-indigo-200 shadow-sm text-sm font-medium rounded-full text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
                <span>Gerar Ideias</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
  }

  // Generic Renderer for Text-based Tabs
  const renderTextContent = (content: string, action: () => void, placeholder: string, icon: React.ReactNode) => {
    if (loadingInsight && !content) {
      return (
        <div className="flex gap-2 items-center text-sm text-indigo-700 py-8 justify-center">
          <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Analisando dados com Gemini AI...</span>
        </div>
      );
    }

    if (content) {
      return (
        <div className="relative group">
          <div className="prose prose-sm max-w-none text-indigo-900 leading-relaxed py-2 pr-8">
             <div className="whitespace-pre-line">{content}</div>
          </div>
          
          <button
            onClick={() => handleCopy(content)}
            className={`absolute top-0 right-0 p-1.5 rounded-md text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
              copySuccess 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-white text-slate-400 border-slate-200 hover:text-indigo-600 hover:border-indigo-200 opacity-60 group-hover:opacity-100'
            }`}
            title="Copiar texto"
          >
            {copySuccess ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Copiado!</span>
              </>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="text-center py-6">
        <div className="mb-3 flex justify-center">
            <div className="bg-indigo-100 p-2 rounded-full">
                {icon}
            </div>
        </div>
        <p className="text-sm text-indigo-400 italic mb-4">{placeholder}</p>
        <button 
          onClick={action}
          className="inline-flex items-center gap-2 px-4 py-2 border border-indigo-200 shadow-sm text-sm font-medium rounded-full text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <span>Gerar Análise</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          {data.nome}
          <span className="text-sm font-normal text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
            {data.uf}
          </span>
        </h2>
        <span className="text-xs font-mono text-slate-400">IBGE: {data.id}</span>
      </div>
      
      <div className="p-6">
        {/* Info Grid */}
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 mb-6">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">População</dt>
            <dd className="mt-1 text-lg text-slate-900 font-semibold">
                {data.populacao !== undefined 
                    ? data.populacao.toLocaleString('pt-BR') 
                    : <span className="text-slate-400 text-sm font-normal">...</span>}
            </dd>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Área (km²)</dt>
            <dd className="mt-1 text-lg text-slate-900 font-semibold">
                {data.area !== undefined 
                    ? data.area.toLocaleString('pt-BR') 
                    : <span className="text-slate-400 text-sm font-normal">...</span>}
            </dd>
          </div>
          
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
             <div>
                <dt className="text-xs font-medium text-slate-400">Microrregião</dt>
                <dd className="text-sm text-slate-700">{data.microrregiao}</dd>
             </div>
             <div>
                <dt className="text-xs font-medium text-slate-400">Mesorregião</dt>
                <dd className="text-sm text-slate-700">{data.mesorregiao}</dd>
             </div>
             <div>
                <dt className="text-xs font-medium text-slate-400">Região</dt>
                <dd className="text-sm text-slate-700">{data.regiao}</dd>
             </div>
          </div>
        </dl>

        {/* AI Insight Section */}
        <div className="rounded-xl border border-indigo-100 overflow-hidden mb-6 transition-all duration-300 hover:shadow-md">
          <div className="bg-indigo-50/50 border-b border-indigo-100 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
             <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-indigo-500">
                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576L8.279 5.044A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
              </svg>
              Gemini Insights
            </h3>
            <div className="flex space-x-1 bg-white p-0.5 rounded-lg border border-indigo-100 shadow-sm overflow-x-auto max-w-full">
                {(['summary', 'business', 'tourism', 'webapps'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                      activeTab === tab 
                        ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                        : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    {tab === 'summary' && 'Resumo'}
                    {tab === 'business' && 'Negócios'}
                    {tab === 'tourism' && 'Turismo'}
                    {tab === 'webapps' && 'Web Apps'}
                  </button>
                ))}
            </div>
          </div>
          
          <div className="p-4 bg-indigo-50/30 min-h-[140px] flex flex-col justify-center">
             {activeTab === 'webapps' ? renderWebAppContent() : (
               <>
                 {activeTab === 'summary' && renderTextContent(
                    insight, 
                    onGenerateSummary, 
                    "Gere um resumo executivo sobre este município.", 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                 )}
                 {activeTab === 'business' && renderTextContent(
                    businessTips, 
                    onGenerateBusiness, 
                    "Descubra oportunidades de negócios para PMEs.", 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 2.025v1.5c0 .414.336.75.75.75H4.5a.75.75 0 01-.75-.75v-1.5" />
                    </svg>
                 )}
                 {activeTab === 'tourism' && renderTextContent(
                    tourismHighlights, 
                    onGenerateTourism, 
                    "Conheça os principais pontos turísticos.", 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                 )}
               </>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataCard;