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
        "sap/ui/core/format/DateFormat",
        "sap/m/MessageToast",
        "sap/m/SearchField"
    ],
    function(Controller,service,JSONModel,errorHandler,MessageBox,Fragment,Filter,FilterOperator,formatter,DateFormat,MessageToast,SearchField) {
      "use strict";
  
      return Controller.extend("zfiauthomatrix.controller.App", {
        formatter: formatter,          
        onInit() {
            this.initFilterModel();
            this.setColomnsModel();
            this.setNewRoleData();
            this.getRoleValueData();
            this.getOwnerValueData();
        },
        getTableData:function(aFilters){
            service.get("/POAAuthMatrixSet",aFilters).then(
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
                Currency:"USD"
			};
            this.setJSONModel(newData,"newRole");

        },
        getRoleValueData:function(){
            service.get("/Z_I_POARole").then(
                function(oData) {
                     this.setFilterJSONModel(oData, "RoleValueHelpModel");
                }.bind(this)).then(undefined,
                function(oError) {
        
                    this.showErrorMessage(oError);
                 
                }.bind(this));

        },
        getOwnerValueData:function(){
            service.get("/RoleOwnersVH").then(
                function(oData) {
                     this.setJSONModel(oData, "OwnerValueHelpModel");
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
            return this.getOwnerComponent().setModel(oModel, sName);
        },
        setFilterJSONModel: function (oData, sName) {
            var oModel = new JSONModel();
            oModel.setData(oData);
            return this.getView().setModel(oModel, sName);
        },
        showErrorMessage: function(oError) {
            var errorDetails = errorHandler.parseError(oError);
            
            MessageBox.error("Do not leave space between numbers", {
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
                       "template": "RoleDescription"
                   }
               ]
           };
           this.oColModel = new JSONModel(oColumnsR);
           var oColumnsO={
            "cols": [
                {
                    "label": "User Name",
                    "template": "UserName",
                    "width": "15rem"
                
                },
                {
                    "label": "Full Name",
                    "template": "FullName"
                }
            ]
        };
        this.oColumnModel = new JSONModel(oColumnsO);
           },

    onRoleValueHelpRequest: function() {
        var aCols = this.oColModel.getData().cols,
         oModel=this.getView().getModel("RoleValueHelpModel"),
         oMultiInput=this.getView().byId("roleInput");
         this._oRoleSearchField = new SearchField({
            showSearchButton: false,
            placeholder: "Search in both Role and Role Description"
        });

        Fragment.load({
            name: "zfiauthomatrix.view.RoleValueHelpDialog",
            controller:this
        }).then(function(oValueHelpDialog) {
            this._RoleValueHelpDialog = oValueHelpDialog;
            this.getView().addDependent(this._RoleValueHelpDialog);
            var oFilterBar = this._RoleValueHelpDialog.getFilterBar();
            oFilterBar.setBasicSearch(this._oRoleSearchField);

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
    onRoleFilterBarSearch:function(oEvent){
        var sSearchQuery = this._oRoleSearchField.getValue(),
        aSelectionSet = oEvent.getParameter("selectionSet");
    var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
        if (oControl.getValue()) {
            aResult.push(new Filter({
                path: oControl.getName(),
                operator: FilterOperator.Contains,
                value1: oControl.getValue()
            }));
        }

        return aResult;
    }, []);

    aFilters.push(new Filter({
        filters: [
            new Filter({ path: "Role", operator: FilterOperator.Contains, value1: sSearchQuery }),
            new Filter({ path: "RoleDescription", operator: FilterOperator.Contains, value1: sSearchQuery }),
        ],
        and: false
    }));

    this._filterTable(new Filter({
        filters: aFilters,
        and: true
    }));

    },
    _filterTable: function (oFilter) {
        var oValueHelpDialog = this._RoleValueHelpDialog;

        oValueHelpDialog.getTableAsync().then(function (oTable) {
            if (oTable.bindRows) {
                oTable.getBinding("rows").filter(oFilter);
            }

            if (oTable.bindItems) {
                oTable.getBinding("items").filter(oFilter);
            }

            oValueHelpDialog.update();
        });
    },
    onOwnerValueHelpRequest: function() {
        var aCols = this.oColumnModel.getData().cols,
         oModel=this.getOwnerComponent().getModel("OwnerValueHelpModel"),
         oMultiInput=this.getView().byId("ownerSelect");
         this._oOwnerSearchField = new SearchField({
            showSearchButton: false,
            placeholder: "Search in both User and Full Name"
        });

      Fragment.load({
            name: "zfiauthomatrix.view.OwnerValueHelpDialog",
            controller:this
        }).then(function(oValueHelpDialog) {
            this._OwnerValueHelpDialog = oValueHelpDialog;
            this.getView().addDependent(this._OwnerValueHelpDialog);
            var oFilterBar = this._OwnerValueHelpDialog.getFilterBar();
            oFilterBar.setBasicSearch(this._oOwnerSearchField);

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
    onOwnerFilterBarSearch:function(oEvent){
        var sSearchQuery = this._oOwnerSearchField.getValue(),
        aSelectionSet = oEvent.getParameter("selectionSet");
    var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
        if (oControl.getValue()) {
            aResult.push(new Filter({
                path: oControl.getName(),
                operator: FilterOperator.Contains,
                value1: oControl.getValue()
            }));
        }

        return aResult;
    }, []);

    aFilters.push(new Filter({
        filters: [
            new Filter({ path: "UserName", operator: FilterOperator.Contains, value1: sSearchQuery }),
            new Filter({ path: "FullName", operator: FilterOperator.Contains, value1: sSearchQuery }),
        ],
        and: false
    }));

    this._filterOwnerTable(new Filter({
        filters: aFilters,
        and: true
    }));

    },
    _filterOwnerTable: function (oFilter) {
        var oValueHelpDialog = this._OwnerValueHelpDialog;

        oValueHelpDialog.getTableAsync().then(function (oTable) {
            if (oTable.bindRows) {
                oTable.getBinding("rows").filter(oFilter);
            }

            if (oTable.bindItems) {
                oTable.getBinding("items").filter(oFilter);
            }

            oValueHelpDialog.update();
        });
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
        var sAmount    = this.getView().getModel("newRole").getProperty("/Amount");
        var currency     = this.getView().getModel("newRole").getProperty("/Currency");
        var oDialog= this._addEmployeeDialog;

        var dataToSend = {
            role: role,               
            roleDescription: roleDescription,
            amount: sAmount,
            currency: currency
        };
          this.setBusy("newEmployeeDialog", true);          
       service.create(dataToSend).then(function (oData) {
         this.setBusy("newEmployeeDialog", false);
         var msg = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("messageForAddedRole");
		 MessageToast.show(msg);
         var closeFunction= function(){
             
             oDialog.close();

        };
        window.setTimeout(closeFunction,1000);
         

     }.bind(this)).then(undefined, function(oError) {
         this.showErrorMessage(oError);
         this.setBusy("newEmployeeDialog", false);
     }.bind(this));
     },
     onAmountInputEnter:function(oEvent){
         var oInput= oEvent.getSource();
        var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
        var oMessageManager  = sap.ui.getCore().getMessageManager();

        oMessageManager.registerObject(oInput, true);
        
        oMessageManager.registerMessageProcessor(oMessageProcessor);    
        oMessageManager.addMessages(
            new sap.ui.core.message.Message({
                message: "Make sure to leave no space between numbers",
                type: sap.ui.core.MessageType.Warning,
                target: "amountInput/value",
                processor: oMessageProcessor,
                persistent: true
             })
        );
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
        

        if (Status && Status!== "All") {
            arrayFilter.push(new Filter({
                   path: "Status",
                   operator: FilterOperator.EQ,
                   value1: Status,
                   
           }));
        };
       
        var aFiltersToSend= [];
        aFiltersToSend.push(new Filter({
            filters:arrayFilter,
            and: true
          }));
        
        this.getTableData(aFiltersToSend);
    
    //    oBinding.filter(new Filter({
    //     filters:arrayFilter,
    //     and: true
    //   }));
     },
     onRoleInputChange:function(oEvent){
        var aDeleatedToken= oEvent.getParameters("removedTokens").removedTokens,
        sDeleatedToken= aDeleatedToken[0].getKey();
        var oModel= this.getView().getModel("filterModel"),
        oData = oModel.getData();
        
        for(var i=0 ; i<oData.role.length ; i++){
            if(oData.role[i].key===sDeleatedToken){
                oData.role.splice(i,1);
            }
        };

       oModel.setData(oData);
       
     },
    onOwnerInputChange:function(oEvent){
        var aDeleatedToken= oEvent.getParameters("removedTokens").removedTokens,
        sDeleatedToken= aDeleatedToken[0].getKey();
        var oModel= this.getView().getModel("filterModel"),
        oData = oModel.getData();
        
        for(var i=0 ; i<oData.owner.length ; i++){
            if(oData.owner[i].key===sDeleatedToken){
                oData.owner.splice(i,1);
            }
        };

       oModel.setData(oData);
        
    },
     onClear:function(oEvent){
        var oModel= this.getView().getModel("filterModel");
        var oData=oModel.getData();
        oData.status="";
        oData.owner=[];
        oData.role=[];
        oModel.setData(oData);
     },
     onListItemPressed:function(oEvent){
      var oModel= this.getView().getModel("mainModel");
      console.log(oModel);
     }
     ,
    onPressEdit:function(){
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteCreateView");
    }
      });
    }
  );
  