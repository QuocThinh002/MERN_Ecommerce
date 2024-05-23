const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validation = require('../middlewares/validation');


router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:token', [validation.resetPassword], authController.resetPassword);

module.exports = router;