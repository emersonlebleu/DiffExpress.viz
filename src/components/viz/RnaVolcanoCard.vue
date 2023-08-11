<template>
  <div class="rna-volc-card-container" ref="volcCardContainer">
    <p class="card-title">Volcano Plot</p>

    <div class="viz-container">
      <!-- Only Render Once there is Data -->
      <RnaVolcanoViz v-if="data && data.length && summaryData && Object.keys(summaryData).length" 
              :data="data" 
              :selection="selectedGene" 
              :summaryData="summaryData"
              @click="emitHmSelection"/>
    </div>

  
    <div class="card-tool-bar">
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

    <div class="label-input-container" v-if="data && data.length && summaryData && Object.keys(summaryData).length && geneNames && geneNames.length">
      <p class="label">Gene: </p>
      <select class="data-selector" v-model="selectedGene">
        <option v-for="gene in genes" :value="gene">{{ gene }}</option>
      </select>
    </div>

    </div>
  </div>
</template>

<script>
  import RnaVolcanoViz from './RnaVolcanoViz.vue';
  import * as d3 from 'd3';

  export default {
    name: 'RnaVolcanoCard',
    components: {
      RnaVolcanoViz
    },
    props: {
      data: Array,
      selection: String,
      //summary Statistics
      summaryData: Object,
      selectedFile: String,
      pFilterVal: Number,
      fcFilterVal: Number,
      geneNames: Array,
    },
    data() {
      return {
        fileSelected: this.selectedFile,
        pFilter: (this.pFilterVal || 0.05).toString(),
        fcFilter: (this.fcFilterVal || 0.5).toString(),
        genes: this.geneNames || [],
        selectedGene: this.selection,
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
      emitHmSelection() {
        //use d3 to get all of the points with the class of selected
        let selectedPoints = d3.selectAll('.selected').data();
        this.$emit('hmSelection', selectedPoints);
      },
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

<style scoped>
  .rna-volc-card-container {     
    /* flex */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      width: 100%;
      height: 50%;

      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 5px;

      color: black;
      box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
    }
  .data-selector {
    margin-bottom: 10px;
    padding: 5px 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: white;
  }

  .card-title {
    margin: 1em;
    font-weight: bold;
    text-align: center;

    width: 100%;
  }

  .card-tool-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    margin: 5px 20px;
    width: 100%;
  }

  .viz-container {
    width: 100%;
    min-height: 85%;
  }

  .label-input-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .label{
    margin: 0 10px 0 0;
    text-align: center;
  }

  option {
    text-align: center;
  }

  @media screen and (max-width: 1000px) {
    .label-input-container {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .label {
      margin: 0 0 0px 0;
    }
  }

  @media screen and (max-width: 610px) {
    .card-tool-bar {
      flex-direction: column;
      align-items: center;
    }
    .label-input-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .label {
      margin: 0 10px 10px 0;
    }

    .viz-container {
    width: 100%;
    min-height: 80%;
  }
  }

</style>