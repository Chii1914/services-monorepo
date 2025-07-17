import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { UrgentMedicalAlertDto } from './dto/urgentmedical.dto'; // Adjust the import path as necessary
import { EventsGateway } from '../events/events.gateway'; // <-- ADDED IMPORT



interface MessagePayload {
  message: string;
}

@Controller('meds')
export class MedsController {
  constructor(
    @Inject('redis') private client: ClientProxy,
    private readonly eventsGateway: EventsGateway
  ) { }

  @Post('publish-event')
  async publishEvent(@Body() payload: MessagePayload) {
    console.log(`Pub/Sub Service: Publishing generic event: ${payload.message}`);
    this.client.emit('generic_message_event', payload.message);
    return { status: 'Event published', message: payload.message };
  }

  @Post('send-message')
  sendMessage(@Body() payload: MessagePayload): Observable<string> {
    console.log(`Pub/Sub Service: Sending generic message: ${payload.message}`);
    return this.client.send<string>('generic_message_request', payload.message);
  }

  @Post('publish-urgent-med-alert')
  async publishUrgentMedicalAlert(@Body() alertData: UrgentMedicalAlertDto) {
    console.log(`Pub/Sub Service: Publishing urgent medical alert:`, alertData);
    this.client.emit('urgent_med_alert', alertData);
    return { status: 'Urgent medical alert published', data: alertData };
  }

  @EventPattern('urgent_med_alert')
  handleUrgentMedicalAlert(alert: UrgentMedicalAlertDto) {
    console.warn(`\n!!! Alerta de stock !!!`);
    console.log(`Tipo: ${alert.type}`);
    console.warn(`Severidad: ${alert.severity}`);
    console.warn(`Timestamp: ${alert.timestamp}`);
    if (alert.notes) {
      console.warn(`Notas: ${alert.notes}`);
    }
    this.eventsGateway.broadcastUrgentMedicalAlert(alert);

  }

  @Get()
  getHello(): string {
    return 'Health check: Pub/Sub Service ';
  }
}
