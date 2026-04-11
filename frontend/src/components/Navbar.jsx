import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, LogOut, UtensilsCrossed } from 'lucide-react';
import { logout } from '../store/authSlice';
import { selectCartCount } from '../store/cartSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
          <UtensilsCrossed className="w-6 h-6" />
          QuickBite
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-gray-600 font-medium">
          <Link to="/restaurants" className="hover:text-primary transition-colors">
            Restaurants
          </Link>
          {isAuthenticated && (
            <Link to="/orders" className="hover:text-primary transition-colors">
              My Orders
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link to="/cart" className="relative text-gray-600 hover:text-primary transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-medium">{user?.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-500 hover:text-danger transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-medium text-primary border border-primary px-4 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
