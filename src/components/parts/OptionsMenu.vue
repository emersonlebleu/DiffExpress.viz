<template>
    <div class="card-tool-bar">
      
      <div v-if="isDemo" class="label-input-container demo">
        <p class="label demo">Demo</p>     
      </div>

      <v-expansion-panels v-model="openPanels" multiple>
        <v-expansion-panel>
          <v-expansion-panel-title color="rgb(19, 52, 102)">Select File</v-expansion-panel-title>
          <v-expansion-panel-text id="file-select-container">
            <div id="file-input-wrapper">
              <v-form ref="form">
                <v-file-input
                  id="file-input-field"
                  v-model="file"
                  persistent-hint
                  hint=".txt, .csv, .xls, xlsx, or xlsm file."
                  density="compact" 
                  variant="solo-filled" 
                  clearable accept=".txt, .csv, .xls, xlsx, xlsm" 
                  label="Select data file..."
                  @change="processFile"
                  @click:clear="clearFile">
                </v-file-input>
              </v-form>
            </div>
          </v-expansion-panel-text>
          <v-overlay
            persistent
            scroll-strategy="block"
            class="align-center justify-center"
            v-model="showOverlay">
            <HeaderSelectDialog
              :headers="headers"
              @closeBtnClicked="emitFileAndFormat"></HeaderSelectDialog>
          </v-overlay>
        </v-expansion-panel>
        <!-- GENE SELECTION -->
        <v-expansion-panel v-if="genesData && genesData.length">
          <v-expansion-panel-title color="rgb(19, 52, 102)">Select Genes</v-expansion-panel-title>
          <v-expansion-panel-text id="gene-selection-dropdown">
              <p class="label">Copy Paste Gene List</p>

              <div id="paste-gene-list-container">
                <v-text-field
                  clearable
                  label="Paste gene list..."
                  class="copy-paste-input" 
                  hint="Paste list seperated by spaces '_' or comma spaces ',_'"
                  density="compact"
                  v-model="cutPasteGeneList">
                </v-text-field>

                <button 
                  class="btn btn-primary"
                  id="add-gene-list-btn"
                  @click="parseGeneListText">+</button>

              </div>

              <p class="label">Search Genes</p>
              <div id="search-btn-container">
                <input 
                type="text" 
                v-model="newSearchGene.external_gene_name" 
                id="new-search-gene-input" label="Gene name" 
                placeholder="Search...">

                <button 
                v-if="geneNameslist.includes(newSearchGene.external_gene_name)" 
                class="btn btn-primary" 
                id="add-gene-btn" 
                @click="add">+</button>

              </div>
                <Typeahead
                  v-model="lookupGene" 
                  :data="genesData" 
                  target="#new-search-gene-input"
                  match-start
                  ignore-case
                  force-select
                  force-clear
                  item-key="external_gene_name"
                  @update:modelValue="updateNewSearchGene"></Typeahead>          

              <p class="label">Selected Genes</p>
              <div class="data-selector">
                <v-chip-group>
                  <p 
                  class="placeholder-text" 
                  v-if="optionsSelectedGenes.length == 0"><i>Add or select genes to display.</i></p>
                  <v-chip 
                  v-for="(gene, index) in optionsSelectedGenes"
                  :key="gene.external_gene_name + index"
                  closable 
                  size="x-small" 
                  class="chip" 
                  :class="gene.color"
                  @click:close="removeGene(gene)">
                  {{ gene.external_gene_name}}
                  </v-chip>
                </v-chip-group>
              </div>

              <button id="clear-selection-btn" @click="emitClearSelection">Clear Selection</button>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- FILTERS -->
        <v-expansion-panel>
          <v-expansion-panel-title color="rgb(19, 52, 102)">Data Filters</v-expansion-panel-title>
          <v-expansion-panel-text id="filter-selection-dropdown">

            <p class="label">Hard Filter</p>
            <div class="data-selector checkbox">
                <input type="checkbox" v-model="hardFilterData" @change="emitHardFilterChange">
            </div>

            <p class="label">Filter P </p>
            <select class="data-selector" v-model="pFilter" @change="emitPFilter">
              <option value="0">0</option>
              <option value="0.05">.05 </option>
              <option value="0.01">.01</option>
              <option value="0.001">.001</option>
              <option value="0.0001">.0001</option>
              <option value="0.00001">.00001</option>
              <option value="0.000001">.000001</option>
              <option value="0.0000001">.0000001</option>
              <option value="0.0000001">.00000001</option>
            </select>

            <p class="label">Filter FC </p>
            <select class="data-selector" v-model="fcFilter" @change="emitFCFilter">
              <option value="0">0</option>
              <option value="0.5">.5</option>
              <option value="1">1</option>
              <option value="1.5">1.5</option>
              <option value="2">2</option>
              <option value="2.5">2.5</option>
              <option value="3">3</option>
              <option value="3.5">3.5</option>
              <option value="4">4</option>
            </select>

          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- OPTIONS -->
        <v-expansion-panel>
          <v-expansion-panel-title color="rgb(19, 52, 102)">Options</v-expansion-panel-title>
          <v-expansion-panel-text id="filter-selection-dropdown">

            <p class="label">Show Labels On Select</p>
            <div class="data-selector checkbox">
                <!-- TODO Add show labels data and emit function for it -->
                <input type="checkbox" v-model="showLabels" @change="emitShowLablesChange">
            </div>

            <p class="label">Subchart Selection</p>
            <v-radio-group 
              density="compact" 
              v-model="subChartSelection"
              @change="emitSubChartSelection">
              <v-radio color="indigo-darken-3" value="None">
                <template v-slot:label>
                  <div class="radio-label">No sub-chart</div>
                </template>
              </v-radio>
              <v-radio color="indigo-darken-3" value="Heatmap">
                <template v-slot:label>
                  <div class="radio-label">View heatmap of selection</div>
                </template>
              </v-radio>
              <v-radio color="indigo-darken-3" value="Minimap">
                <template v-slot:label>
                  <div class="radio-label">Explore with zoom-map</div>
                </template>
              </v-radio>
            </v-radio-group>

          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

    </div>
