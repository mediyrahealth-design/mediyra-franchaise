import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import TestsLib "../lib/tests";
import Types "../types/tests";

mixin (
  accessControlState : AccessControl.AccessControlState,
  testsStore : TestsLib.TestsStore,
) {
  var _testCounter : Nat = 0;

  /// Admin only — create a new lab test
  public shared ({ caller }) func createTest(
    name : Text,
    category : Text,
    mrp : Nat,
    partnerPrice : Nat,
    sampleType : Text,
    tubeType : Text,
    fastingRequired : Bool,
    reportTime : Text,
    description : Text,
  ) : async Types.LabTest {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create tests");
    };
    _testCounter += 1;
    let id = "TEST-" # Time.now().toText() # "-" # debug_show(_testCounter);
    TestsLib.createTest(testsStore, id, name, category, mrp, partnerPrice, sampleType, tubeType, fastingRequired, reportTime, description)
  };

  /// Admin only — update an existing lab test
  public shared ({ caller }) func updateTest(
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
  ) : async Types.LabTest {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update tests");
    };
    TestsLib.updateTest(testsStore, id, name, category, mrp, partnerPrice, sampleType, tubeType, fastingRequired, reportTime, description, isActive)
  };

  /// Admin only — delete a lab test
  public shared ({ caller }) func deleteTest(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete tests");
    };
    TestsLib.deleteTest(testsStore, id)
  };

  /// Partner + admin — list all active tests (partner price visible)
  public query ({ caller }) func getTests() : async [Types.LabTest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Login required");
    };
    TestsLib.listActiveTests(testsStore)
  };

  /// Admin only — list all tests including inactive
  public query ({ caller }) func getAllTests() : async [Types.LabTest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all tests");
    };
    TestsLib.listAllTests(testsStore)
  };
};
