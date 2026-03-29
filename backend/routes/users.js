const router = require('express').Router();
const ctrl = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/me/bookmarks', auth, ctrl.bookmarks);
router.get('/:id', ctrl.getUser);
router.put('/:id', auth, ctrl.updateUser);
router.get('/:id/tweets', ctrl.getUserTweets);
router.get('/:id/followers', ctrl.getFollowers);
router.get('/:id/following', ctrl.getFollowing);
router.post('/:id/follow', auth, ctrl.follow);
router.delete('/:id/follow', auth, ctrl.unfollow);

module.exports = router;
