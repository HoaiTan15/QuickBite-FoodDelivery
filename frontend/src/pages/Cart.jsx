import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { removeItem, updateQuantity, selectCartTotal, selectCartCount } from '../store/cartSlice';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, restaurantName } = useSelector((state) => state.cart);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-600">Your cart is empty</h2>
        <p className="text-gray-400 mt-2">Browse restaurants and add items to your cart.</p>
        <Link
          to="/restaurants"
          className="inline-block mt-6 bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart</h1>
      {restaurantName && (
        <p className="text-gray-500 mb-6">From: <span className="font-medium text-secondary">{restaurantName}</span></p>
      )}

      {/* Items */}
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
          >
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
              <p className="text-primary font-bold">${Number(item.price).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={() => dispatch(removeItem(item.id))}
                className="ml-2 text-danger hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between text-gray-600 mb-2">
          <span>Items ({count})</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-800">
          <span>Total</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full mt-4 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
