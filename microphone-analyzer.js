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
      if (withinRange(v, range)) {
        this.audioRange = range;

        if (this.lastRange !== range) {
          this.lastRange = range;
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
    this.value.forEach(proxy(rangeSetter(value), this));

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

  function setOptions() {
    this.unit = getNumAttr(this, 'unit', .5);
    this.overlap = getNumAttr(this, 'overlap', .5);
    this.channels = getNumAttr(this, 'channels', 1);
  }

  function pushValue(arr, item){
    var index = arr.indexOf(item);

    if (index === -1) {
      arr.push(item);

      return true;
    }

    return false;
  }

  var MicrophoneAnalyzerLifecycle = { utils: {} };

  // expose some helper methods
  MicrophoneAnalyzerLifecycle.utils.proxy = proxy;
  MicrophoneAnalyzerLifecycle.utils.getNumAttr = getNumAttr;

  MicrophoneAnalyzerLifecycle.valuefilter = function valuefilter(rms) {
    return rms;
  };

  MicrophoneAnalyzerLifecycle.updateValue = function updateValue(optionElement) {
    pushValue(this.value, optionElement.value);
  };

  MicrophoneAnalyzerLifecycle.created = function createdCallback() {
    this.audioRange = {};
    this.lastRange = {};
    this.value = [];

    setOptions.call(this);
  };

  MicrophoneAnalyzerLifecycle.domReady = function domReady() {
    this.mic = new Microphone({
        unit: this.unit,
        overlap: this.overlap,
        channels: this.channels
    }, proxy(micInputHandler, this));
  };

  MicrophoneAnalyzerLifecycle.detached = function detachedCallback() {
    
  };

  MicrophoneAnalyzerLifecycle.attached = function attachedCallback() {

  };

  MicrophoneAnalyzerLifecycle.attributeChanged = function attributeChangedCallback() {
    setOptions.call(this);
  };

  Polymer('microphone-analyzer', MicrophoneAnalyzerLifecycle);

} (window.Microphone));
