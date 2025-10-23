import React, { useState, useMemo } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { mockFarmerProfile, mockInsurancePolicies, mockInsuranceClaims, mockIncentives } from '../../data/mockData';
import { calculateCreditScore, calculateInsurancePremium } from '../../services/financeService';
import { Banknote, X, ShieldCheck, FileText, Calculator, Award, Star } from 'lucide-react';

const CreditScoreGauge = ({ score, rating }) => {
  const percentage = (score - 300) / 600;
  const semiCircleCircumference = Math.PI * 30;
  const strokeDashoffset = semiCircleCircumference * (1 - percentage);

  const ratingStyles = {
    Poor: 'text-red-500',
    Fair: 'text-yellow-500',
    Good: 'text-blue-500',
    Excellent: 'text-green-500',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="relative w-40 h-20">
        <svg className="w-full h-full" viewBox="0 0 80 45">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <path d="M10 40 A 30 30 0 0 1 70 40" className="stroke-gray-200 dark:stroke-gray-600" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M10 40 A 30 30 0 0 1 70 40" stroke="url(#gaugeGradient)" strokeWidth="8" fill="none" strokeLinecap="round" style={{ strokeDasharray: semiCircleCircumference, strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }} />
        </svg>
        <div className="absolute bottom-[-5px] w-full text-center">
          <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">{score}</span>
        </div>
      </div>
      <span className={`text-xl font-semibold ${ratingStyles[rating]}`}>{rating}</span>
    </div>
  );
};

const CreditWizard = ({ isOpen, onClose, farmerProfile }) => {
  if (!isOpen) return null;
  // This is a simplified version of the wizard from before for brevity.
  // The core new functionality is on the main dashboard.
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Kisan Credit Card Application</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Pre-filled Information</h3>
            <p><strong>Farm Size:</strong> {farmerProfile.farmSizeAcres} acres</p>
            <p className="mb-4"><strong>Crop History:</strong> {farmerProfile.cropHistory.join(', ')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">The next step would involve uploading land records via AgriStack. This feature is a prototype demonstration.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold">Close</button>
        </div>
      </div>
    </div>
  );
};


const InsuranceCalculator: React.FC = () => {
    const [area, setArea] = useState(10);
    const [sumInsured, setSumInsured] = useState(50000);
    const [crop, setCrop] = useState('Mustard');
    const premium = useMemo(() => calculateInsurancePremium(crop, area, sumInsured), [crop, area, sumInsured]);

    return(
        <Card>
            <CardHeader><CardTitle className="flex items-center"><Calculator size={18} className="mr-2"/>Insurance Premium Calculator (PMFBY)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium">Crop</label>
                    <select value={crop} onChange={e => setCrop(e.target.value)} className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        <option>Mustard</option>
                        <option>Soybean</option>
                        <option>Groundnut</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Area (in Acres)</label>
                    <input type="number" value={area} onChange={e => setArea(parseFloat(e.target.value))} className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Sum Insured (₹)</label>
                    <input type="number" value={sumInsured} onChange={e => setSumInsured(parseFloat(e.target.value))} className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                <div className="text-center pt-2">
                    <p className="text-gray-600 dark:text-gray-400">Estimated Farmer's Premium:</p>
                    <p className="text-3xl font-bold text-green-600">₹{premium}</p>
                </div>
            </CardContent>
        </Card>
    );
};

const FinanceDashboard = () => {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const creditProfile = mockFarmerProfile;
    const creditScore = useMemo(() => calculateCreditScore(creditProfile), [creditProfile]);
    const totalIncentivePoints = useMemo(() => mockIncentives.reduce((sum, item) => sum + item.points, 0), []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'text-green-500 bg-green-100 dark:bg-green-900';
            case 'Under Review': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900';
            case 'Active': return 'text-blue-500 bg-blue-100 dark:bg-blue-900';
            case 'Rejected': return 'text-red-500 bg-red-100 dark:bg-red-900';
            default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-6">
             <Card>
                <CardHeader><CardTitle>My Credit Score</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <CreditScoreGauge score={creditScore.score} rating={creditScore.rating} />
                  <p className="text-sm text-center text-gray-600 dark:text-gray-400 px-4">{creditScore.eligibility}</p>
                   <button onClick={() => setIsWizardOpen(true)} className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700">
                        Apply for KCC Loan
                    </button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center"><Award size={18} className="mr-2" />Performance Incentives</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-center mb-4">
                        <p className="text-gray-600 dark:text-gray-400">Total Reward Points</p>
                        <p className="text-4xl font-bold text-yellow-500">{totalIncentivePoints}</p>
                        <p className="text-xs text-gray-500">Redeem for input subsidies or reduced premiums.</p>
                    </div>
                    <div className="space-y-2 text-sm">
                        {mockIncentives.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                                <div>
                                    <p>{item.description}</p>
                                    <p className="text-xs text-gray-500">{item.date}</p>
                                </div>
                                <span className="font-bold text-yellow-600">+{item.points} pts</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
              </Card>
          </div>
          
          <div className="xl:col-span-1 space-y-6">
            <InsuranceCalculator />
            <Card>
                <CardHeader><CardTitle className="flex items-center"><ShieldCheck size={18} className="mr-2"/>My Insurance Policies</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {mockInsurancePolicies.map(policy => (
                        <div key={policy.id} className="p-3 border rounded-lg dark:border-gray-700">
                             <div className="flex justify-between items-center mb-1">
                                <span className="font-bold">{policy.crop} - {policy.season}</span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(policy.status)}`}>{policy.status}</span>
                            </div>
                            <p className="text-xs text-gray-500">Policy #{policy.policyNumber}</p>
                            <div className="text-sm flex justify-between mt-2 pt-2 border-t dark:border-gray-600">
                                <span>Sum Insured: <span className="font-semibold">₹{policy.sumInsured}</span></span>
                                <span>Premium: <span className="font-semibold">₹{policy.premium}</span></span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-1">
            <Card>
                <CardHeader><CardTitle className="flex items-center"><FileText size={18} className="mr-2"/>Active Insurance Claims</CardTitle></CardHeader>
                <CardContent>
                     <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-2">
                        {mockInsuranceClaims.map(claim => (
                             <div key={claim.id} className="mb-6 ml-6">
                                <span className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full ring-4 ring-white dark:ring-gray-800 ${getStatusColor(claim.status)}`}></span>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">Claim: ₹{claim.claimAmount}</p>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(claim.status)}`}>{claim.status}</span>
                                    </div>
                                     <p className="text-xs text-gray-500 mt-1">{claim.date} - for Policy #{claim.policyId}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </CardContent>
            </Card>
          </div>
          
          <CreditWizard 
            isOpen={isWizardOpen} 
            onClose={() => setIsWizardOpen(false)}
            farmerProfile={creditProfile}
          />
        </div>
    );
};

export default FinanceDashboard;