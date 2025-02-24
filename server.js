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
app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true
}));

// Configurar Passport
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/youtube.force-ssl"
    ],
    accessType: "offline", // Garante que recebemos o refresh token
    prompt: "consent", // Força o usuário a conceder permissão novamente
    approval_prompt: "force",
    accessToken:"offline",
    passReqToCallback: true // Permite acesso ao request,
}, (req, accessToken, refreshToken, profile, done) => {
    if (!accessToken) {
        return done(new Error("Failed to obtain access token"));
    }

    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken || "Nenhum refresh token recebido");

    return done(null, {
        profile,
        accessToken,
        refreshToken
    });
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
app.use(express.urlencoded({ extended: true })); // Para processar dados de formulários

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Usuário não autenticado" });
}

app.use("/api", ensureAuthenticated, playlistRoutes);

app.get("/", (req, res) => {
    res.send(`
        <h1>Autenticação bem-sucedida! 🚀</h1>
        <p>Vá para <a href="/auth/google">/auth/google</a> para testar novamente.</p>
        <form action="/create-playlist" method="post">
            <label for="playlistUrl">URL da Playlist do Spotify:</label>
            <input type="text" id="playlistUrl" name="playlistUrl" required>
            <button type="submit">Criar Playlist no YouTube</button>
        </form>
    `);
});

// Rota de autenticação Google
app.get("/auth/google", passport.authenticate("google"));

// Callback do Google OAuth
app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        console.log("Usuário autenticado com sucesso!");
        res.redirect("/"); // Redirecionar para a página inicial após o login
    }
);

// Rota para processar o formulário e criar a playlist no YouTube
app.post("/create-playlist", ensureAuthenticated, async (req, res) => {
    const { playlistUrl } = req.body;

    if (!playlistUrl) {
        return res.status(400).send("O parâmetro playlistUrl é obrigatório.");
    }

    console.log("Recebido playlistUrl:", playlistUrl);
    console.log("AccessToken do usuário:", req.user.accessToken);

    try {
        const response = await fetch("http://localhost:3000/api/playlist/youtube", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${req.user.accessToken}`
            },
            body: JSON.stringify({ playlistUrl })
        });

        console.log("Resposta da API:", response.status, response.statusText);

        const responseBody = await response.text();
        console.log("Corpo da resposta da API:", responseBody);

        if (!response.ok) throw new Error("Erro ao criar a playlist no YouTube");

        const result = JSON.parse(responseBody);
        console.log("Resultado da criação da playlist:", result);
        res.send(`<p>${result.message}</p><a href="/">Voltar</a>`);
    } catch (error) {
        console.error("Erro ao criar a playlist no YouTube:", error.message);
        res.status(500).send(`Erro: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server listening on port ${PORT}`);
});