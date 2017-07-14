/**
 * Created by pathik on 11/09/15.
 */
(function(jQuery){
    var GRID_DATA_KEY = "grid";

    $.fn.Grid = function(option){
        var args = $.makeArray(arguments),
            methodArgs = args.slice(1),
            result = this;

        var $this = this;

        if($this.length == "1"){
            var $instant = $this.data(GRID_DATA_KEY);
            if($instant){
                return $instant;
            }else{
                var grid = new Grid($this,option);
                return grid;
            }

        }else{
            throw Error("grid: table element more not 1");
        }
    };


    function Grid($element,option){
        this._container = $element;
        $element.data(GRID_DATA_KEY, this);

        this.cols = [];
        this.data = [];
        this.scroll = true;
        this._init(option);

    }

    Grid.prototype = {
        classTableContainer : "table-container",
        classTable : "table",
        classTableScroll : "table-scroll",
        classHeaderBack : "header-back",


        onRowClick : function(args){},


        _init : function(option){
            $.extend(this,option);

            this._initCols();
            this._buildTable();
            this._loadTableData();
        },

        _initCols : function(){
            var self = this;
            self.cols = $.map(self.cols,function(col){
                if($.isPlainObject(col)){
                    col = new Col(col);
                    col.grid = self;
                }
                return col;
            });
        },

        _buildTable : function(){

            var $tableContainer = $("<div>").addClass(this.classTableContainer);

            var $$table = $("<div>").addClass(this.classTable);
            var $table = $("<table>");

            var $tableHead = this._thead =  this._createTableHead();
            var $tableBody = this._tbody = this._createTableBody();


            if(this.scroll){
                $tableContainer.css("padding-top" , "45px");
                $$table.css("overflow-y","auto");
                $table.addClass(this.classTableScroll);


                var $back = $("<div>")
                        .addClass(this.classHeaderBack);

                $tableContainer.append($back);

            }


            $tableContainer.append($$table);
            $$table.append($table);
            $table.append($tableHead);
            $table.append($tableBody);
            this._container.append($tableContainer);



        },

        _createTableHead : function(){
            var $thead = $("<thead>");
            var $tr = $("<tr>");
            $thead.append($tr);

            this._eachCols(function(index,col){
                var $th = $("<th>")
                    .css("width",col.width)
                    .css(col.getColCss());

                if(this.scroll){
                    var $title = $("<div class='title'>")
                        .css("width",col.width)
                        .css(col.getColCss())
                        .css({
                            "position" : "absolute"
                        })
                        .text(col.getTitle());

                    $th.append($title);
                }else{
                    $th.text(col.getTitle());
                }


                $tr.append($th);
            });
            return $thead;
        },
        _createTableBody : function(){
            var $tbody = $("<tbody>");
            return $("<tbody>");
        },

        _loadTableData : function(){
            var self = this;
            var $tbody = this._tbody;

            $.each( this.data,function(i,rowData){
                var $row = self._createTableRow(i,rowData);
                $tbody.append($row);
            });
        },

        _createTableRow : function(index,data){
            var self = this;
            var $tr = $("<tr>");

            this._eachCols(function(i,col){
                $tr.append(self._createCell(index,data,col));
            });

            $tr.on({
                "click" :  $.proxy(function(e){
                    this.onRowClick({
                        event: e,
                        itemIndex: index,
                        item: data,
                        row: $tr
                    });
                },this)
            });
             return $tr;
        },

        _createCell : function(index,data,col){
            var $td = $("<td>");
            var cellValue = data[col.name];
            $td.append(col.template ? col.template(index,cellValue,data) : cellValue)
                .css(col.css);
            return $td;
        },

        _eachCols: function(callBack) {
            var self = this;
            $.each(self.cols, function(index, col) {
                return callBack.call(self,index, col);
            });
        },

        refresh : function(){
            this._clear();
            this._loadTableData();
        },

        refreshFull : function(){
            this._clearFull();
            this._init();
        },

        _clear : function(){
            this._tbody.empty();
        },

        _clearFull : function(){
            this._container.empty();

        },
        deleteItem : function(index){
            this.data = $.grep(this.data,function(value,i){
                return i != index;
            });
            this._container.trigger("deleteItem",index);
            this.refresh();
        },
        addItem : function(data){
            this.data.push(data);
            this._container.trigger("addItem",{index:this._dataLength() - 1,data:data});
            this.refresh();
        },

        updateItem : function(index,data){
            this.data[index] = data;
            this._container.trigger("updateItem",{index:index,data:data});
            this.refresh();
        },

        silentUpdateItem : function(index,data){
            this.data[index] = data;
            this._container.trigger("updateItem",{index:index,data:data});
        },
        silentDeleteItem : function(index){
            this.data = $.grep(this.data,function(value,i){
                return i != index;
            });
            this._container.trigger("deleteItem",index);
        },
        silentAddItem : function(data){
            this.data.push(data);
            this._container.trigger("addItem",{index:this._dataLength() - 1,data:data});
        },

        _dataLength : function(){
            return parseInt(this.data.length);
        },

        silentAddItemUi : function(data){
            this.silentAddItem(data);
            var $tr = this._createTableRow(this._dataLength() - 1, data);
            this._tbody.append($tr);
        },
        updateItemUi : function(index,data){
            this.silentUpdateItem(index,data);
            var $tr = this._createTableRow(index,data);
        }



    };


    function Col(config){
        $.extend(this, config);
        return this;
    }
    Col.prototype = {
        name : "",
        title : "",
        css: {},
        colCss : {},
        width : "auto",
        show : true,


        getTitle : function(){
            if(!this.show){
                return "";
            }
            return this.title || this.name;
        },
        getColCss : function(){
            return this.colCss;
        }
    };

})();