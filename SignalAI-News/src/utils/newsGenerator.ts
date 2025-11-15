interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  author: string;
  publishedAt: Date;
  category: string;
  source: string;
  readTime: number;
  tags: string[];
  isPremium: boolean;
  language: string;
  localizedContent?: Record<string, { title: string; summary: string; content: string }>;
  culturalContext?: string;
  regionalRelevance?: string[];
}

// Language-specific content templates
const localizedTemplates: Record<string, any> = {
  hi: {
    titlePrefixes: ['भारत में', 'दिल्ली में', 'मुंबई में', 'नई दिल्ली में'],
    sources: ['भारत समाचार', 'दैनिक जागरण', 'अमर उजाला', 'नवभारत टाइम्स'],
    authors: ['राजेश शर्मा', 'प्रिया गुप्ता', 'अमित कुमार', 'सुनीता वर्मा'],
    culturalTerms: ['सरकार', 'प्रधानमंत्री', 'मुख्यमंत्री', 'संसद', 'विधानसभा']
  },
  or: {
    titlePrefixes: ['ଓଡ଼ିଶାରେ', 'ଭୁବନେଶ୍ୱରରେ', 'କଟକରେ', 'ପୁରୀରେ'],
    sources: ['ସମ୍ବାଦ', 'ଧରିତ୍ରୀ', 'କନକ ନ୍ୟୁଜ୍', 'ଓଡ଼ିଶା ଟିଭି'],
    authors: ['ରାମେଶ୍ ପଟ୍ଟନାୟକ', 'ସୁନୀତା ମହାନ୍ତି', 'ପ୍ରଦୀପ ଦାସ', 'ଅନୁରାଧା ସାହୁ'],
    culturalTerms: ['ସରକାର', 'ମୁଖ୍ୟମନ୍ତ୍ରୀ', 'ବିଧାନସଭା', 'ଜଗନ୍ନାଥ', 'ପୁରୀ']
  },
  bn: {
    titlePrefixes: ['পশ্চিমবঙ্গে', 'কলকাতায়', 'ঢাকায়', 'বাংলাদেশে'],
    sources: ['আনন্দবাজার', 'প্রথম আলো', 'বাংলা ট্রিবিউন', 'সংবাদ প্রতিদিন'],
    authors: ['অমিত চক্রবর্তী', 'সুমিত্রা দাস', 'রাহুল বন্দ্যোপাধ্যায়', 'প্রিয়া মুখার্জি'],
    culturalTerms: ['সরকার', 'মুখ্যমন্ত্রী', 'বিধানসভা', 'দুর্গাপূজা', 'কালীপূজা']
  },
  ta: {
    titlePrefixes: ['தமிழ்நாட்டில்', 'சென்னையில்', 'கோயம்புத்தூரில்', 'மதுரையில்'],
    sources: ['தினத்தந்தி', 'தினமணி', 'தி இந்து தமிழ்', 'மாலை முரசு'],
    authors: ['ராஜேஷ் குமார்', 'பிரியா ராமன்', 'அருண் சுந்தர்', 'கவிதா நாயர்'],
    culturalTerms: ['அரசு', 'முதலமைச்சர்', 'சட்டசபை', 'பொங்கல்', 'தீபாவளி']
  },
  te: {
    titlePrefixes: ['తెలంగాణలో', 'హైదరాబాద్‌లో', 'విజయవాడలో', 'విశాఖపట్నంలో'],
    sources: ['ఈనాడు', 'సాక్షి', 'ఆంధ్రజ్యోతి', 'వార్త'],
    authors: ['రాజేష్ రెడ్డి', 'ప్రియ శర్మ', 'అనిల్ కుమార్', 'సునీత రావు'],
    culturalTerms: ['ప్రభుత్వం', 'ముఖ్యమంత్రి', 'అసెంబ్లీ', 'దసరా', 'దీపావళి']
  },
  gu: {
    titlePrefixes: ['ગુજરાતમાં', 'અમદાવાદમાં', 'સુરતમાં', 'વડોદરામાં'],
    sources: ['ગુજરાત સમાચાર', 'દિવ્ય ભાસ્કર', 'સંદેશ', 'લોકસત્તા'],
    authors: ['રાજેશ પટેલ', 'પ્રિયા શાહ', 'અમિત દેસાઈ', 'સુનીતા મહેતા'],
    culturalTerms: ['સરકાર', 'મુખ્યમંત્રી', 'વિધાનસભા', 'નવરાત્રિ', 'દિવાળી']
  },
  mr: {
    titlePrefixes: ['महाराष्ट्रात', 'मुंबईत', 'पुण्यात', 'नागपूरात'],
    sources: ['लोकसत्ता', 'सकाळ', 'महाराष्ट्र टाइम्स', 'दैनिक भास्कर'],
    authors: ['राजेश पाटील', 'प्रिया देशमुख', 'अमित जोशी', 'सुनीता कुलकर्णी'],
    culturalTerms: ['सरकार', 'मुख्यमंत्री', 'विधानसभा', 'गणपती', 'दिवाळी']
  },
  kn: {
    titlePrefixes: ['ಕರ್ನಾಟಕದಲ್ಲಿ', 'ಬೆಂಗಳೂರಿನಲ್ಲಿ', 'ಮೈಸೂರಿನಲ್ಲಿ', 'ಮಂಗಳೂರಿನಲ್ಲಿ'],
    sources: ['ಪ್ರಜಾವಾಣಿ', 'ವಿಜಯ ಕರ್ನಾಟಕ', 'ಸುದ್ದಿ ವಾರ್ತೆ', 'ಕನ್ನಡ ಪ್ರಭ'],
    authors: ['ರಾಜೇಶ್ ಕುಮಾರ್', 'ಪ್ರಿಯಾ ರಾವ್', 'ಅನಿಲ್ ಶೆಟ್ಟಿ', 'ಸುನೀತಾ ಗೌಡ'],
    culturalTerms: ['ಸರ್ಕಾರ', 'ಮುಖ್ಯಮಂತ್ರಿ', 'ವಿಧಾನಸಭೆ', 'ದಸರಾ', 'ದೀಪಾವಳಿ']
  },
  pa: {
    titlePrefixes: ['ਪੰਜਾਬ ਵਿੱਚ', 'ਚੰਡੀਗੜ੍ਹ ਵਿੱਚ', 'ਲੁਧਿਆਣਾ ਵਿੱਚ', 'ਅੰਮ੍ਰਿਤਸਰ ਵਿੱਚ'],
    sources: ['ਪੰਜਾਬੀ ਟ੍ਰਿਬਿਊਨ', 'ਅਜੀਤ', 'ਜਗਬਾਣੀ', 'ਪੰਜਾਬ ਕੇਸਰੀ'],
    authors: ['ਰਾਜੇਸ਼ ਸਿੰਘ', 'ਪ੍ਰਿਯਾ ਕੌਰ', 'ਅਮਿਤ ਸ਼ਰਮਾ', 'ਸੁਨੀਤਾ ਧਿੱਲੋਂ'],
    culturalTerms: ['ਸਰਕਾਰ', 'ਮੁੱਖ ਮੰਤਰੀ', 'ਵਿਧਾਨ ਸਭਾ', 'ਵੈਸਾਖੀ', 'ਦਿਵਾਲੀ']
  }
};

