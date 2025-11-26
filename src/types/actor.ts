export interface Actor {
    id: number,
    name: string,
    actorType: ActorType,
    description: string
}

export enum ActorType {
    EDITOR = "Editor",
    PUBLISHER = "Publisher",
    DISTRIBUTOR = "Distributor"
}