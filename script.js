let characters = [];
let currentCharacter;
let attempts = 0;
let gameWon = false;

// Charger les données des personnages
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        characters = data;
        // Choisir un personnage aléatoire
        currentCharacter = characters[Math.floor(Math.random() * characters.length)];
    })
    .catch(error => console.error('Erreur lors du chargement des données :', error));

    function showSuggestions() {
        const input = document.getElementById('guessInput').value.toLowerCase();
        const suggestionsContainer = document.getElementById('suggestions');
        suggestionsContainer.innerHTML = ''; // Effacer les suggestions précédentes
    
        if (input.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }
    
        // Filtrer les personnages correspondant à l'entrée
        const filteredCharacters = characters.filter(character =>
            character.name.toLowerCase().startsWith(input)
        );
    
        // Afficher les suggestions
        if (filteredCharacters.length > 0) {
            suggestionsContainer.style.display = 'block';
            filteredCharacters.forEach(character => {
                const div = document.createElement('div');
                div.classList.add('suggestion-item');
    
                // Créer l'image pour la suggestion
                const img = document.createElement('img');
                img.src = character.image;
                img.alt = character.name;
                img.className = 'suggestion-image';
    
                // Ajouter le texte du nom du personnage
                const nameSpan = document.createElement('span');
                nameSpan.textContent = character.name;
    
                // Ajouter l'image et le nom au div de suggestion
                div.appendChild(img);
                div.appendChild(nameSpan);
    
                // Ajouter l'événement onclick pour choisir le personnage
                div.onclick = () => {
                    document.getElementById('guessInput').value = character.name;
                    suggestionsContainer.style.display = 'none';
                };
                suggestionsContainer.appendChild(div);
            });
        } else {
            suggestionsContainer.style.display = 'none';
        }
    }
    

// Fonction pour soumettre la devinette
function submitGuess() {
    if (gameWon) return; // Empêche de continuer à jouer si le jeu est déjà gagné

    const guess = document.getElementById('guessInput').value.trim().toLowerCase();
    const feedback = document.getElementById('feedback');
    const suggestionsContainer = document.getElementById('suggestions');
    
    suggestionsContainer.style.display = 'none'; // Cacher les suggestions

    if (!guess) {
        feedback.textContent = "Veuillez entrer un nom de personnage.";
        return;
    }

    const foundCharacter = characters.find(character => character.name.toLowerCase() === guess);
    
    if (foundCharacter) {
        attempts++;
        addGuessToTable(foundCharacter);
        
        // Supprimer le personnage soumis de la liste des personnages pour ne plus l'afficher dans les suggestions
        characters = characters.filter(character => character.name.toLowerCase() !== guess);
        
        if (foundCharacter.name === currentCharacter.name) {
            gameWon = true;
            showWinPopup(foundCharacter); // Affiche le pop-up de victoire
        } else {
            feedback.textContent = "Essaye encore ! Compare les informations ci-dessus.";
        }

        // Effacer l'input
        document.getElementById('guessInput').value = '';
    } else {
        feedback.textContent = "Personnage introuvable. Vérifiez l'orthographe.";
    }
}


function addGuessToTable(character) {
    const tableBody = document.getElementById('guessTableBody');
    const row = document.createElement('tr');

    const cells = [
        createTableCell(character.image, true, "image"), // Colonne Personnage
        createTableCell(character.age, compareValues(character.age, currentCharacter.age)), // Colonne Âge
        createTableCell(character.gender, character.gender === currentCharacter.gender), // Colonne Genre
        createTableCell(character.status, character.status === currentCharacter.status), // Colonne Statut
        createTableCell(character.faction, character.faction === currentCharacter.faction), // Colonne Faction
        createTableCell(character.firstAppearance, compareAppearance(character.firstAppearance, currentCharacter.firstAppearance)), // Colonne Première apparition
        createTableCell(character.affiliation, character.affiliation === currentCharacter.affiliation), // Colonne Affiliation
        createTableCell(character.titansKilled, compareValues(character.titansKilled, currentCharacter.titansKilled)) // Colonne Titans tués
    ];

    // Ajouter les cellules à la ligne avec un délai progressif
    cells.forEach((cell, index) => {
        cell.classList.add('fade-in-cell');
        cell.style.animationDelay = `${index * 0.3}s`; // Augmentez le délai de 0.3s pour chaque cellule
        row.appendChild(cell);
    });

    tableBody.prepend(row); // Ajouter la ligne au début
}


