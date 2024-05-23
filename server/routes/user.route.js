const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { verifyAccessToken, requireAdmin } = require('../middlewares/verifyAccessToken');
const validation = require('../middlewares/validation');

// CRUD - CREATE READ UPDATE DELETE

// CREATE
router.post('/signUp', [validation.signup], userController.signup);

// READ
router.get('/me', [verifyAccessToken], userController.getUser);
router.get('/', [verifyAccessToken, requireAdmin], userController.getAllUsers);
router.get('/:userId', [verifyAccessToken, requireAdmin], userController.getUserById);

// UPDATE
router.patch('/me', [verifyAccessToken, validation.updateUser], userController.updateMe);
router.patch('/:userId', [verifyAccessToken, validation.updateUserByAdmin, requireAdmin], userController.updateUserByAdmin);
router.patch('/deactivate', [verifyAccessToken], userController.deactivateUser);
router.patch('/changePassword', [verifyAccessToken, validation.changePassword], userController.changePassword)

// DELETE


// router.post('/refreshtoken', userController.refreshAccessToken);

// changeMulti(tham khảo gmail)
// router.delete('/', [verifyAccessToken, isAdmin], userController.deleteUser);

// router.put('/address', [verifyAccessToken], userController.updateUserAddress);
// router.put('/cart', [verifyAccessToken], userController.updateCart);


module.exports = router;