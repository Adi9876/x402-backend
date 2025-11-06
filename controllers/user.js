const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const { setUser, deleteUser, getUser } = require("../service/auth");

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
  setUser(sessionId, {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  });
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("uid", sessionId, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
  });
  return res.json({
    message: "User Logged In !!",
    user: { id: user._id, name: user.name, email: user.email },
  });
}

async function handleMe(req, res) {
  const sessionId = req.cookies?.uid;
  if (!sessionId) return res.status(401).json({ error: "Unauthorized" });
  const sessionUser = getUser(sessionId);
  if (!sessionUser) return res.status(401).json({ error: "Unauthorized" });
  return res.json({ user: sessionUser });
}

async function handleUserLogout(req, res) {
  const sessionId = req.cookies?.uid;
  if (sessionId) deleteUser(sessionId);
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("uid", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
  });
  return res.json({ message: "Logged out" });
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
  handleMe,
  handleUserLogout,
};
