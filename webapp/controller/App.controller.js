sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "zfiauthomatrix/utils/service",
        "sap/ui/model/json/JSONModel",
        "zfiauthomatrix/utils/errorHandler",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "zfiauthomatrix/utils/formatter",
        "sap/ui/core/format/DateFormat"
    ],
    function(Controller,service,JSONModel,errorHandler,MessageBox,Fragment,Filter,FilterOperator,formatter,DateFormat) {
      "use strict";
  
      return Controller.extend("zfiauthomatrix.controller.App", {
        formatter: formatter,          
        onInit() {
            this.initFilterModel();
            this.setColomnsModel();
           // this.getTableData();
            this.setNewRoleData();
            this.getCurrencyData();

        },
        getTableData:function(){
            service.get("/POAAuthMatrixSet").then(
                function(oData) {
                     this.setJSONModel(oData, "mainModel");
                }.bind(this)).then(undefined,
                function(oError) {
        
                    this.showErrorMessage(oError);
                 
                }.bind(this));	
        },
        setNewRoleData:function(){
            var newData = {
				Role: "",
				RoleDescription: "",
				Amount:"",
                Currency:""
			};
            this.setJSONModel(newData,"newRole");

        },
        getCurrencyData:function(){
            service.get("/Z_I_POACurrency").then(
                function(oData) {
                     this.setJSONModel(oData, "currencyModel");
                }.bind(this)).then(undefined,
                function(oError) {
        
                    this.showErrorMessage(oError);
                 
                }.bind(this));

        },
        buildFilter:function(){
            var filterModel = this.getView().getModel("filterModel").getData();

            var Role=filterModel.role;
            var RoleOwner=filterModel.owner;
            var Status = filterModel.status; 
            var arrayFilter = [];

            if (Role) {
                arrayFilter.push(new Filter({
                       path: "Role",
                       operator: FilterOperator.EQ,
                       value1: Role,
                      
               }));
            }

            if (RoleOwner) {
                arrayFilter.push(new Filter({
                       path: "Roleowner",
                       operator: FilterOperator.EQ,
                       value1: RoleOwner,
                      
               }));
            }
            
            if (Status) {
                arrayFilter.push(new Filter({
                       path: "Status",
                       operator: FilterOperator.EQ,
                       value1: Status,
                       
               }));
            }
            
            return arrayFilter;
        },
        initFilterModel:function(){
			var filter={
				role:[],
                owner:[],
                status:""
			};
            var oModel = new JSONModel();
            oModel.setData(filter);
            oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
            return this.getView().setModel(oModel, "filterModel");
			
		},
        setJSONModel: function (oData, sName) {
            var oModel = new JSONModel();
            oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
            oModel.setData(oData);
            return this.getView().setModel(oModel, sName);
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
        setColomnsModel:function(){
            var oColumnsR={
               "cols": [
                   {
                       "label": "Role",
                       "template": "Role",
                       "width": "15rem"
                   
                   },
                   {
                       "label": "Role Description",
                       "template": "Roledescription"
                   }
               ]
           };
           this.oColModel = new JSONModel(oColumnsR);
           var oColumnsO={
            "cols": [
                {
                    "label": "User Name",
                    "template": "Roleowner",
                    "width": "15rem"
                
                },
                {
                    "label": "Full Name",
                    "template": "RoleownerName"
                }
            ]
        };
        this.oColumnModel = new JSONModel(oColumnsO);
           },

    onRoleValueHelpRequest: function() {
        var aCols = this.oColModel.getData().cols,
         oModel=this.getView().getModel("mainModel"),
         oMultiInput=this.getView().byId("roleInput");

        Fragment.load({
            name: "zfiauthomatrix.view.RoleValueHelpDialog",
            controller:this
        }).then(function(oValueHelpDialog) {
            this._RoleValueHelpDialog = oValueHelpDialog;
            this.getView().addDependent(this._RoleValueHelpDialog);

            this._RoleValueHelpDialog.getTableAsync().then(function (oTable) {
                oTable.setModel(oModel);
                oTable.setModel(this.oColModel, "columns");

                if (oTable.bindRows) {
                    oTable.bindAggregation("rows", "/results");
                }

                if (oTable.bindItems) {
                    oTable.bindAggregation("items", "/results", function () {
                        return new ColumnListItem({
                            cells: aCols.map(function (column) {
                                return new Label({ text: "{" + column.template + "}" });
                            })
                        });
                    });
                }
                this._RoleValueHelpDialog.update();
            }.bind(this));

            this._RoleValueHelpDialog.setTokens(oMultiInput.getTokens());
            this._RoleValueHelpDialog.open();
        }.bind(this));
    },

    onRoleValueHelpOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        var oModel= this.getView().getModel("filterModel"),
        oData= oModel.getData();
        oData.role=[];
         aTokens.forEach(function(oToken){
            oData.role.push({key:oToken.getKey(),text:oToken.getText()});
    
        });
        oModel.setData(oData);
        
        this._RoleValueHelpDialog.close();
    },
    

    onRoleValueHelpCancelPress: function () {
        this._RoleValueHelpDialog.close();
    },

    onRoleValueHelpAfterClose: function () {
        this._RoleValueHelpDialog.destroy();
    },
    onOwnerValueHelpRequest: function() {
        var aCols = this.oColumnModel.getData().cols,
         oModel=this.getView().getModel("mainModel"),
         oMultiInput=this.getView().byId("ownerSelect");

      Fragment.load({
            name: "zfiauthomatrix.view.OwnerValueHelpDialog",
            controller:this
        }).then(function(oValueHelpDialog) {
            this._OwnerValueHelpDialog = oValueHelpDialog;
            this.getView().addDependent(this._OwnerValueHelpDialog);

            this._OwnerValueHelpDialog.getTableAsync().then(function (oTable) {
                oTable.setModel(oModel);
                oTable.setModel(this.oColumnModel, "columns");

                if (oTable.bindRows) {
                    oTable.bindAggregation("rows", "/results");
                }

                if (oTable.bindItems) {
                    oTable.bindAggregation("items", "/results", function () {
                        return new ColumnListItem({
                            cells: aCols.map(function (column) {
                                return new Label({ text: "{" + column.template + "}" });
                            })
                        });
                    });
                }
                this._OwnerValueHelpDialog.update();
            }.bind(this));

            this._OwnerValueHelpDialog.setTokens(oMultiInput.getTokens());
            this._OwnerValueHelpDialog.open();
        }.bind(this));
    },

    onOwnerValueHelpOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        var oModel= this.getView().getModel("filterModel"),
        oData= oModel.getData();
        oData.owner=[];
         aTokens.forEach(function(oToken){
            oData.owner.push({key:oToken.getKey()});
    
        });
        oModel.setData(oData);
        this._OwnerValueHelpDialog.close();
    },
    

    onOwnerValueHelpCancelPress: function () {
        this._OwnerValueHelpDialog.close();
    },

    onOwnerValueHelpAfterClose: function () {
        this._OwnerValueHelpDialog.destroy();
    },
    
    onPressNewRole:function(){
    Fragment.load({
            name: "zfiauthomatrix.view.addNewEmployeeDialog",
            controller:this
        }).then(function(oValueHelpDialog) {
            this._addEmployeeDialog = oValueHelpDialog;
            this.getView().addDependent(this._addEmployeeDialog);
            this._addEmployeeDialog.open();
        }.bind(this));
        
    },
    onEmployeeDialogClose:function(){
        this._addEmployeeDialog.close();
     },
     onAfterClose:function(){
        this._addEmployeeDialog.destroy();         
     },
     onAddNewEmployee:function(){
        var role    = this.getView().getModel("newRole").getProperty("/Role");
        var roleDescription   = this.getView().getModel("newRole").getProperty("/RoleDescription");
        var amount    = this.getView().getModel("newRole").getProperty("/Amount");
        var currency     = this.getView().getModel("newRole").getProperty("/Currency");

        var dataToSend = {
            role: role,               
            roleDescription: roleDescription,
            amount: amount,
            currency: currency
        };
        //  this.setBusy("newEmployeeDialog", true);

       service.post(dataToSend).then(function (oData) {
       //  this.setBusy("newEmployeeDialog", false);
       //  this.onEmployeeDialogClose(sFragment);
       //  this.setBusy("mainPageTable", true);
      
         
    //    service.get("/POAAuthMatrixSet",{
    //          expand: "POAAuthHD2MatrixSet"
    //      }).then(function (data) {
    //          this.setJSONModel(data, "mainModel");
    //          //this.setBusy("mainPageTable", false);
    //      }.bind(this)).then(undefined, function(oError) {
    //          this.showErrorMessage(oError);
    //          //this.setBusy("mainPageTable", false);
    //      }.bind(this));
     
     }.bind(this)).then(undefined, function(oError) {
         this.showErrorMessage(oError);
        // this.setBusy("newEmployeeDialog", false);
     }.bind(this));
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
     _parseDate: function (oDate) {
        var oFormat = DateFormat.getDateInstance({
            pattern: "yyyy-MM-ddTHH:mm:ss"
        });
        return oFormat.format(oDate);
    },
        
     onCurrencyValueHelp:function(){
        var oView=this.getView();         
        if (!this._currencyDialog) {
            this._currencyDialog = Fragment.load({
                name: "zfiauthomatrix.view.CurrencyValueHelpDialog",
                controller: this
            }).then(function (oDialog){
                oDialog.setModel(oView.getModel("newRole"),"roleDataModel");
                oView.addDependent(oDialog);
                return oDialog;
            });
        };

        this._currencyDialog.then(function(oDialog){
           // this.configValueHelpDialog();
            oDialog.open();
        }.bind(this));
     },
     onSearchCurrencyValueHelp:function(oEvent){
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter("Currency", FilterOperator.Contains, sValue);
        var oBinding = oEvent.getParameter("itemsBinding");
        oBinding.filter([oFilter]);
     },
    //  configValueHelpDialog: function () {
    //     var sInputValue = this.getView().byId("productInput").getValue(),
    //         oModel = this.getView().getModel(),
    //         aProducts = oModel.getProperty("/ProductCollection");

    //     aProducts.forEach(function (oProduct) {
    //         oProduct.selected = (oProduct.Name === sInputValue);
    //     });
    //     oModel.setProperty("/ProductCollection", aProducts);
    // },
     onCurrencyDialogConfirm:function(oEvent){
        var oSelectedItem = oEvent.getParameter("selectedItem");
        var oInput = sap.ui.getCore().byId("currencyInput");

    if (!oSelectedItem) {
        oInput.resetProperty("value");
        return;
    }

    oInput.setValue(oSelectedItem.getTitle());

     },
    
    onSearch:function(oEvent){
        var filterModel = this.getView().getModel("filterModel").getData();
        var oTable = this.getView().byId("idTable");
	    var oBinding = oTable.getBinding("items");
        var Role=filterModel.role;
        var RoleOwner=filterModel.owner;
        var Status = filterModel.status; 
        var arrayFilter = [];
        let roleFilter,
        roleOwnwerFilter;
        let arrayRoleFilter = [],
        arrayRoleOwnerFilter= [];
        if(Role.length>0){
            Role.forEach(function (oItem){
                arrayRoleFilter.push(new Filter({
                         path: 'Role',
                        operator: FilterOperator.EQ,
                         value1: oItem.key
                      }));
            });

            roleFilter= new Filter({
                filters:arrayRoleFilter,
                and: false
                });
                
            arrayFilter.push(roleFilter);

        };
        
        if(RoleOwner.length>0){
            RoleOwner.forEach(function (oItem){
                arrayRoleOwnerFilter.push(new Filter({
                        path: 'Roleowner',
                        operator: FilterOperator.EQ,
                        value1: oItem.key
                      }));
            });

            roleOwnwerFilter= new Filter({
                filters:arrayRoleOwnerFilter,
                and: false
                });
            
            arrayFilter.push(roleOwnwerFilter);

        };
        

        if (Status) {
            arrayFilter.push(new Filter({
                   path: "Status",
                   operator: FilterOperator.EQ,
                   value1: Status,
                   
           }));
        };
    
       oBinding.filter(new Filter({
        filters:arrayFilter,
        and: true
      }));
     },
     onClear:function(oEvent){
    //   var aSelectionSet= oEvent.getParameters("selectionSet").selectionSet;
    //   console.log(aSelectionSet);
    //   aSelectionSet.forEach(function(filter){
    //     var sId=filter.getId();
    //     var oInput=  sap.ui.getCore().byId(sId);
    //       if(sId!==){
            
    //         var sValue=oInput.getValue();
    //         console.log(sValue);}
       
    //   })

     },
     onListItemPressed:function(oEvent){
      var oModel= this.getView().getModel("mainModel");
      console.log(oModel);
     }
     ,
            onPressEdit:function(){
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteCreateView");
            },

     

    
      });
    }
  );
  