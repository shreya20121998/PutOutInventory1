sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
],
function (Controller,Fragment,JSONModel,ValueState) {
    "use strict";
   let flag = 0;
    return Controller.extend("inventory.controller.SecurityGateInMaterial", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteGateMaterial").attachPatternMatched(this._onObjectMatched, this);
        }, 

        _onObjectMatched:async function(){
            try {
                this.resetTableControls();
                const materialData = JSON.parse(sessionStorage.getItem("materialData"));
                const requestNumber = materialData ? materialData.reqNo : null;
                console.log("status hai",materialData.reqStatus)
                if(materialData.reqStatus === 'Received at warehouse'){
                    this.layoutEditOnStatus()
                }
                else{
                    let nonEditableLayout = this.getView().byId("materialDetailsLayout2")
                    let editableLayout = this.getView().byId("materialDetailsLayout")
                    nonEditableLayout.setVisible(false)
                    editableLayout.setVisible(true)
                }
                let oModel = this.getOwnerComponent().getModel();        
                let oBindList = oModel.bindList("/rqMaterial", undefined, undefined,undefined,{
                    $expand: "SubcomponentList",
                });
                let aContexts = await oBindList.requestContexts(0, Infinity);
                let data = aContexts.map(oContext => oContext.getObject());

                let filterData = data.filter(item=>{
                    return item.reqNo === requestNumber
                })
                console.log("Bid details data:", filterData);   
                // let subModel = new JSONModel(filterData[0].Materials[0].SubcomponentList)
                let dataModel = new JSONModel(filterData)
                this.getView().setModel(dataModel,"materialData")
                console.log("model data is",this.getView().getModel("materialData").getData())
                // this.getView().setModel(subModel,"subMaterialData") 
                let oTable = this.byId("materialTable");
                oTable.attachEventOnce("updateFinished", this.resetTableControls.bind(this));
                

            } catch (error) {
                
            }
        },

        _onGetValue: function(){
            let mapValue = this.getValueData.filter(item=>{
                item.Strap === this.newValue && item.Lgort === "LOC02"
            }).map(item=>{
                let mapValue = item.matnr === this.newMatnr
                return mapValue.indexOf(a)
            })

            let oMaterial = mapValue.concat(this.extractValue);
            oMaterial.getAllItems(
                this.getAllDataFetched(oMaterial)
            )
            let oTable = this.byId("materialListTable")
            let oTableData = oTable.getBindingContext("materialDataModel")
            oTableData.getObject()
            let newTableData = oTableData.getBinding("materialModel")
            newTableData.getObject()
            newTableData.getData().newValue
        },

        layoutEditOnStatus :function(){
                let nonEditableLayout = this.getView().byId("materialDetailsLayout2")
                let editableLayout = this.getView().byId("materialDetailsLayout")
                nonEditableLayout.setVisible(true)
                editableLayout.setVisible(false)
                if(!flag){
                    flag =1
                }
        },
        
        resetTableControls: function() {
            let oTable = this.byId("materialTable");
            oTable.getItems().forEach(function(oItem) {
                let aCells = oItem.getCells(); 
                let oSelect = aCells[5];
                if (oSelect instanceof sap.m.Select) {
                    oSelect.setSelectedKey("");
                }
                let oInput = aCells[4];  
                if (oInput instanceof sap.m.Input) {
                    oInput.setEditable(false);  
                }
                let oRemarks = aCells[6];
                if(oRemarks instanceof sap.m.Input){
                    oRemarks.setValue("")
                }
            });
        },

        nMaterialRowSelect: async function(oEvent) {
            debugger
            const oView = this.getView();
            const materialData = JSON.parse(sessionStorage.getItem("materialData"));
            const matStatus = materialData.reqStatus
            let oRowContext = oEvent.getSource().getParent().getBindingContext("materialData");
            let selectedMaterial = oRowContext.getObject();
            
            let subMaterials = selectedMaterial.SubcomponentList || [];
          
            if (!this.expandCheckinDataFragment) {
              Fragment.load({
                id: oView.getId(),
                name: "inventory.fragments.GateInSubMaterial",
                controller: this
              }).then(oDialog => {
                this.expandCheckinDataFragment = oDialog;
                oView.addDependent(this.expandCheckinDataFragment);
          
                let subModel = new sap.ui.model.json.JSONModel(subMaterials);
                this.expandCheckinDataFragment.setModel(subModel, "subMaterialData");
                if (matStatus === "Received at warehouse") {
                    let oTable2 = Fragment.byId(this.getView().getId(), "expandSubTable2");
                   oTable2.setVisible(true)
                    let oTable = Fragment.byId(this.getView().getId(), "expandSubTable");
                   oTable.setVisible(false)
                }
                this.expandCheckinDataFragment.open();
              }).catch(err => {
                console.error("Failed to load fragment:", err);
              });
            } else {
              let subModel = new sap.ui.model.json.JSONModel(subMaterials);
              this.expandCheckinDataFragment.setModel(subModel, "subMaterialData");
              let oTable2 = Fragment.byId(this.getView().getId(), "expandSubTable2");
                   oTable2.setVisible(false)
                    let oTable = Fragment.byId(this.getView().getId(), "expandSubTable");
                   oTable.setVisible(true)
              this.expandCheckinDataFragment.open();
            }
          },

          onMaterialRowSelect: async function(oEvent) {
            const oView = this.getView();
            const materialData = JSON.parse(sessionStorage.getItem("materialData"));
            const matStatus = materialData.reqStatus;
            let oRowContext = oEvent.getSource().getParent().getBindingContext("materialData");
            let selectedMaterial = oRowContext.getObject();
            let status = selectedMaterial.MatStatus
            let subMaterials = selectedMaterial.SubcomponentList || [];        
            if (!this.expandCheckinDataFragment) {
                try {
                    this.expandCheckinDataFragment = await Fragment.load({
                        id: oView.getId(),
                        name: "inventory.fragments.GateInSubMaterial",
                        controller: this
                    });
                    oView.addDependent(this.expandCheckinDataFragment);
                } catch (err) {
                    console.error("Failed to load fragment:", err);
                    return;
                }
            }        
            let subModel = new sap.ui.model.json.JSONModel(subMaterials);
            this.expandCheckinDataFragment.setModel(subModel, "subMaterialData");
        
            let oTable = Fragment.byId(oView.getId(), "expandSubTable");
            let oTable2 = Fragment.byId(oView.getId(), "expandSubTable2");
            let oButton = Fragment.byId(oView.getId(), "_IDGenButton1");
            if(!status || status === "Full Received" || status === "Not Received" ||matStatus === "Received at warehouse"){
                    oTable.setVisible(false);
                    oTable2.setVisible(true);
                    oButton.setVisible(false)
                
            }else{
                oTable.setVisible(true);
                oTable2.setVisible(false);
                oButton.setVisible(true) 
            }
                
            this.expandCheckinDataFragment.open();
        },        

        _onStatusTypeChange: function(oEvent) {
            let oSelectedItem = oEvent.getParameter("selectedItem");
            let sStatus = oSelectedItem.getKey()
            var oSelect = oEvent.getSource();
            var sSelectedText = oSelect.getSelectedItem().getText();
            let oBindingContext = oEvent.getSource().getBindingContext("materialData");

            oBindingContext.setProperty("MatStatus", sStatus);
            console.log("selected item", sSelectedText);
            let oRow = oSelect.getParent(); 
            let qtyCell = oRow.getCells()[4];  
            if (sSelectedText === "Partial") {
                if (qtyCell instanceof sap.m.Input) {
                    qtyCell.setEditable(true);  
                }
            } else {
                if (qtyCell instanceof sap.m.Input) {
                    qtyCell.setEditable(false);  
                }
            }
        },                


        _onCancelCheckinSubFragment : function(){
            this.expandCheckinDataFragment.close()
        }, 
        
        _onMaterialSubmit: async function() {
            let oTable = this.byId("materialTable");
            let aTableItems = oTable.getItems(); 
            let updatedMaterials = [];
        
            aTableItems.forEach(function(oItem) {
                let oContext = oItem.getBindingContext("materialData");
        
                if (oContext) {
                    let status = oContext.getProperty("Status");
                    let quantity = parseInt(oContext.getProperty("Quantity")) || 0; 
                    let subComponents = oContext.getProperty("SubcomponentList");        
                    if (status === "Not Received") {
                        quantity = 0;
                        subComponents = subComponents.map(sub => ({
                            ...sub,
                            Quantity: parseInt(0) 
                        }));
                    } else {
                        subComponents = subComponents.map(sub => ({
                            ...sub,
                            Quantity: parseInt(sub.Quantity) || 0
                        }));
                    }
                    let updatedMaterial = {
                        reqNo: oContext.getProperty("reqNo"),
                        MaterialCode: oContext.getProperty("MaterialCode"),
                        Category: oContext.getProperty("Category"),
                        Description: oContext.getProperty("Description"),
                        Quantity: quantity,  
                        Remarks: oContext.getProperty("Remarks"),
                        Status: status,
                        SubcomponentList: subComponents
                    };
                    updatedMaterials.push(updatedMaterial);
                }
            });
            console.log("updated data of all", updatedMaterials);        
            await this._submitData(updatedMaterials);
        },
        

        onMaterialSubmit: async function() {
            debugger
            let oTable = this.byId("materialTable");
            let aTableItems = oTable.getItems(); 
            let updatedMaterials = [];
            aTableItems.forEach(function(oItem) {
                let oContext = oItem.getBindingContext("materialData");
                let status = oContext.getProperty("Status");
                let quantity = oContext.getProperty("Quantity");
                let subComponents = oContext.getProperty("SubcomponentList");
                if (status === "Not Received") {
                    quantity = 0;
                    subComponents = subComponents.map(sub => ({
                        ...sub,
                        Quantity: 0
                    }));
                }
                let updatedMaterial = {
                    reqNo: oContext.getProperty("reqNo"),
                    MaterialCode: oContext.getProperty("MaterialCode"),
                    Category: oContext.getProperty("Category"),
                    Description: oContext.getProperty("Description"),
                    // Quantity: oContext.getProperty("Quantity"),
                    Quantity : status === "Not Received" ? 0 : parseInt(quantity),
                    Remarks : oContext.getProperty("Remarks"),
                    Status : oContext.getProperty("Status"),
                    SubcomponentList : subComponents
                };
                updatedMaterials.push(updatedMaterial);
            }); 
            console.log("updated data of all",updatedMaterials)
            this._submitData(updatedMaterials);
        },       

        _submitData: async function(updatedMaterials) {
            let oModel = this.getView().getModel();
            const materialData = JSON.parse(sessionStorage.getItem("materialData"));
            const servNo = materialData ? materialData.reqNo : null;
            let oBindingList = oModel.bindList("/serviceRequest");
            let aFilters = [new sap.ui.model.Filter("reqNo", sap.ui.model.FilterOperator.EQ, servNo)];
        
            try {
                let aContexts = await oBindingList.filter(aFilters).requestContexts();
                if (aContexts.length > 0) {
                    let oServiceRequestContext = aContexts[0];
                    oServiceRequestContext.setProperty("reqStatus", "Received at warehouse");
        
                    let oMaterialListBinding = oServiceRequestContext.getModel().bindList("Materials", oServiceRequestContext);
                    let aMaterialContexts = await oMaterialListBinding.requestContexts();
        
                    for (let oMaterial of updatedMaterials) {
                        let matchingMaterialContext = aMaterialContexts.find(
                            (context) => context.getProperty("MaterialCode") === oMaterial.MaterialCode
                        );
                        if (matchingMaterialContext) {
                            matchingMaterialContext.setProperty("Category", oMaterial.Category);
                            matchingMaterialContext.setProperty("Description", oMaterial.Description);
                            matchingMaterialContext.setProperty("Quantity", oMaterial.Quantity);
                            matchingMaterialContext.setProperty("MatRemarks", oMaterial.Remarks);        
                            matchingMaterialContext.setProperty("MatStatus", oMaterial.Status);        
                            if (oMaterial.SubcomponentList && oMaterial.SubcomponentList.length > 0) {
                                let oSubcomponentListBinding = matchingMaterialContext.getModel().bindList("SubcomponentList", matchingMaterialContext);
                                let aSubMaterialContexts = await oSubcomponentListBinding.requestContexts();        
                                for (let oSubMaterial of oMaterial.SubcomponentList) {
                                    let matchingSubMaterialContext = aSubMaterialContexts.find(
                                        (context) => context.getProperty("MaterialCode") === oSubMaterial.MaterialCode
                                    );        
                                    if (matchingSubMaterialContext) {
                                        matchingSubMaterialContext.setProperty("Category", oSubMaterial.Category);
                                        matchingSubMaterialContext.setProperty("Description", oSubMaterial.Description);
                                        matchingSubMaterialContext.setProperty("Quantity", oSubMaterial.Quantity);
                                    } else {
                                        console.error("No sub-material found for MaterialCode: " + oSubMaterial.MaterialCode);
                                    }
                                }
                            }
                        } else {
                            console.error("No material found for MaterialCode: " + oMaterial.MaterialCode);
                        }
                    }
                    if (oModel.hasPendingChanges()) {
                        await oModel.submitBatch("updateGroup");
                        sap.m.MessageToast.show("All materials and sub-materials updated successfully.");
                        setTimeout(() => {
                            const oRouter = this.getOwnerComponent().getRouter();
                            oRouter.navTo("RouteWarehouseMain")
                        }, 1000);
                    } else {
                        console.log("No pending changes detected");
                    }
                } else {
                    console.error("Service request not found for reqNo: " + servNo);
                }
            } catch (error) {
                console.error("Error updating materials and sub-materials:", error);
                sap.m.MessageToast.show("Error updating materials: " + error.message);
            }
        }
                
                

   });
});


