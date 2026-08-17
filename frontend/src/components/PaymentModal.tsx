import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Lock
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: 'FREE' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
    name: string;
    price: number;
    durationLabel: string;
  } | null;
  onSuccess: (updatedUser: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, onSuccess }) => {
  const { checkAuth } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING' | 'QR'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [upiId, setUpiId] = useState('ketan@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8865');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('886');

  if (!isOpen || !plan) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Simulate gateway authorization latency
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response: any = await api.post('/payments/checkout', {
        planId: plan.id,
        paymentMethod
      });

      if (response.success && response.data) {
        setIsSuccess(true);
        setTimeout(async () => {
          await checkAuth();
          onSuccess(response.data.user);
          setIsSuccess(false);
          setIsProcessing(false);
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div>
            <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
              LifeOS Secure Gateway
            </span>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Subscribe to {plan.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Plan Summary Box */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{plan.durationLabel}</p>
              <p className="text-2xl font-extrabold text-white font-mono">
                {plan.price === 0 ? 'FREE' : `₹${plan.price.toLocaleString('en-IN')}`}
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5">
              <ShieldCheck size={14} /> 256-bit Encrypted
            </div>
          </div>

          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white">Payment Authorized!</h4>
                <p className="text-sm text-slate-300">
                  Plan <strong className="text-indigo-400">{plan.name}</strong> has been activated for your account.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-md'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone size={18} />
                    <span>UPI ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('QR')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                      paymentMethod === 'QR'
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-md'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <QrCode size={18} />
                    <span>Scan QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                      paymentMethod === 'CARD'
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-md'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard size={18} />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NET_BANKING')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                      paymentMethod === 'NET_BANKING'
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-md'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building2 size={18} />
                    <span>Banking</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Payment Method Input UI */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                {paymentMethod === 'UPI' && (
                  <Input
                    label="VPA / UPI ID (Google Pay, PhonePe, Paytm)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="user@upi"
                  />
                )}

                {paymentMethod === 'QR' && (
                  <div className="text-center space-y-3 py-2">
                    <div className="w-36 h-36 bg-white p-2 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                      <QrCode className="w-full h-full text-slate-900" />
                    </div>
                    <p className="text-xs text-slate-300">
                      Scan QR code with any UPI app (GPay / PhonePe / Paytm) to pay{' '}
                      <strong className="text-indigo-400">₹{plan.price}</strong>
                    </p>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="space-y-3">
                    <Input
                      label="Card Number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Expiry (MM/YY)"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                      <Input
                        label="CVV"
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'NET_BANKING' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Select Bank</label>
                    <select className="w-full bg-[#0F172A] text-slate-100 text-sm rounded-xl px-3.5 py-2.5 outline-none border border-slate-700">
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>Axis Bank</option>
                    </select>
                  </div>
                )}
              </div>

              {errorMessage && (
                <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
              )}

              {/* Action */}
              <Button
                variant="primary"
                size="lg"
                onClick={handlePay}
                isLoading={isProcessing}
                className="w-full py-3 text-sm font-semibold shadow-lg shadow-indigo-500/25"
                leftIcon={<Lock size={16} />}
              >
                {plan.price === 0 ? 'Activate Free Plan' : `Pay ₹${plan.price.toLocaleString('en-IN')} & Activate`}
              </Button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
