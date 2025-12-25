import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b-4 border-editorial-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-editorial-primary to-editorial-accent rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-editorial-dark">NewsHub</h1>
              <p className="text-xs text-gray-500 font-mono">Your Daily Digest</p>
            </div>
          </Link>

          {/* Navigation */}
          {user && (
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors duration-300 ${
                  isActive('/') 
                    ? 'text-editorial-accent font-semibold' 
                    : 'text-editorial-dark hover:text-editorial-accent'
                }`}
              >
                Home
              </Link>
              <Link
                to="/create"
                className={`text-sm font-medium transition-colors duration-300 ${
                  isActive('/create') 
                    ? 'text-editorial-accent font-semibold' 
                    : 'text-editorial-dark hover:text-editorial-accent'
                }`}
              >
                Write Story
              </Link>

              {/* User Menu */}
              <div className="flex items-center space-x-4 pl-6 border-l-2 border-gray-200">
                <div className="flex items-center space-x-3">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-editorial-primary"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-editorial-dark">{user.name}</p>
                    <p className="text-xs text-gray-500">Author</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-editorial-accent hover:text-white hover:bg-editorial-accent rounded-lg transition-all duration-300 border border-editorial-accent"
                >
                  Logout
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
