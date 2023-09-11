import * as d3 from 'd3';


export default function RnaVolcanoD3() {

    var xMin = -5;
    var xMax = 5;
    var yMin = 0;
    var yMax = 100;

    var width = 640;
    var height = 400;

    var marginTop = 20;
    var marginRight = 20;
    var marginBottom = 30;
    var marginLeft = 40;
    var filterPValue = 0.0;
    var filterFC = 0.0;

    var selectedGenes = [];
    var showLabels = false;
    var chartId = "";
    
    function chart(container, dataArray) {

        // Create the SVG container.
        const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", chartId);

        // Declare the x (horizontal position) scale.
        var x = d3.scaleLinear()
            .domain([xMin - 10, xMax + 10])
            .range([marginLeft, width - marginRight]);
        
        // Declare the y (vertical position) scale.
        var y = d3.scaleLinear()
            .domain([yMin - 10, yMax + 10])
            .range([height - marginBottom, marginTop]);

        // Add the x-axis.
        const gx = svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x));
        
        // Add the y-axis.
        const gy = svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y));

        // Add the x-axis label.
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height - 2)
            .text("Log2FC")
            .style("fill", "black")
            .style("font-size", "10px")
            .style("font-weight", "bold");
        
        // Add the y-axis label.
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", -height / 2)
            .attr("y", 10)
            .attr("transform", "rotate(-90)")
            .text("-Log10(p-value)")
            .style("fill", "black")
            .style("font-size", "10px")
            .style("font-weight", "bold");

        //Points
        let points = svg.selectAll("path")
        //make sure the data is going to be valid for the chart
            .data(dataArray.filter(d => d.log2FoldChange != null && d.negLog10Pvalue != null && !isNaN(d.log2FoldChange) && !isNaN(d.negLog10Pvalue)))
            .enter()
            .append("path") // Use <path> instead of <line>
            .attr("d", (d) => `M${x(d.log2FoldChange)},${y(d.negLog10Pvalue)} L${x(d.log2FoldChange)},${y(d.negLog10Pvalue)}`)
            .attr("stroke-width",function(d){
                if (selectedGenes.includes(d["external_gene_name"])) {
                    return 10;
                } else {
                    return 4;
                }
            }) 
            .attr("stroke-linecap", "round")
            .style("stroke", function(d){
                if (selectedGenes.includes(d["external_gene_name"])) {
                    return "#E6C153";
                } else {

                    return d["color"];
                }
            })
            .classed("selected", function(d){
                if (selectedGenes.includes(d["external_gene_name"])) {
                    return true;
                } else {
                    return false;
            }})
            .on("mouseover", handleMouseEnter)
            .on("mouseout", handleMouseLeave)
            .on("click", handleSelection);

        //get all the selected points and put them on top
        let selectedPoints = svg.selectAll(".selected");
        selectedPoints.raise();

        //If showLabels then add the labels to the selected points otherwise do nothing
        if (showLabels) {
            var selectedData = selectedPoints.data();

            //add a background rec for the labels
            svg.selectAll(null)
            .data(selectedData)
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.log2FoldChange) + 7; })
            .attr("y", function(d) { return y(d.negLog10Pvalue) - 20; })
            .attr("width", function(d) { return (d["external_gene_name"].length * 5) + 12; })
            .attr("height", 15)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", "whitesmoke")
            .style("opacity", 0.75);

            //small line from the point to the label
            svg.selectAll(null)
            .data(selectedData)
            .enter()
            .append("line")
            .attr("x1", function(d) { return x(d.log2FoldChange) + 3.3; })
            .attr("y1", function(d) { return y(d.negLog10Pvalue) - 3.3; })
            .attr("x2", function(d) { return x(d.log2FoldChange) + 8; })
            .attr("y2", function(d) { return y(d.negLog10Pvalue) - 8; })
            .attr("stroke-width", .5)
            .attr("stroke", "black")
            .style("opacity", .6);


            svg.selectAll(null) // selectAll(null) will create an empty selection to append new elements to
            .data(selectedData)
            .enter()
            .append("text")
            .attr("x", function(d) { return x(d.log2FoldChange) + 10; })
            .attr("y", function(d) { return y(d.negLog10Pvalue) - 10; })
            .text(function(d) { return d["external_gene_name"]; })
            .style("fill", "black")
            .style("font-weight", "bold")
            .style("font-size", "10px")
            .style("opacity", .95);

        }

