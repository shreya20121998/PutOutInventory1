sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/ValueState"
],
function (Controller,Fragment,JSONModel,ValueState) {
    "use strict";
   let flag = 0
    return Controller.extend("inventory.controller.SecurityGateIn", {
        onInit: function () {
            // this.getBindServices("0004") 
            let dateModelPayload = {
                startDate : "",
                endDate   : ""
            }
            let dateModel = new JSONModel(dateModelPayload)
            this.getView().setModel(dateModel,"dateModel")
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteWarehouseMain").attachPatternMatched(this.onRouteMatched, this);
        },

        onRouteMatched: function () {
            this.refreshFragment();
        },

        refreshFragment: function () {
            let oCharteringRqNoInput = this.byId("CharteringRqNo");
            let materialLayout = this.byId("requestMaterialDetailsLayout") 
            if(oCharteringRqNoInput || materialLayout){
            oCharteringRqNoInput.setValue("")
            materialLayout.setVisible(false)
            this.byId('myDatePicker').setValue("");
            this.byId('myDatePicker1').setValue("");
            }
        },

    
        removeCommas: function(reqNo) {
            if (reqNo) {
                return reqNo.toString().replace(/,/g, '');  
            }
            return reqNo;
        },

        _onStartDateFilter:function(){
            let dateModel = this.getView().getModel("dateModel").getData();
            let endSelectDate = dateModel.endDate;
            if(endSelectDate){
                this._onDateFilter()
            }
        },

        _onDateFilter: async function() {
            let dateModel = this.getView().getModel("dateModel").getData();
            let startDate = new Date(dateModel.startDate); 
            let endDate = new Date(dateModel.endDate);            
            endDate.setHours(23, 59, 59, 999);            
            let oModel = this.getView().getModel();         
            let oBindList = oModel.bindList("/serviceRequest", undefined, undefined,undefined, undefined);
            let aContexts = await oBindList.requestContexts(0, Infinity);
            let filterData = aContexts.map(oContext => oContext.getObject());
            let filteredResults = filterData.filter(item => {
                let createdAt = new Date(item.createdAt);
                return createdAt >= startDate && createdAt <= endDate;
            });
            if(filteredResults.length>0){
                this.byId("requestMaterialDetailsLayout").setVisible(true)
            }
                // let dataModel = new JSONModel(filteredResults);
                let excludeInspectedResults = filteredResults.filter( x => !x.reqStatus.includes('Inspection Completed')

                )
                // console.table(filteredResults);
                console.table(excludeInspectedResults);
                let dataModel = new JSONModel(excludeInspectedResults);

                this.getView().setModel(dataModel,"materialData");
        },     

        onMaterialRowSelect:function(oEvent){
            const oBindingContext = oEvent.getSource().getBindingContext("materialData");
            const rowData = oBindingContext.getObject().reqNo;
            const materialStatus = oBindingContext.getObject().reqStatus;
            const materialData = {
                reqNo: rowData,
                reqStatus: materialStatus
            };
            sessionStorage.setItem("materialData", JSON.stringify(materialData));
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteGateMaterial")
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
                    this.byId("requestMaterialDetailsLayout").setVisible(true)
                }
                this.serviceNo = sSelectedValue
                try {
                    await this.getBindServices(sSelectedValue)
                } catch (error) {
                    console.log("Selected item is not found");
                }
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
        
        
    });
});


