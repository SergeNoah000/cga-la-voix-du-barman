class ContribuableModel {
  int? id;
  String? numero;
  String? raisonSociale;
  String? sigle;
  String? niu;
  String? activitePrincipale;
  String? tel;
  String? email;
  String? codeRegime;
  String? regime;
  String? sigleCga;
  String? cga;
  String? codeUniteGestion;
  String? uniteGestion;
  String? codeClient;
  int paiement;
  String statut;
  String? localisation;
  String? distributeur;
  String? ancienCga;
  int? userId;
  int validate;
  int traite;
  int upToDate;
  String? creationDate;
  String? updateDate;

  ContribuableModel({
    this.id,
    this.numero,
    this.raisonSociale,
    this.sigle,
    this.niu,
    this.activitePrincipale,
    this.tel,
    this.email,
    this.codeRegime,
    this.regime,
    this.sigleCga,
    this.cga,
    this.codeUniteGestion,
    this.uniteGestion,
    this.codeClient,
    this.paiement = 0,
    this.statut = 'ancien',
    this.localisation,
    this.distributeur,
    this.ancienCga,
    this.userId,
    this.validate = 0,
    this.traite = 0,
    this.upToDate = 0,
    this.creationDate,
    this.updateDate,
  });

  // Convert a Contribuable object into a Map object for database operations
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'numero': numero,
      'raison_sociale': raisonSociale,
      'sigle': sigle,
      'niu': niu,
      'activite_principale': activitePrincipale,
      'tel': tel,
      'email': email,
      'coderegime': codeRegime,
      'regime': regime,
      'siglecga': sigleCga,
      'cga': cga,
      'codeunitegestion': codeUniteGestion,
      'unite_gestion': uniteGestion,
      'codeClient': codeClient,
      'paiement': paiement,
      'statut': statut,
      'localisation': localisation,
      'distributeur': distributeur,
      'ancienCga': ancienCga,
      'userId': userId,
      'validate': validate,
      'traite': traite,
      'upToDate': upToDate,
      'creation_date': creationDate,
      'update_date': updateDate,
    };
  }

  // Convert a Map object into a Contribuable object
  factory ContribuableModel.fromMap(Map<String, dynamic> map) {
    return ContribuableModel(
      id: map['id'],
      numero: map['numero'],
      raisonSociale: map['raison_sociale'],
      sigle: map['sigle'],
      niu: map['niu'],
      activitePrincipale: map['activite_principale'],
      tel: map['tel'],
      email: map['email'],
      codeRegime: map['coderegime'],
      regime: map['regime'],
      sigleCga: map['siglecga'],
      cga: map['cga'],
      codeUniteGestion: map['codeunitegestion'],
      uniteGestion: map['unite_gestion'],
      codeClient: map['codeClient'],
      paiement: map['paiement'] ?? 0,
      statut: map['statut'] ?? 'ancien',
      localisation: map['localisation'],
      distributeur: map['distributeur'],
      ancienCga: map['ancienCga'],
      userId: map['userId'],
      validate: map['validate'] ?? 0,
      traite: map['traite'] ?? 0,
      upToDate: map['upToDate'] ?? 0,
      creationDate: map['creation_date'],
      updateDate: map['update_date'],
    );
  }
}
