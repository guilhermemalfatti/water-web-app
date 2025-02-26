export interface PlantWateringStatus {
  lastWatered: string | null;
  isWatering: boolean;
}

export interface ConnectionStatus {
  iotConnected: boolean;
  raspberryPiConnected: boolean;
  lastPiHeartbeat: string | null;
}