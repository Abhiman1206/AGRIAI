import { User, PriceData, Transaction, Warehouse, Product, Shipment, FarmerCreditProfile, InsurancePolicy, InsuranceClaim, Incentive } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Ramesh Kumar', email: 'ramesh@farm.com', role: 'Farmer', avatar: 'https://picsum.photos/seed/ramesh/200' },
  { id: 'user-2', name: 'Sahayata FPO', email: 'sahayata@fpo.com', role: 'FPO', avatar: 'https://picsum.photos/seed/fpo/200' },
  { id: 'user-3', name: 'Adani Wilmar', email: 'contact@adani.com', role: 'Processor', avatar: 'httpsum.photos/seed/adani/200' },
  { id: 'user-4', name: 'SafeExpress', email: 'track@safeexpress.com', role: 'Logistics', avatar: 'https://picsum.photos/seed/logistics/200' },
  { id: 'user-5', name: 'Niti Aayog', email: 'policy@gov.in', role: 'Policymaker', avatar: 'https://picsum.photos/seed/gov/200' },
];

export const mockHistoricalPrices: PriceData[] = [
    { date: '2024-06-01', commodity: 'Mustard', price: 150, state: 'Rajasthan', market_name: 'Jaipur Mandi', type: 'historical' },
    { date: '2024-06-08', commodity: 'Mustard', price: 152, state: 'Rajasthan', market_name: 'Jaipur Mandi', type: 'historical' },
    { date: '2024-06-15', commodity: 'Mustard', price: 155, state: 'Rajasthan', market_name: 'Jaipur Mandi', type: 'historical' },
    { date: '2024-06-22', commodity: 'Mustard', price: 153, state: 'Rajasthan', market_name: 'Jaipur Mandi', type: 'historical' },
    { date: '2024-07-01', commodity: 'Mustard', price: 158, state: 'Rajasthan', market_name: 'Jaipur Mandi', type: 'historical' },
    { date: '2024-06-01', commodity: 'Soybean', price: 180, state: 'Madhya Pradesh', market_name: 'Indore Mandi', type: 'historical' },
    { date: '2024-06-08', commodity: 'Soybean', price: 185, state: 'Madhya Pradesh', market_name: 'Indore Mandi', type: 'historical' },
    { date: '2024-06-15', commodity: 'Soybean', price: 182, state: 'Madhya Pradesh', market_name: 'Indore Mandi', type: 'historical' },
    { date: '2024-06-22', commodity: 'Soybean', price: 188, state: 'Madhya Pradesh', market_name: 'Indore Mandi', type: 'historical' },
    { date: '2024-07-01', commodity: 'Soybean', price: 190, state: 'Madhya Pradesh', market_name: 'Indore Mandi', type: 'historical' },
];

const BATCH_ID = "MUSTARD-RJ-2024-07-15";
const generateHash = () => Math.random().toString(36).substring(2, 10);

const tx1_hash = generateHash();
const tx2_hash = generateHash();
const tx3_hash = generateHash();
const tx4_hash = generateHash();


export const mockTransactions: Transaction[] = [
    {
        transaction_id: tx1_hash,
        previous_hash: '00000000',
        timestamp: '2024-07-15T08:00:00Z',
        stakeholder: { id: 'user-1', role: 'Farmer', name: 'Ramesh Kumar', location: 'Alwar, Rajasthan' },
        product: { batch_id: BATCH_ID, commodity: 'Mustard', quantity_kg: 5000, quality_grade: 'A' },
        action: 'harvest',
        geo_coordinates: { lat: 27.5533, lon: 76.6335 },
        digital_signature: 'ab1...'
    },
    {
        transaction_id: tx2_hash,
        previous_hash: tx1_hash,
        timestamp: '2024-07-16T10:00:00Z',
        stakeholder: { id: 'user-2', role: 'FPO', name: 'Sahayata FPO', location: 'Jaipur, Rajasthan' },
        product: { batch_id: BATCH_ID, commodity: 'Mustard', quantity_kg: 5000, quality_grade: 'A' },
        action: 'storage',
        geo_coordinates: { lat: 26.9124, lon: 75.7873 },
        digital_signature: 'cd2...'
    },
    {
        transaction_id: tx3_hash,
        previous_hash: tx2_hash,
        timestamp: '2024-07-17T14:00:00Z',
        stakeholder: { id: 'user-4', role: 'Logistics', name: 'SafeExpress', location: 'On Route to Gujarat' },
        product: { batch_id: BATCH_ID, commodity: 'Mustard', quantity_kg: 5000, quality_grade: 'A' },
        action: 'transport',
        geo_coordinates: { lat: 24.5854, lon: 73.7125 },
        digital_signature: 'ef3...'
    },
    {
        transaction_id: tx4_hash,
        previous_hash: tx3_hash,
        timestamp: '2024-07-18T11:00:00Z',
        stakeholder: { id: 'user-3', role: 'Processor', name: 'Adani Wilmar', location: 'Mundra, Gujarat' },
        product: { batch_id: BATCH_ID, commodity: 'Mustard', quantity_kg: 5000, quality_grade: 'A' },
        action: 'processing',
        geo_coordinates: { lat: 22.8441, lon: 69.7057 },
        digital_signature: 'gh4...'
    }
];

