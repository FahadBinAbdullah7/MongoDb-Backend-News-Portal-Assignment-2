import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Login = ({ onLogin }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await usersAPI.getAll();
      setUsers(data);
      if (data.length > 0) {
        setSelectedUserId(data[0].id.toString());
      }
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      alert('Please select a user');
      return;
    }

    const user = users.find(u => u.id.toString() === selectedUserId);
    if (user) {
      onLogin(user);
      navigate('/');
    }
  };

  if (loading) return <Loading message="Loading users..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchUsers} />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full animate-scale-in">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-gradient-to-br from-editorial-primary to-editorial-accent rounded-2xl mb-6 transform hover:rotate-6 transition-transform duration-300">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h1 className="page-title mb-4">NewsHub</h1>
          <p className="text-xl text-gray-600 font-display">Your Daily Digest of Stories</p>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <h2 className="text-3xl font-display font-bold mb-2 text-editorial-dark">Welcome Back</h2>
          <p className="text-gray-600 mb-8">Select your profile to continue</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="user-select" className="block text-sm font-semibold text-editorial-dark mb-3">
                Choose Your Profile
              </label>
              <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input-field appearance-none bg-white cursor-pointer"
                required
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview selected user */}
            {selectedUserId && (
              <div className="bg-editorial-light p-4 rounded-xl border-2 border-editorial-primary animate-fade-in">
                <p className="text-sm text-gray-600 mb-2">You're logging in as:</p>
                <div className="flex items-center space-x-3">
                  <img 
                    src={users.find(u => u.id.toString() === selectedUserId)?.avatar} 
                    alt="Selected user" 
                    className="w-12 h-12 rounded-full border-2 border-editorial-primary"
                  />
                  <div>
                    <p className="font-bold text-editorial-dark">
                      {users.find(u => u.id.toString() === selectedUserId)?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {users.find(u => u.id.toString() === selectedUserId)?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-primary text-lg"
            >
              Continue to NewsHub
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              This is a simulated authentication for demonstration purposes
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-xl shadow-md">
            <div className="text-2xl font-bold text-editorial-accent mb-1">Create</div>
            <div className="text-xs text-gray-600">Write Stories</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-md">
            <div className="text-2xl font-bold text-editorial-accent mb-1">Share</div>
            <div className="text-xs text-gray-600">Engage</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-md">
            <div className="text-2xl font-bold text-editorial-accent mb-1">Discuss</div>
            <div className="text-xs text-gray-600">Comment</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
