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
        <p class="label">Genes</p>
        <select class="data-selector" v-model="selectedGenesData" @change="emitSelectedGenes" multiple>
          <option v-for="gene in genesData" :value="gene" :selected="selectedGenesData.includes(gene.external_gene_name)">{{ gene.external_gene_name }}</option>
        </select>
        <button id="clear-selection-btn" @click="emitClearSelection">Clear Selection</button>
      </div>
    </div>
</template>

<script>
  export default {
    name: 'OptionsMenu',
    components: {
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
</style>