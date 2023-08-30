<template>
    <div class="card-tool-bar">
      <div class="label-input-container">
        <p class="label">Hard Filter</p>
        <div class="data-selector">
            <input type="checkbox" v-model="hardFilterData" @change="emitHardFilterChange">
        </div>
      </div>
      
      <div class="label-input-container">
        <p class="label">Sample Data </p>
        <select class="data-selector" v-model="fileSelected" @change="emitFileSelected">
          <option value="fish">Fish</option>
          <option value="mouse">Mouse</option>
        </select>      
      </div>

      <div class="label-input-container">
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
      </div>

      <div class="label-input-container">
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
      </div>

      <div class="label-input-container" v-if="genesData && genesData.length">
        <p class="label">Search</p>
        <div id="search-btn-container">
          <input type="text" v-model="newSearchGene" id="new-search-gene-input" label="Gene name">
          <button class="btn btn-primary">+</button>
        </div>
          <Typeahead
            v-model="lookupGene" 
            :data="genesData" 
            target="#new-search-gene-input"
            match-start
            ignore-case
            force-select
            item-key="external_gene_name"></Typeahead>          

        <p class="label">Selected Genes</p>
        <select class="data-selector" v-model="selectedGenesData" @change="emitSelectedGenes" multiple>
          <option v-for="gene in genesData" :value="gene" :selected="selectedGenesData.includes(gene.external_gene_name)">{{ gene.external_gene_name }}</option>
        </select>
        <button id="clear-selection-btn" @click="emitClearSelection">Clear Selection</button>
      </div>
    </div>
</template>

<script>
  import { Typeahead } from 'uiv'

  export default {
    name: 'OptionsMenu',
    components: {
      Typeahead,
    },
    props: {
      selectedFile: String,
      pFilterVal: Number,
      fcFilterVal: Number,
      hardFilter: Boolean,
      selectedGenes: Array,
      genes: Array,
    },
    data() {
      return {
        fileSelected: this.selectedFile,
        pFilter: (this.pFilterVal || 0.0).toString(),
        fcFilter: (this.fcFilterVal || 0.0).toString(),
        selectedGenesData: this.selectedGenes,
        hardFilterData: this.hardFilter || false,
        genesData: this.genes || [],
        newSearchGene: '',
        lookupGene: '',
      }
    },
    methods: {
      emitFileSelected() {
        this.$emit('newfileSelected', this.fileSelected)
      },
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
        this.$emit('newSelectedGenes', this.selectedGenesData);
      },
      emitClearSelection() {
        this.$emit('clearSelection');
      }
    },
    watch: {
        genes: function(newVal, oldVal) {
            this.genesData = newVal;
        },
        selectedGenes: function(newVal, oldVal) {
            this.selectedGenesData = newVal;
        },
    },
    computed: {
      geneNameslist() {
        return this.genesData.map(gene => gene.external_gene_name);
      },
    },
    mounted() {
      //Nothing Now
    }
  }
</script>

<style lang="css">
    .card-tool-bar {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        margin: 5px 20px;
        width: 100%;
    }

    .label-input-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-color: whitesmoke;

  
        border-radius: 4px;

        margin-top: 5px;
        margin-bottom: 5px;

        box-shadow: 0 3px 1px -2px rgba(79, 79, 79, 0.2), 0 2px 2px 0 rgba(79, 79, 79, 0.2), 0 1px 5px 0 rgba(79, 79, 79, 0.2);
    }

    .label{
        margin: 0 0 0 0;
        color: rgb(255, 255, 255);
        background-color: rgb(32, 36, 76);

        border: none;
        border-radius: 3px 3px 0 0;
        text-align: center;
    }

    option {
        text-align: center;
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
        padding: 5px 10px;

        border: none;
        border-radius: 4px;
        background-color: rgb(32, 36, 76);
        color: white;
    }

    #clear-selection-btn:hover {
        background-color: rgb(52, 56, 112);
        color: white;
        cursor: pointer;
    }

    #new-search-gene-input {
      margin: 5px 5px 5px 5px;
      border-radius: 2px;
      border: 1px solid #ced4da;
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
        background-color: rgb(32, 36, 76);

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

    .btn.btn-primary {
      padding: 0px 0px 2px 0px;
      width: 20px;
      height: 20px;
      background-color: rgb(39, 45, 112);
      border: none;

      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }
</style>