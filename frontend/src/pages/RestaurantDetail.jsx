import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Star, Clock, MapPin, Plus } from 'lucide-react';
import { addItem } from '../store/cartSlice';
import restaurantService from '../services/restaurantService';

export default function RestaurantDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rRes, mRes] = await Promise.all([
          restaurantService.getRestaurantById(id),
          restaurantService.getMenuItems(id),
        ]);
        setRestaurant(rRes.data.restaurant || rRes.data);
        setMenuItems(mRes.data.menuItems || mRes.data || []);
      } catch {
        setError('Failed to load restaurant details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = (item) => {
    dispatch(
      addItem({
        item: { id: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl },
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
      })
    );
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !restaurant) {
    return <div className="text-center py-20 text-danger">{error || 'Restaurant not found.'}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{restaurant.name}</h1>
        {restaurant.cuisine && (
          <p className="text-gray-500 mt-1">{restaurant.cuisine}</p>
        )}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
          {restaurant.rating != null && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span>{Number(restaurant.rating).toFixed(1)}</span>
            </div>
          )}
          {restaurant.deliveryTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-primary" />
              <span>{restaurant.deliveryTime} min</span>
            </div>
          )}
          {restaurant.address && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-secondary" />
              <span>{restaurant.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Menu</h2>
      {menuItems.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No menu items available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                {item.description && (
                  <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-primary">
                    ${Number(item.price).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      addedId === item.id
                        ? 'bg-success text-white'
                        : 'bg-primary text-white hover:bg-orange-600'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {addedId === item.id ? 'Added!' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
