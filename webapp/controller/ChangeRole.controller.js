sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("zfiauthomatrix.controller.RootView", {
            onInit: function () {
              
              var  oSettingsModel = this.getOwnerComponent().getModel('TableModel');
              console.log(oSettingsModel);

            }
        });
    });
