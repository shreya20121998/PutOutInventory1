sap.ui.define(["sap/ui/core/mvc/Controller"],function(o){"use strict";return o.extend("config.controller.ConfigDashboard",{onInit:function(){},onPressSloc:function(){const o=this.getOwnerComponent().getRouter();o.navTo("RouteLocation")},onPressStatus:function(){const o=this.getOwnerComponent().getRouter();o.navTo("RouteStatus")},onPressMGroup:function(){const o=this.getOwnerComponent().getRouter();o.navTo("RouteGroup")}})});
//# sourceMappingURL=ConfigDashboard.controller.js.map