let express = require('express');
let router = express.Router();
let userController = require('./controllers/userController');

router.get('/', (req, res) => res.send('API running'));

//router.get('/user', userController.userList);

// patient register only
router.post('/api/registeruser', userController.registeruser);

router.post('/api/registerdoctor', userController.registerDoctor);
// auth
router.post('/api/login', userController.login);
router.get('/api/me', userController.verifyToken, userController.me);

// requests
router.get('/api/requests', userController.verifyToken, userController.getRequests);
router.post('/api/requests', userController.verifyToken, userController.createRequest);

module.exports = router;