//--------------------------------------------------------------------------------------------Lines
        // FC Filter Line
        // If FC is 0, then the line will be at 0 and there will only be one line and box
        if (filterFC == 0.0) {
            //Adds a box over the fc line that gives it a shaded effect
            var fcBox = svg.append("rect")
                .attr("x", function() {
                    if (filterFC == 0.0) {
                        //Small offset to center the box, will change dependign on the size of the box and line
                        return x(0.0 - .15);
                    }
                    //Small offset to center the box, will change dependign on the size of the box and line
                    return x(filterFC - .15)
                })
                .attr("y", marginTop)
                .attr("width", 4)
                .attr("height", height - marginTop - marginBottom)
                .attr("fill", "blue")
                .attr("opacity", 0.3)
                .attr("id", "fc-box");

            var fcLine = svg.append("line")
                .attr("x1", function() {
                    if (filterFC == 0.0) {
                        return x(0.0);
                    }
                    return x(filterFC);
                })
                .attr("y1", marginTop)
                .attr("x2", function() {
                    if (filterFC == 0.0) {
                        return x(0.0);
                    }
                    return x(filterFC);
                })
                .attr("y2", height - marginBottom)
                .attr("stroke-width", 2)
                .attr("stroke", "blue")
                .attr("stroke-dasharray", "5,5")
                .attr("id", "fc-line");
        } else {
            //If the fc is not zero we will do lines and boxes for both the positive and negative sides

            //Adds a box over the fc line that gives it a shaded effect for the positive side
            var fcBox = svg.append("rect")
                .attr("x", function() {
                    if (filterFC == 0.0) {
                        //Small offset to center the box, will change dependign on the size of the box and line
                        return x(0.0 - .1);
                    }
                    //Small offset to center the box, will change dependign on the size of the box and line
                    return x(filterFC - .1)
                }
                )
                .attr("y", marginTop)
                .attr("width", 4)
                .attr("height", height - marginTop - marginBottom)
                .attr("fill", "red")
                .attr("opacity", 0.3)
                .attr("id", "fc-box");
            
            // FC Filter Line Positive
            var fcLine = svg.append("line")
                .attr("x1", function() {
                    if (filterFC == 0.0) {
                        return x(0.0);
                    }
                    return x(filterFC);
                }
                )
                .attr("y1", marginTop)
                .attr("x2", function() {
                    if (filterFC == 0.0) {
                        return x(0.0);
                    }
                    return x(filterFC);
                }
                )
                .attr("y2", height - marginBottom)
                .attr("stroke-width", 2)
                .attr("stroke", "red")
                .attr("stroke-dasharray", "5,5")
                .attr("id", "fc-line");

            //Adds a box over the fc line that gives it a shaded effect for the negative side
            var fcBox2 = svg.append("rect")
                .attr("x", function() {
                    if (filterFC == 0.0) {
                        //Small offset to center the box, will change dependign on the size of the box and line
                        return x(0.0 - .1);
                    }
                    //Small offset to center the box, will change dependign on the size of the box and line
                    return x(-filterFC - .1)
                }
                )
                .attr("y", marginTop)
                .attr("width", 4)
                .attr("height", height - marginTop - marginBottom)
                .attr("fill", "blue")
                .attr("opacity", 0.3)
                .attr("id", "fc-box");

            // FC Filter Line Negative
            var fcLine2 = svg.append("line")
                .attr("x1", function() {
                    if (filterFC == 0.0) {
                        return x(0.0);
                    }
                    return x(-filterFC);
                }
                )
                .attr("y1", marginTop)
                .attr("x2", function() {
                    if (filterFC == 0.0) {
                        return x(0.0);
                    }
                    return x(-filterFC);
                }
                )
                .attr("y2", height - marginBottom)
                .attr("stroke-width", 2)
                .attr("stroke", "blue")
                .attr("stroke-dasharray", "5,5")
                .attr("id", "fc-line");
        }

        //Adds a box over the pvalue line that gives it a shaded effect
        var pValBox = svg.append("rect")
            .attr("x", marginLeft)
            .attr("y", function() {
                if (filterPValue == 0.0) {
                    //Small offset to center the box, will change dependign on the size of the box and line
                    return y(0.0 + 1.75);
                }
                //Small offset to center the box, will change dependign on the size of the box and line
                return y(-Math.log10(filterPValue) + 1.75)
            })
            .attr("width", width - marginLeft - marginRight)
            .attr("height", 4)
            .attr("fill", "green")
            .attr("opacity", 0.3)
            .attr("id", "pval-box");

        // pValue Filter Line
        var pValLine = svg.append("line")
        .attr("x1", marginLeft)
        .attr("y1", function() {
            if (filterPValue == 0.0) {
                return y(0.0);
            }
            return y(-Math.log10(filterPValue))
        })
        .attr("x2", width - marginRight)
        .attr("y2", function() {
            if (filterPValue == 0.0) {
                return y(0.0);
            }
            return y(-Math.log10(filterPValue));
        })
        .attr("stroke-width", 2)
        .attr("stroke", "green")
        .attr("stroke-dasharray", "5,5")
        .attr("id", "pval-line");
