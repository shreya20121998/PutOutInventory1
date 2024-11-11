sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/m/MessageToast","sap/ui/core/Fragment","sap/ui/core/ValueState"],function(e,t,n,a,i){"use strict";var o=0;return e.extend("inventory.controller.Inspection",{onInit:function(){let e={startDate:"",endDate:""};let n=new t(e);this.getView().setModel(n,"dateModel");console.log(n,"dateModel");var a=new t;this.getView().setModel(a,"materialModel");let i=this.getOwnerComponent().getModel();let o=i.bindList("/rqMaterial");o.requestContexts(0,Infinity).then(e=>{var t=e.map(e=>{let t=e.getObject();t.OriginalQuantity=t.Quantity;return t});a.setData({Materials:t});console.log("Materials:",t)}).catch(e=>{console.error("Error fetching material data:",e)});this._onDateFilter();const r=this.getOwnerComponent().getRouter();r.getRoute("RouteInspection").attachPatternMatched(this.onRouteMatched,this)},onRouteMatched:function(){this.byId("myDatePicker").setValue("");this.byId("myDatePicker1").setValue("");this.byId("CharteringRqNo").setValue("");this.byId("vendorDetailsLayout").setVisible(false)},removeCommas:function(e){if(e){return e.toString().replace(/,/g,"")}return e},_onDateFilter:async function(){let e=this.getView().getModel("dateModel").getData();let n=new Date(e.startDate);let a=new Date(e.endDate);a.setHours(23,59,59,999);let i=this.getOwnerComponent().getModel();let o=i.bindList("/serviceRequest");let r=await o.requestContexts(0,Infinity);let s=r.map(e=>e.getObject());let l=s.filter(e=>{let t=new Date(e.createdAt);return t>=n&&t<=a});if(l.length>0){this.byId("vendorDetailsLayout").setVisible(true)}let c=new t(l);this.getView().setModel(c,"materialData")},onMaterialRowSelect:function(e){const t=e.getSource().getBindingContext("materialData");const n=t.getObject().reqNo;console.log("row data",n);sessionStorage.setItem("materialData",JSON.stringify(n));const a=this.getOwnerComponent().getRouter();a.navTo("RouteInspectionTable")},formatDate:function(e){if(!e)return"";let t=new Date(e);let n=String(t.getDate()).padStart(2,"0");let a=String(t.getMonth()+1).padStart(2,"0");let i=t.getFullYear();return`${n}-${a}-${i}`},formatTime:function(e){if(!e)return"";let t=new Date(e);let n=String(t.getHours()).padStart(2,"0");let a=String(t.getMinutes()).padStart(2,"0");return`${n}:${a}:00`},getBindServices:async function(e){try{let n=parseInt(e.replace(/,/g,""));let a=this.getOwnerComponent().getModel();let i=a.bindList("/serviceRequest",undefined,undefined,undefined,undefined);let o=await i.requestContexts(0,Infinity);let r=o.map(e=>e.getObject());let s=r.filter(e=>e.reqNo===n);let l=new t(s);this.getView().setModel(l,"materialData")}catch(e){console.error("Error fetching bid details:",e.message)}},statusFormatter:function(e){switch(e){case"Open":return i.Warning;case"CLOSED":return i.Error;default:return i.Information}},_onStatusTypeChange:function(e){var t=e.getSource();var n=t.getSelectedItem().getText();console.log("selected item",n);if(n==="Partial"){this.onPartialBtnPress(t)}},onServiceRequestNumber:function(e){const t=this.getView();this._oInputField=e.getSource();if(!this.requestNoFragment){a.load({id:t.getId(),name:"inventory.fragments.SecurityValueHelp",controller:this}).then(e=>{this.requestNoFragment=e;t.addDependent(this.requestNoFragment);this.requestNoFragment.open()})}else{this.requestNoFragment.open()}},onValueHelpClosevoy:async function(e){const t=e.getParameter("selectedItem");if(t){const e=t.getTitle();this._oInputField.setValue(e);if(e){this.byId("vendorDetailsLayout").setVisible(true)}this.serviceNo=e;try{await this.getBindServices(e)}catch(e){console.log("Selected item is not found")}}},onSaveCheckInData:function(){let e=this.getView().getModel();let t=12;let n=e.bindList("/ReqNoSchema");let a=new sap.ui.model.Filter("reqNo",sap.ui.model.FilterOperator.EQ,t);n.filter(a).requestContexts().then(function(e){e[0].setProperty("reqStatus","its done")})},_onSaveCheckInData:function(){let e=this.getView().getModel();let t=12;let n=e.bindList("/ReqNoSchema");let a=new sap.ui.model.Filter("reqNo",sap.ui.model.FilterOperator.EQ,t);n.filter(a).requestContexts().then(function(t){if(t.length>0){let n=t[0];n.setProperty("reqStatus","its done");let a=n.getPath()+"/Materials/0";n.setProperty(a+"/Description","Updated Material 401 Description");n.setProperty(a+"/Quantity",250);n.setProperty(a+"/Status","Completed");e.submitBatch("batchRequestGroup").then(function(){console.log("Material data successfully updated.")}).catch(function(e){console.error("Error submitting batch:",e)})}}).catch(function(e){console.error("Error fetching contexts:",e)})},onSaveCheckInData:async function(){try{let e=this.getView().getModel();let t=e.bindList("/ReqNoSchema");let a=new sap.ui.model.Filter("reqNo",sap.ui.model.FilterOperator.EQ,12);t.filter(a);let i=await t.requestContexts(0,Infinity);if(i.length>0){let t=i[0];t.getModel().setProperty(t.getPath()+"/Materials/0/Description","Updated Description");t.getModel().setProperty(t.getPath()+"/Materials/0/Quantity",999);t.getModel().setProperty(t.getPath()+"/Materials/0/Status","Updated Status");await e.submitBatch("batchRequestGroup");n.show("Hardcoded data successfully updated.")}else{console.warn("No matching context found for the given reqNo.")}}catch(e){console.error("Error during hardcoded data update:",e);n.show("Error updating hardcoded data.")}},onPartialBtnPress:function(e){var t=e.getParent();var n=t.getCells()[1];var a=t.getCells()[3];if(n instanceof sap.m.Input){n.setEditable(true)}if(a instanceof sap.m.Input){a.setEditable(true)}},expandTableField:function(){let e=a.byId(this.getView().getId(),"expandSubTable");let t=e.getItems();t.forEach(function(e){let t=e.getCells()[1];let n=e.getCells()[3];if(t instanceof sap.m.Input){t.setEditable(true)}if(n instanceof sap.m.Input){n.setEditable(true)}})},_onCancelCheckinSubFragment:function(){this.expandCheckinDataFragment.close()},onExit:function(){},onSubmit:function(){n.show("Submit button clicked")}})});
//# sourceMappingURL=Inspection.controller.js.map