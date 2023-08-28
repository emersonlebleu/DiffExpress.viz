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
    
    function chart(container, dataArray) {

        // Create the SVG container.
        const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height);

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
                    return "#DC5EB6";
                } else {

                    return d["color"];
                }
            })
            .classed("point-of-interest", function(d){
                if (selectedGenes.includes(d["external_gene_name"])) {
                    return true;
                } else {
                    return false;
            }})
            .on("mouseover", handleMouseEnter)
            .on("mouseout", handleMouseLeave)
            .on("click", handleSelection);

        let selectedPoints = svg.selectAll(".point-of-interest")
            .style("stroke", "#DC5EB6")

        for (let node of selectedPoints.nodes()) {
            svg.append(() => node);
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
                .attr("fill", "blue")
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
                .attr("stroke", "blue")
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
            } else if (d["external_gene_name"] in selectedGenes) {
                //do nothing
            } else {
                point.classed("selected", true) 
                    .attr("stroke-width", 10)
                    .style("stroke", "#E6C153");
            }
        }
       
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
    
    // Returns the chart function....
    return chart;
}