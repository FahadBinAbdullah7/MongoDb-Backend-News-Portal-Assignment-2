// API Service for News Portal
// Connects to MongoDB backend (Express + Mongoose)

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

console.log('🔌 API Configuration:');
console.log('   Backend URL:', API_URL);
console.log('   Environment:', process.env.NODE_ENV);

// ============================================================================
// USERS API
// ============================================================================

/**
 * Get all users
 * @returns {Promise<Array>} Array of user objects
 */
export const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Fetched users:', data.length);
    return data;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw new Error('Failed to fetch users. Make sure backend is running on ' + API_URL);
  }
};

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} User object
 */
export const getUserById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
};

// ============================================================================
// NEWS API
// ============================================================================

/**
 * Get all news articles
 * @returns {Promise<Array>} Array of news objects
 */
export const getAllNews = async () => {
  try {
    const response = await fetch(`${API_URL}/news`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Fetched news:', data.length);
    return data;
  } catch (error) {
    console.error('❌ Error fetching news:', error);
    throw new Error('Failed to fetch news. Make sure backend is running on ' + API_URL);
  }
};

/**
 * Get single news article by ID
 * @param {string} id - News ID
 * @returns {Promise<Object>} News object
 */
export const getNewsById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/news/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('News article not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching news item:', error);
    throw error;
  }
};

/**
 * Create new news article
 * @param {Object} newsData - News article data {title, body, author_id}
 * @returns {Promise<Object>} Created news object
 */
export const createNews = async (newsData) => {
  try {
    const response = await fetch(`${API_URL}/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: newsData.title,
        body: newsData.body,
        author_id: newsData.author_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Created news:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error creating news:', error);
    throw new Error('Failed to create news: ' + error.message);
  }
};

/**
 * Update existing news article
 * @param {string} id - News ID
 * @param {Object} newsData - Updated news data
 * @returns {Promise<Object>} Updated news object
 */
export const updateNews = async (id, newsData) => {
  try {
    const response = await fetch(`${API_URL}/news/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newsData),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('News article not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Updated news:', id);
    return data;
  } catch (error) {
    console.error('❌ Error updating news:', error);
    throw error;
  }
};

/**
 * Delete news article
 * @param {string} id - News ID
 * @returns {Promise<Object>} Success response
 */
export const deleteNews = async (id) => {
  try {
    const response = await fetch(`${API_URL}/news/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('News article not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Deleted news:', id);
    return data;
  } catch (error) {
    console.error('❌ Error deleting news:', error);
    throw error;
  }
};

// ============================================================================
// COMMENTS API
// ============================================================================

/**
 * Add comment to news article
 * @param {string} newsId - News ID
 * @param {Object} comment - Comment data {user_id, text}
 * @returns {Promise<Object>} Updated news object with new comment
 */
export const addComment = async (newsId, comment) => {
  try {
    // Get current news article
    const news = await getNewsById(newsId);
    
    // Generate new comment ID
    const newCommentId = news.comments && news.comments.length > 0
      ? Math.max(...news.comments.map(c => c.id)) + 1
      : 1;
    
    // Create new comment object
    const newComment = {
      id: newCommentId,
      user_id: comment.user_id,
      text: comment.text,
      created_at: new Date().toISOString()
    };
    
    // Add comment to array
    const updatedComments = [...(news.comments || []), newComment];
    
    // Update news article with new comments array
    const updatedNews = await updateNews(newsId, { comments: updatedComments });
    
    console.log('✅ Added comment to news:', newsId);
    return updatedNews;
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    throw new Error('Failed to add comment');
  }
};

/**
 * Delete comment from news article
 * @param {string} newsId - News ID
 * @param {number} commentId - Comment ID
 * @returns {Promise<Object>} Updated news object without deleted comment
 */
export const deleteComment = async (newsId, commentId) => {
  try {
    // Get current news article
    const news = await getNewsById(newsId);
    
    // Filter out the comment to delete
    const updatedComments = (news.comments || []).filter(c => c.id !== commentId);
    
    // Update news article with filtered comments array
    const updatedNews = await updateNews(newsId, { comments: updatedComments });
    
    console.log('✅ Deleted comment from news:', newsId);
    return updatedNews;
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    throw new Error('Failed to delete comment');
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Users
  getUsers,
  getUserById,
  
  // News
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  
  // Comments
  addComment,
  deleteComment
};
