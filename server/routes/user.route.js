const router = require('express').Router();
const controllers = require('../controllers/user.controller');
const { verifyAccessToken, requireAdmin } = require('../middlewares/verifyAccessToken');
const validation = require('../middlewares/validation');


router.get('/current', [verifyAccessToken], controllers.getUser);
router.get('/allUsers', [verifyAccessToken, requireAdmin], controllers.getAllUsers)

router.post('/signUp', [validation.signup], controllers.signup);
router.post('/login', controllers.login);
router.post('/logout', controllers.logout);
router.post('/changePassword', [verifyAccessToken, validation.changePassword], controllers.changePassword)
// router.post('/refreshtoken', controllers.refreshAccessToken);
// router.get('/forgotpassword', controllers.forgotPassword);
// router.put('/resetpassword', controllers.resetPassword);
// router.get('/', [verifyAccessToken, isAdmin], controllers.getUsers);
// router.delete('/', [verifyAccessToken, isAdmin], controllers.deleteUser);

router.patch('/updateUser', [verifyAccessToken, validation.updateUser], controllers.updateUser);
// router.put('/address', [verifyAccessToken], controllers.updateUserAddress);
// router.put('/cart', [verifyAccessToken], controllers.updateCart);
// router.put('/:uid', [verifyAccessToken, isAdmin], controllers.updateUserByAdmin);

module.exports = router;