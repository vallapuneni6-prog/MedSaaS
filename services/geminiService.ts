
import { GoogleGenAI, Type } from "@google/genai";

// Standard prompt for patient intake
export async function runIntakeAnalysis(symptoms: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following symptoms and provide a brief summary for a doctor: "${symptoms}"`,
    config: {
      systemInstruction: "You are a medical receptionist. Summarize the patient's concern professionally in 1-2 sentences for the doctor.",
    }
  });
  return response.text;
}

export async function generatePrescription(patientConcern: string, notes: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on patient concern: ${patientConcern} and doctor notes: ${notes}, suggest 1-2 common medications and general instructions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          medicines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                dosage: { type: Type.STRING },
                frequency: { type: Type.STRING },
                duration: { type: Type.STRING }
              }
            }
          },
          instructions: { type: Type.STRING }
        },
        required: ["medicines", "instructions"]
      }
    }
  });
  return JSON.parse(response.text);
}
