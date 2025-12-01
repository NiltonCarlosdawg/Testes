import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      username: string,
      userId: string,
      email: string,
      roleId: string,
    };
  }
}