export const mockWarehouses: Warehouse[] = [
    { id: 'wh-1', name: 'Jaipur Central Warehouse', location: 'Jaipur, Rajasthan', geo_coordinates: { lat: 26.9124, lon: 75.7873 }, capacity_mt: 10000, current_stock_mt: 7500, commodity_types: ['Mustard', 'Groundnut'] },
    { id: 'wh-2', name: 'Indore AgriHub', location: 'Indore, MP', geo_coordinates: { lat: 22.7196, lon: 75.8577 }, capacity_mt: 15000, current_stock_mt: 5500, commodity_types: ['Soybean'] },
    { id: 'wh-3', name: 'Nagpur Logistics Park', location: 'Nagpur, Maharashtra', geo_coordinates: { lat: 21.1458, lon: 79.0882 }, capacity_mt: 8000, current_stock_mt: 7200, commodity_types: ['Soybean', 'Sunflower'] },
    { id: 'wh-4', name: 'Mundra Port Storage', location: 'Mundra, Gujarat', geo_coordinates: { lat: 22.8441, lon: 69.7057 }, capacity_mt: 25000, current_stock_mt: 12000, commodity_types: ['Palm Oil', 'Mustard'] },
];

export const mockProducts: Product[] = [
    { id: 'prod-1', farmer_id: 'user-1', farmer_name: 'Ramesh Kumar', commodity: 'Mustard', quantity_mt: 5, price_per_kg: 160, quality_grade: 'A', image: 'https://picsum.photos/seed/mustard/400/300', location: 'Alwar, Rajasthan', harvest_date: '2024-07-15' },
    { id: 'prod-2', farmer_id: 'user-1a', farmer_name: 'Suresh Patel', commodity: 'Soybean', quantity_mt: 10, price_per_kg: 195, quality_grade: 'A+', image: 'https://picsum.photos/seed/soybean/400/300', location: 'Indore, MP', harvest_date: '2024-07-12' },
    { id: 'prod-3', farmer_id: 'user-1b', farmer_name: 'Geeta Devi', commodity: 'Groundnut', quantity_mt: 3, price_per_kg: 140, quality_grade: 'B', image: 'https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/6c590ce5-9153-5d97-860c-4ecc51969af1/aed8553e-8234-5dcb-80e6-0f2067c09e0e.jpg', location: 'Rajkot, Gujarat', harvest_date: '2024-07-18' },
    { id: 'prod-4', farmer_id: 'user-1c', farmer_name: 'Vikram Singh', commodity: 'Sunflower', quantity_mt: 8, price_per_kg: 175, quality_grade: 'A', image: 'https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/85ee17ec-74dd-532e-8096-6ba2768b6354/f68d539d-f21c-578c-af_8-b6bb2cd79ad6.jpg', location: 'Gulbarga, Karnataka', harvest_date: '2024-07-10' },
];

export const mockShipments: Shipment[] = [
  {
    id: 'ship-1',
    truckId: 'TRK-A142',
    origin: 'Jaipur, Rajasthan',
    destination: 'Mundra, Gujarat',
    origin_coords: { lat: 26.9124, lon: 75.7873 },
    destination_coords: { lat: 22.8441, lon: 69.7057 },
    current_coords: { lat: 26.9124, lon: 75.7873 },
    status: 'In Transit',
    estimatedDelivery: '2024-07-25T18:00:00Z',
    monitoring: { temperature_celsius: 4.5, humidity_percent: 65 },
  },
  {
    id: 'ship-2',
    truckId: 'TRK-B781',
    origin: 'Indore, MP',
    destination: 'Nagpur, Maharashtra',
    origin_coords: { lat: 22.7196, lon: 75.8577 },
    destination_coords: { lat: 21.1458, lon: 79.0882 },
    current_coords: { lat: 22.7196, lon: 75.8577 },
    status: 'Delayed',
    estimatedDelivery: '2024-07-26T12:00:00Z',
    monitoring: { temperature_celsius: 5.2, humidity_percent: 68 },
  },
  {
    id: 'ship-3',
    truckId: 'TRK-C303',
    origin: 'Gulbarga, Karnataka',
    destination: 'Hyderabad, Telangana',
    origin_coords: { lat: 17.3297, lon: 76.8343 },
    destination_coords: { lat: 17.3850, lon: 78.4867 },
    current_coords: { lat: 17.3297, lon: 76.8343 },
    status: 'In Transit',
    estimatedDelivery: '2024-07-25T10:00:00Z',
    monitoring: { temperature_celsius: 4.8, humidity_percent: 62 },
  },
];

export const mockFarmerProfile: FarmerCreditProfile = {
  id: 'user-1',
  farmSizeAcres: 12.5,
  cropHistory: ['Mustard (2023)', 'Soybean (2022)', 'Groundnut (2022)'],
  transactionReliabilityScore: 0.9,
  repaymentHistoryScore: 0.95,
  farmProductivityScore: 0.85,
};

export const mockInsurancePolicies: InsurancePolicy[] = [
    { id: 'pol-1', policyNumber: 'PMFBY-RJ-12345', crop: 'Mustard', season: 'Rabi 2024', sumInsured: 50000, premium: 2500, status: 'Active' },
    { id: 'pol-2', policyNumber: 'PMFBY-RJ-67890', crop: 'Soybean', season: 'Kharif 2023', sumInsured: 80000, premium: 4000, status: 'Expired' },
];

export const mockInsuranceClaims: InsuranceClaim[] = [
    { id: 'claim-1', policyId: 'pol-1', claimAmount: 15000, date: '2024-05-20', status: 'Approved', reason: 'Drought conditions' },
    { id: 'claim-2', policyId: 'pol-2', claimAmount: 20000, date: '2023-11-10', status: 'Under Review', reason: 'Pest attack' },
];

export const mockIncentives: Incentive[] = [
    { id: 'inc-1', description: 'Timely loan repayment', points: 50, date: '2024-06-01' },
    { id: 'inc-2', description: 'Quality produce certification (Grade A)', points: 30, date: '2024-05-15' },
    { id: 'inc-3', description: 'Sustainable practices adoption (Drip Irrigation)', points: 40, date: '2024-04-22' },
];
