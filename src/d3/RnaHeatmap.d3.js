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

    var selectedGene = "All";
    
    function chart(container, dataArray) {

        // Create the SVG container.
        const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height);

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

    chart.setSelection = function(newSelection) {
        selectedGene = newSelection;
        return chart;
    }
    
    // Returns the chart function....
    return chart;
}