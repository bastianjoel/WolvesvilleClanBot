export interface Role {
  id: string;
  team: string;
  aura: string;
  name: string;
  description: string;
  image: {
    url: string;
    width: number;
    height: number;
  };
}
