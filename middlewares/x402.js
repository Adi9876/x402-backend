const { paymentMiddleware } = require("x402-express");

function createX402Middleware(config) {
  const {
    receiverAddress,
    priceUsd,
    network = "base-sepolia",
    facilitatorUrl = "https://x402.org/facilitator", 
    routeConfig = {},
  } = config;

  if (!receiverAddress || !priceUsd) {
    throw new Error(
      "x402 config missing required fields: receiverAddress and priceUsd"
    );
  }

  const formattedPrice = priceUsd.startsWith("$") ? priceUsd : `$${priceUsd}`;
  const routeConfigMap = {
    "POST /": {
      price: formattedPrice,
      network: network,
      ...routeConfig,
    },
  };

  const facilitatorConfig = {
    url: facilitatorUrl,
  };

  return paymentMiddleware(receiverAddress, routeConfigMap, facilitatorConfig);
}

module.exports = { createX402Middleware };
