import 'dart:convert';
import 'dart:io';
// import 'package:file_picker/file_picker.dart';

import 'package:flutter_cga_app/services/api_service.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:flutter_cga_app/screens/contribuable_form_screen.dart';
import 'package:flutter_cga_app/screens/contribuable_list_screen.dart';
import 'package:flutter_cga_app/screens/contribuable_search_screen.dart';
import 'package:flutter_cga_app/screens/user_account_screen.dart';
import 'package:flutter_cga_app/screens/validate_contrib_screen.dart';
import 'package:flutter_cga_app/services/api_service_contribuables.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_cga_app/screens/user_form_screen.dart';
import 'package:flutter_cga_app/screens/user_list_screen.dart';
import 'package:flutter_cga_app/screens/login_screen.dart';
import 'package:flutter_cga_app/services/sync_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Gestion des Contribuables',
      theme: ThemeData(
        primarySwatch: Colors.orange,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      routes: {
        '/': (context) => const MainScreen(),
        '/addUser': (context) => const UserFormScreen(),
        '/userList': (context) => const UserListScreen(),
        '/login': (context) => LoginScreen(),
        '/contribForm': (context) => const ContribuableFormScreen(),
        '/contribList': (context) => ContribuablesTable(),
        '/valideContrib': (context) => const NonValidatedContribuablesTable(),
        '/search': (context) => const ContribuablesSearchPage()
      },
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _MainScreenState createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;
  bool isAdmin = false;
  bool isLoading = true;
  bool isAuthenticated = false;

  List<Widget> _pages = [];
  List<Widget> _adminPages = [];

  @override
  void initState() {
    super.initState();
    _checkUserLoginStatus();
    UserRepository().syncUsers();
  }


  // Fonction pour réinitialiser les contribuables
Future<void> _resetContribuables() async {
  // Logique de réinitialisation : peut-être appeler une API ou nettoyer la base locale.
  await ServiceContribuables().resetContribuablesPayments();
}

// Fonction pour supprimer tous les contribuables
Future<void> _deleteAllContribuables() async {
  // Logique de suppression : peut-être appeler une API ou vider la base locale.
  await ServiceContribuables().deleteAllContribuables();
}

// Fonction pour afficher un dialogue de confirmation
Future<bool?> _showConfirmationDialog(BuildContext context, String message) async {
  return showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text("Confirmation"),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: const Text("Annuler"),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context, true),
          child: const Text("Confirmer"),
        ),
      ],
    ),
  ); // Retourne false si le dialogue est annulé
}


  Future<void> _checkUserLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final userInfo =
        prefs.getString('userInfo'); // Simule les données utilisateur
    final userRole = prefs
        .getString('role'); // Récupération du rôle depuis SharedPreferences

    setState(() {
      isAuthenticated = userInfo != null;
      isAdmin = userRole != 'admin'; // Vérifie si le rôle est admin
      isLoading = false;

      // Configuration des pages disponibles
      _pages = [
        ContribuableFormScreen(),
        ContribuablesTable(),
        AccountScreen(),
      ];

      _adminPages = [
        ContribuableFormScreen(),
        ContribuablesTable(),
        UserListScreen(),
        const NonValidatedContribuablesTable(), // Ajout de la page de validation pour admin
        const AccountScreen(),
      ];
    });
  }



// Future<void> importExcel(BuildContext context) async {
//   try {
//     // Sélectionner un fichier
//     FilePickerResult? result = await FilePicker.platform.pickFiles(
//       type: FileType.custom,
//       allowedExtensions: ['xlsx'], // Fichiers Excel autorisés
//     );

//     if (result == null) {
//       print('Aucun fichier sélectionné.');
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(content: Text("Aucun fichier sélectionné.")),
//       );
//       return;
//     }

//     final fileBytes = result.files.single.bytes;

//     if (fileBytes == null) {
//       print('Impossible de lire le fichier.');
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(content: Text("Erreur lors de la lecture du fichier.")),
//       );
//       return;
//     }

