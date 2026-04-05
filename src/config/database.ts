import { PrismaClient } from '@prisma/client';
import { config } from './index.js';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: config.server.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
  });

if (!config.server.isProduction) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
