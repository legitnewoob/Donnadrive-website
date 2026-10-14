// Who the signed-in person is to Donna Drive (staff role), remembered so the
// website header and redirects don't have to wait for the API. Display only;
// the server checks every admin request itself.

export interface Access {
  staffRole: "admin" | "support" | null;
  superAdmin: boolean;
  /** Signed in but hasn't picked a plan yet */
  needsPlan: boolean;
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
  const next = JSON.stringify({ staffRole: access.staffRole ?? null, superAdmin: !!access.superAdmin, needsPlan: !!access.needsPlan });
  if (localStorage.getItem(KEY) === next) return;
  localStorage.setItem(KEY, next);
  window.dispatchEvent(new Event("dd_auth_change"));
}

// Instructor-only pages; a super admin opening one goes to the admin panel
const INSTRUCTOR_PAGES = ["/get-onboard", "/learners", "/lesson-types", "/settings", "/team", "/account"];

export function isInstructorPage(pathname: string, search: string) {
  if (!INSTRUCTOR_PAGES.includes(pathname)) return false;
  // An instructor's learners opened from the admin panel stay viewable
  return !(pathname === "/learners" && new URLSearchParams(search).has("instructor"));
}

/** Super admins run Donna Drive; they go to the admin panel, not the instructor dashboard. */
export const isSuperAdmin = () => !!getAccess()?.superAdmin;
export const isStaff = () => !!getAccess()?.staffRole;
export const needsPlan = () => !!getAccess()?.needsPlan;

/** After picking the free plan: let them into the dashboard without waiting for a refresh */
export function markPlanChosen() {
  const a = getAccess();
  setAccess({ staffRole: a?.staffRole ?? null, superAdmin: !!a?.superAdmin, needsPlan: false });
}

/** Where to send someone after they sign in */
export const homePath = () => (isSuperAdmin() ? "/admin" : "/get-onboard");

export function signOut() {
  localStorage.removeItem("dd_token");
  localStorage.removeItem("dd_apiKey");
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("dd_auth_change"));
}
