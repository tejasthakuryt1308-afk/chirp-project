const router = require('express').Router();
const ctrl = require('../controllers/newsController');

router.get('/', ctrl.refreshNews);
router.get('/sources', ctrl.getSources);
router.get('/category/:category', ctrl.getByCategory);
router.get('/source/:source', ctrl.getBySource);

module.exports = router;
