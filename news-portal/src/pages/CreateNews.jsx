import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { newsAPI } from '../services/api';
import { validateNews } from '../utils/helpers';

const CreateNews = ({ user }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

      await newsAPI.create({
        title: title.trim(),
        body: body.trim(),
        author_id: user.id
      });

      navigate('/');
    } catch (err) {
      setErrors({ submit: 'Failed to create news. Please try again.' });
      console.error('Error creating news:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = body.length;
  const minChars = 20;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link 
        to="/" 
        className="inline-flex items-center space-x-2 text-editorial-primary hover:text-editorial-accent transition-colors duration-300 mb-8 group"
      >
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back to Stories</span>
      </Link>

      {/* Page Header */}
      <div className="mb-10 animate-slide-up">
        <h1 className="page-title mb-4">Write Your Story</h1>
        <p className="text-xl text-gray-600 font-display">
          Share your insights, experiences, and news with the community
        </p>
      </div>

      {/* Form Card */}
      <div className="card p-8 md:p-12 animate-slide-up animate-delay-100">
        {/* Author Info */}
        <div className="mb-8 pb-8 border-b-2 border-gray-100">
          <p className="text-sm text-gray-600 mb-3">Publishing as:</p>
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
              placeholder="Write your story here... Share details, context, and insights that will engage your readers."
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
            <p className="mt-2 text-sm text-gray-500">
              Write a detailed and engaging story. The more context you provide, the better!
            </p>
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
              {submitting ? 'Publishing...' : 'Publish Story'}
            </button>
            <Link
              to="/"
              className="flex-1 btn-secondary text-lg text-center"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Writing Tips */}
        <div className="mt-8 pt-8 border-t-2 border-gray-100">
          <h3 className="font-display font-bold text-editorial-dark mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-editorial-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Writing Tips
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 text-editorial-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Make your title clear and engaging to attract readers</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 text-editorial-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Provide context and details to make your story comprehensive</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 text-editorial-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Check for spelling and grammar before publishing</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateNews;
