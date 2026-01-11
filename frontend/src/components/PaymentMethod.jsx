import { useState } from "react";
import { FiCreditCard, FiSmartphone, FiShoppingBag, FiLock, FiCheck } from "react-icons/fi";

const ESEWA_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/f/ff/Esewa_logo.webp";

// We can add more methods later
const paymentMethods = [
  {
    id: "esewa",
    name: "eSewa",
    icon: FiSmartphone,
    logo: ESEWA_LOGO_URL,
    description: "Pay with eSewa wallet",
    color: "from-green-500 to-green-600",
  }
];

const PaymentMethod = ({ selectedMethod, onSelect }) => {
  const [logoErrors, setLogoErrors] = useState({});

  const handleLogoError = (methodId) => {
    setLogoErrors(prev => ({ ...prev, [methodId]: true }));
  };

  return (
    <div className="space-y-4">
      {paymentMethods.map((method) => {
        const Icon = method.icon;
        const isSelected = selectedMethod === method.id;
        const hasLogo = method.logo;

        return (
          <div
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`
              w-full p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer flex items-center gap-4
              ${isSelected ? "border-orange-500 bg-orange-50/50 shadow-md" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"}
            `}
          >
            {/* Icon/Logo */}
            {hasLogo && !logoErrors[method.id] ? (
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden p-1.5">
                 <img
                    src={method.logo}
                    alt={`${method.name} logo`}
                    className="w-full h-full object-contain"
                    onError={() => handleLogoError(method.id)}
                  />
              </div>
            ) : (
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900">{method.name}</h4>
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                  ${isSelected ? "border-orange-500 bg-orange-500" : "border-gray-300"}
                `}>
                  {isSelected && <FiCheck className="w-4 h-4 text-white" />}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{method.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentMethod;
