const plotXYConfig = {
    width: 1600,
    height: 900,
    scaledWidth: 100,
    lineWidth: 4,
    fontSize: 45,
    fontFamily: "sans-serif",
    offset: {
        top: 0.1,
        bottom: 0.1,
        left: 0.1,
        right: 0.05
    },
    joinDots: true,
    biggerDots: false,
    precision: {
        x: 0,
        y: 0
    },
    domain: {
        minX: undefined,
        maxX: undefined
    },
    labelMethod: {
        x: "gcd",
        y: "gcd"
    },
    grid: {
        x: true,
        y: true
    },
    marks: {
        x: 10,
        y: 5
    },
    labelSpaceFactor: {
        x: 1,
        y: 1
    },
    samplingRate: 100,
    xLabelFunction: undefined,
    defaultColors: ["orange", "purple", "green", "teal", "orangered", "indigo", "crimson", "goldenrod", "darkslateblue", "peru"],
    refs: undefined
}

const plotXY = function(canvas, functions = [], config = {}){

    function fillTextMultiline(ctx, text, x, y, lineHeight) {
        const lines = text.split('\n');
        lines.forEach((line, i) => {
            ctx.fillText(line, x, y + (i * lineHeight));
        });
    }


    for (const [key, value] of Object.entries(plotXYConfig)) {
        if (config[key] === undefined)
            config[key] = value;
    }

    functions.forEach(f => {
        if(f.dots === undefined)
            f.dots = [];
    });
    
    canvas.height = config.height;
    //canvas.style.height = `${config.height / config.width * config.scaledWidth}%`;
    canvas.width = config.width;
    canvas.style.width = `${config.scaledWidth}%`;
    let ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, config.width, config.height);
    let cvh = canvas.height;
    let cvw = canvas.width;

    let gh = cvh * (1 - config.offset.top - config.offset.bottom);
    //let gw = cvw * (1 - config.offset.left - config.offset.right);
    let gw = cvw - cvh * (config.offset.left + config.offset.right)
    let oy = cvh * config.offset.top;
    let ox = cvh * config.offset.left;

    let ls = cvh * 0.1;

    ctx.lineWidth = config.lineWidth;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(ox, gh + oy);
    ctx.lineTo(cvw - ls/2, gh + oy);
    ctx.stroke();
    ctx.closePath();
    
    ctx.beginPath();
    let path = new Path2D();
    path.moveTo(cvw, gh + oy);
    path.lineTo(cvw - ls/2, gh + oy + ls/4)
    path.lineTo(cvw - ls/2, gh + oy - ls/4)
    ctx.fill(path);
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(ox, ls/2);
    ctx.lineTo(ox, gh + oy);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    path = new Path2D();
    path.moveTo(ox, 0);
    path.lineTo(ox + ls/4, ls/2)
    path.lineTo(ox - ls/4, ls/2)
    ctx.fill(path);
    ctx.closePath();

    let minX = Math.min(...functions.map(f => Math.min(...f.dots.map(d => d.x))));
    let maxX = Math.max(...functions.map(f => Math.max(...f.dots.map(d => d.x))));
    let minY = Math.min(...functions.map(f => Math.min(...f.dots.map(d => d.y))));
    let maxY = Math.max(...functions.map(f => Math.max(...f.dots.map(d => d.y))));

    if (minX === Infinity && maxX === -Infinity && (config.domain === undefined | config.domain.minX === undefined || config.domain.maxX === undefined)) {
        console.log(config.domain)
        throw new Error("No se pudo establecer el dominio implícitamente, agregue la configuración \"domain\"");
    }

    if (minX === Infinity) minX = config.domain.minX;
    if (maxX === -Infinity) maxX = config.domain.maxX;

    functions.forEach(f => {
        if (f.fun !== undefined) {
            for(let i = minX; i <= maxX; i += (maxX - minX) / config.samplingRate) {
                f.dots.push({x: i, y: f.fun(i)});
            }
        }
    });

    minX = Math.min(...functions.map(f => Math.min(...f.dots.map(d => d.x))));
    maxX = Math.max(...functions.map(f => Math.max(...f.dots.map(d => d.x))));
    minY = Math.min(...functions.map(f => Math.min(...f.dots.map(d => d.y))));
    maxY = Math.max(...functions.map(f => Math.max(...f.dots.map(d => d.y))));

    minX = config.domain.minX !== undefined && config.domain.minX > minX ? config.domain.minX : minX;
    maxX = config.domain.maxX !== undefined && config.domain.maxX < maxX ? config.domain.maxX : maxX;

    let rangeX = maxX - minX;
    let rangeY = maxY - minY;


    function gcd(arr) {
        function gcd2(a, b) {
            if (a == 0) 
                return b; 
            return gcd2(b % a, a); 
        }

        let ret = arr[0];
        for (let i = 1; i < arr.length; i++) {
            ret = gcd2(arr[i], ret);
            if (ret === 1)
                break;
        }
        return ret;
    }

    let fontSize = config.fontSize;

    ctx.font = fontSize + "px " + config.fontFamily;
    ctx.textAlign = "right";




    if (config.labelMethod.y === "marks") {
        for (let i = 0; i <= config.marks.y; i++) {
            ctx.beginPath();
            ctx.moveTo(ox, oy + i/config.marks.y * gh);
            ctx.lineTo(ox - ox/10, oy + i/config.marks.y * gh);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillText("" + (minY + rangeY * (config.marks.y - i)/config.marks.y).toFixed(config.precision.y), ox - ox/8, oy + i/config.marks.y * gh + fontSize/3);
            ctx.closePath();
            if (config.grid.y) {
                ctx.beginPath();
                ctx.moveTo(ox, oy + i/config.marks.y * gh);
                ctx.setLineDash([10, 10]);
                ctx.lineWidth = config.lineWidth/2;
                ctx.lineTo(cvw, oy + i/config.marks.y * gh);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.lineWidth = config.lineWidth;
                ctx.closePath();
            }
        }
    } else if(config.labelMethod.y === "gcd") {
        let yValues = [];
        functions.forEach(f => {
            let arr = f.dots.map(d => d.y);
            yValues = yValues.concat(arr);
        })
        yValues =[...new Set(yValues)];
        
        yMult = gcd(yValues);
        let yMultLimit = 1/Math.pow(10, config.precision.y);
        yMult = yMult < yMultLimit ? yMultLimit : yMult;
        yValues = [];
        for (let i = minY; i <= maxY; i += yMult) {
            yValues.push(i);
        }

        let labels = [];
        let fullLength = 0;
        for (let i = 0; i < yValues.length; i++) {
            labels[i] = "" + yValues[i].toFixed(config.precision.y);
            fullLength += fontSize * config.labelSpaceFactor.y;
        }

        let labelFactor = Math.ceil(fullLength / cvh * 1.25);
        for (let i = 0; i < yValues.length; i++) {
            if (i % labelFactor !== 0) continue;
            ctx.beginPath();
            ctx.moveTo(ox, oy + i/(yValues.length-1) * gh);
            ctx.lineTo(ox - ox/10, oy + i/(yValues.length-1) * gh);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillText(labels[yValues.length - i - 1], ox - ox/8, oy + i/(yValues.length-1) * gh + fontSize/3);
            ctx.closePath();
            if (config.grid.y) {
                ctx.beginPath();
                ctx.moveTo(ox, oy + i/(yValues.length-1) * gh);
                ctx.setLineDash([10, 10]);
                ctx.lineWidth = config.lineWidth/2;
                ctx.lineTo(cvw, oy + i/(yValues.length-1) * gh);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.lineWidth = config.lineWidth;
                ctx.closePath();
            }
        }
    }

    ctx.textAlign = "center";

    if (config.labelMethod.x === "marks") {
        for (let i = 0; i <= config.marks.x; i++) {
            let label = (minX + rangeX * i/config.marks.x).toFixed(config.precision.x)
            if (config.xLabelFunction !== undefined) {
                label = config.xLabelFunction(label);
            }
            ctx.beginPath();
            ctx.moveTo(ox + i/config.marks.x * gw, oy + gh);
            ctx.lineTo(ox + i/config.marks.x * gw, oy + gh + ls/2);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            fillTextMultiline(ctx, label, ox + i/config.marks.x * gw, oy + gh + ls/2 + fontSize, fontSize);
            //ctx.fillText(label, ox + i/config.marks.x * gw, oy + gh + ls/2 + fontSize);
            ctx.closePath();
            if (config.grid.x) {
                ctx.beginPath();
                ctx.moveTo(ox + i/config.marks.x * gw, oy + gh);
                ctx.setLineDash([10, 10]);
                ctx.lineWidth = config.lineWidth/2;
                ctx.lineTo(ox + i/config.marks.x * gw, 0);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.lineWidth = config.lineWidth;
                ctx.closePath();
            }
        }
    } else if(config.labelMethod.x === "gcd") {
        let xValues = [];
        functions.forEach(f => {
            let arr = f.dots.map(d => d.x);
            xValues = xValues.concat(arr);
        })
        xValues =[...new Set(xValues)];

        xMult = gcd(xValues);
        let xMultLimit = 1/Math.pow(10, config.precision.x);
        xMult = xMult < xMultLimit ? xMultLimit : xMult;
        xValues = [];
        for (let i = minX; i <= maxX; i += xMult) {
            xValues.push(i);
        }

        let labels = [];
        let fullLength = 0;
        for (let i = 0; i < xValues.length; i++) {
            let txt ="" + xValues[i].toFixed(config.precision.x);
            if (config.xLabelFunction !== undefined) {
                txt = config.xLabelFunction(label);
            }
            labels[i] = txt;
            fullLength += ctx.measureText(txt).width * config.labelSpaceFactor.x;
        }
        let labelFactor = Math.ceil(fullLength / cvw * 1.25);

        for (let i = 0; i < xValues.length; i++) {
            if (i % labelFactor !== 0) continue;            
            ctx.beginPath();
            ctx.moveTo(ox + i/(xValues.length-1) * gw, oy + gh);
            ctx.lineTo(ox + i/(xValues.length-1) * gw, oy + gh + ls/2);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            fillTextMultiline(ctx, labels[i], ox + i/(xValues.length-1) * gw, oy + gh + ls/2 + fontSize, fontSize);
            //ctx.fillText(labels[i], ox + i/(xValues.length-1) * gw, oy + gh + ls/2 + fontSize );
            ctx.closePath();
            if (config.grid.x) {
                ctx.beginPath();
                ctx.moveTo(ox + i/(xValues.length-1) * gw, oy + gh);
                ctx.setLineDash([10, 10]);
                ctx.lineWidth = config.lineWidth/2;
                ctx.lineTo(ox + i/(xValues.length-1) * gw, 0);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.lineWidth = config.lineWidth;
                ctx.closePath();
            }
        }
    }
    
    let nextDefaultColor = 0;

    functions.forEach(f => {
        if (ctx === null) return;

        f.dots = f.dots.filter(d => d.x >= minX && d.x <= maxX && d.y >= minY && d.y <= maxY);
        
        if (f.domain !== undefined) {
            f.dots = f.dots.filter(d => (f.domain.minX === undefined || d.x >= f.domain.minX ) && (f.domain.maxX === undefined || d.x <= f.domain.maxX ));
        }
        f.dots = f.dots.sort((a,b) => a.x - b.x);

        if (f.color === undefined) {
            if (nextDefaultColor < config.defaultColors.length) {
                f.color = config.defaultColors[nextDefaultColor++];
            } else {
                f.color = "gray";
            }
        }
        ctx.strokeStyle = f.color;
        ctx.fillStyle = f.color;

        if (config.joinDots) {
            ctx.beginPath();
            ctx.moveTo(((f.dots[0].x - minX)/rangeX)*gw + ox, gh - ((f.dots[0].y - minY)/rangeY)*gh + oy);
            f.dots.forEach(d => {
                if (ctx === null) return;
                let x = ((d.x - minX)/rangeX)*gw + ox;
                let y = gh - ((d.y - minY)/rangeY)*gh + oy;
                ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.closePath();
        }

        if (config.biggerDots) {
            f.dots.forEach(d => {
                ctx.beginPath();
                let x = ((d.x - minX)/rangeX)*gw + ox;
                let y = gh - ((d.y - minY)/rangeY)*gh + oy;
                ctx.arc(x, y, config.lineWidth * 2, 0, 2*Math.PI);
                ctx.fill();
            });
        }

        if (config.refs !== undefined) {
            if (f.name !== undefined && typeof f.name === "string") {
                config.refs.innerHTML += `
                    <div class="xy_ref">
                        <div class="xy_ref_color" style="background-color:${f.color}"></div>
                        <div>${f.name}</div>
                    </div>
                `;
            }
        }
    })

    if (config.refs !== undefined) {
        config.refs.classList.add("xy_refs");
    }
}

