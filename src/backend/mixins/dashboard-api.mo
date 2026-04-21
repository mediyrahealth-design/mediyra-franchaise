import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import AccessControl "mo:caffeineai-authorization/access-control";
import BookingsLib "../lib/bookings";
import TestsLib "../lib/tests";
import DashboardTypes "../types/dashboard";

mixin (
  accessControlState : AccessControl.AccessControlState,
  bookingsStore : BookingsLib.BookingsStore,
  testsStore : TestsLib.TestsStore,
) {
  /// Admin only — get dashboard summary stats
  public query ({ caller }) func getDashboardSummary() : async DashboardTypes.DashboardSummary {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view the dashboard summary");
    };
    let allBookings = BookingsLib.listAllBookings(bookingsStore);

    // Start of today in nanoseconds: floor to nearest day
    let nowNs : Int = Time.now();
    let oneDayNs : Int = 86_400_000_000_000;
    let todayStart : Int = (nowNs / oneDayNs) * oneDayNs;

    let totalBookings = allBookings.size();
    let todaysSamples = BookingsLib.countTodaysSamples(bookingsStore, todayStart);
    let reportsPending = BookingsLib.countPendingReports(bookingsStore);

    // Total revenue = sum of all partner prices for completed bookings
    var totalRevenue : Nat = 0;
    for (b in allBookings.vals()) {
      totalRevenue += TestsLib.sumPartnerPrices(testsStore, b.testIds);
    };

    {
      totalBookings;
      todaysSamples;
      reportsPending;
      totalRevenue;
    }
  };
};
