
import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Switch from '../../components/ui/Switch';
import { CheckCircle } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const { user } = useApp();
    const { t } = useLanguage();
    
    // State for profile information
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        avatar: user?.avatar || 'https://picsum.photos/seed/default/200'
    });

    // State for notification preferences
    const [notifications, setNotifications] = useState({
        priceAlerts: true,
        shipmentUpdates: true,
        policyReminders: false,
        marketplaceNews: true,
    });

    const [showPolicyReminderConfirmation, setShowPolicyReminderConfirmation] = useState(false);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
        setNotifications({ ...notifications, [key]: value });
        if (key === 'policyReminders') {
            setShowPolicyReminderConfirmation(value);
        }
    };
    
    const handleProfileSave = () => {
        console.log('Saving profile:', profile);
        // In a real app, you would call an API here.
        alert('Profile changes saved! (Check console for details)');
    };

    const handleNotificationsSave = () => {
        console.log('Saving notification preferences:', notifications);
        alert('Notification preferences saved! (Check console for details)');
    };

    if (!user) {
        return <div>Loading user settings...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('settings.profileSettings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <img src={profile.avatar} alt="User Avatar" className="h-24 w-24 rounded-full object-cover" />
                        <div>
                            <button className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                                {t('settings.uploadPicture')}
                            </button>
                            <p className="mt-2 text-xs text-gray-500">{t('settings.uploadHint')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.fullName')}</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={profile.name}
                                onChange={handleProfileChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.emailAddress')}</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>
                     <div className="flex justify-end">
                        <button onClick={handleProfileSave} className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                            {t('settings.saveChanges')}
                        </button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('settings.notificationPreferences')}</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="py-4 flex justify-between items-center">
                        <div>
                            <p className="font-medium">{t('settings.priceAlerts')}</p>
                            <p className="text-sm text-gray-500">{t('settings.priceAlertsDesc')}</p>
                        </div>
                        <Switch id="priceAlerts" checked={notifications.priceAlerts} onChange={(value) => handleNotificationChange('priceAlerts', value)} />
                    </div>
                     <div className="py-4 flex justify-between items-center">
                        <div>
                            <p className="font-medium">{t('settings.shipmentUpdates')}</p>
                            <p className="text-sm text-gray-500">{t('settings.shipmentUpdatesDesc')}</p>
                        </div>
                        <Switch id="shipmentUpdates" checked={notifications.shipmentUpdates} onChange={(value) => handleNotificationChange('shipmentUpdates', value)} />
                    </div>
                     <div className="py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{t('settings.policyReminders')}</p>
                                <p className="text-sm text-gray-500">{t('settings.policyRemindersDesc')}</p>
                            </div>
                            <Switch id="policyReminders" checked={notifications.policyReminders} onChange={(value) => handleNotificationChange('policyReminders', value)} />
                        </div>
                        {showPolicyReminderConfirmation && (
                            <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md text-sm flex items-center animate-fade-in">
                                <CheckCircle size={16} className="mr-2" />
                                {t('settings.policyRemindersActive')}
                            </div>
                        )}
                    </div>
                     <div className="py-4 flex justify-between items-center">
                        <div>
                            <p className="font-medium">{t('settings.marketplaceNews')}</p>
                            <p className="text-sm text-gray-500">{t('settings.marketplaceNewsDesc')}</p>
                        </div>
                        <Switch id="marketplaceNews" checked={notifications.marketplaceNews} onChange={(value) => handleNotificationChange('marketplaceNews', value)} />
                    </div>
                     <div className="flex justify-end pt-6">
                        <button onClick={handleNotificationsSave} className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                            {t('settings.savePreferences')}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;