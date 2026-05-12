import { OrganisationIndustry } from "@/api/services/tendiflow/organisations/types";
import { SelectOptionType } from "@/types/general";

export const ORGANISATION_INDUSTRY_OPTIONS: SelectOptionType[] = [
  // Technology
  {
    name: "Information Technology",
    value: OrganisationIndustry.INFORMATION_TECHNOLOGY,
    description: "IT services, consulting, and solutions",
  },
  {
    name: "Software",
    value: OrganisationIndustry.SOFTWARE,
    description: "Software development and applications",
  },
  {
    name: "Hardware",
    value: OrganisationIndustry.HARDWARE,
    description: "Computer hardware and equipment",
  },
  {
    name: "Telecommunications",
    value: OrganisationIndustry.TELECOMMUNICATIONS,
    description: "Communication services and infrastructure",
  },
  {
    name: "Internet",
    value: OrganisationIndustry.INTERNET,
    description: "Internet services and web technologies",
  },

  // Finance
  {
    name: "Banking",
    value: OrganisationIndustry.BANKING,
    description: "Commercial and investment banking",
  },
  {
    name: "Insurance",
    value: OrganisationIndustry.INSURANCE,
    description: "Insurance services and products",
  },
  {
    name: "Financial Services",
    value: OrganisationIndustry.FINANCIAL_SERVICES,
    description: "Financial planning and investment services",
  },
  {
    name: "Accounting",
    value: OrganisationIndustry.ACCOUNTING,
    description: "Accounting and auditing services",
  },
  {
    name: "Venture Capital & Private Equity",
    value: OrganisationIndustry.VENTURE_CAPITAL,
    description: "Investment and capital management",
  },

  // Healthcare
  {
    name: "Hospital & Health Care",
    value: OrganisationIndustry.HOSPITAL_AND_HEALTH_CARE,
    description: "Healthcare facilities and medical services",
  },
  {
    name: "Pharmaceuticals",
    value: OrganisationIndustry.PHARMACEUTICALS,
    description: "Drug development and pharmaceutical products",
  },
  {
    name: "Medical Devices",
    value: OrganisationIndustry.MEDICAL_DEVICES,
    description: "Medical equipment and devices",
  },
  {
    name: "Biotechnology",
    value: OrganisationIndustry.BIOTECHNOLOGY,
    description: "Biotechnology research and products",
  },
  {
    name: "Mental Health Care",
    value: OrganisationIndustry.MENTAL_HEALTH_CARE,
    description: "Mental health services and support",
  },

  // Retail & E-commerce
  {
    name: "Retail",
    value: OrganisationIndustry.RETAIL,
    description: "Physical retail stores and services",
  },
  {
    name: "E-commerce",
    value: OrganisationIndustry.ECOMMERCE,
    description: "Online retail and marketplace platforms",
  },
  {
    name: "Apparel & Fashion",
    value: OrganisationIndustry.APPAREL_AND_FASHION,
    description: "Clothing, accessories, and fashion",
  },
  {
    name: "Consumer Goods",
    value: OrganisationIndustry.CONSUMER_GOODS,
    description: "Consumer products and merchandise",
  },
  {
    name: "Luxury Goods & Jewelry",
    value: OrganisationIndustry.LUXURY_GOODS_AND_JEWELRY,
    description: "High-end products and luxury items",
  },

  // Manufacturing
  {
    name: "Manufacturing",
    value: OrganisationIndustry.MANUFACTURING,
    description: "General manufacturing and production",
  },
  {
    name: "Automotive",
    value: OrganisationIndustry.AUTOMOTIVE,
    description: "Automotive industry and vehicle manufacturing",
  },
  {
    name: "Aviation & Aerospace",
    value: OrganisationIndustry.AVIATION_AND_AEROSPACE,
    description: "Aircraft and aerospace technology",
  },
  {
    name: "Industrial Automation",
    value: OrganisationIndustry.INDUSTRIAL_AUTOMATION,
    description: "Automation systems and robotics",
  },
  {
    name: "Machinery",
    value: OrganisationIndustry.MACHINERY,
    description: "Industrial machinery and equipment",
  },

  // Professional Services
  {
    name: "Legal Services",
    value: OrganisationIndustry.LEGAL_SERVICES,
    description: "Legal counsel and law firms",
  },
  {
    name: "Management Consulting",
    value: OrganisationIndustry.MANAGEMENT_CONSULTING,
    description: "Business consulting and advisory services",
  },
  {
    name: "Marketing & Advertising",
    value: OrganisationIndustry.MARKETING_AND_ADVERTISING,
    description: "Marketing, advertising, and promotion services",
  },
  {
    name: "Real Estate",
    value: OrganisationIndustry.REAL_ESTATE,
    description: "Real estate services and property management",
  },
  {
    name: "Staffing & Recruiting",
    value: OrganisationIndustry.STAFFING_AND_RECRUITING,
    description: "Human resources and recruitment services",
  },

  // Energy & Utilities
  {
    name: "Oil & Gas",
    value: OrganisationIndustry.OIL_AND_GAS,
    description: "Oil, gas, and petroleum industry",
  },
  {
    name: "Renewable Energy",
    value: OrganisationIndustry.RENEWABLE_ENERGY,
    description: "Solar, wind, and sustainable energy",
  },
  {
    name: "Utilities",
    value: OrganisationIndustry.UTILITIES,
    description: "Public utilities and infrastructure",
  },
  {
    name: "Mining & Metals",
    value: OrganisationIndustry.MINING_AND_METALS,
    description: "Mining operations and metal production",
  },

  // Hospitality & Tourism
  {
    name: "Hospitality",
    value: OrganisationIndustry.HOSPITALITY,
    description: "Hotels, resorts, and hospitality services",
  },
  {
    name: "Restaurants",
    value: OrganisationIndustry.RESTAURANTS,
    description: "Food service and restaurant industry",
  },
  {
    name: "Leisure, Travel & Tourism",
    value: OrganisationIndustry.LEISURE_TRAVEL_AND_TOURISM,
    description: "Travel agencies and tourism services",
  },
  {
    name: "Events Services",
    value: OrganisationIndustry.EVENTS_SERVICES,
    description: "Event planning and management services",
  },

  // Education
  {
    name: "Education Management",
    value: OrganisationIndustry.EDUCATION_MANAGEMENT,
    description: "Educational administration and management",
  },
  {
    name: "Higher Education",
    value: OrganisationIndustry.HIGHER_EDUCATION,
    description: "Universities and higher education institutions",
  },
  {
    name: "E-learning",
    value: OrganisationIndustry.E_LEARNING,
    description: "Online education and digital learning platforms",
  },
  {
    name: "Primary/Secondary Education",
    value: OrganisationIndustry.PRIMARY_AND_SECONDARY_EDUCATION,
    description: "Schools and K-12 education",
  },

  // Government & Non-Profit
  {
    name: "Government Administration",
    value: OrganisationIndustry.GOVERNMENT_ADMINISTRATION,
    description: "Government agencies and public administration",
  },
  {
    name: "Non-Profit Organisation Management",
    value: OrganisationIndustry.NON_PROFIT_ORGANIZATION_MANAGEMENT,
    description: "Non-profit organisations and charities",
  },
  {
    name: "Public Policy",
    value: OrganisationIndustry.PUBLIC_POLICY,
    description: "Policy development and public affairs",
  },
  {
    name: "International Affairs",
    value: OrganisationIndustry.INTERNATIONAL_AFFAIRS,
    description: "International relations and global affairs",
  },

  // Media & Entertainment
  {
    name: "Media Production",
    value: OrganisationIndustry.MEDIA_PRODUCTION,
    description: "Film, video, and media production",
  },
  {
    name: "Entertainment",
    value: OrganisationIndustry.ENTERTAINMENT,
    description: "Entertainment industry and content creation",
  },
  {
    name: "Broadcast Media",
    value: OrganisationIndustry.BROADCAST_MEDIA,
    description: "Television, radio, and broadcasting",
  },
  {
    name: "Publishing",
    value: OrganisationIndustry.PUBLISHING,
    description: "Book, magazine, and content publishing",
  },
  {
    name: "Music",
    value: OrganisationIndustry.MUSIC,
    description: "Music industry and audio production",
  },

  // Construction & Engineering
  {
    name: "Construction",
    value: OrganisationIndustry.CONSTRUCTION,
    description: "Construction and building services",
  },
  {
    name: "Civil Engineering",
    value: OrganisationIndustry.CIVIL_ENGINEERING,
    description: "Civil engineering and infrastructure",
  },
  {
    name: "Architecture & Planning",
    value: OrganisationIndustry.ARCHITECTURE_AND_PLANNING,
    description: "Architectural design and urban planning",
  },
  {
    name: "Building Materials",
    value: OrganisationIndustry.BUILDING_MATERIALS,
    description: "Construction materials and supplies",
  },

  // Transportation & Logistics
  {
    name: "Transportation",
    value: OrganisationIndustry.TRANSPORTATION,
    description: "Transportation services and logistics",
  },
  {
    name: "Logistics & Supply Chain",
    value: OrganisationIndustry.LOGISTICS_AND_SUPPLY_CHAIN,
    description: "Supply chain management and distribution",
  },
  {
    name: "Maritime",
    value: OrganisationIndustry.MARITIME,
    description: "Shipping and maritime services",
  },
  {
    name: "Airlines/Aviation",
    value: OrganisationIndustry.AIRLINES_AND_AVIATION,
    description: "Airlines and aviation services",
  },

  // Agriculture
  {
    name: "Farming",
    value: OrganisationIndustry.FARMING,
    description: "Agricultural farming and crop production",
  },
  {
    name: "Agribusiness",
    value: OrganisationIndustry.AGRIBUSINESS,
    description: "Agricultural business and food production",
  },
  {
    name: "Fishery",
    value: OrganisationIndustry.FISHERY,
    description: "Fishing industry and aquaculture",
  },
  {
    name: "Ranching",
    value: OrganisationIndustry.RANCHING,
    description: "Livestock ranching and animal husbandry",
  },

  // Other
  {
    name: "Other",
    value: OrganisationIndustry.OTHER,
    description: "Industries not listed above",
  },
];
