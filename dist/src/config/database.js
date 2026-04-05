"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const index_js_1 = require("./index.js");
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: index_js_1.config.server.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    });
if (!index_js_1.config.server.isProduction) {
    globalForPrisma.prisma = exports.prisma;
}
exports.default = exports.prisma;
//# sourceMappingURL=database.js.map