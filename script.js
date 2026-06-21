// --- CONFIGURATION SUPABASE ---
const SUPABASE_URL = "https://ndfmmyvixclgbhipwbic.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RNjlNh9whTs8O27ddx0Cxg_6qsZuUYY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const listContainer = document.getElementById('dictionary-list');
const searchBar = document.getElementById('searchBar');
let motsGlobal = []; 

// --- 1. CHARGER LES MOTS DEPUIS LE CLOUD ---
async function fetchWords() {
    listContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Connexion au cloud... ☁️</p>";
    
    const { data, error } = await supabaseClient
        .from('mots')
        .select('*')
        .order('abreviation', { ascending: true });

    if (error) {
        console.error(error);
        listContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center; color:red;'>Erreur de chargement ❌</p>";
        return;
    }

    motsGlobal = data;
    displayWords(motsGlobal);
}

// --- 2. FONCTION POUR AFFICHER LES MOTS À L'ÉCRAN ---
function displayWords(wordsArray) {
    listContainer.innerHTML = ""; 
    if(wordsArray.length === 0) {
        listContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center; opacity:0.7;'>Aucun mot trouvé... 😢</p>";
        return;
    }
    wordsArray.forEach(mot => {
        const nbLikes = mot.likes || 0; 

        const card = document.createElement('div');
        card.className = 'word-card';
        card.innerHTML = `
            <h3>#${mot.abreviation}</h3>
            <p>Signification : <strong>${mot.complet}</strong></p>
            <div class="like-section">
                <button class="like-btn" onclick="ajouterLike(${mot.id}, ${nbLikes})">❤️ <span id="like-count-${mot.id}">${nbLikes}</span></button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// --- 2B. FONCTION POUR AJOUTER UN LIKE DANS LE CLOUD ---
async function ajouterLike(idMot, currentLikes) {
    const { data, error } = await supabaseClient
        .from('mots')
        .update({ likes: currentLikes + 1 })
        .eq('id', idMot);

    if (error) {
        console.error("Erreur lors du vote :", error);
        alert("Impossible de liker pour le moment... 🙁");
    } else {
        const countSpan = document.getElementById(`like-count-${idMot}`);
        if (countSpan) {
            countSpan.innerText = currentLikes + 1;
            const btn = countSpan.parentElement;
            btn.style.transform = "scale(1.2)";
            setTimeout(() => btn.style.transform = "scale(1)", 200);
        }
    }
}

// --- 3. BARRE DE RECHERCHE ---
searchBar.addEventListener('input', (e) => {
    const searchString = e.target.value.toLowerCase();
    const filteredWords = motsGlobal.filter(mot => {
        return mot.abreviation.toLowerCase().includes(searchString) || mot.complet.toLowerCase().includes(searchString);
    });
    displayWords(filteredWords);
});

// --- 4. AJOUTER UN MOT AVEC VÉRIFICATION PAR IA ---
const newAbrev = document.getElementById('newAbrev');
const newComplet = document.getElementById('newComplet');
const generateBtn = document.getElementById('generateBtn');

generateBtn.innerText = "Ajouter en direct mondial 🚀";

generateBtn.addEventListener('click', async () => {
    const abrevVal = newAbrev.value.trim().toLowerCase();
    const completVal = newComplet.value.trim();

    if (abrevVal === "" || completVal === "") {
        alert("Remplis les deux cases d'abord ! 😉");
        return;
    }

    generateBtn.innerText = "Analyse IA en cours... 🤖";
    generateBtn.disabled = true;

    try {
        // L'IA va analyser l'abréviation et la définition
        const texteAAnalyser = `${abrevVal} ${completVal}`;
        const reponseIA = await fetch(`https://api.purgomalum.com/v1/containsprofanity?text=${encodeURIComponent(texteAAnalyser)}`);
        const contientUnGrosMot = await reponseIA.json();

        if (contientUnGrosMot) {
            alert("🛑 L'IA de modération a détecté un contenu inapproprié ou vulgaire. Ajout refusé !");
            generateBtn.innerText = "Ajouter en direct mondial 🚀";
            generateBtn.disabled = false;
            return;
        }

        // Si l'IA valide, on envoie à Supabase !
        const { error } = await supabaseClient
            .from('mots')
            .insert([{ abreviation: abrevVal, complet: completVal }]);

        if (error) {
            alert("Aïe, ça n'a pas marché... Vérifie tes clés Supabase.");
            console.error(error);
        } else {
            newAbrev.value = "";
            newComplet.value = "";
            fetchWords(); 
        }
    } catch (err) {
        console.error("Erreur avec l'IA :", err);
        alert("Erreur lors de la vérification. Réessaie !");
    }

    generateBtn.innerText = "Ajouter en direct mondial 🚀";
    generateBtn.disabled = false;
});

// Lancement au chargement de la page
fetchWords();