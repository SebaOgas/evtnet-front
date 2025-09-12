# XY Docs

## Installation

Add the xy directory to the project, and include the xy.js and xy.css files in the html files that should use them:

```
<script src="./xy/xy.js"></script>

<link rel="stylesheet" href="./xy/xy.css">
```

## Usage
```
plotXY(canvas, functions[], config):
```

+ canvas: HTML Canvas element to draw on
+ functions: array of objects containing data to plot
+ config: object to specify custom configurations

There is also a global plotXYConfig object that contains the defaults, and could be modified.

## Members of a function:

+ dots: array of objects, containing two attributes each: x and y (both numbers)
+ fun: Javascript function, taking one number as argument and returning another number
+ name: string to be used in the references
+ color: CSS color to draw the function in
+ domain: object containing the horizontal limits in which the function will be plotted, with the attributes minX and maxX. All dots outside these limits will not be plotted

## Configuration:

+ width: horizontal resolution of the canvas. Default: 1600
+ height: vertical resolution of the canvas. Default: 900
+ scaledWidth: percentage of the container's width that the canvas will occupy. The actual width and height are calculated to keep the proportions specified in the width and height properties. Default: 80
+ lineWidth: width of the main lines used in the canvas. There may be wider or thinner lines, but keeping the proportions. Default: 4
+ fontSize: size that all texts will have in the canvas, in pixels. Default: 45
+ fontFamily: font family that all texts will have in the canvas. Default: "sans-serif"
+ offset: object containing the attributes top, left, bottom and right, numbers that determine an offset or margin on the sides of the graph. Default: {top: 0.1, bottom: 0.1, left: 0.1, right: 0.05}
+ joinDots: if true, the dots in functions will be joined to simulate continuity. Default: true
+ biggerDots: if true, the dots will be shown in a bigger size. Default: false
+ precision: object containing an x and y attributes, specifying how many decimal places will labels in the x and y axis will have. Default: {x: 0, y: 0}
+ domain: object containing the horizontal limits in which the functions will be plotted, with the attributes minX and maxX. All dots outside these limits will not be plotted. Default: {x: undefined, y: undefined}
+ labelMethod: object containing the way in which labels will be generated for both axis. Default: {x: "gcd", y: "gcd"}. Possible values:
  + gcd: finds the greatest common divisor between all the x and y values of the dots to plot, and ensures the labels will not overlap each other. Ideal if all functions are given as a set of dots.
  + marks: draws a certain number of equidistant marks.
+ grid: object with x and y attributes that specify whether marks on the corresponding axis should continue as a discontinuous thinner line on the plot. Default: {x: true, y: true}
+ marks: object that specifies, if labelMethod is "marks" for some axis, how many marks should be used for said axis. Default: {x: 10, y: 5}
+ labelSpaceFactor: object that specifies, if labelMethod is "gcd" for some axis, a margin between labels on said axis. The greater the value, the bigger the margin. The values should be at least 1, otherwise the labels will overlap. Default: {x: 1, y: 2}
+ samplingRate: amount of dots that will be automatically calculated when fun was specifies. The bigger the value, the smoother the function will look, and the longer it will take to plot. Default: 100
+ defaultColors: array containing strings representing CSS colors to be used for functions, when their color attribute is not specified. Default: ["orange", "purple", "green", "teal", "orangered", "indigo", "crimson", "goldenrod", "darkslateblue", "peru"]
+ refs: HTML element to fill with references, showing the function names along with their color.

## References

The references can be customized with the following CSS variables:

+ xy-ref-direction: to specify the direction in which each reference will be added next. Could be "row" (default) or "column".
+ xy-ref-color-size: to specify the diameter of the circles showing the colors. Default: 8pt.
+ xy-ref-margin-base: to specify the spaces between and inside references. Default: 12pt.