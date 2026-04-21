export type BookingStatus =
  | "Pending"
  | "SampleReceived"
  | "Processing"
  | "ReportReady";

export interface LabTest {
  id: string;
  name: string;
  category: string;
  mrp: number;
  partnerPrice: number;
  sampleType: string;
  tubeType: string;
  fastingRequired: boolean;
  reportTime: string;
  description: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  patientId: string;
  partnerId: string;
  patientName: string;
  age: number;
  gender: string;
  mobile: string;
  referringDoctor: string;
  testIds: string[];
  status: BookingStatus;
  bookingDate: number;
  reportUrl?: string;
  createdAt: number;
}

export interface CollectionCenter {
  id: string;
  name: string;
  contactPerson: string;
  mobile: string;
  city: string;
  address: string;
  assignedPrincipal?: string;
  status: "active" | "inactive";
  createdAt: number;
}

export interface DashboardSummary {
  totalBookings: number;
  todaysSamples: number;
  reportsPending: number;
  totalRevenue: number;
}

export interface BookPatientInput {
  patientName: string;
  age: number;
  gender: string;
  mobile: string;
  referringDoctor: string;
  testIds: string[];
}

export type UserRole = "admin" | "partner" | "guest";

export interface UserProfile {
  name: string;
}
