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
            selection: Array,
            summaryData: Object,
            pFilterVal: Number,
            fcFilterVal: Number,
            showSelectedLabels: Boolean,
        },
        data() {
            return {
                volcChart: null,
                selectionData: this.selection,
            }
        },
        mounted() {
            //no longer need condition as the chart is not rendered at all until data is loaded
            this.drawVolc();
            var volcCard = document.getElementById('rna-volc-card-container');
            
            const resizeObserver = new ResizeObserver(() => {
                this.drawVolc();
            });
            resizeObserver.observe(volcCard);
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
                d3.select("#zoom-tip").style("display", "none");

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
                    .setShowLabels(this.showSelectedLabels)
                    .setSelection(this.selectionData)
                    .setID('main-volcano-chart');

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
            selection: {
                handler(newVal) {
                this.selectionData = newVal;
                this.drawVolc();
            },
            deep: true
            },
        }
    }
</script>

<style scoped>
    #tool-tip{
        position: fixed;
        display: none;
        width: auto;
        height: auto;
        background: none repeat scroll 0 0 #4F4F54;
        border-radius: 5px;
        box-shadow: -3px 3px 15px #888888;
        color: rgba(255, 255, 255, 1);
        opacity: .9;
        font: 12px sans-serif;
        padding: 2px 4px;
        text-align: center;
    }

    #chart-container {
        width: 100%;
        height: 100%;
    }

</style>
