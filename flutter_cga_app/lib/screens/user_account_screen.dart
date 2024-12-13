import 'package:flutter/material.dart';
import 'dart:convert'; // Pour décoder le JSON des SharedPreferences
import 'package:shared_preferences/shared_preferences.dart';

class AccountScreen extends StatefulWidget {
  const AccountScreen({Key? key}) : super(key: key);

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  Map<String, dynamic>? user;

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
  }

  Future<void> _loadUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    final userInfo = prefs.getString('userInfo');

    if (userInfo != null) {
      setState(() {
        user = jsonDecode(userInfo);
      });
    }
  }

  void _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('userInfo');
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon Compte'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit, color: Colors.white),
            tooltip: 'Modifier le compte',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const EditAccountScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.lock, color: Colors.white),
            tooltip: 'Changer le mot de passe',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ChangePasswordScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: user == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Informations du compte',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: ListView(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        children: [
                          _buildListTile(
                            icon: Icons.person,
                            title: 'Nom d\'utilisateur',
                            value: user!['username'] ?? 'Non défini',
                          ),
                          _buildListTile(
                            icon: Icons.account_circle,
                            title: 'Nom complet',
                            value: user!['fullname'] ?? 'Non défini',
                          ),
                          _buildListTile(
                            icon: Icons.email,
                            title: 'Email',
                            value: user!['email'] ?? 'Non défini',
                          ),
                          _buildListTile(
                            icon: Icons.phone,
                            title: 'Téléphone',
                            value: user!['numTel'] ?? 'Non défini',
                          ),
                          _buildListTile(
                            icon: Icons.description,
                            title: 'Description',
                            value: user!['description'] ?? 'Non définie',
                          ),
                          _buildListTile(
                            icon: Icons.date_range,
                            title: 'Créé le',
                            value: user!['creationDate'] ?? 'Non défini',
                          ),
                          _buildListTile(
                            icon: Icons.update,
                            title: 'Mis à jour le',
                            value: user!['updateDate'] ?? 'Non défini',
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            padding: const EdgeInsets.symmetric(
                              vertical: 12,
                              horizontal: 20,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const EditAccountScreen(),
                              ),
                            );
                          },
                          icon: const Icon(Icons.edit),
                          label: const Text('Modifier'),
                        ),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange,
                            padding: const EdgeInsets.symmetric(
                              vertical: 12,
                              horizontal: 20,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    const ChangePasswordScreen(),
                              ),
                            );
                          },
                          icon: const Icon(Icons.lock),
                          label: const Text('Mot de passe'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        padding: const EdgeInsets.symmetric(
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      onPressed: _logout,
                      icon: const Icon(Icons.logout),
                      label: const Text('Se déconnecter'),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildListTile({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.blueAccent, size: 28),
      title: Text(
        title,
        style: const TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 18,
        ),
      ),
      subtitle: Text(
        value,
        style: const TextStyle(
          color: Colors.black54,
          fontSize: 16,
        ),
      ),
      dense: true,
    );
  }
}

class EditAccountScreen extends StatelessWidget {
  const EditAccountScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Modifier le Compte'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildFormField('Nom d\'utilisateur'),
            _buildFormField('Nom complet'),
            _buildFormField('Email'),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () {
                // Sauvegarder les modifications
              },
              icon: const Icon(Icons.save),
              label: const Text('Sauvegarder'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFormField(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextFormField(
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(),
        ),
      ),
    );
  }
}

class ChangePasswordScreen extends StatelessWidget {
  const ChangePasswordScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Changer le Mot de Passe'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildPasswordField('Ancien mot de passe'),
            _buildPasswordField('Nouveau mot de passe'),
            _buildPasswordField('Confirmer le mot de passe'),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () {
                // Mettre à jour le mot de passe
              },
              icon: const Icon(Icons.lock_reset),
              label: const Text('Mettre à jour'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPasswordField(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextFormField(
        obscureText: true,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(),
        ),
      ),
    );
  }
}
