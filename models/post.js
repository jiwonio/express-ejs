// models/post.js

const { db, transaction } = require("../modules/db");

/*
```mysql
create table posts
(
    id         bigint unsigned auto_increment
        primary key,
    user_id    int          not null,
    title      varchar(255) not null,
    content    text         not null,
    created_at timestamp    null,
    updated_at timestamp    null
) collate = utf8mb4_unicode_ci;
```
*/

/**
 * Post model class
 */
class Post {
  /**
   * Find post by ID
   * @param {number} id - Post ID
   * @returns {Promise<Object|null>} Post object or null if not found
   */
  static async findPostById(id) {
    const sql = `
      SELECT p.id, p.user_id, p.title, p.content, p.created_at, p.updated_at, u.name as author_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `;

    const posts = await db(sql, [id]);
    return posts.length > 0 ? posts[0] : null;
  }

  /**
   * Get all posts with pagination
   * @param {Object} options - Pagination options
   * @param {number} options.limit - Number of posts to return
   * @param {number} options.offset - Number of posts to skip
   * @returns {Promise<Array>} Array of post objects
   */
  static async getAllPosts({ limit = 10, offset = 0 } = {}) {
    const sql = `
      SELECT p.id, p.user_id, p.title, p.content, p.created_at, p.updated_at, u.name as author_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    return await db(sql, [String(limit), String(offset)]);
  }

  /**
   * Get posts by user ID with pagination
   * @param {number} userId - User ID
   * @param {Object} options - Pagination options
   * @param {number} options.limit - Number of posts to return
   * @param {number} options.offset - Number of posts to skip
   * @returns {Promise<Array>} Array of post objects
   */
  static async getPostsByUserId(userId, { limit = 10, offset = 0 } = {}) {
    const sql = `
      SELECT p.id, p.user_id, p.title, p.content, p.created_at, p.updated_at, u.name as author_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    return await db(sql, [userId, String(limit), String(offset)]);
  }

  /**
   * Get total count of posts
   * @returns {Promise<number>} Total number of posts
   */
  static async getPostCount() {
    const sql = `SELECT COUNT(*) as total FROM posts`;
    const [result] = await db(sql);
    return result.total;
  }

  /**
   * Get total count of posts by user ID
   * @param {number} userId - User ID
   * @returns {Promise<number>} Total number of posts by user
   */
  static async getPostCountByUserId(userId) {
    const sql = `SELECT COUNT(*) as total FROM posts WHERE user_id = ?`;
    const [result] = await db(sql, [userId]);
    return result.total;
  }

  /**
   * Create a new post with transaction
   * @param {Object} postData - Post data
   * @param {number} postData.user_id - User ID
   * @param {string} postData.title - Post title
   * @param {string} postData.content - Post content
   * @returns {Promise<number>} ID of the created post
   */
  static async createPost(postData) {
    const { user_id, title, content } = postData;

    return await transaction(async (conn) => {
      // First check if user exists
      const [userResult] = await conn.execute(
        'SELECT id FROM users WHERE id = ?',
        [user_id]
      );

      if (userResult.length === 0) {
        throw new Error('User not found');
      }

      // Insert post
      const [result] = await conn.execute(
        'INSERT INTO posts (user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [user_id, title, content]
      );

      return result.insertId;
    });
  }

  /**
   * Update a post with transaction
   * @param {number} postId - Post ID
   * @param {Object} postData - Post data to update
   * @param {string} postData.title - Post title
   * @param {string} postData.content - Post content
   * @returns {Promise<Object>} Updated post object
   */
  static async updatePost(postId, postData) {
    const { title, content } = postData;

    return await transaction(async (conn) => {
      // First check if post exists
      const [postResult] = await conn.execute(
        'SELECT id, user_id FROM posts WHERE id = ?',
        [postId]
      );

      if (postResult.length === 0) {
        throw new Error('Post not found');
      }

      // Update post
      await conn.execute(
        'UPDATE posts SET title = ?, content = ?, updated_at = NOW() WHERE id = ?',
        [title, content, postId]
      );

      // Get updated post with author name
      const [updatedPost] = await conn.execute(
        `SELECT p.id, p.user_id, p.title, p.content, p.created_at, p.updated_at, u.name as author_name
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = ?`,
        [postId]
      );

      return updatedPost[0];
    });
  }

  /**
   * Delete a post with transaction
   * @param {number} postId - Post ID
   * @returns {Promise<boolean>} True if post was deleted, false otherwise
   */
  static async deletePost(postId) {
    return await transaction(async (conn) => {
      // First check if post exists
      const [postResult] = await conn.execute(
        'SELECT id FROM posts WHERE id = ?',
        [postId]
      );

      if (postResult.length === 0) {
        throw new Error('Post not found');
      }

      // Delete post
      const [result] = await conn.execute(
        'DELETE FROM posts WHERE id = ?',
        [postId]
      );

      return result.affectedRows > 0;
    });
  }
}

module.exports = Post;