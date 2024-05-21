const router = require('express').Router();
const controllers = require('../controllers/user.controller');
const { verifyAccessToken, requireAdmin } = require('../middlewares/verifyAccessToken');
const validation = require('../middlewares/validation');


router.get('/current', [verifyAccessToken], controllers.getUser);

router.post('/signup', [validation.signup, validation.checkDuplicate], controllers.signup);
router.post('/login', controllers.login);
// router.post('/refreshtoken', controllers.refreshAccessToken);
router.post('/logout', controllers.logout);
// router.get('/forgotpassword', controllers.forgotPassword);
// router.put('/resetpassword', controllers.resetPassword);
// router.get('/', [verifyAccessToken, isAdmin], controllers.getUsers);
// router.delete('/', [verifyAccessToken, isAdmin], controllers.deleteUser);

router.patch('/updateUser', [verifyAccessToken, validation.update, validation.checkDuplicate], controllers.updateUser);
// router.put('/address', [verifyAccessToken], controllers.updateUserAddress);
// router.put('/cart', [verifyAccessToken], controllers.updateCart);
// router.put('/:uid', [verifyAccessToken, isAdmin], controllers.updateUserByAdmin);

module.exports = router;