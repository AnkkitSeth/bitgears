const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You have access to protected data.",
    user: req.user,
  });
});

module.exports = router;
