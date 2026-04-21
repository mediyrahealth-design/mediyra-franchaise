import Common "common";

module {
  public type CenterStatus = {
    #active;
    #inactive;
  };

  public type CollectionCenter = {
    id : Text;
    name : Text;
    contactPerson : Text;
    mobile : Text;
    city : Text;
    address : Text;
    assignedPrincipal : ?Common.UserId;
    status : CenterStatus;
    createdAt : Common.Timestamp;
  };

  public type CreateCenterRequest = {
    name : Text;
    contactPerson : Text;
    mobile : Text;
    city : Text;
    address : Text;
  };

  public type UpdateCenterRequest = {
    name : Text;
    contactPerson : Text;
    mobile : Text;
    city : Text;
    address : Text;
    status : CenterStatus;
  };
};
