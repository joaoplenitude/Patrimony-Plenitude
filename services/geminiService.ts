import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

// Helper para obter a instância da IA apenas quando necessário.
// Isso evita crashes na inicialização se a API Key não estiver configurada no ambiente estático.
const getAI = () => {
  const apiKey = process.env.API_KEY || ''; // O polyfill no index.html garante que process.env existe
  if (!apiKey) {
    console.warn("API_KEY do Gemini não encontrada nas variáveis de ambiente.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeAsset = async (assetName: string): Promise<AIAnalysisResult> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analise o nome deste equipamento de TI/Escritório e sugira detalhes para cadastro de patrimônio: "${assetName}".`,
      config: {
        systemInstruction: "Você é um assistente especializado em gestão de ativos de TI. Retorne apenas JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "Categoria curta (ex: Notebook, Monitor, Periférico)",
            },
            suggestedDescription: {
              type: Type.STRING,
              description: "Uma descrição técnica profissional baseada no nome do modelo (max 20 palavras).",
            },
            estimatedValueTier: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High"],
              description: "Estimativa de valor do bem.",
            },
          },
          required: ["category", "suggestedDescription", "estimatedValueTier"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Asset Analysis Failed:", error);
    // Fallback defaults if AI fails
    return {
      category: "Outros",
      suggestedDescription: "Descrição não gerada automaticamente.",
      estimatedValueTier: "Low",
    };
  }
};

export const generateAuditReport = async (usersData: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Gere um breve relatório de auditoria resumido (max 2 parágrafos) sobre a distribuição de ativos baseada nestes dados brutos: ${usersData}`,
      config: {
        systemInstruction: "Seja formal e direto. Foque em quem tem mais equipamentos.",
      }
    });
    return response.text || "Não foi possível gerar o relatório.";
  } catch (error) {
    return "Erro ao conectar com a IA para auditoria. Verifique a API Key.";
  }
}