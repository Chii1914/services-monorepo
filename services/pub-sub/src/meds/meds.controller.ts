import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { Observable } from 'rxjs';


interface MessagePayload {
  message: string;
}

@Controller('meds')
export class MedsController {
  constructor(
    @Inject('redis') private client: ClientProxy
  ) { }
  
  @Post('publish-event')
  async publishEvent(@Body() payload: MessagePayload) {
    console.log(`Pub/Sub Service: Publishing event: ${payload.message}`);
    this.client.emit('message_event', payload.message); // 'emit' for Pub/Sub
    return { status: 'Event published', message: payload.message };
  }

  @Post('send-message')
  sendMessage(@Body() payload: MessagePayload): Observable<string> {
    console.log(`Pub/Sub Service: Sending message: ${payload.message}`);
    return this.client.send<string>('message_request', payload.message); // 'send' for Request-Response
  }

  @EventPattern('message_event')
  handleMessageEvent(data: string) {
    console.log(`Pub/Sub Service: Received event: ${data}`);
    // You can add your business logic here to process the event
  }
 // Simple HTTP endpoint for health check
  @Get()
  getHello(): string {
    return 'Health check: Pub/Sub Service ';
  }
}
