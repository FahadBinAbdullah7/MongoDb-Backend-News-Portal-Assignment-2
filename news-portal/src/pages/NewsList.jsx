import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsAPI, getUserById } from '../services/api';
import NewsCard from '../components/NewsCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const NewsList = ({ user }) => {
  const [news, setNews] = useState([]);
  const [authors, setAuthors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchNews();
  }, [searchQuery, currentPage]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        _page: currentPage,
        _limit: itemsPerPage,
        _sort: 'created_at',
        _order: 'desc'
      };

      if (searchQuery) {
        params.q = searchQuery;
      }

      const { data, headers } = await newsAPI.getAll(params);
      
      // Calculate total pages from total count
      const totalCount = headers['x-total-count'];
      if (totalCount) {
        setTotalPages(Math.ceil(totalCount / itemsPerPage));
      }

      setNews(data);

      // Fetch authors for all news items
      const authorPromises = data.map(item => getUserById(item.author_id));
      const authorsData = await Promise.all(authorPromises);
      
      const authorsMap = {};
      authorsData.forEach(author => {
        authorsMap[author.id] = author;
      });
      setAuthors(authorsMap);

    } catch (err) {
      setError('Failed to load news. Please try again.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (newsId) => {
    try {
      await newsAPI.delete(newsId);
      fetchNews(); // Refresh the list
    } catch (err) {
      alert('Failed to delete news. Please try again.');
      console.error('Error deleting news:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchNews();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && news.length === 0) return <Loading message="Loading news stories..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchNews} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="mb-12 animate-slide-up">
        <h1 className="page-title mb-4">Latest Stories</h1>
        <p className="text-xl text-gray-600 font-display max-w-2xl">
          Discover breaking news, trending stories, and in-depth analysis from our community of writers
        </p>
      </div>

      {/* Search and Create Section */}
      <div className="mb-10 flex flex-col md:flex-row gap-4 items-center justify-between animate-slide-up animate-delay-100">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl w-full">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news by title or content..."
              className="input-field pl-12 pr-4"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* Create News Button */}
        <Link to="/create" className="btn-primary flex items-center space-x-2 whitespace-nowrap">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Write New Story</span>
        </Link>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="mb-6 p-4 bg-editorial-light rounded-lg border-l-4 border-editorial-primary animate-fade-in">
          <p className="text-editorial-dark">
            <span className="font-semibold">{news.length}</span> result{news.length !== 1 ? 's' : ''} found for "{searchQuery}"
          </p>
        </div>
      )}

      {/* News Grid */}
      {news.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 className="text-2xl font-display font-bold text-gray-700 mb-2">No Stories Found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? `No results for "${searchQuery}". Try a different search term.`
              : 'Be the first to share your story with the community!'}
          </p>
          {!searchQuery && (
            <Link to="/create" className="btn-primary inline-block">
              Write Your First Story
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {news.map((item, index) => (
              <div 
                key={item.id} 
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-slide-up"
              >
                <NewsCard
                  news={item}
                  author={authors[item.author_id]}
                  currentUserId={user?.id}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 animate-fade-in">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-editorial-primary hover:bg-editorial-primary hover:text-white border-2 border-editorial-primary'
                }`}
              >
                Previous
              </button>

              <div className="flex space-x-2">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-editorial-primary text-white shadow-lg'
                          : 'bg-white text-editorial-primary hover:bg-editorial-light border-2 border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-editorial-primary hover:bg-editorial-primary hover:text-white border-2 border-editorial-primary'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsList;
