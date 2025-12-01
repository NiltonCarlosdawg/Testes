// src/utils/exceptions.ts
export class NotFoundException extends Error {
  constructor(message: string = "Recurso não encontrado") {
    super(message);
    this.name = "NotFoundException";
  }
}

export class ValidationException extends Error {
  constructor(message: string = "Erro de validação") {
    super(message);
    this.name = "ValidationException";
  }
}

export class UnauthorizedException extends Error {
  constructor(message: string = "Não autorizado") {
    super(message);
    this.name = "UnauthorizedException";
  }
}