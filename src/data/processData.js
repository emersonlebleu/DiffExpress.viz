import DiffGene from "../models/DiffGene";

export default async function processData(isDemo, pValFilter, log2FCFilter, hardFilterPV, hardFilterFC, textData=null, fileFormatObj=null) {
  //Variables
  var numOfGenes = 0;
  var selectedSet = './fishDeSeq2.txt';

  //Ensure that the pValFilter is a number
  var pValFilterNum = parseFloat(pValFilter);
  var log2FCFilterNum = parseFloat(log2FCFilter);

  //Will have a stats Obj with the range, mean, and standard deviation of each column
  var sumStats = {}
  var data = [];
  var headers = [];

  var labelIndexes = {};
  var groupIndexes = {};
  var groups = [];
  var labels = [];

  var finalDiffGenesList = [];
  var dataColMap = {};
  var fileContent = '';

  //Default file format object for default data
  var defaultFileFormatObj = {
    "pValue": "pvalue",
    "pValueLog10": false,
    "foldChange": "log2FoldChange",
    "foldChangeLog2": true,
    "labelColumn": "external_gene_name",
    "fileType": "txt",
    "groups": ["24hpf", "36hpf", "48hpf", "60hpf", "72hpf"],
  }

  var updatedFileFormatObj = {};
  if (!isDemo) {
    updatedFileFormatObj = JSON.parse(JSON.stringify(fileFormatObj)); //create a copy just so that we know we arent changing the original
  } else {
    updatedFileFormatObj = defaultFileFormatObj;
  }

  var splitChar = '\t';

  switch (updatedFileFormatObj.fileExtension) {
    case 'txt':
      splitChar = '\t';
      break;
    case 'tsv':
      splitChar = '\t';
      break;
    case 'csv':
      splitChar = ',';
      break;
    default:
      splitChar = '\t';
  }

  // Only if is demo is true
  if (isDemo) {
    try {
      //get the data from the file if data is not provided by the application
      let response = await fetch(selectedSet);
      fileContent = await response.text();
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
      //Split the data into the headers and the data
      [data, headers] = splitDataFromHeaders(fileContent, splitChar);
      //Get the maps for the locations of the labels and groups in the data
      [headers, labelIndexes, labels, groupIndexes, groups, updatedFileFormatObj] = getLabelAndGroupMaps(headers, updatedFileFormatObj);
      //Filter the data, clean the data, and get the number of genes
      [finalDiffGenesList, numOfGenes, dataColMap, updatedFileFormatObj] = cleanAndFilterData(data, labelIndexes, labels, groupIndexes, groups, updatedFileFormatObj, splitChar, pValFilterNum, log2FCFilterNum, hardFilterPV, hardFilterFC);
    } else {
    if (!textData) {
      //Throw an error if there is no data
      throw new Error('No data provided');
    } else {
      fileContent = textData;
      //Split the data into the headers and the data
      [data, headers] = splitDataFromHeaders(fileContent, splitChar);
      //Get the maps for the locations of the labels and groups in the data
      [headers, labelIndexes, labels, groupIndexes, groups, updatedFileFormatObj] = getLabelAndGroupMaps(headers, updatedFileFormatObj);
      //Filter the data, clean the data, and get the number of genes
      [finalDiffGenesList, numOfGenes, dataColMap] = cleanAndFilterData(data, labelIndexes, labels, groupIndexes, groups, updatedFileFormatObj, splitChar, pValFilterNum, log2FCFilterNum, hardFilterPV, hardFilterFC);
    }
  }

  sumStats = createSumStats(dataColMap);

  return [finalDiffGenesList, sumStats, groups, numOfGenes];
}

function splitDataFromHeaders(data, delimeter) {
  //Split everything by row so raw data is an array of rows not yet split by the splitChar
  let rawdata = data.split("\n");

  //Just the data without the labels into data
  let justData = rawdata.slice(1);

  //Headers are the first row of rawdata split by whatever the splitChar is
  let headers = rawdata[0].split(delimeter);

  return [justData, headers];
}

function getLabelAndGroupMaps(headers, fileFormatObj) {
  //We are going to modify the headers so we need to make a copy of them
  let theHeaders = headers;
  //If we need to change the fileFormatObject to update the fold change or pvalue column
  let innerFileFormatObj = JSON.parse(JSON.stringify(fileFormatObj)); //create a copy just so that we know we arent changing the original
  let groupNames = [];
  let groupIndexes = {};
  let labelNames = [];
  let labelIndexes = {};

  //Add the log 10 pvalue and log 2 fold change to the headers make a new file format opject with "originalPValue" and "originalFoldChange"
  theHeaders.push('__pvalue_log10');
  innerFileFormatObj['originalPValue'] = fileFormatObj['pValue'];
  innerFileFormatObj.pValue = '__pvalue_log10';

  theHeaders.push('__FC_log2');
  innerFileFormatObj['originalFoldChange'] = fileFormatObj['foldChange'];
  innerFileFormatObj.foldChange = '__FC_log2';

  //Add color to the labels
  theHeaders.push('color')

  //Get use the group names to get the indexes of the groups in the headers
  groupNames = innerFileFormatObj.groups;
  for (let i = 0; i < groupNames.length; i++) {
    //Get the index of the group name in the headers
    let index = headers.indexOf(groupNames[i]);
    //assign the index to the groupIndexes object with the group name as the key
    groupIndexes[groupNames[i]] = index;
  }

  for (let i = 0; i < headers.length; i++) {
    //if the label is not a group name then...
    if (!groupNames.includes(headers[i])) {
      //Add the label to the labels array
      labelNames.push(headers[i]);
      //Map the label to the index of the column in the data
      labelIndexes[headers[i]] = i;
    }
  }

  //New labels structure should be [labels..., color, pvalue-log10, FC-log2] or [labels..., color, pvalue-log10] or [labels..., color, FC-log2] or [labels..., color]
  return [theHeaders, labelIndexes, labelNames, groupIndexes, groupNames, innerFileFormatObj];
}

//Function cleans the data of rows where essential data is missing
function cleanAndFilterData(data, labelMap, labelNames, groupMap, groupNames, fileFormatObj, splitChar, pValFilterNum, log2FCFilterNum, hardFilterPVal, hardFilterFoldChange) {
  //Will need both the original pvalue and fold change
  var pvalueIOriginal = labelMap[fileFormatObj.originalPValue];
  var foldChangeIOriginal = labelMap[fileFormatObj.originalFoldChange];
  var foldChangeI = labelMap[fileFormatObj.foldChange];
 
  let diffGeneList = [];
  let numGenes = 0;
  let dataColMap = {};

  //Set dataColMap keys to the labelNames and groupNames
  for (let i = 0; i < labelNames.length; i++) {
    dataColMap[labelNames[i]] = [];
  }
  for (let i = 0; i < groupNames.length; i++) {
    dataColMap[groupNames[i]] = [];
  }

  for (let i = 0; i < data.length; i++) {
    //Choosing to split the data here rather than another function because the data is large and want to iterate over it the least amount of times possible
    data[i] = data[i].split(splitChar); 

    if (!fileFormatObj.pValueLog10) {
      //Add the -log10(pvalue) to the row
      data[i].push(-Math.log10(data[i][pvalueIOriginal]));
    } else {
      //Add the -log10(pvalue) to the row
      data[i].push(data[i][pvalueIOriginal]);
    }

    if (!fileFormatObj.foldChangeLog2) {
      //Add the log2(fold change) to the row
      data[i].push(Math.log2(data[i][foldChangeIOriginal]));
    } else {
      //Add the log2(fold change) to the row
      data[i].push(data[i][foldChangeIOriginal]);
    }

    //Add the color to the rows
    if (pValFilterNum == 0) {
      //If the pValue filter is zero only look at FC for color
      if ((data[i][foldChangeI] > 0 && data[i][foldChangeI] > log2FCFilterNum) || (data[i][foldChangeI] < 0 && data[i][foldChangeI] < -log2FCFilterNum)) {
        if (data[i][foldChangeI] > 0) {
          data[i].push("red");
        } else {
          data[i].push("blue");
        }
      } else {
        data[i].push("grey");
      } 
    //otherwise if pvalue is a normal number then check the fold change and pval to assign color
    } else if (data[i][foldChangeI] > 0 && data[i][foldChangeI] > log2FCFilterNum && data[i][pvalueIOriginal] < pValFilterNum) {
      data[i].push("red");
    } else if (data[i][foldChangeI] < 0 && data[i][foldChangeI] < -log2FCFilterNum && data[i][pvalueIOriginal] < pValFilterNum) {
      data[i].push("blue");
    } else {
      data[i].push("grey");
    }

    //CLEAN UP BASED ON THE PVALUE AND FOLD CHANGE FIRST------------------------------------------------------------------------------------------------
    //if there is no pvalue or it is 0 then remove the row from data
    
    if (isNaN(parseFloat(data[i][pvalueIOriginal])) || data[i][pvalueIOriginal] == '' || data[i][pvalueIOriginal] == 0) {
      //Don't add this row
      continue;
    }

    //if there is no log2FoldChange then remove the row from data
    if (isNaN(parseFloat(data[i][foldChangeIOriginal])) || data[i][foldChangeIOriginal] == '') {
      //Don't add this row
      continue;
    }

    //FILTER BASED ON THE PVALUE AND FOLD CHANGE AND THE CUT OFFS------------------------------------------------------------------------------------------------
    if (hardFilterFoldChange && data[i][foldChangeI] < log2FCFilterNum && data[i][foldChangeI] > -log2FCFilterNum) {
      //Don't add this row
      continue;
    }

    if (pValFilterNum != 0) {
      if (hardFilterPVal && data[i][pvalueIOriginal] > pValFilterNum) {
        //Don't add this row
        continue;
      }
    }

    //Update the data map push the data to each column in the map
    for (let j = 0; j < labelNames.length; j++) {
      if (isNaN(parseFloat(data[i][labelMap[labelNames[j]]]))) {
        dataColMap[labelNames[j]].push(data[i][labelMap[labelNames[j]]]);
      } else {
        dataColMap[labelNames[j]].push(parseFloat(data[i][labelMap[labelNames[j]]]));
      }
    }
    for (let j = 0; j < groupNames.length; j++) {
      if (isNaN(parseFloat(data[i][groupMap[groupNames[j]]]))) {
        dataColMap[groupNames[j]].push(data[i][groupMap[groupNames[j]]]);
      } else {
        dataColMap[groupNames[j]].push(parseFloat(data[i][groupMap[groupNames[j]]]));
      }
    }

    //if we get here then create a new diffGene object and add it to the diffGenes array
    let diffGene = createDiffGene(data[i], labelMap, labelNames, groupMap, groupNames, fileFormatObj);
    diffGeneList.push(diffGene);
    numGenes++;
  }


  return [diffGeneList, numGenes, dataColMap];
}

//Make a new diffGene object for each gene
function createDiffGene(dataRow, labelMap, labelNames, groupMap, groupNames, fileFormatObj) {
  let diffGene = new DiffGene();

  let groupDataObj = {};
  let otherDataObj = {};

  //Set the pvalue, log2FoldChange, and geneName
  diffGene.setPValue(dataRow[labelMap[fileFormatObj.pValue]]);
  diffGene.setPValueOriginal(dataRow[labelMap[fileFormatObj.originalPValue]]);
  diffGene.setLog2FoldChange(dataRow[labelMap[fileFormatObj.foldChange]]);
  diffGene.setGeneName(dataRow[labelMap[fileFormatObj.labelColumn]].toLowerCase());
  diffGene.setColor(dataRow[labelMap['color']]);

  //set the group data object
  for (let i = 0; i < groupNames.length; i++) {
    groupDataObj[groupNames[i]] = dataRow[groupMap[groupNames[i]]];
  }
  //set the other data object with any other labels that are not pvalue, log2FoldChange, geneName, or color
  for (let i = 0; i < labelNames.length; i++) {
    if (labelNames[i] != fileFormatObj.pValue && labelNames[i] != fileFormatObj.foldChange && labelNames[i] != fileFormatObj.labelColumn && labelNames[i] != 'color') {
      otherDataObj[labelNames[i]] = dataRow[labelMap[labelNames[i]]];
    }
  }

  diffGene.setGroupDataObj(groupDataObj);
  diffGene.setOtherDataObj(otherDataObj);

  return diffGene;
}

function createSumStats(dataMap) {
  //Create an object with the range, mean, and standard deviation of each column from the data
  let stats = {};

  for (let key in dataMap) {
    if (typeof dataMap[key][0] != 'number') {
      continue;
    } else {
      //Get the range, mean, and standard deviation of the column
      let range = [Math.min(...dataMap[key]), Math.max(...dataMap[key])];
      let mean = dataMap[key].reduce((a, b) => a + b, 0) / dataMap[key].length;
      let stdDev = Math.sqrt(dataMap[key].map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / dataMap[key].length);

      //Add the range, mean, and standard deviation to the stats object with the key being the column name if the numbers are all valid
      if (isNaN(range[0]) || isNaN(range[1]) || isNaN(mean) || isNaN(stdDev)) {
        continue;
      } else {
        stats[key] = {
          "range": range,
          "mean": mean,
          "stdDev": stdDev
        }
      }
    }
  }
  return stats;
}