// Regional image mappings for cultural context
const regionalImages: Record<string, string[]> = {
  hi: [
    'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800', // Delhi landmarks
    'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=800', // Indian architecture
    'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800'  // Cultural scenes
  ],
  or: [
    'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=800', // Odisha temples
    'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800', // Coastal scenes
    'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=800'  // Traditional art
  ],
  default: [
    'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/273230/pexels-photo-273230.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1484771/pexels-photo-1484771.jpeg?auto=compress&cs=tinysrgb&w=800'
  ]
};

const newsTemplates: Record<string, any[]> = {
  politics: [
    {
      titleTemplates: [
        "Parliament Session: Opposition Raises {issue} in Lok Sabha Debate",
        "Election Commission Announces {election} Schedule for {state}",
        "Supreme Court Hearing: {case} Verdict Expected This Week",
        "Cabinet Reshuffle: {minister} Appointed as New {portfolio} Minister",
        "Political Alliance: {party1} and {party2} Form Coalition for {election}",
        "Rajya Sabha Passes {bill} Bill with {majority} Majority",
        "State Assembly: {state} CM Announces {policy} for {sector}",
        "Constitutional Amendment: Article {article} Debate in Parliament"
      ],
      issues: ['Farmer Welfare', 'Women Safety', 'Economic Policy', 'Education Reform', 'Healthcare Access'],
      elections: ['Assembly', 'Lok Sabha', 'Municipal', 'Panchayat'],
      states: ['Uttar Pradesh', 'Maharashtra', 'West Bengal', 'Tamil Nadu', 'Karnataka', 'Gujarat'],
      cases: ['Electoral Bonds', 'Article 370', 'CAA Implementation', 'Farm Laws'],
      ministers: ['Amit Shah', 'Nirmala Sitharaman', 'S. Jaishankar', 'Rajnath Singh'],
      portfolios: ['Defence', 'External Affairs', 'Home Affairs', 'Finance'],
      party1: ['BJP', 'Congress', 'AAP', 'TMC'],
      party2: ['JD(U)', 'Shiv Sena', 'DMK', 'YSRCP'],
      bills: ['Digital India', 'Women Reservation', 'Uniform Civil Code'],
      majorities: ['Two-thirds', 'Simple', 'Overwhelming'],
      policies: ['Free Education', 'Healthcare Scheme', 'Employment Program'],
      sectors: ['Agriculture', 'Industry', 'Services', 'Technology'],
      articles: ['356', '370', '35A', '19'],
      sources: ['SignalAI Political Desk', 'Parliament Reporter', 'Political Correspondent', 'Constitutional Expert']
    }
  ],
  breaking: [
    {
      titleTemplates: [
        "LIVE: Major Infrastructure Development Project Announced in {city}",
        "BREAKING: Cabinet Approves New {policy} Policy for {sector}",
        "URGENT: Emergency Response Teams Mobilized for {event} in {state}",
        "EXCLUSIVE: PM Modi Announces {initiative} During {city} Visit",
        "DEVELOPING: Parliament Session Addresses {issue} Crisis",
        "ALERT: Supreme Court Delivers Landmark Judgment on {matter}",
        "NOW: President Ram Nath Kovind Inaugurates {project} in {state}"
      ],
      cities: ['New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'],
      policies: ['Education Reform', 'Healthcare', 'Digital India', 'Startup India', 'Make in India'],
      sectors: ['Technology', 'Healthcare', 'Education', 'Agriculture', 'Manufacturing', 'Defense'],
      events: ['Natural Disaster Relief', 'Cyber Security Summit', 'Economic Forum', 'Climate Conference'],
      states: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Gujarat', 'Rajasthan', 'Odisha'],
      initiatives: ['Skill Development Program', 'Smart City Mission', 'Digital Payment Drive'],
      issues: ['Farmer Protests', 'Economic Recovery', 'COVID-19 Management', 'Climate Change'],
      matters: ['Privacy Rights', 'Environmental Protection', 'Women Safety', 'Digital Rights'],
      projects: ['Metro Rail Project', 'Solar Energy Plant', 'Medical College'],
      sources: ['SignalAI Bureau', 'PTI', 'ANI', 'SignalAI Political Desk']
    }
  ],
  india: [
    {
      titleTemplates: [
        "{state} Government Launches ₹{amount} Crore {program} for {beneficiary}",
        "Monsoon 2025: {state} Records {percentage}% Above Normal Rainfall",
        "Indian Railways Introduces New {train} Service Between {city1} and {city2}",
        "ISRO Successfully Launches {satellite} from Sriharikota",
        "{festival} Celebrations: {city} Prepares for Grand Festivities",
        "Agriculture Ministry Reports {crop} Production Increase of {percentage}%",
        "Digital India: {state} Achieves 100% {service} Coverage",
        "Traditional Arts: {art} Gets UNESCO Intangible Cultural Heritage Status"
      ],
      states: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Gujarat', 'Rajasthan', 'Odisha', 'Andhra Pradesh', 'Kerala'],
      amounts: ['500', '1000', '2000', '5000', '10000'],
      programs: ['Healthcare Scheme', 'Education Initiative', 'Employment Program', 'Housing Project', 'Skill Development'],
      beneficiaries: ['Farmers', 'Students', 'Women', 'Youth', 'Senior Citizens', 'Small Businesses'],
      percentages: ['15', '20', '25', '30', '35', '40'],
      trains: ['Vande Bharat Express', 'Tejas Express', 'Humsafar Express'],
      cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'],
      city1: ['Delhi', 'Mumbai', 'Chennai'],
      city2: ['Bangalore', 'Kolkata', 'Ahmedabad'],
      satellites: ['PSLV-C54', 'GSLV Mk III', 'Chandrayaan-4', 'Aditya L1'],
      festivals: ['Durga Puja', 'Diwali', 'Holi', 'Eid', 'Christmas', 'Onam', 'Pongal'],
      crops: ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Pulses'],
      services: ['Digital Payment', '4G Coverage', 'Broadband', 'E-governance'],
      arts: ['Kalbelia Dance', 'Chhau Dance', 'Mudiyettu', 'Koodiyattam'],
      sources: ['SignalAI India Desk', 'Regional Correspondent', 'State Bureau', 'Cultural Reporter']
    }
  ],
  world: [
    {
      titleTemplates: [
        "G20 Summit: PM Modi Meets {leader} to Discuss {topic}",
        "International Trade: India-{country} Agreement Worth ${amount} Billion",
        "UN Security Council: India Advocates for {cause} Reform",
        "Climate Action: India Commits to {target} by {year}",
        "Diplomatic Relations: {country} Ambassador Visits {city}",
        "Global Economy: IMF Upgrades India's Growth Forecast to {rate}%",
        "Space Cooperation: NASA-ISRO Joint Mission {project} Announced",
        "Cultural Exchange: {event} Festival Celebrated in {country}"
      ],
      leaders: ['President Biden', 'President Xi Jinping', 'Chancellor Scholz', 'President Macron', 'PM Kishida'],
      topics: ['Trade Relations', 'Climate Action', 'Counter-terrorism', 'Technology Partnership', 'Defense Cooperation'],
      countries: ['United States', 'China', 'Japan', 'Germany', 'France', 'United Kingdom', 'Australia', 'Canada', 'Russia', 'Brazil'],
      amounts: ['10', '25', '50', '100', '200'],
      causes: ['Security Council', 'Climate Justice', 'Sustainable Development', 'Global Health'],
      targets: ['Net Zero Emissions', '500 GW Renewable Energy', 'Carbon Neutrality'],
      years: ['2030', '2035', '2040', '2050'],
      rates: ['6.1', '6.3', '6.5', '6.8', '7.0'],
      projects: ['Artemis Program', 'Mars Sample Return', 'Lunar Gateway', 'Solar Observatory'],
      events: ['Yoga Day', 'Diwali', 'Indian Film Festival', 'Classical Music'],
      sources: ['SignalAI World Desk', 'International Correspondent', 'Diplomatic Reporter', 'Global Affairs']
    }
  ],
  business: [
    {
      titleTemplates: [
        "Stock Market: Sensex Closes at {points} Points, {trend} by {change}%",
        "Startup Unicorn: {company} Valued at ${valuation} Billion After Series {round}",
        "RBI Monetary Policy: Repo Rate {action} to {rate}%",
        "IPO Launch: {company} to Raise ₹{amount} Crore Through Public Offering",
        "Merger & Acquisition: {company1} Acquires {company2} for ${deal} Billion",
        "Oil Prices: Crude {direction} to ${price}/Barrel Following {event}",
        "Economic Growth: India's GDP Grows {rate}% in Q{quarter} FY{year}",
        "Banking Sector: {bank} Launches New {product} for {segment}"
      ],
      points: ['75000', '76000', '77000', '78000', '79000'],
      trends: ['Gained', 'Lost', 'Surged', 'Declined'],
      changes: ['1.2', '1.5', '2.1', '0.8', '1.8'],
      companies: ['PayZap', 'EduTech Pro', 'HealthCare AI', 'GreenEnergy Solutions', 'FinTech India'],
      valuations: ['1.2', '2.5', '5.0', '10.0'],
      rounds: ['C', 'D', 'E'],
      actions: ['Unchanged', 'Increased', 'Decreased'],
      rates: ['6.50', '6.75', '7.00', '7.25'],
      amounts: ['2000', '5000', '10000', '15000'],
      company1: ['Reliance', 'TCS', 'Infosys', 'HDFC'],
      company2: ['Tech Startup', 'Retail Chain', 'Pharma Company', 'IT Firm'],
      deals: ['2.5', '5.0', '10.0', '15.0'],
      directions: ['Rises', 'Falls', 'Stabilizes'],
      prices: ['85', '90', '95', '100'],
      events: ['OPEC Meeting', 'Geopolitical Tensions', 'Supply Chain Issues'],
      quarters: ['1', '2', '3', '4'],
      years: ['2024', '2025'],
      banks: ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'],
      products: ['Digital Wallet', 'Credit Card', 'Investment Plan'],
      segments: ['SMEs', 'Farmers', 'Students', 'Senior Citizens'],
      sources: ['SignalAI Business', 'Economic Times Bureau', 'Market Correspondent', 'Financial Reporter']
    }
  ],
  technology: [
    {
      titleTemplates: [
        "AI Revolution: {company} Launches Advanced {technology} for {application}",
        "5G Expansion: Jio and Airtel Complete {milestone} Rollout Across {region}",
        "Cybersecurity Alert: New {threat} Targets {sector} Infrastructure",
        "ISRO Achievement: {mission} Successfully {accomplishment}",
        "Tech Policy: Government Announces {policy} for {domain}",
        "Startup Innovation: {startup} Develops {solution} Using {tech}",
        "Digital Payment: UPI Transactions Cross ₹{amount} Lakh Crore Mark",
        "Space Technology: India's {satellite} Provides {service} Data"
      ],
      companies: ['Google India', 'Microsoft', 'Amazon Web Services', 'Meta', 'Apple', 'Tesla India', 'NVIDIA'],
      technologies: ['Machine Learning Platform', 'Quantum Computer', 'Neural Network', 'Blockchain Solution'],
      applications: ['Healthcare Diagnosis', 'Traffic Management', 'Agricultural Planning', 'Financial Services'],
      milestones: ['Phase 1', 'Urban Coverage', 'Rural Connectivity'],
      regions: ['North India', 'South India', 'Metro Cities', 'Tier-2 Cities'],
      threats: ['Ransomware', 'Phishing Campaign', 'APT Attack', 'Zero-day Exploit'],
      sectors: ['Banking', 'Healthcare', 'Government', 'Energy'],
      missions: ['Chandrayaan-4', 'Gaganyaan', 'Aditya L2', 'RISAT-3'],
      accomplishments: ['Lands on Moon', 'Enters Orbit', 'Transmits Data', 'Completes Mission'],
      policies: ['Data Protection Bill', 'AI Ethics Framework', 'Drone Policy'],
      domains: ['Artificial Intelligence', 'Cryptocurrency', 'E-commerce', 'Fintech'],
      startups: ['ByJus', 'Paytm', 'Ola Electric', 'Zomato', 'Swiggy'],
      solutions: ['Smart City Platform', 'Healthcare App', 'Education Portal'],
      tech: ['Machine Learning', 'IoT Sensors', 'Blockchain', 'Cloud Computing'],
      amounts: ['20', '25', '30', '35'],
      satellites: ['CartoSat-3', 'RISAT-2B', 'EMISAT'],
      services: ['Weather Monitoring', 'Agriculture', 'Disaster Management'],
      sources: ['SignalAI Tech', 'Technology Reporter', 'Innovation Desk', 'Digital Affairs']
    }
  ],
  sports: [
    {
      titleTemplates: [
        "Cricket World Cup: Team India {result} {opponent} by {margin}",
        "Olympic Preparation: {athlete} Wins Gold at {event} Championship",
        "IPL 2025: {team} Defeats {opponent} in Thrilling {format} Match",
        "Football: Indian Super League {team} Signs {player} for ₹{amount} Crore",
        "Badminton Glory: {player} Reaches {stage} at {tournament}",
        "Hockey Victory: Indian Team Beats {country} {score} in {competition}",
        "Wrestling Championship: {wrestler} Wins {medal} at World Championships",
        "Athletics Record: {athlete} Breaks National Record in {event}"
      ],
      results: ['Defeats', 'Loses to', 'Draws with'],
      opponents: ['Australia', 'England', 'Pakistan', 'South Africa', 'New Zealand', 'West Indies'],
      margins: ['7 wickets', '50 runs', '4 wickets', '25 runs'],
      athletes: ['Neeraj Chopra', 'P.V. Sindhu', 'Mirabai Chanu', 'Lovlina Borgohain'],
      events: ['Asian Games', 'Commonwealth Games', 'World Championships'],
      teams: ['Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bangalore', 'Delhi Capitals'],
      formats: ['T20', 'ODI'],
      players: ['Virat Kohli', 'Rohit Sharma', 'KL Rahul', 'Hardik Pandya'],
      amounts: ['15', '20', '25', '30'],
      stages: ['Semi-finals', 'Finals', 'Quarter-finals'],
      tournaments: ['All England Open', 'World Championships', 'Asian Championships'],
      countries: ['Pakistan', 'Argentina', 'Germany', 'Netherlands'],
      scores: ['3-1', '2-0', '4-2', '1-0'],
      competitions: ['FIH Pro League', 'Asia Cup', 'World Cup'],
      wrestlers: ['Bajrang Punia', 'Vinesh Phogat', 'Ravi Dahiya'],
      medals: ['Gold Medal', 'Silver Medal', 'Bronze Medal'],
      sources: ['SignalAI Sports', 'Sports Reporter', 'Olympics Correspondent', 'Cricket Bureau']
    }
  ],
  entertainment: [
    {
      titleTemplates: [
        "Bollywood Box Office: '{movie}' Crosses ₹{amount} Crore Worldwide",
        "OTT Release: {actor} Starrer '{series}' Premieres on {platform}",
        "Film Festival Glory: '{film}' Wins {award} at {festival}",
        "Music Charts: {singer}'s '{song}' Tops Spotify India",
        "Celebrity Wedding: {celebrity1} and {celebrity2} Tie the Knot in {city}",
        "Hollywood Collaboration: {actor} Signs {type} Film with {studio}",
        "Regional Cinema: {language} Film '{movie}' Gets National Award",
        "Fashion Week: {designer} Showcases {collection} at India Fashion Week"
      ],
      movies: ['Pathaan 2', 'Tiger 4', 'Dangal Returns', 'Baahubali 3', '3 Idiots Again'],
      amounts: ['100', '200', '300', '500', '750'],
      actors: ['Shah Rukh Khan', 'Aamir Khan', 'Salman Khan', 'Akshay Kumar', 'Hrithik Roshan'],
      series: ['Mumbai Mafia', 'Delhi Crime 3', 'Scam 2025', 'Rocket Boys 3'],
      platforms: ['Netflix India', 'Amazon Prime', 'Disney+ Hotstar', 'SonyLIV'],
      films: ['The Kashmir Files 2', 'Article 370', 'Mission Majnu 2'],
      awards: ['Best Film Award', 'Best Actor Award', 'Jury Prize'],
      festivals: ['Cannes Film Festival', 'Berlin International', 'IFFI Goa'],
      singers: ['Arijit Singh', 'Shreya Ghoshal', 'Rahat Fateh Ali Khan'],
      songs: ['Kesariya Returns', 'Jai Ho 2025', 'Tum Hi Ho Again'],
      celebrity1: ['Deepika Padukone', 'Priyanka Chopra', 'Alia Bhatt'],
      celebrity2: ['Ranveer Singh', 'Nick Jonas', 'Ranbir Kapoor'],
      types: ['Hollywood Action', 'International Drama', 'Global Thriller'],
      studios: ['Marvel Studios', 'Warner Bros', 'Universal Pictures'],
      languages: ['Tamil', 'Telugu', 'Malayalam', 'Kannada'],
      designers: ['Sabyasachi', 'Manish Malhotra', 'Rohit Bal'],
      collections: ['Bridal Couture', 'Festive Wear', 'Contemporary Fashion'],
      sources: ['SignalAI Entertainment', 'Bollywood Reporter', 'Film Correspondent', 'Celebrity News']
    }
  ],
  health: [
    {
      titleTemplates: [
        "Medical Breakthrough: AIIMS Develops New Treatment for {condition}",
        "Health Policy: Government Launches {scheme} Covering {population} People",
        "Ayurveda Research: {herb} Shows Promise in Treating {ailment}",
        "Vaccine Update: {vaccine} Booster Campaign Begins Across {region}",
        "Mental Health: {program} Initiative Reaches {milestone} Beneficiaries",
        "Telemedicine Growth: {platform} Serves {number} Patients Monthly",
        "Nutrition Study: {food} Consumption Linked to {benefit}",
        "Healthcare Infrastructure: New {facility} Opens in {location}"
      ],
      conditions: ['Diabetes Type 2', 'Heart Disease', 'Cancer', 'Alzheimer\'s', 'Parkinson\'s'],
      schemes: ['Ayushman Bharat Plus', 'Health Insurance 2025', 'Rural Healthcare'],
      population: ['50 Million', '100 Million', '200 Million'],
      herbs: ['Turmeric', 'Ashwagandha', 'Brahmi', 'Neem', 'Tulsi'],
      ailments: ['Arthritis', 'Anxiety', 'Digestive Issues', 'Respiratory Problems'],
      vaccines: ['COVID-19 Variant', 'Influenza', 'HPV', 'Hepatitis B'],
      regions: ['Urban Areas', 'Rural India', 'Northeast States', 'Coastal Regions'],
      programs: ['Mindfulness Training', 'Workplace Wellness', 'Student Counseling'],
      milestones: ['1 Million', '5 Million', '10 Million'],
      platforms: ['eSanjeevani', 'Practo', 'Apollo 24x7'],
      numbers: ['500K', '1M', '2M'],
      foods: ['Millets', 'Organic Vegetables', 'Traditional Grains', 'Fermented Foods'],
      benefits: ['Reduced Heart Disease Risk', 'Better Immunity', 'Improved Digestion'],
      facilities: ['Super Specialty Hospital', 'Cancer Center', 'Research Institute'],
      locations: ['Tier-2 Cities', 'Rural Areas', 'Metropolitan Cities'],
      sources: ['SignalAI Health', 'Medical Correspondent', 'Healthcare Reporter', 'Public Health Desk']
    }
  ]
};

