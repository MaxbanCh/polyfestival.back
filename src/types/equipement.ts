export enum EquipmentType {
  CHAIR = 'CHAIR',
  ELECTRIC_OUTLET = 'ELECTRIC_OUTLET',
}

export interface Equipment {
  id: number;
  festivalId: number;
  kind: EquipmentType | string;
  unitPrice: number;
  quantity: number;
}
