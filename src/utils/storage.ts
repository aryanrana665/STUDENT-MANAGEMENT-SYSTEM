import { INITIAL_STATE } from "../data/seedData";
import type { DemoUser, EduTrackState } from "../types";

const STATE_KEY = "edutrack_state_v2";
const USER_KEY = "edutrack_demo_user_v1";

export function loadEduTrackState(): EduTrackState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) {
      localStorage.setItem(STATE_KEY, JSON.stringify(INITIAL_STATE));
      return INITIAL_STATE;
    }
    const parsed = JSON.parse(raw) as Partial<EduTrackState>;
    if (
      !Array.isArray(parsed.students) ||
      !Array.isArray(parsed.attendance) ||
      !Array.isArray(parsed.assignments) ||
      !Array.isArray(parsed.marks) ||
      !Array.isArray(parsed.activities)
    ) {
      return INITIAL_STATE;
    }
    return parsed as EduTrackState;
  } catch {
    return INITIAL_STATE;
  }
}

export function saveEduTrackState(state: EduTrackState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function resetEduTrackState(): EduTrackState {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(INITIAL_STATE));
  } catch {
    // Ignore
  }
  return INITIAL_STATE;
}

export function loadSavedUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as DemoUser) : null;
  } catch {
    return null;
  }
}

export function saveDemoUser(user: DemoUser | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // Ignore
  }
}
