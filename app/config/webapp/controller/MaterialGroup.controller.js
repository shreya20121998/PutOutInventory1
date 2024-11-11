sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/ui/core/Fragment',
    "sap/m/MessageBox",
    "sap/m/MessageToast",
],
function (Controller,JSONModel,Fragment,MessageBox,MessageToast) {
    "use strict";
    let oBusyDialog;

    return Controller.extend("config.controller.MaterialGroup", {
        onInit: function () {  

        },

        _onCreateMaterialEntryDialog: function () {
            var oView = this.getView();
            if (!this._oDialogItem) {
                this._oDialogItem = sap.ui.xmlfragment("config.fragments.createMaterialGroup", this);
                oView.addDependent(this._oDialogItem);
            }
            this._oDialogItem.open();
        },

        _handleValueHelpClose1: function () {
            this._oDialogItem.close();
        },

       
        _onSaveMaterialEntry :function(){
            var oTable = this.byId("materialGroupTable");
            // let idField = sap.ui.getCore().byId("idField").getValue()
            let typeField = sap.ui.getCore().byId("typeField").getValue()
            let locationIdField = sap.ui.getCore().byId("locationIdField").getValue()
            let ZcodeField = sap.ui.getCore().byId("ZcodeField").getValue()
            let usabilityInput = sap.ui.getCore().byId("usabityInput").getValue()
            var oModel = this.getView().getModel();   
            let payload = {
                "ID": "",
                "Type": typeField,
                "Usability": usabilityInput,
                "Zcode": ZcodeField,
                "StorageLocation_LocationID": locationIdField
              }
            let oBindListSPM = oModel.bindList("/Category");
            oBindListSPM.create(payload);
            this._oDialogItem.close();
            this.getView().getModel().refresh();
            setTimeout (() =>{
            sap.m.MessageToast.show("Data added successfully");

            oTable.removeSelections();  
            }, 1000);
            
        },
        _showLocationValueHelp : function (oEvent) {

            this.oSource = oEvent.getSource();
            if (!this._LocationDialog) {
                this._LocationDialog = sap.ui.xmlfragment(
                    "config.fragments.locationValueHelp",
                    this
                );
                this.getView().addDependent(this._LocationDialog);
            }

            // Clear any existing filters on the SelectDialog
            this._LocationDialog.open();
            if (this._LocationDialog) {

                this._LocationDialog.getBinding("items").filter([]);
            }

        },
        onLocationValueHelpClose : function ( oEvent ) {
            let oSelectedItem = oEvent.getParameter("selectedItem");

            let obj = oSelectedItem.getBindingContext().getObject();
        

            // // Find the input field that triggered the value help (Description input)
            let rowContext = this.oSource;
         

           rowContext.setValue( obj.LocationID );

            if (!oSelectedItem) {
                if (that._LocationDialog) {

                    that._LocationDialog.destroy();
                    that._LocationDialog = null;
                }
                return;
            }

        },

        _onEditMaterialDialog: function () {
            var oTable = this.byId("materialGroupTable");
            var aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length !== 1) {
                MessageToast.show("Please select a row first");
                return;
            }
            var oSelectedItem = aSelectedItems[0];
            var oContext = oSelectedItem.getBindingContext();
            var oData = oContext.getObject();
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("config.fragments.updateMaterialGroup", this);
                this.getView().addDependent(this._oDialog);
            }
            let editModel = new sap.ui.model.json.JSONModel(oData);
            this._oDialog.setModel(editModel,"editMaintainData")
            this._oDialog.open();
        },
        
        nUpdateMaterialGroupEntry: async function () {
            debugger
            var oView = this.getView();
            var oTable = this.byId("materialGroupTable");
            let ID = sap.ui.getCore().byId("editIDInput").getValue()
            let Type = sap.ui.getCore().byId("editCatgInput").getValue()
            let Usability = sap.ui.getCore().byId("editUsabilityInput").getValue()
            let Zcode = sap.ui.getCore().byId("fieldTypeComboBox1").getValue()
            let StorageLocation_LocationID = sap.ui.getCore().byId("editLocationInput").getValue()
            var aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length !== 1) {
                sap.m.MessageToast.show("Please select one item to update.");
                return;
            }
            var oSelectedItem = aSelectedItems[0];
            var oContext = oSelectedItem.getBindingContext();
            let oModel2 = this.getOwnerComponent().getModel();
            if (oContext.getProperty("ID") === ID) {
                oContext.setProperty("Type", Type);
                oContext.setProperty("Usability", Usability);
                oContext.setProperty("StorageLocation_LocationID", StorageLocation_LocationID);
                oContext.setProperty("Zcode", Zcode);
                try {
                    await oModel2.submitBatch("update");
                    sap.m.MessageToast.show("Item updated successfully.");
                    this._oDialog.close();
                    oTable.removeSelections();
                } catch (error) {
                    sap.m.MessageToast.show("Error updating item: " + error.message);
                }
            } else {
                sap.m.MessageToast.show("The selected items StatusCode does not match the update data.");
            }  
        },

        _onUpdateMaterialGroupEntry: async function () {
            debugger;
            var oView = this.getView();
            var oTable = this.byId("materialGroupTable");
            var aSelectedItems = oTable.getSelectedItems();
        
            if (aSelectedItems.length !== 1) {
                sap.m.MessageToast.show("Please select one item to update.");
                return;
            }
            var oSelectedItem = aSelectedItems[0];
            var oContext = oSelectedItem.getBindingContext();
            let ID = sap.ui.getCore().byId("editIDInput").getValue();
            let Type = sap.ui.getCore().byId("editCatgInput").getValue();
            let Usability = sap.ui.getCore().byId("editUsabilityInput").getValue();
            let Zcode = sap.ui.getCore().byId("fieldTypeComboBox1").getValue();
            let StorageLocation_LocationID = sap.ui.getCore().byId("editLocationInput").getValue();
            oContext.setProperty("ID", ID);
            oContext.setProperty("Type", Type);
            oContext.setProperty("Usability", Usability);
            oContext.setProperty("Zcode", Zcode);
            oContext.setProperty("StorageLocation_LocationID", StorageLocation_LocationID);
        
            let oModel = this.getOwnerComponent().getModel();
        
            try {
                await oModel.submitBatch("updateGroup");  
                oTable.getBinding("items").refresh();
                sap.m.MessageToast.show("Item updated successfully.");
                this._oDialog.close(); 
                oTable.removeSelections(); 
                } catch (error) {
                sap.m.MessageToast.show("Error updating item: " + error.message);
            }
        },
        
                
        _handleValueHelpClose2: function () {
            var oTable = this.byId("materialGroupTable");
            this._oDialog.close();
            oTable.removeSelections();
        },


        _onDeleteMaterialEntry: function () {
            let oTable = this.byId("materialGroupTable");
            let aItems = oTable.getSelectedItems();

            if (!aItems.length) {
              MessageToast.show("Please Select at least one row ");
              return;
            }
            const that = this;
            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                MessageBox.confirm(
                    "Are you sure ,you want  to delete ?", {
                    title: "Confirm ",
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                        that.deleteSelectedItems(aItems);
                        } else {
                        oTable.removeSelections();
                        sap.m.MessageToast.show("Deletion canceled");
                        }
                    }
                    }
                );
            });
        },

        deleteSelectedItems: function (aItems) {
            let slength = aItems.length;
            let deleteMsg = slength === 1 ? "Record" : "Records"
            aItems.forEach(function (oItem) {
              const oContext = oItem.getBindingContext();
              oContext.delete().then(function () {
                MessageToast.show(`${deleteMsg} deleted sucessfully`);
              }).catch(function (oError) {
                MessageBox.error("Error deleting item: " + oError.message);
              });
            });
        },
    });
});
