const app = require("express");

const router = app.Router();

router.post("/login", (req, res) => {});

router.post("/register", (req, res) => {});

router.post("/forgot-password", (req, res) => {});

router.post("/verify-otp", (req, res) => {});

router.post("/reset-password", (req, res) => {});

module.exports = router;
