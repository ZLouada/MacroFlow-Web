import http from 'http';
declare const server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
declare const io: import("socket.io").Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export { server, io };
//# sourceMappingURL=server.d.ts.map