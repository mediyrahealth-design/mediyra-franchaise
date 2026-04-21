import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { backendInterface } from "../backend";
import { createActor } from "../backend";
import type {
  BookPatientInput,
  Booking,
  BookingStatus,
  CollectionCenter,
  DashboardSummary,
  LabTest,
  UserProfile,
} from "../types";

// ---------------------------------------------------------------------------
// Helpers — convert bigint fields to number for frontend types
// ---------------------------------------------------------------------------

function toLabTest(
  raw: Awaited<ReturnType<backendInterface["getAllTests"]>>[number],
): LabTest {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    mrp: Number(raw.mrp),
    partnerPrice: Number(raw.partnerPrice),
    sampleType: raw.sampleType,
    tubeType: raw.tubeType,
    fastingRequired: raw.fastingRequired,
    reportTime: raw.reportTime,
    description: raw.description,
    isActive: raw.isActive,
  };
}

function toBooking(
  raw: Awaited<ReturnType<backendInterface["getBookings"]>>[number],
): Booking {
  return {
    id: raw.id,
    patientId: raw.patientId,
    partnerId: raw.partnerId.toString(),
    patientName: raw.patientName,
    age: Number(raw.age),
    gender: raw.gender,
    mobile: raw.mobile,
    referringDoctor: raw.referringDoctor,
    testIds: raw.testIds,
    status: raw.status as BookingStatus,
    bookingDate: Number(raw.bookingDate),
    reportUrl: raw.reportUrl,
    createdAt: Number(raw.createdAt),
  };
}

function toDashboard(
  raw: Awaited<ReturnType<backendInterface["getDashboardSummary"]>>,
): DashboardSummary {
  return {
    totalBookings: Number(raw.totalBookings),
    todaysSamples: Number(raw.todaysSamples),
    reportsPending: Number(raw.reportsPending),
    totalRevenue: Number(raw.totalRevenue),
  };
}

function toCollectionCenter(
  raw: Awaited<ReturnType<backendInterface["getCollectionCenters"]>>[number],
): CollectionCenter {
  return {
    id: raw.id,
    name: raw.name,
    contactPerson: raw.contactPerson,
    mobile: raw.mobile,
    city: raw.city,
    address: raw.address,
    assignedPrincipal: raw.assignedPrincipal?.toString(),
    status: raw.status as "active" | "inactive",
    createdAt: Number(raw.createdAt),
  };
}

