import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import AccessControl "mo:caffeineai-authorization/access-control";
import CentersLib "../lib/centers";
import Types "../types/centers";
import CommonTypes "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  centersStore : CentersLib.CentersStore,
) {
  var _centerCounter : Nat = 0;

  /// Admin only — list all collection centers
  public query ({ caller }) func getCollectionCenters() : async [Types.CollectionCenter] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view collection centers");
    };
    CentersLib.listCenters(centersStore)
  };

  /// Admin only — create a new collection center
  public shared ({ caller }) func createCollectionCenter(
    req : Types.CreateCenterRequest,
  ) : async Types.CollectionCenter {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create collection centers");
    };
    _centerCounter += 1;
    let id = "CC-" # Time.now().toText() # "-" # debug_show(_centerCounter);
    CentersLib.createCenter(centersStore, id, req)
  };

  /// Admin only — update a collection center's details
  public shared ({ caller }) func updateCollectionCenter(
    id : Text,
    req : Types.UpdateCenterRequest,
  ) : async Types.CollectionCenter {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update collection centers");
    };
    CentersLib.updateCenter(centersStore, id, req)
  };

  /// Admin only — assign a principal to a collection center (partner login)
  public shared ({ caller }) func assignCenterPrincipal(
    centerId : Text,
    partnerPrincipal : CommonTypes.UserId,
  ) : async Types.CollectionCenter {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can assign principals to centers");
    };
    CentersLib.assignPrincipal(centersStore, centerId, partnerPrincipal)
  };
};
