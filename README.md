microphone-analyzer
===================

microphone-analyzer is a polymer element that enables microphone input data analysis on your documents.

Dependencies:

* [Polymer](http://www.polymer-project.org/)
* [Microphone](https://github.com/srubin/microphone/)

Usage:

The `air` event is fired at the interaval specified by the unit option. `event.details` will contain the following properties:

* `data`: audio stream data
* `rms`: current root mean square
* `value`: rms value
* `audioRange`: descriptive range of current volume level (based on matched <audio-range>)

Element attributes (based on [srubin/microphone](https://github.com/srubin/microphone/)):

* `unit`: the length (in seconds) of audio to return in each callback *(default: .5)*
* `overlap`: the amount of overlap in the audio data between successive callbacks (For example, overlap of .25 means the last 25% of the audio data from one callback will be the first 25% of the data in the next callback). *(default: .5. Must be between 0 and 1, inclusive)*
* `channels`: 1 (mono) or 2 (stereo) *(default: 1)*

Example:

```html
<microphone-analyzer unit=".5" overlap=".25" channels="1">
  <audio-range start="0" end="1"><em>speak up!</em></audio-range>
  <audio-range start="1.01" end="2">quiet</audio-range>
  <audio-range start="2.01" end="3">normal</audio-range>
  <audio-range start="3.01" end="4">loud</audio-range>
  <audio-range start="4.01" end="5">very loud</audio-range>
</microphone-analyzer>
```

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
