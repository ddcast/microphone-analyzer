/**
  * AudioRangeElement
  * Provides value for use with MicrophoneAnalyzer elements.
  */

;(function AudioRangeElement() {

  var AudioRangeLifecycle = {};

  AudioRangeLifecycle.setValue = function setValue() {
    this.value = {
      index: this.parentElement.children.array().indexOf(this),
      innerHTML: this.innerHTML,
      value: [
        this.utils.getNumAttr(this, 'start'),
        this.utils.getNumAttr(this, 'end')
      ]
    };

    return this;
  };

  AudioRangeLifecycle.created = function createdCallback() {  
    this.utils = this.parentElement.utils;

    this
      .setValue()
      .parentElement
      .updateValue(this);
  };

  AudioRangeLifecycle.attributeChanged = function attributeChanged() {
    this.setValue();
  };

  Polymer('audio-range', AudioRangeLifecycle);

} ());