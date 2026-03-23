import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';

// Configuration Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Vérifier si l'utilisateur existe déjà
          let user = await User.findOne({
            where: { email: profile.emails?.[0]?.value },
          });

          if (!user) {
            // Créer un nouvel utilisateur
            user = await User.create({
              firstName: profile.name?.givenName || profile.displayName,
              lastName: profile.name?.familyName || '',
              email: profile.emails?.[0]?.value || '',
              googleId: profile.id,
              isAnonymous: false,
              isPremium: false,
            }, {
              validate: false // Désactiver les validations pour OAuth
            });
            
            // Recharger l'utilisateur pour s'assurer que toutes les propriétés sont disponibles
            await user.reload();
          } else if (!user.googleId) {
            // Associer le compte Google à un compte existant
            user.googleId = profile.id;
            await user.save();
            await user.reload();
          }
         
          return done(null, user);
        } catch (error) {
          console.error('Google strategy error:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Configuration Facebook OAuth
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/facebook/callback',
        profileFields: ['id', 'emails', 'name', 'displayName'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Vérifier si l'utilisateur existe déjà
          let user = await User.findOne({
            where: { email: profile.emails?.[0]?.value },
          });

          if (!user) {
            // Créer un nouvel utilisateur
            user = await User.create({
              firstName: profile.name?.givenName || profile.displayName,
              lastName: profile.name?.familyName || '',
              email: profile.emails?.[0]?.value || '',
              facebookId: profile.id,
              isAnonymous: false,
              isPremium: false,
            }, {
              validate: false // Désactiver les validations pour OAuth
            });
            
            // Recharger l'utilisateur pour s'assurer que toutes les propriétés sont disponibles
            await user.reload();
          } else if (!user.facebookId) {
            // Associer le compte Facebook à un compte existant
            user.facebookId = profile.id;
            await user.save();
            await user.reload();
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Sérialisation de l'utilisateur
passport.serializeUser((user: any, done) => {
  const userId = user.id || user.getDataValue?.('id') || user.dataValues?.id;
  done(null, userId);
});

// Désérialisation de l'utilisateur
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
