import React, { useState, useRef, useEffect } from 'react';
import './AIChat.css';

// ─── Agricultural Knowledge Engine ─────────────────────────────────────────────
const knowledgeBase = [
  // Crop Recommendations
  { keywords: ['crop', 'grow', 'plant', 'cultivat', 'sow', 'seed', 'season', 'kharif', 'rabi', 'zaid'],
    topic: 'crop_recommendation',
    response: `Based on current seasonal conditions, here are recommended crops:\n\nKharif Season (June-October):\n- Rice, Maize, Cotton, Soybean, Groundnut, Jute\n- Vegetables: Okra, Brinjal, Bitter Gourd, Bottle Gourd\n\nRabi Season (October-March):\n- Wheat, Barley, Mustard, Chickpea, Pea, Lentil\n- Vegetables: Tomato, Cauliflower, Cabbage, Spinach\n\nZaid Season (March-June):\n- Watermelon, Muskmelon, Cucumber, Moong\n\nRecommendation: Choose crops based on your soil type, water availability, and local market demand. Crop rotation helps maintain soil health.` },
  // Soil Management
  { keywords: ['soil', 'ph', 'nutrient', 'organic matter', 'compost', 'humus', 'loam', 'clay', 'sandy', 'soil health', 'soil test'],
    topic: 'soil_management',
    response: `Soil Health Management Guide:\n\n1. Soil Testing: Get your soil tested every 2-3 years from the nearest KVK (Krishi Vigyan Kendra) or agricultural university lab.\n\n2. Soil Types and Suitable Crops:\n- Alluvial Soil: Rice, Wheat, Sugarcane, Jute\n- Black Soil: Cotton, Soybean, Wheat, Groundnut\n- Red Soil: Millets, Groundnut, Tobacco\n- Laterite Soil: Tea, Coffee, Cashew, Coconut\n\n3. Improving Soil Health:\n- Add organic matter (FYM/compost 5-10 tonnes/hectare)\n- Practice green manuring with Dhaincha or Sunhemp\n- Maintain pH between 6.0-7.5 using lime (acidic) or gypsum (alkaline)\n- Use vermicomposting for nutrient-rich amendments\n\n4. Preventing Soil Degradation:\n- Avoid excessive tillage\n- Use crop rotation and cover crops\n- Maintain proper drainage` },
  // Disease Detection
  { keywords: ['disease', 'leaf', 'pest', 'detect', 'blight', 'wilt', 'rot', 'fungus', 'infect', 'curl', 'spot', 'rust', 'mildew', 'insect', 'bug'],
    topic: 'disease_detection',
    response: `Common Crop Disease Identification Guide:\n\n1. Leaf Curl (Tomato, Chilli):\n- Cause: Whitefly-transmitted virus (TYLCV)\n- Symptoms: Upward curling, yellowing, stunted growth\n- Treatment: Remove infected plants, control whitefly with Imidacloprid 17.8% SL (0.5ml/L), use yellow sticky traps\n\n2. Late Blight (Potato, Tomato):\n- Cause: Phytophthora infestans\n- Symptoms: Brown-black water-soaked lesions on leaves\n- Treatment: Spray Mancozeb 75% WP (2.5g/L) or Metalaxyl + Mancozeb (2.5g/L)\n\n3. Powdery Mildew (Cucurbits, Peas):\n- Cause: Erysiphe spp.\n- Symptoms: White powdery coating on leaves\n- Treatment: Spray Sulphur 80% WP (3g/L) or Karathane (1ml/L)\n\n4. Bacterial Wilt (Tomato, Brinjal):\n- Cause: Ralstonia solanacearum\n- Symptoms: Sudden wilting without yellowing\n- Treatment: No chemical cure; use resistant varieties, crop rotation, and solarization\n\nAlways consult local agricultural extension officers for accurate diagnosis.` },
  // Fertilizer Guidance
  { keywords: ['fertilizer', 'npk', 'urea', 'dap', 'potash', 'nutrient', 'manure', 'dose', 'application'],
    topic: 'fertilizer',
    response: `Fertilizer Application Guide:\n\n1. Understanding NPK:\n- N (Nitrogen): Promotes leaf/stem growth. Sources: Urea (46% N), Ammonium Sulphate (21% N)\n- P (Phosphorus): Root development and flowering. Sources: DAP (46% P2O5), SSP (16% P2O5)\n- K (Potassium): Fruit quality and disease resistance. Sources: MOP (60% K2O), SOP (50% K2O)\n\n2. Recommended Doses (per hectare):\n- Rice: 120:60:60 kg NPK/ha\n- Wheat: 120:60:40 kg NPK/ha\n- Tomato: 120:80:80 kg NPK/ha\n- Cotton: 120:60:60 kg NPK/ha\n\n3. Application Schedule:\n- Basal dose at planting: Full P, Full K, 1/3 N\n- First top-dressing (3-4 weeks): 1/3 N\n- Second top-dressing (6-8 weeks): 1/3 N\n\n4. Organic Alternatives:\n- Vermicompost: 2-3 tonnes/ha\n- FYM: 10-15 tonnes/ha\n- Neem cake: 250 kg/ha (pest deterrent + nutrient)\n\nNote: Always apply fertilizers based on soil test results for optimal efficiency.` },
  // Weather & Climate
  { keywords: ['weather', 'rain', 'forecast', 'climate', 'monsoon', 'drought', 'flood', 'temperature', 'humidity', 'irrigation'],
    topic: 'weather',
    response: `Weather-Based Agricultural Advisory:\n\n1. Pre-Monsoon (March-May):\n- Prepare fields for Kharif sowing\n- Repair irrigation channels and bunds\n- Complete summer ploughing for pest control\n\n2. Monsoon Season (June-September):\n- Monitor rainfall patterns; adjust irrigation accordingly\n- Ensure proper drainage to prevent waterlogging\n- Apply pesticides during dry spells only\n- Watch for fungal diseases during high-humidity periods\n\n3. Post-Monsoon (October-December):\n- Begin Rabi crop sowing\n- Utilize residual soil moisture\n- Apply basal fertilizers before sowing\n\n4. Winter (January-February):\n- Protect crops from frost using mulching or light irrigation\n- Schedule wheat top-dressing during this period\n\n5. Drought Management:\n- Use mulching to conserve soil moisture\n- Adopt drip/sprinkler irrigation\n- Choose drought-tolerant varieties (eg. Pusa Basmati 1509 for rice)\n\nCheck IMD (India Meteorological Department) forecasts regularly for planning field operations.` },
  // Harvest Timing
  { keywords: ['harvest', 'ready', 'mature', 'pick', 'yield', 'output', 'production'],
    topic: 'harvest',
    response: `Optimal Harvest Time Guide:\n\n1. Cereals:\n- Rice: Harvest when 80% grains are golden-yellow, moisture 20-22%\n- Wheat: Harvest when plant turns golden, grain is hard, moisture 14-16%\n- Maize: Harvest when husks are dry, kernels dent, moisture 20-25%\n\n2. Vegetables:\n- Tomato: Harvest at breaker stage (pink-red) for transport; fully red for local sale\n- Brinjal: Harvest when fruits are tender, glossy, and have reached full size\n- Okra: Pick every 2-3 days when pods are 6-8 cm, before they become fibrous\n- Potato: Harvest 15-20 days after plant tops die; allow skin to set\n\n3. Fruits:\n- Mango: Harvest when shoulder develops, color changes, specific gravity > 1.0\n- Banana: Harvest when fingers are plump, ridges round off (75-80% maturity)\n\n4. Post-Harvest:\n- Dry grains to 12-13% moisture for safe storage\n- Grade and sort produce by size and quality\n- Use proper packaging for transport to minimize damage\n- Store in cool, ventilated areas` },
  // Market Prices
  { keywords: ['price', 'market', 'sell', 'buy', 'cost', 'rate', 'mandi', 'trade', 'profit', 'income', 'revenue'],
    topic: 'market',
    response: `Market Intelligence for Farmers:\n\n1. Where to Check Prices:\n- eNAM Portal (enam.gov.in) for real-time mandi prices across India\n- Agmarknet portal for APMC market data\n- Kisan Suvidha App by Government of India\n\n2. Selling Strategies:\n- Compare prices across nearby mandis before selling\n- Consider direct-to-consumer sales through farmer markets or online platforms like this marketplace\n- Form Farmer Producer Organizations (FPOs) for better bargaining power\n- Use cold storage during low-price periods (if available)\n\n3. Contract Farming:\n- Consider tie-ups with processors and exporters for guaranteed prices\n- Verify contract terms carefully before agreement\n\n4. Value Addition:\n- Grading and packaging increases price by 15-30%\n- Processing (drying, grinding, pickling) can multiply value 3-5x\n- Organic certification can command 20-50% premium\n\n5. Government Support:\n- MSP (Minimum Support Price) available for 23 crops\n- PM-KISAN provides Rs.6000/year to eligible farmers` },
  // Organic Farming
  { keywords: ['organic', 'natural', 'chemical-free', 'bio', 'green', 'sustainable', 'eco', 'pesticide-free', 'certification'],
    topic: 'organic_farming',
    response: `Organic Farming Guide:\n\n1. Getting Started:\n- Transition period: 2-3 years to qualify for organic certification\n- During transition, gradually replace chemical inputs with organic alternatives\n- Maintain detailed records of all farm practices\n\n2. Organic Inputs:\n- Fertilizers: Vermicompost, FYM, green manure, bone meal, rock phosphate\n- Pest Control: Neem oil, Panchagavya, Dashaparni Ark, Trichoderma, Beauveria bassiana\n- Disease Control: Bordeaux mixture (permitted), Trichoderma viride, Pseudomonas fluorescens\n\n3. Key Practices:\n- Crop rotation and intercropping for pest management\n- Companion planting (eg. Marigold with vegetables)\n- Mulching for weed suppression and moisture conservation\n- Biological pest control using beneficial insects\n\n4. Certification:\n- Apply through agencies accredited by APEDA (eg. INDOCERT, OneCert, Lacon)\n- Cost: Rs.20,000-50,000 depending on farm size\n- PGS-India (Participatory Guarantee System) is a lower-cost group certification option\n\n5. Market Premium:\n- Certified organic produce sells at 20-50% premium\n- Growing demand in urban areas and export markets` },
  // Irrigation
  { keywords: ['water', 'irrigat', 'drip', 'sprinkler', 'pump', 'borewell', 'canal', 'flood', 'moisture'],
    topic: 'irrigation',
    response: `Irrigation Management Guide:\n\n1. Irrigation Methods (Efficiency):\n- Flood/Surface Irrigation: 30-40% efficiency\n- Sprinkler Irrigation: 60-70% efficiency\n- Drip Irrigation: 80-95% efficiency\n- Subsurface Drip: 90-95% efficiency\n\n2. Government Subsidies:\n- PMKSY (Pradhan Mantri Krishi Sinchai Yojana): Up to 55% subsidy on micro-irrigation for general farmers, 70% for SC/ST/Small farmers\n- Apply through state agriculture departments\n\n3. Water Conservation:\n- Mulching reduces water requirement by 20-30%\n- Raised bed planting saves 30-40% water in wheat\n- System of Rice Intensification (SRI) saves 30-50% water\n- Rainwater harvesting through farm ponds\n\n4. Critical Irrigation Stages:\n- Rice: Transplanting, tillering, panicle initiation, grain filling\n- Wheat: Crown root initiation (21 DAS), tillering, jointing, flowering, grain filling\n- Cotton: Flowering and boll development\n\n5. Scheduling:\n- Use tensiometers or feel method to determine irrigation timing\n- Morning irrigation is best to reduce evaporation losses` },
  // Seeds & Varieties
  { keywords: ['seed', 'variety', 'hybrid', 'gmo', 'trait', 'resistant', 'germination', 'high yield', 'improved'],
    topic: 'seeds',
    response: `Seed Selection and Management:\n\n1. Types of Seeds:\n- Open Pollinated: Can save seeds; moderate yield (eg. Pusa Ruby Tomato)\n- Hybrid (F1): High yield but cannot save seeds; buy fresh each season\n- Certified Seeds: Quality-assured from seed agencies (NSC, state seed corporations)\n\n2. High-Yielding Varieties:\n- Rice: Pusa Basmati 1121, Swarna, IR 64\n- Wheat: HD 2967, DBW 187, PBW 343\n- Tomato: Arka Rakshak, Pusa Hybrid 1\n- Okra: Arka Anamika, Pusa A4\n\n3. Seed Treatment:\n- Fungicide treatment: Thiram or Captan (2-3g/kg seed)\n- Bio-agent treatment: Trichoderma viride (4g/kg seed)\n- Rhizobium inoculation for pulses (200g/10kg seed)\n\n4. Seed Storage:\n- Dry seeds to 8-10% moisture for storage\n- Store in airtight containers with neem leaves\n- Cool, dry, dark storage area\n- Test germination before sowing (minimum 75-80%)\n\n5. Where to Buy:\n- State Seed Corporations\n- Krishi Vigyan Kendras (KVKs)\n- Authorized seed dealers with valid license` },
  // Government Schemes
  { keywords: ['scheme', 'government', 'subsidy', 'loan', 'insurance', 'pmfby', 'kisan', 'kcc', 'credit', 'grant', 'policy'],
    topic: 'government_schemes',
    response: `Key Government Schemes for Farmers:\n\n1. PM-KISAN:\n- Rs.6,000/year in 3 installments\n- Direct bank transfer\n- All landholding farmer families eligible\n\n2. PMFBY (Crop Insurance):\n- Premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial crops\n- Covers crop loss due to natural calamities, pests, diseases\n- Apply through banks, CSCs, or PMFBY portal\n\n3. Kisan Credit Card (KCC):\n- Short-term crop loans at 4% interest (with subvention)\n- Credit limit based on crop and land holding\n- Also covers fisheries and animal husbandry\n\n4. Soil Health Card Scheme:\n- Free soil testing and crop-specific recommendations\n- Available from KVKs and state soil testing labs\n\n5. PM Micro Irrigation Fund:\n- Subsidies of 55-70% on drip and sprinkler systems\n- Apply through state agriculture departments\n\n6. eNAM (National Agriculture Market):\n- Online trading portal connecting APMCs\n- Better price discovery for farmer produce\n\nVisit your nearest agriculture office or Common Service Centre for assistance with applications.` },
  // Equipment & Technology
  { keywords: ['equipment', 'tractor', 'machine', 'tool', 'implement', 'drone', 'technology', 'automation', 'smart farming', 'iot', 'sensor'],
    topic: 'technology',
    response: `Agricultural Technology and Equipment Guide:\n\n1. Precision Agriculture Tools:\n- Soil moisture sensors for irrigation scheduling\n- GPS-guided field mapping and variable rate application\n- Drone-based crop monitoring and spraying\n- Weather stations for micro-climate monitoring\n\n2. Farm Mechanization:\n- Rotavators for efficient land preparation\n- Seed drill/planters for precise sowing\n- Power sprayers and boom sprayers for uniform application\n- Combined harvesters for large-scale operations\n\n3. Custom Hiring Centers (CHC):\n- Rent equipment through CHCs established under Sub-Mission on Agricultural Mechanization (SMAM)\n- Saves capital investment for small and marginal farmers\n- Available at block/district level\n\n4. Digital Tools:\n- Kisan Suvidha App: Weather, market prices, expert advice\n- eNAM App: Online mandi trading\n- IFFCO Kisan App: Advisory services\n- Plantix App: AI-based disease identification from photos\n\n5. Subsidies on Equipment:\n- SMAM provides 40-50% subsidy on farm machinery\n- Additional state-level subsidies may apply\n- Apply through district agriculture office` },
  // Storage & Post-Harvest
  { keywords: ['storage', 'post-harvest', 'cold storage', 'warehouse', 'preservation', 'shelf life', 'loss', 'waste', 'pack', 'transport'],
    topic: 'storage',
    response: `Post-Harvest Management Guide:\n\n1. Reducing Post-Harvest Losses (Current avg: 15-25%):\n- Handle produce carefully during harvesting and transport\n- Pre-cool perishables immediately after harvest\n- Grade and sort by quality before storage/sale\n\n2. Storage Methods:\n- Hermetic/Airtight Storage Bags: For grains, reduces weevil damage without chemicals\n- Pusa Bin (IARI): Metal bin for 1-3 tonne grain storage\n- Cold Storage: For fruits, vegetables (2-8 degrees C depending on crop)\n- Controlled Atmosphere Storage: For apples, kiwi (long-term storage)\n\n3. Packaging Best Practices:\n- Use ventilated crates/boxes for fruits and vegetables\n- Avoid overfilling containers\n- Wrap individual fruits (mango, apple) in tissue paper\n- Use corrugated fibreboard boxes for transport\n\n4. Value Addition:\n- Drying: Solar dryers for tomato, chilli, herbs\n- Grading: Sort by size, color, maturity\n- Processing: Pulp, juice, jam, pickle, flour\n\n5. Government Support:\n- Gramin Bhandaran Yojana: Subsidy for rural godown construction (25-33%)\n- Pradhan Mantri Kisan SAMPADA: Grants for food processing units` },
  // Livestock & Dairy
  { keywords: ['cattle', 'cow', 'buffalo', 'dairy', 'milk', 'goat', 'sheep', 'poultry', 'chicken', 'livestock', 'animal', 'feed', 'veterinary'],
    topic: 'livestock',
    response: `Livestock and Dairy Management:\n\n1. Dairy Farming:\n- Top breeds: Gir, Sahiwal, Red Sindhi (indigenous); HF, Jersey (cross-bred)\n- Feed: 10-15 kg green fodder + 5-7 kg dry fodder + 2-3 kg concentrate per day\n- Ensure clean drinking water (50-60 litres/day for milking cow)\n- Regular deworming every 3-4 months\n\n2. Poultry Farming:\n- Broiler (meat): 35-42 days cycle, BV380/Cobb breeds\n- Layer (eggs): Start laying at 18-20 weeks, peak at 28-32 weeks\n- Vaccination schedule is critical; follow veterinary advice\n\n3. Goat Farming:\n- Profitable breeds: Jamunapari, Barbari, Sirohi, Black Bengal\n- Low investment, good returns (meat + milk)\n- Housing: 10 sq.ft. per adult goat\n\n4. Integrated Farming:\n- Combine crop + dairy + poultry + fishery for year-round income\n- Farm waste recycling: Cow dung for biogas/compost, poultry litter as fertilizer\n\n5. Government Schemes:\n- NABARD provides subsidized loans for dairy, poultry, fishery\n- Rashtriya Gokul Mission for indigenous breed improvement\n- NLM (National Livestock Mission) for entrepreneurship support` },
  // General / Greeting
  { keywords: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening', 'help', 'what can you'],
    topic: 'greeting',
    response: `Welcome to the Smart Agriculture AI Assistant.\n\nI can help you with a wide range of agricultural topics:\n\n- Crop Recommendations: Season-wise crop planning for your region\n- Soil Management: Testing, improvement, and conservation\n- Disease and Pest Control: Identification, treatment, and prevention\n- Fertilizer Guidance: NPK doses, schedules, and organic alternatives\n- Weather Advisory: Season planning and climate adaptation\n- Harvest Management: Optimal timing and post-harvest care\n- Market Intelligence: Prices, selling strategies, and value addition\n- Organic Farming: Transition, certification, and practices\n- Irrigation Management: Methods, subsidies, and water conservation\n- Seed Selection: Varieties, treatment, and storage\n- Government Schemes: Subsidies, insurance, loans, and support\n- Farm Technology: Precision farming, equipment, and digital tools\n- Livestock and Dairy: Breeds, feeding, and integrated farming\n\nAsk me any question related to agriculture and farming.` },
  // Pricing / platform
  { keywords: ['buy', 'order', 'cart', 'checkout', 'delivery', 'shipping', 'payment', 'razorpay', 'account', 'register', 'login', 'platform'],
    topic: 'platform',
    response: `Smart Agriculture Marketplace - Platform Guide:\n\n1. How to Buy Products:\n- Browse the Shop page for fresh farm produce\n- Add items to your cart and proceed to checkout\n- Enter your delivery address and complete payment via Razorpay (UPI/Card/Netbanking)\n\n2. Delivery:\n- Free delivery on orders above Rs.500\n- Standard delivery within 2-5 business days depending on location\n- Track your order from the Orders section\n\n3. For Farmers (Sellers):\n- Register as a Farmer to list your products\n- Upload product details with photos and pricing\n- Manage orders from your Farmer Dashboard\n- Get verified for enhanced trust and visibility\n\n4. Payment Security:\n- All payments processed through Razorpay (PCI-DSS compliant)\n- SSL encryption for all transactions\n- Easy refunds for cancelled orders\n\n5. Support:\n- Use the Contact page for queries\n- Visit the AI Assistant (here) for agricultural guidance` },
];

