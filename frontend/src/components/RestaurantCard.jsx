import { Link } from 'react-router-dom';
import { Star, Clock, MapPin } from 'lucide-react';

export default function RestaurantCard({ restaurant }) {
  const {
    id,
    name,
    address,
    cuisine,
    rating,
    deliveryTime,
    imageUrl,
    isOpen,
  } = restaurant;

  return (
    <Link
      to={`/restaurants/${id}`}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {!isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Closed</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg truncate">{name}</h3>
        {cuisine && (
          <p className="text-gray-500 text-sm mt-1">{cuisine}</p>
        )}

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          {rating != null && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="font-medium">{Number(rating).toFixed(1)}</span>
            </div>
          )}
          {deliveryTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-primary" />
              <span>{deliveryTime} min</span>
            </div>
          )}
        </div>

        {address && (
          <div className="flex items-start gap-1 mt-2 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
