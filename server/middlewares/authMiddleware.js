const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token and extract the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // `JWT_SECRET` should be defined in your .env file
    req.user = decoded; // Attach user info to the request object
    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = authenticate;