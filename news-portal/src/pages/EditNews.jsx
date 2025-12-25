import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { newsAPI } from '../services/api';
import { validateNews } from '../utils/helpers';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const EditNews = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, [id]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const { data } = await newsAPI.getById(id);
      
      // Check if user is the author
      if (data.author_id !== user.id) {
        setFetchError('You are not authorized to edit this news.');
        return;
      }

      setTitle(data.title);
      setBody(data.body);
    } catch (err) {
      setFetchError('Failed to load news. Please try again.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateNews(title, body);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      await newsAPI.update(id, {
        title: title.trim(),
        body: body.trim()
      });

      navigate(`/news/${id}`);
    } catch (err) {
      setErrors({ submit: 'Failed to update news. Please try again.' });
      console.error('Error updating news:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading article..." />;
  if (fetchError) return <ErrorMessage message={fetchError} onRetry={() => navigate('/')} />;

  const charCount = body.length;
  const minChars = 20;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link 
        to={`/news/${id}`}
        className="inline-flex items-center space-x-2 text-editorial-primary hover:text-editorial-accent transition-colors duration-300 mb-8 group"
      >
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back to Article</span>
      </Link>

      {/* Page Header */}
      <div className="mb-10 animate-slide-up">
        <h1 className="page-title mb-4">Edit Your Story</h1>
        <p className="text-xl text-gray-600 font-display">
          Make changes to improve and update your article
        </p>
      </div>

      {/* Form Card */}
      <div className="card p-8 md:p-12 animate-slide-up animate-delay-100">
        {/* Editor Info */}
        <div className="mb-8 pb-8 border-b-2 border-gray-100">
          <p className="text-sm text-gray-600 mb-3">Editing as:</p>
          <div className="flex items-center space-x-3">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-12 h-12 rounded-full border-2 border-editorial-primary"
            />
            <div>
              <p className="font-display font-bold text-editorial-dark">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-lg font-display font-semibold text-editorial-dark mb-3">
              Story Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a compelling title for your story..."
              className={`input-field text-lg ${errors.title ? 'border-red-500' : ''}`}
              disabled={submitting}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title}
              </p>
            )}
          </div>

          {/* Body Field */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="body" className="block text-lg font-display font-semibold text-editorial-dark">
                Story Content *
              </label>
              <span className={`text-sm font-mono ${charCount < minChars ? 'text-editorial-accent' : 'text-green-600'}`}>
                {charCount} / {minChars} characters minimum
              </span>
            </div>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your story here..."
              rows="12"
              className={`textarea-field text-base ${errors.body ? 'border-red-500' : ''}`}
              disabled={submitting}
            />
            {errors.body && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.body}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-700 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.submit}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t-2 border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              to={`/news/${id}`}
              className="flex-1 btn-secondary text-lg text-center"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Edit Notice */}
        <div className="mt-8 pt-8 border-t-2 border-gray-100">
          <div className="bg-blue-50 border-l-4 border-editorial-primary p-4 rounded">
            <div className="flex">
              <svg className="w-5 h-5 text-editorial-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-editorial-primary font-medium">
                  Your changes will be saved immediately and visible to all readers. Make sure to review your edits before saving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNews;
