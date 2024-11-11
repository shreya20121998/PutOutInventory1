sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox" ,
    "sap/ui/model/Filter" // Add this line to import MessageBox
], function (Controller, MessageToast, MessageBox,Filter) {
    "use strict";
    var sLocationID

    return Controller.extend("config.controller.StorageLocation", {
        onInit: function () {
            this.onStorageLocation();

        },

        onStorageLocation: function () {
            // Create a JSON Model to hold the StorageLocation data
            var locationModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(locationModel, "locationModel");

            // Retrieve data from the OData service
            let oModel = this.getOwnerComponent().getModel();
            let oBindList = oModel.bindList("/StorageLocation");

            // Fetch data and set it to the JSON model
            oBindList.requestContexts(0, Infinity).then(function (aContexts) {
                var locationData = [];
                aContexts.forEach(function (oContext) {
                    locationData.push(oContext.getObject());
                });

                // Set the data to the locationModel
                locationModel.setData({ StorageLocations: locationData });

                // Debugging output (optional)
                console.log("location", locationData);
            });

        },


        onCreatePress: function () {
            // Open the create dialog
            if (!this.createDialog) {
                this.createDialog = this.byId("createDialog");
            }
            this.createDialog.open();
        },

        onDialogCreatePress: function () {
            // Get values from the input fields
            var locationID = this.byId("locationIDInput").getValue().trim();
            var locationName = this.byId("locationNameInput").getValue().trim();
            let oTable = this.byId('storageTable');

            // Validate input fields
            if (!locationID || !locationName) {
                MessageToast.show("Both Location ID and Location Name must be filled in.");
                return; // Exit if validation fails
            }

            let oModel = this.getView().getModel();
            let oBindList = oModel.bindList("/StorageLocation");

            // Check if the locationID already exists
            let idFilter = new sap.ui.model.Filter("LocationID", sap.ui.model.FilterOperator.EQ, locationID);
            oBindList.filter(idFilter).requestContexts().then(function (aContexts) {
                if (aContexts.length > 0) {
                    // Location ID already exists
                    MessageToast.show("Location ID already exists. Please use a different ID.");
                    return; // Exit if validation fails
                }

                // Check if the locationName already exists
                let nameFilter = new sap.ui.model.Filter("LocationName", sap.ui.model.FilterOperator.EQ, locationName);
                oBindList.filter(nameFilter).requestContexts().then(function (aContextsByName) {
                    if (aContextsByName.length > 0) {
                        // Location Name already exists
                        MessageToast.show("Location Name already exists. Please use a different name.");
                        return; // Exit if validation fails
                    }

                    // Prepare the data entry
                    var locationEntry = {
                        LocationID: locationID,
                        LocationName: locationName,
                    };

                    console.log("locationEntry", locationEntry);

                    // Create the new entry in the OData service
                    oBindList.create(locationEntry,true);

                    // Refresh the model and the storage locations after creation
                    oBindList.attachCreateCompleted( p => {
                        let p1 = p.getParameters();
                        if( p1.success){
                            oModel.refresh();

                            oTable.getBinding("items").refresh();
                        }
                    })
                    
                    

                    // Show success message
                    MessageToast.show("Location Created: " + locationID + " - " + locationName);

                    // Clear the input fields
                    this.byId("locationIDInput").setValue("");
                    this.byId("locationNameInput").setValue("");

                    // Close the dialog
                    this.createDialog.close();
                }.bind(this)); // Bind the context for the callback
            }.bind(this)); // Bind the context for the first callback
        },



        onDialogCancelPress: function () {
            // Close the create dialog
            this.createDialog.close();
        },

        onEditPress: function () {
            var oTable = this.byId("storageTable");
            var oSelectedItem = oTable.getSelectedItem();

            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext("locationModel").getObject();

                // Set the selected values to the edit dialog inputs
                this.byId("editLocationIDInput").setValue(oContext.LocationID);
                this.byId("editLocationNameInput").setValue(oContext.LocationName);

                // Open the edit dialog
                if (!this.editDialog) {
                    this.editDialog = this.byId("editDialog");
                }
                this.editDialog.open();
            } else {
                MessageToast.show("Please select a row to edit.");
            }
        },

        onDialogSavePress: function () {
            var LocationId = this.getView().byId("editLocationIDInput").getValue();
            var LocationName = this.getView().byId("editLocationNameInput").getValue();
            let oModel = this.getView().getModel();
            let oBindList = oModel.bindList("/StorageLocation");
            let aFilter = new sap.ui.model.Filter("LocationID", sap.ui.model.FilterOperator.EQ, LocationId);


            oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
                if (aContexts.length > 0) {
                    aContexts[0].setProperty("LocationName", LocationName);
                     oModel.refresh();
                    MessageToast.show("Location updated successfully.");
                } else {
                    MessageToast.show("Location not found.");
                }
            }.bind(this));

            this.editDialog.close();
        },

        onDialogCancelEditPress: function () {
            this.editDialog.close();
        },

        onRowSelect: function (oEvent) {
            // Get the selected item
            var oSelectedItem = oEvent.getParameter("listItem");
            if (oSelectedItem) {
                // Get the binding context of the selected item
                var oContext = oSelectedItem.getBindingContext("locationModel");
                if (oContext) {
                    // Retrieve the LocationID
                    sLocationID = oContext.getProperty("LocationID");
                    console.log("Selected Location ID: ", sLocationID);
                    // You can now use the sLocationID for further processing
                }
            }
        },

        onDeletePress: function () {
            var oTable = this.byId("storageTable");
            var oSelectedItem = oTable.getSelectedItem();

            // Check if there are storage locations to delete from
            if (oTable.getBinding("items").getLength() === 0) {
                MessageToast.show("No storage locations available.");
                return;
            }

            if (oSelectedItem) {
                // Get the binding context of the selected item
                var oContext = oSelectedItem.getBindingContext("locationModel");

                // Confirm deletion
                MessageBox.confirm("Are you sure you want to delete this storage location?", {
                    title: "Confirm Deletion",
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            // Proceed with deletion
                            let oModel = this.getView().getModel();
                            let oBindList = oModel.bindList("/StorageLocation");

                            let aFilter = new sap.ui.model.Filter("LocationID", sap.ui.model.FilterOperator.EQ, sLocationID);

                            oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
                                if (aContexts.length > 0) {
                                    aContexts[0].delete(); // Delete the selected item
                                    MessageToast.show("Storage location deleted successfully.");
                                    this.onStorageLocation(); // Refresh the storage locations after deletion
                                } else {
                                    MessageToast.show("Location not found.");
                                }
                            }.bind(this));
                        }
                    }.bind(this) // Bind the context for the callback
                });
            } else {
                MessageToast.show("Please select a row to delete.");
            }
        }

    });
});