const imageUrls = [
  'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/273230/pexels-photo-273230.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1484771/pexels-photo-1484771.jpeg?auto=compress&cs=tinysrgb&w=800'
];

export function generateNewsArticles(count: number, language: string = 'en'): NewsArticle[] {
  return generateArticlesByCategory('mixed', count, language);
}

export function generateArticlesByCategory(category: string, count: number, language: string = 'en'): NewsArticle[] {
  const authors = [
    'Rajesh Kumar',
    'Priya Sharma',
    'Amit Singh',
    'Sunita Verma',
    'Vikram Patel',
    'Kavita Nair',
    'Rohit Gupta',
    'Meera Joshi'
  ];

  const articles: NewsArticle[] = [];
  
  if (category === 'mixed') {
    // Generate mixed articles from all categories
    const categories = Object.keys(newsTemplates);
    const articlesPerCategory = Math.ceil(count / categories.length);
    
    for (const cat of categories) {
      const categoryArticles = generateCategoryArticles(cat, articlesPerCategory, language, authors);
      articles.push(...categoryArticles);
      if (articles.length >= count) break;
    }
  } else {
    // Generate articles for specific category
    const categoryArticles = generateCategoryArticles(category, count, language, authors);
    articles.push(...categoryArticles);
  }

  return articles.slice(0, count);
}

