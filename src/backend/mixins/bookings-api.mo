import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import EmailClient "mo:caffeineai-email/emailClient";
import BookingsLib "../lib/bookings";
import TestsLib "../lib/tests";
import Types "../types/bookings";

mixin (
  accessControlState : AccessControl.AccessControlState,
  bookingsStore : BookingsLib.BookingsStore,
  testsStore : TestsLib.TestsStore,
) {
  /// Partner + admin — create a new patient booking
  public shared ({ caller }) func createBooking(
    req : Types.CreateBookingRequest,
  ) : async Types.Booking {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Login required to create bookings");
    };
    BookingsLib.createBooking(bookingsStore, caller, req)
  };

  /// Admin — list all bookings; partner — list own bookings only
  public query ({ caller }) func getBookings() : async [Types.Booking] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Login required");
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      BookingsLib.listAllBookings(bookingsStore)
    } else {
      BookingsLib.listPartnerBookings(bookingsStore, caller)
    }
  };

  /// Partner + admin — get a single booking by id
  public query ({ caller }) func getBooking(id : Text) : async ?Types.Booking {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Login required");
    };
    let booking = BookingsLib.getBooking(bookingsStore, id);
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      // Partners can only view their own bookings
      switch (booking) {
        case (?b) {
          if (not (b.partnerId == caller)) {
            Runtime.trap("Unauthorized: Cannot view another partner's booking");
          };
          ?b
        };
        case null null;
      }
    } else {
      booking
    }
  };

  /// Partner + admin — track sample status by patient ID or mobile number
  public query ({ caller }) func trackSample(patientIdOrMobile : Text) : async ?Types.Booking {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Login required");
    };
    BookingsLib.trackSample(bookingsStore, patientIdOrMobile)
  };

  /// Admin only — update booking status
  public shared ({ caller }) func updateBookingStatus(
    id : Text,
    status : Types.BookingStatus,
  ) : async Types.Booking {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update booking status");
    };
    let updated = BookingsLib.updateStatus(bookingsStore, id, status);
    // Fire-and-forget email notification — don't block on result
    ignore (async {
      let statusText = switch (status) {
        case (#Pending) "Pending";
        case (#SampleReceived) "Sample Received";
        case (#Processing) "Processing";
        case (#ReportReady) "Report Ready";
      };
      let _ = await EmailClient.sendServiceEmail(
        "no-reply",
        ["notifications@mediyralab.com"],
        "Booking status updated: " # updated.patientId,
        "<p>Booking <strong>" # updated.patientId # "</strong> for patient <strong>" # updated.patientName # "</strong> has been updated to: <strong>" # statusText # "</strong>.</p>",
      );
    });
    updated
  };

  /// Admin only — upload/attach PDF report URL to a booking
  public shared ({ caller }) func uploadReport(
    bookingId : Text,
    reportUrl : Text,
  ) : async Types.Booking {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can upload reports");
    };
    let updated = BookingsLib.setReportUrl(bookingsStore, bookingId, reportUrl);
    // Fire-and-forget email notification — don't block on result
    ignore (async {
      let _ = await EmailClient.sendServiceEmail(
        "no-reply",
        ["notifications@mediyralab.com"],
        "Report ready: " # updated.patientId,
        "<p>The report for patient <strong>" # updated.patientName # "</strong> (ID: <strong>" # updated.patientId # "</strong>) is now ready.</p>",
      );
    });
    updated
  };
};
