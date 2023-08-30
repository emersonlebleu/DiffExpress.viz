<template>
      <div class="home-chart-container">
        <RnaVolcanoCard class="data-card" 
        :data="data" 
        :selection="optionsSelection" 
        :summaryData="summaryData"
        :selectedFile="selectedFile"
        :pFilterVal="pFilterVal"
        :fcFilterVal="fcFilterVal"
        @hmSelection="updateHeatMapAndSelect"/>

        <RnaHeatmapCard class="data-card"
        :selectedGenes="hmGenes"
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
      :hardFilter="hardFilter"
      :selectedGenes="optionsSelection"
      :genes="data"
      @newfileSelected="changeData"
      @clearSelection="clearSelection"
      @newPFilter="filterPVal"
      @newFCFilter="filterFCVal"
      @hardFilterChange="updateHardFilter"
      @newSelectedGenes="updateHeatMapAndSelect"/>
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
        optionsSelection: [],
        summaryData: {},
        selectedFile: 'fish',
        pFilterVal: 0.0,
        fcFilterVal: 0.0,
        //This is the list of genes for the heatmap
        hmGenes: [],
        //This is the list of gene names for the heatmap
        hmGeneNames: [],
        //This is the list of group names for the heatmap
        hmGroupNames: [],
        //This is the summary data for the heatmap colors to use
        hmSummaryData: {},
        hardFilter: false,
      }
    },
    async mounted() {
      this.populateData();
    },
    methods: {
      clearSelection() {
        this.optionsSelection = [];
        this.hmGenes = [];
        this.hmGeneNames = [];
        this.hmSummaryData = {};
      },
      updateHardFilter(n) {
        //new value of hard filter
        this.hardFilter = n;
        this.populateData();
      },
      updateHmSelect(n) {
        //n here is the new selection object from the volcano plot
        this.optionsSelection = [];
        this.hmGenes = n;
        this.hmGeneNames = this.getHmGeneNames(this.hmGenes);
        this.hmSummaryData = this.getHmSummaryData(this.hmGenes, this.hmGroupNames);
      },
      updateSelectedGenes(n) {
        //n here is the new selection object from the options menu
        this.optionsSelection = n;
      },
      updateHeatMapAndSelect(n) {
        this.updateHmSelect(n);
        this.updateSelectedGenes(n);
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
      getHmGeneNames(hmGenes){
        let genes = [];
        //go through the data and get the group names & gene names as two lists
        for (let dataObj of hmGenes) {
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
          this.hmGroupNames = outputData[2];

          this.hmGeneNames = this.getHmGeneNames(this.hmGenes);
          this.hmSummaryData = this.getHmSummaryData(this.hmGenes, this.hmGroupNames);

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
    width: 90%;
    margin-left: 5%;
    margin-right: 5%;
    
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