<template>
  <div class="rna-volc-card-container" ref="volcCardContainer">
    <p class="card-title">Volcano Plot</p>

    <div class="viz-container">
      <!-- Only Render Once there is Data -->
      <RnaVolcanoViz v-if="data && data.length && summaryData && Object.keys(summaryData).length" 
              :data="data" 
              :selection="selectedGene" 
              :summaryData="summaryData"
              :pFilterVal="pFilterVal"
              :fcFilterVal="fcFilterVal"
              @click="emitHmSelection"/>
    </div>

  </div>
</template>

<script>
  import RnaVolcanoViz from './RnaVolcanoViz.vue';
  import * as d3 from 'd3';

  export default {
    name: 'RnaVolcanoCard',
    components: {
      RnaVolcanoViz
    },
    props: {
      data: Array,
      selection: Array,
      //summary Statistics
      summaryData: Object,
      pFilterVal: Number,
      fcFilterVal: Number,
      geneNames: Array,
    },
    data() {
      return {
        fileSelected: this.selectedFile,
        pFilter: (this.pFilterVal || 0.0).toString(),
        fcFilter: (this.fcFilterVal || 0.0).toString(),
        genes: this.geneNames || [],
        selectedGene: this.selection,
      }
    },
    methods: {
      emitHmSelection() {
        //use d3 to get all of the points with the class of selected
        let selectedPoints = d3.selectAll('.selected').data();
        this.$emit('hmSelection', selectedPoints);
      },
    },
    watch: {
      geneNames: function(newVal, oldVal) {
        this.genes = newVal;
      },
    },
    mounted() {
      //Nothing Now
    }
  }
</script>

<style scoped>
  .rna-volc-card-container {     
    /* flex */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      width: 100%;
      height: 50%;

      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 5px;

      color: black;
      box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
    }
  .card-title {
    margin: 1em;
    font-weight: bold;
    text-align: center;

    width: 100%;
  }

  .viz-container {
    width: 100%;
    min-height: 85%;
  }

  @media screen and (max-width: 610px) {

    .viz-container {
    width: 100%;
    min-height: 80%;
  }
  }

</style>