sap.ui.define([
	"sap/ui/model/odata/v2/ODataModel"
], function (ODataModel) {
	"use strict";

	var oDataModel = new ODataModel({
		serviceUrl: "/sap/opu/odata/sap/ZPOA_AUTH_MATRIX_FI_SRV/",
		defaultUpdateMethod: "PUT",
		 useBatch: true
	});

	return {
	
		get: function (sEndpoint,oParam){
			if (oParam) {
				var urlParameters = {
					$expand: oParam.expand || "",
					$filter: oParam.filter || ""
				};			
			}
			
			return new Promise(function (resolve, reject){
				oDataModel.read(sEndpoint, {
					urlParameters: urlParameters, 
					success: function (result) {
						resolve(result);
					},
					error: function (err) {
						reject(err);
					} 
				});	
			});
		},
        post: function (data) {
            var dataToSend = {
                "Role": data.role,
                "RoleDescription": data.roleDescription,
                "MaximumAmount": data.amount,
                "Currency": data.currency
            };
            var endpoint = "/Z_I_POARole";
            return new Promise(function (resolve, reject) {
                oDataModel.create(endpoint, dataToSend, {
                    success: function (result) {
                        resolve(result);
                    },
                    error: function (err) {
                        reject(err);
                    } 
                });	
            });
        },
	};
});