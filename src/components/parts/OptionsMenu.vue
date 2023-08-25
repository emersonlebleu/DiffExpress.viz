<template>
    <div class="card-tool-bar">
      <div class="label-input-container">
        <p class="label">Hard Filter</p>
        <input type="checkbox" v-model="hardFilterData" @change="emitHardFilterChange">
      </div>
      
      <div class="label-input-container">
        <p class="label">Sample Data: </p>
        <select class="data-selector" v-model="fileSelected" @change="emitFileSelected">
          <option value="fish">Fish</option>
          <option value="mouse">Mouse</option>
        </select>      
      </div>

      <div class="label-input-container">
        <p class="label">Filter P: </p>
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
        <p class="label">Filter FC: </p>
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

      <div class="label-input-container" v-if="geneNames && geneNames.length">
        <p class="label">Gene: </p>
        <select class="data-selector" v-model="selectedGene">
          <option v-for="gene in genes" :value="gene">{{ gene }}</option>
        </select>
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
      geneNames: Array,
      hardFilter: Boolean,
      selection: String,
    },
    data() {
      return {
        fileSelected: this.selectedFile,
        pFilter: (this.pFilterVal || 0.0).toString(),
        fcFilter: (this.fcFilterVal || 0.0).toString(),
        genes: this.geneNames || [],
        selectedGene: this.selection,
        hardFilterData: this.hardFilter || false,
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
      }
    },
    watch: {
      geneNames: function(newVal, oldVal) {
        this.genes = newVal;
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
    }

    .label{
        margin: 0 0 0 0;
        text-align: center;
        color: whitesmoke;
        background-color: rgb(78, 77, 77);
        border-radius: 2px;
    }
    option {
        text-align: center;
    }

    .data-selector {
        margin-bottom: 10px;
        padding: 5px 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        background-color: white;
    }


</style>