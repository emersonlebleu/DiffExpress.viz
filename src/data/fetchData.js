import { lab } from "d3";


export default async function fetchData(set, pValFilter, log2FCFilter, hardFilter) {
  //The demo data selection can be mouse or fish 
  let selectedSet = null;
  if (set == 'mouse') {
    selectedSet = './mouseDeSeq2.txt';
  } else if (set == 'fish') {
    selectedSet = './fishDeSeq2.txt';
  } else {
    selectedSet = set;
  }

  //Ensure that the pValFilter is a number
  let pValFilterNum = parseFloat(pValFilter);
  let log2FCFilterNum = parseFloat(log2FCFilter);

  try {
    //get the data from the file
    const response = await fetch(selectedSet);
    const fileContent = await response.text();

    //Split everything by row
    const rawdata = fileContent.split('\n');

    //Lables are the first row of rawdata
    const labels = rawdata[0].split('\t');
    let geneNames = new Set();
    let groups = labels.slice(10);

    //Add A label for the negLog10Pvalue & color
    labels.push('negLog10Pvalue');
    labels.push('color')

    //Will have a stats Obj with the range, mean, and standard deviation of each column
    var sumStats = {}

    //Just the data without the labels into data
    const data = rawdata.slice(1)

    //Add the negLog10Pvalue to each row & clean up & Filter
    for (let i = 0; i < data.length; i++) {
        data[i] = data[i].split('\t');

        //CLEAN UP------------------------------------------------------------------------------------------------
        //if there is no pvalue or it is 0 then remove the row from data
        if (isNaN(parseFloat(data[i][5])) || data[i][5] == '' || data[i][5] == 0) {
          //remove the row from data 
          data.splice(i, 1);
          continue;
        }

        //if there is no log2FoldChange then remove the row from data
        if (isNaN(parseFloat(data[i][2])) || data[i][2] == '') {
          //remove the row from data 
          data.splice(i, 1);
          continue;
        }

        //FILTER------------------------------------------------------------------------------------------------
        if (pValFilterNum == 0 && hardFilter) {
          if (data[i][2] < log2FCFilterNum && data[i][2] > -log2FCFilterNum) {
            //remove the row from data 
            data.splice(i, 1);
            continue;
          }
        } else if ((data[i][5] > pValFilterNum || data[i][2] < log2FCFilterNum && data[i][2] > -log2FCFilterNum) && hardFilter) {
          //remove the row from data 
          data.splice(i, 1);
          continue;
        }

        //Add the negLog10Pvalue to the rows that haven't been removed by the above filters
        data[i].push(-Math.log10(data[i][5]));

        //BAD LOGIC works but could be a lot better------------------------------------------------------------------------------------------------*
        //Add the color to the rows that haven't been removed by the above filters
        if (pValFilterNum == 0) {
          //if pvalue is above 0 then check fold change and assign color
          if (data[i][5] > 0) {
            if (data[i][2] > 0 && data[i][2] > log2FCFilterNum) {
              data[i].push("red");
            } else if (data[i][2] < 0 && data[i][2] < -log2FCFilterNum) {
              data[i].push("blue");
             } else {
            data[i].push("grey");
            }
          } else {
            //if pvalue is below or at 0 then assign grey
            data[i].push("grey");
          }
        //otherwise if pvalue is a normal number then check the fold change and pval to assign color
        } else if (data[i][2] > 0 && data[i][2] > log2FCFilterNum && data[i][5] < pValFilterNum) {
          data[i].push("red");
        } else if (data[i][2] < 0 && data[i][2] < -log2FCFilterNum && data[i][5] < pValFilterNum) {
          data[i].push("blue");
        } else {
          data[i].push("grey");
        }

        //Populate the geneNames set with this particular gene
        geneNames.add(data[i][7]);
    }
    
    //Add the All group to the groups array
    geneNames.add("All");
    //Sort the geneNames array
    let genesArraySorted = Array.from(geneNames).sort();


    //Create an object with the values for each column mapped back to the labels
    //This might be a problem.... but is working at present.
    const dataObj = data.map((row) => {
        const rowArray = row;
        const rowObject = {};
        for (let i = 0; i < labels.length; i++) {
            rowObject[labels[i]] = rowArray[i];
        }
        return rowObject;
    });

    //New object with the summary stats for each column but only if the column is numerical
    function createSumStats(labels, data) {
      //Create an object with the range, mean, and standard deviation of each column from the data
      let stats = {};

      for (let i = 0; i < labels.length; i++) {
          let label = labels[i];

          function createColumn(i, data) {
            let column = [];
            for (let j = 0; j < data.length; j++) {
                if (!isNaN(parseFloat(data[j][i]))) {
                  column.push(parseFloat(data[j][i]))
                } 
            }
            return column;
          }

          let column = createColumn(i, data);

          if (typeof column[0] === 'number') {
            stats[label] = {
              range: [Math.min(...column), Math.max(...column)],
              mean: column.reduce((total, current) => total + current, 0) / column.length,
            }

            stats[label].stdDev = Math.sqrt(column.reduce((total, current) => total + Math.pow(current - stats[label].mean, 2), 0) / column.length);
          }
      }
      return stats;
    }

    sumStats = createSumStats(labels, data);

    return [dataObj, sumStats, groups];
    
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}