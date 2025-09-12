# Pie Docs

## Installation

Add the pie directory to the project, and include the pie.js and pie.css files in the html files that should use them:

```
<script src="./pie/pie.js"></script>

<link rel="stylesheet" href="./pie/pie.css">
```

## Usage
```
plotPie(canvas, elements[], config):
```

+ canvas: HTML Canvas element to draw on
+ elements: array of objects containing the sections
+ config: object to specify custom configurations

There is also a global plotPieConfig object that contains the defaults, and could be modified.

## Members of an element:

+ name: string to be used in the references
+ value: number used to calculate the size of the section
+ color: CSS color to draw the section in
+ textColor: CSS color to write the value over the section
+ domain: object containing the horizontal limits in which the function will be plotted, with the attributes minX and maxX. All dots outside these limits will not be plotted

## Configuration:

+ width: horizontal resolution of the canvas. Default: 900
+ height: vertical resolution of the canvas. Default: 900
+ scaledWidth: percentage of the container's width that the canvas will occupy. The actual width and height are calculated to keep the proportions specified in the width and height properties. Default: 100
+ innerRadius: radius that will be left empty inside the circle. Between 0 and 1. Default: 0
+ fontSize: size that all texts will have in the canvas, in pixels. Default: 45
+ fontFamily: font family that all texts will have in the canvas. Default: "sans-serif"
+ precision: number that specifies how many decimal places will be used for showing the values in the canvas and the references. Default: 2
+ printPercentage: boolean that, if true, will show values in the canvas as a percentage of the total. Default: true
+ printThreshold: minimum value that the elements should have in order for the value to be written on the canvas. Default: 0
+ lightnessLimit: number between 0 and 255 used to control the automatic text color selection. If the lightness of the color of a section is below the lightnessLimit, the text will be written in white; otherwise, in black. It is ignored when specifying the textColor attribute of an element. Defaul: 120.
+ defaultColors: array containing strings representing CSS colors to be used for functions, when their color attribute is not specified. Default: ["orange", "purple", "green", "teal", "orangered", "indigo", "crimson", "goldenrod", "darkslateblue", "peru"]
+ refs: HTML element to fill with references, showing the function names along with their color.
+ showValueRef: boolean that determines if the element's value should be shown in the references. Default: true
+ showPercentageRef: boolean that determines if the element's percentage of the total should be shown in the references. Default: false

## References

The references can be customized with the following CSS variables:

+ pie-ref-direction: to specify the direction in which each reference will be added next. Could be "row" (default) or "column".
+ pie-ref-color-size: to specify the diameter of the circles showing the colors. Default: 8pt.
+ pie-ref-margin-base: to specify the spaces between and inside references. Default: 12pt.