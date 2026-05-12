import {
  BasicApiResponse,
  DatabaseStatus,
  DataServiceResponse,
  ErrorApiResponse,
  OrderBy,
} from "../types/general";

// Enums
export enum OrganisationIndustry {
  // Technology
  INFORMATION_TECHNOLOGY = "Information Technology",
  SOFTWARE = "Software",
  HARDWARE = "Hardware",
  TELECOMMUNICATIONS = "Telecommunications",
  INTERNET = "Internet",

  // Finance
  BANKING = "Banking",
  INSURANCE = "Insurance",
  FINANCIAL_SERVICES = "Financial Services",
  ACCOUNTING = "Accounting",
  VENTURE_CAPITAL = "Venture Capital & Private Equity",

  // Healthcare
  HOSPITAL_AND_HEALTH_CARE = "Hospital & Health Care",
  PHARMACEUTICALS = "Pharmaceuticals",
  MEDICAL_DEVICES = "Medical Devices",
  BIOTECHNOLOGY = "Biotechnology",
  MENTAL_HEALTH_CARE = "Mental Health Care",

  // Retail & E-commerce
  RETAIL = "Retail",
  ECOMMERCE = "E-commerce",
  APPAREL_AND_FASHION = "Apparel & Fashion",
  CONSUMER_GOODS = "Consumer Goods",
  LUXURY_GOODS_AND_JEWELRY = "Luxury Goods & Jewelry",

  // Manufacturing
  MANUFACTURING = "Manufacturing",
  AUTOMOTIVE = "Automotive",
  AVIATION_AND_AEROSPACE = "Aviation & Aerospace",
  INDUSTRIAL_AUTOMATION = "Industrial Automation",
  MACHINERY = "Machinery",

  // Professional Services
  LEGAL_SERVICES = "Legal Services",
  MANAGEMENT_CONSULTING = "Management Consulting",
  MARKETING_AND_ADVERTISING = "Marketing & Advertising",
  REAL_ESTATE = "Real Estate",
  STAFFING_AND_RECRUITING = "Staffing & Recruiting",

  // Energy & Utilities
  OIL_AND_GAS = "Oil & Gas",
  RENEWABLE_ENERGY = "Renewable Energy",
  UTILITIES = "Utilities",
  MINING_AND_METALS = "Mining & Metals",

  // Hospitality & Tourism
  HOSPITALITY = "Hospitality",
  RESTAURANTS = "Restaurants",
  LEISURE_TRAVEL_AND_TOURISM = "Leisure, Travel & Tourism",
  EVENTS_SERVICES = "Events Services",

  // Education
  EDUCATION_MANAGEMENT = "Education Management",
  HIGHER_EDUCATION = "Higher Education",
  E_LEARNING = "E-learning",
  PRIMARY_AND_SECONDARY_EDUCATION = "Primary/Secondary Education",

  // Government & Non-Profit
  GOVERNMENT_ADMINISTRATION = "Government Administration",
  NON_PROFIT_ORGANIZATION_MANAGEMENT = "Non-Profit Organisation Management",
  PUBLIC_POLICY = "Public Policy",
  INTERNATIONAL_AFFAIRS = "International Affairs",

  // Media & Entertainment
  MEDIA_PRODUCTION = "Media Production",
  ENTERTAINMENT = "Entertainment",
  BROADCAST_MEDIA = "Broadcast Media",
  PUBLISHING = "Publishing",
  MUSIC = "Music",

  // Construction & Engineering
  CONSTRUCTION = "Construction",
  CIVIL_ENGINEERING = "Civil Engineering",
  ARCHITECTURE_AND_PLANNING = "Architecture & Planning",
  BUILDING_MATERIALS = "Building Materials",

  // Transportation & Logistics
  TRANSPORTATION = "Transportation",
  LOGISTICS_AND_SUPPLY_CHAIN = "Logistics & Supply Chain",
  MARITIME = "Maritime",
  AIRLINES_AND_AVIATION = "Airlines/Aviation",

  // Agriculture
  FARMING = "Farming",
  AGRIBUSINESS = "Agribusiness",
  FISHERY = "Fishery",
  RANCHING = "Ranching",

  // Other
  OTHER = "Other",
}

export enum OrganisationSettingsDateFormat {
  DD_MM_YYYY = "DD-MM-YYYY",
  MM_DD_YYYY = "MM-DD-YYYY",
  YYYY_MM_DD = "YYYY-MM-DD",
}

export enum OrganisationSettingsTimeFormat {
  TWELVE_HOUR = "12_hour",
  TWENTY_FOUR_HOUR = "24_hour",
}

export enum OrganisationSortBy {
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
  NAME = "name",
  INDUSTRY = "industry",
}

export enum ApiActionOrganisation {
  // Collection operations
  GET_FILTERED = "GET_FILTERED",
  GET_FILTERED_MEMBER = "GET_FILTERED_MEMBER",
  GET_STATISTICS = "GET_STATISTICS",
  CREATE = "CREATE",

