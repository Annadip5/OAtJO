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
            const choix = document.getElementById('choix').value;

            if (self.type === 'public') {
                self.lancerPartiePublique();
            } else if (self.type === 'private' && choix === 'rejoindre') {
                self.rejoindrePartie();
            } else if (self.type === 'private' && choix === 'creer') {
                if (!document.getElementById('code-creer').value) {
                    self.creerPartie();
                } else {
                    self.lancerPartiePrivee();
                }
            }
            //const queryString = `?pseudo=${self.pseudo}&type=${self.type}&indice=${self.indice}`;

            //window.location.href = `${window.location.pathname}game.html${queryString}`;
        }

        // Ajout de l'événement de soumission du formulaire
        document.getElementById('formulaire').addEventListener('submit', handleForm);

        // Gestion des clics sur les flèches gauche et droite
        this.fleche_d.onclick = function () {
            self.indice++;
            if (self.indice > self.skins.length - 1) {
                self.indice = 0;
            }
            self.photo.setAttribute("src", "../assets/images/drapeaux/" + self.skins[self.indice]);
        };

        this.fleche_g.onclick = function () {
            self.indice--;
            if (self.indice < 0) {
                self.indice = self.skins.length - 1;
            }
            self.photo.setAttribute("src", "../assets/images/drapeaux/" + self.skins[self.indice]);
        };
        document.getElementById('type').addEventListener('change', function () {
            self.afficherChamps();
        });

        document.getElementById('choix').addEventListener('change', function () {
            self.afficherChampSelection();
        });

        // Gestion des boutons
        document.querySelector("#champ-rejoindre .bouton[type='submit']").addEventListener('click', function (event) {
            event.preventDefault();
            self.rejoindrePartie();
        });

        document.querySelector("#champ-creer .bouton[type='button']").addEventListener('click', function () {
            self.creerPartie();
        });
    }
    afficherChamps() {
        var type = document.getElementById("type").value;
        var champSelection = document.getElementById("champ-selection");
        var champCreer = document.getElementById("code-creer");

        if (type === "private") {
            champSelection.style.display = "block";
        } else {
            champSelection.style.display = "none";
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
        console.log("Rejoindre la partie avec le code : " + code);
        if (code != "") {
            const queryString = `?pseudo=${this.pseudo}&type=${this.type}&code=${code}&indice=${this.indice}`;
            window.location.href = `${window.location.pathname}game.html${queryString}`;
        }
        else {
            alert("Veuillez entrer un code pour rejoindre une partie.");
        }

    }

    creerPartie() {
        const code = this.genererCode();
        document.getElementById("code-creer").value = code;
        console.log("Créer une partie avec le code : " + code);
    }

    lancerPartiePrivee() {
        const code = document.getElementById("code-creer").value;
        const queryString = `?pseudo=${this.pseudo}&type=${this.type}&code=${code}&indice=${this.indice}`;
        window.location.href = `${window.location.pathname}game.html${queryString}`;
    }
    lancerPartiePublique() {
        console.log("Lancer une partie publique");
        const queryString = `?pseudo=${this.pseudo}&type=${this.type}&indice=${this.indice}`;
        window.location.href = `${window.location.pathname}game.html${queryString}`;
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
