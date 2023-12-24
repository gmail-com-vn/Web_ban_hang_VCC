class SiteController {
    getHome(req, res, next) {
        res.render('home', { cssPath: 'home.css' });
    }
}

module.exports = new SiteController();
