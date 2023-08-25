<template>
    <div ref="volcano" id="chart-container" @click="handleClick"></div>
    <div id="tool-tip"></div>
</template>
 
<script>
    import RnaVolcanoD3 from '../../d3/RnaVolcano.d3.js';
    import * as d3 from 'd3';

    export default {
        name: 'RnaVolcanoViz',
        props: {
            data: Array,
            selection: String,
            summaryData: Object,
            pFilterVal: Number,
            fcFilterVal: Number,
        },
        data() {
            return {
                volcChart: null,
            }
        },
        mounted() {
            //no longer need condition as the chart is not rendered at all until data is loaded
            this.drawVolc();
            //allow the chart to resize when the window resizes
            window.addEventListener('resize', this.drawVolc);
        },
        updated() {
            this.drawVolc();
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.drawVolc);
        },
        methods: {
            drawVolc() {
                let container = this.$refs.volcano;

                if (this.volcChart) {
                    //clear container
                    d3.select(container).selectAll("*").remove();
                }
                
                let xMin = this.summaryData.log2FoldChange.range[0];
                let xMax = this.summaryData.log2FoldChange.range[1];
                let yMin = this.summaryData.negLog10Pvalue.range[0];
                let yMax = this.summaryData.negLog10Pvalue.range[1];
                let width = container.clientWidth;
                let height = container.clientHeight;

                this.volcChart = RnaVolcanoD3()
                    .setXMin(xMin)
                    .setXMax(xMax)
                    .setYMin(yMin)
                    .setYMax(yMax)
                    .setHeight(height)
                    .setWidth(width)
                    .setPvalue(this.pFilterVal)
                    .setFC(this.fcFilterVal)
                    .setSelection(this.selection);

                this.volcChart(container, this.data);
            },
            handleClick(event){
                this.$emit('click', event);
            }
        },
        emits: ['click'],
        watch: {
            summaryData(newVal, oldVal) {
                if (Object.keys(newVal).length > 0) {
                    this.drawVolc();
                } else if (newVal !== oldVal && Object.keys(newVal).length > 0) {
                    this.drawVolc();
                };
            },
            selection(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.drawVolc();
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
