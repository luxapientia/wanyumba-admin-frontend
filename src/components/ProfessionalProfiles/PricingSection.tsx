import { motion } from 'framer-motion';
import { DollarSign, CreditCard } from 'lucide-react';

interface PricingSectionProps {
  freeConsultation?: boolean;
  consultationFee?: number;
  currency?: string;
  paymentMethods?: string[];
  acceptsInsurance?: boolean;
  colorScheme?: 'indigo' | 'blue';
  delay?: number;
}

const formatCurrency = (amount?: number, currency?: string) => {
  if (amount === undefined || amount === null) return 'N/A';
  const curr = currency || 'TZS';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function PricingSection({
  freeConsultation,
  consultationFee,
  currency,
  paymentMethods,
  acceptsInsurance,
  colorScheme = 'indigo',
  delay = 0.5,
}: PricingSectionProps) {
  const iconColor = colorScheme === 'indigo' ? 'text-indigo-600' : 'text-blue-600';
  const badgeBg = colorScheme === 'indigo' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700';

  const hasPricingInfo = freeConsultation !== undefined || consultationFee !== undefined || 
    (paymentMethods && paymentMethods.length > 0) || acceptsInsurance !== undefined;

  if (!hasPricingInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <DollarSign size={20} className={iconColor} />
        Pricing & Payment
      </h2>
      <div className="space-y-3">
        {freeConsultation !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Free Consultation:</span>
            {freeConsultation ? (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-semibold">Yes</span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-semibold">No</span>
            )}
          </div>
        )}
        {consultationFee !== undefined && !freeConsultation && (
          <div>
            <span className="text-sm text-gray-500">Consultation Fee:</span>
            <p className="text-gray-900 font-medium">{formatCurrency(consultationFee, currency)}</p>
          </div>
        )}
        {paymentMethods && paymentMethods.length > 0 && (
          <div>
            <span className="text-sm text-gray-500 block mb-2">Payment Methods:</span>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 ${badgeBg} rounded-md text-sm font-semibold flex items-center gap-1`}
                >
                  <CreditCard size={14} />
                  {method}
                </span>
              ))}
            </div>
          </div>
        )}
        {acceptsInsurance !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Accepts Insurance:</span>
            {acceptsInsurance ? (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-semibold">Yes</span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-semibold">No</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

