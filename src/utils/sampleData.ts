import { BrandBible } from '../types';

export const SAMPLE_BRAND_BIBLES: BrandBible[] = [
  {
    id: 'sample-lumina-clean-energy',
    companyName: 'Lumina Energy',
    mission: 'To empower citizens with hyper-efficient, clean solar energy subscriptions, delivering renewable power independence to every home.',
    industry: 'Clean Tech & Renewable Energy',
    targetAudience: 'Modern homeowners, eco-conscious families & tech early adopters',
    brandKeywords: ['Luminous', 'Sustainable', 'Architectural', 'Empowering', 'Precision'],
    brandVoice: {
      tone: 'Authoritative, optimistic, transparent, and quietly confident.',
      personalityKeywords: ['Clean', 'Forward-looking', 'Accessible', 'Precision-engineered'],
      aboutUsParagraph: 'Lumina Energy was founded on the belief that clean energy independence should be accessible, beautiful, and effortless for every modern home. Guided by our mission to deliver renewable solar power subscriptions, we pair architectural precision with mathematical clarity. By putting control directly into homeowners\' hands, we are quietly engineering a sustainable tomorrow.',
      doVoiceRules: [
        'Use active, empowering verbs when describing solar technology',
        'Highlight tangible cost and ecological benefits directly',
        'Maintain a warm, human-centric focus on family and community'
      ],
      dontVoiceRules: [
        'Avoid overly dense academic jargon without context',
        'Never sound alarmist or accusatory regarding conventional energy',
        'Don\'t use cheap sales slogans or pressure tactics'
      ],
      samplePhrases: [
        'Powering tomorrow from your own rooftop.',
        'Clean energy, engineered with mathematical clarity.',
        'Zero compromise. Pure performance.'
      ],
      metrics: [
        { attribute: 'Warmth', value: 85, description: 'Approachable and community-driven' },
        { attribute: 'Technical Precision', value: 90, description: 'Grounded in engineering excellence' },
        { attribute: 'Energy / Dynamism', value: 75, description: 'Forward-moving and optimistic' }
      ]
    },
    logoPrompt: 'Minimalist geometric solar icon logo with sunburst vector lines, dark slate background, ultra clean lineart',
    colorPalette: [
      { hex: '#0f172a', name: 'Deep Midnight Slate', role: 'Dark Neutral', usageNote: 'Primary dark background and high-contrast typography.' },
      { hex: '#0284c7', name: 'Photon Sky Blue', role: 'Primary', usageNote: 'Main brand accent, primary CTA buttons, and header highlights.' },
      { hex: '#10b981', name: 'Ecosystem Emerald', role: 'Secondary', usageNote: 'Sustainability badges, positive status indicators, and eco metrics.' },
      { hex: '#f59e0b', name: 'Solar Amber', role: 'Accent', usageNote: 'High-visibility callouts, notifications, and micro-interaction highlights.' },
      { hex: '#f8fafc', name: 'Pure Quartz White', role: 'Light Neutral', usageNote: 'Clean canvas backgrounds, card containers, and light borders.' }
    ],
    typography: {
      headerFont: 'Plus Jakarta Sans',
      headerCategory: 'Sans-serif',
      headerUsage: 'Use for all main display headings, page titles, and prominent metrics.',
      bodyFont: 'Inter',
      bodyCategory: 'Sans-serif',
      bodyUsage: 'Use for body paragraphs, documentation, card text, and UI controls.'
    },
    secondaryMarks: [
      'Solar Ray Concentric Ring Symbol',
      'Photon Wave Grid Badge',
      'Clean Tech Leaf Monogram'
    ],
    doGuidelines: [
      'Maintain generous negative space (at least 24px inner padding) on all branded surfaces.',
      'Always contrast Photon Sky Blue against Deep Midnight Slate or Pure Quartz for maximum AA readability.',
      'Keep vector icon line weights consistent at 2px stroke width.'
    ],
    dontGuidelines: [
      'Never stretch or warp the primary logomark proportions.',
      'Do not combine Solar Amber and Ecosystem Emerald on adjacent body text elements.',
      'Avoid placing complex photography directly beneath low-contrast body text.'
    ],
    createdAt: 'Just now (Sample)',
    brandPersonality: 35,
    archetype: {
      primaryArchetype: 'The Creator',
      tagline: 'Infinite Power, Cleanly Crafted.',
      summary: 'Lumina embodies The Creator archetype by rethinking energy infrastructure through elegant design and accessible technology.',
      scores: [
        { archetype: 'The Creator', score: 95, description: 'Driven by innovation and architectural vision.' },
        { archetype: 'The Sage', score: 82, description: 'Grounded in scientific accuracy and data transparency.' },
        { archetype: 'The Hero', score: 70, description: 'Empowering homeowners to champion clean energy.' },
        { archetype: 'The Explorer', score: 65, description: 'Pioneering new solar distribution networks.' },
        { archetype: 'The Magician', score: 60, description: 'Transforming sunlight into effortless home power.' },
        { archetype: 'The Ruler', score: 50, description: 'Setting new standards for renewable reliability.' }
      ],
      attributes: ['Architectural', 'Transparent', 'Eco-driven']
    },
    pattern: {
      patternName: 'Solar Grid Matrix',
      description: 'A precise, modern geometric grid representing distributed clean energy nodes.',
      svgMarkup: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="solar-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="1.5" fill="#0284c7" opacity="0.4" />
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0284c7" stroke-width="0.5" opacity="0.15" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#solar-grid)" />
</svg>`
    },
    favicon: {
      faviconName: 'Lumina Solar Core Mark',
      explanation: 'Sleek vector sunburst core optimized for high-visibility 32x32 favicon displays.',
      svgMarkup: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="16" fill="#0f172a"/>
  <circle cx="32" cy="32" r="14" fill="#0284c7"/>
  <circle cx="32" cy="32" r="8" fill="#f59e0b"/>
  <path d="M32 6V14M32 50V58M6 32H14M50 32H58" stroke="#0284c7" stroke-width="4" stroke-linecap="round"/>
</svg>`
    }
  },
  {
    id: 'sample-verdant-skincare',
    companyName: 'Verdant Organics',
    mission: 'To formulate pure, zero-toxin botanical skincare that nourishes skin health while preserving rainforest biodiversity.',
    industry: 'Organic Beauty & Skincare',
    targetAudience: 'Holistic wellness seekers, eco-conscious professionals & sensitive skin advocates',
    brandKeywords: ['Botanical', 'Serene', 'Zero-Toxin', 'Artisanal', 'Restic'],
    brandVoice: {
      tone: 'Gentle, soothing, deeply knowledgeable, and ethically transparent.',
      personalityKeywords: ['Serene', 'Pure', 'Earthy', 'Refined'],
      aboutUsParagraph: 'At Verdant Organics, we believe skincare is a sacred ritual of restoration and earth stewardship. We formulate pure, zero-toxin botanical elixirs harvested sustainably from wild rainforest canopies to nourish your skin health without compromise. Grounded in ethical transparency and clinical care, we invite you to pause, breathe deep, and let nature heal.',
      doVoiceRules: [
        'Emphasize cold-pressed wild botanical ingredients',
        'Speak with calmness and mindfulness',
        'Share clear clinical testing results with humility'
      ],
      dontVoiceRules: [
        'Never make hyperbolic claims about instant age-reversing anti-aging miracles',
        'Avoid harsh chemical jargon or fear-mongering',
        'Don\'t use aggressive, high-pressure urgency cues'
      ],
      samplePhrases: [
        'Nourishment straight from the botanical canopy.',
        'Pure Earth. Proven Science.',
        'Breathe deep. Let your skin restore.'
      ],
      metrics: [
        { attribute: 'Calmness', value: 95, description: 'Soothing and meditative voice' },
        { attribute: 'Organic Purity', value: 92, description: '100% natural ingredient transparency' },
        { attribute: 'Luxury Touch', value: 80, description: 'Subtle elegance without artificial fluff' }
      ]
    },
    logoPrompt: 'Botanical leaf line art icon, elegant serif typography mark, warm cream background, sage green accent',
    colorPalette: [
      { hex: '#1c3d2f', name: 'Deep Botanical Forest', role: 'Dark Neutral', usageNote: 'Primary dark background, elegant headings, and packaging caps.' },
      { hex: '#406e53', name: 'Verdant Sage Green', role: 'Primary', usageNote: 'Main brand mark, leaf icons, and primary action buttons.' },
      { hex: '#d4a373', name: 'Warm Terracotta Gold', role: 'Accent', usageNote: 'Secondary accents, product seals, and warm highlights.' },
      { hex: '#87a878', name: 'Wild Fern Moss', role: 'Secondary', usageNote: 'Organic certifications, natural ingredient badges, and subtle fills.' },
      { hex: '#fdfbf7', name: 'Alabaster Cream', role: 'Light Neutral', usageNote: 'Serene page backgrounds, card containers, and packaging labels.' }
    ],
    typography: {
      headerFont: 'Playfair Display',
      headerCategory: 'Serf',
      headerUsage: 'Use for elegant brand titles, product labels, and headline quotes.',
      bodyFont: 'Plus Jakarta Sans',
      bodyCategory: 'Sans-serif',
      bodyUsage: 'Use for ingredient descriptions, usage instructions, and body copy.'
    },
    secondaryMarks: [
      'Monoline Botanical Leaf Monogram',
      'Terracotta Certified Organic Stamp',
      'Earthy Canopy Line Pattern'
    ],
    doGuidelines: [
      'Use warm alabaster cream as default background to establish a soothing atmosphere.',
      'Pair Playfair Display for titles with clean Plus Jakarta Sans body copy for optimal legibility.',
      'Ensure botanical illustrations maintain continuous line weight.'
    ],
    dontGuidelines: [
      'Never use neon, artificial, or high-saturation synthetics.',
      'Avoid high-contrast stark black backgrounds.',
      'Do not crowd botanical illustrations with dense body text.'
    ],
    createdAt: 'Just now (Sample)',
    brandPersonality: 70,
    archetype: {
      primaryArchetype: 'The Lover',
      tagline: 'Pure Botanical Reverence.',
      summary: 'Verdant connects deeply with self-care, sensory elegance, and Earth stewardship.',
      scores: [
        { archetype: 'The Lover', score: 92, description: 'Focusing on sensory delight, self-care, and beauty.' },
        { archetype: 'The Sage', score: 85, description: 'Committed to ingredient purity and clean botanical formulation.' },
        { archetype: 'The Creator', score: 78, description: 'Crafting unique cold-pressed elixir blends.' },
        { archetype: 'The Hero', score: 60, description: 'Protecting wild rainforest habitats through ethical harvesting.' },
        { archetype: 'The Explorer', score: 55, description: 'Sourcing rare botanicals sustainably across the globe.' },
        { archetype: 'The Magician', score: 50, description: 'Harmonizing natural extracts for skin vitality.' }
      ],
      attributes: ['Serene', 'Zero-Toxin', 'Botanical']
    },
    pattern: {
      patternName: 'Botanical Canopy Monoline',
      description: 'An organic monoline pattern inspired by rainforest leaf veins.',
      svgMarkup: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="botanical-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 0 20 Q 20 0 40 20 T 80 20" fill="none" stroke="#406e53" stroke-width="0.8" opacity="0.2" />
      <circle cx="20" cy="20" r="2" fill="#d4a373" opacity="0.3" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#botanical-pattern)" />
</svg>`
    },
    favicon: {
      faviconName: 'Verdant Leaf Monogram',
      explanation: 'Botanical leaf motif encapsulated in a warm terracotta seal.',
      svgMarkup: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="16" fill="#1c3d2f"/>
  <path d="M32 12C20 22 18 42 32 52C46 42 44 22 32 12Z" fill="#406e53"/>
  <path d="M32 18V48" stroke="#d4a373" stroke-width="3" stroke-linecap="round"/>
</svg>`
    }
  }
];
