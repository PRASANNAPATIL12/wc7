import React, { useState, useEffect } from 'react';
import { X, Gift, CreditCard, Smartphone, Globe, Heart } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAppTheme } from '../App';

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const PaymentForm = ({ 
  amount, 
  contributorName, 
  contributorEmail, 
  contributorPhone, 
  message, 
  weddingId, 
  onSuccess, 
  onError,
  onClose,
  honeymoonFund = {}
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'upi'
  const [showUpiDetails, setShowUpiDetails] = useState(false);
  const { themes, currentTheme } = useAppTheme();
  const theme = themes[currentTheme];

  const handleSubmit = async (event) => {
    event.preventDefault();

    setProcessing(true);
    setPaymentError(null);

    try {
      if (paymentMethod === 'card') {
        // Handle Stripe card payment
        if (!stripe || !elements) {
          setPaymentError('Payment system not loaded. Please refresh and try again.');
          setProcessing(false);
          return;
        }

        // Create payment intent
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payment/create-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wedding_id: weddingId,
            contributor_name: contributorName,
            contributor_email: contributorEmail,
            contributor_phone: contributorPhone,
            amount: parseFloat(amount),
            currency: 'inr',
            message: message
          }),
        });

        const { client_secret, payment_intent_id } = await response.json();

        // Confirm payment
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          client_secret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name: contributorName,
                email: contributorEmail,
                phone: contributorPhone,
              },
            },
          }
        );

        if (error) {
          setPaymentError(error.message);
          onError(error.message);
        } else if (paymentIntent.status === 'succeeded') {
          // Confirm payment in backend
          await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payment/confirm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              payment_intent_id: payment_intent_id
            }),
          });

          onSuccess({
            amount: paymentIntent.amount_received / 100,
            currency: paymentIntent.currency,
            contributor_name: contributorName
          });
        }
      } else if (paymentMethod === 'upi') {
        // Handle UPI payment (record contribution without Stripe)
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payment/upi-contribution`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wedding_id: weddingId,
            contributor_name: contributorName,
            contributor_email: contributorEmail,
            contributor_phone: contributorPhone,
            amount: parseFloat(amount),
            currency: 'inr',
            message: message,
            payment_method: 'upi',
            upi_reference: `UPI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }),
        });

        if (response.ok) {
          onSuccess({
            amount: parseFloat(amount),
            currency: 'inr',
            contributor_name: contributorName
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to record UPI contribution');
        }
      }
    } catch (error) {
      setPaymentError(error.message);
      onError(error.message);
    }

    setProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: theme.text,
        '::placeholder': {
          color: theme.textLight,
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    },
    hidePostalCode: true
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium" style={{ color: theme.text }}>
          Payment Method
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div 
            onClick={() => setPaymentMethod('card')}
            className={`p-4 rounded-xl border-2 bg-white/5 backdrop-blur-sm cursor-pointer transition-all ${
              paymentMethod === 'card' ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{ 
              borderColor: paymentMethod === 'card' ? theme.accent : '#e5e7eb',
              backgroundColor: paymentMethod === 'card' ? `${theme.accent}20` : 'rgba(255,255,255,0.05)'
            }}
          >
            <CreditCard className="w-8 h-8 mx-auto mb-2" style={{ color: paymentMethod === 'card' ? theme.accent : theme.textLight }} />
            <p className="text-sm text-center font-medium" style={{ color: theme.text }}>
              Credit/Debit Card
            </p>
            <p className="text-xs text-center mt-1" style={{ color: theme.textLight }}>
              Via Stripe (Secure)
            </p>
          </div>
          <div 
            onClick={() => setPaymentMethod('upi')}
            className={`p-4 rounded-xl border-2 bg-white/5 backdrop-blur-sm cursor-pointer transition-all hover:bg-white/10 ${
              paymentMethod === 'upi' ? 'ring-2 ring-green-500' : ''
            }`}
            style={{ 
              borderColor: paymentMethod === 'upi' ? '#00C853' : '#e5e7eb',
              backgroundColor: paymentMethod === 'upi' ? '#00C85320' : 'rgba(255,255,255,0.05)'
            }}
          >
            <Smartphone className="w-8 h-8 mx-auto mb-2" style={{ color: paymentMethod === 'upi' ? '#00C853' : theme.textLight }} />
            <p className="text-sm text-center font-medium" style={{ color: theme.text }}>
              UPI Payment
            </p>
            <p className="text-xs text-center mt-1" style={{ color: theme.textLight }}>
              PhonePe, GooglePay, etc.
            </p>
          </div>
        </div>
        
        {/* UPI Instructions */}
        {paymentMethod === 'upi' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">UPI Payment Instructions</p>
            </div>
            
            {honeymoonFund.upi_id || honeymoonFund.phone_number ? (
              <div className="space-y-3">
                <p className="text-sm text-green-700">
                  Complete your contribution using any of these payment methods:
                </p>
                
                {honeymoonFund.upi_id && (
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-sm font-medium text-green-800 mb-1">UPI ID:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm bg-green-100 px-2 py-1 rounded text-green-700">
                        {honeymoonFund.upi_id}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(honeymoonFund.upi_id)}
                        className="text-green-600 hover:text-green-700 text-xs"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
                
                {honeymoonFund.phone_number && (
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-sm font-medium text-green-800 mb-1">Phone Number:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm bg-green-100 px-2 py-1 rounded text-green-700">
                        {honeymoonFund.phone_number}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(honeymoonFund.phone_number)}
                        className="text-green-600 hover:text-green-700 text-xs"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-green-600">
                  After completing the UPI payment of ₹{amount}, click "Confirm UPI Payment" below to record your contribution.
                </p>
              </div>
            ) : (
              <p className="text-sm text-green-700">
                UPI payment details are not configured yet. Please use card payment or contact the couple directly.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card Details - Only show for card payments */}
      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <h4 className="text-md font-medium" style={{ color: theme.text }}>
            Card Details
          </h4>
          <div 
            className="p-4 rounded-xl border bg-white/10 backdrop-blur-sm"
            style={{ borderColor: theme.accent + '40' }}
          >
            <CardElement options={cardElementOptions} />
          </div>
        </div>
      )}

      {/* Error Display */}
      {paymentError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-red-600 text-sm">{paymentError}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 rounded-full border font-medium transition-all duration-300"
          style={{
            borderColor: theme.textLight,
            color: theme.textLight
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={(paymentMethod === 'card' && (!stripe || processing)) || (paymentMethod === 'upi' && processing)}
          className="flex-1 px-6 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
          style={{
            background: theme.gradientAccent,
            color: theme.primary
          }}
        >
          {processing ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Gift className="w-5 h-5" />
              {paymentMethod === 'card' ? `Pay ₹${amount}` : `Confirm UPI Payment ₹${amount}`}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const PaymentModal = ({ isOpen, onClose, weddingId, honeymoonFund = {} }) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [formData, setFormData] = useState({
    amount: '',
    contributorName: '',
    contributorEmail: '',
    contributorPhone: '',
    message: ''
  });
  const [paymentResult, setPaymentResult] = useState(null);
  const { themes, currentTheme } = useAppTheme();
  const theme = themes[currentTheme];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        amount: '',
        contributorName: '',
        contributorEmail: '',
        contributorPhone: '',
        message: ''
      });
      setPaymentResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (formData.amount && formData.contributorName) {
      setStep(2);
    }
  };

  const handlePaymentSuccess = (result) => {
    setPaymentResult(result);
    setStep(3);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto border"
        style={{ 
          background: `${theme.background}F5`,
          borderColor: theme.accent + '30'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: theme.accent + '20' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: theme.gradientAccent }}
              >
                <Heart className="w-6 h-6" style={{ color: theme.primary }} />
              </div>
              <div>
                <h2 
                  className="text-xl font-semibold"
                  style={{ 
                    fontFamily: theme.fontPrimary,
                    color: theme.primary 
                  }}
                >
                  Contribute to Honeymoon
                </h2>
                <p className="text-sm" style={{ color: theme.textLight }}>
                  {honeymoonFund.destination || 'Tokyo & Kyoto, Japan'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" style={{ color: theme.text }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p 
                  className="text-lg leading-relaxed"
                  style={{ color: theme.textLight }}
                >
                  {honeymoonFund.description || 'Help us create unforgettable memories on our honeymoon. Every contribution, big or small, means the world to us!'}
                </p>
              </div>

              {/* Contribution Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                    Contribution Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="Enter amount"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: theme.accent + '40',
                      color: theme.text
                    }}
                  />
                  {/* Suggested amounts */}
                  <div className="flex gap-2 mt-3">
                    {[500, 1000, 2500, 5000].map(amount => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setFormData({...formData, amount: amount.toString()})}
                        className="px-3 py-1 rounded-full text-sm border transition-all"
                        style={{
                          borderColor: theme.accent + '60',
                          color: theme.textLight,
                          '&:hover': {
                            backgroundColor: theme.accent + '20'
                          }
                        }}
                      >
                        ₹{amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={formData.contributorName}
                    onChange={(e) => setFormData({...formData, contributorName: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: theme.accent + '40',
                      color: theme.text
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.contributorEmail}
                    onChange={(e) => setFormData({...formData, contributorEmail: e.target.value})}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-xl border bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: theme.accent + '40',
                      color: theme.text
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.contributorPhone}
                    onChange={(e) => setFormData({...formData, contributorPhone: e.target.value})}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 rounded-xl border bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: theme.accent + '40',
                      color: theme.text
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                    Message (Optional)
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Write a sweet message for the couple..."
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 resize-none"
                    style={{ 
                      borderColor: theme.accent + '40',
                      color: theme.text
                    }}
                  />
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={!formData.amount || !formData.contributorName}
                className="w-full px-6 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: formData.amount && formData.contributorName ? theme.gradientAccent : theme.textLight,
                  color: theme.primary
                }}
              >
                <Gift className="w-5 h-5" />
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                amount={formData.amount}
                contributorName={formData.contributorName}
                contributorEmail={formData.contributorEmail}
                contributorPhone={formData.contributorPhone}
                message={formData.message}
                weddingId={weddingId}
                honeymoonFund={honeymoonFund}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onClose={handleClose}
              />
            </Elements>
          )}

          {step === 3 && paymentResult && (
            <div className="text-center space-y-6">
              <div 
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                style={{ background: theme.gradientAccent }}
              >
                <Heart className="w-8 h-8" style={{ color: theme.primary }} />
              </div>
              
              <div>
                <h3 
                  className="text-2xl font-semibold mb-4"
                  style={{ 
                    fontFamily: theme.fontPrimary,
                    color: theme.primary 
                  }}
                >
                  Thank You! 🎉
                </h3>
                <p 
                  className="text-lg leading-relaxed"
                  style={{ color: theme.textLight }}
                >
                  Your contribution of <strong>₹{paymentResult.amount}</strong> has been received successfully. 
                  Your generosity means the world to the happy couple!
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-6 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg"
                style={{
                  background: theme.gradientAccent,
                  color: theme.primary
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;