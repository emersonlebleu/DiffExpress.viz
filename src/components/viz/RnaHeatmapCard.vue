<template>
    <div class="rna-hm-card-container" ref="hmCardContainer">
        <v-btn id="export-heatmap-btn" @click="exportHeatmap" color="rgb(19, 52, 102)" size="x-small">Export Plot</v-btn>
        <p class="card-title" v-if="selectedGenes && selectedGenes.length && summaryData && Object.keys(summaryData).length">Heatmap</p>
  
        <div class="viz-container">
        <!-- Only Render Once there is Data -->
        <RnaHeatmapViz v-if="selectedGenes && selectedGenes.length && summaryData && Object.keys(summaryData).length" 
              :selectedGenes="selectedGenes" 
              :summaryData="summaryData"
              :axGenes="genes"
              :axGroups="groups"/>

        <div id="no-hm-data" v-else>Select genes to render heatmap.</div>
        </div>
    </div>
  </template>
  
  <script>
    import RnaHeatmapViz from './RnaHeatmapViz.vue';
  
    export default {
      name: 'RnaHeatmapCard',
      components: {
        RnaHeatmapViz
      },
      props: {
        selectedGenes: Array,
        summaryData: Object,
        axGenes: Array,
        axGroups: Array,
      },
      data() {
        return {
            genes: this.axGenes || [],
            groups: this.axGroups || [],
        }
      },
      methods: {
        exportHeatmap() {
          //grab the heatmap (main)
          let heatmap = document.getElementById('heatmap-chart');
          
          //serialize the svg
          let svgDataString = new XMLSerializer().serializeToString(heatmap);

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
        axGenes: function(newVal, oldVal) {
            this.genes = newVal;
         },
        axGroups: function(newVal, oldVal) {
            this.groups = newVal;
         },
      },
      mounted() {
        //Nothing Now
      }
    }
  </script>
  
  <style scoped>
    .rna-hm-card-container {     
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

      margin-top: 20px;

      color: black;
      box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
    }

    .viz-container {
        width: 100%;
        min-height: 95%;
    }
    .card-title {
        margin: 1em;
        font-weight: bold;
        text-align: center;

        width: 100%;
    }

    #no-hm-data {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2em;
        color: red;
        font-size: large;
        font-weight: bold;

        height: 100%;
    }

    #export-heatmap-btn {
      align-self: flex-end;
      transform: translateY(2em);
    }

    #export-heatmap-btn:hover {
      background-color: rgb(37, 84, 154) !important;
    }
  </style>