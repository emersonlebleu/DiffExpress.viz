<template>
      <v-overlay
        persistent
        scroll-strategy="block"
        class="align-center justify-center"
        v-model="showOverlay"
        v-if="headersList && mosaicFileExt">
        <HeaderSelectDialog
          :openedFromHomeObj="{isFromHome: true, projectId: mosaicProjectId, fileName: mosaicFileName, mosaicGeneList: mosaicGeneList}"
          :headers="headersList"
          :fileExt="mosaicFileExt"
          @closeBtnClicked="setFileAndFormat"
          @closeNoData="showOverlay = !showOverlay"></HeaderSelectDialog>
      </v-overlay>

      <div class="home-chart-container">

        <div id="volc-tips">
          ?
          <v-tooltip
              max-width="300"
              id="volcano-instructions"
              activator="parent"
              location="bottom">
            <ul>
              <br>
              <li>Click points to select them and show their labels.</li>
              <li>Press shift to toggle zooming and panning.</li>
              <li>Use filters and options in the right side bar to filter data and highlight/select genes.</li>
            </ul>
          </v-tooltip>
        </div>

        <RnaVolcanoCard class="data-card"
        :class="subChartSelection == 'None' ? 'full-height' : 'half-height'" 
        :data="diffGeneList" 
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
      :hardFilterPVal="hardFilterPV"
      :selectedGenes="optionsSelectedGenes"
      :genes="diffGeneList"
      :showSelectedLabels="showSelectedLabels"
      :subChartSelect="subChartSelection"
      :hardFilterFoldChange="hardFilterFC"
      :hmGroupNamesPresent="hmGroupNames.length > 0"
      :showOverlayFromParent="showOverlay"
      :mosaicFileName="mosaicFileName"
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
  import processData from './data/processData.js';
  import MosaicSession from './models/MosaicSession.js'
  import fetchFileOnline from './data/fetchFileOnline';
  import parseHeaders from './data/parseHeaders';
  import HeaderSelectDialog from './components/parts/HeaderSelectDialog.vue';
  
  export default {
    name: 'App',
    components: {
      RnaVolcanoCard,
      RnaHeatmapCard,
      OptionsMenu,
      HeaderSelectDialog,
    }, 
    data() {
      return {
        diffGeneList: [],
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
        hardFilterPV: false,
        volcSelectedGenes: [],
        optionsSelectedGenes: [],
        showSelectedLabels: true,
        subChartSelection: 'Heatmap',
        numOfGenes: 0,
        fileFormat: {},
        hardFilterFC: false,

        mosaicUrlParams: null,
        mosaicLink: null, 
        mosaicGeneList: null,
        mosaicFileName: null,
        mosaicFileExt: null,
        mosaicProjectId: null,
        mosaicFileText: null,

        headersList: null,
        showOverlay: false, //To be used if loading from mosaic which requires an auto show of the overlay on load
      }
    },
    async mounted() {
      this.init();
    },
    created(){
      //grab the url params and store the token in local storage
      this.mosaicUrlParams = new URLSearchParams(window.location.search);
      if (this.mosaicUrlParams.get('access_token')){
        localStorage.setItem('mosaic-iobio-tkn', this.mosaicUrlParams.get('access_token'));
      } else {
        localStorage.setItem('mosaic-iobio-tkn', '');
      }
    },
    methods: {
      async init() {
        if (localStorage.getItem('mosaic-iobio-tkn') && localStorage.getItem('mosaic-iobio-tkn').length > 0) {
          //Get all the parameters from the url
          this.mosaicProjectId = Number(this.mosaicUrlParams.get('project_id'));

          let geneListId = this.mosaicUrlParams.get('gene_set_id');

          let tokenType = this.mosaicUrlParams.get('token_type');
          let source = this.mosaicUrlParams.get('source');
          let file_id = null;

          let clientAppNum = this.mosaicUrlParams.get('client_application_id');

          //make a new session to use methods from the mosaic session class
          let session = new MosaicSession(clientAppNum);
          session.promiseInit(source, this.mosaicProjectId, tokenType, geneListId, file_id);

          let fileInformation = await session.promiseGetFileForDiffExp(this.mosaicProjectId); //Get the file so that we can pull the name, id
          file_id = fileInformation["data"][0].id; //Assign the file id to the file_id variable
          this.mosaicFileName = fileInformation["data"][0].name; //Assign the file name to the mosaicFileName variable

          //if there is a gene set id then get the gene list
          if (geneListId) {
            let geneListObj = await session.promiseGetGeneSet(this.mosaicProjectId, geneListId);
            this.mosaicGeneList = geneListObj.genes;
          }

          let fileURL = await session.promiseGetSignedUrlForFile(this.mosaicProjectId, file_id); //get the file from the project
          let fetchObj = await fetchFileOnline(fileURL.url); //get the file from the signed url
          
          this.mosaicFileText = fetchObj.text; //get the text of the file
          this.mosaicFileExt = fetchObj.format.split('/')[1].split(';')[0]; //get the extension; just want the "plain" or possibly "csv" part of the string

          this.headersList = parseHeaders(this.mosaicFileText, this.mosaicFileExt); //set the headers list to the parsed headers

          this.showOverlay = true; //open dialog to select the file headers

          this.populateData(); //jump to normal data flow with the file, headers, and format

          //set to show the name of proj. and file where "demo" usually is
        } else {
          this.populateData(); //Otherwise there is no mosaic token so just show the demo data and go with a normal flow
        }
      },
      async setFileAndFormat(fileFormat) {
        this.fileFormat = fileFormat;
        this.selectedFile = this.mosaicFileText;
        this.showOverlay = false;
        this.isDemo = false;
        await this.populateData(); //wait for this to finish before changing the mosaic list to null; we need the list to populate the selected genes before we set it to null
        this.mosaicGeneList = null;
      },
      resetState(){
        this.diffGeneList = [];
        this.summaryData = {};
        this.isDemo = true;
        this.selectedFile = '';
        this.pFilterVal = 0.0;
        this.fcFilterVal = 0.0;
        this.hmGenes = [];
        this.hmGeneNames = [];
        this.hmGroupNames = [];
        this.hmSummaryData = {};
        this.hardFilterPV = false;
        this.volcSelectedGenes = [];
        this.optionsSelectedGenes = [];
        this.showSelectedLabels = true;
        this.subChartSelection = 'Heatmap';
        this.numOfGenes = 0;
        this.fileFormat = {};
        this.hardFilterFC = false;

        this.mosaicUrlParams = null;
        this.mosaicLink = null;
        this.mosaicGeneList = null;
        this.mosaicFileName = null;
        this.mosaicFileExt = null;
        this.mosaicProjectId = null;
        this.mosaicFileText = null;

        this.headersList = null;
      },
      closeNoData() {
        this.resetState();
        this.showOverlay = false;
      },
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
      updateHardFilter(pv, fc) {
        //new value of hard filter
        this.hardFilterPV = pv;
        this.hardFilterFC = fc;
        this.populateData();
      },
      updateHmSelect(n) {
        this.hmGenes = n;
        this.hmGeneNames = this.getHmGeneNames(this.hmGenes);
        this.hmSummaryData = this.getHmSummaryData(this.hmGenes, this.hmGroupNames);
      },
      syncSelectedGenes(n, source=null) {
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
        if (file && format && file !== this.selectedFile) {
          this.resetState();
          this.fileFormat = format;
          this.selectedFile = file;
          this.isDemo = false;
          this.populateData();
        } else if (!file || file == '') {
          this.resetState();
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
        let geneNames = [];
        //go through the data and get the group names & gene names as two lists
        for (let dataObj of hmGenes) {
          //get the gene names add to names list
          geneNames.push(dataObj.geneName)
        }
        return geneNames;
      },
      getHmSummaryData(data, groupNames) {
        //Used to get summary data that is reflective of the scale of the selected hm data
        let stats = {};

        for (let i = 0; i < groupNames.length; i++) {
            let label = groupNames[i];

            function createColumn(label, geneList) {
              let column = [];
              for (let diffGene of geneList) {
                  if (!isNaN(parseFloat(diffGene.groupDataObj[label]))) {
                    column.push(parseFloat(diffGene.groupDataObj[label]))
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
          let outputData = await processData(this.isDemo, this.pFilterVal, this.fcFilterVal, this.hardFilterPV, this.hardFilterFC, this.selectedFile, this.fileFormat);

          [this.diffGeneList, this.summaryData, this.hmGroupNames, this.numOfGenes] = outputData;

          //If there is a mosaic gene list then we want to have the selected genes be the genes from the mosaic gene list
          if (this.mosaicGeneList && !this.isDemo) { //should only ever be true the first time we populate after a mosaic file is selected
            let newVolcSelectedGenes = [];
            for (let geneName of this.mosaicGeneList) {
              let geneObj = this.diffGeneList.find(obj => obj.geneName === geneName);
              if (geneObj) {
                newVolcSelectedGenes.push(geneObj);
              }
            }
            this.volcSelectedGenes = newVolcSelectedGenes;
            this.optionsSelectedGenes = this.volcSelectedGenes;
          } else {
            //Ensure that the volcSelec genes are still in the data if this is running this is not the first time we are populating data or a mosaic file was not selected
            let newVolcSelectedGenes = [];
            for (let diffGene of this.volcSelectedGenes) {
              let geneName = diffGene.geneName;
              let geneObj = this.diffGeneList.find(obj => obj.geneName === geneName);
              if (geneObj) {
                newVolcSelectedGenes.push(geneObj);
              }
            }
            this.volcSelectedGenes = newVolcSelectedGenes;
            this.optionsSelectedGenes = this.volcSelectedGenes;
          }

          this.updateHmSelect(this.volcSelectedGenes);

          //If there are no group names then the heatmap options should be removed
          if (this.hmGroupNames.length == 0) {
            this.subChartSelection = 'None';
          }

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
    position: relative;
  }
  #volc-tips {
    position: absolute;
    top: 0;
    right: -2em;
    margin: 1em;
    padding: 0.05em .5em;
    background-color: #f5f5f5;
    border-radius: 50%;
    border: 1px solid #d2cdcd;
    font-size: 1em;
    font-weight: bold;
    cursor: pointer;
  }

</style>