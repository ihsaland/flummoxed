import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

interface RateLimit {
  [key: string]: {
    count: number;
    lastReset: number;
  };
}

const rateLimits: RateLimit = {};
const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_REQUESTS = 5;

const checkRateLimit = (socket: Socket): boolean => {
  const now = Date.now();
  const clientId = socket.id;

  if (!rateLimits[clientId] || now - rateLimits[clientId].lastReset > RATE_LIMIT_WINDOW) {
    rateLimits[clientId] = {
      count: 1,
      lastReset: now,
    };
    return true;
  }

  if (rateLimits[clientId].count >= MAX_REQUESTS) {
    return false;
  }

  rateLimits[clientId].count++;
  return true;
};

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Handle rate limiting
    socket.use(([event, ...args], next) => {
      if (!checkRateLimit(socket)) {
        return next(new Error('Rate limit exceeded'));
      }
      next();
    });

    // Handle game events
    socket.on('joinGame', (gameId: string) => {
      socket.join(gameId);
      io.to(gameId).emit('playerJoined', { playerId: socket.id });
    });

    socket.on('leaveGame', (gameId: string) => {
      socket.leave(gameId);
      io.to(gameId).emit('playerLeft', { playerId: socket.id });
    });

    socket.on('gameAction', (data: { gameId: string; action: string }) => {
      if (checkRateLimit(socket)) {
        io.to(data.gameId).emit('gameUpdate', {
          playerId: socket.id,
          action: data.action,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      delete rateLimits[socket.id];
    });
  });
}; 