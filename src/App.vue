<template>
      <RnaVolcanoCard class="data-card" 
      :data="data" 
      :selection="selection" 
      :summaryData="summaryData"
      :selectedFile="selectedFile"
      :pFilterVal="pFilterVal"
      :fcFilterVal="fcFilterVal"
      :geneNames="geneNames"
      @newfileSelected="changeData"
      @newPFilter="filterPVal"
      @newFCFilter="filterFCVal"/>  

</template>

<script>
  import RnaVolcanoCard from './components/viz/RnaVolcanoCard.vue';
  import fetchData from './data/fetchData.js';
  
  export default {
    name: 'App',
    components: {
      RnaVolcanoCard
    }, 
    data() {
      return {
        data: [], 
        selection: 'All',
        summaryData: {},
        selectedFile: 'fish',
        pFilterVal: .05,
        fcFilterVal: .5,
        geneNames: [],
      }
    },
    async mounted() {
      this.populateData();
    },
    methods: {
      changeData(n) {
        this.selectedFile = n;
        this.populateData();
      },
      filterPVal(n) {
        this.pFilterVal = n;
        this.populateData();
      },
      filterFCVal(n) {
        this.fcFilterVal = n;
        this.populateData();
      },
      async populateData() {
        try {
          let outputData = await fetchData(this.selectedFile, this.pFilterVal, this.fcFilterVal);
          this.data = outputData[0];
          this.summaryData = outputData[1];
          this.geneNames = outputData[2];

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    }, 
    updated() {
    }
  }
</script>

<style scoped>

</style>