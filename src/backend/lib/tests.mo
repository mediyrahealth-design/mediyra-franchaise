import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Types "../types/tests";

module {
  public type LabTest = Types.LabTest;
  public type TestsStore = Map.Map<Text, LabTest>;

  // Seed data for example lab tests loaded on first deploy
  let seedTests : [LabTest] = [
    {
      id = "TEST-CBC";
      name = "Complete Blood Count (CBC)";
      category = "Haematology";
      mrp = 250;
      partnerPrice = 180;
      sampleType = "Blood";
      tubeType = "EDTA";
      fastingRequired = false;
      reportTime = "4-6 hours";
      description = "Measures different components of blood including RBC, WBC, platelets.";
      isActive = true;
    },
    {
      id = "TEST-LFT";
      name = "Liver Function Test (LFT)";
      category = "Biochemistry";
      mrp = 600;
      partnerPrice = 420;
      sampleType = "Blood";
      tubeType = "Plain/SST";
      fastingRequired = true;
      reportTime = "6-8 hours";
      description = "Assesses liver health by measuring bilirubin, ALT, AST, ALP, and proteins.";
      isActive = true;
    },
    {
      id = "TEST-KFT";
      name = "Kidney Function Test (KFT)";
      category = "Biochemistry";
      mrp = 550;
      partnerPrice = 380;
      sampleType = "Blood";
      tubeType = "Plain/SST";
      fastingRequired = false;
      reportTime = "6-8 hours";
      description = "Evaluates kidney function via creatinine, urea, uric acid, and electrolytes.";
      isActive = true;
    },
    {
      id = "TEST-LIPID";
      name = "Lipid Profile";
      category = "Biochemistry";
      mrp = 500;
      partnerPrice = 350;
      sampleType = "Blood";
      tubeType = "Plain/SST";
      fastingRequired = true;
      reportTime = "6-8 hours";
      description = "Measures cholesterol, triglycerides, HDL, LDL, and VLDL levels.";
      isActive = true;
    },
    {
      id = "TEST-BSR";
      name = "Blood Sugar Random (BSR)";
      category = "Biochemistry";
      mrp = 80;
      partnerPrice = 55;
      sampleType = "Blood";
      tubeType = "Fluoride";
      fastingRequired = false;
      reportTime = "2-4 hours";
      description = "Measures blood glucose level at any time regardless of meals.";
      isActive = true;
    },
    {
      id = "TEST-URINE";
      name = "Urine Routine & Microscopy";
      category = "Urine Analysis";
      mrp = 120;
      partnerPrice = 80;
      sampleType = "Urine";
      tubeType = "Urine Container";
      fastingRequired = false;
      reportTime = "2-4 hours";
      description = "Routine examination of urine for colour, pH, protein, glucose, cells, and casts.";
      isActive = true;
    },
  ];

  public func newStore() : TestsStore {
    let store = Map.empty<Text, LabTest>();
    for (t in seedTests.vals()) {
      store.add(t.id, t);
    };
    store
  };

  public func createTest(
    store : TestsStore,
    id : Text,
    name : Text,
    category : Text,
    mrp : Nat,
    partnerPrice : Nat,
    sampleType : Text,
    tubeType : Text,
    fastingRequired : Bool,
    reportTime : Text,
    description : Text,
  ) : LabTest {
    let test : LabTest = {
      id;
      name;
      category;
      mrp;
      partnerPrice;
      sampleType;
      tubeType;
      fastingRequired;
      reportTime;
      description;
      isActive = true;
    };
    store.add(id, test);
    test
  };

  public func updateTest(
    store : TestsStore,
    id : Text,
    name : Text,
    category : Text,
    mrp : Nat,
    partnerPrice : Nat,
    sampleType : Text,
    tubeType : Text,
    fastingRequired : Bool,
    reportTime : Text,
    description : Text,
    isActive : Bool,
  ) : LabTest {
    let existing = switch (store.get(id)) {
      case (?t) t;
      case null Runtime.trap("Test not found: " # id);
    };
    let updated : LabTest = {
      existing with
      name;
      category;
      mrp;
      partnerPrice;
      sampleType;
      tubeType;
      fastingRequired;
      reportTime;
      description;
      isActive;
    };
    store.add(id, updated);
    updated
  };

  public func deleteTest(store : TestsStore, id : Text) : () {
    if (not store.containsKey(id)) {
      Runtime.trap("Test not found: " # id);
    };
    store.remove(id);
  };

  public func getTest(store : TestsStore, id : Text) : ?LabTest {
    store.get(id)
  };

  public func listActiveTests(store : TestsStore) : [LabTest] {
    store.values()
      |> List.fromIter<LabTest>(_)
      |> _.filter(func(t) { t.isActive })
      |> _.toArray<LabTest>()
  };

  public func listAllTests(store : TestsStore) : [LabTest] {
    store.values()
      |> List.fromIter<LabTest>(_)
      |> _.toArray<LabTest>()
  };

  public func getTestsByIds(store : TestsStore, ids : [Text]) : [LabTest] {
    let result = List.empty<LabTest>();
    for (id in ids.vals()) {
      switch (store.get(id)) {
        case (?t) result.add(t);
        case null {};
      };
    };
    result.toArray()
  };

  public func sumPartnerPrices(store : TestsStore, ids : [Text]) : Nat {
    var total : Nat = 0;
    for (id in ids.vals()) {
      switch (store.get(id)) {
        case (?t) total += t.partnerPrice;
        case null {};
      };
    };
    total
  };
};
