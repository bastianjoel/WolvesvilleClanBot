export interface RoleRotations {
  gameMode: string;
  languages: string[];
  roleRotations: {
    roleRotation: RoleRotation;
    probability: number;
  }[];
}

export interface RoleRotation {
  id: string;
  roles: {
    probability: number;
    role?: string;
    roles?: string;
  }[][];
}
