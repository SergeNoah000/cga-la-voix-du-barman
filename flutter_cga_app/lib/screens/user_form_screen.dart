import 'package:flutter/material.dart';
import 'package:flutter_cga_app/models/user_model.dart';
import 'package:flutter_cga_app/services/api_service.dart';
import 'package:flutter_cga_app/services/sync_service.dart';

class UserFormScreen extends StatefulWidget {
  final UserModel? user; // Utilisation du constructeur pour passer l'utilisateur

  // Constructeur modifié pour accepter un utilisateur ou null (si c'est un nouvel utilisateur)
  const UserFormScreen({super.key, this.user});

  @override
  _UserFormScreenState createState() => _UserFormScreenState();
}

class _UserFormScreenState extends State<UserFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late String _username, _fullname, _password, _description, _email, _role;
  late int _numTel;
  late UserModel _user;
  final UserRepository _userRepository = UserRepository(); 
  ValueNotifier<bool> pendingNotifier = ValueNotifier(false);
  ValueNotifier<String> messageNotifier = ValueNotifier('');
  ValueNotifier<String> statusNotifier = ValueNotifier('');
  late bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    // Initialisation de _user basé sur les données passées dans le constructeur
    if (widget.user != null) {
    _user = widget.user!;
    _username = _user.username;
    _fullname = _user.fullname;
    _password = _user.password ;
    _numTel = _user.numTel ?? 0; // Utiliser 0 si numTel est null
    _email = _user.email ?? ''; // Utiliser une chaîne vide si email est null
    _role = _user.role ?? 'Utilisateur'; // Valeur par défaut pour le rôle
    _description = _user.description ?? '';
    } else {
      _user = UserModel(username: '', fullname: '', password: ''); // Utilisateur vide pour un nouvel utilisateur
      _username = '';
      _fullname = '';
      _password = '';
      _numTel = 0;
      _email = '';
      _role = 'Utilisateur'; // Par défaut rôle utilisateur
      _description = '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.orange, // Orange pour la barre d'app
        title: Text(
          _user.id == null ? 'Ajouter Utilisateur' : 'Modifier Utilisateur',
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
                initialValue: _username,
                decoration: const InputDecoration(
                  labelText: 'Nom d\'Utilisateur',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                validator: (value) => value == null || value.isEmpty ? 'Ce champ est obligatoire' : null,
                onSaved: (value) => _username = value!,
              ),
              TextFormField(
                initialValue: _fullname,
                decoration: const InputDecoration(
                  labelText: 'Nom Complet',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                validator: (value) => value == null || value.isEmpty ? 'Ce champ est obligatoire' : null,
                onSaved: (value) => _fullname = value!,
              ),
              TextFormField(
                obscureText: _obscurePassword,                
                initialValue: _password,
                decoration:  InputDecoration(
                  labelText: 'Mot de Passe',
                  labelStyle: const TextStyle(color: Colors.black),
                  focusedBorder: const UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off : Icons.visibility,
                      color: Colors.orange, // Icône orange
                    ),
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                  ),
                ),
                validator: (value) => value == null || value.isEmpty ? 'Ce champ est obligatoire' : null,
                onSaved: (value) => _password = value!,
              ),
              DropdownButtonFormField<String>(
                value: _role,
                decoration: const InputDecoration(
                  labelText: 'Rôle',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                onChanged: (value) {
                  setState(() {
                    _role = value!;
                  });
                },
                items: const [
                  DropdownMenuItem(value: 'secretaire', child: Text('Sécrétaire')),
                  DropdownMenuItem(value: 'Utilisateur', child: Text('Utilisateur')),
                  DropdownMenuItem(value: 'Administrateur', child: Text('Administrateur')),
                ],
              ),
              TextFormField(
                initialValue: _numTel.toString(),
                decoration: const InputDecoration(
                  labelText: 'Numéro de Téléphone',
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
                onSaved: (value) => _numTel = int.parse(value!),
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
                keyboardType: TextInputType.emailAddress,
                validator: (value) => value == null || value.isEmpty ? 'Ce champ est obligatoire' : null,
                onSaved: (value) => _email = value!,
              ),
              TextFormField(
                initialValue: _description,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  labelStyle: TextStyle(color: Colors.black),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange),
                  ),
                ),
                maxLines: 3,
                onSaved: (value) => _description = value!,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    _formKey.currentState!.save();

                    // Vérification si le mot de passe a changé
                    String hashedPassword = (_user.password != _password)
                        ? ApiService.hashPassword(_password) 
                        : _user.password; 

                    UserModel newUser = UserModel(
                      id: _user.id,
                      username: _username,
                      fullname: _fullname,
                      password: hashedPassword,
                      role: _role,
                      numTel: _numTel,
                      email: _email,
                      description: _description,
                    );

                    if (_user.id == null) {
                      await _userRepository.addUser(
                        user: newUser,
                        pendingNotifier: pendingNotifier,
                        messageNotifier: messageNotifier,
                        statusNotifier: statusNotifier,
                        onSuccess: () {
                          _showToast("Utilisateur ajouté avec succès !");
                          Navigator.pushNamed(context, '/userList');
                        },
                      );
                      _showToast(messageNotifier.value); // Message de résultat
                    } else {
                      await _userRepository.updateUser(
                        user: newUser,
                        pendingNotifier: pendingNotifier,
                        messageNotifier: messageNotifier,
                        statusNotifier: statusNotifier,
                        onSuccess: () {
                          _showToast("Utilisateur modifié avec succès !");
                          Navigator.pushNamed(context, '/userList');
                        },
                      );
                      _showToast(messageNotifier.value); // Message de résultat
                    }
                  }
                },
                child: Text(_user.id == null ? 'Ajouter' : 'Modifier'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showToast(String message) {
    final scaffold = ScaffoldMessenger.of(context);
    scaffold.showSnackBar(
      SnackBar(
        content: Text(message),
        action: SnackBarAction(
            label: 'FERMER', onPressed: scaffold.hideCurrentSnackBar),
      ),
    );
  }
}
