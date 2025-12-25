import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllNews, getUsers, deleteNews } from '../services/api';

const NewsList = () => {
  const [newsList, setNewsList] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [newsData, usersData] = await Promise.all([
        getAllNews(),
        getUsers()
      ]);
      setNewsList(newsData);
      setUsers(usersData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load news. Please make sure JSON-Server is running.');
      setLoading(false);
    }
  };

  const getAuthorName = (authorId) => {
    const author = users.find(u => u.id === authorId);
    return author ? author.name : 'Unknown';
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news item?')) {
      try {
        await deleteNews(id);
        setNewsList(newsList.filter(news => news.id !== id));
      } catch (err) {
        alert('Failed to delete news item');
      }
    }
  };

  const safeNewsList = Array.isArray(newsList) ? newsList : [];

const filteredNews = safeNewsList.filter(news =>
  news.title.toLowerCase().includes(searchTerm.toLowerCase())
);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading news...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>News Portal</h1>
        <Link to="/create" className="btn btn-primary">
          + Create News
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search news by title..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
      </div>

      {currentItems.length === 0 ? (
        <div className="empty-state">
          <p>No news articles found.</p>
          {searchTerm && <p>Try adjusting your search terms.</p>}
        </div>
      ) : (
        <>
          <div className="news-grid">
            {currentItems.map(news => (
              <div key={news.id} className="news-card">
                <div className="news-card-header">
                  <h2>{news.title}</h2>
                  <span className="news-meta">
                    by {getAuthorName(news.author_id)}
                  </span>
                </div>
                
                <p className="news-excerpt">
                  {news.body.substring(0, 150)}...
                </p>

                <div className="news-card-footer">
                  <div className="news-stats">
                    <span className="comment-count">
                      💬 {news.comments?.length || 0} comments
                    </span>
                    <span className="news-date">
                      {new Date(news.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="news-actions">
                    <Link 
                      to={`/news/${news.id}`} 
                      className="btn btn-secondary btn-sm"
                    >
                      View Details
                    </Link>
                    
                    {user && user.id === news.author_id && (
                      <>
                        <Link 
                          to={`/edit/${news.id}`} 
                          className="btn btn-warning btn-sm"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(news.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm"
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
