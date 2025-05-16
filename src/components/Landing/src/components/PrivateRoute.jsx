import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const PrivateRoute = ({ element: Element, ...rest }) => {
  const token = sessionStorage.getItem('token'); 
  const isAuthenticated = !!token;
  const location = useLocation();

  return isAuthenticated ? (
    React.createElement(Element, { ...rest })
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

PrivateRoute.propTypes = {
  element: PropTypes.elementType.isRequired,
};

export default PrivateRoute;