// ─── Scoring Engine ────────────────────────────────────────────────────────────
function getAgriResponse(userMessage, conversationHistory) {
  const msg = userMessage.toLowerCase().trim();

  // Score each topic by keyword match density
  let bestScore = 0;
  let bestTopic = null;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (msg.includes(kw)) {
        // Longer keywords get higher weight
        score += kw.length;
      }
    }
    // Bonus for exact word matches
    const words = msg.split(/\s+/);
    for (const kw of entry.keywords) {
      if (words.includes(kw)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestTopic = entry;
    }
  }

  // If we matched something, return it
  if (bestTopic && bestScore >= 3) {
    return bestTopic.response;
  }

  // Fallback: intelligent general response
  return `Thank you for your question about "${userMessage}".\n\nWhile I may not have a specific entry for this exact query, here are some general recommendations:\n\n1. For crop-specific questions, mention the crop name and I can provide detailed guidance on cultivation, disease management, and market information.\n\n2. For regional farming advice, consult your local Krishi Vigyan Kendra (KVK) or state agricultural university extension services.\n\n3. For market prices, visit the eNAM portal (enam.gov.in) or Agmarknet for real-time data.\n\n4. For government scheme information, visit the agriculture ministry website or your nearest Common Service Centre.\n\nPlease try rephrasing your question with specific agricultural terms, or choose from the suggested topics below.`;
}

