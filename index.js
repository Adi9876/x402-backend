const express = require("express");
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require("./connect");
// const { restrictToLoggedinUserOnly, checkAuth } = require("./middlewares/auth");
const URL = require("./models/url");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const urlRoute = require("./routes/url");

const app = express();
const PORT = 8001;

connectToMongoDB(
  process.env.MONGODB_URL ?? "mongodb://localhost:27017/short-url"
).then(() => console.log("Mongodb connected"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Configure CORS to support credentials (cookies) from the frontend
// Normalize allowed origins to avoid trailing-slash mismatches
const normalizeOrigin = (value) => (value ? value.replace(/\/$/, "") : value);
const defaultOrigin = "http://localhost:5173";
const envOrigin = normalizeOrigin(process.env.FRONTEND_ORIGIN);
const additionalOrigins = (process.env.FRONTEND_ORIGINS || "")
  .split(",")
  .map((o) => normalizeOrigin(o.trim()))
  .filter(Boolean);
const allowedOrigins = [normalizeOrigin(defaultOrigin)]
  .concat(envOrigin ? [envOrigin] : [])
  .concat(additionalOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser or same-origin requests (no Origin header)
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some((o) => {
      if (!o) return false;
      if (o instanceof RegExp) return o.test(origin);
      return o === normalizeOrigin(origin);
    });
    if (isAllowed) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Ensure preflight requests are handled for all routes
app.options("*", cors(corsOptions));

app.get("/", (req, res) => {
  res.json({ ok: true, service: "x402-url-shortener", version: "1.0" });
});

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );

  if (!entry) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  res.redirect(entry.redirectURL);
});

// Remove user auth endpoints and auth guard: URLs are public now
app.use("/url", urlRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
