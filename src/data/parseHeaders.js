export default function parseHeaders(dataText) {

    dataText = dataText.split('\n');
    let labels = dataText[0].split('\t');

    return labels;
}