// ─── Suggestions ───────────────────────────────────────────────────────────────
const suggestions = [
  'What crops should I grow this season?',
  'How to identify tomato leaf curl disease?',
  'Best fertilizer schedule for wheat?',
  'Guide me on organic farming certification',
  'How to improve soil health naturally?',
  'What government schemes are available for farmers?',
  'How to set up drip irrigation?',
  'Post-harvest storage best practices',
  'Dairy farming basics and feed management',
  'How to use this marketplace platform?',
];

const WELCOME_MESSAGE = `Welcome to the Smart Agriculture AI Assistant.\n\nI can help you with a wide range of agricultural topics including crop recommendations, disease detection, fertilizer guidance, weather advisory, market intelligence, organic farming, irrigation, government schemes, farm technology, and livestock management.\n\nAsk me any question related to agriculture and farming. You can also choose from the suggested topics below to get started.`;

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AIChat() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: WELCOME_MESSAGE, time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    const userMsg = { id: Date.now(), from: 'user', text: msg, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // Simulate processing time for natural feel
    const delay = 800 + Math.random() * 800;
    setTimeout(() => {
      setTyping(false);
      const response = getAgriResponse(msg, messages);
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'bot', text: response, time: new Date() }]);
    }, delay);
  };

  const clearChat = () => {
    setMessages([{ id: 1, from: 'bot', text: WELCOME_MESSAGE, time: new Date() }]);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderText = (text) =>
    text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));

  return (
    <div className="ai-chat-page">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-logo">
          <span className="robot-icon" style={{ background: '#E8F5E9', color: '#2E7D32', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>AI</span>
          <div>
            <div className="sidebar-logo-title">AI Assistant</div>
            <div className="sidebar-logo-sub">Smart Farming Companion</div>
          </div>
        </div>

        <button className="new-chat-btn" onClick={clearChat}>
          + New Conversation
        </button>

        <div className="ai-features-list">
          <div className="features-label">Topics I can help with</div>
          {[
            'Crop Recommendations',
            'Disease and Pest Control',
            'Fertilizer Guidance',
            'Weather Advisory',
            'Harvest Management',
            'Market Intelligence',
            'Organic Farming',
            'Irrigation Management',
            'Seed Selection',
            'Government Schemes',
            'Farm Technology',
            'Storage and Post-Harvest',
            'Livestock and Dairy',
            'Platform Guide',
          ].map(label => (
            <div key={label} className="ai-feature-item">
              <span style={{ color: '#2E7D32', fontWeight: 600 }}>&bull;</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Main */}
      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="bot-avatar" style={{ background: '#E8F5E9', color: '#2E7D32', fontWeight: 700 }}>AI</div>
            <div>
              <div className="bot-name">AgriBot AI</div>
              <div className="bot-status"><span className="online-dot" />Online — Ready to help</div>
            </div>
          </div>
          <div className="chat-header-right">
            <span style={{ fontSize: '0.8rem', color: '#888' }}>{messages.length - 1} messages</span>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message-wrap ${msg.from}`}>
              {msg.from === 'bot' && <div className="msg-avatar" style={{ background: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: '0.75rem' }}>AI</div>}
              <div className={`message-bubble ${msg.from}`}>
                <div className="message-text">{renderText(msg.text)}</div>
                <div className="message-time">{formatTime(msg.time)}</div>
              </div>
              {msg.from === 'user' && <div className="msg-avatar user-avatar" style={{ background: '#E3F2FD', color: '#1565C0', fontWeight: 700, fontSize: '0.75rem' }}>You</div>}
            </div>
          ))}

          {typing && (
            <div className="message-wrap bot">
              <div className="msg-avatar" style={{ background: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: '0.75rem' }}>AI</div>
              <div className="message-bubble bot typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="suggestions-bar">
          {suggestions.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="chat-input-wrap">
          <div className="chat-input-box">
            <input
              type="text"
              placeholder="Ask me about crops, diseases, weather, prices, schemes..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="chat-input"
            />
            <button
              className={`send-btn ${input.trim() ? 'active' : ''}`}
              onClick={() => sendMessage()}
              disabled={!input.trim()}
            >
              Send
            </button>
          </div>
          <p className="chat-disclaimer">AI responses are for guidance only. Always consult local agriculture experts for critical decisions.</p>
        </div>
      </div>
    </div>
  );
}
