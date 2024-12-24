import 'package:flutter/material.dart';
import 'package:flutter_cga_app/services/api_service_contribuables.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter_cga_app/models/contribuable_model.dart';

class ContribuableFormScreen extends StatefulWidget {
  final ContribuableModel? contribuable;

  const ContribuableFormScreen({Key? key, this.contribuable}) : super(key: key);

  @override
  _ContribuableFormScreenState createState() => _ContribuableFormScreenState();
}

class _ContribuableFormScreenState extends State<ContribuableFormScreen> {
  final _formKey = GlobalKey<FormState>();

  final ValueNotifier<bool> pendingNotifier = ValueNotifier<bool>(false);
  final ValueNotifier<String> statusNotifier = ValueNotifier<String>('');
  final ValueNotifier<String> messageNotifier = ValueNotifier<String>('');

  // Champs de formulaire
  late String _numero,
      _raisonSociale,
      _sigle,
      _niu,
      _activitePrincipale,
      _tel,
      _email;
  late String _codeRegime,
      _regime,
      _sigleCga,
      _cga,
      _codeUniteGestion,
      _uniteGestion;
  late String _codeClient, _statut, _localisation, _distributeur, _ancienCga;
  late int _paiement, _validate, _traite, _upToDate, _reste;
  late DateTime? _creationDate, _updateDate;
  late ContribuableModel _contribuable;

