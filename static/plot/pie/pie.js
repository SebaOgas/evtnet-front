const plotPieConfig = {
    width: 900,
    height: 900,
    scaledWidth: 100,
    innerRadius: 0,
    fontSize: 45,
    fontFamily: "sans-serif",
    precision: 2,
    printPercentage: true,
    printThreshold: 0,
    lightnessLimit: 120,
    defaultColors: ["orange", "purple", "green", "teal", "orangered", "indigo", "crimson", "goldenrod", "darkslateblue", "peru"],
    refs: undefined,
    showValueRef: true,
    showPercentageRef: false
}


const plotPie = function(canvas, elems, config) {
    for (const [key, value] of Object.entries(plotPieConfig)) {
        if (config[key] === undefined)
            config[key] = value;
    }

    canvas.height = config.height;
    canvas.style.height = `${config.height / config.width * config.scaledWidth}%`;
    canvas.width = config.width;
    canvas.style.width = `${config.scaledWidth}%`;
    let ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, config.width, config.height);
    let cvh = canvas.height;
    let cvw = canvas.width;
    let d = Math.min(cvh, cvw);
    let r = d/2;

    let sumValues = 0;

    elems = elems.sort((a, b) => b.value - a.value);

    elems.forEach(e => {
        if (e.name === undefined) throw new Error("Undefined element name")
        if (e.value === undefined) throw new Error(`Undefined element value ("${e.name}")`);
        if (e.value < 0) throw new Error(`Value of element "${e.name}" cannot be negative`);
        sumValues += e.value;
    });

    let nextDefaultColor = 0;
    let nextAngle = 3*Math.PI/2;

    let x = cvw/2;
    let y = cvh/2;
    elems.forEach(e => {
        
        if (e.color === undefined) {
            if (nextDefaultColor < config.defaultColors.length) {
                e.color = config.defaultColors[nextDefaultColor++];
            } else {
                nextDefaultColor++;
                e.color = nextDefaultColor % 2 === 0 ? "gray" : "lightgray";
            }
        }
        ctx.fillStyle = e.color;

        ctx.beginPath();
        let afterAngle = (nextAngle + e.value / sumValues * 2*Math.PI);
        ctx.arc(x, y, r, nextAngle, afterAngle);
        ctx.lineTo(x, y);
        ctx.fill();
        ctx.closePath();

        ctx.font = config.fontSize + "px " + config.fontFamily;
        ctx.textAlign = "center";

        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        const getLightness = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;

        
        if (getLightness(hexToRgb(ctx.fillStyle)) < config.lightnessLimit) {
            ctx.fillStyle = "white";
        } else {
            ctx.fillStyle = "black";
        }

        let midAngle = (afterAngle - nextAngle)/2;
        midAngle = nextAngle + midAngle;

        let value = e.value;
        let pct = value / sumValues * 100;
        let printValue = value.toFixed(config.precision);
        let printPercentage = pct.toFixed(config.precision) + "%";
        let print = printValue;
        if (config.printPercentage) print = printPercentage;

        if (value >= config.printThreshold) {
            ctx.beginPath();
            if (e.textColor !== undefined) ctx.fillStyle = e.textColor;
            ctx.fillText(print, x + Math.cos(midAngle) * r * (1+config.innerRadius)/2, y + Math.sin(midAngle) * r * (1+config.innerRadius)/2);
            ctx.closePath();
        }

        nextAngle = afterAngle;

        if (config.refs !== undefined) {
            let val = "";
            if (config.showValueRef && config.showPercentageRef) {
                val = `(${printValue} / ${printPercentage})`;
            } else if (config.showValueRef) {
                val = `(${printValue})`;
            } else if (config.showPercentageRef) {
                val = `(${printPercentage})`;
            }
            config.refs.innerHTML += `
                <div class="pie_ref">
                    <div class="pie_ref_color" style="background-color:${e.color}"></div>
                    <div>${e.name} ${val}</div>
                </div>
            `;
        }
        
    });

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, r * config.innerRadius, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();

    if (config.refs !== undefined) {
        config.refs.classList.add("pie_refs");
    }
}