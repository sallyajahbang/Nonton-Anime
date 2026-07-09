const pixivModel = require('../models/pixivModel');
const axios = require('axios');

const renderHome = async (req, res, next) => {
    try {
        const query = 'Alice Von Ataraxia';
        const data = await pixivModel.searchPixiv(query);
        res.render('search', { query, data });
    } catch (error) {
        next(error);
    }
};

const handleSearch = async (req, res) => {
    try {
        const query = req.query.q || '';
        const page = parseInt(req.query.page) || 1;
        
        const data = await pixivModel.searchPixiv(query, page);

        // Jika permintaan dikirim via fetch/ajax untuk memuat halaman tambahan
        if (req.query.ajax === '1') {
            return res.json(data);
        }

        // Render halaman pertama secara utuh seperti biasa
        res.render('search', { query, data });
    } catch (error) {
        res.status(500).send('Terjadi kesalahan pada server internal');
    }
};

module.exports = { handleSearch };

const handleViewArtwork = async (req, res, next) => {
    try {
        const artworkId = req.params.id;
        const artworkData = await pixivModel.getArtworkPages(artworkId);
        res.render('artwork', { artworkData });
    } catch (error) {
        next(error);
    }
};

// Handler untuk menampilkan halaman profil user
const handleUserProfile = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const data = await pixivModel.getUserProfile(userId);
        res.render('profile', { data });
    } catch (error) {
        next(error);
    }
};

const proxyImage = async (req, res, next) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) return res.status(400).send('URL gambar tidak ditemukan');

        const response = await axios({
            method: 'get',
            url: imageUrl,
            headers: {
                'Referer': 'https://www.pixiv.net/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            responseType: 'stream'
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (error) {
        next(error);
    }
};

module.exports = { renderHome, handleSearch, handleViewArtwork, handleUserProfile, proxyImage };