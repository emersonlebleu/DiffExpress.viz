<template>
    <div class="rna-hm-card-container" ref="hmCardContainer">
        <p class="card-title">RNA Heatmap</p>
  
        <div class="viz-container">
        <!-- Only Render Once there is Data -->
        <RnaHeatmapViz v-if="data && data.length && summaryData && Object.keys(summaryData).length" 
              :data="data" 
              :selection="selectedGene" 
              :summaryData="summaryData"/>
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
        data: Array,
        selection: String,
        summaryData: Object,
        selectedFile: String,
        geneNames: Array,
      },
      data() {
        return {
            fileSelected: this.selectedFile,
            genes: this.geneNames || [],
            selectedGene: this.selection,
        }
      },
      methods: {
        //Nothing now
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
        min-height: 85%;
    }
    .card-title {
        margin: 1em;
        font-weight: bold;
        text-align: center;

        width: 100%;
    }
  </style>