import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { newsAPI, getUserById } from '../services/api';
import { formatLongDate } from '../utils/helpers';
import { validateComment } from '../utils/helpers';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const NewsDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [author, setAuthor] = useState(null);
  const [commentAuthors, setCommentAuthors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchNews();
  }, [id]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await newsAPI.getById(id);
      setNews(data);

      // Fetch author
      const authorData = await getUserById(data.author_id);
      setAuthor(authorData);

      // Fetch comment authors
      if (data.comments && data.comments.length > 0) {
        const commentAuthorPromises = data.comments.map(comment => 
          getUserById(comment.user_id)
        );
        const commentAuthorsData = await Promise.all(commentAuthorPromises);
        
        const authorsMap = {};
        commentAuthorsData.forEach(author => {
          authorsMap[author.id] = author;
        });
        setCommentAuthors(authorsMap);
      }

    } catch (err) {
      setError('Failed to load news details. Please try again.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    const validation = validateComment(commentText);
    if (!validation.isValid) {
      setCommentError(validation.error);
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentError('');

      await newsAPI.addComment(id, {
        user_id: user.id,
        text: commentText
      });

      setCommentText('');
      await fetchNews(); // Refresh to show new comment
    } catch (err) {
      setCommentError('Failed to add comment. Please try again.');
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this news?')) {
      try {
        await newsAPI.delete(id);
        navigate('/');
      } catch (err) {
        alert('Failed to delete news. Please try again.');
        console.error('Error deleting news:', err);
      }
    }
  };

  if (loading) return <Loading message="Loading article..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchNews} />;
  if (!news) return <ErrorMessage message="News not found" />;

  const isAuthor = user?.id === news.author_id;

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

      {/* Article */}
      <article className="card p-8 md:p-12 mb-8 animate-slide-up">
        {/* Header gradient */}
        <div className="h-2 bg-gradient-to-r from-editorial-primary via-editorial-accent to-editorial-primary -mx-8 md:-mx-12 -mt-8 md:-mt-12 mb-8"></div>

        {/* Meta information */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b-2 border-gray-100">
          <div className="flex items-center space-x-4">
            <img 
              src={author?.avatar} 
              alt={author?.name} 
              className="w-16 h-16 rounded-full border-4 border-editorial-primary"
            />
            <div>
              <p className="font-display text-xl font-bold text-editorial-dark">{author?.name}</p>
              <p className="text-gray-500 font-mono text-sm">{formatLongDate(news.created_at)}</p>
            </div>
          </div>

          {/* Action buttons for author */}
          {isAuthor && (
            <div className="flex space-x-3">
              <Link
                to={`/edit/${news.id}`}
                className="px-5 py-2.5 bg-editorial-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-all duration-300 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </Link>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-editorial-accent text-white rounded-lg font-medium hover:bg-opacity-90 transition-all duration-300 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-display font-bold text-editorial-dark mb-6 leading-tight">
          {news.title}
        </h1>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
            {news.body}
          </p>
        </div>
      </article>

      {/* Comments Section */}
      <div className="card p-8 animate-slide-up animate-delay-100">
        <h2 className="text-3xl font-display font-bold mb-6 text-editorial-dark flex items-center">
          <svg className="w-8 h-8 mr-3 text-editorial-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Comments ({news.comments?.length || 0})
        </h2>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mb-8">
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-semibold text-editorial-dark mb-2">
              Add your thoughts
            </label>
            <textarea
              id="comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your perspective on this story..."
              rows="4"
              className={`textarea-field ${commentError ? 'border-red-500' : ''}`}
              disabled={submittingComment}
            />
            {commentError && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {commentError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submittingComment}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {news.comments && news.comments.length > 0 ? (
            news.comments.map((comment, index) => (
              <div 
                key={comment.id} 
                className="bg-editorial-light p-6 rounded-xl border-l-4 border-editorial-primary animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start space-x-4">
                  <img 
                    src={commentAuthors[comment.user_id]?.avatar} 
                    alt={commentAuthors[comment.user_id]?.name} 
                    className="w-12 h-12 rounded-full border-2 border-editorial-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-editorial-dark">
                        {commentAuthors[comment.user_id]?.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500 font-mono">
                        {formatLongDate(comment.created_at)}
                      </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 font-display text-lg">No comments yet</p>
              <p className="text-gray-400 text-sm mt-2">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
