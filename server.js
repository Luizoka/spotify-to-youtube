require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const playlistRoutes = require("./routes/playlist.routes");

const app = express();
const PORT = 3000;

// Verificar se as variáveis de ambiente estão carregadas
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

// Configurar sessão
app.use(session({ secret: "your_secret_key", resave: false, saveUninitialized: true }));

// Configurar Passport
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    console.log("Inside GoogleStrategy callback");
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);
    console.log("Profile:", profile);
    return done(null, { profile, accessToken, refreshToken });
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use("/api", playlistRoutes);

// Rotas de autenticação
app.get("/auth/google", passport.authenticate("google", { scope: ["https://www.googleapis.com/auth/youtube.force-ssl"] }));

app.get("/auth/google/callback", (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
        if (err) {
            console.error("Error during authentication:", err);
            return next(err);
        }
        if (!user) {
            console.error("Authentication failed:", info);
            return res.redirect("/");
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error("Error during login:", err);
                return next(err);
            }
            return res.redirect("/");
        });
    })(req, res, next);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});