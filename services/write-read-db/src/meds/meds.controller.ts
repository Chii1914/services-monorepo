import { Controller } from '@nestjs/common';
import { MedsService } from './meds.service';

@Controller('meds')
export class MedsController {
  constructor(private readonly medsService: MedsService) {}
}
