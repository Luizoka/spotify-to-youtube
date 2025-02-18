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

app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/"); // Redirecionar para a página inicial após o login
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});