</template>

<script>
  import { Typeahead } from 'uiv';
  import readFile from '../../data/readFile.js';
  import HeaderSelectDialog from './HeaderSelectDialog.vue';
  import parseHeaders from '../../data/parseHeaders';

  export default {
    name: 'OptionsMenu',
    components: {
      Typeahead,
      HeaderSelectDialog,
    },
    props: {
      isDemo: Boolean,
      pFilterVal: Number,
      fcFilterVal: Number,
      hardFilter: Boolean,
      selectedGenes: Array,
      genes: Array,
      showSelectedLabels: Boolean,
      subChartSelect: String,
    },
    data() {
      return {
        pFilter: (this.pFilterVal || 0.0).toString(),
        fcFilter: (this.fcFilterVal || 0.0).toString(),
        optionsSelectedGenes: [],
        hardFilterData: this.hardFilter || false,
        genesData: this.genes || [],
        newSearchGene: {},
        lookupGene: '',
        openPanels: [0],
        subChartSelection: this.subChartSelection || 'Heatmap',
        showLabels: this.showSelectedLabels || true,
        file: null,
        fileText: null,
        showOverlay: false,
        headers: [],
        cutPasteGeneList: '',
      }
    },
    methods: {
      emitPFilter() {
        this.$emit('newPFilter', parseFloat(this.pFilter))
      },
      emitFCFilter() {
        this.$emit('newFCFilter', parseFloat(this.fcFilter))
      },
      emitHardFilterChange() {
        this.$emit('hardFilterChange', this.hardFilterData);
      },
      emitSelectedGenes() {
        this.$emit('updateSelectedGenes', this.optionsSelectedGenes, 'options');
      },
      emitClearSelection() {
        this.$emit('clearSelection');
      },
      emitShowLablesChange() {
        this.$emit('showLabelsChange', this.showLabels);
      },
      updateNewSearchGene(item) {
        if (item) {
          this.newSearchGene = item;
        }
      },
      parseGeneListText() {
        //Split on spaces or comma spaces or commas
        let geneList = this.cutPasteGeneList.split(/[\s,]+/);

        //Make the list lowercase 
        geneList = geneList.map(gene => gene.toLowerCase());

        //Filter out any empty strings
        geneList = geneList.filter(gene => gene !== '');

        //Filter out any duplicates
        geneList = geneList.filter((gene, index) => geneList.indexOf(gene) === index);

        //Filter out any genes that are not in the data
        geneList = geneList.filter(gene => this.geneNameslist.includes(gene));

        //populate a new list with the actual genes (objects) that have the corresponding name
        //Modified for complexity using a map for the genes and their names
        let geneMap = new Map();
        this.genesData.forEach(g => {
          geneMap.set(g.external_gene_name.toLowerCase(), g);
        });
        
        //Then map the gene list to the gene map items
        let newGeneList = geneList.map(gene => geneMap.get(gene));

        //Update the selected genes add the new list
        this.optionsSelectedGenes = this.optionsSelectedGenes.concat(newGeneList);
        this.emitSelectedGenes();
      },
      add() {
        if (this.newSearchGene) {
          this.optionsSelectedGenes.push(this.newSearchGene);
          this.emitSelectedGenes();

          this.newSearchGene = {};
          this.lookupGene = '';
        }
      },
      removeGene(gene){
        this.optionsSelectedGenes = this.optionsSelectedGenes.filter(theGene => theGene.external_gene_name !== gene.external_gene_name);
        this.emitSelectedGenes();
      },
      async processFile(event){
        let file = event.target.files[0];

        if (file){
          let theFile = await readFile(file);
          this.showOverlay = true;
          this.headers = parseHeaders(theFile);
          this.fileText = theFile;
        }
      },
      clearFile(event) {
        this.file = null;
        this.$emit("newfileSelected", null, null);
      },
      emitFileAndFormat(fileF) {
        this.showOverlay = false;
        this.$emit('newfileSelected', this.fileText, fileF);
      },
      emitSubChartSelection() {
        this.$emit('subChartSelectionChange', this.subChartSelection);
      },
    },
    watch: {
        genes: {
          handler(newVal) {
            this.genesData = newVal;
          },
        deep: true},
        selectedGenes: {
          handler(newVal) {
              this.optionsSelectedGenes = newVal;
          },
        deep: true},
    },
    computed: {
      geneNameslist() {
        return this.genesData.map(gene => gene.external_gene_name);
      },
    },
  }
