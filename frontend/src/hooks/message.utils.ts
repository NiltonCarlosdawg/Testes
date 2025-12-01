export const MANDATORY = (module: string): string =>
  `${capitalize(module)} é obrigatório`;

export const NOTFOUND = (module: string): string => {
  const suffix = module.trim().endsWith("a") ? "não encontrada" : "não encontrado";
  return `${capitalize(module)} ${suffix}`;
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
