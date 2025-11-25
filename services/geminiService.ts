import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCityInsight = async (cityName: string, uf: string): Promise<string> => {
  if (!process.env.API_KEY) return "Chave de API não configurada.";

  try {
    const prompt = `Gere um resumo executivo, econômico e geográfico curto (máximo 1 parágrafo de 50 palavras) sobre a cidade de ${cityName} - ${uf}, Brasil. Foque em dados úteis para uma PME.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a análise.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao comunicar com o serviço de inteligência.";
  }
};

export const generateBusinessTips = async (cityName: string, uf: string, population?: number): Promise<string> => {
  if (!process.env.API_KEY) return "Chave de API não configurada.";

  try {
    const popInfo = population ? ` com população estimada de ${population} habitantes` : '';
    const prompt = `Liste 3 oportunidades de negócios ou setores promissores para Pequenas e Médias Empresas (PMEs) na cidade de ${cityName} - ${uf}${popInfo}. Seja direto e estratégico. Use bullet points.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Análise de negócios indisponível.";
  } catch (error) {
    console.error("Gemini API Error (Business):", error);
    return "Erro ao gerar dicas de negócios.";
  }
};

export const generateTourismHighlights = async (cityName: string, uf: string): Promise<string> => {
  if (!process.env.API_KEY) return "Chave de API não configurada.";

  try {
    const prompt = `Cite os 3 principais pontos turísticos ou aspectos culturais de ${cityName} - ${uf}. Se for uma cidade pequena, cite características regionais ou festas tradicionais. Resposta curta.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Guia turístico indisponível.";
  } catch (error) {
    console.error("Gemini API Error (Tourism):", error);
    return "Erro ao gerar guia turístico.";
  }
};

export const generateWebAppIdeas = async (cityName: string, uf: string, population?: number): Promise<string> => {
  if (!process.env.API_KEY) return "[]";

  try {
    const popInfo = population ? `considerando sua população de ${population} habitantes` : '';
    const prompt = `Atue como um consultor de tecnologia experiente.
    Gere 5 ideias de **Micro-SaaS ou Ferramentas Digitais** específicas para a cidade de ${cityName} - ${uf}, ${popInfo}.

    REGRAS RÍGIDAS:
    1. PROIBIDO SUGERIR MARKETPLACES (Ex: Nada de "Uber para X", "Conectar A com B").
    2. FOQUE em Ferramentas "Single-Player": Calculadoras, Geradores, Auditores, Dashboards, Ferramentas de Produtividade local.
    3. Retorne APENAS um JSON válido.
    
    O formato do JSON deve ser exatamente este array de objetos, sem markdown, sem crase:
    [
      {
        "id": 1,
        "title": "Nome do App",
        "category": "Categoria (ex: Agro, Varejo, Gestão)",
        "description": "Descrição curta da dor resolvida e funcionalidade principal."
      }
    ]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return response.text || "[]";
  } catch (error) {
    console.error("Gemini API Error (Web Apps):", error);
    return "[]";
  }
};

export const generateDevPrompt = async (appTitle: string, appDescription: string, cityName: string): Promise<string> => {
    if (!process.env.API_KEY) return "Chave de API não configurada.";
  
    try {
      const prompt = `Atue como um Arquiteto de Software Sênior e Product Manager.
      
      O usuário escolheu desenvolver a seguinte ferramenta para a cidade de ${cityName}:
      **Nome:** ${appTitle}
      **Descrição:** ${appDescription}
  
      Gere um **Prompt de Desenvolvimento Completo** (System Prompt) que o usuário possa copiar e colar no ChatGPT/Claude/Gemini para pedir que a IA programe essa ferramenta.
  
      O Prompt gerado deve conter claramente:
      1. **Contexto:** "Você é um Full Stack Developer..."
      2. **Objetivo:** Criar um MVP da ferramenta ${appTitle}.
      3. **Stack Tecnológica Sugerida:** (Prefira React, Tailwind, Supabase/Firebase se precisar de back, ou LocalStorage se for puramente front).
      4. **Lista de Funcionalidades (MVP):** 3 a 4 features essenciais.
      5. **Estrutura de Dados:** (Se houver banco de dados, sugira as tabelas/campos).
      6. **Passo a Passo:** Guia curto de implementação.
  
      Saída em formato Markdown limpo.`;
  
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });
  
      return response.text || "Erro ao gerar prompt de desenvolvimento.";
    } catch (error) {
      console.error("Gemini API Error (Dev Prompt):", error);
      return "Erro ao gerar prompt de desenvolvimento.";
    }
  };