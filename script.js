// 1. On récupère les mots enregistrés dans le navigateur, ou la liste de départ si c'est vide
let motsEnregistres = localStorage.getItem('mes_mots');
let mots = motsEnregistres ? JSON.parse(motsEnregistres) : [...BANQUE_DE_MOTS];

const listContainer = document.getElementById('dictionary-list');
const searchBar = document.getElementById('searchBar');

// Affichage des mots
function displayWords(wordsArray) {
    listContainer.innerHTML = ""; 
    if(wordsArray.length === 0) {
        listContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center; opacity:0.7;'>Aucun mot trouvé... 😢</p>";
        return;
    }
    wordsArray.forEach(mot => {
        const card = document.createElement('div');
        card.className = 'word-card';
        card.innerHTML = `<h3>#${mot.abreviation}</h3><p>Signification : <strong>${mot.complet}</strong></p>`;
        listContainer.appendChild(card);
    });
}

searchBar.addEventListener('input', (e) => {
    const searchString = e.target.value.toLowerCase();
    const filteredWords = mots.filter(mot => {
        return mot.abreviation.toLowerCase().includes(searchString) || mot.complet.toLowerCase().includes(searchString);
    });
    displayWords(filteredWords);
});

displayWords(mots);

// --- LE SYSTÈME AUTOMATIQUE SANS TÉLÉCHARGEMENT ---
const newAbrev = document.getElementById('newAbrev');
const newComplet = document.getElementById('newComplet');
const generateBtn = document.getElementById('generateBtn');

generateBtn.innerText = "Ajouter définitivement 🚀";

generateBtn.addEventListener('click', () => {
    const abrevVal = newAbrev.value.trim().toLowerCase();
    const completVal = newComplet.value.trim();

    if (abrevVal === "" || completVal === "") {
        alert("Remplis les deux cases d'abord ! 😉");
        return;
    }

    // Ajouter au tableau actuel
    mots.push({ abreviation: abrevVal, complet: completVal });
    
    // Sauvegarder dans la mémoire du navigateur
    localStorage.setItem('mes_mots', JSON.stringify(mots));
    
    // Mettre à jour l'écran
    displayWords(mots);

    // Nettoyer les cases
    newAbrev.value = "";
    newComplet.value = "";
});