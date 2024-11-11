sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/m/MessageToast",
],
    function (Controller, MessageBox,JSONModel,Fragment, ODataModel, MessageToast) {
        "use strict";

        return Controller.extend("inventory.controller.MaterialInventoryRecord", {
            onInit: function () {
                let payload = { 
                    data  : [
                    {
                    SNo : 1,
                    Category:"",
                    Quantity: null,
                    MaterialCode: "",
                    Description:"",
                    SubcomponentList: []


                }]
            };
                let tempModel = new JSONModel({});
                tempModel.setData(payload);
                this.getView().setModel(tempModel,'tempModel');
                let x =  this.getView().getModel('tempModel');
                console.log(x);

            },
            onDeleteRow: function (oEvent) {
                // Get the table's model
                var oTable = this.byId("entryTypeTable");
                var oModel = oTable.getModel("tempModel");
                var aItems = oModel.getProperty("/data");
            
                // Get the selected row's binding context
                var oItem = oEvent.getSource().getParent();
                var oContext = oItem.getBindingContext("tempModel");
            
                // Get the index of the selected row
                var iIndex = oContext.getPath().split("/data/")[1];
            
                // Remove the selected item from the model array
                aItems.splice(iIndex, 1);
                  // Recalculate the SNo for each remaining row
                aItems.forEach(function(item, index) {
                 item.SNo = (index + 1).toString();  // Reassign SNo as a sequential string
              });
            
                // Update the model with the new data
                oModel.setProperty("/data", aItems);
            },
            onDeleteSubComponnentRow: function (oEvent) {
                // Get the subcomponent table and its model
                var oTable = oEvent.getSource().getParent();
                // getBindingContext('subcomponentModel');
                var oModel = oTable.getModel("subcomponentModel");
                var aItems = oModel.getProperty("/subData"); // Get the array of subcomponents
            
                // Get the selected row's binding context
                var oItem = oEvent.getSource().getParent();
                var oContext = oItem.getBindingContext("subcomponentModel");
            
                // Get the index of the selected row
                var iIndex = oContext.getPath().split("/subData/")[1];
            
                // Remove the selected item from the array
                aItems.splice(iIndex, 1);
            
                // Recalculate the SNo for each remaining row
                aItems.forEach(function (item, index) {
                    item.SNo = (index + 1).toString();  // Reassign SNo as a sequential string
                });
            
                // Update the model with the new data
                oModel.setProperty("/subData", aItems);
            },

            onOpenSubComponent: function (oEvent) {

                this.oSourceRow = oEvent.getSource().getBindingContext('tempModel');
                // taking refrence of tempModel row
                let SourceRowData = this.oSourceRow.getObject().SubcomponentList
                let subcomponentModel = new JSONModel();
                let subPayload = {
                    subData : [
                        {
                            SNo : 1,
                            Description:"",
                            Category : "",
                            MaterialCode : "",
                            Parent_MaterialCode : "",
                            Quantity : "",


                        }
                    ]
                }
                if( !SourceRowData  ){

                    subcomponentModel.setData(subPayload);
                }else {
                    subcomponentModel.setData({
                        subData : SourceRowData
                    });


                }
                this.getView().setModel(subcomponentModel, 'subcomponentModel')
                
                if (!this._subcomponentDialog) {
                    this._subcomponentDialog = sap.ui.xmlfragment("inventory.fragments.AddSubComponent", this);
                    this.getView().addDependent(this._subcomponentDialog);
                }
                this._subcomponentDialog.open();
            },

            subcomponentDialogClose: function () {
                this._subcomponentDialog.close();
            },


            // This function is to add new material Row

            onAddMaterial : function (){

                let oModel = this.getView().getModel('tempModel');
                let aData = oModel.getData().data;  // Assumed to be an array
            
                // Calculate the next SNo
                let iNextSNo = aData.length + 1;  // Increment based on array length
            
                // Create an empty row object with the next SNo
                let oNewRow = {
                    SNo: iNextSNo.toString(),  // Convert to string for consistency
                    Category: "",
                    Quantity: "",
                    MaterialCode: "",
                    Description: "",
                    SubcomponentList: []
                };
            
                // Push the new row into the data array
                aData.push(oNewRow);
            
                // Update the model with the new data
                oModel.setData( { data : aData });

            },

              //This function is to add empty Subcomponent Row

            onAddSubMaterial: function () {
                // Get the subcomponent model
                let oModel = this.getView().getModel("subcomponentModel");
            
                // Get the current data from the model
                let aSubData = oModel.getProperty("/subData") || []; // Fallback to empty array if undefined
            
                // Determine the next SNo
                let nextSNo = aSubData.length > 0 ? aSubData.length + 1 : 1;
            
                // Create a new empty subcomponent object
                let newSubComponent = {
                    SNo: nextSNo,
                    Description: "", // Empty for user input
                    MaterialCode: "", // Empty for user input
                    Category: "", // Empty for user input
                    Quantity: "" ,// Empty for user input
                    Parent_MaterialCode : ""
                };
            
                // Add the new subcomponent to the existing data
                aSubData.push(newSubComponent);
            
                // Update the model with the new data
                oModel.setProperty("/subData", aSubData);
            },

            showMaterialValueHelp: function (oEvent) {

                this._oInputField = oEvent.getSource().getBindingContext('tempModel');

                if (!this._MaterialDialog) {
                    this._MaterialDialog = sap.ui.xmlfragment(
                        "inventory.fragments.MaterialValueHelp",
                        this
                    );
                    this.getView().addDependent(this._MaterialDialog);
                }

                // Clear any existing filters on the SelectDialog
                this._MaterialDialog.open();
                if (this._MaterialDialog) {

                    this._MaterialDialog.getBinding("items").filter([]);
                }
            },

            showMaterialValueHelp2: function (oEvent) {

                this._oInputField = oEvent.getSource().getBindingContext('subcomponentModel');

                if (!this._MaterialDialog2) {
                    this._MaterialDialog2 = sap.ui.xmlfragment(
                        "inventory.fragments.SubcomponentValueHelp",
                        this
                    );
                    this.getView().addDependent(this._MaterialDialog2);
                }

                // Clear any existing filters on the SelectDialog
                this._MaterialDialog2.open();
                if (this._MaterialDialog2) {

                    this._MaterialDialog2.getBinding("items").filter([]);
                }
            },

            onGenerateCodePress: async function (oEvent) {
                let oView = this.getView();
                let reqDataArray = oView.getModel('tempModel').getData().data; // Assuming multiple materials
                let oModel = oView.getModel();
                let oBindList = oModel.bindList('/Material');
                let generatedCodes = []; // To store generated MaterialCodes
            
                if (!reqDataArray.length) {
                    MessageBox.warning("Please Add Some Material");
                    return;
                }
            
                // Helper function to create material and wait for completion
                const createMaterial = (reqData) => {

                    return new Promise((resolve, reject) => {
                        // Create material entry
                        if( reqData.SubcomponentList.length ){
                            reqData.SubcomponentList.forEach( subcomponent => subcomponent.Quantity = parseInt(subcomponent.Quantity) )
                        }
                        let payload =  {
                            Description: reqData.Description,
                            Category: reqData.Category,
                            MaterialCode: reqData.MaterialCode,
                            Status: "Active",
                            Quantity: parseInt(reqData.Quantity),
                            SubcomponentList: reqData.SubcomponentList
                        }
                        oBindList.create( payload , true);
            
                        // Attach the create completion handler
                        oBindList.attachCreateCompleted((p) => {
                            let p1 = p.getParameters();
                            let oContext = p1.context;
                            if (p1.success) {
                                let obj = oContext.getObject();
                                reqData.MaterialCode = obj.MaterialCode;  // Assign generated code to main material
                                resolve(obj.MaterialCode);  // Resolve the promise with the generated MaterialCode
                            } else {
                                reject(p1);  // Reject the promise if there's an error
                            }
                        });
                    });
                };
            
                // Process each material in the array sequentially
                for (let i = 0; i < reqDataArray.length; i++) {
                    let reqData = reqDataArray[i];

                    if( !reqData.Description && !reqData.Category && !reqData.Quantity ) {
                        MessageBox.warning("Please add Materials details to proceed");
                        return;
                    }
            
                    // Generate MaterialCode only if SubcomponentList is not empty and MaterialCode is empty
                    if (!reqData.MaterialCode && !reqData.SubcomponentList.length ) {
                        MessageBox.warning("Please Add Subcomponents or Select material from Value help");
                        return;
                    }
            
                    if (!reqData.MaterialCode && reqData.SubcomponentList && reqData.SubcomponentList.length > 0) {
                        // Remove SNo from subcomponents in SubcomponentList
                        reqData.SubcomponentList.forEach((x) => {
                            delete x.SNo;
                        });
            
                        try {
                            // Await for the material creation and get the generated MaterialCode
                            let generatedCode = await createMaterial(reqData);
                            generatedCodes.push(`${i+1}: ${generatedCode}`);  // Collect the generated codes
            
                        
                            // reqData.MaterialCode = generatedCode;
                            
                            reqData.SubcomponentList.forEach( x => x.Parent_MaterialCode = generatedCode.trim())
                        
            
                        } catch (error) {
                            console.log("Error creating material:", error);
                            MessageBox.error("Error generating MaterialCode. Please try again.");
                        }
                    }
                }
                this.getView().getModel('tempModel').refresh()
            
                // After processing all materials, show a success message with all generated codes
                if (generatedCodes.length > 0) {
                    generatedCodes.forEach(codePair => {
                        let [index, code] = codePair.split(':');  // Split the index and generated code
                        reqDataArray[index - 1].MaterialCode = code.trim();  // Assign the code back to the original material entry
                    });
            
                    // Refresh the tempModel with updated material codes
                    oView.getModel('tempModel').refresh();
                    console.table(generatedCodes);
                    if( generatedCodes.length  > 1){

                        MessageBox.success(`Generated Codes are - \n ${generatedCodes.join('\n')}`);
                    }else {
                        MessageBox.success(`Generated Code - \n ${generatedCodes.join('\n')}`);

                    }
                } else {
                    MessageBox.warning("No Material found for Code Generation");
                }
            },
            
            onSubmitPress: function (oEvent) {
                let oView = this.getView();
                let materialDataArray = oView.getModel('tempModel').getData().data; // Assuming multiple materials
                let unfilledMaterials = [];
                let validSubmission = true;
            
                // Check if any material is missing required details
                materialDataArray.forEach((materialData) => {
                    if (!materialData.Category || !materialData.Description || !materialData.Quantity) {
                        unfilledMaterials.push(materialData);
                        validSubmission = false;
                    }
                });
            
                if (unfilledMaterials.length > 0) {
                    MessageBox.warning("Please fill up Material Details for all materials");
                    return;
                }
            
                // Ensure that all materials have generated material codes
                let materialsWithoutCode = materialDataArray.filter(mat => !mat.MaterialCode);
                if (materialsWithoutCode.length > 0) {
                    MessageBox.warning("Please generate Material Codes for all materials with subcomponents");
                    return;
                }
            
                // Now proceed with submission
                let oBindList = oView.getModel().bindList('/serviceRequest');
                let requestMaterials = [];
            
                // Prepare the data for submission
                materialDataArray.forEach(materialData => {
                    // Create a shallow copy of the materialData object to avoid modifying the original tempModel
                    materialData.Quantity = parseInt( materialData.Quantity)
                    let copiedMaterialData = { ...materialData };  // or use Object.assign({}, materialData);
                    
                    // Remove unnecessary fields like SNo from submission
                    delete copiedMaterialData.SNo;

                    // assigning initially final material code same as Material code
                    copiedMaterialData.f_MaterialCode = copiedMaterialData.MaterialCode;
                    
                    // Remove SNo from subcomponent list if present
                    if (copiedMaterialData.SubcomponentList) {
                        copiedMaterialData.SubcomponentList.forEach(subcomponent => {
                            subcomponent.Quantity = parseInt(subcomponent.Quantity)
                             subcomponent.reqNo = 0;   // can not send null

                            delete subcomponent.SNo;
                        });
                    }
            
                    // Push the copied and cleaned data to the request payload
                    requestMaterials.push({
                        ...copiedMaterialData,
                        SubcomponentList: copiedMaterialData.SubcomponentList
                    });
                });
            
                // Submit the service request with all materials
                oBindList.create({
                    Materials: requestMaterials, // Array of materials with subcomponents
                    reqStatus : "Material Record Created",
                }, true);
            
                oBindList.attachCreateCompleted(p => {
                    let p1 = p.getParameters();
                    let oContext = p1.context;
                    if (p1.success) {
                        let obj = oContext.getObject();
                        console.log(obj);
                        sap.m.MessageBox.success(`Material Request No. ${obj.reqNo} has been created Successfully.`, {
                            title: "Success",  // Optional title
                            actions: [sap.m.MessageBox.Action.OK],  // OK button
                            onClose: function (oAction) {
                                if (oAction === sap.m.MessageBox.Action.OK) {
                                    let oModel = oView.getModel('tempModel');
                                    oModel.setData({data : [{
                                        SNo : 1,
                                        Category:"",
                                        Quantity: null,
                                        MaterialCode: "",
                                        Description:"",
                                        SubcomponentList: []
                                    }
                    ]});
                                    oModel.refresh();
                                }
                            }
                        });
                        
                        materialDataArray = [];
                        
                        // Refresh models after successful submission
                        oView.getModel().refresh();
                        
                    } else {
                        console.log(p1);
                    }
                });
            },
            
            showCatergoryValueHelp : function ( oEvent ) {

                this.oSource = oEvent.getSource().getBindingContext('tempModel');
                if (!this._CategoryDialog) {
                    this._CategoryDialog = sap.ui.xmlfragment(
                        "inventory.fragments.CategoryValueHelp",
                        this
                    );
                    this.getView().addDependent(this._CategoryDialog);
                }

                // Clear any existing filters on the SelectDialog
                this._CategoryDialog.open();
                if (this._CategoryDialog) {

                    this._CategoryDialog.getBinding("items").filter([]);
                }

            },

            onSaveRowSubComponentBtn : function ( oEvent ){

                let parentRowRef = this.oSourceRow;
                let subcomponentData = this.getView().getModel('subcomponentModel').getData();
                parentRowRef.getObject().SubcomponentList = subcomponentData.subData;

                console.log("kjhd  ", this.getView().getModel('tempModel').getData());
                console.log("sub data ", subcomponentData.subData);
                this._subcomponentDialog.close();
            },

            onClearRow: function (oEvent) {
                // Get the selected row context
                var oRowContext = oEvent.getSource().getBindingContext("tempModel");
            
                // Ensure context is available
                if (oRowContext) {
                    // Get the model data path
                    var sPath = oRowContext.getPath();
            
                    // Get the model
                    var oModel = oRowContext.getModel();
            
                    // Reset the specific fields (e.g., Description, Category, Quantity, MaterialCode)
                    oModel.setProperty(sPath + "/Description", "");
                    oModel.setProperty(sPath + "/Category", "");
                    oModel.setProperty(sPath + "/Quantity", "");
                    oModel.setProperty(sPath + "/MaterialCode", "");
                }
            },

            
            onMaterialValueHelpClose: async function (oEvent) {
            

                let oSelectedItem = oEvent.getParameter("selectedItem");

                let obj = oSelectedItem.getBindingContext().getObject();
            

                // Find the input field that triggered the value help (Description input)
                let rowContext = this._oInputField;
             

                let sPath = rowContext.getPath(); // Get the model path for the row

                // Update the model with the selected item's values (Description and MaterialCode)
                let oModel = this.getView().getModel('tempModel');
                oModel.setProperty(sPath + "/Description", obj.Description);
                oModel.setProperty(sPath + "/MaterialCode", obj.MaterialCode);
                oModel.setProperty(sPath + "/Category", obj.Category);

                if (!oSelectedItem) {
                    if (that._MaterialDialog) {

                        that._MaterialDialog.destroy();
                        that._MaterialDialog = null;
                    }
                    return;
                }
            },

            onSubcomponentValueHelpClose: async function (oEvent) {
            

                let oSelectedItem = oEvent.getParameter("selectedItem");

                let obj = oSelectedItem.getBindingContext().getObject();
            

                // Find the input field that triggered the value help (Description input)
                let rowContext = this._oInputField;
             

                let sPath = rowContext.getPath(); // Get the model path for the row

                // Update the model with the selected item's values (Description and MaterialCode)
                let oModel = this.getView().getModel('subcomponentModel');
                oModel.setProperty(sPath + "/Description", obj.Description);
                oModel.setProperty(sPath + "/MaterialCode", obj.MaterialCode);
                oModel.setProperty(sPath + "/Category", obj.Category);

                if (!oSelectedItem) {
                    if (that._MaterialDialog) {

                        that._MaterialDialog.destroy();
                        that._MaterialDialog = null;
                    }
                    return;
                }
            },
            onCategoryValueHelpClose : function (oEvent) {

                let oSelectedItem = oEvent.getParameter("selectedItem");

                let obj = oSelectedItem.getBindingContext().getObject();
            

                // // Find the input field that triggered the value help (Description input)
                let rowContext = this.oSource;
             

                let sPath = rowContext.getPath(); // Get the model path for the row

                // // Update the model with the selected item's values (Description and MaterialCode)
                let oModel = this.getView().getModel('tempModel');
               
                oModel.setProperty(sPath + "/Category", obj.Type);

                if (!oSelectedItem) {
                    if (that._MaterialDialog) {

                        that._MaterialDialog.destroy();
                        that._MaterialDialog = null;
                    }
                    return;
                }

            },

            onMaterialFilterSearch: function (oEvent) {

                let sQuery = oEvent.getParameter("value");

                let oSelectDialog = oEvent.getSource();
                let oBinding = oSelectDialog.getBinding("items");

                let aFilters = [];
                if (sQuery) {
                    // Create filters for both Description and MaterialCode fields
                    let oMaterialCodeFilter = new sap.ui.model.Filter("MaterialCode", sap.ui.model.FilterOperator.Contains, sQuery);
                    let oDescriptionFilter = new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, sQuery);

                    // Combine filters with OR condition
                    let oCombinedFilter = new sap.ui.model.Filter({
                        filters: [oMaterialCodeFilter, oDescriptionFilter],
                        and: false // OR condition
                    });

                    aFilters.push(oCombinedFilter);
                }

                // Apply filters
                oBinding.filter(aFilters);

               // Add a delay to ensure the filtering is done before checking the items
                setTimeout(() => {
                // Check if there are any items after filtering
                    let aItems =   oBinding.getCurrentContexts()
                    if (aItems && aItems.length === 0) {
                    oSelectDialog.setNoDataText("No data");
                    } else {
                    oSelectDialog.setNoDataText("Loading...");
                    }
                }, 200); // Small delay to allow filtering to be applied

            },

           
        });
    });
