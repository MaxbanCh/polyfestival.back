import {type TarifZone} from '../types/tarifZone.ts';
import { type Festival } from '../types/festival.ts';
import { getFestival } from './festival.ts';

const tarifZones: TarifZone[] = [
    {
      "id": 1,
        "name": "Standard Zone",
        "festivalId": 1,
        "nbtable": 100,
        "tableprice": 50,
        "pricem2": 10,
        "availableTables" : 80,
    },
    {
      "id": 2,
        "name": "Premium Zone",
        "festivalId": 1,
        "nbtable": 50,
        "tableprice": 100,
        "pricem2": 20,
        "availableTables" : 30,
    }
];


function displayTarifZone(tarifZone: TarifZone): string {
    return `Id : ${tarifZone.name},  TarifZone: ${tarifZone.name}, Tables: ${tarifZone.nbtable}, Festival ID: ${tarifZone.festivalId}`;
}

function getTarifZone(id : number): TarifZone | null {
    return tarifZones.find(tarifZone => tarifZone.id === id) || null;
}

function listTarifZone(): TarifZone[] {
    return tarifZones;
}

function addTarifZone(tarifZone: Omit<TarifZone, "id">): TarifZone {
    const newId = tarifZones.length > 0 ? Math.max(...tarifZones.map(f => f.id)) + 1 : 1;
    if (tarifZone.availableTables > tarifZone.nbtable) {
        tarifZone.availableTables = tarifZone.nbtable;
    }
    if (!getFestival(tarifZone.festivalId)) {
        throw new Error(`Festival with id ${tarifZone.festivalId} does not exist`);
    }
    const newTarifZone: TarifZone = { id: newId, ...tarifZone };
    tarifZones.push(newTarifZone);
    return newTarifZone;
}

function updateTarifZone(tarifZone: TarifZone): TarifZone | null {
    const index = tarifZones.findIndex(f => f.id === tarifZone.id);
    if (index !== -1) {
        tarifZones[index] = tarifZone;
        return tarifZone;
    }
    return null;
}

function deleteTarifZone(id: number): boolean {
    const index = tarifZones.findIndex(f => f.id === id);
    if (index !== -1) {
        tarifZones.splice(index, 1);
        return true;
    }
    return false;
}

export {
    displayTarifZone,
    getTarifZone,
    listTarifZone,
    addTarifZone,
    updateTarifZone,
    deleteTarifZone
};