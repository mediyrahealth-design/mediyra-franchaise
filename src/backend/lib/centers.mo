import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Types "../types/centers";
import CommonTypes "../types/common";

module {
  public type CollectionCenter = Types.CollectionCenter;
  public type CentersStore = Map.Map<Text, CollectionCenter>;

  public func newStore() : CentersStore {
    Map.empty<Text, CollectionCenter>()
  };

  public func createCenter(
    store : CentersStore,
    id : Text,
    req : Types.CreateCenterRequest,
  ) : CollectionCenter {
    let center : CollectionCenter = {
      id;
      name = req.name;
      contactPerson = req.contactPerson;
      mobile = req.mobile;
      city = req.city;
      address = req.address;
      assignedPrincipal = null;
      status = #active;
      createdAt = Time.now();
    };
    store.add(id, center);
    center
  };

  public func updateCenter(
    store : CentersStore,
    id : Text,
    req : Types.UpdateCenterRequest,
  ) : CollectionCenter {
    let existing = switch (store.get(id)) {
      case (?c) c;
      case null Runtime.trap("Collection center not found: " # id);
    };
    let updated : CollectionCenter = {
      existing with
      name = req.name;
      contactPerson = req.contactPerson;
      mobile = req.mobile;
      city = req.city;
      address = req.address;
      status = req.status;
    };
    store.add(id, updated);
    updated
  };

  public func getCenter(store : CentersStore, id : Text) : ?CollectionCenter {
    store.get(id)
  };

  public func listCenters(store : CentersStore) : [CollectionCenter] {
    store.values()
      |> List.fromIter<CollectionCenter>(_)
      |> _.toArray<CollectionCenter>()
  };

  public func assignPrincipal(
    store : CentersStore,
    centerId : Text,
    principal : CommonTypes.UserId,
  ) : CollectionCenter {
    let existing = switch (store.get(centerId)) {
      case (?c) c;
      case null Runtime.trap("Collection center not found: " # centerId);
    };
    let updated : CollectionCenter = { existing with assignedPrincipal = ?principal };
    store.add(centerId, updated);
    updated
  };

  public func findByPrincipal(
    store : CentersStore,
    principal : CommonTypes.UserId,
  ) : ?CollectionCenter {
    store.values()
      |> List.fromIter<CollectionCenter>(_)
      |> _.find<CollectionCenter>(func(c) {
        switch (c.assignedPrincipal) {
          case (?p) Principal.equal(p, principal);
          case null false;
        }
      })
  };
};
