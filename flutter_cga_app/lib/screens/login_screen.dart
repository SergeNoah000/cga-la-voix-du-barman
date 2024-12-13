import 'package:flutter/material.dart';
import 'package:flutter_cga_app/services/api_service.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _obscurePassword = true;
  late String _username,  _password;

  // Définition des notifiers
  final ValueNotifier<String> statusNotifier = ValueNotifier<String>('status');
  final ValueNotifier<bool> pendingNotifier = ValueNotifier<bool>(false);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo
              Image.asset(
                'assets/logo.png', // Remplacez avec le chemin de votre image
                height: 150,
              ),
              const SizedBox(height: 20),
              const Text(
                'Connexion',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.orange, // Couleur du texte orange
                ),
              ),
              const SizedBox(height: 20),
              // Champ Nom d'utilisateur
              TextField(
                decoration: const InputDecoration(
                  labelText: "Nom d'utilisateur",
                  border: OutlineInputBorder(),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange), // Bordure active orange
                  ),
                ),
                onChanged: (value) => _username = value, // Correction ici (ajout de la virgule à la fin)
              ),
              const SizedBox(height: 10),
              // Champ Mot de passe
              TextField(
                obscureText: _obscurePassword,
                onChanged: (value) => _password = value, // Correction ici (ajout de la virgule à la fin)
                decoration: InputDecoration(
                  labelText: 'Mot de passe',
                  border: const OutlineInputBorder(),
                  focusedBorder: const OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.orange), // Bordure active orange
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
              ),

              // Lien Mot de passe oublié
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {
                    // Logique pour mot de passe oublié
                  },
                  child: const Text(
                    'Mot de passe oublié ?',
                    style: TextStyle(color: Colors.orange), // Texte en orange
                  ),
                ),
              ),
              const SizedBox(height: 10),
              // Bouton de connexion avec état d'attente
              ValueListenableBuilder<bool>(
                valueListenable: pendingNotifier,
                builder: (context, isPending, _) {
                  return ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      foregroundColor: Colors.white, backgroundColor: Colors.orange, // Couleur du texte blanc
                    ),
                    onPressed: isPending
                        ? null
                        : () {
                            pendingNotifier.value = true;
                            ApiService.handleLogin(
                              username: _username, // Remplacez avec les valeurs réelles
                              password: _password,
                              statusNotifier: statusNotifier,
                              pendingNotifier: pendingNotifier,
                              onSuccess: () {
                                // Redirection ou actions supplémentaires après une connexion réussie
                                Navigator.pushReplacementNamed(context, '/');
                              },
                            ).whenComplete(() => pendingNotifier.value = false);
                          },
                    child: isPending
                        ? const CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          )
                        : const Text('Connexion'),
                  );
                },
              ),
              const SizedBox(height: 20),
              // Texte de copyright
              const Text(
                'Copyright © 2017-2023 — CGA La Voix du Barman',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
              // Affichage du statut
              ValueListenableBuilder<String?>(
                valueListenable: statusNotifier,
                builder: (context, status, _) {
                  if (status == null) {
                    return const SizedBox.shrink(); // Ne rien afficher si le statut est nul
                  }
                  return Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: Text(
                      status,
                      style: TextStyle(color: status.contains('succès') ? Colors.green : Colors.red),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
