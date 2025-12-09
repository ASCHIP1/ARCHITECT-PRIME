import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { Message, ProjectContext } from "../types";

// The API key is injected at build time via vite.config.ts define
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const streamGeminiResponse = async (
  history: Message[],
  context: ProjectContext,
  onChunk: (text: string) => void,
  onComplete: (text: string) => void
) => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Convert history to Gemini format
    // We only take the last few turns to keep context manageable, or all if feasible.
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // Inject current project context into the latest message implicitly or as system context
    const contextString = `
      [CONTEXTO ATUAL DO PROJETO]
      Localização: ${context.location || "Não especificado"}
      Tipo de Projeto: ${context.projectType || "Não especificado"}
      Teto Orçamentário: ${context.budgetCap || "Não especificado"}
    `;

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.4, // Lower temperature for more analytical precision
      },
      history: chatHistory.slice(0, -1), // All except last user message
    });

    const lastUserMessage = history[history.length - 1].content;
    const fullMessage = `${contextString}\n\nUser Input: ${lastUserMessage}`;

    const result = await chat.sendMessageStream({
      message: fullMessage
    });

    let fullText = "";
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      const text = c.text;
      if (text) {
        fullText += text;
        onChunk(fullText);
      }
    }
    
    onComplete(fullText);

  } catch (error) {
    console.error("Gemini API Error:", error);
    onComplete("⚠️ Ocorreu um erro de conexão com o sistema ArchTec. Por favor, verifique sua chave de API ou tente novamente.");
  }
};