function generateCategoryArticles(category: string, count: number, language: string, authors: string[]): NewsArticle[] {
  const articles: NewsArticle[] = [];
  
  if (!newsTemplates[category]) {
    console.warn(`No templates found for category: ${category}`);
    return [];
  }
  
  for (let i = 0; i < count; i++) {
    const templates = newsTemplates[category];
    const template = templates[0]; // Use first template for each category
    
    const titleTemplate = template.titleTemplates[Math.floor(Math.random() * template.titleTemplates.length)];
    
    // Replace placeholders in title
    let title = titleTemplate;
    Object.keys(template).forEach(key => {
      if (key !== 'titleTemplates' && key !== 'sources' && Array.isArray(template[key])) {
        const placeholder = `{${key}}`;
        if (title.includes(placeholder)) {
          const randomValue = template[key][Math.floor(Math.random() * template[key].length)];
          title = title.replace(new RegExp(placeholder, 'g'), randomValue);
        }
      }
    });

    // Handle singular placeholders
    const singularMappings: Record<string, string[]> = {
      '{city}': template.cities || template.city1 || ['New Delhi', 'Mumbai', 'Bangalore'],
      '{state}': template.states || ['Maharashtra', 'Karnataka', 'Tamil Nadu'],
      '{country}': template.countries || ['India', 'United States', 'China'],
      '{amount}': template.amounts || ['100', '500', '1000'],
      '{percentage}': template.percentages || ['10', '20', '30'],
      '{rate}': template.rates || ['5.0', '6.0', '7.0']
    };

    Object.entries(singularMappings).forEach(([placeholder, values]) => {
      if (title.includes(placeholder)) {
        const randomValue = values[Math.floor(Math.random() * values.length)];
        title = title.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), randomValue);
      }
    });

    // Generate localized content if not English
    let localizedTitle = title;
    let localizedSummary = `This is a comprehensive report about ${title.toLowerCase()}. The story covers all major developments and provides detailed analysis of the situation.`;
    let localizedContent = `${localizedSummary} This article provides in-depth coverage of recent developments, expert opinions, and analysis of the implications. Our correspondents have gathered information from multiple sources to bring you this detailed report. The story continues to develop and we will provide updates as more information becomes available.`;

    if (language !== 'en' && localizedTemplates[language]) {
      const langTemplate = localizedTemplates[language];
      const prefix = langTemplate.titlePrefixes[Math.floor(Math.random() * langTemplate.titlePrefixes.length)];
      const culturalTerm = langTemplate.culturalTerms[Math.floor(Math.random() * langTemplate.culturalTerms.length)];
      
      localizedTitle = `${prefix} ${culturalTerm} ${title}`;
      localizedSummary = `${prefix} ${culturalTerm} के बारे में विस्तृत रिपोर्ट। यह खबर सभी प्रमुख घटनाओं को कवर करती है।`;
      localizedContent = `${localizedSummary} यह लेख हाल की घटनाओं, विशेषज्ञों की राय और स्थिति के निहितार्थों का विस्तृत विश्लेषण प्रदान करता है।`;
    }

    // Select appropriate image
    const imageOptions = regionalImages[language] || regionalImages.default;
    const imageUrl = imageOptions[Math.floor(Math.random() * imageOptions.length)];

    // Select author
    const authorOptions = language !== 'en' && localizedTemplates[language] 
      ? localizedTemplates[language].authors 
      : authors;
    const author = authorOptions[Math.floor(Math.random() * authorOptions.length)];

    // Select source
    const sourceOptions = language !== 'en' && localizedTemplates[language]
      ? localizedTemplates[language].sources
      : template.sources;
    const source = sourceOptions[Math.floor(Math.random() * sourceOptions.length)];

    // Generate article with more realistic timing spread
    const timeSpread = Math.random() * 48 * 60 * 60 * 1000; // Random time within last 48 hours
    const publishTime = new Date(Date.now() - timeSpread);
    
    // Add some recent articles (within last 2 hours) for real-time feel
    if (i < count * 0.1) { // 10% of articles are very recent
      publishTime.setTime(Date.now() - Math.random() * 2 * 60 * 60 * 1000);
    }

    // Generate article
    const article: NewsArticle = {
      id: `${category}-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      title: language === 'en' ? title : localizedTitle,
      summary: language === 'en' ? localizedSummary : localizedSummary,
      content: language === 'en' ? localizedContent : localizedContent,
      imageUrl,
      author,
      publishedAt: publishTime,
      category,
      source,
      readTime: Math.floor(Math.random() * 8) + 3, // 3-10 minutes
      tags: [category, 'news', language === 'en' ? 'english' : language],
      isPremium: Math.random() > 0.75, // 25% premium articles
      language,
      culturalContext: language !== 'en' ? `Regional news for ${language} speakers` : undefined,
      regionalRelevance: language !== 'en' ? [language] : undefined
    };

    articles.push(article);
  }
  return articles;
}