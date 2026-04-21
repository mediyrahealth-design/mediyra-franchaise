import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Types "../types/bookings";
import CommonTypes "../types/common";

module {
  public type Booking = Types.Booking;
  public type BookingStatus = Types.BookingStatus;
  public type BookingsStore = Map.Map<Text, Booking>;

  // One day in nanoseconds
  let ONE_DAY_NS : Int = 86_400_000_000_000;

  public func newStore() : BookingsStore {
    Map.empty<Text, Booking>()
  };

  public func generatePatientId(timestamp : Int) : Text {
    "MED" # timestamp.toText()
  };

  public func createBooking(
    store : BookingsStore,
    partnerId : CommonTypes.UserId,
    req : Types.CreateBookingRequest,
  ) : Booking {
    let now = Time.now();
    let patientId = generatePatientId(now);
    let id = patientId;
    let booking : Booking = {
      id;
      patientId;
      partnerId;
      patientName = req.patientName;
      age = req.age;
      gender = req.gender;
      mobile = req.mobile;
      referringDoctor = req.referringDoctor;
      testIds = req.testIds;
      status = #Pending;
      bookingDate = now;
      reportUrl = null;
      createdAt = now;
    };
    store.add(id, booking);
    booking
  };

  public func getBooking(store : BookingsStore, id : Text) : ?Booking {
    store.get(id)
  };

  public func listAllBookings(store : BookingsStore) : [Booking] {
    store.values()
      |> List.fromIter<Booking>(_)
      |> _.toArray<Booking>()
  };

  public func listPartnerBookings(store : BookingsStore, partnerId : CommonTypes.UserId) : [Booking] {
    store.values()
      |> List.fromIter<Booking>(_)
      |> _.filter(func(b) { Principal.equal(b.partnerId, partnerId) })
      |> _.toArray<Booking>()
  };

  public func updateStatus(store : BookingsStore, id : Text, status : BookingStatus) : Booking {
    let existing = switch (store.get(id)) {
      case (?b) b;
      case null Runtime.trap("Booking not found: " # id);
    };
    let updated : Booking = { existing with status };
    store.add(id, updated);
    updated
  };

  public func setReportUrl(store : BookingsStore, id : Text, url : Text) : Booking {
    let existing = switch (store.get(id)) {
      case (?b) b;
      case null Runtime.trap("Booking not found: " # id);
    };
    let updated : Booking = { existing with reportUrl = ?url; status = #ReportReady };
    store.add(id, updated);
    updated
  };

  public func trackSample(store : BookingsStore, patientIdOrMobile : Text) : ?Booking {
    store.values()
      |> List.fromIter<Booking>(_)
      |> _.find<Booking>(func(b) {
        b.patientId == patientIdOrMobile or b.mobile == patientIdOrMobile
      })
  };

  public func countTodaysSamples(store : BookingsStore, today : Int) : Nat {
    // today is start-of-day timestamp in nanoseconds
    let endOfDay = today + ONE_DAY_NS;
    var count : Nat = 0;
    for ((_, b) in store.entries()) {
      if (b.createdAt >= today and b.createdAt < endOfDay) {
        count += 1;
      };
    };
    count
  };

  public func countPendingReports(store : BookingsStore) : Nat {
    var count : Nat = 0;
    for ((_, b) in store.entries()) {
      switch (b.status) {
        case (#ReportReady) {};
        case _ count += 1;
      };
    };
    count
  };
};
