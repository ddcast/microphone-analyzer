microphone-analyzer
===================

microphone-analyzer is a polymer element that enables document microphone input data analysis.

Dependencies:

* [Polymer](http://www.polymer-project.org/)
* [Microphone](https://github.com/srubin/microphone/)

Install
=======

Command line:

`bower install ddcast/microphone-analyzer`

Include in your document `<head>`:

```HTML
<script src="components/platform/platform.js"></script>
<script src="components/microphone/microphone.js"></script>

<link rel="import" href="components/polymer/polymer.html"> 
<link rel="import" href="components/microphone-analyzer/microphone-analyzer.html"> 
```

Usage
=====

The `air` event is fired at the interaval specified by the unit option. `event.detail` will contain the following properties:

* `data`: audio stream data
* `rms`: current root mean square
* `value`: rms value
* `audioRange`: descriptive range of current volume level (based on matched `<audio-range>`)
  * `index`: index of matched `<audio-range>` element
  * `innerHTML`: markup or text
  * `value`: range array

Element attributes (based on [srubin/microphone](https://github.com/srubin/microphone/)):

* `unit`: the length (in seconds) of audio to return in each callback *(default: .5)*
* `overlap`: the amount of overlap in the audio data between successive callbacks (For example, overlap of .25 means the last 25% of the audio data from one callback will be the first 25% of the data in the next callback). *(default: .5. Must be between 0 and 1, inclusive)*
* `channels`: 1 (mono) or 2 (stereo) *(default: 1)*

Example
=======

HTML:
```html
<microphone-analyzer unit=".5" overlap=".25" channels="1">
  <audio-range start="0" end="1"><em>speak up!</em></audio-range>
  <audio-range start="1.01" end="2">quiet</audio-range>
  <audio-range start="2.01" end="3">normal</audio-range>
  <audio-range start="3.01" end="4">loud</audio-range>
  <audio-range start="4.01" end="5">very loud</audio-range>
</microphone-analyzer>
```

JavaScript:
```javascript
var microphoneAnalyzer = document.querySelector('microphone-analyzer');

microphoneAnalyzer.valuefilter = function (rms) {
  var vol = rms * 100;

  return vol;
};

microphoneAnalyzer.addEventListener('air', function(e) {
  console.log(e.detail.value);
});
```
