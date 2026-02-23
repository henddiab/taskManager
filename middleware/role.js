module.exports = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role) || !roles) {
      const error = new Error("Access denied");
      error.statusCode = 403;
      throw error;
    }
    next();
  };
};
