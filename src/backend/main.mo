import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import TestsLib "lib/tests";
import BookingsLib "lib/bookings";
import CentersLib "lib/centers";
import TestsApi "mixins/tests-api";
import BookingsApi "mixins/bookings-api";
import CentersApi "mixins/centers-api";
import DashboardApi "mixins/dashboard-api";

actor {
  // Authorization state — first logged-in user becomes admin automatically
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Object storage — for PDF report file references
  include MixinObjectStorage();

  // Domain state
  let testsStore = TestsLib.newStore();
  let bookingsStore = BookingsLib.newStore();
  let centersStore = CentersLib.newStore();

  // API mixins
  include TestsApi(accessControlState, testsStore);
  include BookingsApi(accessControlState, bookingsStore, testsStore);
  include CentersApi(accessControlState, centersStore);
  include DashboardApi(accessControlState, bookingsStore, testsStore);
};
