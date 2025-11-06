const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const { setUser } = require("../service/auth");

async function handleUserSignup(req, res) {
  const { name, email, password } = req.body;

  try {
    await User.create({
      name,
      email,
      password,
    });

    return res.status(201).json({ message: "User Created !!" });
  } catch (error) {
    return res.status(500).json({ message: "Error creating USer !!" });
  }
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (!user)
    return res.status(401).json({ error: "Invalid Username or Password" });

  const sessionId = uuidv4();
  setUser(sessionId, user);
  res.cookie("uid", sessionId);
  return res.json({ message: "User Logged In !!" });
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
};
