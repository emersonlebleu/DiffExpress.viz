<template>

      <div class="home-chart-container">
        <RnaVolcanoCard class="data-card" 
        :data="data" 
        :selection="selection" 
        :summaryData="summaryData"
        :selectedFile="selectedFile"
        :pFilterVal="pFilterVal"
        :fcFilterVal="fcFilterVal"
        :geneNames="geneNames"
        @hmSelection="updateHmSelect"/>

        <RnaHeatmapCard class="data-card"
        :data="hmData"
        :selection="selection"
        :summaryData="hmSummaryData"
        :selectedFile="selectedFile"
        :axGenes="hmGeneNames"
        :axGroups="hmGroupNames"/>  
      </div>

      <OptionsMenu 
      class="options-menu"
      :selectedFile="selectedFile"
      :pFilterVal="pFilterVal"
      :fcFilterVal="fcFilterVal"
      :geneNames="geneNames"
      :hardFilter="hardFilter"
      :selection="selection"
      @newfileSelected="changeData"
      @newPFilter="filterPVal"
      @newFCFilter="filterFCVal"
      @hardFilterChange="updateHardFilter"/>

</template>

<script>
  import RnaVolcanoCard from './components/viz/RnaVolcanoCard.vue';
  import RnaHeatmapCard from './components/viz/RnaHeatmapCard.vue';
  import OptionsMenu from './components/parts/OptionsMenu.vue';
  import fetchData from './data/fetchData.js';
  
  export default {
    name: 'App',
    components: {
      RnaVolcanoCard,
      RnaHeatmapCard,
      OptionsMenu,
    }, 
    data() {
      return {
        data: [], 
        selection: 'All',
        summaryData: {},
        selectedFile: 'fish',
        pFilterVal: 0.0,
        fcFilterVal: 0.0,
        geneNames: [],
        hmData: [],
        hmGeneNames: [],
        hmGroupNames: [],
        hmSummaryData: {},
        hardFilter: false,
      }
    },
    async mounted() {
      this.populateData();
    },
    methods: {
      updateHardFilter(n) {
        //new value of hard filter
        this.hardFilter = n;
        this.populateData();
      },
      updateHmSelect(n) {
        //n here is the new selection object from the volcano plot
        this.hmData = n;
        this.hmGeneNames = this.getHmGeneNames(this.hmData);
        this.hmSummaryData = this.getHmSummaryData(this.hmData, this.hmGroupNames);
      },
      changeData(n) {
        //n is the file name selection from the options
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
      //This function is the base function for populating the data all other functions that populate data are called from here when data is populated or changed by a filter
      //it is this function that is called.
      async populateData() {
        try {
          //This is the function that populates the data array the structure of this may differ in the future depending on the context
          //that the object eventually gets situated in.
          let outputData = await fetchData(this.selectedFile, this.pFilterVal, this.fcFilterVal, this.hardFilter);
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
  .home-chart-container{
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height: 100%;
    width: 100%;
    margin-left: 25%;
    
    padding: 1em;
  }

  .options-menu {
    justify-content: flex-start;
    margin: 0%;
    height: 100%;
    max-width: 300px;
    padding: 1em;
    background-color: #a7aaad;
    box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);

    overflow-y: auto;
  }

</style>