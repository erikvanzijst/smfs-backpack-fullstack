/*
utility module in an Express.js application
provides a middleware function for user authentication
*/

// The apiRouter middleware (api/index.js) verifies the bearer token and loads
// req.user from the database; this only rejects requests that have no user.
const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  next();
};

export default requireUser; // Export the middleware function
