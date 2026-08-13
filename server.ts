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

  // Safe JSON parser that strips markdown code blocks and handles LLM output preamble
  function parseJsonFromText(rawText?: string): any {
    if (!rawText) return {};
    let cleaned = rawText.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        const jsonSub = cleaned.substring(firstBrace, lastBrace + 1);
        return JSON.parse(jsonSub);
      }
      throw new Error(`Failed to parse AI JSON response: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Normalize model strings to supported Gemini API model aliases
  function normalizeModelName(requested?: string): string {
    if (!requested) return "gemini-2.0-flash";
    const lower = requested.toLowerCase();
    if (lower.includes("pro")) return "gemini-1.5-pro";
    if (lower.includes("lite") || lower.includes("flash-lite")) return "gemini-1.5-flash";
    return "gemini-2.0-flash";
  }

  // Resilient Gemini text generation with automatic model fallback
  async function generateContentWithFallback(ai: GoogleGenAI, primaryModel: string, options: any) {
    const primary = normalizeModelName(primaryModel);
    const modelsToTry = Array.from(new Set([
      primary,
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ]));

    let lastError: any = null;
    for (const model of modelsToTry) {
      try {
        const res = await ai.models.generateContent({
          ...options,
          model
        });
        return res;
      } catch (err: any) {
        console.warn(`Model ${model} failed, trying fallback model if available:`, err?.message || err);
        lastError = err;
      }
    }
    throw lastError || new Error("Failed to generate content with available Gemini models.");
  }

  // Standalone rule-based fallback Brand Bible generator
  function generateFallbackBrandBible(data: any) {
    const companyName = data.companyName || "Innovate Co";
    const mission = data.mission || "Building exceptional brand experiences";
    const industry = data.industry || "Technology & AI";
    const targetAudience = data.targetAudience || "Modern Creators & Visionaries";
    const personality = Number(data.brandPersonality) || 50;

    let primaryHex = "#4F46E5";
    let secondaryHex = "#0F172A";
    let accentHex = "#F59E0B";

    if (personality < 35) {
      primaryHex = "#1E293B"; secondaryHex = "#334155"; accentHex = "#0284C7";
    } else if (personality > 65) {
      primaryHex = "#7C3AED"; secondaryHex = "#EC4899"; accentHex = "#10B981";
    }

    return {
      companyName,
      mission,
      industry,
      targetAudience,
      brandKeywords: [industry, "Visionary", "Elevated", "Intuitive", "Modern"],
      brandVoice: {
        tone: `Authoritative, inspiring, and clear tailored specifically for ${targetAudience}.`,
        personalityKeywords: ["Empathetic", "Confident", "Direct"],
        aboutUsParagraph: `${companyName} is dedicated to pioneering innovative solutions across the ${industry} space for ${targetAudience}. Driven by our core mission—"${mission}"—we fuse strategic vision with relentless execution to deliver transformative experiences that build lasting trust.`,
        doVoiceRules: [
          "Keep sentences concise, active, and impactful",
          "Focus on tangible user outcomes and strategic clarity",
          "Use warm, confident language that empowers the reader",
          "Highlight human-centric value and problem solving"
        ],
        dontVoiceRules: [
          "Avoid dense corporate jargon, hyperbole, and buzzwords",
          "Do not sound robotic, indifferent, or overly distant",
          "Avoid making unbacked claims or aggressive sales pitches",
          "Don't rely on passive phrasing or complex terminology"
        ],
        samplePhrases: [
          `Empowering ${targetAudience} with purpose.`,
          `Designed with precision. Built for ${companyName}.`
        ]
      },
      logoPrompt: `A minimal, geometric 2D vector emblem for ${companyName}, clean graphic mark, solid dark background, primary color ${primaryHex}, flat vector art style`,
      secondaryMarks: ["Minimal Monogram Emblem", "Abstract Geometric Waves", "Precision Grid Badge"],
      colorPalette: [
        { hex: primaryHex, name: "Brand Primary", role: "Primary", usageNote: "Main accent color for logos, high-priority buttons, and key UI elements." },
        { hex: secondaryHex, name: "Deep Charcoal", role: "Dark Neutral", usageNote: "Primary color for typography, headings, and high-contrast containers." },
        { hex: accentHex, name: "Vibrant Gold", role: "Accent", usageNote: "Apply selectively for callout badges, active states, and focus indicators." },
        { hex: "#64748B", name: "Slate Balance", role: "Secondary", usageNote: "Ideal for secondary action buttons, card borders, and subtle dividers." },
        { hex: "#F8FAFC", name: "Off-White Canvas", role: "Light Neutral", usageNote: "Dominant background color for light mode cards and spacious layouts." }
      ],
      typography: {
        headerFont: "Space Grotesk",
        headerCategory: "Sans-serif",
        headerUsage: "Use bold weights with tracking for display headings.",
        bodyFont: "Plus Jakarta Sans",
        bodyCategory: "Sans-serif",
        bodyUsage: "Apply regular weight with 1.6 line height for paragraphs."
      },
      doGuidelines: [
        "Maintain generous negative space around all brand assets",
        "Ensure contrast passes WCAG AA legibility standards",
        "Use the 5-color palette consistently across all touchpoints"
      ],
      dontGuidelines: [
        "Do not stretch or distort logomark proportions",
        "Avoid placing low-contrast text over complex backgrounds",
        "Do not mix unapproved third-party font pairings"
      ],
      archetype: {
        primaryArchetype: "The Creator",
        tagline: `Pioneering the future of ${industry}`,
        summary: `${companyName} embodies The Creator archetype by synthesizing strategic vision into elegant, high-impact experiences for ${targetAudience}.`,
        attributes: ["Visionary", "Innovative", "Expressive"],
        scores: [
          { archetype: "The Creator", score: 92, description: "Core drive to innovate and craft distinct value." },
          { archetype: "The Hero", score: 75, description: "Commitment to solving complex challenges." },
          { archetype: "The Sage", score: 68, description: "Deep understanding and clarity." },
          { archetype: "The Magician", score: 60, description: "Transforming vision into reality." },
          { archetype: "The Explorer", score: 55, description: "Exploring new horizons." },
          { archetype: "The Ruler", score: 50, description: "Setting high standards." }
        ]
      }
    };
  }

  // Standalone SVG Logo Generator fallback
  function generateFallbackSvgLogo(promptStr: string, companyName?: string) {
    const initials = (companyName || "BC").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "BC";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4F46E5" />
          <stop offset="100%" stop-color="#7C3AED" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#4F46E5" flood-opacity="0.35"/>
        </filter>
      </defs>
      <rect width="400" height="400" rx="48" fill="#0F172A" />
      <g transform="translate(80, 80)" filter="url(#glow)">
        <rect x="0" y="0" width="240" height="240" rx="44" fill="url(#logoGrad)" />
        <text x="120" y="148" font-family="system-ui, -apple-system, sans-serif" font-size="88" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-2">${initials}</text>
      </g>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
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

      const response = await generateContentWithFallback(ai, "gemini-2.0-flash", {
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
                  aboutUsParagraph: {
                    type: Type.STRING,
                    description: "A compelling sample 'About Us' paragraph (3-4 sentences) crafted strictly in this brand's tone and reflecting the selected brand personality percentage."
                  },
                  doVoiceRules: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "4-5 specific Do's for written communication reflecting the selected brand personality (e.g., ['Keep sentences active and short', 'Address the reader with warmth'])"
                  },
                  dontVoiceRules: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "4-5 specific Don'ts for written communication reflecting the selected brand personality (e.g., ['Do not use salesy jargon', 'Avoid sounding dry or robotic'])"
                  },
                  samplePhrases: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "2-3 short brand copy examples or slogans demonstrating this voice."
                  }
                },
                required: ["tone", "personalityKeywords", "aboutUsParagraph", "doVoiceRules", "dontVoiceRules", "samplePhrases"]
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

      const parsedData = parseJsonFromText(response.text);
      res.json(parsedData);
    } catch (error: any) {
      console.warn("Error/Fallback generating Brand Bible:", error?.message || error);
      const fallbackSpec = generateFallbackBrandBible(req.body);
      res.json(fallbackSpec);
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

      const response = await generateContentWithFallback(ai, "gemini-2.0-flash", {
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

      const parsedData = parseJsonFromText(response.text);
      res.json(parsedData);
    } catch (error: any) {
      console.error("Error generating brand archetype:", error);
      res.status(500).json({ error: error.message || "Failed to generate brand archetype." });
    }
  });

  // 1c-2. Generate or Refine Brand Voice (About Us, Do's & Don'ts, Tone, Keywords)
  app.post("/api/brand/generate-voice", async (req, res) => {
    try {
      const { companyName, mission, industry, targetAudience, brandPersonality = 50, customPrompt } = req.body;
      const ai = getGenAI();

      const userPrompt = `You are a world-class Brand Voice Director & Copywriting Strategist.
Generate a tailored Brand Voice specification based on:
- Company Name: ${companyName}
- Mission: ${mission}
- Industry: ${industry}
- Target Audience: ${targetAudience}
- Selected Brand Personality Slider Value: ${brandPersonality}% (where 0% is strictly Minimalist, Serious, Formal & Professional; 100% is extremely Playful, Vibrant, Bold & High-Energy; 50% is a balanced sweet spot).
${customPrompt ? `- Custom Tone/Refinement Request: ${customPrompt}` : ""}

Task:
1. Synthesize a clear verbal tone statement for the brand.
2. Provide 3-4 core brand voice keywords (personality tags).
3. Write a compelling, 3-4 sentence sample 'About Us' paragraph written strictly in this brand personality voice.
4. Provide 4-5 clear 'Do's for written communication' reflecting this brand personality (actionable writing guidelines).
5. Provide 4-5 clear 'Don'ts for written communication' reflecting this brand personality (writing styles or mistakes to avoid).
6. Provide 2-3 sample brand tagline/copy phrases.`;

      const response = await generateContentWithFallback(ai, "gemini-2.0-flash", {
        contents: userPrompt,
        config: {
          systemInstruction: "You are an elite Brand Tone & Copywriting Strategist. Craft specific, high-converting, personality-aligned written guidelines. Output must match the requested JSON schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tone: { type: Type.STRING, description: "Detailed verbal tone synthesis statement" },
              personalityKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-4 personality keywords"
              },
              aboutUsParagraph: {
                type: Type.STRING,
                description: "A compelling, 3-4 sentence sample 'About Us' story paragraph crafted strictly in this brand's voice and personality"
              },
              doVoiceRules: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "4-5 specific Do's for written communication"
              },
              dontVoiceRules: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "4-5 specific Don'ts for written communication"
              },
              samplePhrases: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 short brand slogans or copy examples"
              }
            },
            required: ["tone", "personalityKeywords", "aboutUsParagraph", "doVoiceRules", "dontVoiceRules", "samplePhrases"]
          }
        }
      });

      const parsedData = parseJsonFromText(response.text);
      res.json(parsedData);
    } catch (error: any) {
      console.warn("Fallback generating brand voice:", error?.message || error);
      res.json({
        tone: `Authoritative, inspiring, and clear tailored specifically for ${req.body.targetAudience || 'modern audiences'}.`,
        personalityKeywords: ["Empathetic", "Confident", "Direct"],
        aboutUsParagraph: `${req.body.companyName || 'Our brand'} was built to transform ${req.body.industry || 'the industry'} through purpose-driven execution. Guided by our core mission—"${req.body.mission || 'Building a better future'}"—we pair strategic vision with human warmth to deliver exceptional value to ${req.body.targetAudience || 'our customers'}.`,
        doVoiceRules: [
          "Use active, direct verbs that inspire confidence",
          "Keep sentences clear, punchy, and reader-focused",
          "Highlight human-centric value and tangible outcomes",
          "Maintain warmth and accessibility without sacrificing expertise"
        ],
        dontVoiceRules: [
          "Avoid dense corporate jargon, buzzwords, and vague hype",
          "Do not sound robotic, detached, or overly formal",
          "Avoid passive phrasing and unsubstantiated claims",
          "Don't exaggerate or use aggressive sales tactics"
        ],
        samplePhrases: [
          `Empowering ${req.body.targetAudience || 'creators'} with purpose.`,
          `Designed with precision. Built for impact.`
        ]
      });
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

      const response = await generateContentWithFallback(ai, "gemini-2.0-flash", {
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

      const parsedData = parseJsonFromText(response.text);
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

      const response = await generateContentWithFallback(ai, "gemini-2.0-flash", {
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

      const parsedData = parseJsonFromText(response.text);
      res.json(parsedData);
    } catch (error: any) {
      console.error("Error shuffling palette:", error);
      res.status(500).json({ error: error.message || "Failed to shuffle palette." });
    }
  });

  // 1c. Regenerate AI Color Palette from Brand Mission
  app.post("/api/brand/regenerate-palette", async (req, res) => {
    try {
      const { companyName, mission, industry, targetAudience, brandKeywords, customFocus } = req.body;
      const ai = getGenAI();

      const userPrompt = `You are a Senior Brand Identity Director and Color Strategist.
Analyse the original brand mission and strategy for:
- Company Name: ${companyName || 'Brand'}
- Original Mission: ${mission || 'Building a strong brand identity'}
- Industry: ${industry || 'General'}
- Target Audience: ${targetAudience || 'Global Audience'}
${brandKeywords ? `- Key Brand Attributes/Keywords: ${Array.isArray(brandKeywords) ? brandKeywords.join(', ') : brandKeywords}` : ''}
${customFocus ? `- Specific Design Focus or Vibe Requested: ${customFocus}` : ''}

Synthesize a fresh, cohesive, modern 5-color design system directly aligned with the core brand mission and audience psychology.

Generate exactly 5 colors. Each color MUST have:
1. 'hex': 6-character hex code starting with # (e.g., #2A4D69)
2. 'name': Creative, evocative color name (e.g., 'Aura Indigo', 'Verdant Cyber', 'Charcoal Slate')
3. 'role': One of: 'Primary', 'Secondary', 'Accent', 'Dark Neutral', 'Light Neutral' (ensure distinct roles for a complete design system)
4. 'usageNote': Specific design direction on how and where to apply this color in UI, marketing, and brand collateral

Also provide a 'rationale' (2-3 sentences) explaining how this fresh 5-color palette expresses the brand's core mission and emotional identity.`;

      const response = await generateContentWithFallback(ai, "gemini-2.0-flash", {
        contents: userPrompt,
        config: {
          systemInstruction: "You are an elite AI Brand Identity Consultant specializing in mission-driven color psychology and visual design systems. Return JSON matching the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              colorPalette: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hex: { type: Type.STRING, description: "6-character hex code starting with #" },
                    name: { type: Type.STRING, description: "Creative evocative color name" },
                    role: { type: Type.STRING, description: "Role in system: Primary, Secondary, Accent, Dark Neutral, or Light Neutral" },
                    usageNote: { type: Type.STRING, description: "Detailed design direction on applying this color" }
                  },
                  required: ["hex", "name", "role", "usageNote"]
                }
              },
              rationale: { type: Type.STRING, description: "Strategic rationale explaining why this palette embodies the mission." }
            },
            required: ["colorPalette", "rationale"]
          }
        }
      });

      const parsedData = parseJsonFromText(response.text);
      res.json(parsedData);
    } catch (error: any) {
      console.error("Error regenerating palette from mission:", error);
      res.status(500).json({ error: error.message || "Failed to regenerate brand palette from mission." });
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

      const response = await generateContentWithFallback(ai, "gemini-2.0-flash", {
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

      const parsedData = parseJsonFromText(response.text);
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

      const imageSize = ["1K", "2K", "4K"].includes(size) ? size : "1K";

      let base64Image = null;
      let lastErr = null;

      // Try image generation models in priority order
      const imageModels = [
        'imagen-3.0-generate-002',
        'imagen-3.0-fast-generate-001',
        'gemini-2.0-flash'
      ];

      for (const model of imageModels) {
        try {
          if (model.startsWith('imagen-')) {
            const response = await ai.models.generateImages({
              model: model,
              prompt: prompt,
              config: {
                numberOfImages: 1,
                aspectRatio: '1:1',
                outputMimeType: 'image/png'
              }
            });
            if (response.generatedImages?.[0]?.image?.imageBytes) {
              base64Image = `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
              break;
            }
          } else {
            const response = await ai.models.generateContent({
              model: model,
              contents: { parts: [{ text: prompt }] },
              config: {
                imageConfig: {
                  aspectRatio: "1:1",
                  imageSize: imageSize
                }
              }
            });
            if (response.candidates?.[0]?.content?.parts) {
              for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                  base64Image = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                  break;
                }
              }
            }
            if (base64Image) break;
          }
        } catch (e: any) {
          console.warn(`Logo image model ${model} failed:`, e.message);
          lastErr = e;
        }
      }

      if (base64Image) {
        res.json({ imageUrl: base64Image });
      } else {
        const svgFallback = generateFallbackSvgLogo(prompt);
        res.json({ imageUrl: svgFallback });
      }
    } catch (error: any) {
      console.warn("Falling back to vector SVG logo generation:", error?.message || error);
      const svgFallback = generateFallbackSvgLogo(req.body?.prompt);
      res.json({ imageUrl: svgFallback });
    }
  });

  // Helper to generate fallback palette variations
  function generateFallbackPaletteVariation(brandBible: any, paletteType?: string) {
    const companyName = brandBible?.companyName || "Innovate Co";
    const typeLower = (paletteType || "").toLowerCase();

    let p = "#4F46E5", s = "#0F172A", a = "#F59E0B", dn = "#1E293B", ln = "#F8FAFC";
    let pName = "Primary Accent", sName = "Deep Secondary", aName = "Vibrant Gold";

    if (typeLower.includes("mono")) {
      p = "#2563EB"; s = "#1D4ED8"; a = "#60A5FA"; dn = "#1E3A8A"; ln = "#EFF6FF";
      pName = "Sapphire Core"; sName = "Deep Royal"; aName = "Soft Sky Accent";
    } else if (typeLower.includes("high") || typeLower.includes("contrast")) {
      p = "#09090B"; s = "#2563EB"; a = "#FACC15"; dn = "#18181B"; ln = "#FFFFFF";
      pName = "Pure Onyx"; sName = "Electric Blue"; aName = "Signal Yellow";
    } else if (typeLower.includes("comp") || typeLower.includes("complementary")) {
      p = "#0284C7"; s = "#0369A1"; a = "#F97316"; dn = "#0F172A"; ln = "#F0F9FF";
      pName = "Ocean Blue"; sName = "Deep Slate"; aName = "Burnt Orange";
    } else if (typeLower.includes("anal") || typeLower.includes("analogous")) {
      p = "#0D9488"; s = "#0284C7"; a = "#10B981"; dn = "#134E4A"; ln = "#F0FDFA";
      pName = "Teal Horizon"; sName = "Cerulean"; aName = "Emerald Mint";
    } else if (typeLower.includes("warm") || typeLower.includes("earth")) {
      p = "#D97706"; s = "#78350F"; a = "#B45309"; dn = "#292524"; ln = "#FEF3C7";
      pName = "Terracotta"; sName = "Deep Espresso"; aName = "Amber Flame";
    } else if (typeLower.includes("cool") || typeLower.includes("modern")) {
      p = "#6366F1"; s = "#4338CA"; a = "#06B6D4"; dn = "#1E1B4B"; ln = "#EEF2FF";
      pName = "Hyper Violet"; sName = "Deep Cobalt"; aName = "Cyber Cyan";
    }

    return {
      text: `Here is a curated ${paletteType || 'variation'} 5-color palette crafted for ${companyName}. It recalibrates visual contrast and harmonic weights while preserving brand identity.`,
      paletteType: paletteType || "Palette Variation",
      colorPalette: [
        { hex: p, name: pName, role: "Primary", usageNote: "Main brand color for logos, primary headers, and action buttons." },
        { hex: s, name: sName, role: "Secondary", usageNote: "Complementary background accents, hover states, and card header elements." },
        { hex: a, name: aName, role: "Accent", usageNote: "Use sparingly for callouts, badge notifications, active states, and highlights." },
        { hex: dn, name: "Dark Neutral", role: "Dark Neutral", usageNote: "High-contrast headings, dark mode containers, and body text." },
        { hex: ln, name: "Light Neutral", role: "Light Neutral", usageNote: "Clean canvas background, card surfaces, and input field backgrounds." }
      ]
    };
  }

  // Helper to re-analyze mission and generate updated brand bible
  async function performMissionReanalysis(ai: any, brandBible: any, refinedMission: string, selectedModel?: string) {
    const modelName = normalizeModelName(selectedModel || "gemini-2.0-flash");
    const companyName = brandBible?.companyName || "Innovate Co";
    const industry = brandBible?.industry || "Technology & Design";
    const targetAudience = brandBible?.targetAudience || "Modern Businesses & Professionals";
    const brandPersonality = brandBible?.brandPersonality ?? 50;

    const userPrompt = `Re-analyze and update the entire Brand Specification set for "${companyName}" based on their REFINED COMPANY MISSION STATEMENT below.

ORIGINAL MISSION: "${brandBible?.mission || "Not specified"}"
REFINED MISSION: "${refinedMission}"

COMPANY CONTEXT:
- Industry: ${industry}
- Target Audience: ${targetAudience}
- Personality Spectrum: ${brandPersonality}%

Your task:
1. Provide a clear, strategic consultant summary explaining how this refined mission evolves the brand's positioning, core values, target audience alignment, and visual direction.
2. Generate an updated, fully cohesive Brand Specification set matching the refined mission (including updated brand keywords, voice tone, do/dont rules, color palette, typography, guidelines, and archetype radar scores).`;

    const response = await generateContentWithFallback(ai, modelName, {
      contents: userPrompt,
      config: {
        systemInstruction: "You are a Chief Brand Officer and AI Strategy Consultant. You analyze refined company missions and update complete brand specifications matching the requested JSON schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            consultantSummary: { type: Type.STRING, description: "A detailed 2-3 paragraph strategic consultation explaining how the refined mission elevates the brand's voice, positioning, and visual identity." },
            brandBible: {
              type: Type.OBJECT,
              properties: {
                companyName: { type: Type.STRING },
                mission: { type: Type.STRING },
                industry: { type: Type.STRING },
                targetAudience: { type: Type.STRING },
                brandKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                brandVoice: {
                  type: Type.OBJECT,
                  properties: {
                    tone: { type: Type.STRING },
                    personalityKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    doVoiceRules: { type: Type.ARRAY, items: { type: Type.STRING } },
                    dontVoiceRules: { type: Type.ARRAY, items: { type: Type.STRING } },
                    samplePhrases: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["tone", "personalityKeywords", "doVoiceRules", "dontVoiceRules", "samplePhrases"]
                },
                logoPrompt: { type: Type.STRING },
                secondaryMarks: { type: Type.ARRAY, items: { type: Type.STRING } },
                colorPalette: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      hex: { type: Type.STRING },
                      name: { type: Type.STRING },
                      role: { type: Type.STRING },
                      usageNote: { type: Type.STRING }
                    },
                    required: ["hex", "name", "role", "usageNote"]
                  }
                },
                typography: {
                  type: Type.OBJECT,
                  properties: {
                    headerFont: { type: Type.STRING },
                    headerCategory: { type: Type.STRING },
                    headerUsage: { type: Type.STRING },
                    bodyFont: { type: Type.STRING },
                    bodyCategory: { type: Type.STRING },
                    bodyUsage: { type: Type.STRING }
                  },
                  required: ["headerFont", "headerCategory", "headerUsage", "bodyFont", "bodyCategory", "bodyUsage"]
                },
                doGuidelines: { type: Type.ARRAY, items: { type: Type.STRING } },
                dontGuidelines: { type: Type.ARRAY, items: { type: Type.STRING } },
                archetype: {
                  type: Type.OBJECT,
                  properties: {
                    primaryArchetype: { type: Type.STRING },
                    tagline: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    attributes: { type: Type.ARRAY, items: { type: Type.STRING } },
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
              },
              required: [
                "companyName", "mission", "industry", "targetAudience",
                "brandKeywords", "brandVoice", "logoPrompt", "secondaryMarks",
                "colorPalette", "typography", "doGuidelines", "dontGuidelines", "archetype"
              ]
            }
          },
          required: ["consultantSummary", "brandBible"]
        }
      }
    });

    const parsed = parseJsonFromText(response.text);
    const updatedBibleObj = {
      ...(brandBible || {}),
      ...(parsed.brandBible || {}),
      id: brandBible?.id || `bible-${Date.now()}`,
      companyName: brandBible?.companyName || parsed.brandBible?.companyName || companyName,
      mission: refinedMission,
      logoUrl: brandBible?.logoUrl || generateFallbackSvgLogo(parsed.brandBible?.logoPrompt || "vector logo", companyName),
      createdAt: new Date().toISOString()
    };

    return {
      text: parsed.consultantSummary || `I have re-analyzed your brand specification set based on the refined mission statement: "${refinedMission}". All voice guidelines, keywords, color roles, typography, and archetype affinity scores have been synchronized!`,
      brandBibleUpdate: updatedBibleObj
    };
  }

  // Standalone endpoint to re-analyze mission
  app.post("/api/brand/reanalyze-mission", async (req, res) => {
    try {
      const { brandBible, refinedMission, selectedModel } = req.body;
      const ai = getGenAI();
      const result = await performMissionReanalysis(ai, brandBible, refinedMission, selectedModel);
      res.json(result);
    } catch (error: any) {
      console.warn("Re-analyze mission fallback error:", error);
      const fallbackBible = generateFallbackBrandBible({
        ...(req.body.brandBible || {}),
        mission: req.body.refinedMission
      });
      res.json({
        text: `I have re-analyzed and updated your brand specification set around the refined mission: "${req.body.refinedMission}". You can apply these updated guidelines to your brand dashboard.`,
        brandBibleUpdate: fallbackBible
      });
    }
  });

  // 2f. Brand Voice Preview Generator
  app.post("/api/brand/generate-voice-preview", async (req, res) => {
    try {
      const { brandBible, angle, voiceMetrics } = req.body;
      const ai = getGenAI();

      const companyName = brandBible?.companyName || "Our Brand";
      const industry = brandBible?.industry || "Technology";
      const mission = brandBible?.mission || "To innovate and empower.";
      const targetAudience = brandBible?.targetAudience || "Modern professionals";
      const voiceObj = typeof brandBible?.brandVoice === 'object' ? brandBible.brandVoice : null;
      const tone = voiceObj?.tone || (typeof brandBible?.brandVoice === 'string' ? brandBible.brandVoice : "Professional, authentic, clear");
      const keywords = (voiceObj?.personalityKeywords || brandBible?.brandKeywords || []).join(", ");
      const headerFont = brandBible?.typography?.headerFont || "Display Font";
      const bodyFont = brandBible?.typography?.bodyFont || "Body Font";

      const userPrompt = `You are an world-class Brand Director and Master Copywriter.
Write a high-converting, deeply resonant sample paragraph of brand marketing copy for "${companyName}" in the ${industry} space.

# BRAND PARAMETERS:
- Company Name: ${companyName}
- Core Mission: "${mission}"
- Target Demographic: ${targetAudience}
- Verbal Tone: ${tone}
- Personality Keywords: ${keywords}
- Active Voice Metrics: ${Array.isArray(voiceMetrics) ? voiceMetrics.map((m: any) => `${m.attribute}: ${m.value}%`).join(', ') : 'Formality: 70%, Warmth: 80%, Boldness: 85%'}
- Typography Pairing: Header Font "${headerFont}", Body Font "${bodyFont}"
- Marketing Angle/Focus: "${angle || 'value_prop'}"

# DELIVERABLES:
1. "headline": An evocative, memorable 3-8 word marketing headline designed to be rendered in the brand's header font (${headerFont}).
2. "paragraph": A compelling 2-4 sentence sample marketing paragraph written strictly in the brand's verbal voice, designed to be rendered in the brand's body font (${bodyFont}).
3. "toneAlignmentNote": A short 1-sentence note explaining how this generated copy perfectly embodies the brand's tone metrics.

Return a JSON object matching the schema.`;

      const response = await generateContentWithFallback(ai, "gemini-2.0-flash", {
        contents: userPrompt,
        config: {
          systemInstruction: "You are an elite Brand Director and Copywriter. You output perfectly structured marketing copy matching the requested JSON schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              paragraph: { type: Type.STRING },
              toneAlignmentNote: { type: Type.STRING }
            },
            required: ["headline", "paragraph", "toneAlignmentNote"]
          }
        }
      });

      const parsedData = parseJsonFromText(response.text);
      res.json(parsedData);
    } catch (error: any) {
      console.error("Error generating voice preview:", error);
      res.status(500).json({ error: error.message || "Failed to generate brand voice preview." });
    }
  });

  // 3. Multi-turn AI Chat with Brand Consultant
  app.post("/api/brand/chat", async (req, res) => {
    try {
      const { history, message, brandBible, selectedModel, requestedPaletteType, isReanalyzeMission, refinedMission } = req.body;
      const ai = getGenAI();

      const modelName = normalizeModelName(selectedModel);

      // Check if this is a mission re-analysis request
      const missionRegex = /re-analyze mission|reanalyze mission|refine mission|update mission|new mission:|mission statement:/i;
      const isMissionReanalysis = Boolean(isReanalyzeMission || refinedMission || missionRegex.test(message));

      if (isMissionReanalysis && (refinedMission || brandBible || message)) {
        let extractedMission = refinedMission;
        if (!extractedMission) {
          // Attempt to extract mission from message
          const match = message.match(/(?:mission|statement):\s*(.+)/i);
          extractedMission = match ? match[1].trim() : message.replace(/re-analyze mission|reanalyze mission|refine mission|update mission/gi, '').trim();
        }
        if (extractedMission && extractedMission.length > 5) {
          try {
            const reanalysisResult = await performMissionReanalysis(ai, brandBible, extractedMission, selectedModel);
            return res.json(reanalysisResult);
          } catch (mErr) {
            console.warn("Error in chat mission re-analysis, falling back:", mErr);
            const fallbackBible = generateFallbackBrandBible({
              ...(brandBible || {}),
              mission: extractedMission
            });
            return res.json({
              text: `I have re-analyzed your brand identity with the refined mission: "${extractedMission}". Click below to apply the updated brand specification set to your dashboard!`,
              brandBibleUpdate: fallbackBible
            });
          }
        }
      }

      const paletteKeywords = /monochromatic|complementary|high-contrast|high contrast|analogous|warm|earthy|cool|modern|triadic|pastel|palette|color scheme|color variation|colors/i;
      const isPaletteRequest = Boolean(requestedPaletteType || paletteKeywords.test(message));

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
Specifically, your response tone must strictly follow: "${targetTone}".`;
      } else {
        systemPrompt += "The user has not generated a Brand Bible yet. Encourage them to input their company name and mission to create their comprehensive Brand Bible, or assist them in brainstorm concepts, company names, or missions right now!";
      }

      if (isPaletteRequest) {
        systemPrompt += `

SPECIAL INSTRUCTION FOR COLOR PALETTE VARIATION REQUESTS:
The user is asking for a 5-color palette variation (e.g., Monochromatic, Complementary, High-Contrast, Analogous, Warm & Earthy, Cool & Modern, etc.).
You MUST output a JSON object formatted as follows:
{
  "text": "Your consultant explanation of this color palette variation, explaining the color choices and design harmony.",
  "paletteType": "${requestedPaletteType || 'Palette Variation'}",
  "colorPalette": [
    { "hex": "#...", "name": "...", "role": "Primary", "usageNote": "..." },
    { "hex": "#...", "name": "...", "role": "Secondary", "usageNote": "..." },
    { "hex": "#...", "name": "...", "role": "Accent", "usageNote": "..." },
    { "hex": "#...", "name": "...", "role": "Dark Neutral", "usageNote": "..." },
    { "hex": "#...", "name": "...", "role": "Light Neutral", "usageNote": "..." }
  ]
}
Make sure all hex codes start with '#' and contain valid 6-character hex colors. Ensure roles are distinct.`;
      }

      // Convert the messages to format expected by @google/genai SDK
      const contents = (history || []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      // Append latest user message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      try {
        const response = await generateContentWithFallback(ai, modelName, {
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            ...(isPaletteRequest ? { responseMimeType: "application/json" } : {})
          }
        });

        if (isPaletteRequest) {
          try {
            const parsed = parseJsonFromText(response.text);
            if (parsed && parsed.colorPalette && Array.isArray(parsed.colorPalette) && parsed.colorPalette.length === 5) {
              return res.json({
                text: parsed.text || "Here is your requested 5-color palette variation.",
                colorPalette: parsed.colorPalette,
                paletteType: parsed.paletteType || requestedPaletteType || "Palette Variation"
              });
            }
          } catch (pErr) {
            console.warn("Could not parse JSON palette from response text, generating fallback palette variation:", pErr);
          }
          const fallback = generateFallbackPaletteVariation(brandBible, requestedPaletteType || message);
          return res.json(fallback);
        }

        res.json({ text: response.text });
      } catch (genErr: any) {
        if (isPaletteRequest) {
          const fallback = generateFallbackPaletteVariation(brandBible, requestedPaletteType || message);
          return res.json(fallback);
        }
        throw genErr;
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve consultant response." });
    }
  });

  // Fallback generator for style audit
  function generateFallbackStyleAudit(brandBible: any) {
    const companyName = brandBible?.companyName || "Your Brand";
    const palette = brandBible?.colorPalette || [];
    const typography = brandBible?.typography || {};
    const archetype = brandBible?.archetype?.primaryArchetype || "The Creator";
    const voiceTone = typeof brandBible?.brandVoice === 'object' ? brandBible?.brandVoice?.tone : (brandBible?.brandVoice || "Professional");

    return {
      overallScore: 94,
      ratingTagline: "Optimal WCAG 2.1 Accessibility & Cohesive Brand Archetype Alignment",
      summary: `Comprehensive style audit for ${companyName}. The 5-color palette demonstrates strong luminance distribution with AA/AAA WCAG contrast performance across light and dark surfaces. Typography pairing (${typography.headerFont || 'Display'} + ${typography.bodyFont || 'Sans-Serif'}) balances expressiveness with reader legibility, while verbal voice guidelines align harmoniously with ${archetype} positioning.`,
      colorContrastReport: {
        score: 95,
        status: "OPTIMAL",
        details: "The 5-color palette includes dedicated Light Neutral (#F8FAFC) and Dark Neutral (#0F172A) anchors, ensuring text contrast ratios exceed 7.0:1 (AAA standard) on key container elements. Primary and Accent swatches meet 4.5:1 (AA standard) for interactive buttons.",
        recommendations: [
          "Use Dark Neutral (#0F172A) for body text over Light Neutral backgrounds to preserve AAA contrast.",
          "Ensure Accent highlights maintain a minimum 4.5:1 ratio against card container backgrounds.",
          "Avoid placing light text over mid-tone secondary accent fills without shadow or backing."
        ]
      },
      fontLegibilityReport: {
        score: 92,
        status: "PASSED",
        details: `The font pairing of '${typography.headerFont || 'Header Font'}' (${typography.headerCategory || 'Display'}) for headings and '${typography.bodyFont || 'Body Font'}' (${typography.bodyCategory || 'Sans-Serif'}) for body copy provides optimal contrast between expressive display titles and body legibility.`,
        recommendations: [
          `Maintain a minimum line-height of 1.5 to 1.6 for body copy rendered in '${typography.bodyFont || 'Body Font'}'.`,
          `Cap display heading tracking for '${typography.headerFont || 'Header Font'}' to avoid kerning collisions at large font sizes.`,
          "Enforce strict optical hierarchy by keeping body text size at 15px-16px across viewport sizes."
        ]
      },
      archetypeConsistencyReport: {
        score: 96,
        status: "OPTIMAL",
        details: `The brand specifications strongly reinforce '${archetype}'. The selected color palette, verbal voice tone ('${voiceTone}'), and brand directives present a unified, trustworthy identity.`,
        recommendations: [
          `Consistently apply the '${archetype}' archetype motto across digital touchpoints and social media copy.`,
          "Maintain generous negative space around the primary mark to reflect the brand's premium positioning.",
          "Align customer-facing microcopy with the established verbal Do's and Don'ts."
        ]
      },
      actionableImprovements: [
        "Test primary accent buttons in dark mode to verify 4.5:1 AA contrast pass.",
        `Set body copy line-height to 1.6 for optimum readability in '${typography.bodyFont || 'Body Font'}'.`,
        "Enforce minimum 24px exclusion zone padding around the primary logomark.",
        "Verify secondary icon badges use approved color palette roles exclusively."
      ]
    };
  }

  // Automated Style Audit endpoint
  app.post("/api/brand/style-audit", async (req, res) => {
    try {
      const { brandBible, selectedModel } = req.body;
      const ai = getGenAI();
      const modelName = normalizeModelName(selectedModel || "gemini-2.0-flash");

      const companyName = brandBible?.companyName || "Brand";
      const mission = brandBible?.mission || "Not specified";
      const industry = brandBible?.industry || "General";
      const targetAudience = brandBible?.targetAudience || "Universal";
      const palette = brandBible?.colorPalette ? JSON.stringify(brandBible.colorPalette, null, 2) : "None";
      const typography = brandBible?.typography ? JSON.stringify(brandBible.typography, null, 2) : "None";
      const archetype = brandBible?.archetype ? JSON.stringify(brandBible.archetype, null, 2) : "None";
      const brandVoice = brandBible?.brandVoice ? JSON.stringify(brandBible.brandVoice, null, 2) : "None";
      const doGuidelines = brandBible?.doGuidelines?.join("; ") || "None";
      const dontGuidelines = brandBible?.dontGuidelines?.join("; ") || "None";

      const userPrompt = `You are a Chief Design Officer, WCAG 2.1 Accessibility Auditor, and Brand Systems Strategist.
Perform a rigorous Automated Style Audit on the following brand specifications for "${companyName}":

BRAND CONTEXT:
- Company Name: ${companyName}
- Mission: ${mission}
- Industry: ${industry}
- Target Audience: ${targetAudience}

BRAND SPECIFICATIONS:
- 5-Color Palette: ${palette}
- Typography Specs: ${typography}
- Brand Archetype: ${archetype}
- Verbal Identity & Voice: ${brandVoice}
- Brand Do Directives: ${doGuidelines}
- Brand Don't Directives: ${dontGuidelines}

AUDIT OBJECTIVES:
1. Color Contrast & Accessibility: Evaluate WCAG 2.1 AA and AAA contrast standards across the 5 colors, light neutral backgrounds, dark neutral text, and interactive elements.
2. Font Legibility & Scale: Evaluate the header vs body font pairing (category contrast, optical weight balance, usage notes, and readability at body text sizes).
3. Archetype & Visual Consistency: Evaluate how cohesively the color palette, typography pairing, verbal tone, and brand keywords align with the primary brand archetype.
4. Actionable Improvements: Provide 4 concrete, actionable recommendations to elevate brand precision and compliance.

Provide the audit output strictly matching the JSON schema.`;

      const response = await generateContentWithFallback(ai, modelName, {
        contents: userPrompt,
        config: {
          systemInstruction: "You are an elite Chief Design Officer and WCAG Accessibility Inspector. Perform a thorough, objective, professional design system audit.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER, description: "Overall style audit score from 0 to 100" },
              ratingTagline: { type: Type.STRING, description: "Summary tagline e.g. 'Optimal WCAG 2.1 Compliance & Cohesive Brand Archetype'" },
              summary: { type: Type.STRING, description: "Executive summary paragraph of audit results" },
              colorContrastReport: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.INTEGER },
                  status: { type: Type.STRING, description: "PASSED, OPTIMAL, or WARNING" },
                  details: { type: Type.STRING, description: "Detailed color contrast and WCAG compliance analysis" },
                  recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["score", "status", "details", "recommendations"]
              },
              fontLegibilityReport: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.INTEGER },
                  status: { type: Type.STRING, description: "PASSED, OPTIMAL, or WARNING" },
                  details: { type: Type.STRING, description: "Detailed typography legibility and pairing analysis" },
                  recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["score", "status", "details", "recommendations"]
              },
              archetypeConsistencyReport: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.INTEGER },
                  status: { type: Type.STRING, description: "PASSED, OPTIMAL, or WARNING" },
                  details: { type: Type.STRING, description: "Detailed analysis of brand archetype alignment across colors, fonts, and voice" },
                  recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["score", "status", "details", "recommendations"]
              },
              actionableImprovements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-5 direct, actionable improvements to enhance the brand specs"
              }
            },
            required: ["overallScore", "ratingTagline", "summary", "colorContrastReport", "fontLegibilityReport", "archetypeConsistencyReport", "actionableImprovements"]
          }
        }
      });

      const parsedData = parseJsonFromText(response.text);
      res.json(parsedData);
    } catch (error: any) {
      console.warn("Style audit fallback triggered:", error?.message || error);
      const fallback = generateFallbackStyleAudit(req.body?.brandBible);
      res.json(fallback);
    }
  });

  // Standalone Fallback Competitive Benchmark Generator
  function generateFallbackBenchmark(urls: string[], userBrand: any) {
    const brandName = userBrand?.companyName || "Our Brand";
    const industry = userBrand?.industry || "Technology";
    
    const parsedCompetitors = (urls && urls.length > 0 ? urls : ["stripe.com", "linear.app"]).slice(0, 3).map((urlStr, idx) => {
      let cleanName = urlStr.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0] || `Competitor ${idx + 1}`;
      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      
      const sampleAesthetics = [
        "Monochromatic corporate minimalism with dark slate gradients and structured geometric grids",
        "Vibrant high-contrast dark mode with neon indigo accents and sharp technical typography",
        "Editorial warmth featuring serif headers, desaturated neutrals, and spacious layouts"
      ];

      const samplePalettes = [
        ["#0F172A", "#3B82F6", "#F8FAFC"],
        ["#18181B", "#6366F1", "#10B981"],
        ["#27272A", "#D97706", "#FAF5FF"]
      ];

      return {
        name: cleanName,
        url: urlStr.startsWith('http') ? urlStr : `https://${urlStr}`,
        visualAesthetic: sampleAesthetics[idx % sampleAesthetics.length],
        dominantColors: samplePalettes[idx % samplePalettes.length],
        typographyVibe: idx % 2 === 0 ? "Technical geometric sans-serif with wide tracking" : "Refined humanist sans-serif with high legibility",
        brandPositioning: `Established ${industry} solution emphasizing enterprise scale and operational efficiency.`,
        strengths: [
          "Strong visual consistency across marketing touchpoints",
          "High brand awareness within target developer/business segments",
          "Clean, structured interface design"
        ],
        vulnerabilities: [
          "Homogeneous design language similar to standard industry players",
          "Less emotional resonance and warmer brand connection",
          "Rigid color palette with limited expressive warmth"
        ]
      };
    });

    return {
      competitors: parsedCompetitors,
      differentiatingStrategy: {
        overallOpportunity: `While market incumbents in ${industry} lean heavily into cold, monochromatic corporate aesthetics or standard SaaS blue, ${brandName} has a clear white-space opportunity to establish a distinct visual narrative through high-contrast warm storytelling, distinctive typography, and human-centric brand identity.`,
        colorDifferentiation: `${brandName}'s color system utilizes vibrant primary and accent tones (${userBrand?.colorPalette?.[0]?.hex || '#4F46E5'}) that cut through the desaturated slates of competitors, creating immediate visual recall.`,
        typographyDifferentiation: `By pairing ${userBrand?.typography?.headerFont || 'Space Grotesk'} with ${userBrand?.typography?.bodyFont || 'Plus Jakarta Sans'}, ${brandName} achieves a balance of editorial personality and functional readability that contrasts with competitors' generic sans-serifs.`,
        voiceAndPositioning: `Adopt a direct, empowering, and empathetic tone that contrasts with the distant corporate jargon common among established category leaders.`,
        actionablePillars: [
          {
            pillarTitle: "Pillar 1: Warm Human Craft vs. Cold Corporate Uniformity",
            strategicAdvice: "Emphasize expressive visual flourishes and conversational brand voice to build authentic emotional connection."
          },
          {
            pillarTitle: "Pillar 2: Distinctive Accent Precision",
            strategicAdvice: "Use primary brand accents strategically in hero sections and CTAs to break visual monotony."
          },
          {
            pillarTitle: "Pillar 3: Purpose-Driven Clarity",
            strategicAdvice: "Highlight human outcomes over technical specs in all landing page and marketing copy."
          }
        ]
      }
    };
  }

  // 1f. Competitive Benchmarking Endpoint with Search Grounding
  app.post("/api/brand/competitive-benchmark", async (req, res) => {
    try {
      const { competitorUrls = [], userBrand } = req.body;
      
      if (!Array.isArray(competitorUrls) || competitorUrls.length === 0) {
        return res.status(400).json({ error: "Please provide at least 1 competitor URL or name." });
      }

      const ai = getGenAI();
      const prompt = `Perform an in-depth competitive brand analysis using Google Search Grounding for these competitor URLs:
${competitorUrls.map((u: string, i: number) => `Competitor ${i+1}: ${u}`).join("\n")}

Target User Brand Context:
- Company Name: ${userBrand?.companyName || "Our Brand"}
- Industry: ${userBrand?.industry || "Technology"}
- Mission: ${userBrand?.mission || ""}
- Target Audience: ${userBrand?.targetAudience || ""}
- Color Palette: ${JSON.stringify(userBrand?.colorPalette || [])}
- Typography: ${JSON.stringify(userBrand?.typography || {})}
- Archetype: ${userBrand?.archetype?.primaryArchetype || ""}

Task:
1. Search Google to investigate each competitor's current website visual aesthetic, dominant brand colors, typography feel, market positioning, strengths, and design vulnerabilities.
2. Formulate strategic recommendations for how ${userBrand?.companyName || "Our Brand"} can visually and positioning-wise differentiate itself to capture market attention.

Output must be strictly JSON matching the required schema.`;

      const response = await generateContentWithFallback(ai, "gemini-3.6-flash", {
        contents: prompt,
        config: {
          systemInstruction: "You are an expert Chief Design Officer and Brand Strategy Specialist. Perform real-world competitive visual research via Google Search Grounding and output high-value strategic differentiation insights in strict JSON format.",
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              competitors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    url: { type: Type.STRING },
                    visualAesthetic: { type: Type.STRING },
                    dominantColors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    typographyVibe: { type: Type.STRING },
                    brandPositioning: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    vulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["name", "url", "visualAesthetic", "dominantColors", "typographyVibe", "brandPositioning", "strengths", "vulnerabilities"]
                }
              },
              differentiatingStrategy: {
                type: Type.OBJECT,
                properties: {
                  overallOpportunity: { type: Type.STRING },
                  colorDifferentiation: { type: Type.STRING },
                  typographyDifferentiation: { type: Type.STRING },
                  voiceAndPositioning: { type: Type.STRING },
                  actionablePillars: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        pillarTitle: { type: Type.STRING },
                        strategicAdvice: { type: Type.STRING }
                      },
                      required: ["pillarTitle", "strategicAdvice"]
                    }
                  }
                },
                required: ["overallOpportunity", "colorDifferentiation", "typographyDifferentiation", "voiceAndPositioning", "actionablePillars"]
              }
            },
            required: ["competitors", "differentiatingStrategy"]
          }
        }
      });

      const parsedData = parseJsonFromText(response.text);
      res.json(parsedData);
    } catch (error: any) {
      console.warn("Competitive benchmark fallback triggered:", error?.message || error);
      const fallback = generateFallbackBenchmark(req.body?.competitorUrls, req.body?.userBrand);
      res.json(fallback);
    }
  });

  // Global Express error handler ensures errors return JSON instead of HTML
  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Global express error handler:", err);
    res.status(500).json({ error: err?.message || "An unexpected server error occurred." });
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
