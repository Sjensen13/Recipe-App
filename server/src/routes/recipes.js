const express = require('express'); const router = express.Router(); router.get('/', (req, res) => { res.json({ message: 'recipes endpoint - to be implemented' }); }); module.exports = router;
