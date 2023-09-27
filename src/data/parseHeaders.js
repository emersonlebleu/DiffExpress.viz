export default function parseHeaders(dataText, fileExtension) {
    let delimeter = null;
    switch (fileExtension) {
        case 'csv':
            delimeter = ',';
            break;
        case 'tsv':
            delimeter = '\t';
            break;
        case 'txt':
            delimeter = '\t';
            break;
        default:
            delimeter = '\t';
    }

    //replace any \r\n with \n or any \r with \n just so that we are always splitting on \n
    let newDataText = null;

    newDataText = dataText.replace(/\r/g, '\n');
    newDataText = newDataText.replace(/\r\n/g, '\n');
    newDataText = newDataText.split('\n');

    let labels = newDataText[0].split(delimeter);

    return labels;
}