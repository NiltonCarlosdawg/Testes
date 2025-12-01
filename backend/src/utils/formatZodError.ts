import { ZodError } from "zod";

export const formatZodError = <T>(error: ZodError<T>): string => {
  if (error.issues && Array.isArray(error.issues)) {
    return error.issues
      .map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      })
      .join(", ");
  }
  return "Erro de validação";
};

export const formatZodErrorAndReturnArray = <T>(error: ZodError<T>) => {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
    rule: issue.code, 
    value: issue.fatal ?? undefined, 
  }));
};
