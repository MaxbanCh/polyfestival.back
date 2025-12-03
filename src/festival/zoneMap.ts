import { type MapZone } from '../types/mapZone.ts';
import { getFestival } from './festival.ts';

const mapZones: MapZone[] = [
    {
      "id": 1,
      "name": "Zone 1",
      "nbtable": 150,
      "festivalId": 1,
      "tariffzoneid": 1,
      "description": "Hall d'entrée",
    },
    {
      "id": 2,
      "name": "Zone 2",
      "nbtable": 50,
      "festivalId": 1,
      "tariffzoneid": 1,
      "description": "Fond de la salle",
    }
];

function displayMapZone(mapZone: MapZone): string {
    return `Id : ${mapZone.name},  MapZone: ${mapZone.name}, Description: ${mapZone.description}, Tables: ${mapZone.nbtable}, Tariff Zone ID: ${mapZone.tariffzoneid}, Festival ID: ${mapZone.festivalId}`;
}

function getMapZone(id : number): MapZone | null {
    return mapZones.find(mapZone => mapZone.id === id) || null;
}

function listMapZone(): MapZone[] {
    return mapZones;
}

function addMapZone(mapZone: Omit<MapZone, "id">): MapZone {
    const newId = mapZones.length > 0 ? Math.max(...mapZones.map(f => f.id)) + 1 : 1;
    if (!getFestival(mapZone.festivalId)) {
        throw new Error(`Festival with id ${mapZone.festivalId} does not exist`);
    }
    const newMapZone: MapZone = { id: newId, ...mapZone };
    mapZones.push(newMapZone);
    return newMapZone;
}

function updateMapZone(mapZone: MapZone): MapZone | null {
    const index = mapZones.findIndex(f => f.id === mapZone.id);
    if (index !== -1) {
        mapZones[index] = mapZone;
        return mapZone;
    }
    return null;
}

function deleteMapZone(id: number): boolean {
    const index = mapZones.findIndex(f => f.id === id);
    if (index !== -1) {
        mapZones.splice(index, 1);
        return true;
    }
    return false;
}

export {
    displayMapZone,
    getMapZone,
    listMapZone,
    addMapZone,
    updateMapZone,
    deleteMapZone
};