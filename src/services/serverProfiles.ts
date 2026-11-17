export interface ServerProfile {
  id: string;
  name: string;
  host: string;
  port: number;
  password: string;
  isDefault?: boolean;
}

const STORAGE_KEY = 'rustadmin_profiles';
const ACTIVE_PROFILE_KEY = 'rustadmin_active_profile_id';

const DEFAULT_PROFILES: ServerProfile[] = [
  {
    id: 'local-dev',
    name: 'Local Dedicated',
    host: '127.0.0.1',
    port: 28016,
    password: 'rcon.password',
    isDefault: true
  }
];

export function getSavedProfiles(): ServerProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROFILES;
  } catch {
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles: ServerProfile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function getActiveProfile(): ServerProfile {
  const profiles = getSavedProfiles();
  const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
  const found = profiles.find((p) => p.id === activeId);
  return found || profiles[0] || DEFAULT_PROFILES[0];
}

export function setActiveProfileId(id: string): void {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

export function saveProfile(profile: Omit<ServerProfile, 'id'> & { id?: string }): ServerProfile {
  const profiles = getSavedProfiles();
  const id = profile.id || `profile-${Date.now()}`;
  const newProfile: ServerProfile = { ...profile, id };
  
  const existingIdx = profiles.findIndex((p) => p.id === id);
  if (existingIdx >= 0) {
    profiles[existingIdx] = newProfile;
  } else {
    profiles.push(newProfile);
  }
  
  saveProfiles(profiles);
  return newProfile;
}

export function deleteProfile(id: string): ServerProfile[] {
  const profiles = getSavedProfiles().filter((p) => p.id !== id);
  const toSave = profiles.length > 0 ? profiles : DEFAULT_PROFILES;
  saveProfiles(toSave);
  return toSave;
}
