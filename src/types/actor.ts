export interface Actor {
    id: number;
    name: string;
    actorType: string[];
    email?: string | null;
    phone?: string | null;
    description?: string | null;
}

export enum ActorType {
    EDITOR = "EDITOR",
    PUBLISHER = "PUBLISHER",
    PROVIDER = "PROVIDER",
    SHOP = "SHOP",
    ASSOCIATION = "ASSOCIATION",
    ANIMATION = "ANIMATION"
}
