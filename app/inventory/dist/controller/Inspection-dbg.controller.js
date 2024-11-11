sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState"
], function (Controller, JSONModel, MessageToast,Fragment,ValueState) {
    "use strict";

    var quantityDifference=0;
    return Controller.extend("inventory.controller.Inspection", {

        onInit: function () {
    
            let dateModelPayload = {
                startDate : "",
                endDate   : ""
            }
            let dateModel = new JSONModel(dateModelPayload)
            this.getView().setModel(dateModel,"dateModel")
            console.log(dateModel,"dateModel");

            // Create a JSON model for material data
            var materialModel = new JSONModel();
            this.getView().setModel(materialModel, "materialModel");

            // Retrieve data from the OData service
            let oModel = this.getOwnerComponent().getModel(); // Ensure this is an OData V4 model

            // Create a binding context for the /Material entity set and expand SubcomponentList
            let oBindList = oModel.bindList("/rqMaterial");

            // Fetch data and set it to the JSON model
            oBindList.requestContexts(0, Infinity)
                .then((aContexts) => {
                    var materialData = aContexts.map((oContext) => {
                        let material = oContext.getObject();
                        // Store the original quantity
                        material.OriginalQuantity = material.Quantity; // Add OriginalQuantity field
                        return material;
                    });

                    // Set the data to the materialModel
                    materialModel.setData({ Materials: materialData });

                    // Debugging output (optional)
                    console.log("Materials:", materialData);
                })
                .catch((oError) => {
                    console.error("Error fetching material data:", oError);
                });
                this._onDateFilter();

                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteInspection").attachPatternMatched(this.onRouteMatched, this);
        },
        onRouteMatched: function () {
            this.byId('myDatePicker').setValue("");
            this.byId('myDatePicker1').setValue("");
            this.byId('CharteringRqNo').setValue("");
            this.byId("vendorDetailsLayout").setVisible(false);
        },


        removeCommas: function(reqNo) {
            if (reqNo) {
                return reqNo.toString().replace(/,/g, '');  
            }
            return reqNo;
        },

        _onDateFilter: async function() {
        
            let dateModel = this.getView().getModel("dateModel").getData();
            let startDate = new Date(dateModel.startDate); 
            let endDate = new Date(dateModel.endDate);            
            endDate.setHours(23, 59, 59, 999);            
            let oModel = this.getOwnerComponent().getModel();         
            let oBindList = oModel.bindList("/serviceRequest");
            let aContexts = await oBindList.requestContexts(0, Infinity);
            let filterData = aContexts.map(oContext => oContext.getObject());
            let filteredResults = filterData.filter(item => {
                let createdAt = new Date(item.createdAt);
                return createdAt >= startDate && createdAt <= endDate;
            });
            if(filteredResults.length>0){
                this.byId("vendorDetailsLayout").setVisible(true)
            }
                let dataModel = new JSONModel(filteredResults)
                this.getView().setModel(dataModel,"materialData")
        },     

        onMaterialRowSelect:function(oEvent){
            const oBindingContext = oEvent.getSource().getBindingContext("materialData");
            const rowData = oBindingContext.getObject().reqNo;
            console.log("row data",rowData);
            sessionStorage.setItem("materialData", JSON.stringify(rowData));
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteInspectionTable")
        },

        formatDate: function(sDate) {
            if (!sDate) return ""; 
            let date = new Date(sDate);
            let day = String(date.getDate()).padStart(2, '0'); 
            let month = String(date.getMonth() + 1).padStart(2, '0'); 
            let year = date.getFullYear();
            return `${day}-${month}-${year}`; 
        },

        formatTime: function(sDate) {
            if (!sDate) return ""; 
            let date = new Date(sDate);
            let hours = String(date.getHours()).padStart(2, '0'); 
            let minutes = String(date.getMinutes()).padStart(2, '0'); 
            return `${hours}:${minutes}:00`; 
        },

        getBindServices: async function (value) {
            try {
                let reqValue = parseInt(value.replace(/,/g, ""));
                let oModel = this.getOwnerComponent().getModel();        
                let oBindList = oModel.bindList("/serviceRequest", undefined, undefined, undefined, undefined);
                let aContexts = await oBindList.requestContexts(0, Infinity);
                let data = aContexts.map(oContext => oContext.getObject());
                let filterData = data.filter(item=>{
                    return item.reqNo === reqValue
                })
                let dataModel = new JSONModel(filterData)
                this.getView().setModel(dataModel,"materialData")
            } catch (error) {
                console.error("Error fetching bid details:", error.message);
            }
        },

        statusFormatter: function (status) {
            switch (status) {
                case "Open":
                    return ValueState.Warning;
                case "CLOSED":
                    return ValueState.Error;
                default:
                    return ValueState.Information;
            }
        },

        _onStatusTypeChange:function(oEvent){
            var oSelect = oEvent.getSource();
            var sSelectedText = oSelect.getSelectedItem().getText();
            console.log("selected item",sSelectedText);
            if(sSelectedText === "Partial"){
                this.onPartialBtnPress(oSelect);
            }
        },

        onServiceRequestNumber: function(oEvent) {
            const oView = this.getView();
            this._oInputField = oEvent.getSource();        
            if (!this.requestNoFragment) {
                Fragment.load({
                    id: oView.getId(),
                    name: "inventory.fragments.SecurityValueHelp",
                    controller: this
                }).then(oDialog => {
                    this.requestNoFragment = oDialog;                    
                    oView.addDependent(this.requestNoFragment);        
                    this.requestNoFragment.open();
                });
            } else {
                this.requestNoFragment.open();
            }
        },

        onValueHelpClosevoy: async function (oEvent) {
            const oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                const sSelectedValue = oSelectedItem.getTitle();
                this._oInputField.setValue(sSelectedValue);
                if(sSelectedValue){
                    this.byId("vendorDetailsLayout").setVisible(true);
                }
                this.serviceNo = sSelectedValue
                try {
                    await this.getBindServices(sSelectedValue)
                } catch (error) {
                    console.log("Selected item is not found");
                }
            }
        },

        onSaveCheckInData :function(){
            let oModel = this.getView().getModel();
            let srvNo = 12;
            let oBindList = oModel.bindList("/ReqNoSchema");
            let aFilter = new sap.ui.model.Filter("reqNo", sap.ui.model.FilterOperator.EQ, srvNo);
            oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
                aContexts[0].setProperty("reqStatus","its done");
            });
        },

        _onSaveCheckInData: function() {
            let oModel = this.getView().getModel();
            let srvNo = 12;        
            let oBindList = oModel.bindList("/ReqNoSchema");        
            let aFilter = new sap.ui.model.Filter("reqNo", sap.ui.model.FilterOperator.EQ, srvNo);        
            oBindList.filter(aFilter).requestContexts().then(function(aContexts) {
                if (aContexts.length > 0) {
                    let oContext = aContexts[0];        
                    oContext.setProperty("reqStatus", "its done");        
                    let oMaterialPath = oContext.getPath() + "/Materials/0";       
                    oContext.setProperty(oMaterialPath + "/Description", "Updated Material 401 Description");
                    oContext.setProperty(oMaterialPath + "/Quantity", 250);
                    oContext.setProperty(oMaterialPath + "/Status", "Completed");        
                    oModel.submitBatch("batchRequestGroup").then(function() {
                        console.log("Material data successfully updated.");
                    }).catch(function(oError) {
                        console.error("Error submitting batch:", oError);
                    });
                }
            }).catch(function(oError) {
                console.error("Error fetching contexts:", oError);
            });
        },              

        
        onSaveCheckInData: async function() {
            try {
                let oModel = this.getView().getModel();
                let oBindList = oModel.bindList("/ReqNoSchema");
                let aFilter = new sap.ui.model.Filter("reqNo", sap.ui.model.FilterOperator.EQ, 12);
                oBindList.filter(aFilter);
                let aContexts = await oBindList.requestContexts(0, Infinity);        
                if (aContexts.length > 0) {
                    let oContext = aContexts[0];
                    oContext.getModel().setProperty(oContext.getPath() + "/Materials/0/Description", "Updated Description");
                    oContext.getModel().setProperty(oContext.getPath() + "/Materials/0/Quantity", 999);
                    oContext.getModel().setProperty(oContext.getPath() + "/Materials/0/Status", "Updated Status");        
                    await oModel.submitBatch("batchRequestGroup");        
                    MessageToast.show("Hardcoded data successfully updated.");
                } else {
                    console.warn("No matching context found for the given reqNo.");
                }
            } catch (error) {
                console.error("Error during hardcoded data update:", error);
                MessageToast.show("Error updating hardcoded data.");
            }
        },                                                     


        onPartialBtnPress:function(oSelect){
            var oRow = oSelect.getParent(); 
            var descriptionCell = oRow.getCells()[1];
            var qtyCell = oRow.getCells()[3];         
            if (descriptionCell instanceof sap.m.Input) {
                  descriptionCell.setEditable(true);
            }
            if (qtyCell instanceof sap.m.Input) {
                qtyCell.setEditable(true);
            }
        },

        expandTableField: function() {
            let oTable = Fragment.byId(this.getView().getId(), "expandSubTable");
            let aItems = oTable.getItems(); 
            aItems.forEach(function(item) {
                let descriptionCell = item.getCells()[1];
                let qtyCell = item.getCells()[3];         
                if (descriptionCell instanceof sap.m.Input) {
                    descriptionCell.setEditable(true);
                }
                if (qtyCell instanceof sap.m.Input) {
                    qtyCell.setEditable(true);
                }
            });
        },      
        

        _onCancelCheckinSubFragment:function(){
            this.expandCheckinDataFragment.close()
        },

        onExit : function(){

        },
        

        onSubmit: function () {
            // Handle the submit action
            MessageToast.show("Submit button clicked");
        }
    });
});
