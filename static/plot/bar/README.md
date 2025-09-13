# Bar Docs

## Installation

Add the bar directory to the project, and include the bar.js and bar.css files in the html files that should use them:

```
<script src="./bar/bar.js"></script>

<link rel="stylesheet" href="./bar/br.css">
```

## Usage
```
plotBar(canvas, series[], labels[], config):
```

+ canvas: HTML Canvas element to draw on
+ series: array of objects containing the details of the series of bar to draw
+ labels: array of strings, joining together the nth element of all series under the nth label
+ config: object to specify custom configurations

There is also a global plotBarConfig object that contains the defaults, and could be modified.

## Members of a series:

+ name: string to be used in the references
+ values: array of numbers, each corresponding to the magnitude of a bar
+ color: CSS color to draw the function in

## Configuration:

+ width: horizontal resolution of the canvas. Default: 1600
+ height: vertical resolution of the canvas. Default: 900
+ scaledWidth: percentage of the container's width that the canvas will occupy. The actual width and height are calculated to keep the proportions specified in the width and height properties. Default: 80
+ lineWidth: width of the main lines used in the canvas. There may be wider or thinner lines, but keeping the proportions. Default: 4
+ fontSize: size that all texts will have in the canvas, in pixels. Default: 40
+ fontFamily: font family that all texts will have in the canvas. Default: "sans-serif"
+ offset: object containing the attributes top, left, bottom and right, numbers that determine an offset or margin on the sides of the graph. Default: {top: 0.1, bottom: 0.1, left: 0.1, right: 0.05}
+ barSize: number, specifies the relative size of each bar compared to the inner and outer gaps, on the main axis. If gap.inner = 1 and barSize = 10, the bars will be 10 times bigger than the inner gaps. Default: 10
+ gap: object containing two numeric attributes: inner and outer. They specify the relative size of the gaps between bars (inner gaps) and between groups of bars (outer gaps). Default: {inner: 1, outer: 5}
+ precision: number that specifies how many decimal places numbers will have. Default: 2
+ mainAxis: string that can either be "x" or "y", and sets which axis the bars will start on. Default: "x"
+ showInverseAxis: boolean that determines if the inverse axis (the not-main axis) should be drawn. Default: true
+ marks: number that specifies how many marks should be placed parallel to the main axis. Default: 0
+ defaultColors: array containing strings representing CSS colors to be used for functions, when their color attribute is not specified. Default: ["orange", "purple", "green", "teal", "orangered", "indigo", "crimson", "goldenrod", "darkslateblue", "peru"]
+ refs: HTML element to fill with references, showing the function names along with their color.

## References

The references can be customized with the following CSS variables:

+ bar-ref-direction: to specify the direction in which each reference will be added next. Could be "row" (default) or "column".
+ bar-ref-color-size: to specify the diameter of the circles showing the colors. Default: 8pt.
+ bar-ref-margin-base: to specify the spaces between and inside references. Default: 12pt.