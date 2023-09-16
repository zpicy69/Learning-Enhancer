const WORDNIK_API_KEY = 'YOUR_API_KEY_HERE'; // get your own key at https://developer.wordnik.com/
const WORDNIK_BASE_URL = 'https://api.wordnik.com/v4/word.json';

document.addEventListener('dblclick', function(event) {
    let selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        fetchWordDetails(selectedText);
    }
});

function fetchWordDetails(word) {
    fetch(`${WORDNIK_BASE_URL}/${word}/definitions?limit=1&api_key=${WORDNIK_API_KEY}`)
        .then(handleResponse)
        .then(data => {
            let definition = data.length ? data[0].text : "couldn't find definition";

            fetch(`${WORDNIK_BASE_URL}/${word}/relatedWords?relationshipTypes=synonym&limit=5&api_key=${WORDNIK_API_KEY}`)
                .then(handleResponse)
                .then(data => {
                    let synonyms = data.length ? data[0].words.join(', ') : "couldn't find synonyms";

                    fetch(`${WORDNIK_BASE_URL}/${word}/examples?limit=1&api_key=${WORDNIK_API_KEY}`)
                        .then(handleResponse)
                        .then(data => {
                            let example = data.examples && data.examples.length ? data.examples[0].text : "couldn't find usage";

                            displayModal(word, definition, synonyms, example);
                        })
                        .catch(error => displayModal(word, definition, synonyms, "Error fetching usage: " + error.message));
                })
                .catch(error => displayModal(word, definition, "Error fetching synonyms: " + error.message));
        })
        .catch(error => displayModal(word, "Error fetching definition: " + error.message));
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

function displayModal(word, definition, synonyms = "", example = "") {
    let modal = document.createElement('div');
    modal.classList.add('learning-enhancer-modal');
    modal.innerHTML = `
        <strong>${word}</strong><br>
        <em>Definition:</em> ${definition}<br>
        <em>Synonyms:</em> ${synonyms}<br>
        <em>Usage:</em> ${example}<br>
    `;

    // positioning the modal near the selected word
    const selectionCoords = window.getSelection().getRangeAt(0).getBoundingClientRect();
    modal.style.left = `${selectionCoords.left}px`;
    modal.style.top = `${selectionCoords.top - 5 - modal.offsetHeight}px`;

    document.body.appendChild(modal);

    // remove modal on click anywhere
    document.addEventListener('click', function() {
        modal.remove();
    }, { once: true });
}