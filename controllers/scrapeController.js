const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const BASE_URL = 'https://otakudesu.blog';

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

const requestConfig = {
    httpsAgent,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    }
};

const getOngoingAnime = async (req, res) => {
    try {
        const page = req.params.page || 1;
        const targetUrl = page > 1 ? `${BASE_URL}/ongoing-anime/page/${page}/` : `${BASE_URL}/`;
        
        const response = await axios.get(targetUrl, requestConfig);
        const $ = cheerio.load(response.data);

        let animeList = [];

        $('.venz ul li').each((index, element) => {
            const title = $(element).find('.jdlflm').text();
            const episode = $(element).find('.epz').text();
            const day = $(element).find('.epztipe').text();
            let link = $(element).find('a').attr('href');
            const image = $(element).find('img').attr('src');

            if (title && link) {
                try {
                    const urlObj = new URL(link);
                    const pathParts = urlObj.pathname.split('/').filter(Boolean);
                    if (pathParts[0] === 'anime') {
                        link = `/anime/${pathParts[1]}`;
                    }
                } catch (e) {}
                animeList.push({ title, episode, day, link, image });
            }
        });

        res.render('index', { animeList, currentPage: parseInt(page) });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat mengambil data utama');
    }
};

const searchAnime = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.redirect('/');
        
        const targetUrl = `${BASE_URL}/?s=${query}&post_type=anime`;
        const response = await axios.get(targetUrl, requestConfig);
        const $ = cheerio.load(response.data);
        
        let animeList = [];
        
        $('.chivsrc li').each((index, element) => {
            const title = $(element).find('h2 a').text();
            let link = $(element).find('h2 a').attr('href');
            const image = $(element).find('img').attr('src');
            const episode = $(element).find('.set').first().text();
            const day = $(element).find('.set').eq(1).text() || ''; 
            
            if (title && link) {
                try {
                    const urlObj = new URL(link);
                    const pathParts = urlObj.pathname.split('/').filter(Boolean);
                    if (pathParts[0] === 'anime') {
                        link = `/anime/${pathParts[1]}`;
                    }
                } catch (e) {}
                animeList.push({ title, episode, day, link, image });
            }
        });
        
        res.render('index', { animeList, currentPage: 1, searchQuery: query });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat mencari anime');
    }
};

const getAnimeDetail = async (req, res) => {
    try {
        const endpoint = req.params.endpoint;
        const targetUrl = `${BASE_URL}/anime/${endpoint}/`;
        
        const response = await axios.get(targetUrl, requestConfig);
        const $ = cheerio.load(response.data);
        
        const title = $('.jdlrx h1').text();
        const image = $('.fotoanime img').attr('src');
        const synopsis = $('.sinopc').text();
        
        let episodeList = [];
        $('.episodelist ul li').each((index, element) => {
            const epTitle = $(element).find('a').text();
            let epLink = $(element).find('a').attr('href');
            const epDate = $(element).find('.zeebr').text();
            
            if (epLink) {
                try {
                    const urlObj = new URL(epLink);
                    const pathParts = urlObj.pathname.split('/').filter(Boolean);
                    if (pathParts[0] === 'episode') {
                        epLink = `/episode/${pathParts[1]}`;
                        episodeList.push({ epTitle, epLink, epDate });
                    }
                } catch (e) {}
            }
        });
        
        res.render('detail', { title, image, synopsis, episodeList });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat mengambil data detail');
    }
};

const getAnimeWatch = async (req, res) => {
    try {
        const endpoint = req.params.endpoint;
        const targetUrl = `${BASE_URL}/episode/${endpoint}/`;
        
        const response = await axios.get(targetUrl, requestConfig);
        const $ = cheerio.load(response.data);
        
        const title = $('.venutama h1').text();
        const iframeSrc = $('#lightsVideo iframe').attr('src');

        let downloadList = [];
        $('.download ul li').each((index, element) => {
            const resolution = $(element).find('strong').text();
            const links = [];
            $(element).find('a').each((i, el) => {
                links.push({
                    provider: $(el).text(),
                    url: $(el).attr('href')
                });
            });
            if (resolution) {
                downloadList.push({ resolution, links });
            }
        });
        
        res.render('watch', { title, iframeSrc, downloadList });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat mengambil data tayangan');
    }
};

const getCategoryList = async (req, res) => {
    try {
        const endpoint = req.params.endpoint;
        const targetUrl = `${BASE_URL}/genres/${endpoint}/`;
        
        const response = await axios.get(targetUrl, requestConfig);
        const $ = cheerio.load(response.data);
        
        let categoryList = [];
        $('.col-anime-con').each((index, element) => {
            const title = $(element).find('.col-anime-title').text();
            let link = $(element).find('a').attr('href');
            const image = $(element).find('img').attr('src');
            
            if (link) {
                try {
                    const urlObj = new URL(link);
                    const pathParts = urlObj.pathname.split('/').filter(Boolean);
                    if (pathParts[0] === 'anime') {
                        link = `/anime/${pathParts[1]}`;
                    }
                } catch (e) {}
            }
            
            categoryList.push({ title, link, image });
        });
        
        res.render('category', { categoryList, categoryName: endpoint });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat mengambil data kategori');
    }
};

const getBookmarkPage = (req, res) => {
    // Merender halaman bookmark statis, data akan diisi oleh client-side JS
    res.render('bookmark', { title: 'Bookmark Saya' });
};

module.exports = {
    getOngoingAnime,
    searchAnime,
    getBookmarkPage, // Fungsi baru
    getAnimeDetail,
    getAnimeWatch,
    getCategoryList
};