import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, QrCode, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';

const PAYMENT_METHODS = [
  { id: 'QR', label: 'QR Code', icon: QrCode },
  { id: 'WALLET', label: 'Wallet', icon: Wallet },
  { id: 'BANK', label: 'Bank Transfer', icon: CreditCard },
];

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orderData = location.state?.orderData;

  const [method, setMethod] = useState('QR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!orderData) {
    navigate('/cart');
    return null;
  }

  const handlePay = async () => {
    try {
      setLoading(true);
      setError('');

      // Create order
      const orderRes = await orderService.createOrder({
        restaurantId: orderData.restaurantId,
        deliveryAddress: orderData.deliveryAddress,
        phone: orderData.phone,
        note: orderData.note,
        items: orderData.items.map((i) => ({
          menuItemId: i.id,
          quantity: i.quantity,
          price: i.price,
        })),
      });

      const orderId = orderRes.data.order?.id || orderRes.data.id;

      // Create payment
      await paymentService.createPayment({
        orderId,
        paymentMethod: method,
        amount: orderData.total,
      });

      dispatch(clearCart());
      navigate(`/orders/${orderId}`, { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment</h1>

      {/* Amount */}
      <div className="bg-primary/10 rounded-2xl p-5 mb-6 text-center">
        <p className="text-gray-500 text-sm">Total Amount</p>
        <p className="text-4xl font-bold text-primary mt-1">${orderData.total.toFixed(2)}</p>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Select Payment Method</h2>
        <div className="space-y-3">
          {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMethod(id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                method === id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${method === id ? 'text-primary' : 'text-gray-400'}`} />
              <span className={`font-medium ${method === id ? 'text-primary' : 'text-gray-600'}`}>
                {label}
              </span>
              {method === id && (
                <span className="ml-auto w-4 h-4 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger rounded-xl p-3 mb-4 text-sm">{error}</div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {loading ? 'Processing...' : `Pay $${orderData.total.toFixed(2)}`}
      </button>
    </div>
  );
}
