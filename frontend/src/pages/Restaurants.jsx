import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import RestaurantCard from '../components/RestaurantCard';
import restaurantService from '../services/restaurantService';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, [search, cuisine]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (cuisine) params.cuisine = cuisine;
      const res = await restaurantService.getAllRestaurants(params);
      setRestaurants(res.data.restaurants || res.data || []);
    } catch (err) {
      setError('Failed to load restaurants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Restaurants</h1>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Filter by cuisine..."
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-danger">{error}</div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No restaurants found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  );
}
