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
  
  </style>