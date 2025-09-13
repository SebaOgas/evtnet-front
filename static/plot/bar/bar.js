const plotBarConfig = {
    width: 1600,
    height: 900,
    scaledWidth: 80,
    lineWidth: 4,
    fontSize: 40,
    fontFamily: "sans-serif",
    offset: {
        top: 0.1,
        bottom: 0.1,
        left: 0.1,
        right: 0.05
    },
    barSize: 10, 
    gap: {
        inner: 1,
        outer: 5,
    },
    precision: 2,
    mainAxis: "x",
    showInverseAxis: true,
    marks: 0,
    drawArrows: true,
    defaultColors: ["orange", "purple", "green", "teal", "orangered", "indigo", "crimson", "goldenrod", "darkslateblue", "peru"],
    refs: undefined
}

const plotBar = function(canvas, series = [], labels = [], config = {}){
    for (const [key, value] of Object.entries(plotBarConfig)) {
        if (config[key] === undefined)
            config[key] = value;
    }
    
    canvas.height = config.height;
    //canvas.style.height = `${config.height / config.width * config.scaledWidth}%`;
    canvas.width = config.width;
    canvas.style.width = `${config.scaledWidth}%`;
    let ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, config.width, config.height);
    let cvh = canvas.height;
    let cvw = canvas.width;

    let gh = cvh * (1 - config.offset.top - config.offset.bottom);
    let gw = cvw * (1 - config.offset.left - config.offset.right);
    let oy = cvh * config.offset.top;
    let ox = cvw * config.offset.left;

    let ls = cvw * 0.025;

    

    function drawXAxis() {
        ctx.lineWidth = config.lineWidth;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";

        ctx.beginPath();
        ctx.moveTo(ox, gh + oy);
        ctx.lineTo(cvw - ls/2, gh + oy);
        ctx.stroke();
        ctx.closePath();

        if (!config.drawArrows) return;
        
        ctx.beginPath();
        let path = new Path2D();
        path.moveTo(cvw, gh + oy);
        path.lineTo(cvw - ls/2, gh + oy + ls/4)
        path.lineTo(cvw - ls/2, gh + oy - ls/4)
        ctx.fill(path);
        ctx.closePath();
    }

    function drawYAxis() {
        ctx.lineWidth = config.lineWidth;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";

        ctx.beginPath();
        ctx.moveTo(ox, ls/2);
        ctx.lineTo(ox, gh + oy);
        ctx.stroke();
        ctx.closePath();
        
        if (!config.drawArrows) return;
    
        ctx.beginPath();
        path = new Path2D();
        path.moveTo(ox, 0);
        path.lineTo(ox + ls/4, ls/2)
        path.lineTo(ox - ls/4, ls/2)
        ctx.fill(path);
        ctx.closePath();
    }



    let cs = series.length;
    let cl = labels.length;

    let fullSize = config.barSize * cs * cl + config.gap.inner * (cs - 1) * cl + config.gap.outer * cl;
    
    let max = series.reduce((m, v) => Math.max(m, ...v.values), 0);

    let nextDefaultColor = 0;

    series.forEach(s => {
        if (s.color === undefined) {
            if (nextDefaultColor < config.defaultColors.length) {
                s.color = config.defaultColors[nextDefaultColor++];
            } else {
                s.color = "gray";
            }
        }
        if (config.refs !== undefined) {
            if (s.name !== undefined && typeof s.name === "string") {
                config.refs.innerHTML += `
                    <div class="bar_ref">
                        <div class="bar_ref_color" style="background-color:${s.color}"></div>
                        <div>${s.name}</div>
                    </div>
                `;
            }
        }
    });

    if (config.refs !== undefined) {
        config.refs.classList.add("bar_refs");
    }

    ctx.font = config.fontSize + "px " + config.fontFamily;

    if (config.mainAxis === "x") {
        

        // Main scale factor, multiply by this to convert something to the canvas size
        let msf =  gw / fullSize;
        // Inverse scale factor
        let isf = gh / max;

        let pos = ox;
        let i = 0;

        ctx.textAlign = "center";

        labels.forEach(l => {
            pos += config.gap.outer * msf;

            ctx.fillStyle = "black";
            ctx.fillText(l, pos + (config.barSize * cs + config.gap.inner * (cs - 1)) * msf / 2, gh + oy + config.fontSize);

            series.forEach(s => {
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.rect(pos, gh + oy, config.barSize * msf, - s.values[i] * isf);
                ctx.fill();
                ctx.closePath();
                ctx.fillText(s.values[i].toFixed(config.precision), pos + config.barSize * msf / 2, gh + oy - s.values[i] * isf - config.fontSize * 0.2);
                pos += config.barSize * msf + config.gap.inner * msf;
            });
            pos -= config.gap.inner * msf;
            i++;
        });


        drawXAxis();
        if (config.showInverseAxis) 
            drawYAxis();

        ctx.textAlign = "right"
        if (config.marks > 0) {
            let markSep = gh / config.marks;
            for (let i = 0; i < config.marks; i++) {
                ctx.beginPath();
                ctx.moveTo(ox, oy + i * markSep);
                ctx.setLineDash([10, 10]);
                ctx.lineWidth = config.lineWidth/2;
                ctx.lineTo(cvw - ls/2, oy + i * markSep);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.lineWidth = config.lineWidth;
                ctx.closePath();
                ctx.fillText((max - i * markSep * max / gh).toFixed(config.precision), ox - config.fontSize / 4, oy + i * markSep);
            }
        }

        

    } else if (config.mainAxis === "y") {
        

        // Main scale factor, multiply by this to convert something to the canvas size
        let msf =  gh / fullSize;
        // Inverse scale factor
        let isf = gw / max;

        let pos = oy;
        let i = 0;

        ctx.textBaseline = "middle";
        labels.forEach(l => {
            ctx.textAlign = "right";
            pos += config.gap.outer * msf;

            ctx.fillStyle = "black";
            ctx.fillText(l, ox - config.fontSize / 4, pos + (config.barSize * cs + config.gap.inner * (cs - 1)) * msf / 2);

            ctx.textAlign = "left";
            series.forEach(s => {
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.rect(ox, pos, s.values[i] * isf, config.barSize * msf);
                ctx.fill();
                ctx.closePath();
                ctx.fillText(s.values[i].toFixed(config.precision), ox + s.values[i] * isf + ls/8, pos + config.barSize * msf / 2);
                pos += config.barSize * msf + config.gap.inner * msf;
            });
            pos -= config.gap.inner * msf;
            i++;
        });
        ctx.textBaseline = "alphabetic";



        drawYAxis();
        if (config.showInverseAxis)
            drawXAxis();

        ctx.textAlign = "center"
        if (config.marks > 0) {
            let markSep = gw / config.marks;
            for (let i = 1; i <= config.marks; i++) {
                ctx.beginPath();
                ctx.moveTo(ox + i * markSep, oy + gh);
                ctx.setLineDash([10, 10]);
                ctx.lineWidth = config.lineWidth/2;
                ctx.lineTo(ox + i * markSep, ls / 2);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.lineWidth = config.lineWidth;
                ctx.closePath();
                ctx.fillText((i * markSep * max / gw).toFixed(config.precision), ox + i * markSep, oy + gh + config.fontSize);
            }
        }
    } else {
        throw new Error(`mainAxis configuration's value can only be "x" or "y"`);
    }

    

    
}