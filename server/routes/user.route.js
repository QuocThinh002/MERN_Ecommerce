const router = require('express').Router();
const controllers = require('../controllers/user.controller');
const { verifyToken, requireAdmin } = require('../middlewares/verifyToken');
const validation = require('../middlewares/validation');


router.post('/signup', [validation.signup, validation.checkDuplicate], controllers.signup);
router.post('/login', controllers.login);
router.get('/current', [verifyToken], controllers.getUser);
// router.post('/refreshtoken', controllers.refreshAccessToken);
// router.get('/logout', controllers.logout);
// router.get('/forgotpassword', controllers.forgotPassword);
// router.put('/resetpassword', controllers.resetPassword);
// router.get('/', [verifyToken, isAdmin], controllers.getUsers);
// router.delete('/', [verifyToken, isAdmin], controllers.deleteUser);

router.patch('/updateMyProfile', [verifyToken, validation.update, validation.checkDuplicate], controllers.updateUser);
// router.put('/address', [verifyToken], controllers.updateUserAddress);
// router.put('/cart', [verifyToken], controllers.updateCart);
// router.put('/:uid', [verifyToken, isAdmin], controllers.updateUserByAdmin);

module.exports = router;