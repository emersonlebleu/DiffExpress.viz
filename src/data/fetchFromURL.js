export default async function fetchFromURL(url) {
    fetch(url)
    .then(response => response.text())
    .then(data => {
        return data;
    })
    .catch(error => console.error('Error:', error));
}