const router = require('express').Router();
const upload = require('../middleware/upload');
const ctrl = require('../controllers/uploadController');
const auth = require('../middleware/auth');

router.post('/image', auth, upload.single('image'), ctrl.uploadImage);

module.exports = router;
