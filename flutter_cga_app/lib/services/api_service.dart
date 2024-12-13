import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:crypto/crypto.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';

class ApiService {
  final  String baseUrl = 'https://cga.legionweb.co/cga-server.php';

  Future<void> syncUser(Map<String, dynamic> userData) async {
    try {
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(userData),
      );
      if (response.statusCode == 200) {
        print("Utilisateur synchronisé avec succès !");
      } else {
        print(
            "Erreur lors de la synchronisation de l'utilisateur : ${response.statusCode}");
      }
    } catch (e) {
      print("Exception lors de la synchronisation de l'utilisateur : $e");
    }
  }

  static const String _apiUrl = 
      'https://cga.legionweb.co/cga-server.php'; // URL de l'API

  // Fonction de hachage du mot de passe
  static String hashPassword(String password) {   
    final bytes = utf8.encode(password); // Convertir le mot de passe en bytes
    final hashed = sha256.convert(bytes); // Calculer le hash SHA-256
    return hashed.toString(); // Retourner la chaîne de caractères du hash
  }

  // Fonction de connexion
  static Future<void> handleLogin({
    required String username,
    required String password,
    required ValueNotifier<String> statusNotifier,
    required ValueNotifier<bool> pendingNotifier,
    required VoidCallback onSuccess,
  }) async {
    try {
      // Hachage du mot de passe
      final hashedPassword = hashPassword(password);
      print("Hashed password: " + hashedPassword);


      // Préparer les données du formulaire
      final request = http.MultipartRequest('POST', Uri.parse(_apiUrl))
        ..fields['api/login'] = 'ttest'
        ..fields['username'] = username
        ..fields['password'] = hashedPassword;

      // Mettre à jour l'état en attente
      pendingNotifier.value = true;

      // Envoyer la requête
      final response = await request.send();
      final responseBody = await response.stream.bytesToString();
      final responseData = json.decode(responseBody);

      // Gérer la réponse
      pendingNotifier.value = false;
      if (response.statusCode == 202) {
        statusNotifier.value = responseData['msg'] ?? 'Succès';
        Future.delayed(const Duration(seconds: 4), () {
          statusNotifier.value = '';
        });
      } else {
        // Enregistrer les informations utilisateur dans SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        final userData = json.encode(responseData['user']);
        await prefs.setString('userInfo', userData);

        onSuccess();
      }
    } catch (error) {
      // Gérer les erreurs
      pendingNotifier.value = false;
      statusNotifier.value = 'Erreur: ${error.toString()}';
      Future.delayed(const Duration(seconds: 4), () {
        statusNotifier.value = '';
      });
    }
  }
}
