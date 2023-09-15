import * as d3 from 'd3';


export default function RnaHeatmapD3() {

    var xValues= [];
    var yValues = [];

    var width = 640;
    var height = 400;

    var marginTop = 20;
    var marginRight = 20;
    var marginBottom = 30;
    var marginLeft = 40;

    var chartId = "";
    
    function chart(container, dataArray, norms) {
        var min = norms[0];
        var max = norms[1];
        //log transform the min and max
        min = Math.log(min + 1);
        max = Math.log(max + 1);

        // Create the SVG container.
        const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", chartId);

        //Declare the y (vertical position) scale.
        var y = d3.scaleBand()
            .domain(yValues)
            .range([height - marginBottom - 38, marginTop]);

        //Declare the x (horizontal position) scale.
        var x = d3.scaleBand()
            .domain(xValues)
            .range([marginLeft, width - marginRight]);

        //Add the x-axis.
        const gx = svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom - 38})`)
            .call(d3.axisBottom(x));

        //rotate the x axis labels 325 degrees
        gx.selectAll("text")
            .attr("transform", "rotate(325)")
            .attr("text-anchor", "end")
            .attr("x", -3)
            .attr("y", 5);


        //Add the y-axis.
        const gy = svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y));

        
        for (let item of dataArray) {
            for (let group of yValues) {
                svg.append("rect")
                    .attr("x", x(item.geneName))
                    .attr("y", y(group))
                    .attr("width", x.bandwidth())
                    .attr("height", y.bandwidth())
                    .style("fill", function() {
                        if (item.log2FoldChange > 0) {
                            //do a natural log transform on the data because it varries so widely
                            let value = Math.log(item[group] + 1);//need the 1 so that the log of 0 is not undefined

                            //min max normalization
                            let alpha = (value - min) / (max - min);
                            //scale alpha to be between 0.1 and 1
                            alpha = alpha * 0.9 + 0.01;

                            return `rgba(225, 0, 0, ${alpha})`;
                        } else {
                            //do a natural log transform on the data because it varries so widely
                            let value = Math.log(item[group] + 1); 

                            //min max normalization
                            let alpha = (value - min) / (max - min);
                            //scale alpha to be between 0.1 and 1
                            alpha = alpha * 0.9 + 0.01;

                            return `rgba(0, 0, 225, ${alpha})`;
                        }
                    });
                
                //Append text to the heatmap get the number at the group and gene intersection
                svg.append("text")
                    .attr("x", x(item.geneName))
                    .attr("y", y(group))
                    .attr("dx", x.bandwidth() / 2)
                    .attr("dy", y.bandwidth() / 2)
                    .attr("text-anchor", "middle")
                    .attr("alignment-baseline", "middle")
                    .attr("font-size", "10px")
                    .text(parseFloat(item[group]).toFixed(2));
            }  
        }

        //Add the svg to the actual container
        d3.select(container.appendChild(svg.node()));
    };

    chart.setYValues = function(newYValues) {
        yValues = newYValues;
        return chart;
    };

    chart.setXValues = function(newXValues) {
        xValues = newXValues;
        return chart;
    };

    chart.setWidth = function(newWidth) {
        width = newWidth;
        return chart;
    }

    chart.setHeight = function(newHeight) {
        height = newHeight;
        return chart;
    }

    chart.setId = function(newId) {
        chartId = newId;
        return chart;
    }
    
    // Returns the chart function....
    return chart;
}