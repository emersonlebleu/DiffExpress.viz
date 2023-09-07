<template>
      <div class="home-chart-container">
        <RnaVolcanoCard class="data-card"
        :class="subChartSelection == 'None' ? 'full-height' : 'half-height'" 
        :data="data" 
        :selectedGenes="volcSelectedGenes" 
        :summaryData="summaryData"
        :pFilterVal="pFilterVal"
        :fcFilterVal="fcFilterVal"
        :showSelectedLabels="showSelectedLabels"
        :numOfGenes="numOfGenes"
        @updateSelectedGenes="syncSelectedGenes"/>

        <RnaHeatmapCard v-if="subChartSelection == 'Heatmap'" class="data-card"
        :selectedGenes="hmGenes"
        :summaryData="hmSummaryData"
        :axGenes="hmGeneNames"
        :axGroups="hmGroupNames"/>  
      </div>

      <OptionsMenu 
      class="options-menu"
      :isDemo="isDemo"
      :pFilterVal="pFilterVal"
      :fcFilterVal="fcFilterVal"
      :hardFilter="hardFilter"
      :selectedGenes="optionsSelectedGenes"
      :genes="data"
      :showSelectedLabels="showSelectedLabels"
      :subChartSelect="subChartSelection"
      @newfileSelected="changeData"
      @clearSelection="clearSelection"
      @newPFilter="filterPVal"
      @newFCFilter="filterFCVal"
      @hardFilterChange="updateHardFilter"
      @updateSelectedGenes="syncSelectedGenes"
      @showLabelsChange="toggleShowLabels"
      @subChartSelectionChange="changeSubChart"/>
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
        summaryData: {},
        isDemo: true,
        selectedFile: '',
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
        volcSelectedGenes: [],
        optionsSelectedGenes: [],
        showSelectedLabels: true,
        subChartSelection: 'Heatmap',
        numOfGenes: 0,
      }
    },
    async mounted() {
      this.populateData();
    },
    methods: {
      changeSubChart(subChart) {
        this.subChartSelection = subChart;
      },
      toggleShowLabels(showLabels) {
        this.showSelectedLabels = showLabels;
      },
      clearSelection() {
        this.optionsSelectedGenes = [];
        this.volcSelectedGenes = [];
        this.updateHmSelect([]);
      },
      updateHardFilter(n) {
        //new value of hard filter
        this.hardFilter = n;
        this.populateData();
      },
      updateHmSelect(n) {
        this.hmGenes = n;
        this.hmGeneNames = this.getHmGeneNames(this.hmGenes);
        this.hmSummaryData = this.getHmSummaryData(this.hmGenes, this.hmGroupNames);
      },
      updateSelectedGenes(n) {
        //n here is the new selection object from the options menu
        this.optionsSelectedGenes = n;
      },
      syncSelectedGenes(n, source) {
        if (source === 'volcano') {
          this.updateHmSelect(n)
          this.volcSelectedGenes = n;
          this.optionsSelectedGenes = this.volcSelectedGenes;
        } else if (source === 'options') {
          this.updateHmSelect(n)
          this.optionsSelectedGenes = n;
          this.volcSelectedGenes = this.optionsSelectedGenes;
        }
      },
      changeData(file, format) {
        //n is the raw text of the file
        if (file && file !== this.selectedFile) {
          this.selectedFile = file;
          this.isDemo = false;
          this.populateData();
        } else if (!file || file == '') {
          this.selectedFile = '';
          this.isDemo = true;
          this.populateData();
        }
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
          let outputData = await fetchData(this.isDemo, this.pFilterVal, this.fcFilterVal, this.hardFilter, this.selectedFile);
          this.data = outputData[0];

          this.summaryData = outputData[1];
          this.hmGroupNames = outputData[2];
          this.numOfGenes = outputData[3];

          this.hmGeneNames = this.getHmGeneNames(this.hmGenes);
          this.hmSummaryData = this.getHmSummaryData(this.hmGenes, this.hmGroupNames);

          //VolcSelect & OptionsSelect should be the same
          //Ensure that the volcSelec genes are still in the data
          let newVolcSelectedGenes = [];
          for (let gene in this.volcSelectedGenes) {
            let geneName = this.volcSelectedGenes[gene].external_gene_name;
            let geneObj = this.data.find(obj => obj.external_gene_name === geneName);
            if (geneObj) {
              newVolcSelectedGenes.push(geneObj);
            }
          }
          this.volcSelectedGenes = newVolcSelectedGenes;
          this.optionsSelectedGenes = this.volcSelectedGenes;

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

</style>