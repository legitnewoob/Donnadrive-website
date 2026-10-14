export type UserType = "PDI" | "ADI" | "SCHOOL";

export interface OnboardingForm {
  userType: UserType | "";

  fullName: string;
  email: string;
  phone: string;

  postcode: string;
  activeStudents: string;

  schoolName: string;
  instructorCount: string;
  callback: string;
}