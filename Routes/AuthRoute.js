const router = require("express").Router();
const { Signup, Login, verifyUser } = require("../Controllers/AuthController");

router.post("/signup", Signup);
router.post("/login", Login);
// router.get("/verify", verifyUser);

module.exports = router;
