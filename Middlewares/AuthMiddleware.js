const User = require("../model/userModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json({ status: false });

    const data = jwt.verify(token, process.env.TOKEN_KEY);
    const user = await User.findById(data.id);

    if (user) return res.json({ status: true, user: user.username });
    else return res.json({ status: false });
  } catch (err) {
    console.error("User verification error:", err.message);
    return res.json({ status: false });
  }
};