//     // Encodage en Base64
//     final encodedFile = base64Encode(fileBytes);

//     // Préparer les données pour l'API
//     final Map<String, String> requestBody = {
//       'mise-a-jour-en-ligne': 'true',
//       'file': encodedFile,
//     };

//     final formData = requestBody.entries
//         .map((entry) =>
//             '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
//         .join('&');

//     // Envoyer les données
//     final response = await http.post(
//       Uri.parse('https://votre-api-endpoint.com'),
//       headers: {'Content-Type': 'application/x-www-form-urlencoded'},
//       body: formData,
//     );

//     if (response.statusCode == 200) {
//       final data = jsonDecode(response.body);
//       print('Importation réussie : ${data['message']}');
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text(data['message'])),
//       );
//     } else {
//       final data = jsonDecode(response.body);
//       print('Erreur lors de l\'importation : ${data['message']}');
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text("Erreur: ${data['message']}")),
//       );
//     }
//   } catch (e) {
//     print('Erreur lors de l\'importation : $e');
//     ScaffoldMessenger.of(context).showSnackBar(
//       const SnackBar(content: Text("Erreur lors de l'importation.")),
//     );
//   }
// }
  
  
  
  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (!isAuthenticated) {
      return LoginScreen();
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Gestion des Contribuables')),
        drawer: Drawer(
          child: ListView(
            children: <Widget>[
              const DrawerHeader(
                decoration: BoxDecoration(color: Colors.orange),
                child: Text(
                  'Menu',
                  style: TextStyle(color: Colors.white, fontSize: 24),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.home),
                title: const Text('Accueil'),
                onTap: () => Navigator.pushNamed(context, '/'),
              ),
              ListTile(
                leading: const Icon(Icons.person_add),
                title: const Text('Ajouter Utilisateur'),
                onTap: () => Navigator.pushNamed(context, '/addUser'),
              ),
              ListTile(
                leading: const Icon(Icons.search),
                title: const Text('Rechercher'),
                onTap: () => Navigator.pushNamed(context, '/search'),
              ),
              if (isAdmin) ...[
                ListTile(
                  leading: const Icon(Icons.refresh),
                  title: const Text('Réinitialiser les contribuables'),
                  onTap: () async {
                    bool confirm = await _showConfirmationDialog(
                      context,
                      "Êtes-vous sûr de vouloir réinitialiser les contribuables ?",
                    ) as bool;
                    if (confirm) {
                      await _resetContribuables();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Tous les contribuables ont été réinitialisés.")),
                      );
                    }
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.delete),
                  title: const Text('Supprimer tous les contribuables'),
                  onTap: () async {
                    bool confirm = await _showConfirmationDialog(
                      context,
                      "Êtes-vous sûr de vouloir supprimer tous les contribuables ? Cette action est irréversible.",
                    ) as bool;
                    if (confirm) {
                      await _deleteAllContribuables();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Tous les contribuables ont été supprimés.")),
                      );
                    }
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.file_upload),
                  title: const Text('Importer via Excel'),
                  onTap: () async {
                    // await importExcel(context);
                  },
                ),
              ],
            ],
          ),
        ),
body: isAdmin ? _adminPages[_selectedIndex] : _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.orange,
        selectedItemColor: Colors.white,
        unselectedItemColor: Colors.white.withOpacity(.60),
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        items: isAdmin
            ? const <BottomNavigationBarItem>[
                BottomNavigationBarItem(
                  icon: Icon(Icons.add),
                  label: 'Ajout',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.list),
                  label: 'Liste',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.admin_panel_settings),
                  label: 'Admin',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.check),
                  label: 'Valider',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.person),
                  label: 'Compte',
                ),
              ]
            : const <BottomNavigationBarItem>[
                BottomNavigationBarItem(
                  icon: Icon(Icons.add),
                  label: 'Ajout',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.list),
                  label: 'Liste',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.person),
                  label: 'Compte',
                ),
              ],
      ),
    );
  }
}