// Fonction pour créer une cellule de tableau avec la classe correcte ou incorrecte
function createTableCell(value, comparisonResult, type) {
    const cell = document.createElement('td');
    if (type === "image") {
        const img = document.createElement("img");
        img.src = value;
        img.alt = "Personnage";
        img.className = "square-image";
        cell.appendChild(img);
    } else {
        cell.textContent = value;

        if (comparisonResult === true) {
            cell.className = "correct";
        } else if (comparisonResult === false) {
            cell.className = "incorrect";
        } else {
            // Ajouter la flèche en fonction du résultat de la comparaison
            const arrow = document.createElement("img");
            arrow.className = "arrow-icon";
            arrow.src = comparisonResult === "up" ? "images/fleche-haut.png" : "images/fleche-bas.png";
            arrow.style.opacity = "0.5"; // Opacité 50% pour les flèches
            cell.className = "incorrect";
            cell.appendChild(arrow);
        }
    }
    return cell;
}

// Fonction pour comparer les valeurs numériques ou les âges
function compareValues(value, target) {
    if (parseInt(value) === parseInt(target)) {
        return true;
    }
    return parseInt(value) < parseInt(target) ? "up" : "down";
}

// Fonction pour comparer les premières apparitions
function compareAppearance(appearance, targetAppearance) {
    // Extraire les saisons et épisodes
    const [season1, episode1] = appearance.match(/\d+/g).map(Number);
    const [season2, episode2] = targetAppearance.match(/\d+/g).map(Number);

    // Comparer les saisons en premier, puis les épisodes
    if (season1 === season2) {
        if (episode1 === episode2) {
            return true;
        }
        return episode1 < episode2 ? "up" : "down";
    }
    return season1 < season2 ? "up" : "down";
}

// Fonction pour afficher le pop-up de victoire
function showWinPopup(character) {
    const winPopup = document.getElementById('winPopup');
    const winImage = document.getElementById('winImage');
    const winStats = document.getElementById('winStats');

    // Mettre à jour l'image et les statistiques dans le pop-up
    winImage.src = character.image;
    winStats.innerHTML = `
        <p>Personnage : ${character.name}</p>
        <p>Âge : ${character.age}</p>
        <p>Genre : ${character.gender}</p>
        <p>Statut : ${character.status}</p>
        <p>Faction : ${character.faction}</p>
        <p>Titans tués : ${character.titansKilled}</p>
        <p>Nombre d'essais : ${attempts}</p>
    `;

    // Afficher le pop-up
    winPopup.style.display = 'block';
}

// Fonction pour fermer le pop-up de victoire
function closeWinPopup() {
    const winPopup = document.getElementById('winPopup');
    winPopup.style.display = 'none';
}

// Fonction pour redémarrer le jeu
function restartGame() {
    closeWinPopup();
    attempts = 0;
    gameWon = false;
    document.getElementById('guessInput').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('guessTableBody').innerHTML = '';
    // Choisir un nouveau personnage aléatoire
    currentCharacter = characters[Math.floor(Math.random() * characters.length)];
}

// Détecter la touche "Entrée" dans l'input
document.getElementById('guessInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const suggestionsContainer = document.getElementById('suggestions');
        const firstSuggestion = suggestionsContainer.querySelector('.suggestion-item');
        
        if (firstSuggestion) {
            // Si des suggestions sont disponibles, choisir la première
            document.getElementById('guessInput').value = firstSuggestion.textContent;
        }
        
        // Appeler la fonction submitGuess pour soumettre la valeur actuelle
        submitGuess();
    }
});
