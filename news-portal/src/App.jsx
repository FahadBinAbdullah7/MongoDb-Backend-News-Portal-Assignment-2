import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import Login from './pages/Login';
import NewsList from './pages/NewsList';
import NewsDetail from './pages/NewsDetail';
import CreateNews from './pages/CreateNews';
import EditNews from './pages/EditNews';
import Loading from './components/Loading';

function App() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return <Loading message="Initializing..." />;
  }

  return (
    <Router>
      <div className="min-h-screen">
        {user && <Header user={user} onLogout={logout} />}
        
        <main>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <Login onLogin={login} />} 
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={user ? <NewsList user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/news/:id"
              element={user ? <NewsDetail user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/create"
              element={user ? <CreateNews user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/edit/:id"
              element={user ? <EditNews user={user} /> : <Navigate to="/login" />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Footer */}
        {user && (
          <footer className="bg-white border-t border-gray-200 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-editorial-primary to-editorial-accent rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-editorial-dark">NewsHub</h3>
                    <p className="text-xs text-gray-500 font-mono">Your Daily Digest</p>
                  </div>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-sm text-gray-600">
                    Built with React + JSON-Server
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    © 2024 NewsHub. Assignment Project.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </Router>
  );
}

export default App;
