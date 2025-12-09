import { VisualizationPayload } from "../types";

export const extractVisualizationData = (text: string): VisualizationPayload | null => {
  // Regex to find JSON block enclosed in ```json ... ```
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonRegex);

  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.type && parsed.data) {
        return parsed as VisualizationPayload;
      }
    } catch (e) {
      console.warn("Failed to parse visualization JSON", e);
    }
  }
  return null;
};

export const cleanResponseText = (text: string): string => {
  // Removes the JSON block from the text so it doesn't show up twice
  return text.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
};