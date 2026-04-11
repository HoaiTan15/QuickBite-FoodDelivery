import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, Package, Truck } from 'lucide-react';
import orderService from '../services/orderService';

const STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Package },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { key: 'PREPARING', label: 'Preparing', icon: Clock },
  { key: 'DELIVERING', label: 'On the Way', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const success = location.state?.success;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrderById(id);
        setOrder(res.data.order || res.data);
      } catch {
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return <div className="text-center py-20 text-danger">{error || 'Order not found.'}</div>;
  }

  const currentStep = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {success && (
        <div className="bg-success/10 text-green-700 rounded-xl p-4 mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Order placed successfully! 🎉</span>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Order #{order.id}</h1>

      {/* Progress */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-6">Tracking</h2>
          <div className="flex items-center">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const done = idx <= currentStep;
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        done ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-gray-500 mt-1 text-center w-16">{step.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-1 rounded ${idx < currentStep ? 'bg-primary' : 'bg-gray-100'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Order Details</h2>
        {order.restaurant?.name && (
          <p className="text-gray-600 text-sm mb-2">
            <span className="font-medium">Restaurant:</span> {order.restaurant.name}
          </p>
        )}
        {order.deliveryAddress && (
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
            <span>{order.deliveryAddress}</span>
          </div>
        )}
        {order.orderDetails?.length > 0 && (
          <div className="mt-4 space-y-2">
            {order.orderDetails.map((detail) => (
              <div key={detail.id} className="flex justify-between text-sm text-gray-600">
                <span>{detail.menuItem?.name || 'Item'} × {detail.quantity}</span>
                <span>${Number(detail.subtotal || detail.price * detail.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="border-t mt-4 pt-3 flex justify-between font-bold text-gray-800">
          <span>Total</span>
          <span className="text-primary">${Number(order.totalAmount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
