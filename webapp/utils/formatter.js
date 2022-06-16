sap.ui.define([], function () {
	"use strict";
	return {
		statusText: function (sStatus) {
			var resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			switch (sStatus) {
				case "ACT":
					return resourceBundle.getText("act");
				case "DEL":
					return resourceBundle.getText("del");
				case "PEN":
					return resourceBundle.getText("pen");
				default:
					return sStatus;
			}
		},
        statusColor: function (sStatus) {
			switch (sStatus) {
				case "ACT":
					return "Success";
				case "DEL":
					return "Error";
				case "PEN":
					return "Warning";
				default:
					return sStatus;
			}
		},
        statusIcon: function (sStatus) {
			switch (sStatus) {
				case "ACT":
					return "sap-icon://sys-enter-2";
				case "DEL":
					return "sap-icon://error";
				case "PEN":
					return "sap-icon://pending";
				default:
					return sStatus;
			}
		}
	};
});