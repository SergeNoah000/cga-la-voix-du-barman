import 'package:flutter/material.dart';
import 'package:flutter_cga_app/models/user_model.dart';
import 'package:flutter_cga_app/screens/user_form_screen.dart';
import 'package:flutter_cga_app/services/database_service.dart';
import 'package:flutter_cga_app/services/sync_service.dart';

class UserListScreen extends StatefulWidget {
  const UserListScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _UserListScreenState createState() => _UserListScreenState();
}

class _UserListScreenState extends State<UserListScreen> {
  List<UserModel> _users = [];
  bool _isLoading = true; // Indique si les données sont en cours de chargement
  String _source = "local"; // Indique la source des données

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  Future<void> _fetchUsers() async {
    setState(() {
      _isLoading = true; // Afficher le loader
    });

    List<UserModel> users = await UserRepository().getRemoteUsers();
    if (users.isNotEmpty) {
      setState(() {
        _users = users;
        _source = "remote"; // Les données proviennent de l'API distante
      });
    } else {
      users = await UserRepository().getLocalUsers();
      setState(() {
        _users = users;
        _source = "local"; // Les données proviennent de la base locale
      });
    }

    setState(() {
      _isLoading = false; // Cacher le loader après le chargement
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Liste des Utilisateurs'),
        actions: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            decoration: BoxDecoration(
              color: _source == "remote" ? Colors.green : Colors.blue,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(
                _source == "remote" ? "Distant" : "Local",
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(), // Loader pendant le chargement
            )
          : _users.isEmpty
              ? const Center(
                  child: Text("Aucun utilisateur trouvé."),
                )
              : ListView.builder(
                  itemCount: _users.length,
                  itemBuilder: (context, index) {
                    final user = _users[index];
                    return Card(
                      shape: RoundedRectangleBorder(
                        side: const BorderSide(
                          color: Colors.orange,
                          width: 1.5,
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      margin: const EdgeInsets.all(8.0),
                      child: ListTile(
                        title: Text(user.fullname),
                        subtitle: Text(user.username),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(
                                Icons.edit,
                                color: Colors.orange,
                              ),
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => UserFormScreen(
                                        user: user), // Passer l'utilisateur
                                  ),
                                ).then((_) => _fetchUsers());
                              },
                            ),
                            IconButton(
                              icon: const Icon(
                                Icons.delete,
                                color: Colors.red,
                              ),
                              onPressed: () async {
                                await DatabaseService().deleteUser(user.id!);
                                _fetchUsers();
                              },
                            ),
                          ],
                        ),
                        onTap: () {
                          Navigator.pushNamed(
                            context,
                            '/addUser',
                            arguments: user,
                          ).then((_) => _fetchUsers());
                        },
                      ),
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.add),
        onPressed: () {
          Navigator.pushNamed(context, '/addUser').then((_) => _fetchUsers());
        },
      ),
    );
  }
}
