import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, FileText } from 'lucide-react';
import { selectCartTotal } from '../store/cartSlice';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, restaurantId, restaurantName } = useSelector((state) => state.cart);
  const total = useSelector(selectCartTotal);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    deliveryAddress: '',
    phone: '',
    note: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Pass order data to payment page via state
    navigate('/payment', {
      state: {
        orderData: {
          restaurantId,
          restaurantName,
          items,
          total,
          ...form,
        },
      },
    });
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Delivery Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Delivery Information</h2>

          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                name="deliveryAddress"
                value={form.deliveryAddress}
                onChange={handleChange}
                required
                placeholder="Delivery address *"
                rows={3}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="Phone number *"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Note for restaurant (optional)"
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Order Summary</h2>
          <p className="text-sm text-gray-500 mb-3">From: <span className="font-medium text-secondary">{restaurantName}</span></p>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-3 flex justify-between font-bold text-gray-800">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
}
