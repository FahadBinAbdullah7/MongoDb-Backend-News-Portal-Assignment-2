import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createNews } from '../services/api';

const CreateNews = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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

    setLoading(true);

    try {
      const newsData = {
        title: title.trim(),
        body: body.trim(),
        author_id: user.id
      };

      await createNews(newsData);
      navigate('/news');
    } catch (err) {
      alert('Failed to create news. Please try again.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (title || body) {
      if (window.confirm('Are you sure you want to discard this news?')) {
        navigate('/news');
      }
    } else {
      navigate('/news');
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1>Create News</h1>
        
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
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create News'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNews;
