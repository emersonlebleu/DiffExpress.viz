<template>
    <div ref="heatmap" id="chart-container"></div>
    <div id="tool-tip"></div>
</template>
 
<script>
    import RnaHeatmapD3 from '../../d3/RnaHeatmap.d3.js';
    import * as d3 from 'd3';

    export default {
        name: 'RnaHeatmapViz',
        props: {
            data: Array,
            selection: String,
            summaryData: Object,
        },
        data() {
            return {
                hmChart: null,
            }
        },
        mounted() {
            //no longer need condition as the chart is not rendered at all until data is loaded
            this.drawHm();
            //allow the chart to resize when the window resizes
            window.addEventListener('resize', this.drawHm);
        },
        updated() {
            this.drawHm();
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.drawHm);
        },
        methods: {
            drawHm() {
                let container = this.$refs.heatmap;

                if (this.hmChart) {
                    //clear container
                    d3.select(container).selectAll("*").remove();
                }
                
                let xMin = this.summaryData.log2FoldChange.range[0];
                let xMax = this.summaryData.log2FoldChange.range[1];
                let yMin = this.summaryData.negLog10Pvalue.range[0];
                let yMax = this.summaryData.negLog10Pvalue.range[1];
                let width = container.clientWidth;
                let height = container.clientHeight;

                this.hmChart = RnaHeatmapD3()
                    .setXMin(xMin)
                    .setXMax(xMax)
                    .setYMin(yMin)
                    .setYMax(yMax)
                    .setHeight(height)
                    .setWidth(width)
                    .setSelection(this.selection);

                this.hmChart(container, this.data);
            }
        },
        watch: {
            summaryData(newVal, oldVal) {
                if (Object.keys(newVal).length > 0) {
                    this.drawHm();
                } else if (newVal !== oldVal && Object.keys(newVal).length > 0) {
                    this.drawHm();
                };
            },
            selection(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.drawHm();
                };
            },
        }
    }
</script>

<style scoped>

</style>