const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
const dotenv = require('dotenv');

dotenv.config();

// Serialize user information into session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user information from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:1000/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
  const { id, displayName, emails } = profile;

  // Check if the user exists in the database
  const userRes = await db.query('SELECT * FROM users WHERE provider = $1 AND provider_id = $2', ['google', id]);
  
  if (userRes.rows.length > 0) {
    return done(null, userRes.rows[0]);
  }

  // Insert new user into database
  const newUser = await db.query(
    'INSERT INTO users (username, email, provider, provider_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [displayName, emails[0].value, 'google', id]
  );

  done(null, newUser.rows[0]);
}));

;

 
  


