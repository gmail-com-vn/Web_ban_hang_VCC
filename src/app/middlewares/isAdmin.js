module.exports = (req, res, next) => {
    console.log(req.session.user.role);
    if (req.session.user.role === 'ADMIN') {
        next();
    } else return res.redirect('/');
};
