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

    return Controller.extend("config.controller.StorageLocation", {
        onInit: function () {    
        },

        onCreate: function () {
            var oView = this.getView();
            const slocData = {
                LocationID   : "",
                LocationName : ""
            };
            const slocModel = new JSONModel(slocData);
            oView.setModel(slocModel, "slocModel");
            if (!this._oDialogItem) {
                this._oDialogItem = sap.ui.xmlfragment("config.fragments.addStorageLocation", this);
                oView.addDependent(this._oDialogItem);
            }
            this._oDialogItem.open();
        },

        handleValueHelpClose1: function () {
            this._oDialogItem.close();
        },
        onSave: function () {
            var oView = this.getView();
            var oTable = this.byId("slocTable");

            var slocData = this.getView().getModel("slocModel").getData();

            let slocId = slocData.LocationID;
            let slocName = slocData.LocationName
            let payload = { 
                LocationID : slocId ,
                LocationName: slocName
            }
            let oModel = this.getView().getModel();

            let oBindListSPM = oModel.bindList("/StorageLocation");
            oBindListSPM.create(payload, true);
            oBindListSPM.attachCreateCompleted(p => {
                // console.log(p);
                let p1 = p.getParameters();
                if (p1.success) {
                    // console.log(p1);
                    
                        sap.m.MessageToast.show("Storage Location added successfully");
                

                    oView.getModel().refresh();
                    oTable.getBinding("items").refresh();
                    
                } else {
                    let oContext = p1.context;
                    let msgArr = oContext.oModel.mMessages[""];
                    // console.log(msgArr);
                    sap.m.MessageBox.error(msgArr[msgArr.length - 1].message);
                }

            })
            this._oDialogItem.close();



            oTable.removeSelections();
        },

       
       

        onEdit: function () {
            var oTable = this.byId("slocTable");
            var aSelectedItems = oTable.getSelectedItems();
        
            if (aSelectedItems.length !== 1) {
                MessageToast.show("Please select exactly one item to edit.");
                return;
            }
        
            var oSelectedItem = aSelectedItems[0];
            var oContext = oSelectedItem.getBindingContext();
            var oData = oContext.getObject();
            const editMaterialStatusModel = new JSONModel(oData);
            this.getView().setModel(editMaterialStatusModel, "slocModel");

            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("config.fragments.updateLocation", this);
                this.getView().addDependent(this._oDialog);
            }
            this._oDialog.open();
        },
        
        onUpdate: async function () {
            var oView = this.getView();
            var oTable = this.byId("slocTable");
            var oModel = oView.getModel();
            var oUpdateData = oView.getModel("slocModel").getData();
        
            let slocId = oUpdateData.LocationID;
            let slocName = oUpdateData.LocationName;

            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length !== 1) {
                sap.m.MessageToast.show("Please select one item to update.");
                return;
            }

            var oSelectedItem = aSelectedItems[0];
            var oContext = oSelectedItem.getBindingContext();
        
            let oModel2 = this.getOwnerComponent().getModel();

            if (oContext.getProperty("LocationID") === slocId) {
                oContext.setProperty("LocationName", slocName);
                try {
                    await oModel2.submitBatch("update");
                    sap.m.MessageToast.show("Item updated successfully.");
                    this._oDialog.close();
                    oTable.removeSelections();
                } catch (error) {
                    sap.m.MessageToast.show("Error updating item: " + error.message);
                }
            } else {
                sap.m.MessageToast.show("The selected items Location ID does not match the update data.");
            }  
        },
        handleValueHelpClose2: function () {
            var oTable = this.byId("slocTable");
            this._oDialog.close();
            oTable.removeSelections();
        },


        onDelete: function () {
            let oTable = this.byId("slocTable");
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
