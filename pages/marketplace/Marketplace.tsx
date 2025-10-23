
import React, { useState } from 'react';
import Card, { CardContent } from '../../components/ui/Card';
import { mockProducts } from '../../data/mockData';
import { Product, ProductDetails } from '../../types';
import { getProductDetails } from '../../services/geminiService';
import { Tag, MapPin, Scale, ChevronsRight, X, Sprout, Thermometer, Droplets } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ProductCard: React.FC<{ product: Product; onClick: (product: Product) => void; }> = ({ product, onClick }) => {
    const { t } = useLanguage();
    return (
        <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onClick(product)}>
            <div className="overflow-hidden">
                 <img src={product.image} alt={product.commodity} className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <CardContent className="p-4 flex-grow flex flex-col">
                <h3 className="text-xl font-bold">{product.commodity}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">by {product.farmer_name}</p>
                
                <div className="mt-4 flex-grow space-y-2 text-sm">
                    <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-400" /> {product.location}</p>
                    <p className="flex items-center"><Scale className="h-4 w-4 mr-2 text-gray-400" /> {product.quantity_mt} MT</p>
                    <p className="flex items-center"><Tag className="h-4 w-4 mr-2 text-gray-400" /> {t('marketplace.grade')}: {product.quality_grade}</p>
                </div>

                <div className="mt-4 pt-4 border-t dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-lg font-bold text-green-600 dark:text-green-500">₹{product.price_per_kg}/kg</p>
                    </div>
                     <div className="text-green-600 text-sm font-semibold flex items-center group-hover:text-green-500">
                        {t('marketplace.viewDetails')} <ChevronsRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


const Marketplace: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const { t } = useLanguage();

    const handleProductClick = async (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
        setIsDetailsLoading(true);
        setProductDetails(null); 

        const details = await getProductDetails(product.commodity);
        setProductDetails(details);
        setIsDetailsLoading(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setProductDetails(null);
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t('sidebar.marketplace')}</h1>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700">
                    + {t('marketplace.listNewProduct')}
                </button>
            </div>

            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" placeholder={t('marketplace.searchCommodity')} className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                    <input type="text" placeholder={t('marketplace.location')} className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                    <input type="number" placeholder={t('marketplace.minQuantity')} className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                    <button className="bg-f59e0b text-white p-2 rounded-lg bg-yellow-500 hover:bg-yellow-600">{t('marketplace.applyFilters')}</button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockProducts.map(product => (
                    <ProductCard key={product.id} product={product} onClick={handleProductClick} />
                ))}
            </div>
             {isModalOpen && selectedProduct && (
                 <div 
                    className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
                    onClick={handleCloseModal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="product-details-title"
                >
                    <div 
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden transform animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-full md:w-1/3 flex-shrink-0">
                            <img src={selectedProduct.image} alt={selectedProduct.commodity} className="w-full h-full object-cover"/>
                        </div>
                        <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col overflow-y-auto relative">
                             <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close modal">
                                <X size={24} />
                            </button>
                            <h2 id="product-details-title" className="text-3xl font-bold mb-2">{selectedProduct.commodity}</h2>
                             <p className="text-md text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 pb-4 mb-4">
                                {t('marketplace.grade')} {selectedProduct.quality_grade} from {selectedProduct.location}
                            </p>

                            {isDetailsLoading ? (
                                <div className="flex-grow flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                                    <p className="ml-4 text-gray-600 dark:text-gray-300">{t('marketplace.fetchingInsights')}</p>
                                </div>
                            ) : productDetails ? (
                                <div className="space-y-6 text-sm">
                                    <p className="italic text-gray-600 dark:text-gray-400">{productDetails.description}</p>
                                    
                                    <div>
                                        <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">{t('marketplace.nutritionalValue')}</h4>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-700 dark:text-gray-300">
                                            <span><strong>{t('marketplace.calories')}:</strong> {productDetails.nutritionalValue.calories}</span>
                                            <span><strong>{t('marketplace.protein')}:</strong> {productDetails.nutritionalValue.protein}</span>
                                            <span><strong>{t('marketplace.fat')}:</strong> {productDetails.nutritionalValue.fat}</span>
                                            <span><strong>{t('marketplace.carbs')}:</strong> {productDetails.nutritionalValue.carbohydrates}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">{t('marketplace.growingConditions')}</h4>
                                         <div className="space-y-2 text-gray-700 dark:text-gray-300">
                                            <p className="flex items-center"><Thermometer className="h-4 w-4 mr-2 text-red-400" /><strong>{t('marketplace.climate')}:</strong> {productDetails.growingConditions.climate}</p>
                                            <p className="flex items-center"><Sprout className="h-4 w-4 mr-2 text-green-400" /><strong>{t('marketplace.soil')}:</strong> {productDetails.growingConditions.soil}</p>
                                            <p className="flex items-center"><Droplets className="h-4 w-4 mr-2 text-blue-400" /><strong>{t('marketplace.rainfall')}:</strong> {productDetails.growingConditions.rainfall}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">{t('marketplace.typicalUses')}</h4>
                                        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                                            {productDetails.typicalUses.map((use, index) => <li key={index}>{use}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">{t('marketplace.loadError')}</p>
                            )}

                             <div className="mt-auto pt-6 flex justify-end space-x-4">
                                <button onClick={handleCloseModal} className="px-6 py-2 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">{t('marketplace.close')}</button>
                                <button className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700">{t('marketplace.contactSeller')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketplace;
