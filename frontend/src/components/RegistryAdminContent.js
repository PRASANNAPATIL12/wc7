import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Phone, CreditCard, Save, DollarSign, Edit3, Trash2, Plus } from 'lucide-react';

const RegistryAdminContent = ({ initialData, theme, onSave }) => {
  const [honeymoonConfig, setHoneymoonConfig] = useState({
    upi_id: '',
    phone_number: '',
    destination: 'Tokyo & Kyoto, Japan',
    description: 'Help us create unforgettable memories on our honeymoon to Japan. Every contribution, big or small, means the world to us!',
    image_url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=400&fit=crop',
    is_active: true
  });

  const [contributions, setContributions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Initialize from existing data
  useEffect(() => {
    if (initialData && initialData.honeymoon_fund) {
      setHoneymoonConfig({
        ...honeymoonConfig,
        ...initialData.honeymoon_fund
      });
    }
  }, [initialData]);

  // Fetch contributions when component mounts
  useEffect(() => {
    if (initialData?.id) {
      fetchContributions();
    }
  }, [initialData?.id]);

  const fetchContributions = async () => {
    try {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) return;

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/payment/contributions/${initialData.id}?session_id=${sessionId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setContributions(data.contributions || []);
        setTotalAmount(data.total_amount || 0);
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
    }
  };

  const handleConfigChange = (field, value) => {
    const newConfig = {
      ...honeymoonConfig,
      [field]: value
    };
    setHoneymoonConfig(newConfig);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        alert('Please log in to save registry settings');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/wedding/registry`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...honeymoonConfig,
          session_id: sessionId
        }),
      });

      if (response.ok) {
        // Also update the parent component
        onSave('honeymoon_fund', honeymoonConfig);
        alert('Registry settings saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error saving settings: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('Error saving registry settings:', error);
      alert('Failed to save registry settings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.accent }}
          >
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold" style={{ color: theme.primary }}>
              Registry Management
            </h2>
            <p className="text-lg" style={{ color: theme.textLight }}>
              Configure your honeymoon fund settings
            </p>
          </div>
        </div>
        
        {totalAmount > 0 && (
          <div 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xl font-semibold"
            style={{ 
              backgroundColor: `${theme.accent}20`,
              color: theme.primary,
              border: `2px solid ${theme.accent}`
            }}
          >
            <DollarSign className="w-6 h-6" />
            Total Raised: ₹{totalAmount.toLocaleString()}
          </div>
        )}
      </div>

      {/* Configuration Form */}
      <div 
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border"
        style={{ borderColor: `${theme.accent}30` }}
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: theme.primary }}>
          <CreditCard className="w-6 h-6" />
          Payment Configuration
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              UPI ID *
            </label>
            <input
              type="text"
              value={honeymoonConfig.upi_id}
              onChange={(e) => handleConfigChange('upi_id', e.target.value)}
              placeholder="yourname@paytm"
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2"
              style={{ 
                color: theme.text,
                focusRingColor: theme.accent
              }}
            />
            <p className="text-xs mt-1" style={{ color: theme.textLight }}>
              Your UPI ID where payments will be received
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Phone Number *
            </label>
            <input
              type="tel"
              value={honeymoonConfig.phone_number}
              onChange={(e) => handleConfigChange('phone_number', e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2"
              style={{ 
                color: theme.text,
                focusRingColor: theme.accent
              }}
            />
            <p className="text-xs mt-1" style={{ color: theme.textLight }}>
              Phone number linked to your payment account
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Destination
            </label>
            <input
              type="text"
              value={honeymoonConfig.destination}
              onChange={(e) => handleConfigChange('destination', e.target.value)}
              placeholder="Tokyo & Kyoto, Japan"
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2"
              style={{ 
                color: theme.text,
                focusRingColor: theme.accent
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Photo URL
            </label>
            <input
              type="url"
              value={honeymoonConfig.image_url}
              onChange={(e) => handleConfigChange('image_url', e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2"
              style={{ 
                color: theme.text,
                focusRingColor: theme.accent
              }}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Description
          </label>
          <textarea
            value={honeymoonConfig.description}
            onChange={(e) => handleConfigChange('description', e.target.value)}
            placeholder="Help us create unforgettable memories..."
            rows="3"
            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2 resize-none"
            style={{ 
              color: theme.text,
              focusRingColor: theme.accent
            }}
          />
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={honeymoonConfig.is_active}
              onChange={(e) => handleConfigChange('is_active', e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: theme.accent }}
            />
            <label htmlFor="is_active" className="text-sm font-medium" style={{ color: theme.text }}>
              Enable honeymoon fund (visitors can contribute)
            </label>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || !honeymoonConfig.upi_id || !honeymoonConfig.phone_number}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.accent,
              color: 'white'
            }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Contributions List */}
      {contributions.length > 0 && (
        <div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border"
          style={{ borderColor: `${theme.accent}30` }}
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: theme.primary }}>
            <Heart className="w-6 h-6" />
            Recent Contributions ({contributions.length})
          </h3>
          
          <div className="space-y-4">
            {contributions.slice(0, 10).map((contribution, index) => (
              <div 
                key={contribution.id || index}
                className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                      style={{ backgroundColor: theme.accent, color: 'white' }}
                    >
                      {contribution.contributor_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: theme.text }}>
                        {contribution.contributor_name || 'Anonymous'}
                      </p>
                      <p className="text-sm" style={{ color: theme.textLight }}>
                        {formatDate(contribution.created_at)}
                      </p>
                    </div>
                  </div>
                  {contribution.message && (
                    <p className="text-sm mt-2 italic" style={{ color: theme.textLight }}>
                      "{contribution.message}"
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold" style={{ color: theme.accent }}>
                    ₹{contribution.amount?.toLocaleString()}
                  </p>
                  <p className="text-xs" style={{ color: theme.textLight }}>
                    {contribution.payment_status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div 
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        style={{ 
          backgroundColor: `${theme.accent}10`,
          borderColor: `${theme.accent}40`
        }}
      >
        <h4 className="font-semibold mb-2" style={{ color: theme.primary }}>
          How it works:
        </h4>
        <ul className="text-sm space-y-1" style={{ color: theme.textLight }}>
          <li>• Configure your UPI ID and phone number above</li>
          <li>• Guests can contribute to your honeymoon fund through secure payments</li>
          <li>• Payments are processed through Stripe and sent to your account</li>
          <li>• You can view all contributions and messages in real-time</li>
          <li>• Disable the fund anytime by unchecking the enable option</li>
        </ul>
      </div>
    </div>
  );
};

export default RegistryAdminContent;