import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UrgentMedicalAlertDto } from '../meds/dto/urgentmedical.dto'; // Import your DTO
import { Logger } from '@nestjs/common'; // Import Logger for better logging
import * as dotenv from 'dotenv';
import * as path from 'path';


dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
@WebSocketGateway(parseInt(process.env.WS_PORT || '3005', 10), {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  onModuleInit() {
    this.logger.log(` Gateway initialized. Socket.IO server should be listening on port ${process.env.WS_PORT || '3005'}`);

  }
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connectionStatus', 'Connected to Pub/Sub WebSocket server!');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('messageToServer')
  handleMessage(@MessageBody() data: string, client: Socket): string {
    this.logger.log(`Message from client ${client.id}: ${data}`);
    return `Server received: ${data}`; // Sends a response back to the specific client
  }

  broadcastUrgentMedicalAlert(alert: UrgentMedicalAlertDto) {
    this.logger.warn(`Broadcasting urgent medical alert to all clients:`, alert);
    this.server.emit('urgentMedAlert', alert);
  }
}