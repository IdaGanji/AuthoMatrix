sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/core/format/DateFormat",
    "zfiauthomatrix/utils/formatter",
    "sap/ui/model/json/JSONModel",
    "zfiauthomatrix/utils/service",
    "zfiauthomatrix/utils/errorHandler",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/type/DateTime"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,Fragment,DateFormat,formatter,JSONModel,service,errorHandler,MessageBox,UIComponent,MessageToast,Filter,FilterOperator,DateTime) {
        "use strict";

        return Controller.extend("zfiauthomatrix.controller.RootView", {
            formatter: formatter,
            onInit: function () {

                var oRouter = this.getRouter();
			    oRouter.getRoute("RouteCreateView").attachMatched(this._onRouteMatched, this);
                this.initOwnerInputModel();
                this.initCommentModel();
                this.getUserDetails();

            },
            initOwnerInputModel:function(){
                var oView= this.getView();
                var oData= {
                    ownerInputValue: ""
                };
                var oModel= new JSONModel();
                oModel.setData(oData);
                oView.setModel(oModel,"ownerInputModel"); 
            },
            initCommentModel:function(){
                var oView= this.getView();
                var oData= {
                    EntryCollection : []
                };
                var oModel= new JSONModel();
                oModel.setData(oData);
                oView.setModel(oModel,"commentModel"); 
               
            },

            initModel:function(){
             var oView= this.getView(); 
             var oModel= this.getOwnerComponent().getModel("mainModel");
             var arrData= oModel.getData().results;
             var arrChangeData= [];
             arrData.forEach(function(obj){
                 if(obj.Selected===true){
                    arrChangeData.push(obj);
                 }

             });

             var oChangeDataModel = new JSONModel();
             oChangeDataModel.setData(arrChangeData);
             oView.setModel(oChangeDataModel, "changeModel");
             
            },
            getUserInfoService: function() {
                return new Promise(resolve => sap.ui.require([
                  "sap/ushell/library"
                ], oSapUshellLib => {
                  const oContainer = oSapUshellLib.Container;
                  const pService = oContainer.getServiceAsync("UserInfo"); 
                  resolve(pService);
                }));
              },
              getUserDetails: async function() {
                const oUserInfo = await this.getUserInfoService();
                const sLoggedUsed = oUserInfo.getFullName(); 
                this._User = sLoggedUsed;
                
              },
            
            
            getRouter : function () {
                return UIComponent.getRouterFor(this);
            },
            _onRouteMatched:function(){
                this.initModel(); 
            },
            onValueHelpRequest:function(oEvent){
                var oView= this.getView();
                var sPath= oEvent.getSource().getBindingInfo("value").binding.getContext().getPath();
                this._toBeUpdated= oView.getModel("changeModel").getProperty(sPath);
                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        name: "zfiauthomatrix.view.SelectDialog",
                        controller: this
                    }).then(function (oDialog){
                        oView.addDependent(oDialog);                        
                        return oDialog;
                    });
                }
    
                this._pDialog.then(function(oDialog){
                    oDialog.open();
                }.bind(this));

            },
            onSelectDialogSearch:function(oEvent){
            var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("FullName", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);

            },
            onSelectDialogClose:function(oEvent){
                
             var oSelectedItem = oEvent.getParameter("selectedItem");
             var oView= this.getView(),
             oModel= oView.getModel("changeModel");

             this._toBeUpdated.Roleowner= oSelectedItem.getTitle();
             this._toBeUpdated.RoleownerName= oSelectedItem.getDescription();
             oModel.refresh();             


            
		},
        onChangeValue:function(oEvent){
           var oControl= oEvent.getSource();
           console.log(oControl);
           var sValue= oEvent.getParameter("value");
           console.log(sValue);
        },
        onItemsSelected:function(oEvent){
           var oCtr= oEvent.getParameters("listItem");
           console.log(oCtr);

        },
            setBusy: function(sId, busy) {
                if (this.getView().byId(sId)) {
                    this.getView().byId(sId).setBusyIndicatorDelay(0);
                    this.getView().byId(sId).setBusy(busy);
                } else if (sap.ui.getCore().byId(sId)) {
                    sap.ui.getCore().byId(sId).setBusyIndicatorDelay(0);
                    sap.ui.getCore().byId(sId).setBusy(busy);
                }
            },
            emptyTable:function(){
                var oModel= this.getView().getModel("mainModel");
                var oData= oModel.getData();
                var oResults= oData.results;
                oResults.forEach(function(oItem){
                    if(oItem.Selected===true){
                        oItem.Selected=false;

                    }
                });
                oModel.setData(oData);

            },
            
     _parseDate: function (oDate) {
        var oFormat = DateFormat.getDateInstance({
            pattern: "yyyy-MM-ddTHH:mm:ss"
        });
        return oFormat.format(oDate);
    },
            
            
            rebindTable: function(sPath,oTemplate, sKeyboardMode) {

            },
            onPressSubmit:function(){
                var oRouter= this.getRouter();
                var oTable=this.getView().byId("idChangeTable") ;
                var aTableItems = oTable.getAggregation("items");
                var aCommentsModel=this.getView().getModel("commentModel")
                var aComments= aCommentsModel.getData().EntryCollection;
                var oNoData= {
                    EntryCollection : []
                };
                var aTableRows = [];
                aTableItems.forEach(function(row){
                    var rowCell=row.getAggregation("cells");
                    aTableRows.push(rowCell);
                });
                var aDataToSend=[];
                aTableRows.forEach(function(rowArray){
                    aDataToSend.push(
                        {
                            Role : rowArray[0].getProperty("text"),
                            Roledescription : rowArray[1].getProperty("value"),
                            Roleowner : rowArray[2].getProperty("value"),
                            RoleownerName : rowArray[3].getProperty("value"),
                            Maxamount : rowArray[4].getProperty("value"),
                            Startdate : new Date(rowArray[5].getProperty("dateValue")),
                            Enddate : new Date(rowArray[6].getProperty("dateValue")),
                            OrgRole : rowArray[9].getProperty("text"),
                            OrgRoleowner : rowArray[10].getProperty("text"),
                            OrgStartdate : new Date(rowArray[11].getProperty("text")) 

                        }
                    );

                });

                
                service.post(aDataToSend,aComments).then(function (oData) {
                         this.setBusy("idChangeTable", true);
                         var msg = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("messageForChangeRole");
                         MessageToast.show(msg);
                         this.setBusy("idChangeTable", false);
                         var navFunction= function(){
                            oRouter.navTo("RouteRootView");

                        };
                        window.setTimeout(navFunction,2000);
                        this.emptyTable();
                        aCommentsModel.setData(oNoData);
                         
                      
                     }.bind(this)).then(undefined, function(oError) {

                        this.showErrorMessage(oError);

                     }.bind(this));

                

     
            },
            showErrorMessage: function(oError) {
                var errorDetails = errorHandler.parseError(oError);
                
                MessageBox.error(errorDetails.message, {
                    icon:		MessageBox.Icon.ERROR,
                     title:		this.geti18nString("error"),
                    details:	errorDetails.details,
                    actions:	MessageBox.Action.CLOSE
                });
            },
            geti18nString: function(sKey, aArgs) {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
            },
            emptyTable:function(){
                var oView= this.getView();
                var oModel= this.getOwnerComponent().getModel("mainModel");
                oModel.getData().results.forEach(function(line){
                    if(line.Selected===true){
                        line.Selected=false;
                    }

                });
                oModel.refresh();
            },
            onDuplicatePress:function(oEvent){
                var oView= this.getView();
                var oModel= oView.getModel("changeModel");
                var aData= oModel.getData();
                var oBindingContext= oEvent.getSource().oPropagatedProperties.oBindingContexts;
                var sChosenPath= oBindingContext.changeModel.getPath();
                var dataToBeDuplicated= oModel.getProperty(sChosenPath);
                var duplicatedLineData= {};
                var oInput= this.getView().byId("ownerSelectInput");
                oInput.setEditable(true);
                duplicatedLineData.Roleowner="";
                duplicatedLineData.Role= dataToBeDuplicated.Role;
                duplicatedLineData.Roledescription= dataToBeDuplicated.Roledescription;
                duplicatedLineData.Maxamount= dataToBeDuplicated.Maxamount;
                duplicatedLineData.OrgRole= dataToBeDuplicated.OrgRole;
                duplicatedLineData.OrgRoleowner= dataToBeDuplicated.OrgRoleowner;
                duplicatedLineData.OrgStartdate= dataToBeDuplicated.OrgStartdate;
                duplicatedLineData.RoleownerName="";
                duplicatedLineData.Startdate= new Date();
                duplicatedLineData.Enddate= new Date('9999-12-30T03:24:00');
                duplicatedLineData.Status="PEN";
                duplicatedLineData.__metadata="yes";
                aData.push(duplicatedLineData);
                oModel.setData(aData);
                oModel.refresh();
            },
            onPost: function(oEvent) {
                // create new entry
                var sValue = oEvent.getParameter("value");
                var oEntry = {
                    comment: sValue,
                    user: this._User,
                    date: new Date().toLocaleString('en-GB'),
                    WFObjkey:""
                };
    
                // update model
                var oModel = this.getView().getModel("commentModel");
                var aEntries = oModel.getData().EntryCollection;
                aEntries.unshift(oEntry);
                oModel.setData({
                    EntryCollection: aEntries
                });
                oModel.refresh();
                
            },
    

        });
    });