  // Exemple de méthode pour afficher les toasts
  void _showToast(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      timeInSecForIosWeb: 3,
      backgroundColor: Colors.black,
      textColor: Colors.white,
      fontSize: 14.0,
    );
  }

  @override
  void dispose() {
    pendingNotifier.dispose();
    statusNotifier.dispose();
    messageNotifier.dispose();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Récupérer les arguments uniquement une fois
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is ContribuableModel) {
      setState(() {
        _contribuable = args;
        _numero = _contribuable.numero ?? '';
        _raisonSociale = _contribuable.raisonSociale ?? '';
        _sigle = _contribuable.sigle ?? '';
        _niu = _contribuable.niu ?? '';
        _activitePrincipale = _contribuable.activitePrincipale ?? '';
        _tel = _contribuable.tel ?? '';
        _email = _contribuable.email ?? '';
        _codeRegime = _contribuable.codeRegime ?? '';
        _regime = _contribuable.regime ?? '';
        _sigleCga = _contribuable.sigleCga ?? '';
        _cga = _contribuable.cga ?? '';
        _codeUniteGestion = _contribuable.codeUniteGestion ?? '';
        _uniteGestion = _contribuable.uniteGestion ?? '';
        _codeClient = _contribuable.codeClient ?? '';
        _paiement = _contribuable.paiement;
        _statut = _contribuable.statut;
        _localisation = _contribuable.localisation ?? '';
        _distributeur = _contribuable.distributeur ?? '';
        _ancienCga = _contribuable.ancienCga ?? '';
        _validate = _contribuable.validate ?? 0;
        _traite = _contribuable.traite ?? 0;
        _reste = _contribuable.statut == 'ancien'
            ? 50000 - _contribuable.paiement
            : 75000 - _contribuable.paiement ?? 0;
      });
    } else {
      print('Aucun contribuable passé en argument');
    }
  }

  @override
  void initState() {
    super.initState();
    //  _contribuable = (ModalRoute.of(context)?.settings.arguments as ContribuableModel?)!;
    // Initialisation de `_contribuable` basé sur les données passées dans le constructeur
    if (widget.contribuable != null) {
      _contribuable = widget.contribuable!;
      _numero = _contribuable.numero ?? '';
      _raisonSociale = _contribuable.raisonSociale ?? '';
      _sigle = _contribuable.sigle ?? '';
      _niu = _contribuable.niu ?? '';
      _activitePrincipale = _contribuable.activitePrincipale ?? '';
      _tel = _contribuable.tel ?? '';
      _email = _contribuable.email ?? '';
      _codeRegime = _contribuable.codeRegime ?? '';
      _regime = _contribuable.regime ?? '';
      _sigleCga = _contribuable.sigleCga ?? '';
      _cga = _contribuable.cga ?? '';
      _codeUniteGestion = _contribuable.codeUniteGestion ?? '';
      _uniteGestion = _contribuable.uniteGestion ?? '';
      _codeClient = _contribuable.codeClient ?? '';
      _paiement = _contribuable.paiement ?? 0;
      _statut = _contribuable.statut ?? 'ancien';
      _reste = _contribuable.statut == 'ancien'
          ? 50000 - _contribuable.paiement
          : 75000 - _contribuable.paiement ?? 0;
      _localisation = _contribuable.localisation ?? '';
      _distributeur = _contribuable.distributeur ?? '';
      _ancienCga = _contribuable.ancienCga ?? '';
      _validate = _contribuable.validate ?? 0;
      _traite = _contribuable.traite ?? 0;
      _upToDate = _contribuable.upToDate ?? 0;
      _creationDate = _contribuable.creationDate != null
          ? DateTime.tryParse(_contribuable.creationDate!)
          : null;
      _updateDate = _contribuable.updateDate != null
          ? DateTime.tryParse(_contribuable.updateDate!)
          : null;
    } else {
      _contribuable = ContribuableModel();
      _numero = '';
      _raisonSociale = '';
      _sigle = '';
      _niu = '';
      _activitePrincipale = '';
      _tel = '';
      _email = '';
      _codeRegime = '';
      _regime = '';
      _sigleCga = '';
      _cga = '';
      _codeUniteGestion = '';
      _uniteGestion = '';
      _codeClient = '';
      _paiement = 0;
      _statut = 'ancien';
      _localisation = '';
      _distributeur = '';
      _ancienCga = '';
      _validate = 0;
      _traite = 0;
      _upToDate = 0;
      _creationDate = null;
      _updateDate = null;
      _reste = 50000;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.orange,
        title: Text(
          _contribuable.id == null
              ? 'Ajouter Contribuable'
              : 'Modifier Contribuable',
          style: const TextStyle(color: Colors.white),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                initialValue: _raisonSociale,
                decoration: const InputDecoration(
                  labelText: 'Raison Sociale',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                validator: (value) => value == null || value.isEmpty
                    ? 'Ce champ est obligatoire'
                    : null,
                onChanged: (value) => _raisonSociale = value,
              ),
              TextFormField(
                initialValue: _sigle,
                decoration: const InputDecoration(
                  labelText: 'Sigle',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                onChanged: (value) => _sigle = value,
              ),
              TextFormField(
                initialValue: _niu,
                decoration: const InputDecoration(
                  labelText: 'NIU',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                validator: (value) => value == null || value.isEmpty
                    ? 'Ce champ est obligatoire'
                    : null,
                onChanged: (value) => _niu = value,
              ),
              TextFormField(
                initialValue: _activitePrincipale,
                decoration: const InputDecoration(
                  labelText: 'Activité Principale',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                onChanged: (value) => _activitePrincipale = value,
              ),
              TextFormField(
                initialValue: _tel,
                decoration: const InputDecoration(
                  labelText: 'Téléphone',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                onChanged: (value) => _tel = value,
              ),
              TextFormField(
                initialValue: _email,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                onChanged: (value) => _email = value,
              ),
              // TextFormField(
              //   initialValue: _codeRegime,
              //   decoration: const InputDecoration(
              //     labelText: 'Code Régime',
              //     labelStyle: TextStyle(color: Colors.black),
              //     focusedBorder: UnderlineInputBorder(
              //       borderSide: BorderSide(color: Colors.orange),
              //     ),
              //   ),
              //   onChanged: (value) => _codeRegime = value,
              // ),
              TextFormField(
                initialValue: _regime,
                decoration: const InputDecoration(
                  labelText: 'Régime',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                onChanged: (value) => _regime = value,
              ),
              // TextFormField(
              //   initialValue: _sigleCga,
              //   decoration: const InputDecoration(
              //     labelText: 'Sigle CGA',
              //     labelStyle: TextStyle(color: Colors.black),
              //     focusedBorder: UnderlineInputBorder(
              //       borderSide: BorderSide(color: Colors.orange),
              //     ),
              //   ),
              //   onChanged: (value) => _sigleCga = value,
              // ),
              // TextFormField(
              //   initialValue: _cga,
              //   decoration: const InputDecoration(
              //     labelText: 'CGA',
              //     labelStyle: TextStyle(color: Colors.black),
              //     focusedBorder: UnderlineInputBorder(
              //       borderSide: BorderSide(color: Colors.orange),
              //     ),
              //   ),
              //   onChanged: (value) => _cga = value,
              // ),
              // TextFormField(
              //   initialValue: _codeUniteGestion,
              //   decoration: const InputDecoration(
              //     labelText: 'Code Unité Gestion',
              //     labelStyle: TextStyle(color: Colors.black),
              //     focusedBorder: UnderlineInputBorder(
              //       borderSide: BorderSide(color: Colors.orange),
              //     ),
              //   ),
              //   onChanged: (value) => _codeUniteGestion = value,
              // ),
              TextFormField(
                initialValue: _uniteGestion,
                decoration: const InputDecoration(
                  labelText: 'Unité Gestion',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                onChanged: (value) => _uniteGestion = value,
              ),
              TextFormField(
                initialValue: _codeClient,
                decoration: const InputDecoration(
                  labelText: 'Code Client',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                onChanged: (value) => _codeClient = value,
              ),
              DropdownButtonFormField<String>(
                value: _statut,
                decoration: const InputDecoration(
                  labelText: 'Statut',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                items: ['ancien', 'nouveau'].map((String value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
                onChanged: (String? newValue) {
                  setState(() {
                    _statut = newValue!;
                  });
                },
                onSaved: (value) => _statut = value!,
              ),
              TextFormField(
                initialValue: _paiement.toString(),
                decoration: const InputDecoration(
                  labelText: 'Paiement',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Ce champ est obligatoire';
                  }
                  if (int.tryParse(value) == null) {
                    return 'Veuillez entrer un nombre valide';
                  }
                  return null;
                },
                onChanged: (value) => () {
                  _paiement = int.parse(value);
                  _reste = _statut == 'ancien'
                      ? 50000 - int.parse(value)
                      : 75000 - int.parse(value);
                },
              ),

              TextFormField(
                  readOnly: true,
                  initialValue: _reste.toString(),
                  decoration: const InputDecoration(
                    labelText: 'Reste',
                    labelStyle: TextStyle(color: Colors.black),
                    focusedBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: Colors.orange),
                    ),
                  )),

              TextFormField(
                initialValue: _localisation,
                decoration: const InputDecoration(
                  labelText: 'Localisation',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                onChanged: (value) => _localisation = value,
              ),
              TextFormField(
                initialValue: _distributeur,
                decoration: const InputDecoration(
                  labelText: 'Distributeur',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                onChanged: (value) => _distributeur = value,
              ),
              TextFormField(
                initialValue: _ancienCga,
                decoration: const InputDecoration(
                  labelText: 'CGA Actuel',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                onChanged: (value) => _ancienCga = value,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    _formKey.currentState!.save();

                    // Crée l'objet contribuable
                    ContribuableModel newContribuable = ContribuableModel(
                      id: _contribuable.id,
                      numero: _numero,
                      raisonSociale: _raisonSociale,
                      sigle: _sigle,
                      niu: _niu,
                      activitePrincipale: _activitePrincipale,
                      tel: _tel,
                      email: _email,
                      codeRegime: _codeRegime,
                      regime: _regime,
                      sigleCga: "La Voix Du Barman",
                      cga: "LA VOIX DU BARMAN",
                      codeUniteGestion: _codeUniteGestion,
                      uniteGestion: _uniteGestion,
                      codeClient: _codeClient,
                      paiement: _paiement,
                      statut: _statut,
                      localisation: _localisation,
                      distributeur: _distributeur,
                      ancienCga: _ancienCga,
                      validate: _validate,
                      traite: _traite,
                      upToDate: _upToDate,
                      creationDate: _creationDate.toString(),
                      updateDate: DateTime.now().toString(),
                    );

                    // Change l'état du bouton à "chargement"
                    pendingNotifier.value = true;

                    await ServiceContribuables().createContribuable(
                        contribuableData: newContribuable.toMap(),
                        statusNotifier: statusNotifier,
                        pendingNotifier: pendingNotifier,
                        messageNotifier: messageNotifier,
                        onSuccess: () {
                          // Action en cas de succès
                          _showToast("Contribuable ajouté avec succès !");
                          Navigator.pushNamed(context, '/contribList');
                        },
                        creation: _contribuable.id == null ? true : false);

                    // Affiche le message après la tentative (succès ou erreur)
                    _showToast(messageNotifier.value);
                  }
                },
                child: ValueListenableBuilder<bool>(
                  valueListenable: pendingNotifier,
                  builder: (context, isPending, child) {
                    return isPending
                        ? const SizedBox(
                            height: 24,
                            width: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            _contribuable.id == null ? 'Ajouter' : 'Modifier');
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
