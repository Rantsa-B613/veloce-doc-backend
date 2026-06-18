class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = 'AppError';
  }
}

class AuthError extends AppError {
  constructor(message = 'Non autorisé') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Ressource introuvable') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class QuotaError extends AppError {
  constructor(message = 'Quota dépassé') {
    super(message, 403);
    this.name = 'QuotaError';
  }
}

class ValidationError extends AppError {
  constructor(message = 'Données invalides') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflit de données') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

module.exports = { AppError, AuthError, NotFoundError, QuotaError, ValidationError, ConflictError };
