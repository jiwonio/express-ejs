// middleware/passport.js

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const { logger } = require('../modules/logger');

/**
 * Configure local strategy for use by Passport
 */
const configureLocalStrategy = () => {
  return new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await User.findUserByEmail(email);

          // If user not found
          if (!user) {
            return done(null, false, { message: 'Incorrect email or password' });
          }

          // Verify password
          const isValid = await User.verifyPassword(password, user.password);

          // If password is invalid
          if (!isValid) {
            return done(null, false, { message: 'Incorrect email or password' });
          }

          // Update last login time
          await User.updateUserLastLogin(user.id);

          // Return user without password
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (error) {
          logger.error('Error during authentication:', error);
          return done(error);
        }
      }
  );
};

/**
 * Configure Passport.js local authentication strategy
 */
const configurePassport = () => {
  // Configure local strategy for use by Passport
  passport.use(configureLocalStrategy());

  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findUserById(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      logger.error('Error deserializing user:', error);
      done(error);
    }
  });

  return (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
    logger.info('🔐 Passport authentication configured successfully');
    return app;
  };

};

module.exports = configurePassport;