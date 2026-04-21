import Common "common";

module {
  public type BookingStatus = {
    #Pending;
    #SampleReceived;
    #Processing;
    #ReportReady;
  };

  public type Booking = {
    id : Text;
    patientId : Text;
    partnerId : Common.UserId;
    patientName : Text;
    age : Nat;
    gender : Text;
    mobile : Text;
    referringDoctor : Text;
    testIds : [Text];
    status : BookingStatus;
    bookingDate : Common.Timestamp;
    reportUrl : ?Text;
    createdAt : Common.Timestamp;
  };

  public type CreateBookingRequest = {
    patientName : Text;
    age : Nat;
    gender : Text;
    mobile : Text;
    referringDoctor : Text;
    testIds : [Text];
  };
};
