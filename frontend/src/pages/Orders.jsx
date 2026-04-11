import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import orderService from '../services/orderService';

const STATUS_COLORS = {
  PENDING: 'bg-warning/20 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-purple-100 text-purple-700',
  DELIVERING: 'bg-secondary/10 text-secondary',
  DELIVERED: 'bg-success/20 text-green-700',
  CANCELLED: 'bg-danger/10 text-danger',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        setOrders(res.data.orders || res.data || []);
      } catch {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-danger">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-600">No orders yet</h2>
        <p className="text-gray-400 mt-2">Your order history will appear here.</p>
        <Link
          to="/restaurants"
          className="inline-block mt-6 bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          Order Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <p className="font-semibold text-gray-800">Order #{order.id}</p>
              {order.restaurant?.name && (
                <p className="text-gray-500 text-sm mt-0.5">{order.restaurant.name}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
              >
                {order.status}
              </span>
              <span className="font-bold text-primary">${Number(order.totalAmount).toFixed(2)}</span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
