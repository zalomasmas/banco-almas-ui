export interface LegacyContact {
  id: string;
  name: string;
  email: string;
}

export interface LegacySettings {
  id: string;
  contacts: LegacyContact[];
  farewellMessage?: string;
}
