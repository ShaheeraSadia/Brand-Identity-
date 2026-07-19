import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

  // Set body parser limits for base64 encoded image transfer
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Helper to lazy-initialize GenAI to avoid startup crashes if key is initially absent
  let aiInstance: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add it to your secrets or environment variables.");
    }
    if (!aiInstance) {
      aiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiInstance;
  }

  // 1. Generate Structured Brand Bible data
  app.post("/api/brand/generate-bible", async (req, res) => {
    try {
      const { companyName, mission, industry, targetAudience, customInstructions, brandPersonality = 50 } = req.body;
      const ai = getGenAI();

      const userPrompt = `Generate a comprehensive, premium Brand Bible for the following company:
- Company Name: ${companyName}
- Company Mission: ${mission}
- Industry: ${industry}
- Target Audience: ${targetAudience}
- Brand Personality Slider Value: ${brandPersonality}% (where 0% is strictly Minimalist, Elegant, Serious, and Professional, and 100% is extremely Playful, Vibrant, Fun, and High-Energy. A value of 50% represents a balanced or versatile sweet spot. Adjust your typography choices, color palette vibrancy, and voice to match this specific point on the personality spectrum).
${customInstructions ? `- Custom Brand Style Requirements: ${customInstructions}` : ""}

Make sure the color palette contains exactly 5 highly cohesive, professional, modern hex colors matching the brand's aesthetic and personality target. Write detailed strategic notes for how to use each color. Pair two Google Fonts perfectly (one for headers, one for body) to establish a distinctive typography personality. Provide a highly descriptive prompt for generating a vector-style primary logo.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: "You are an elite Brand Identity Director and Chief Designer. You craft highly specific, visually stunning, cohesive brand specifications for modern businesses. Avoid generic designs. Your output must be precise and match the requested JSON schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              companyName: { type: Type.STRING },
              mission: { type: Type.STRING },
              industry: { type: Type.STRING },
              targetAudience: { type: Type.STRING },
              brandKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              brandVoice: {
                type: Type.OBJECT,
                description: "Detailed brand voice, tone, and copywriting guidelines.",
                properties: {
                  tone: { type: Type.STRING, description: "A descriptive synthesis of the brand tone, e.g., 'Authoritative, clear, and educational yet highly empathetic.'" },
                  personalityKeywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 core brand voice keywords representing the brand's persona (e.g. ['Empathetic', 'Confident', 'Direct'])"
                  },
                  doVoiceRules: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 copywriting directives on what to do (e.g., ['Keep sentences active and short', 'Address the reader with warmth'])"
                  },
                  dontVoiceRules: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 copywriting limits or style violations (e.g., ['Do not use salesy jargon', 'Avoid sounding dry or robotic'])"
                  },
                  samplePhrases: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "2-3 short brand copy examples or slogans demonstrating this voice."
                  }
                },
                required: ["tone", "personalityKeywords", "doVoiceRules", "dontVoiceRules", "samplePhrases"]
              },
              logoPrompt: { 
                type: Type.STRING, 
                description: "A highly descriptive, creative prompt for an AI image generator to produce a stunning, professional vector logo/mark for this brand. The prompt should specify clean graphic shapes, specific branding colors, solid flat background, premium minimal 2D layout, high-end vector art style. MUST NOT include text, letters, frame borders, or mockups. Do NOT use quotes around colors."
              },
              secondaryMarks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Three distinct visual concepts or symbols that serve as secondary brand elements or patterns."
              },
              colorPalette: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hex: { type: Type.STRING, description: "6-character hex code starting with # (e.g., #2A4D69)" },
                    name: { type: Type.STRING, description: "Creative, evocative color name (e.g., 'Ethereal Forest', 'Deep Charcoal', 'Golden Ray')" },
                    role: { type: Type.STRING, description: "Role in the design system, one of: 'Primary', 'Secondary', 'Accent', 'Dark Neutral', 'Light Neutral'" },
                    usageNote: { type: Type.STRING, description: "Detailed design direction on when and how to apply this color (e.g., 'Use for body text to maintain eye-comfort', 'Apply sparingly as a highlight on high-priority action buttons')" }
                  },
                  required: ["hex", "name", "role", "usageNote"]
                }
              },
              typography: {
                type: Type.OBJECT,
                properties: {
                  headerFont: { type: Type.STRING, description: "A Google Font name for headings, e.g., 'Space Grotesk', 'Outfit', 'Playfair Display', 'Clash Display', 'Cabinet Grotesk', 'Syne', 'Montserrat'" },
                  headerCategory: { type: Type.STRING, description: "Sans-serif, Serif, Display, or Monospace" },
                  headerUsage: { type: Type.STRING, description: "Styling recommendations, e.g., uppercase, extra bold, wide tracking" },
                  bodyFont: { type: Type.STRING, description: "A highly legible Google Font for body copy, e.g., 'Inter', 'Plus Jakarta Sans', 'Lora', 'Merriweather', 'IBM Plex Sans'" },
                  bodyCategory: { type: Type.STRING, description: "Sans-serif, Serif, or Monospace" },
                  bodyUsage: { type: Type.STRING, description: "Styling recommendations for paragraphs, e.g., regular line-height, charcoal color" }
                },
                required: ["headerFont", "headerCategory", "headerUsage", "bodyFont", "bodyCategory", "bodyUsage"]
              },
              doGuidelines: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Three strict directives on what TO DO with the brand assets."
              },
              dontGuidelines: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Three strict directives on what NOT TO DO with the brand assets."
              },
              archetype: {
                type: Type.OBJECT,
                description: "The primary psychological brand archetype and radar scores",
                properties: {
                  primaryArchetype: { type: Type.STRING, description: "One of the 12 classic brand archetypes, e.g., 'The Creator', 'The Hero', 'The Sage', 'The Magician', 'The Explorer', 'The Ruler'" },
                  tagline: { type: Type.STRING, description: "A short, punchy brand archetype tagline/mantra" },
                  summary: { type: Type.STRING, description: "A detailed strategic analysis paragraph of how this archetype matches the brand's mission" },
                  attributes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 key character traits/attributes of this archetype (e.g. ['Visionary', 'Innovative', 'Expressive'])"
                  },
                  scores: {
                    type: Type.ARRAY,
                    description: "An array of exactly 6 brand archetype affinity scores (out of 100) to display on a radar chart. The archetypes are: 'The Creator', 'The Hero', 'The Sage', 'The Magician', 'The Explorer', 'The Ruler'. The primary archetype must have the highest score.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        archetype: { type: Type.STRING },
                        score: { type: Type.INTEGER },
                        description: { type: Type.STRING }
                      },
                      required: ["archetype", "score", "description"]
                    }
                  }
                },
                required: ["primaryArchetype", "tagline", "summary", "scores", "attributes"]
              }
            },
            required: [
              "companyName", "mission", "industry", "targetAudience", 
              "brandKeywords", "brandVoice", "logoPrompt", "secondaryMarks", 
              "colorPalette", "typography", "doGuidelines", "dontGuidelines", "archetype"
            ]
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json(parsedData);
    } catch (error: any) {
      console.error("Error generating Brand Bible:", error);
      res.status(500).json({ error: error.message || "Failed to generate brand details." });
    }
  });

  // 1c. Generate Brand Archetype for existing legacy bibles
  app.post("/api/brand/generate-archetype", async (req, res) => {
    try {
      const { companyName, mission, industry, targetAudience } = req.body;
      const ai = getGenAI();

      const userPrompt = `You are an elite Brand Strategy Consultant and marketing psychologist.
Analyze the brand identity for:
- Company Name: ${companyName}
- Company Mission: ${mission}
- Industry: ${industry}
- Target Audience: ${targetAudience}

Determine their primary Brand Archetype (from the 12 standard archetypes: The Creator, The Hero, The Sage, The Magician, The Explorer, The Ruler, The Innocent, The Rebel, The Everyman, The Lover, The Jester, The Caregiver).
Provide:
1. Primary Archetype name
2. A catchy archetype brand tagline
3. A detailed strategic summary explaining how this archetype fits the brand
4. 3 specific attributes/character traits
5. Scores out of 100 for these 6 major archetypes for the radar chart: 'The Creator', 'The Hero', 'The Sage', 'The Magician', 'The Explorer', 'The Ruler'. Ensure the primary archetype matches one of these or is highly related, and has the highest score.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: "You are an elite Brand Strategy Consultant specializing in Jungian brand archetypes and strategic positioning. Your output must be highly professional and match the requested JSON schema exactly.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              primaryArchetype: { type: Type.STRING },
              tagline: { type: Type.STRING },
              summary: { type: Type.STRING },
              attributes: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              scores: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    archetype: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    description: { type: Type.STRING }
                  },
                  required: ["archetype", "score", "description"]
                }
              }
            },
            required: ["primaryArchetype", "tagline", "summary", "scores", "attributes"]
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json(parsedData);
    } catch (error: any) {
      console.error("Error generating brand archetype:", error);
      res.status(500).json({ error: error.message || "Failed to generate brand archetype." });
    }
  });

  // 1d. Generate Brand-Aligned CSS/SVG Repeating Pattern
  app.post("/api/brand/generate-pattern", async (req, res) => {
    try {
      const { companyName, mission, industry, targetAudience, colorPalette, brandPersonality = 50, stylePreference } = req.body;
      const ai = getGenAI();

      const colorsStr = colorPalette ? colorPalette.map((c: any) => `${c.name} (${c.hex}) - ${c.role}`).join(", ") : "No colors provided";

      const userPrompt = `You are an elite Brand Graphic Designer and UI/UX visual pattern expert.
Create a high-quality, custom repeating SVG background pattern for the company:
- Company Name: ${companyName}
- Company Mission: ${mission}
- Industry: ${industry}
- Target Audience: ${targetAudience}
- Color Palette to select colors from: ${colorsStr}
- Brand Personality Slider: ${brandPersonality}% (where 0% is strictly Minimalist/Professional, and 100% is Playful/Vibrant).
- Requested Pattern Style Preference: "${stylePreference || "Modern Geometric Grid"}"

Requirements for the generated SVG:
1. It MUST be a perfectly tileable/seamless repeating SVG pattern.
2. Ensure you use some of the colors from the color palette (refer to their exact hex codes).
3. The pattern should be subtle, so keep opacity values (using fill-opacity, stroke-opacity, or standard opacity) low (e.g. between 0.05 and 0.25) so it doesn't distract from text when used as a background.
4. Use standard SVG tags like <svg>, <rect>, <circle>, <path>, <polygon>, <g>, etc.
5. Provide a width, height, and viewBox (e.g., width="120" height="120" viewBox="0 0 120 120") on the main <svg> element.
6. The SVG must be clean, valid, standalone, and ready to render. Do NOT wrap it in Markdown or codeblocks in the property.

Provide:
1. A unique, creative name for this pattern design (patternName).
2. A description explaining why this design style and layout matches the brand's personality spectrum and values.
3. The raw, valid SVG markup string (svgMarkup).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: "You are an elite visual UI/UX designer and design system pattern architect. Your output must be highly professional and match the requested JSON schema exactly.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              patternName: { type: Type.STRING, description: "A creative name for the repeating background pattern (e.g. 'Nordic Bauhaus Waves', 'Quantum Minimal Grid')" },
              description: { type: Type.STRING, description: "Detailed strategic explanation of how this pattern layout, shapes, and densities represent the brand identity and the chosen personality level" },
              svgMarkup: { type: Type.STRING, description: "A valid, fully standalone, and tileable <svg> markup string. Must start with '<svg' and end with '</svg>'. No markdown formatting inside." }
            },
            required: ["patternName", "description", "svgMarkup"]
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json(parsedData);
    } catch (error: any) {
      console.error("Error generating brand pattern:", error);
      res.status(500).json({ error: error.message || "Failed to generate brand pattern." });
    }
  });

  // 1b. Shuffle Color Palette
  app.post("/api/brand/shuffle-palette", async (req, res) => {
    try {
      const { companyName, mission, industry, targetAudience, currentPalette, shuffleType } = req.body;
      const ai = getGenAI();

      const userPrompt = `You are an elite Color Theory expert and Brand Identity Director.
For the following company:
- Company Name: ${companyName}
- Company Mission: ${mission}
- Industry: ${industry}
- Target Audience: ${targetAudience}

The current 5-color design system is:
${JSON.stringify(currentPalette, null, 2)}

We want to generate a new cohesive 5-color palette that is a beautiful variation of this brand's aesthetic.
The requested shuffle style is: "${shuffleType || "alternative shades or complementary colors"}".

Generate a new, perfectly matched 5-color palette. Each color MUST have a hex code, a creative and evocative color name, a specific role (one of: 'Primary', 'Secondary', 'Accent', 'Dark Neutral', 'Light Neutral'), and a detailed usage direction. Make sure the 5 roles are distinct (having one of each role is ideal, or well balanced). Return the new palette matching the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: "You are an elite Brand Identity Director specializing in advanced color theory. You design high-end, highly cohesive, modern design color systems. Your output must match the requested JSON schema exactly.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              colorPalette: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hex: { type: Type.STRING, description: "6-character hex code starting with # (e.g., #2A4D69)" },
                    name: { type: Type.STRING, description: "Creative, evocative color name (e.g., 'Ethereal Forest', 'Deep Charcoal')" },
                    role: { type: Type.STRING, description: "Role in the design system, one of: 'Primary', 'Secondary', 'Accent', 'Dark Neutral', 'Light Neutral'" },
                    usageNote: { type: Type.STRING, description: "Detailed design direction on when and how to apply this color" }
                  },
                  required: ["hex", "name", "role", "usageNote"]
                }
              }
            },
            required: ["colorPalette"]
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json(parsedData);
    } catch (error: any) {
      console.error("Error shuffling palette:", error);
      res.status(500).json({ error: error.message || "Failed to shuffle palette." });
    }
  });

  // 1d. Generate Simplified Favicon from Primary Logo or Brand Specs
  app.post("/api/brand/generate-favicon", async (req, res) => {
    try {
      const { companyName, mission, industry, targetAudience, colorPalette, primaryLogo, faviconStyle = "Minimalist Icon Glyph" } = req.body;
      const ai = getGenAI();

      let promptText = `You are a world-class digital icon designer and vector branding specialist.
Your goal is to extract and generate a simplified, high-contrast visual favicon (web icon) for the following brand:
- Company Name: ${companyName}
- Company Mission: ${mission}
- Industry: ${industry}
- Target Audience: ${targetAudience}
- Brand Color Palette to choose colors from: ${colorPalette ? colorPalette.map((c: any) => `${c.name} (${c.hex}) - ${c.role}`).join(", ") : "No colors provided"}
- Requested Favicon Style: "${faviconStyle}"

About the requested style:
- "Minimalist Icon Glyph": A highly simplified, ultra-clean representation of the main graphical emblem or logo concept. No text.
- "Rounded Brand Symbol": The main symbol beautifully inscribed within a soft-cornered rounded square (squircle) background using contrasting brand colors.
- "Monogram / Lettermark": A beautiful, professionally crafted single-letter or two-letter monogram (e.g. the first letter of "${companyName}") styled elegantly using brand-aligned geometry.
- "Flat Geometric Silhouette": A high-contrast, iconic flat silhouette designed for instant recognition.

Requirements for the SVG:
1. It MUST be extremely clean, scalable, and legible at small sizes (16x16, 32x32, 48x48 pixels).
2. It MUST NOT contain any fine lines, small details, complex shadows, text, or busy elements.
3. Use a square aspect ratio (e.g., width="64" height="64" viewBox="0 0 64 64").
4. The background can be transparent (ideal for glyphs) or a solid brand color (ideal for rounded badges).
5. Ensure colors used are from the brand's palette (or standard black/white where necessary for high contrast).
6. Output a clean, valid, standalone SVG string. Do NOT wrap it in Markdown or codeblocks in the response property.

Please analyze the brand and any provided logo image to create this favicon.`;

      const contents: any[] = [];
      
      // If a primary logo is provided, add it as a multimodal part!
      if (primaryLogo && primaryLogo.startsWith("data:")) {
        const parts = primaryLogo.split(";base64,");
        if (parts.length === 2) {
          const mimeType = parts[0].split(":")[1];
          const data = parts[1];
          contents.push({
            parts: [
              {
                inlineData: {
                  mimeType,
                  data
                }
              },
              {
                text: promptText + "\n\nAn image of the brand's primary logo is attached. Simplify this logo's core graphical visual element to create the favicon."
              }
            ]
          });
        }
      }

      if (contents.length === 0) {
        contents.push(promptText);
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: "You are an elite vector icon designer and brand developer. You specialize in creating beautiful, tileable, and pixel-perfect SVG web favicons. Your output must be highly professional and match the requested JSON schema exactly.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              faviconName: { type: Type.STRING, description: "A creative name for this favicon design (e.g. 'Ascent S-Glyph', 'Aura Squircle Symbol')" },
              explanation: { type: Type.STRING, description: "Detailed strategy of how the logo was simplified and optimized for favicon render sizes (e.g. 16x16, 32x32)" },
              svgMarkup: { type: Type.STRING, description: "A valid, standalone SVG markup string. Must start with '<svg' and end with '</svg>'. No markdown formatting inside." }
            },
            required: ["faviconName", "explanation", "svgMarkup"]
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json(parsedData);
    } catch (error: any) {
      console.error("Error generating brand favicon:", error);
      res.status(500).json({ error: error.message || "Failed to generate brand favicon." });
    }
  });

  // 2. Generate Primary Logo Image
  app.post("/api/brand/generate-logo", async (req, res) => {
    try {
      const { prompt, size } = req.body;
      const ai = getGenAI();

      // size can be: "1K", "2K", "4K"
      const imageSize = ["1K", "2K", "4K"].includes(size) ? size : "1K";

      console.log(`Logo generation request using gemini-3-pro-image-preview, size: ${imageSize}`);

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: imageSize
          }
        }
      });

      let base64Image = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (base64Image) {
        res.json({ imageUrl: base64Image });
      } else {
        throw new Error("No image data found in the response parts.");
      }
    } catch (error: any) {
      console.error("Error in image generation:", error);
      res.status(500).json({ error: error.message || "Failed to generate logo image." });
    }
  });

  // 3. Multi-turn AI Chat with Brand Consultant
  app.post("/api/brand/chat", async (req, res) => {
    try {
      const { history, message, brandBible, selectedModel } = req.body;
      const ai = getGenAI();

      const modelName = selectedModel || "gemini-3.5-flash";

      let systemPrompt = "You are a highly perceptive, world-class Brand Strategy and Design Consultant. ";
      
      if (brandBible) {
        let voiceDetail = "";
        let targetTone = "helpful, premium, and professional";

        if (brandBible.brandVoice && typeof brandBible.brandVoice === "object") {
          const bv = brandBible.brandVoice;
          targetTone = bv.tone || targetTone;
          voiceDetail = `
- Tone Description: ${bv.tone}
- Verbal Personality Keywords: ${bv.personalityKeywords?.join(", ")}
- Writing Do's: ${bv.doVoiceRules?.join("; ")}
- Writing Don'ts: ${bv.dontVoiceRules?.join("; ")}
- Brand Copy Samples: ${bv.samplePhrases?.map((p: string) => `"${p}"`).join(" | ")}
`;
        } else {
          voiceDetail = brandBible.brandVoice || "";
          targetTone = voiceDetail || targetTone;
        }

        systemPrompt += `You are currently advising the company "${brandBible.companyName}" which operates in the "${brandBible.industry}" sector.
Their core company mission is: "${brandBible.mission}".
Their target audience is: "${brandBible.targetAudience}".

Here are the specific Brand Specifications they generated:
- Brand Voice Guidelines: ${voiceDetail}
- Core Keywords: ${brandBible.brandKeywords?.join(", ")}
- Typography Pairing: Header Font - ${brandBible.typography?.headerFont}, Body Font - ${brandBible.typography?.bodyFont}
- Color Palette: ${brandBible.colorPalette?.map((c: any) => `${c.name} (${c.hex}) - ${c.role}`).join(", ")}
- Dos: ${brandBible.doGuidelines?.join("; ")}
- Don'ts: ${brandBible.dontGuidelines?.join("; ")}

CRITICAL BRAND VOICE ADOPTION DIRECTIVE:
You MUST fully adopt and speak in this company's specific Brand Voice when responding to the user.
Specifically, your response tone must strictly follow: "${targetTone}".
If they have Writing Do's, incorporate them. If they have Writing Don'ts, avoid them strictly.
Endeavor to make your advice sound like it came straight from a writer working inside "${brandBible.companyName}".
However, always ensure you answer their underlying strategy questions with actual, professional insights and do not lose usefulness. Just let the expression and phrasing carry this voice naturally.`;
      } else {
        systemPrompt += "The user has not generated a Brand Bible yet. Encourage them to input their company name and mission to create their comprehensive Brand Bible, or assist them in brainstorm concepts, company names, or missions right now!";
      }

      // Convert the messages to format expected by @google/genai SDK
      const contents = history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      // Append latest user message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve consultant response." });
    }
  });

  // Serve Frontend & Start listening only if not running on Vercel as a Serverless function
  async function startServer() {
    if (process.env.VERCEL === "1") {
      // On Vercel, static files are handled natively by Vercel routing
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server started on port ${PORT}`);
    });
  }

  startServer();

  export default app;
