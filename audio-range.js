/**
  * AudioRangeElement
  * Provides value for use with MicrophoneAnalyzer elements.
  */

;(function AudioRangeElement() {

  var lifecycle = {};

  lifecycle.setValue = function setValue() {
    var index = this.parentElement.children.array().indexOf(this);
    
    this.value = {
      index: index,
      innerHTML: this.innerHTML,
      value: [
        this.utils.getNumAttr(this, 'start'),
        this.utils.getNumAttr(this, 'end')
      ]
    };

    return this;
  };

  lifecycle.created = function createdCallback() {  
    this.utils = this.parentElement.utils;

    this
      .setValue()
      .parentElement
      .updateValue(this);
  };

  lifecycle.attributeChanged = function attributeChanged() {
    this.setValue();
  };

  Polymer('audio-range', lifecycle);

} ());