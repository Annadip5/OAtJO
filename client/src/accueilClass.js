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
            console.log("Pseudo:", self.pseudo);
            console.log("Indice:", self.indice);

            const queryString = `?pseudo=${self.pseudo}&indice=${self.indice}`;

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
}

// Export de la classe Game
export default Accueil;
