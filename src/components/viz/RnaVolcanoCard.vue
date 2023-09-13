<template>
  <div id="rna-volc-card-container" ref="volcCardContainer">
    <div id="zoom-tip">zooming enabled</div>
    <v-btn id="export-volcano-btn" @click="exportVolcano" color="rgb(19, 52, 102)" size="x-small">Export Plot</v-btn>
    <p style="font-size: smaller;">Rendering <i style="color: blue;">{{ numOfGenes }} </i> Genes</p>
    <p class="card-title">Volcano Plot</p>

    <div class="viz-container">
      <!-- Only Render Once there is Data -->
      <RnaVolcanoViz v-if="data && data.length && summaryData && Object.keys(summaryData).length" 
              :data="data" 
              :selection="volcSelectedGenes" 
              :summaryData="summaryData"
              :pFilterVal="pFilterVal"
              :fcFilterVal="fcFilterVal"
              :showSelectedLabels="showSelectedLabels"
              @click="emitUpdateSelectedGenes"/>
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
      selectedGenes: Array,
      //summary Statistics
      summaryData: Object,
      pFilterVal: Number,
      fcFilterVal: Number,
      showSelectedLabels: Boolean,
      numOfGenes: Number,
    },
    data() {
      return {
        fileSelected: this.selectedFile,
        pFilter: (this.pFilterVal || 0.0).toString(),
        fcFilter: (this.fcFilterVal || 0.0).toString(),
        volcSelectedGenes: [],
      }
    },
    methods: {
      emitUpdateSelectedGenes() {
        //use d3 to get all of the points with the class of selected
        let selectedGenes = d3.selectAll('.selected').data();
        this.$emit('updateSelectedGenes', selectedGenes, 'volcano');
      },
      exportVolcano() {
        //grab the volcano plot (main)
        let volcano = document.getElementById('main-volcano-chart');
        
        //serialize the svg
        let svgDataString = new XMLSerializer().serializeToString(volcano);

        //make a url to use
        let svgBlob = new Blob([svgDataString], {type: "image/svg+xml;charset=utf-8"});
        let svgUrl = URL.createObjectURL(svgBlob);

        //create an image
        let image = new Image();
        image.src = svgUrl;

        //Create a scaling factor: because the image is kind of bad quality
        let scaleFactor = 2;
        let margin = 10;

        image.onload = function() {
          //create a canvas
          let canvas = document.createElement('canvas');
          canvas.width = (image.width * scaleFactor) + 2*margin;
          canvas.height = (image.height * scaleFactor) + 2*margin;

          let context = canvas.getContext('2d');

          //Draw a white background because the chart doesn't have a fill
          context.fillStyle = 'white';
          context.fillRect(0, 0, canvas.width, canvas.height);

          //Scale before drawing
          context.scale(scaleFactor, scaleFactor);
          context.drawImage(image, margin, 0);

          //create a png
          let png = canvas.toDataURL('image/png');

          //create a download link
          let downloadLink = document.createElement('a');
          downloadLink.download = 'volcano.png';
          downloadLink.href = png;
          
          //Add click and remove
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          //clean up blob
          URL.revokeObjectURL(svgUrl);
        }
        image.onerror = function() {
            // Handle errors
            console.error("An error occurred while loading the image.");
        };
      }
    },
    watch: {
      selectedGenes: {
        handler(newVal) {
          this.volcSelectedGenes = newVal;
      },
      deep: true
    },
    },
    mounted() {
      //Nothing Now
    }
  }
</script>

<style scoped>
  #rna-volc-card-container {     
    /* flex */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;

      width: 100%;
      height: 50%;

      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 5px;

      color: black;
      box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
    }

  #rna-volc-card-container.half-height {
    height: 50%;
  }
  #rna-volc-card-container.full-height {
    height: 100%;
  }

  #export-volcano-btn {
    align-self: flex-end;
    transform: translateY(1em);
  }

  #export-volcano-btn:hover {
    background-color: rgb(37, 84, 154) !important;
  }

  .card-title {
    margin-bottom: 1em;
    font-weight: bold;
    text-align: center;
    transform: translateY(-1em);

    width: 100%;
  }

  .viz-container {
    width: 100%;
    min-height: 85%;
  }

  #zoom-tip {
        position: absolute;
        right: 20%;
        top: 14%;
        width: fit-content;
        display: none;
        background-color:#003bfe;
        border-radius: 2px;
        /* box-shadow: -3px 3px 15px #888888; */
        color: rgba(255, 255, 255, 1);
        opacity: .9;
        font: 12px sans-serif;
        padding: 4px 10px;
        text-align: center;
    }

  @media screen and (max-width: 610px) {

    .viz-container {
    width: 100%;
    min-height: 80%;
  }
  }

</style>