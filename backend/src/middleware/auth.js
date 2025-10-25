const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

// Token verification middleware
const authenticateUser = async (request, response, next) => {
  try {
    const authToken = request.header('Authorization')?.replace('Bearer ', '');
    
    if (!authToken) {
      return response.status(401).json({ error: 'Authentication token missing' });
    }

    const tokenPayload = jwt.verify(authToken, process.env.JWT_SECRET);
    const authenticatedUser = await UserModel.findById(tokenPayload.userId);

    if (!authenticatedUser) {
      return response.status(401).json({ error: 'Invalid user credentials' });
    }

    request.user = authenticatedUser;
    request.token = authToken;
    next();
  } catch (verificationError) {
    response.status(401).json({ error: 'Authentication required' });
  }
};

// Permission-based authorization
const requireRole = (...permittedRoles) => {
  return (request, response, next) => {
    if (!request.user) {
      return response.status(401).json({ error: 'User authentication needed' });
    }

    if (!permittedRoles.includes(request.user.role)) {
      return response.status(403).json({ 
        error: 'Insufficient privileges for this action' 
      });
    }

    next();
  };
};

// Organization-based data filtering
const applyOrganizationScope = (request, response, next) => {
  if (!request.user) {
    return response.status(401).json({ error: 'User must be authenticated' });
  }

  // Administrators have cross-organization access
  if (request.user.role === 'admin') {
    return next();
  }

  // Standard users restricted to their organization
  request.organizationFilter = { organization: request.user.organization };
  next();
};

module.exports = { auth: authenticateUser, authorize: requireRole, checkOrganization: applyOrganizationScope };
