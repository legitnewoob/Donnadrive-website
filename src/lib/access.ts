// Who the signed-in person is to Donna Drive (staff role), remembered so the
// website header and redirects don't have to wait for the API. Display only;
// the server checks every admin request itself.

export interface Access {
  staffRole: "admin" | "support" | null;
  superAdmin: boolean;
  /** Signed in but hasn't picked a plan yet */
  needsPlan: boolean;
  /** Owns a driving school: gets the school home instead of an instructor's dashboard */
  schoolOwner?: boolean;
}

const KEY = "dd_access";

export function getAccess(): Access | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Access) : null;
  } catch {
    return null;
  }
}

export function setAccess(access: Partial<Access> | null | undefined) {
  if (!access) return;
  // Callers that don't know about the school keep what we already had
  const schoolOwner = access.schoolOwner ?? getAccess()?.schoolOwner ?? false;
  const next = JSON.stringify({ staffRole: access.staffRole ?? null, superAdmin: !!access.superAdmin, needsPlan: !!access.needsPlan, schoolOwner });
  if (localStorage.getItem(KEY) === next) return;
  localStorage.setItem(KEY, next);
  window.dispatchEvent(new Event("dd_auth_change"));
}

// Instructor-only pages; a super admin opening one goes to the admin panel
const INSTRUCTOR_PAGES = ["/dashboard", "/school", "/learners", "/lesson-types", "/settings", "/team", "/account"];
// An instructor's own Donna pages, which a school owner (who doesn't run Donna) doesn't use
const OWN_DONNA_PAGES = ["/dashboard", "/learners", "/lesson-types", "/settings"];

export function isInstructorPage(pathname: string, search: string) {
  if (!INSTRUCTOR_PAGES.includes(pathname)) return false;
  // An instructor's learners opened from the admin panel stay viewable
  return !(pathname === "/learners" && new URLSearchParams(search).has("instructor"));
}

/** Super admins run Donna Drive; they go to the admin panel, not the instructor dashboard. */
export const isSuperAdmin = () => !!getAccess()?.superAdmin;
export const isStaff = () => !!getAccess()?.staffRole;
export const needsPlan = () => !!getAccess()?.needsPlan;
export const isSchoolOwner = () => !!getAccess()?.schoolOwner;

/**
 * Where someone on the wrong home belongs: school owners use the school home,
 * everyone else their own dashboard. Owners can still open an instructor's
 * learners from the Team page (?instructor=).
 */
export function homeRedirect(pathname: string, search: string): string | null {
  if (isSchoolOwner()) {
    if (!OWN_DONNA_PAGES.includes(pathname)) return null;
    if (pathname === "/learners" && new URLSearchParams(search).has("instructor")) return null;
    return "/school";
  }
  return pathname === "/school" ? "/dashboard" : null;
}

/** After picking the free plan: let them into the dashboard without waiting for a refresh */
export function markPlanChosen() {
  const a = getAccess();
  setAccess({ staffRole: a?.staffRole ?? null, superAdmin: !!a?.superAdmin, needsPlan: false });
}

/** Where to send someone after they sign in */
export const homePath = () => (isSuperAdmin() ? "/admin" : isSchoolOwner() ? "/school" : "/dashboard");

export function signOut() {
  localStorage.removeItem("dd_token");
  localStorage.removeItem("dd_apiKey");
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("dd_auth_change"));
}
