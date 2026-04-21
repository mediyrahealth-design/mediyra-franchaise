import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface CreateBookingRequest {
    age: bigint;
    referringDoctor: string;
    gender: string;
    patientName: string;
    testIds: Array<string>;
    mobile: string;
}
export interface CollectionCenter {
    id: string;
    status: CenterStatus;
    city: string;
    name: string;
    createdAt: Timestamp;
    contactPerson: string;
    address: string;
    mobile: string;
    assignedPrincipal?: UserId;
}
export interface LabTest {
    id: string;
    mrp: bigint;
    fastingRequired: boolean;
    name: string;
    description: string;
    sampleType: string;
    isActive: boolean;
    tubeType: string;
    reportTime: string;
    category: string;
    partnerPrice: bigint;
}
export interface DashboardSummary {
    todaysSamples: bigint;
    totalBookings: bigint;
    reportsPending: bigint;
    totalRevenue: bigint;
}
export interface UpdateCenterRequest {
    status: CenterStatus;
    city: string;
    name: string;
    contactPerson: string;
    address: string;
    mobile: string;
}
export type UserId = Principal;
export interface CreateCenterRequest {
    city: string;
    name: string;
    contactPerson: string;
    address: string;
    mobile: string;
}
export interface Booking {
    id: string;
    age: bigint;
    reportUrl?: string;
    status: BookingStatus;
    referringDoctor: string;
    patientId: string;
    createdAt: Timestamp;
    partnerId: UserId;
    bookingDate: Timestamp;
    gender: string;
    patientName: string;
    testIds: Array<string>;
    mobile: string;
}
export enum BookingStatus {
    SampleReceived = "SampleReceived",
    ReportReady = "ReportReady",
    Processing = "Processing",
    Pending = "Pending"
}
export enum CenterStatus {
    active = "active",
    inactive = "inactive"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignCenterPrincipal(centerId: string, partnerPrincipal: UserId): Promise<CollectionCenter>;
    createBooking(req: CreateBookingRequest): Promise<Booking>;
    createCollectionCenter(req: CreateCenterRequest): Promise<CollectionCenter>;
    createTest(name: string, category: string, mrp: bigint, partnerPrice: bigint, sampleType: string, tubeType: string, fastingRequired: boolean, reportTime: string, description: string): Promise<LabTest>;
    deleteTest(id: string): Promise<void>;
    getAllTests(): Promise<Array<LabTest>>;
    getBooking(id: string): Promise<Booking | null>;
    getBookings(): Promise<Array<Booking>>;
    getCallerUserRole(): Promise<UserRole>;
    getCollectionCenters(): Promise<Array<CollectionCenter>>;
    getDashboardSummary(): Promise<DashboardSummary>;
    getTests(): Promise<Array<LabTest>>;
    isCallerAdmin(): Promise<boolean>;
    trackSample(patientIdOrMobile: string): Promise<Booking | null>;
    updateBookingStatus(id: string, status: BookingStatus): Promise<Booking>;
    updateCollectionCenter(id: string, req: UpdateCenterRequest): Promise<CollectionCenter>;
    updateTest(id: string, name: string, category: string, mrp: bigint, partnerPrice: bigint, sampleType: string, tubeType: string, fastingRequired: boolean, reportTime: string, description: string, isActive: boolean): Promise<LabTest>;
    uploadReport(bookingId: string, reportUrl: string): Promise<Booking>;
}
