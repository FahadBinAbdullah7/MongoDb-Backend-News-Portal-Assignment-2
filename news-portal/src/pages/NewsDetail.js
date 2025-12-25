import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNewsById, getUsers, addComment, deleteNews, deleteComment } from '../services/api';

const NewsDetail = () => {
  const [news, setNews] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [newsData, usersData] = await Promise.all([
        getNewsById(id),
        getUsers()
      ]);
      setNews(newsData);
      setUsers(usersData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load news details');
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      setCommentError('Comment text cannot be empty');
      return;
    }

    setSubmittingComment(true);
    setCommentError('');

    try {
      const comment = {
        user_id: user.id,
        text: commentText.trim()
      };

      const updatedNews = await addComment(id, comment);
      setNews(updatedNews);
      setCommentText('');
    } catch (err) {
      setCommentError('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this news item?')) {
      try {
        await deleteNews(id);
        navigate('/news');
      } catch (err) {
        alert('Failed to delete news item');
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const updatedNews = await deleteComment(id, commentId);
        setNews(updatedNews);
      } catch (err) {
        alert('Failed to delete comment');
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading news details...</div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="container">
        <div className="error-message">{error || 'News not found'}</div>
        <Link to="/news" className="btn btn-secondary">Back to News List</Link>
      </div>
    );
  }

  const isAuthor = user && user.id === news.author_id;

  return (
    <div className="container">
      <div className="news-detail">
        <div className="news-detail-header">
          <Link to="/news" className="btn btn-secondary btn-sm">← Back to List</Link>
          {isAuthor && (
            <div className="author-actions">
              <Link to={`/edit/${news.id}`} className="btn btn-warning btn-sm">
                Edit
              </Link>
              <button onClick={handleDelete} className="btn btn-danger btn-sm">
                Delete
              </button>
            </div>
          )}
        </div>

        <article className="news-article">
          <h1>{news.title}</h1>
          
          <div className="news-meta">
            <span className="author">By {getUserName(news.author_id)}</span>
            <span className="date">
              {new Date(news.created_at).toLocaleString()}
            </span>
          </div>

          <div className="news-body">
            {news.body}
          </div>
        </article>

        {/* Comments Section */}
        <section className="comments-section">
          <h2>Comments ({news.comments?.length || 0})</h2>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <div className="form-group">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write your comment..."
                  rows="3"
                  className={commentError ? 'error' : ''}
                />
                {commentError && <span className="error-text">{commentError}</span>}
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submittingComment}
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="info-box">
              <Link to="/users">Login</Link> to post a comment
            </div>
          )}

          {/* Comments List */}
          <div className="comments-list">
            {!news.comments || news.comments.length === 0 ? (
              <div className="empty-state">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              news.comments.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <div className="comment-author-info">
                      <strong>{getUserName(comment.user_id)}</strong>
                      <span className="comment-date">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    {/* Show delete button if user is the news author */}
                    {isAuthor && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="btn btn-danger btn-xs"
                        title="Delete comment"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                  <div className="comment-body">
                    {comment.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NewsDetail;
