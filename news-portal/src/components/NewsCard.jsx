import { Link } from 'react-router-dom';
import { formatDate, truncateText } from '../utils/helpers';

const NewsCard = ({ news, author, currentUserId, onDelete }) => {
  const isAuthor = currentUserId === news.author_id;

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this news?')) {
      onDelete(news.id);
    }
  };

  return (
    <article className="card group animate-slide-up">
      <Link to={`/news/${news.id}`} className="block">
        {/* Header with gradient */}
        <div className="h-2 bg-gradient-to-r from-editorial-primary via-editorial-accent to-editorial-primary"></div>
        
        <div className="p-6">
          {/* Meta information */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img 
                src={author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                alt={author?.name || 'Unknown'} 
                className="w-10 h-10 rounded-full border-2 border-editorial-primary"
              />
              <div>
                <p className="font-semibold text-sm text-editorial-dark">{author?.name || 'Unknown Author'}</p>
                <p className="text-xs text-gray-500 font-mono">{formatDate(news.created_at)}</p>
              </div>
            </div>
            
            {/* Comment count badge */}
            <div className="flex items-center space-x-1 bg-editorial-light px-3 py-1 rounded-full">
              <svg className="w-4 h-4 text-editorial-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="text-sm font-semibold text-editorial-primary">{news.comments?.length || 0}</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-display font-bold mb-3 text-editorial-dark group-hover:text-editorial-accent transition-colors duration-300 line-clamp-2">
            {news.title}
          </h2>

          {/* Excerpt */}
          <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {truncateText(news.body, 150)}
          </p>

          {/* Read more indicator */}
          <div className="flex items-center text-editorial-primary font-medium group-hover:text-editorial-accent transition-colors duration-300">
            <span className="text-sm">Read full story</span>
            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>

      {/* Action buttons for author */}
      {isAuthor && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex space-x-3">
          <Link
            to={`/edit/${news.id}`}
            className="flex-1 px-4 py-2 bg-editorial-primary text-white rounded-lg text-center text-sm font-medium hover:bg-opacity-90 transition-all duration-300"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-editorial-accent text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all duration-300"
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
};

export default NewsCard;
