export type UserRole = 'Farmer' | 'FPO' | 'Processor' | 'Logistics' | 'Policymaker';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface PriceData {
  date: string;
  commodity: string;
  price: number;
  state: string;
  market_name: string;
  type: 'historical' | 'forecast';
}

export interface WeatherAdvisory {
    irrigation: string;
    pestAlerts: string[];
    harvestWindow: string;
    postHarvest: string;
}

export interface Transaction {
    transaction_id: string;
    previous_hash: string;
    timestamp: string;
    stakeholder: {
        id: string;
        role: UserRole;
        name: string;
        location: string;
    };
    product: {
        batch_id: string;
        commodity: string;
        quantity_kg: number;
        quality_grade: string;
    };
    action: "harvest" | "storage" | "processing" | "transport" | "retail";
    geo_coordinates: {
        lat: number;
        lon: number;
    };
    digital_signature: string;
}

export interface Warehouse {
    id: string;
    name: string;
    location: string;
    geo_coordinates: { lat: number, lon: number };
    capacity_mt: number;
    current_stock_mt: number;
    commodity_types: string[];
}

export interface Product {
    id: string;
    farmer_id: string;
    farmer_name: string;
    commodity: string;
    quantity_mt: number;
    price_per_kg: number;
    quality_grade: string;
    image: string;
    location: string;
    harvest_date: string;
}

export interface Shipment {
  id: string;
  truckId: string;
  origin: string;
  destination: string;
  origin_coords: { lat: number; lon: number; };
  destination_coords: { lat: number; lon: number; };
  current_coords: { lat: number; lon: number; };
  status: 'In Transit' | 'Delayed' | 'Delivered';
  estimatedDelivery: string;
  monitoring: {
    temperature_celsius: number;
    humidity_percent: number;
  };
}

export interface ProductDetails {
  commodity: string;
  description: string;
  nutritionalValue: {
    calories: string;
    protein: string;
    fat: string;
    carbohydrates: string;
  };
  growingConditions: {
    climate: string;
    soil: string;
    rainfall: string;
  };
  typicalUses: string[];
}

export interface FarmerCreditProfile {
  id: string;
  farmSizeAcres: number;
  cropHistory: string[];
  transactionReliabilityScore: number; // 0-1
  repaymentHistoryScore: number; // 0-1
  farmProductivityScore: number; // 0-1
}

export interface CreditScore {
    score: number;
    rating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    eligibility: string;
}

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  crop: string;
  season: string;
  sumInsured: number;
  premium: number;
  status: 'Active' | 'Expired';
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  claimAmount: number;
  date: string;
  status: 'Filed' | 'Under Review' | 'Approved' | 'Rejected';
  reason: string;
}

export interface Incentive {
  id: string;
  description: string;
  points: number;
  date: string;
}
