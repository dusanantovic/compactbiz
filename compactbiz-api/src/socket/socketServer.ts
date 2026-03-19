import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { decode as jwtDecode } from "jsonwebtoken";
import { Company, User } from "../../models";
import { IdTokenData } from "../../models/interfaces";
import { DBConnection } from "../../dbConnection";
import { CompanyRepository, RepositoryProvider, UserRepository } from "../repositories";

let io: SocketServer;

export const initSocketServer = (httpServer: HttpServer): SocketServer => {
    io = new SocketServer(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.use(socketAuthMiddleware);
    io.on("connection", onConnection);

    return io;
};

export const getIo = (): SocketServer => {
    if (!io) {
        throw new Error("Socket.IO server not initialized");
    }
    return io;
};

const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void): Promise<void> => {
    try {
        const token = socket.handshake.auth.token as string;
        const facilityId = parseInt(socket.handshake.auth.facilityId);

        if (!token) {
            return next(new Error("Missing token"));
        }

        User.verifyIdToken(token);

        const idTokenData = jwtDecode(token) as unknown as IdTokenData;
        if (!idTokenData.userId || !idTokenData.email) {
            return next(new Error("Invalid token payload"));
        }

        const connection = DBConnection.getConnection();
        const repositoryProvider = new RepositoryProvider(connection.manager);
        const userRepo = repositoryProvider.getCustomRepository(User, UserRepository);
        const companyRepo = repositoryProvider.getCustomRepository(Company, CompanyRepository);

        const user = await userRepo.findOne({
            where: { id: idTokenData.userId, verified: true },
            relations: ["facilities"]
        });

        if (!user || !user.employeedById) {
            return next(new Error("User not found"));
        }

        const company = await companyRepo.getById(user.employeedById, ["facilities"]);
        if (!company) {
            return next(new Error("Company not found"));
        }

        if (facilityId) {
            const hasAccess = user.facilities?.some(f => f.id === facilityId && f.companyId === company.id);
            if (!hasAccess) {
                return next(new Error("No access to this facility"));
            }
        }

        (socket as any).userId = user.id;
        (socket as any).companyId = company.id;
        (socket as any).facilityId = facilityId;
        (socket as any).role = user.role;

        next();
    } catch (err: any) {
        next(new Error(err.message || "Authentication failed"));
    }
};

const onConnection = (socket: Socket): void => {
    const companyId = (socket as any).companyId as number;
    const facilityId = (socket as any).facilityId as number;

    if (companyId && facilityId) {
        const room = `facility:${companyId}:${facilityId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
    }
};
