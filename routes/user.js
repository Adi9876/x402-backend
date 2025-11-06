const express = require("express");
const {
  handleUserSignup,
  handleUserLogin,
  handleMe,
  handleUserLogout,
} = require("../controllers/user");

const router = express.Router();

router.post("/", handleUserSignup);
router.post("/login", handleUserLogin);
router.get("/me", handleMe);
router.post("/logout", handleUserLogout);

module.exports = router;
