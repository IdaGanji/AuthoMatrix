sap.ui.define([
	"sap/ui/model/odata/v2/ODataModel"
], function (ODataModel) {
	"use strict";

	var oDataModel = new ODataModel({
		serviceUrl: "/sap/opu/odata/sap/ZPOA_AUTH_MATRIX_FI_SRV/",
		defaultUpdateMethod: "PUT",
		 useBatch: false
	});

	return {
	
		get: function (sEndpoint,aFilters){
			// if (oParam) {
			// 	var urlParameters = {
			// 		$expand: oParam.expand || "",
			// 		$filter: oParam.filter || ""
			// 	};			
			// }
            var finalFilters= aFilters || [];          
			
			return new Promise(function (resolve, reject){
				oDataModel.read(sEndpoint, {
					// urlParameters: urlParameters, 
                    filters: finalFilters ,
					success: function (result) {
						resolve(result);
					},
					error: function (err) {
						reject(err);
					} 
				});	
			});
		},
        create: function (data) {
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
        post: function (oData,aComment) {
           var aCommentChildData =aComment.map(function(obj){
               return {
                   "Comment":obj.comment ,
                   "CreatedBy":obj.user ,
                   "WFObjkey":obj.WFObjkey

               };
           }) ;
            var aChildData=[];
            oData.forEach(function(obj){
                aChildData.push({
                    "Role" : obj.Role || "",
                    "Roledescription" : obj.Roledescription || "",
                    "Roleowner" : obj.Roleowner || "",
                    "RoleownerName" : obj.RoleownerName || "",
                    "Maxamount" : obj.Maxamount || "",
                    "Startdate" : obj.Startdate || "",
                    "Enddate" : obj.Enddate || "",
                    "Status" : obj.Status || "",
                    "OrgRole":  obj.OrgRole || "",
                    "OrgRoleowner":  obj.OrgRoleowner || "",
                    "OrgStartdate":  obj.OrgStartdate || ""

                })

            })
            var dataToSend = {
                "MatrixHDToMatrixNav": aChildData || [],
                "Action":"SUBMIT",
                "MatrixHDToCommentsNav": aCommentChildData || []
            };
            var endpoint = "/POAAuthMatrixHDSet";
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
        }
	};
});