</script>

<style lang="css">
    .copy-paste-input {
      width: 100%;
      margin-top: 5px;
      margin-bottom: 5px;
    }
    #file-select-container .v-expansion-panel-text__wrapper {
      width: 100%;
      margin: 15px 0px 0px 0px;
      padding-left: 5px;
      padding-right: 15px;
    }
    /* The v-field has some odd padding that makes the icon look odd changing that */
    #file-select-container .v-field {
      padding-right: 0%;
    }

    #file-input-field:hover {
      cursor: pointer;
    }

    .card-tool-bar {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items:center;
        max-width: 320px;
        height: 100%;
        padding-right: 10px;
        padding-left: 5px;
        padding-top: 1rem;
        padding-bottom: 1rem;
        overflow-y: scroll;
    }

    .label-input-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-color: whitesmoke;
        width: 100%;
  
        border-radius: 4px;

        margin-bottom: 5px;

        box-shadow: 0 3px 1px -2px rgba(79, 79, 79, 0.2), 0 2px 2px 0 rgba(79, 79, 79, 0.2), 0 1px 5px 0 rgba(79, 79, 79, 0.2);
    }

    #gene-selection-dropdown .v-expansion-panel-text__wrapper {
      padding: 1em 1em 2em 1em;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    #gene-selection-dropdown .label {
      border-radius: 3px;
      text-align: left;
      padding: 0px 0px 0px 15px;
      width: 100%;
    }

    #gene-selection-dropdown .data-selector {
      width: 100%;
      border: #ced4da 1px solid;
      border-radius: 3px;
      margin: 3px 0px 3px 0px;
    }

    #filter-selection-dropdown.v-expansion-panel-text {
      padding: 1em 1em 2em 1em;
    }

    #filter-selection-dropdown .v-expansion-panel-text__wrapper {
      padding: 0px 0px 0px 0px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    #filter-selection-dropdown .label {
      border-radius: 3px;
      text-align: left;
      padding: 0px 0px 0px 15px;
      width: 100%;
    }

    #filter-selection-dropdown .data-selector {
      width: 50%;
      border: #ced4da 1px solid;
      border-radius: 3px;
      margin: 3px 0px 3px 0px;
    }

    #filter-selection-dropdown .data-selector.checkbox {
      border: none;
    }

    #filter-selection-dropdown .data-selector.checkbox:hover {
      cursor: auto;
    }

    #filter-selection-dropdown .data-selector.checkbox input {
      cursor: pointer;
    }

    #filter-selection-dropdown .data-selector:hover {
      cursor: pointer;
    }

    .label{
        margin: 0 0 0 0;
        color: rgb(255, 255, 255);
        background-color: rgb(72, 103, 150);

        border: none;
        border-radius: 3px 3px 0 0;
        text-align: center;
    }

    .label.demo {
      border-radius: 3px;
      background-color: rgb(255, 17, 21); 
      border: 1px rgb(48, 8, 8) dashed;
      padding: 10px 0px 10px 0px;
      font-weight: bold;
    }
    .label-input-container.demo {
      position: sticky;
      top: 0;
      z-index: 3;
      opacity: 0.85;
    }

    option {
        text-align: center;
    }

    div.radio-label {
      font-size: small;
    }

    .v-radio-group {
      padding-top: 1em;
    }

    .data-selector {
        text-align: center;

        padding: 5px 10px;

        border: none;
        border-radius: 0 0 4px 4px;
        background-color: white;
    }

    #clear-selection-btn{
        margin: 5px 5px 5px 5px;
        padding: 0px 10px;

        border: none;
        border-radius: 4px;
        background-color: rgb(72, 103, 150);
        color: white;
        align-self: center;
    }

    #clear-selection-btn:hover {
        background-color: rgb(209, 72, 72);
        color: white;
        cursor: pointer;

        transition: all 0.15s ease-in-out;
    }

    #new-search-gene-input {
      margin: 5px 5px 5px 5px;
      border-radius: 2px;
      border: 1px solid #ced4da;
      padding-left: 5px;
    }

    .dropdown.open {
      width: 80%;
      margin-top: 0%;
      align-self: center;
    }

    .dropdown.open .dropdown-menu {
        display: block;
        text-align: center;
        width: 100%;
        opacity: .95;
        background-color: rgb(72, 103, 150);

        border-radius: 4px;
        border: 1px solid whitesmoke;
        box-shadow: 0 3px 1px -2px rgba(79, 79, 79, 0.2), 0 2px 2px 0 rgba(79, 79, 79, 0.2), 0 1px 5px 0 rgba(79, 79, 79, 0.2);
    }

    .dropdown.open .dropdown-menu a {
        display: block;
        text-decoration: none;
        color: white;
        width: 100%;
    }

    .dropdown.open .dropdown-menu a:hover {
        background-color: rgba(147, 192, 250, 0.5);
    }

    #search-btn-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }

    #paste-gene-list-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    #add-gene-btn {
      padding: 0px 0px 2px 0px;
      width: 20px;
      height: 20px;
      background-color: rgb(25, 171, 47);
      border: none;

      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }

    #add-gene-btn:hover {
      background-color: rgb(14, 231, 46);
      color: black;
      cursor: pointer;

      transition: all 0.15s ease-in-out;
    }

    #add-gene-list-btn {
      padding: 0px 0px 2px 0px;
      margin-left: 5px;
      width: 20px;
      height: 20px;
      background-color: rgb(25, 171, 47);
      border: none;

      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }

    #add-gene-list-btn:hover {
      background-color: rgb(14, 231, 46);
      color: black;
      cursor: pointer;

      transition: all 0.15s ease-in-out;
    }

    .placeholder-text {
      color: #6c757d;
      width: 100%;
      text-align: left;
    }

    .chip.red {
      background-color: rgba(255, 0, 0, 0.8);
      border: 1px solid red;
      color: white;
    }

    .chip.blue {
      background-color: rgba(0, 0, 255, 0.8);
      border: 1px solid blue;
      color: white;
    }

    .chip.grey {
      background-color: rgba(128, 128, 128, 0.8);
      border: 1px solid grey;
      color: white;
    }
</style>