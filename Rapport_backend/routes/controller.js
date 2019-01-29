const router = require('express').Router();

const tokenVerify = require('../middlewares/tokenVerify/tokenVerify');
const emailAuth = require('./emailAuth');
const login = require('./login');
const search = require('./search');

/* REST API */
router.use('/client', require('./client/controller'));
router.use('/counselor', require('./counselor/controller'));
router.use('/open', require('./open/controller'));  // tokenVerify 추가 필요
router.use('/close' ,require('./close/controller'));  // tokenVerify 추가 필요
// router.use('/case', tokenVerify('counselor'), require('./case/controller'));
router.use('/reservation', require('./reservation/controller'));  // tokenVerify 추가 필요
router.use('/manage', tokenVerify('manager'), require('./manage/controller'));

/* etc routes */
router.get('/emailAuth', emailAuth);
router.post('/login', login);
router.get('/search', search);

/* 
  By default, if authentication fails, Passport will respond with a 401 Unauthorized status,
  and any additional route handlers will not be invoked.
  If authentication succeeds, the next handler will be invoked
  and the req.user property will be set to the authenticated user.
*/

module.exports = router;