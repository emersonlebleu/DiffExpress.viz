## Summary
An application for visualizing differential expression datasets. 

The application contains an interactive volcano map and a heatmap. The volcano plot is geared towards visualizing data according to p-value (yAxis) and fold change (xAxis). The heatmap is applicable if your data is such that you'd like to compare gene expression between groups.  

<img width="1797" alt="Screenshot 2023-09-13 at 4 37 30 PM" src="https://github.com/emersonlebleu/rnaseq_vis_proj/assets/45885321/0065eb9b-19a8-494d-a844-a45a62607c96">  

Once the charts are filtered, zoomed, and genes are "selected" as desired to display their relevant property (typically name or id as shown above) there are buttons for exporting the charts themselves to .png files if desired. 

## Structure
- App
  - RnaVolcanoCard
    - RnaVolcanoViz
      - RnaVolcano.d3
  - RnaHeatmapCard
    - RnaHeatmapViz
      - RnaHeatmap.d3
  - OptionsMenu (Buttons & Filters)

### RnaVolcano.d3
The chart needs to be set with the following context:  

- `xMinimum` : the minimum value for the x axis; `numerical` generally the minimum of your x axis data  
- `xMaximum` : the maximum value for the x axis; `numerical` generally the maximum of your x axis data  
- `yMinimum` : the minimum value for the y axis; `numerical` generally the minimum of your y axis data  
- `yMaximum` : the maximum value for the y axis; `numerical` generally the maximum of your y axis data  
- `height` : the height of your chart; `numerical` suggest some relation to the height of the container in which the visualization is situated  
- `width` : the width of your chart; `numerical` suggest some relation to the width of the container in which the visualization is situated   
- `pvalue` : the pValue cut off for the chart (green line in the screen-shot above); `numerical` this is fed automatically from the OptionsMenu in the full context of the application  
- `foldChange` : the fold change cut off for the chart (red & blue lines in the screen-shot above); `numerical` this is fed automatically from the OptionsMenu in the full context of the application    
- `showLabels` : whether the labels should be shown on selection or not; `boolean`  
- `selection` : a list of the genes that should be marked as selected (labels shown & color changed)  
- `chartCssId` : the css id of this chart; `valid css Id` this is used in the application context to handle responsiveness on the resizing of the container

### RnaHeatmap.d3
The chart needs to be set with the following context:  

- `yValues` : a list of the categorical labels for the y axis; `list of labels` generally the group names
- `xValues` : a list of the categorical labels for the x axis; `list of labels` generally gene names 
- `height` : the height of your chart; `numerical` suggest some relation to the height of the container in which the visualization is situated  
- `width` : the width of your chart; `numerical` suggest some relation to the width of the container in which the visualization is situated     
- `selection` : a list of the genes that should be rendered; this is a sub selection in the application that is rendered from the selected genes on the volcano plot
- `chartCssId` : the css id of this chart; `valid css Id` this is used in the application context to handle responsiveness on the resizing of the container

