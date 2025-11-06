const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const {
  handleGenerateNewShortURL,
  handleGetAnalytics,
} = require("../controllers/url");

const { createX402Middleware } = require("../middlewares/x402");

const router = express.Router();

router.use(
  createX402Middleware({
    receiverAddress: process.env.X402_RECEIVER,
    priceUsd: process.env.X402_PRICE_USD || "0.01",
    network: process.env.X402_NETWORK || "base-sepolia",
    facilitatorUrl:
      process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator",
    routeConfig: {
      description: "Generate a new short URL",
    },
  })
);

router.post("/", handleGenerateNewShortURL);

router.get("/analytics/:shortId", handleGetAnalytics);

module.exports = router;
