import { type Actor, ActorType } from '../types/actor.ts';

const actors: Actor[] = [
    {
      "id": 1,
      "name": "Polygames",
      "actorType": ActorType.EDITOR,
      "description": "UM",
    },
    {
      "id": 2,
      "name": "Repos Production",
      "actorType": ActorType.EDITOR,
      "description": "Belgium",
    },
    {
      "id": 3,
      "name": "Baraka Jeu",
      "actorType": ActorType.DISTRIBUTOR,
      "description": "Montpellier",
    },
];

function displayActor(actor : Actor): string {
    return `Id : ${actor.name},  Actor: ${actor.name}, Type: ${actor.actorType}, Description: ${actor.description}`;
}

function getActor(id : number): Actor | null {
    return actors.find(actor => actor.id === id) || null;
}

function listActor(): Actor[] {
    return actors;
}

function addActor(actor: Omit<Actor, "id">): Actor {
    const newId = actors.length > 0 ? Math.max(...actors.map(g => g.id)) + 1 : 1;
    const newActor: Actor = { id: newId, ...actor };
    actors.push(newActor);
    return newActor;
}

function updateActor(actor: Actor): Actor | null {
    const index = actors.findIndex(g => g.id === actor.id);
    if (index !== -1) {
        actors[index] = actor;
        return actor;
    }
    return null;
}

function deleteActor(id: number): boolean {
    const index = actors.findIndex(g => g.id === id);
    if (index !== -1) {
        actors.splice(index, 1);
        return true;
    }
    return false;
}

export {
    displayActor,
    getActor,
    listActor,
    addActor,
    updateActor,
    deleteActor
};