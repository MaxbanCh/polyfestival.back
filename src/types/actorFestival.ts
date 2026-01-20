export type ActorFestival = {
  id: number;
  festival_id: number;
  actor_id: number;
  contacted: boolean | null;
  last_contact_date: string | null;
  status: string | null;
  has_reservation: boolean | null;
};