//--------------------------------------------------------------------------------------------Hovering
        function handleMouseEnter(event, d) {
            //get the point that was hovered
            let point = d3.select(this);
            let classes = point.attr("class");

            if ((!classes || !point.attr("class").includes("selected")) && !(selectedGenes.includes(d["external_gene_name"]))) {
                point.attr("stroke-width", 10);
                point.style("stroke", "#92140C");
            } 
            //get the tooltip element
            let tip = d3.select("#tool-tip");
            //set the text of the tooltip
            tip.text(d["external_gene_name"])
            //move it to the current location of the data point
                .style("left", (event.pageX + 10) + "px")  // 10 pixel offset to right
                .style("top", (event.pageY - 28) + "px")   // 28 pixel offset upwards, you can adjust
            //set the visibility of the tooltip to visible
                .style("display", "block");

        }
        
        function handleMouseLeave(event, d) {
            //get the point that was hovered
            let point = d3.select(this);
            let classes = point.attr("class");

            if ((classes && point.attr("class").includes("selected")) || selectedGenes.includes(d["external_gene_name"])) {
                //do nothing
            } else {
                point.attr("stroke-width", 4);
                point.style("stroke", (d) => d["color"]);
            }

            //hide the tooltip
            d3.select("#tool-tip").style("display", "none");
        }

//--------------------------------------------------------------------------------------------Selecting
        function handleSelection(event, d) {
            let point = d3.select(this);
            let classes = point.attr("class");

            //if classes contains selected, remove it
            if (classes && point.attr("class").includes("selected")) {
                point.classed("selected", false)
                    .style("stroke", (d) => d["color"])
                    .attr("stroke-width", 4);
            } else {
                point.classed("selected", true) 
                    .attr("stroke-width", 10)
                    .style("stroke", "#E6C153");
            }

            //Get the tooltip and hide it
            d3.select("#tool-tip").style("display", "none");
        }

//--------------------------------------------------------------------------------------------Brush Zooming
        var brushTip = svg.append("text")
            .attr("x", (width/2))
            .attr("y", 10)
            .text("Brushing")
            .style("fill", "black")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .style("display", "none")
            .attr("id", "brush-tip");

        function startBrush(event) {
            console.log("Start");
        }

        function brushing(event) {
            console.log("brushing");
        }

        function endBrush(event) {
            console.log("End");
        }

        var brush = d3.brush()
            .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
            .on("start", startBrush)
            .on("brush", brushing)
            .on("end", endBrush)
            .keyModifiers(true);

        function enableBrush() {
            svg.append("g")
                .attr("class", "brush")
                .call(brush);
        }

        function disableBrush() {
            svg.select(".brush").remove();
        }

        function showBrushTip() {
            brushTip.style("display", "block");
        }

        function hideBrushTip() {
            brushTip.style("display", "none");
        }

        var shiftPressed = false;

        d3.select(window)
            .on("keydown", function(event) {
                if (event.keyCode == 16 && !shiftPressed) {
                    enableBrush();
                    showBrushTip();
                } else if (event.keyCode == 16 && shiftPressed) {
                    disableBrush();
                    hideBrushTip();
                }
            });

        //Add the svg to the actual container
        d3.select(container.appendChild(svg.node()));
    };

    chart.setXMin = function(newXMin) {
        xMin = newXMin;
        return chart;
    };

    chart.setXMax = function(newXMax) {
        xMax = newXMax;
        return chart;
    };

    chart.setYMin = function(newYMin) {
        yMin = newYMin;
        return chart;
    }

    chart.setYMax = function(newYMax) {
        yMax = newYMax;
        return chart;
    }

    chart.setWidth = function(newWidth) {
        width = newWidth;
        return chart;
    }

    chart.setHeight = function(newHeight) {
        height = newHeight;
        return chart;
    }

    chart.setSelection = function(newSelection) {
        selectedGenes = [];
        for (let gene of newSelection) {
            selectedGenes.push(gene["external_gene_name"]);
        }
        return chart;
    }

    chart.setPvalue = function(newPvalue) {
        filterPValue = newPvalue;
        return chart;
    }

    chart.setFC = function(newFC) {
        filterFC = newFC;
        return chart;
    }

    chart.setShowLabels = function(showLabel) {
        showLabels = showLabel;
        return chart;
    }

    chart.setID = function(id) {
        chartId = id;
        return chart;
    }
    
    // Returns the chart function....
    return chart;
}