// ---------------------------------------------------------------------------
// Auth / Profile
// ---------------------------------------------------------------------------

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor(createActor);

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!actor) throw new Error("Actor not available");
      return null;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation<void, Error, UserProfile>({
    mutationFn: async (_profile) => {
      if (!actor) throw new Error("Actor not available");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

export function useGetCallerRole() {
  const { actor, isFetching: actorFetching } = useActor(createActor);

  return useQuery<string>({
    queryKey: ["callerRole"],
    queryFn: async (): Promise<string> => {
      if (!actor) throw new Error("Actor not available");
      const role = await actor.getCallerUserRole();
      if (typeof role === "object" && role !== null) {
        const key = Object.keys(role as object)[0];
        return key ?? "guest";
      }
      return String(role ?? "guest");
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export function useAdminDashboard() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<DashboardSummary>({
    queryKey: ["adminDashboard"],
    queryFn: async (): Promise<DashboardSummary> => {
      if (!actor) throw new Error("Actor not available");
      const raw = await actor.getDashboardSummary();
      return toDashboard(raw);
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePartnerDashboard() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<DashboardSummary>({
    queryKey: ["partnerDashboard"],
    queryFn: async (): Promise<DashboardSummary> => {
      if (!actor) throw new Error("Actor not available");
      const raw = await actor.getDashboardSummary();
      return toDashboard(raw);
    },
    enabled: !!actor && !isFetching,
  });
}

// ---------------------------------------------------------------------------
// Lab Tests
// ---------------------------------------------------------------------------

export function useLabTests() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<LabTest[]>({
    queryKey: ["labTests"],
    queryFn: async (): Promise<LabTest[]> => {
      if (!actor) return MOCK_TESTS;
      const raw = await actor.getAllTests();
      return raw.map(toLabTest);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateLabTest() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation<void, Error, Omit<LabTest, "id">>({
    mutationFn: async (test) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createTest(
        test.name,
        test.category,
        BigInt(test.mrp),
        BigInt(test.partnerPrice),
        test.sampleType,
        test.tubeType,
        test.fastingRequired,
        test.reportTime,
        test.description,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["labTests"] }),
  });
}

export function useUpdateLabTest() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation<void, Error, LabTest>({
    mutationFn: async (test) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateTest(
        test.id,
        test.name,
        test.category,
        BigInt(test.mrp),
        BigInt(test.partnerPrice),
        test.sampleType,
        test.tubeType,
        test.fastingRequired,
        test.reportTime,
        test.description,
        test.isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["labTests"] }),
  });
}

export function useDeleteLabTest() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteTest(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["labTests"] }),
  });
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export function useAllBookings() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Booking[]>({
    queryKey: ["allBookings"],
    queryFn: async (): Promise<Booking[]> => {
      if (!actor) return [];
      const raw = await actor.getBookings();
      return raw.map(toBooking);
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePartnerBookings() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Booking[]>({
    queryKey: ["partnerBookings"],
    queryFn: async (): Promise<Booking[]> => {
      if (!actor) return [];
      const raw = await actor.getBookings();
      return raw.map(toBooking);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBookPatient() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation<string, Error, BookPatientInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Actor not available");
      const booking = await actor.createBooking({
        patientName: input.patientName,
        age: BigInt(input.age),
        gender: input.gender,
        mobile: input.mobile,
        referringDoctor: input.referringDoctor,
        testIds: input.testIds,
      });
      return booking.patientId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partnerBookings"] });
      qc.invalidateQueries({ queryKey: ["allBookings"] });
    },
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation<void, Error, { bookingId: string; status: BookingStatus }>(
    {
      mutationFn: async ({ bookingId, status }) => {
        if (!actor) throw new Error("Actor not available");
        // Import backend BookingStatus enum for the call
        const { BookingStatus: BackendStatus } = await import("../backend");
        await actor.updateBookingStatus(
          bookingId,
          BackendStatus[status as keyof typeof BackendStatus],
        );
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["allBookings"] });
        qc.invalidateQueries({ queryKey: ["partnerBookings"] });
      },
    },
  );
}

export function useTrackBooking(patientId: string) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Booking | null>({
    queryKey: ["trackBooking", patientId],
    queryFn: async (): Promise<Booking | null> => {
      if (!actor || !patientId) return null;
      const result = await actor.trackSample(patientId);
      if (!result) return null;
      return toBooking(result);
    },
    enabled: !!actor && !isFetching && !!patientId,
  });
}

// ---------------------------------------------------------------------------
// Collection Centers
// ---------------------------------------------------------------------------

export function useCollectionCenters() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<CollectionCenter[]>({
    queryKey: ["collectionCenters"],
    queryFn: async (): Promise<CollectionCenter[]> => {
      if (!actor) return [];
      const raw = await actor.getCollectionCenters();
      return raw.map(toCollectionCenter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCollectionCenter() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation<void, Error, Omit<CollectionCenter, "id" | "createdAt">>({
    mutationFn: async (center) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createCollectionCenter({
        name: center.name,
        contactPerson: center.contactPerson,
        mobile: center.mobile,
        city: center.city,
        address: center.address,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collectionCenters"] }),
  });
}

export function useUpdateCollectionCenter() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation<void, Error, CollectionCenter>({
    mutationFn: async (center) => {
      if (!actor) throw new Error("Actor not available");
      const { CenterStatus } = await import("../backend");
      await actor.updateCollectionCenter(center.id, {
        name: center.name,
        contactPerson: center.contactPerson,
        mobile: center.mobile,
        city: center.city,
        address: center.address,
        status: CenterStatus[center.status as keyof typeof CenterStatus],
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collectionCenters"] }),
  });
}

// ---------------------------------------------------------------------------
// Mock data (used until actor is ready on first load)
// ---------------------------------------------------------------------------

const MOCK_TESTS: LabTest[] = [
  {
    id: "t1",
    name: "Complete Blood Count (CBC)",
    category: "Haematology",
    mrp: 350,
    partnerPrice: 200,
    sampleType: "Blood",
    tubeType: "EDTA",
    fastingRequired: false,
    reportTime: "4 Hours",
    description:
      "Full blood cell analysis including RBC, WBC, and platelet count.",
    isActive: true,
  },
  {
    id: "t2",
    name: "Liver Function Test (LFT)",
    category: "Biochemistry",
    mrp: 700,
    partnerPrice: 450,
    sampleType: "Blood",
    tubeType: "SST",
    fastingRequired: true,
    reportTime: "6 Hours",
    description: "Panel assessing liver enzymes, proteins, and bilirubin.",
    isActive: true,
  },
  {
    id: "t3",
    name: "Kidney Function Test (KFT)",
    category: "Biochemistry",
    mrp: 600,
    partnerPrice: 380,
    sampleType: "Blood",
    tubeType: "SST",
    fastingRequired: false,
    reportTime: "6 Hours",
    description: "Tests creatinine, urea, and electrolytes for renal function.",
    isActive: true,
  },
  {
    id: "t4",
    name: "Lipid Profile",
    category: "Biochemistry",
    mrp: 550,
    partnerPrice: 340,
    sampleType: "Blood",
    tubeType: "SST",
    fastingRequired: true,
    reportTime: "6 Hours",
    description: "Measures cholesterol, triglycerides, HDL, and LDL levels.",
    isActive: true,
  },
  {
    id: "t5",
    name: "Blood Sugar Random (BSR)",
    category: "Biochemistry",
    mrp: 120,
    partnerPrice: 70,
    sampleType: "Blood",
    tubeType: "Fluoride",
    fastingRequired: false,
    reportTime: "1 Hour",
    description: "Random blood glucose level measurement.",
    isActive: true,
  },
  {
    id: "t6",
    name: "Urine Routine & Microscopy",
    category: "Urinalysis",
    mrp: 200,
    partnerPrice: 120,
    sampleType: "Urine",
    tubeType: "Urine Cup",
    fastingRequired: false,
    reportTime: "2 Hours",
    description: "Physical, chemical, and microscopic urine examination.",
    isActive: true,
  },
];
