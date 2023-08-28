<template>
    <div class="rna-hm-card-container" ref="hmCardContainer">
        <p class="card-title" v-if="selectedGenes && selectedGenes.length && summaryData && Object.keys(summaryData).length">Heatmap</p>
  
        <div class="viz-container">
        <!-- Only Render Once there is Data -->
        <RnaHeatmapViz v-if="selectedGenes && selectedGenes.length && summaryData && Object.keys(summaryData).length" 
              :selectedGenes="selectedGenes" 
              :summaryData="summaryData"
              :axGenes="genes"
              :axGroups="groups"/>

        <div id="no-hm-data" v-else>Select genes to render heatmap.</div>
        </div>
    </div>
  </template>
  
  <script>
    import RnaHeatmapViz from './RnaHeatmapViz.vue';
  
    export default {
      name: 'RnaHeatmapCard',
      components: {
        RnaHeatmapViz
      },
      props: {
        selectedGenes: Array,
        summaryData: Object,
        selectedFile: String,
        axGenes: Array,
        axGroups: Array,
      },
      data() {
        return {
            fileSelected: this.selectedFile,
            genes: this.axGenes || [],
            groups: this.axGroups || [],
        }
      },
      methods: {
        //Nothing now
      },
      watch: {
        axGenes: function(newVal, oldVal) {
            this.genes = newVal;
         },
        axGroups: function(newVal, oldVal) {
            this.groups = newVal;
         },
      },
      mounted() {
        //Nothing Now
      }
    }
  </script>
  
  <style scoped>
    .rna-hm-card-container {     
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

      margin-top: 20px;

      color: black;
      box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
    }

    .viz-container {
        width: 100%;
        min-height: 95%;
    }
    .card-title {
        margin: 1em;
        font-weight: bold;
        text-align: center;

        width: 100%;
    }

    #no-hm-data {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2em;
        color: red;
        font-size: large;
        font-weight: bold;

        height: 100%;
    }
  </style>