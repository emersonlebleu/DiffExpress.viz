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
      :summaryData="hmSummaryData"
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
        hmSummaryData: {},
      }
    },
    async mounted() {
      this.populateData();
    },
    methods: {
      updateHmSelect(n) {
        this.hmData = n;
        this.hmGeneNames = this.getHmGeneNames(this.hmData);
        this.hmSummaryData = this.getHmSummaryData(this.hmData, this.hmGroupNames);
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
      getHmSummaryData(data, groupNames) {
        //Used to get summary data that is reflective of the scale of the selected hm data
        let stats = {};

        for (let i = 0; i < groupNames.length; i++) {
            let label = groupNames[i];

            function createColumn(label, dataObj) {
              let column = [];
              for (let data of dataObj) {
                  if (!isNaN(parseFloat(data[label]))) {
                    column.push(parseFloat(data[label]))
                  } 
              }
              return column;
            }

            let column = createColumn(label, data);

            if (typeof column[0] === 'number') {
              stats[label] = {
                range: [Math.min(...column), Math.max(...column)],
                mean: column.reduce((total, current) => total + current, 0) / column.length,
              }

              stats[label].stdDev = Math.sqrt(column.reduce((total, current) => total + Math.pow(current - stats[label].mean, 2), 0) / column.length);
            }
        }
        return stats;
      },
      async populateData() {
        try {
          let outputData = await fetchData(this.selectedFile, this.pFilterVal, this.fcFilterVal);
          this.data = outputData[0];

          this.summaryData = outputData[1];
          this.geneNames = outputData[2];
          this.hmGroupNames = outputData[3];

          this.hmGeneNames = this.getHmGeneNames(this.hmData);
          this.hmSummaryData = this.getHmSummaryData(this.hmData, this.hmGroupNames);

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