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

    dataText = dataText.split('\n');
    let labels = dataText[0].split(delimeter);

    return labels;
}