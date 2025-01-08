// Synchronisation des opérations CRUD en ligne et en local
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_cga_app/models/user_model.dart';
import 'package:flutter_cga_app/services/api_service.dart';
import 'package:flutter_cga_app/services/database_service.dart';
import 'package:http/http.dart' as http;

class UserRepository {
  final DatabaseService dbService =
      DatabaseService(); // Access to your existing DatabaseService
  final String serverUrl = ApiService().baseUrl;

  // Insertion d'un utilisateur
  Future<void> addUser1(
      {required UserModel user,
      required ValueNotifier<String> statusNotifier,
      required ValueNotifier<bool> pendingNotifier,
      required ValueNotifier<String> messageNotifier,
      required VoidCallback onSuccess}) async {
    try {
      pendingNotifier.value = true;
      statusNotifier.value = 'En cours';
      messageNotifier.value = 'Ajout de l\'utilisateur en cours...';

      // Préparer les données en tant que FormData
      final data = {
        'api/user-register': 'true',
        'username': user.username,
        'password': user.password,
        'fullname': user.fullname,
        'role': user.role
      };

      final formData = data.entries
          .map((entry) =>
              '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
          .join('&');
      // Tentative d'insertion en ligne
      final response = await http.post(Uri.parse(serverUrl), body: formData);

      if (response.statusCode == 201) {
        // Récupérer l'utilisateur inséré et le sauvegarder localement
        // final data = jsonDecode(response.body);
        // user.id = data['user'];
        await dbService.insertUser(user);

        statusNotifier.value = 'Succès';
        messageNotifier.value = 'Utilisateur ajouté avec succès !';
        onSuccess();
      } else {
        throw Exception(jsonDecode(response.body)['msg'] ?? 'Erreur inconnue.');
      }
    } catch (e) {
      // Sauvegarde locale en cas d'erreur ou de déconnexion
      await dbService.insertUser(user);

      statusNotifier.value = 'Hors ligne';
      messageNotifier.value =
          'Utilisateur ajouté localement. Synchronisation en attente.';
    } finally {
      pendingNotifier.value = false;
    }
  }

  // Mise à jour d'un utilisateur
  Future<void> updateUser1(
      {required UserModel user,
      required ValueNotifier<String> statusNotifier,
      required ValueNotifier<bool> pendingNotifier,
      required ValueNotifier<String> messageNotifier,
      required VoidCallback onSuccess}) async {
    try {
      pendingNotifier.value = true;
      statusNotifier.value = 'En cours';
      messageNotifier.value = 'Mise à jour de l\'utilisateur en cours...';

      // Préparer les données en tant que FormData
      final data = {
        'api/users-manage': 'true',
        'id': user.id.toString(),
        'username': user.username,
        'password': user.password,
        'fullname': user.fullname,
        'email': user.email,
        'numTel': user.numTel,
        'description': user.description,
        'role': user.role
      };

      final formData = data.entries
          .map((entry) =>
              '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
          .join('&');

      // Tentative de mise à jour en ligne
      final response = await http.post(Uri.parse(serverUrl),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: formData);

      if (response.statusCode == 201) {
        // Suppression de l'utilisateur local et ajout du l'utilisateur en ligne
        // await dbService.deleteUser(user.id as int);

        final data = jsonDecode(response.body);
        print(data);

        statusNotifier.value = 'Succès';
        messageNotifier.value = 'Utilisateur mis à jour avec succès !';
        onSuccess();
      } else {
        throw Exception(
            jsonDecode(response.body)['message'] ?? 'Erreur inconnue.');
      }
    } catch (e) {
      // Mise à jour locale en cas d'erreur ou de déconnexion
      print(
          "une erreur s'est produite lors de la tentative ed mise a jour en ligne: ");
      print(e);
      await dbService.updateUser(user);

      statusNotifier.value = 'Hors ligne';
      messageNotifier.value =
          'Mise à jour effectuée localement. Synchronisation en attente.';
    } finally {
      pendingNotifier.value = false;
    }
  }

  // Suppression d'un utilisateur
  Future<void> deleteUser1(
      {required int id,
      required ValueNotifier<String> statusNotifier,
      required ValueNotifier<bool> pendingNotifier,
      required ValueNotifier<String> messageNotifier,
      required VoidCallback onSuccess}) async {
    try {
      pendingNotifier.value = true;
      statusNotifier.value = 'En cours';
      messageNotifier.value = 'Suppression de l\'utilisateur en cours...';

      // Préparer les données en tant que FormData
      final data = {'api/user-delete': 'true', 'id': id.toString()};

      final formData = data.entries
          .map((entry) =>
              '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
          .join('&');
      // Tentative de suppression en ligne
      final response = await http.post(Uri.parse(serverUrl),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: formData);

      if (response.statusCode == 200) {
        // Suppression réussie en ligne, effectuer localement
        await dbService.deleteUser(id);

        statusNotifier.value = 'Succès';
        messageNotifier.value = 'Utilisateur supprimé avec succès !';
        onSuccess();
      } else {
        throw Exception(
            jsonDecode(response.body)['message'] ?? 'Erreur inconnue.');
      }
    } catch (e) {
      // Suppression locale en cas d'erreur ou de déconnexion
      await dbService.deleteUser(id);

      statusNotifier.value = 'Hors ligne';
      messageNotifier.value =
          'Suppression effectuée localement. Synchronisation en attente.';
    } finally {
      pendingNotifier.value = false;
    }
  }

  // Insertion d'un utilisateur
  Future<void> addUser(
      {required UserModel user,
      required ValueNotifier<String> statusNotifier,
      required ValueNotifier<bool> pendingNotifier,
      required ValueNotifier<String> messageNotifier,
      required VoidCallback onSuccess}) async {
    try {
      pendingNotifier.value = true;
      statusNotifier.value = 'En cours';
      messageNotifier.value = 'Ajout de l\'utilisateur en cours...';

      // Ajouter en local uniquement
      await dbService.insertUser(user);

      statusNotifier.value = 'Succès';
      messageNotifier.value = 'Utilisateur ajouté localement !';
      onSuccess();
    } catch (e) {
      statusNotifier.value = 'Erreur';
      messageNotifier.value = 'Erreur lors de l\'ajout local : $e';
    } finally {
      pendingNotifier.value = false;
    }
  }

  // Mise à jour d'un utilisateur
  Future<void> updateUser(
      {required UserModel user,
      required ValueNotifier<String> statusNotifier,
      required ValueNotifier<bool> pendingNotifier,
      required ValueNotifier<String> messageNotifier,
      required VoidCallback onSuccess}) async {
    try {
      pendingNotifier.value = true;
      statusNotifier.value = 'En cours';
      messageNotifier.value = 'Mise à jour de l\'utilisateur en cours...';

      // Mettre à jour en local uniquement
      await dbService.updateUser(user);

      statusNotifier.value = 'Succès';
      messageNotifier.value = 'Utilisateur mis à jour localement !';
      onSuccess();
    } catch (e) {
      statusNotifier.value = 'Erreur';
      messageNotifier.value = 'Erreur lors de la mise à jour locale : $e';
    } finally {
      pendingNotifier.value = false;
    }
  }

  // Suppression d'un utilisateur
  Future<void> deleteUser(
      {required int id,
      required ValueNotifier<String> statusNotifier,
      required ValueNotifier<bool> pendingNotifier,
      required ValueNotifier<String> messageNotifier,
      required VoidCallback onSuccess}) async {
    try {
      pendingNotifier.value = true;
      statusNotifier.value = 'En cours';
      messageNotifier.value = 'Suppression de l\'utilisateur en cours...';

      // Supprimer en local uniquement
      await dbService.deleteUser(id);

      statusNotifier.value = 'Succès';
      messageNotifier.value = 'Utilisateur supprimé localement !';
      onSuccess();
    } catch (e) {
      statusNotifier.value = 'Erreur';
      messageNotifier.value = 'Erreur lors de la suppression locale : $e';
    } finally {
      pendingNotifier.value = false;
    }
  }

  Future<List<UserModel>> getRemoteUsers() async {
    try {
      final data = {
        'api/users/all': 'true',
      };

      final formData = data.entries
          .map((entry) =>
              '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
          .join('&');

      final response = await http.post(
        Uri.parse(serverUrl),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: formData,
      );

      if (response.statusCode == 202 || response.statusCode == 200) {
        final responseData = jsonDecode(response.body);

        // Assurez-vous que c'est bien une liste
        if (responseData is List) {
          return responseData.map((data) {
            // Gérer les champs null et conversion des types
            return UserModel(
              id: data['id'],
              username: data['username'] ?? '',
              fullname: data['fullname'] ?? '',
              password: data['password'] ?? '',
              description: data['description'],
              email: data['email'],
              numTel: data['numTel'] != null
                  ? int.tryParse(data['numTel'].toString())
                  : null,
              creationDate: data['creationDate'],
              updateDate: data['updateDate'],
              role: data['role'] ?? 'utilisateur',
            );
          }).toList();
        } else {
          print(
              "La réponse de la liste des utilisateurs n'est pas une liste !");
          return [];
        }
      } else {
        final errorMessage = jsonDecode(response.body)['msg'] ??
            'Erreur inconnue lors de la récupération des utilisateurs distants';
        print(errorMessage);
        return [];
      }
    } catch (e, stackTrace) {
      print('Erreur lors de la récupération des utilisateurs distants: $e');
      print('Traceback: $stackTrace');
      return [];
    }
  }

  /// Synchronisation des utilisateurs distants avec les utilisateurs locaux
  Future<bool> syncUsers() async {
    try {
      // Récupérer les utilisateurs ajoutés localement
      List<UserModel> addedUsers = await dbService.getAddedUsers();

      // Récupérer les utilisateurs modifiés localement
      List<UserModel> updatedUsers = await dbService.getUpdatedUsers();

      // Récupérer les utilisateurs supprimés localement
      List<int> deletedUserIds = await dbService.getDeletedUserIds();

      // Préparer les données à envoyer à l'API
      final data = {
        'api/sync-users': 'true',
        'added_users': addedUsers.map((user) => user.toMap()).toList(),
        'updated_users': updatedUsers.map((user) => user.toMap()).toList(),
        'deleted_users': deletedUserIds,
      };

      final formData = data.entries
          .map((entry) =>
              '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
          .join('&');

      print("Body de la requete à envoyer: " + formData);

      // Envoyer les données de synchronisation à l'API
      final response = await http.post(
        Uri.parse(serverUrl),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: formData,
      );
      print("Response de la requete à envoyer: " + response.body);
      if (response.statusCode == 200 || response.statusCode == 201) {
        // Récupérer la dernière version des utilisateurs depuis l'API
        List<UserModel> remoteUsers = await getRemoteUsers();
        print("Remotes Users: ");
        print(remoteUsers.map((user) => user.toMap()));

        // Supprimer les données locales obsolètes
        await dbService.deleteAllUsers();

        // Insérer les utilisateurs synchronisés localement
        for (var remoteUser in remoteUsers) {
          await dbService.insertUser(remoteUser);
          await dbService.markAsSynced(remoteUser.id as int);
        }

        print("Synchronisation des utilisateurs terminée avec succès.");
        return true;
      } else {
        final errorMessage = jsonDecode(response.body)['msg'] ??
            'Erreur inconnue lors de la synchronisation des utilisateurs';
        print(errorMessage);
        return false;
      }
    } catch (e, stackTrace) {
      print("Erreur lors de la synchronisation des utilisateurs: $e");
      print("Traceback: $stackTrace");
      return false;
    }
  }

  // Récupération des utilisateurs locaux
  Future<List<UserModel>> getLocalUsers() async {
    return await dbService.getUsers();
  }
}
