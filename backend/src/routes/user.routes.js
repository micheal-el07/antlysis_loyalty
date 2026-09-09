const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/userValidator');

router.get('/me', authMiddleware, userController.getMe);
router.put('/me', authMiddleware, validate(updateProfileSchema), userController.updateMe);

module.exports = router;
