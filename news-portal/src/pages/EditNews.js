import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNewsById, updateNews } from '../services/api';

const EditNews = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
  }, [id]);

  const fetchNews = async () => {
    try {
      const newsData = await getNewsById(id);
      
      // Check if user is the author
      if (user.id !== newsData.author_id) {
        alert('You are not authorized to edit this news');
        navigate('/news');
        return;
      }

      setTitle(newsData.title);
      setBody(newsData.body);
      setLoading(false);
    } catch (err) {
      setError('Failed to load news');
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title cannot be empty';
    }

    if (!body.trim()) {
      newErrors.body = 'Body cannot be empty';
    } else if (body.trim().length < 20) {
      newErrors.body = 'Body must be at least 20 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const newsData = {
        title: title.trim(),
        body: body.trim()
      };

      await updateNews(id, newsData);
      navigate(`/news/${id}`);
    } catch (err) {
      alert('Failed to update news. Please try again.');
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/news/${id}`);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading news...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/news')} className="btn btn-secondary">
          Back to News List
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-container">
        <h1>Edit News</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'error' : ''}
              placeholder="Enter news title"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="body">Body *</label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={errors.body ? 'error' : ''}
              placeholder="Enter news content (minimum 20 characters)"
              rows="10"
            />
            <div className="char-count">
              {body.length} characters {body.length < 20 && `(${20 - body.length} more needed)`}
            </div>
            {errors.body && <span className="error-text">{errors.body}</span>}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update News'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNews;
