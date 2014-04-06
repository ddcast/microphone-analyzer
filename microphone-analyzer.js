/**
* MicrophoneAnalyzerElement
* A polymer element that enables microphone input data analysis on your documents.
*
* @method valuefilter
* @param {Number} rms Computed rms value

* @method createdCallback
* Called when a <microphone-analyzer> element is created.
*/

;(function MicrophoneAnalyzerElement(Microphone) {

  // handle global errors
  var err;

  if (!arguments[0]) {
    err = new Error('Missing dependency: Microphone. Try `bower install srubin/microphone`');
  }

  try {
    // Microphone library dependency
    var _testWebkitAudio = new window.webkitAudioContext()
      .createJavaScriptNode(2048, 1, 1);

    delete _testWebkitAudio;
  }
  catch(e) {
    err = new Error('Fatal: Device not supported.'); 
  }

  if (err) {
    throw err;
  }

  var audioContext =  new (window.AudioContext || window.webkitAudioContext);

  // patch audiocontext multiple instantiation issue in Microphone
  Microphone.prototype.gotStream = function(stream) {
    this.audioContext = audioContext;
    this.bufLength = this.length * this.audioContext.sampleRate;
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
    window.microphoneProcessingNode = this.createNode();

    this.mediaStreamSource.connect(window.microphoneProcessingNode);
    
    return window.microphoneProcessingNode.connect(this.audioContext.destination);
  };

  function getNumAttr(element, name, defaultValue) {
    return parseFloat(element.getAttribute(name) || defaultValue);
  }

  // generates a handler that calls a function with a given ~context
  function proxy(fn, ctxValue) {
    return function proxyHandler() { fn.apply(ctxValue, arguments); }
  }

  function withinRange(value, range) {
    return (value >= range.value[0] && value <= range.value[1]);
  }

  // generates a handler that sets the current range if it has changed
  function rangeSetter(v) {
    return function rangeSetterHandler(range, index) {
      if (withinRange(v, range.value)) {
        this.audioRange = range.value;

        if (this.lastRange !== range.value) {
          this.lastRange = range.value;
        }
      }
    };
  }

  function micInputHandler(data) {
    // presently supporting one channel
    data = 2 === data.length ? data[0] : data;

    // rms calculation via https://github.com/srubin/microphone
    var rms = data.map(function (d) { return d * d; });
    rms = rms.reduce(function (t, s) { return t + s; });
    rms = Math.sqrt(rms / data.length);

    var value = this.valuefilter(rms);

    // set current input descriptive range
    this.valueElements.forEach(proxy(rangeSetter(value), this));

    var evt = new CustomEvent('air', {
      detail: {
        data: data,
        rms: rms,
        value: value,
        audioRange: this.audioRange
      }
    });

    this.dispatchEvent(evt);
  }

  function pushValue(arr, item) {
    var index = arr.indexOf(item);

    if (index === -1) {
      arr.push(item);

      return true;
    }

    return false;
  }

  var lifecycle = { utils: {} };

  // expose some helper methods
  lifecycle.utils.proxy = proxy;
  lifecycle.utils.getNumAttr = getNumAttr;

  lifecycle.options = function options() {
    this.micOptions = this.micOptions || {};

    this.micOptions.length = getNumAttr(this, 'length', .5);
    this.micOptions.overlap = getNumAttr(this, 'overlap', .5);
    this.micOptions.channels = getNumAttr(this, 'channels', 1);

    return this.micOptions;
  };

  lifecycle.bindMicOptions = function (options) {
    this.mic.length = options.length;
    this.mic.overlap = options.overlap;
    this.mic.channels = options.channels;

    return options;
  };

  lifecycle.valuefilter = function valuefilter(rms) {
    return rms;
  };

  lifecycle.updateValue = function updateValue(optionElement) {
    pushValue(this.valueElements, optionElement);
  };

  lifecycle.created = function createdCallback() {
    this.audioRange = {};
    this.lastRange = {};
    this.valueElements = [];
  };

  lifecycle.instantiateMicrophone = function instantiateMicrophone() {
    var options = this.options();

    this.mic = new Microphone(options, proxy(micInputHandler, this));

    this.bindMicOptions(options);
  }

  lifecycle.killStream = function killStream() {
    this.mic && this.mic.mediaStreamSource && this.mic.mediaStreamSource
      .disconnect();

    window.microphoneProcessingNode && window.microphoneProcessingNode
      window.microphoneProcessingNode.disconnect();
  };
  
  lifecycle.startStream = function startStream() {
    this.mic && this.mic.mediaStreamSource && this.mic.mediaStreamSource
      .connect(window.microphoneProcessingNode) &&

    window.microphoneProcessingNode && window.microphoneProcessingNode
      .connect(this.mic.audioContext.destination);
  }

  lifecycle.detached = function detachedCallback() {
    this.killStream();
  };

  lifecycle.attached = function attachedCallback() {
    this.startStream();
  };

  lifecycle.domReady = function domReady() {
    this.instantiateMicrophone();
  };

  lifecycle.attributeChanged = function attributeChangedCallback() {
    this.killStream();

    this.instantiateMicrophone();
    this.startStream();
  };

  Polymer('microphone-analyzer', lifecycle);

} (window.Microphone));
