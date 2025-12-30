export enum TableType {
    SMALL = 'SMALL',
    LARGE = 'LARGE',
    MAIRIE = 'MAIRIE',
}

export default interface Table {
    id: number,
    festivalId: number
    type : TableType,
    quantityUsedTable : number
    quantityMaxTable : number
}
