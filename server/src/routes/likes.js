const express = require('express'); const router = express.Router(); router.get('/', (req, res) => { res.json({ message: 'likes endpoint - to be implemented' }); }); module.exports = router;
