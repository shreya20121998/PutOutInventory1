sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(BaseController) {
      "use strict";
  
      return BaseController.extend("inventory.controller.InventoryMain", {
        onInit: function() {
        },
        onMaterialInventoryRecord: function(){
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteMaterialInventoryRecord")
        },
        onSecurityGateIn:function(){
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteWarehouseMain");
        },
        onInspection: function(){
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteInspection")
        },
        onDashboard: function(){
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteDashboard")
        },
      });
    }
  );
  