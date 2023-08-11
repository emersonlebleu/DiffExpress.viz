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
      @newFCFilter="filterFCVal"
      @hmSelection="updateHmSelect"/>

      <RnaHeatmapCard class="data-card"
      :data="hmData"
      :selection="selection"
      :summaryData="summaryData"
      :selectedFile="selectedFile"
      :axGenes="hmGeneNames"
      :axGroups="hmGroupNames"/>  

</template>

<script>
  import RnaVolcanoCard from './components/viz/RnaVolcanoCard.vue';
  import RnaHeatmapCard from './components/viz/RnaHeatmapCard.vue';
  import fetchData from './data/fetchData.js';
  
  export default {
    name: 'App',
    components: {
      RnaVolcanoCard,
      RnaHeatmapCard
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
        hmData: [],
        hmGeneNames: [],
        hmGroupNames: [],
      }
    },
    async mounted() {
      this.populateData();
    },
    methods: {
      updateHmSelect(n) {
        this.hmData = n;
        this.hmGeneNames = this.getHmGeneNames(this.hmData);
      },
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
      getHmGeneNames(hmData){
        let genes = [];
        //go through the data and get the group names & gene names as two lists
        for (let dataObj of hmData) {
          //get the gene names add to names list
          genes.push(dataObj.external_gene_name)
        }
        return genes;
      },
      getHmData(data) {
        //For now take a slice to work with
        this.hmData = data.slice(0, 20);
      },
      async populateData() {
        try {
          let outputData = await fetchData(this.selectedFile, this.pFilterVal, this.fcFilterVal);
          this.data = outputData[0];
          this.summaryData = outputData[1];
          this.geneNames = outputData[2];
          this.hmGroupNames = outputData[3];

          this.getHmData(this.data);
          this.hmGeneNames = this.getHmGeneNames(this.hmData);

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    }, 
    updated() {
    },
  }
</script>

<style scoped>

</style>