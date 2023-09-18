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
            selectedGenes: Array,
            summaryData: Object,
            axGenes: Array,
            axGroups: Array,
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
                
                let norms = this.getNorms(this.summaryData);

                if (container != null) {
                    let width = container.clientWidth;
                    let height = container.clientHeight;

                    this.hmChart = RnaHeatmapD3()
                        .setYValues(this.axGroups)
                        .setXValues(this.axGenes)
                        .setHeight(height)
                        .setWidth(width)
                        .setId('heatmap-chart');

                    this.hmChart(container, this.selectedGenes, norms);
                }
            },
            getNorms(sumData) {
                let norms = [];
                let mins = [];
                let maxs = [];

                for (let group of this.axGroups) {
                    mins.push(sumData[group]['range'][0]);
                    maxs.push(sumData[group]['range'][1]);
                }
                
                let min = Math.min(...mins);
                let max = Math.max(...maxs);
                norms = [min, max];

                return norms;
            },
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
    #tool-tip{
        position: absolute;
        display: none;
        width: auto;
        height: auto;
        background: none repeat scroll 0 0 #4F4F54;
        border-radius: 8px;
        box-shadow: -3px 3px 15px #888888;
        color: white;
        font: 12px sans-serif;
        padding: 5px;
        text-align: center;
    }

    #chart-container {
        width: 100%;
        height: 100%;
    }

</style>