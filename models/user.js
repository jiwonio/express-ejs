// models/users.js

const {db, transaction} = require("../modules/db");
const bcrypt = require('bcrypt');

/*
```mysql
create table users
(
    id            bigint unsigned auto_increment
        primary key,
    name          varchar(255)               not null,
    email         varchar(255)               not null,
    password      varchar(255)               not null,
    role          varchar(50) default 'user' not null,
    permissions   json                       null,
    profile_image varchar(255)               null,
    last_login_at timestamp                  null,
    created_at    timestamp                  null,
    updated_at    timestamp                  null,
    constraint users_email_unique
        unique (email)
) collate = utf8mb4_unicode_ci;

create index idx_users_role on users (role);
```
*/

/**
 * User model class
 */
class User {
    /**
     * Find user by ID
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} User object or null if not found
     */
    static async findUserById(id) {
        const sql = `
            SELECT id, name, email, role, permissions, profile_image, last_login_at, created_at, updated_at
            FROM users
            WHERE id = ?
        `;

        const users = await db(sql, [id]);
        return users.length > 0 ? users[0] : null;
    }

    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>} User object or null if not found
     */
    static async findUserByEmail(email) {
        const sql = `
            SELECT id, name, email, password, role, permissions, profile_image, last_login_at, created_at, updated_at
            FROM users
            WHERE email = ?
        `;

        const users = await db(sql, [email]);
        return users.length > 0 ? users[0] : null;
    }

    /**
     * Get all users with pagination
     * @param {Object} options - Pagination options
     * @param {number} options.limit - Number of users to return
     * @param {number} options.offset - Number of users to skip
     * @returns {Promise<Array>} Array of user objects
     */
    static async getAllUsers({ limit = 10, offset = 0 } = {}) {
        const sql = `
            SELECT id, name, email, role, permissions, profile_image, last_login_at, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

        return await db(sql, [String(limit), String(offset)]);
    }

    /**
     * Get total count of users
     * @returns {Promise<number>} Total number of users
     */
    static async getUserCount() {
        const sql = `SELECT COUNT(*) as total FROM users`;
        const [result] = await db(sql);
        return result.total;
    }

    /**
     * Create a new user
     * @param {Object} userData - User data
     * @param {string} userData.name - User name
     * @param {string} userData.email - User email
     * @param {string} userData.password - User password (plain text)
     * @param {string} userData.role - User role (default: 'user')
     * @param {Array|null} userData.permissions - User permissions
     * @param {string|null} userData.profile_image - User profile image
     * @returns {Promise<number>} ID of the created user
     */
    static async createUser(userData) {
        const { name, email, password, role = 'user', permissions = null, profile_image = null } = userData;

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sql = `
            INSERT INTO users (name, email, password, role, permissions, profile_image, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const result = await db(sql, [
            name,
            email,
            hashedPassword,
            role,
            permissions ? JSON.stringify(permissions) : null,
            profile_image
        ]);

        return result.insertId;
    }

    /**
     * Update user's last login time
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Result of the update operation
     */
    static async updateUserLastLogin(userId) {
        const sql = `UPDATE users SET last_login_at = NOW() WHERE id = ?`;
        return await db(sql, [userId]);
    }

    /**
     * Verify password
     * @param {string} plainPassword - Plain text password
     * @param {string} hashedPassword - Hashed password
     * @returns {Promise<boolean>} True if password is valid, false otherwise
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Update user with transaction example
     * @param {number} userId - User ID
     * @param {Object} userData - User data to update
     * @returns {Promise<Object>} Result of the update operation
     */
    static async updateUserWithTransaction(userId, userData) {
        return await transaction(async (conn) => {
            // First check if user exists
            const [userResult] = await conn.execute(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );

            if (userResult.length === 0) {
                throw new Error('User not found');
            }

            // Update user data
            const { name, email, role, permissions } = userData;

            await conn.execute(
                'UPDATE users SET name = ?, email = ?, role = ?, permissions = ?, updated_at = NOW() WHERE id = ?',
                [name, email, role, permissions ? JSON.stringify(permissions) : null, userId]
            );

            // Get updated user
            const [updatedUser] = await conn.execute(
                'SELECT id, name, email, role, permissions, profile_image, last_login_at, created_at, updated_at FROM users WHERE id = ?',
                [userId]
            );

            return updatedUser[0];
        });
    }
}

module.exports = User;