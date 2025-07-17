import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';

// Define the severity levels for the alert
export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// DTO for the urgent medical alert payload
export class UrgentMedicalAlertDto {

  @IsString()
  @IsNotEmpty()
  type: string; 

  @IsString()
  @IsNotEmpty()
  price: string; 

  @IsEnum(AlertSeverity)
  @IsNotEmpty()
  severity: AlertSeverity; // Severity of the alert

  @IsDateString()
  @IsNotEmpty()
  timestamp: string; // ISO 8601 string for when the alert occurred

  @IsString()
  @IsOptional()
  notes?: string; 
}