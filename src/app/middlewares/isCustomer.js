module.exports = (req, res, next) => {
    if (req.session.user.role === 'CUSTOMER') {
        next();
    } else return res.redirect('/');
};
