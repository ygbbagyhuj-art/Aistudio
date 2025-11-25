import { IBGEState, IBGEMunicipality } from '../types';

const BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades';

export const fetchStates = async (): Promise<IBGEState[]> => {
  try {
    // Ordering by name for better UX
    const response = await fetch(`${BASE_URL}/estados?orderBy=nome`);
    if (!response.ok) {
      throw new Error(`Error fetching states: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch states:', error);
    throw error;
  }
};

export const fetchMunicipalitiesByState = async (ufSigla: string): Promise<IBGEMunicipality[]> => {
  try {
    const response = await fetch(`${BASE_URL}/estados/${ufSigla}/municipios`);
    if (!response.ok) {
      throw new Error(`Error fetching municipalities for ${ufSigla}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch municipalities for ${ufSigla}:`, error);
    throw error;
  }
};

export const fetchMunicipalityDetails = async (id: number): Promise<IBGEMunicipality> => {
   try {
    const response = await fetch(`${BASE_URL}/municipios/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching municipality details: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch details for municipality ${id}:`, error);
    throw error;
  }
}

export const fetchMunicipalityIndicators = async (id: number): Promise<{ populacao?: number; area?: number }> => {
  try {
    // IBGE Aggregates API
    // 6579: Estimativas de População, Variable 9324: População residente estimada
    // 1301: Censo Demográfico 2010 (Território), Variable 615: Área territorial
    // Using 'periodos=-1' to fetch the latest available data
    
    const [popResponse, areaResponse] = await Promise.all([
      fetch(`https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/-1/variaveis/9324?localidades=N6[${id}]`),
      fetch(`https://servicodados.ibge.gov.br/api/v3/agregados/1301/periodos/-1/variaveis/615?localidades=N6[${id}]`)
    ]);

    const parseValue = async (res: Response) => {
        if (!res.ok) return undefined;
        const data = await res.json();
        try {
            // Structure: [ { resultados: [ { series: [ { serie: { "2021": "12345" } } ] } ] } ]
            const series = data[0]?.resultados[0]?.series[0]?.serie;
            if (!series) return undefined;
            const key = Object.keys(series)[0]; // Get the dynamic period key
            const value = series[key];
            return (value && value !== '-') ? parseFloat(value) : undefined;
        } catch (e) {
            return undefined;
        }
    };

    const populacao = await parseValue(popResponse);
    const area = await parseValue(areaResponse);

    return { populacao, area };
  } catch (error) {
    console.error("Error fetching indicators:", error);
    return {};
  }
};