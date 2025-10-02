exports.pageNotFound = (req, res, next) => {
  res
    .status(404)
    .render("404", { pageTitle: "Page Not Found", currentPage: "404", isLogedin: req.isLogedin, 
    user : req.session.user });
};
