import { type Festival } from '../types/festival.ts';

const festivals: Festival[] = [
    {
      "id": 1,
      "name": "PolyFestival 2025",
      "nbtable": 150,
      "creationDate": new Date("2025-06-15"),
      "description": "Annual board game and tabletop gaming festival",
      "startDate": new Date("2025-11-22"),
      "endDate": new Date("2025-11-24")
    },
    {
      "id": 2,
      "name": "PolyFestival 2026",
      "nbtable": 200,
      "creationDate": new Date("2026-03-10"),
      "description": "Annual board game and tabletop gaming festival",
      "startDate": new Date("2026-07-15"),
      "endDate": new Date("2026-07-17")
    }
];

function displayFestival(festival: Festival): string {
    return `Id : ${festival.name},  Festival: ${festival.name}, Dates: ${festival.startDate.toDateString()} - ${festival.endDate.toDateString()}`;
}

function getFestival(id : number): Festival | null {
    return festivals.find(festival => festival.id === id) || null;
}

function listFestivals(): Festival[] {
    return festivals;
}

function addFestival(festival: Omit<Festival, "id">): Festival {
    const newId = festivals.length > 0 ? Math.max(...festivals.map(f => f.id)) + 1 : 1;
    const newFestival: Festival = { id: newId, ...festival };
    festivals.push(newFestival);
    return newFestival;
}

function updateFestival(festival: Festival): Festival | null {
    const index = festivals.findIndex(f => f.id === festival.id);
    if (index !== -1) {
        festivals[index] = festival;
        return festival;
    }
    return null;
}

function deleteFestival(id: number): boolean {
    const index = festivals.findIndex(f => f.id === id);
    if (index !== -1) {
        festivals.splice(index, 1);
        return true;
    }
    return false;
}

export {
    displayFestival,
    getFestival,
    listFestivals,
    addFestival,
    updateFestival,
    deleteFestival
};