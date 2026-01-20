export enum TableType {
  SMALL = 'SMALL',
  LARGE = 'LARGE',
  MAIRIE = 'MAIRIE',
}

export default interface Table {
  id: number;
  festivalId: number;
  type: TableType;
  quantity: number;
}

export const TABLE_AREA_M2 = 4;

export const TABLE_CHAIRS: Record<string, number> = {
  SMALL: 4,
  LARGE: 4,
  MAIRIE: 6,
};

export function chairsForType(type: string): number | null {
  return TABLE_CHAIRS[type] ?? null;
}
