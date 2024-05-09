class Accueil {
    pseudo;
    type;
    indice;
    skins = ["AfriqueSud.png", "Allemagne.png", "Angleterre.png", "Bresil.png", "Cameroun.png", "Canada.png", "Chine.png", "Espagne.png", "EtatUnis.png", "France.png", "Italie.png", "Russie.png", "Ukraine.png"];
    photo;
    fleche_g;
    fleche_d;
    constructor() {

        this.pseudo = 'init';
        this.type = 'init';
        this.indice = 0;
        this.photo = document.getElementById("show");
        this.fleche_g = document.getElementsByClassName("arrow")[0];
        this.fleche_d = document.getElementsByClassName("arrow")[1];

        this.initListeners();
    }

    initListeners() {
        const self = this;

        // Fonction de gestion des données du formulaire
        function handleForm(event) {
            event.preventDefault();
            self.pseudo = document.getElementById('pseudo').value;
            self.type = document.getElementById('type').value;
            console.log("Pseudo:", self.pseudo);
            console.log("Type de partie:", self.type);
            console.log("Indice:", self.indice);

            const queryString = `?pseudo=${self.pseudo}&type=${self.type}&indice=${self.indice}`;

            window.location.href = `${window.location.pathname}game.html${queryString}`;
        }

        // Ajout de l'événement de soumission du formulaire
        document.getElementById('formulaire').addEventListener('submit', handleForm);

        // Gestion des clics sur les flèches gauche et droite
        this.fleche_d.onclick = function () {
            self.indice++;
            if (self.indice > self.skins.length - 1) {
                self.indice = 0;
            }
            console.log("Droite");
            self.photo.setAttribute("src", "../assets/images/drapeaux/" + self.skins[self.indice]);
        };

        this.fleche_g.onclick = function () {
            self.indice--;
            if (self.indice < 0) {
                self.indice = self.skins.length - 1;
            }
            console.log("Gauche");
            self.photo.setAttribute("src", "../assets/images/drapeaux/" + self.skins[self.indice]);
        };
    }
    afficherChamps() {
        var type = document.getElementById("type").value;
        var champSelection = document.getElementById("champ-selection");
        var champCreer = document.getElementById("code-creer");

        if (type === "private") {
            champSelection.style.display = "block";
        } else {
            champSelection.style.display = "none";
            // Réinitialiser le champ de texte du code de la partie
            champCreer.value = "";
        }
    }

    afficherChampSelection() {
        var choix = document.getElementById("choix").value;
        var champRejoindre = document.getElementById("champ-rejoindre");
        var champCreer = document.getElementById("champ-creer");

        if (choix === "rejoindre") {
            champRejoindre.style.display = "block";
            champCreer.style.display = "none";
        } else if (choix === "creer") {
            champRejoindre.style.display = "none";
            champCreer.style.display = "block";
        } else {
            champRejoindre.style.display = "none";
            champCreer.style.display = "none";
            champCreer.value = "";
        }
    }

    rejoindrePartie() {
        var code = document.getElementById("code").value;
        // Logique pour rejoindre une partie avec le code donné
        console.log("Rejoindre la partie avec le code : " + code);
    }

    creerPartie() {
        // Logique pour créer une partie et obtenir le code
        var code = genererCode();
        document.getElementById("code-creer").value = code;
    }

    genererCode() {
        // Génération d'un code de partie aléatoire
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var code = '';
        for (var i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }
}

// Export de la classe Game
export default Accueil;
