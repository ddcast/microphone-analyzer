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

  // generates a handler that calls a function with a given ~context
  function proxy(fn, ctxValue) {
    return function proxyHandler() { fn.apply(ctxValue, arguments); }
  }

  function getNumAttr(element, name, defaultValue) {
    return parseFloat(element.getAttribute(name) || defaultValue);
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
    this.ranges.forEach(proxy(rangeSetter(value), this));

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

  var AudioRangePrototype = Object.create(HTMLElement.prototype);

  window.AudioRange = document.registerElement('audio-range', {
    prototype: AudioRangePrototype
  });

  var MicrophoneAnalyzerPrototype = Object.create(HTMLElement.prototype);

  MicrophoneAnalyzerPrototype.valuefilter = function valuefilter(rms) {
    return rms;
  };

  MicrophoneAnalyzerPrototype.createdCallback = function createdCallback() {
    var ranges = this.ranges = [];

    this.audioRange = {};
    this.lastRange = {};

    this.unit = getNumAttr(this, 'unit', .5);
    this.overlap = getNumAttr(this, 'overlap', .5);
    this.channels = getNumAttr(this, 'channels', 1);

    this.style.display = 'none';

    this.querySelectorAll('audio-range').array()
      .forEach(function (element, index) {
        element.value = {
          index: index,
          innerHTML: element.innerHTML,
          value: [ getNumAttr(element, 'start'), getNumAttr(element, 'end') ]
        };

        ranges.push(element.value);
      });

    this.mic = new Microphone({
        unit: this.unit,
        overlap: this.overlap,
        channels: this.channels
    }, proxy(micInputHandler, this));
  };

  window.MicrophoneAnalyzer = document.registerElement('microphone-analyzer', {
    prototype: MicrophoneAnalyzerPrototype
  });

} (window.Microphone));
