const app = require("express");

const router = app.Router();

const authController = require("../controllers/auth");

const { body } = require("express-validator");

const validateUser = [
  body("name").not().isEmpty().withMessage("نام الزامی است."),
  body("email").isEmail().withMessage("لطفا ایمیل معتبر وارد کنید."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("رمز عبور باید حداقل 8 کاراکتر باشد.")
    .isStrongPassword()
    .withMessage(
      "رمز عبور باید حداقل ۸ کاراکتر باشد و شامل حداقل یک حرف بزرگ، یک عدد و یک کاراکتر خاص (!@#$%^&*) باشد."
    ),
  body("phone")
    .isMobilePhone("fa-IR")
    .withMessage("لطفا یک شماره تلفن معتبر وارد کنید."),
];

router.post("/login", authController.login);

router.post("/register", validateUser, authController.register);

router.get("/verify-token", authController.verifyToken);

router.post("/forgot-password", authController.forgotPassword);

router.post("/verify-otp", authController.verifyPasswordResetOtp);

router.post("/reset-password", authController.resetPassword);

module.exports = router;
