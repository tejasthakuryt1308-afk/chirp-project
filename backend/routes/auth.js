const router = require('express').Router();
const ctrl = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password/:token', ctrl.resetPassword);
router.get('/me', auth, ctrl.me);

module.exports = router;
