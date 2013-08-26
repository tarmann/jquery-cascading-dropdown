/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */

;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = "cascadingDropdown",
        defaults = {
            url: '/sample.html',
            fields: {},
            parentParam: 'ParentId',
            requestType: 'GET'
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {

        fields: {},

        init: function() {
            var $field = $('[data-cdd-parent=""]', this.element);

            this.parseField( $field.attr('name') );
            this.loadContent( $field.attr('name') );

            this.bindEvents();
        },

        parseField: function(fieldName, parentFieldName){
            var $field = $('[name="'+ fieldName +'"]', this.element),
                $fieldChild = $('[data-cdd-parent="'+ fieldName +'"]', this.element);
            
            this.fields[$field.attr('name')] = {
                $el: $field,
                parent: parentFieldName || ''
            };

            if($fieldChild.length){
                this.parseField( $fieldChild.attr('name'), $field.attr('name') );
            }
        },

        bindEvents: function(element, options){
            var self = this;

            $.each(this.fields, function(fieldName, field){
                field.$el.change(function(){
                    self.updateFields(fieldName);
                });
            });
        },

        updateFields: function(updatedfieldName){
            var self = this;

            $.each(this.fields, function(fieldName, field){
                if(field.parent == updatedfieldName){
                    var parentField = self.fields[field.parent];
                    
                    if(parentField.$el.val() != -1){
                        self.loadContent(fieldName);
                    } else {
                        self.clearField(fieldName);
                    }
                }
            })  
        },

        loadContent: function(fieldName) {
            var self = this;
                field = this.fields[fieldName];
                fieldParentValue = (field.parent) ? this.fields[field.parent].$el.val() : '',
                requestData = $.extend({}, self.options.requestData);

            this.showLoadingField(fieldName);

            // append parent field value to request
            requestData[self.options.parentParam] = fieldParentValue;

            $.ajax({
                url: this.options.url,
                type: this.options.requestType,
                data: requestData,
                success: function (response) {
                    field.$el.html(response);
                    field.$el.removeAttr("disabled");
                    self.updateFields(fieldName);
                }
            });
        },

        showLoadingField: function(fieldName){
            var field = this.fields[fieldName];
            field.$el.html('<option value="-1">Loading ... </option>');
            field.$el.attr("disabled", true);
        },


        clearField: function (fieldName){
            var field = this.fields[fieldName];
            field.$el.html('<option value="-1">Please select ... </option>');
            field.$el.attr("disabled", true);
            this.updateFields(fieldName);
        }        
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );