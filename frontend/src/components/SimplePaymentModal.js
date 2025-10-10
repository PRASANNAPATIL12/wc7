import React, { useState } from 'react';
import { X, Gift, Heart } from 'lucide-react';
import { useAppTheme } from '../App';

const SimplePaymentModal = ({ isOpen, onClose, weddingId, honeymoonFund = {} }) => {
  const [amount, setAmount] = useState('');
  const [contributorName, setContributorName] = useState('');
  const { themes, currentTheme } = useAppTheme();
  const theme = themes[currentTheme];

  console.log('SimplePaymentModal render - isOpen:', isOpen);

  if (!isOpen) {
    console.log('Modal not showing because isOpen is false');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 relative"
        style={{ 
          backgroundColor: theme.background,
          color: theme.text
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: theme.accent }}
            >
              <Heart className="w-6 h-6" style={{ color: 'white' }} />
            </div>
            <div>
              <h2 
                className="text-xl font-semibold"
                style={{ color: theme.primary }}
              >
                Contribute to Honeymoon
              </h2>
              <p className="text-sm" style={{ color: theme.textLight }}>
                {honeymoonFund.destination || 'Tokyo & Kyoto, Japan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: theme.text }} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="text-center mb-6">
            <p 
              className="text-lg leading-relaxed"
              style={{ color: theme.textLight }}
            >
              {honeymoonFund.description || 'Help us create unforgettable memories on our honeymoon. Every contribution, big or small, means the world to us!'}
            </p>
          </div>

          {/* Simple Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Contribution Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ color: theme.text }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Your Name
              </label>
              <input
                type="text"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ color: theme.text }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-full border border-gray-300 font-medium transition-all duration-300"
              style={{ color: theme.textLight }}
            >
              Cancel
            </button>
            <button
              className="flex-1 px-6 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
              style={{
                backgroundColor: theme.accent,
                color: 'white'
              }}
              onClick={() => {
                alert(`Payment simulation: ₹${amount} from ${contributorName}`);
                onClose();
              }}
            >
              <Gift className="w-5 h-5" />
              Pay ₹{amount || '0'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePaymentModal;