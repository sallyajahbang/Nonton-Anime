const express = require('express');
const router = express.Router();
const scrapeController = require('../controllers/scrapeController');

router.get('/', scrapeController.getOngoingAnime);
router.get('/page/:page', scrapeController.getOngoingAnime);
router.get('/search', scrapeController.searchAnime);
router.get('/bookmark', scrapeController.getBookmarkPage); // Rute baru
router.get('/anime/:endpoint', scrapeController.getAnimeDetail);
router.get('/episode/:endpoint', scrapeController.getAnimeWatch);
router.get('/category/:endpoint', scrapeController.getCategoryList);

module.exports = router;