  // Individual organisation operations
  GET_BY_ID = "GET_BY_ID",
  UPDATE = "UPDATE",
  DELETE = "DELETE",

  // Organisation-specific operations
  UPDATE_DATABASE_STATUS = "UPDATE_DATABASE_STATUS",
}

// Base interfaces
export interface TendiflowFile {
  id: string;
  created_at: string;
  updated_at: string | null;
  creator_id: string | null;
  updator_id: string | null;
  blob_name: string;
  name: string;
  pathname: string;
  mime_type: string;
  size_bytes: number;
  position: number;
  notes: string | null;
}

export interface OrganisationAddress {
  street: string;
  city: string;
  state: string;
  country_code: string;
  postal_code: string;
}

export interface OrganisationSettings {
  require_location_for_checkin: boolean;
  allow_guest_checkin: boolean;
  default_meeting_duration: number;
  timezone: string;
  date_format: OrganisationSettingsDateFormat;
  time_format: OrganisationSettingsTimeFormat;
  allow_meeting_edit_after_start: boolean;
  allow_meeting_delete_after_start: boolean;
}

export interface OrganisationBase {
  name: string;
  description?: string | null;
  website_url?: string | null;
  contact_email?: string | null;
  contact_phone_number?: string | null;
  industry: OrganisationIndustry;
  address?: OrganisationAddress | null;
  settings: OrganisationSettings;
}

export interface OrganisationAvatar {
  avatar: TendiflowFile | null;
}

export interface Organisation extends OrganisationBase, OrganisationAvatar {
  id: string;
  created_at: string;
  updated_at: string | null;
  creator_id: string | null;
  updator_id: string | null;
  database_status: DatabaseStatus;
}

export interface OrganisationRelationship {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  industry: OrganisationIndustry;
}

export interface OrganisationStatistics {
  organisation_id: string;
  active_meetings_count: number;
  upcoming_meetings_count: number;
  unique_attendees_count: number;
}

// Request interfaces
export interface OrganisationAddressInput extends OrganisationAddress {}

export interface OrganisationCreate extends OrganisationBase {
  address: OrganisationAddressInput | null;
}

export interface OrganisationUpdate extends OrganisationBase {
  address: OrganisationAddressInput | null;
}

export interface OrganisationDatabaseStatusUpdate {
  database_status: DatabaseStatus;
}

// Query interfaces
export interface OrganisationQuery {
  ids?: string[] | null;
  database_statuses?: DatabaseStatus[] | null;
  industries?: OrganisationIndustry[] | null;
  country_codes?: string[] | null;
  cities?: string[] | null;
  search?: string | null;
  sort_by?: OrganisationSortBy;
  order_by?: OrderBy;
}

export interface OrganisationParams {
  skip?: number;
  limit?: number;
}

// API Response types
export type GetOrganisationsResponseApi = Organisation[] | ErrorApiResponse;
export type GetOrganisationResponseApi = Organisation | ErrorApiResponse;
export type CreateOrganisationResponseApi = Organisation | ErrorApiResponse;
export type UpdateOrganisationResponseApi = Organisation | ErrorApiResponse;
export type UpdateOrganisationDatabaseStatusResponseApi =
  | Organisation
  | ErrorApiResponse;
export type DeleteOrganisationResponseApi = BasicApiResponse | ErrorApiResponse;
export type GetOrganisationStatisticsResponseApi =
  | OrganisationStatistics
  | ErrorApiResponse;

// Service props
export interface GetManyFilteredOrganisationsProps {
  query: OrganisationQuery;
  params: OrganisationParams;
}

export interface CreateOrganisationProps {
  data: OrganisationCreate;
}

export interface GetByIdOrganisationProps {
  id: string;
}

export interface UpdateOrganisationProps {
  id: string;
  data: OrganisationUpdate;
}

export interface UpdateOrganisationDatabaseStatusProps {
  id: string;
  data: OrganisationDatabaseStatusUpdate;
}

export interface DeleteOrganisationProps {
  id: string;
}

export interface GetOrganisationStatisticsProps {
  id: string;
}

// Hook interfaces
export interface UseCurrentOrganisation {
  currentOrganisation: Organisation | null;
  isLoading: boolean;
  error: string;
  setCurrentOrganisation: (id: string | null) => void;
  mutateCurrentOrganisation: () => void;
}

export interface CurrentOrganisationContextType {
  currentOrganisation: Organisation | null;
  isLoading: boolean;
  error: string | null;
  setCurrentOrganisation: (id: string | null) => void;
  mutateCurrentOrganisation: () => void;
}

export interface UseOrganisations {
  organisations: Organisation[];
  isLoading: boolean;
  error: string;
  handleMutateOrganisations: () => void;
}

export interface UseOrganisationStatistics {
  statistics: OrganisationStatistics | null;
  isLoading: boolean;
  error: string;
  handleMutateStatistics: () => void;
}

export type OrganisationsManyResponse = DataServiceResponse<
  Organisation[] | null
> | null;

export type OrganisationStatisticsResponse =
  DataServiceResponse<OrganisationStatistics | null> | null;
