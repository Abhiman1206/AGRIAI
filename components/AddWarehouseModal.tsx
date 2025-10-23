
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, Warehouse } from 'lucide-react';

interface AddWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; capacity: number; commodity_types: string[] }) => void;
  position: { lat: number; lng: number } | null;
}

const commodityOptions = ["Mustard", "Soybean", "Groundnut", "Sunflower", "Palm Oil"];

const AddWarehouseModal: React.FC<AddWarehouseModalProps> = ({ isOpen, onClose, onSubmit, position }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [commodities, setCommodities] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setCapacity('');
      setCommodities([]);
    }
  }, [isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const capacityNum = parseInt(capacity, 10);
    if (name && capacityNum > 0 && commodities.length > 0) {
      onSubmit({ name, capacity: capacityNum, commodity_types: commodities });
    }
  };

  const handleCommodityToggle = (commodity: string) => {
    setCommodities(prev => 
      prev.includes(commodity) 
        ? prev.filter(c => c !== commodity)
        : [...prev, commodity]
    );
  }

  if (!isOpen || !position) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <Warehouse size={22} className="mr-3 text-green-600"/>
            {t('logisticsDashboard.modal.title')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('logisticsDashboard.modal.nameLabel')}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('logisticsDashboard.modal.namePlaceholder')}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('logisticsDashboard.modal.capacityLabel')}
              </label>
              <input
                type="number"
                id="capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder={t('logisticsDashboard.modal.capacityPlaceholder')}
                required
                min="1"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('logisticsDashboard.modal.commoditiesLabel')}
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                    {commodityOptions.map(option => (
                        <button 
                            type="button" 
                            key={option}
                            onClick={() => handleCommodityToggle(option)}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                                commodities.includes(option) 
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-gray-100 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('logisticsDashboard.modal.locationInfo')}: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
              {t('logisticsDashboard.modal.cancelButton')}
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-gray-400"
              disabled={!name || !capacity || commodities.length === 0}
            >
              {t('logisticsDashboard.modal.addButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWarehouseModal;
