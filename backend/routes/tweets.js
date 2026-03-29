const router = require('express').Router();
const ctrl = require('../controllers/tweetController');
const auth = require('../middleware/auth');

router.get('/', ctrl.getTweets);
router.get('/search', ctrl.searchTweets);
router.get('/:id', ctrl.getTweet);
router.post('/', auth, ctrl.createTweet);
router.delete('/:id', auth, ctrl.deleteTweet);
router.post('/:id/like', auth, ctrl.likeTweet);
router.delete('/:id/like', auth, ctrl.unlikeTweet);
router.post('/:id/retweet', auth, ctrl.retweetTweet);
router.delete('/:id/retweet', auth, ctrl.unretweetTweet);
router.post('/:id/reply', auth, ctrl.replyTweet);

module.exports = router;
