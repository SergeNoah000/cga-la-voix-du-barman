import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_cga_app/models/contribuable_model.dart';
import 'package:flutter_cga_app/services/api_service.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'database_service.dart';

class ServiceContribuables {
  final DatabaseService _dbService =
      DatabaseService(); // Access to your existing DatabaseService
  final String baseUrl = ApiService().baseUrl;

  Future<void> createContribuable({
    required Map<String, dynamic> contribuableData,
    required ValueNotifier<String> statusNotifier,
    required ValueNotifier<bool> pendingNotifier,
    required ValueNotifier<String> messageNotifier, // Nouveau paramètre
    required VoidCallback onSuccess,
    required bool creation,
  }) async {
    try {
      // Mise à jour des notifiers au début de l'opération
      pendingNotifier.value = true;
      statusNotifier.value = 'En cours';
      messageNotifier.value = 'Création du contribuable en cours...';
      // Tentative de l'opération en ligne
      Map<String, dynamic> data;
      final prefs = await SharedPreferences.getInstance();
      final userInfo = prefs.getString('userInfo');
      final userId = jsonDecode(userInfo!)['id'];
      contribuableData['userId'] = userId;
      final userRole = jsonDecode(userInfo)['role'];

      if (userRole == 'admin' || userRole == 'secretaire') {
        contribuableData['validate'] = 1;
        contribuableData['traite'] = 1;
      } else {
        contribuableData['validate'] = 0;
        contribuableData['traite'] = 0; // Marqué comme non traité
      }
      data = Map.from(contribuableData);

      await _saveLocalContribuable(contribuableData, isUpdate: !creation);

      // Mise à jour des notifiers en cas de problème
      statusNotifier.value = 'Hors ligne';
      messageNotifier.value =
          'Impossible de se connecter. Données sauvegardées localement.';
    } catch (e) {
      // Si une erreur survient, afficher un message d'erreur
      statusNotifier.value = 'Erreur';
      messageNotifier.value = 'Erreur lors de la création du contribuable : $e';
    } finally {
      // Toujours désactiver le pendingNotifier à la fin
      pendingNotifier.value = false;
    }
  }

  Future<void> updateContribuable({
    required Map<String, dynamic> contribuableData,
    required ValueNotifier<String> statusNotifier,
    required ValueNotifier<bool> pendingNotifier,
    required ValueNotifier<String> messageNotifier, // Nouveau paramètre
    required VoidCallback onSuccess,
  }) async {
    try {
      // Initialiser les notifiers pour indiquer le début de l'opération
      pendingNotifier.value = true;
      statusNotifier.value = 'En cours';
      messageNotifier.value = 'Mise à jour du contribuable en cours...';

      // Ajouter des informations utilisateur si nécessaire
      final prefs = await SharedPreferences.getInstance();
      final userInfo = prefs.getString('userInfo');
      final userId = jsonDecode(userInfo!)['id'];
      contribuableData['userId'] = userId;
      final userRole = jsonDecode(userInfo!)['role'];

      // En cas d'erreur ou si hors ligne, sauvegarder localement
      contribuableData['userId'] = userId;
      contribuableData['validated'] =
          userRole == 'admin' || userRole == 'secretaire' ? 1 : 0;
      contribuableData['traite'] =
          userRole == 'admin' || userRole == 'secretaire' ? 1 : 0;
      await _saveLocalContribuable(contribuableData, isUpdate: true);

      // Mise à jour des notifiers en cas de problème
      statusNotifier.value = 'Hors ligne';
      messageNotifier.value = ' Données sauvegardées localement.';
    } catch (e) {
      print('Error updating data: $e');
    } finally {
      // Toujours désactiver le pendingNotifier à la fin
      pendingNotifier.value = false;
    }
  }

  Future<void> _saveLocalContribuable(Map<String, dynamic> data,
      {bool isUpdate = false}) async {
    try {
      final db = await _dbService.database;
      if (isUpdate) {
        await db.update(
          'contribuables',
          data..['status'] = 'updated',
          where: 'id =?',
          whereArgs: [data['id']],
        );
      } else {
        await db.insert('contribuables', data..['status'] = 'added');
      }
    } on Exception catch (e) {
      print('Error saving local data: $e');
    }
  }

  Future<List<Map<String, dynamic>>> fetchContribuables({
    required int page,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userInfo = prefs.getString('userInfo');
      final userId = jsonDecode(userInfo!)['id'];
      final userRole = jsonDecode(userInfo!)['role'];

      // Appel de la méthode locale pour récupérer les contribuables
      if (userRole == 'admin' || userRole == 'secretaire') {
        final localContribuables =
            await _dbService.getUserContribuables(userId, page: page);

        // Conversion en liste de Map<String, dynamic>
        return localContribuables
            .map((contribuable) => contribuable.toMap())
            .toList();
      } else {
        final localContribuables =
            await _dbService.getUserContribuables(userId, page: page);
        return localContribuables
            .map((contribuable) => contribuable.toMap())
            .toList();
      }
    } catch (localError, trace) {
      print("Erreur lors de la récupération des données locales : $localError");
      print("Trace: $trace");
      return []; // Retourne une liste vide en cas d'erreur locale
    }
  }

  Future<void> resetContribuablesPayments() async {
    try {
      // Préparer les données à envoyer
      final Map<String, String> requestBody = {
        'api/contribs/renew': 'api/contribs/delete-all'
      };

      // Encodage du body
      final formData = requestBody.entries
          .map((entry) =>
              '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
          .join('&');

      // Envoi de la requête
      final response = await http.post(
        Uri.parse(ApiService().baseUrl),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: formData,
      );
      print("Reponse du reset :");
      print(response.body);
    } catch (e) {
      print('Error resetting contributions: $e');
    }
  }

  Future<void> deleteContribuable(
    int id, {
    required ValueNotifier<String> statusNotifier,
    required ValueNotifier<bool> pendingNotifier,
    required ValueNotifier<String> messageNotifier,
    required VoidCallback onSuccess,
  }) async {
    try {
      pendingNotifier.value = true;
      statusNotifier.value = 'En cours';
      messageNotifier.value = 'Suppression du contribuable en cours...';

      _dbService.deleteContribuable(id);
      statusNotifier.value = 'Succès';
      messageNotifier.value = 'Contribuable supprimé avec succès.';
      onSuccess();
    } catch (e) {
      statusNotifier.value = 'Hors ligne';
      messageNotifier.value =
          'Impossible de se connecter. Veuillez réessayer plus tard.';
    } finally {
      pendingNotifier.value = false;
    }
  }

  Future<List<Map<String, dynamic>>> getAllContribuables() async {
    final db = await _dbService.database;
    return await db.query('contribuables', where: 'status <>  \'deleted\'');
  }

  // Future<void> deleteContribuable(int id) async {
  //   final db = await _dbService.database;
  //   await db.delete('contribuables', where: 'id =?', whereArgs: [id]);
  // }

  Future<void> markContribuableAsProcessed(int id) async {
    final db = await _dbService.database;
    await db.update(
      'contribuables',
      {'traite': 1},
      where: 'id =?',
      whereArgs: [id],
    );
  }

  Future deleteAllContribuables() async {
    try {
      return await _dbService.deleteAllContribuables();
    } catch (e, stackTrace) {
      print('Error deleting all contribuables: $e');
      print('Stacktrace: $stackTrace');
    }
  }

  Future<Map<String, dynamic>> searchContribuables({
    required String codeClient,
    required String nomPrenom,
    required String niu,
    required String tel,
    required int page,
    required String sigle,
    required String localisation,
  }) async {
    return _dbService.searchContribuables(
      codeClient: codeClient,
      raisonSociale: nomPrenom,
      niu: niu,
      tel: tel,
      page: page,
      sigle: sigle,
      localisation: localisation,
    );
  }

  Future<List<ContribuableModel>> getNonValidatedAndNonTraiteContribuables({
    required ValueNotifier<String> statusNotifier,
    required ValueNotifier<bool> pendingNotifier,
    required ValueNotifier<String> messageNotifier,
    int page = 1,
    int pageSize = 100,
  }) async {
    try {
      // Mise à jour des notifiers en cas de succès
      statusNotifier.value = 'Succès';
      messageNotifier.value = 'Contribuables récupérés avec succès !';
      return _dbService.getNonValidatedAndNonTraiteContribuables(
          page: page, pageSize: pageSize);
    } catch (e, stackTrace) {
      print("Une erreur s'est produite lors de la requête : $e");
      print('Stacktrace : $stackTrace');

      // Mise à jour des notifiers en cas de problème
      statusNotifier.value = 'Erreur';
      messageNotifier.value = 'Impossible de récupérer les contribuables : $e';
      return [];
    } finally {
      // Toujours désactiver le pendingNotifier à la fin
      pendingNotifier.value = false;
    }
  }

  Future<void> syncContribuables(BuildContext context) async {
    try {
      print("Début de la synchronisation des contribuables...");

      // Récupérer les données à synchroniser
      List<ContribuableModel> addedContribuables =
          await _dbService.getAddedContribuables();
      List<ContribuableModel> updatedContribuables =
          await _dbService.getUpdatedContribuables();
      List<int> deletedContribuables =
          await _dbService.getDeletedContribuables();
      List<int> validatedContribuables =
          await _dbService.getValidatedContribuables();
      List<int> unvalidatedContribuables =
          await _dbService.getUnvalidatedContribuables();

      // Construire les données à envoyer à l'API
      Map<String, dynamic> data = {
        'api/contribuables-sync': true,
        "added": jsonEncode(addedContribuables.map((e) => e.toMap()).toList()),
        "updated":
            jsonEncode(updatedContribuables.map((e) => e.toMap()).toList()),
        "deleted": jsonEncode(deletedContribuables),
        "validated": jsonEncode(validatedContribuables),
        "unvalidated": jsonEncode(unvalidatedContribuables),
      };

      // Encodage du body
      final formData = data.entries
          .map((entry) =>
              '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
          .join('&');

      // Envoi de la requête
      print('request.body');
      print(formData);
      final response = await http.post(
        Uri.parse(ApiService().baseUrl),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: formData,
      );

      if (response.statusCode == 200) {
        print('response.body');
        print(response.body);
        final result = jsonDecode(response.body);

        if (result['status'] == 'success') {
          print("Ok maintenant suppression et mise à jour en ligne:");
          await _dbService.deleteAllContribuablesafterSync();
          //     // Récupération des informations utilisateur
          print("Suppression Ok!!");
          final prefs = await SharedPreferences.getInstance();
          final userInfo = prefs.getString('userInfo');
          final userRole = jsonDecode(userInfo!)['role'];
          final userId = jsonDecode(userInfo)['id'];
          final String apiKey = userRole == 'admin' || userRole == 'secretaire'
              ? 'api/contribuables/all'
              : 'api/user-contrib-list';

          // Préparer les données à envoyer
          final requestBody = {
            '${apiKey}': apiKey,
            'userId': userId,
          };

          // Encodage du body
          final formData = requestBody.entries
              .map((entry) =>
                  '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
              .join('&');
          // print("Body de la requete de mise en ligne");
          // print(formData);
          // Envoi de la requête
          final response2 = await http.post(
            Uri.parse(ApiService().baseUrl),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: formData,
          );

          // print("Reponse : status code : ${response2.statusCode}; length: ${response2.contentLength}");
          // print("Reponse :");
          // print(response2.body);
          // print("Response code : " + response2.statusCode.toString());

          if (response2.statusCode == 200) {
            final data = jsonDecode(response2.body) ;
            // print(data);
            final contribs = userRole == 'admin' || userRole == 'secretaire'
              ? data : ['data'].cast<Map<String, dynamic>>();
            for (var contrib in contribs) {
              _dbService.insertContribuablAfterSync(
                  ContribuableModel.fromMap(contrib));
            }
            print("Synchronisation des contribuables terminée avec succès.");
            notifyStatus(context, "success", "Synchronisation réussie !");
          } else {
            print("Erreur HTTP pour la dernière requete : statut: ${response2.statusCode} \n body:${response2.body} ");
            notifyStatus(
                context, "error", "Erreur réseau lors de la synchronisation.");
          }
        } else {
          print("Erreur depuis le serveur : ${result['message']}");
          notifyStatus(context, "error",
              "Échec de la synchronisation : ${result['message']}");
        }
      } else {
        print("Erreur HTTP lors de l'envoie de la première requete:  statut: ${response.statusCode} \n body:${response.body} ");
        notifyStatus(
            context, "error", "Erreur réseau lors de la synchronisation.");
      }
    } catch (e, stackTrace) {
      print("Erreur lors de la synchronisation : $e");
      print("Traceback : $stackTrace");
      notifyStatus(context, "error", "Une erreur est survenue : $e");
    }
  }

// Fonction globale pour afficher les notifications
  void notifyStatus(BuildContext context, String status, String message) {
    final color = (status == "success") ? Colors.green : Colors.red;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: color,
        duration: Duration(seconds: 3),
      ),
    );
  }
}































  // Future<void> createContribuable({
  //   required Map<String, dynamic> contribuableData,
  //   required ValueNotifier<String> statusNotifier,
  //   required ValueNotifier<bool> pendingNotifier,
  //   required ValueNotifier<String> messageNotifier, // Nouveau paramètre
  //   required VoidCallback onSuccess,
  //   required bool creation,
  // }) async {
  //   try {
  //     // Mise à jour des notifiers au début de l'opération
  //     pendingNotifier.value = true;
  //     statusNotifier.value = 'En cours';
  //     messageNotifier.value = 'Création du contribuable en cours...';
  //     // Tentative de l'opération en ligne
  //     Map<String, dynamic> data;
  //     final prefs = await SharedPreferences.getInstance();
  //     final userInfo = prefs.getString('userInfo');
  //     final userId = jsonDecode(userInfo!)['id'];
  //     contribuableData['userId'] = userId;
  //     final userRole = jsonDecode(userInfo)['role'];

  //     if (userRole == 'admin' || userRole == 'secretaire') {
  //       contribuableData['validate'] = 1;
  //       contribuableData['traite'] = 1;
  //     } else {
  //       contribuableData['validate'] = 0;
  //       contribuableData['traite'] = 0; // Marqué comme non traité
  //     }
  //     data = Map.from(contribuableData);

  //     if (creation) {
  //       data['api/contrib-register'] = ApiService().baseUrl;
  //     } else {
  //       data['api/contrib-update'] = ApiService().baseUrl;
  //     }
  //     print("Test status: ==== " + statusNotifier.value);
  //     final formData = data.entries
  //         .map((entry) =>
  //             '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
  //         .join('&');
  //     final response = await http.post(
  //       Uri.parse(baseUrl),
  //       headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  //       body: formData,
  //     );
  //     if (response.statusCode >= 200) {
  //       print("Response: " + response.body);
  //       // Création réussie en ligne
  //       final result = response.body;
  //       print(result);
  //       // contribuableData = result;
  //       contribuableData['numero'] = "result['id']";
  //       contribuableData['id'] = null;

  //       // await _saveLocalContribuable(contribuableData, isUpdate: false);

  //       // Mise à jour des notifiers en cas de succès
  //       statusNotifier.value = 'Succès';
  //       messageNotifier.value = 'Contribuable créé avec succès !';
  //       onSuccess(); // Appeler la fonction de succès
  //     } else {
  //       print(response.headers);
  //       print(response.body);
  //       // Échec de la création en ligne, stockage local
  //       contribuableData['traite'] = 0;
  //       await _saveLocalContribuable(contribuableData, isUpdate: false);

  //       // Mise à jour des notifiers en cas d'échec
  //       statusNotifier.value = 'Erreur';
  //       messageNotifier.value =
  //           'Échec de la création en ligne. Données sauvegardées localement.';
  //     }
  //   } catch (e, stackTrace) {
  //     print("Une erreur s'est produite lors de l'envoie de la requete: ");
  //     print(e.toString());
  //     print('Stacktrace : $stackTrace');
  //     // En cas d'erreur ou hors ligne, stockage local
  //     contribuableData['traite'] = 0;
  //     await _saveLocalContribuable(contribuableData, isUpdate: false);

  //     // Mise à jour des notifiers en cas de problème
  //     statusNotifier.value = 'Hors ligne';
  //     messageNotifier.value =
  //         'Impossible de se connecter. Données sauvegardées localement.';
  //   } finally {
  //     // Toujours désactiver le pendingNotifier à la fin
  //     pendingNotifier.value = false;
  //   }
  // }

  // Future<void> updateContribuable({
  //   required Map<String, dynamic> contribuableData,
  //   required ValueNotifier<String> statusNotifier,
  //   required ValueNotifier<bool> pendingNotifier,
  //   required ValueNotifier<String> messageNotifier, // Nouveau paramètre
  //   required VoidCallback onSuccess,
  // }) async {
  //   try {
  //     // Initialiser les notifiers pour indiquer le début de l'opération
  //     pendingNotifier.value = true;
  //     statusNotifier.value = 'En cours';
  //     messageNotifier.value = 'Mise à jour du contribuable en cours...';

  //     // Ajouter des informations utilisateur si nécessaire
  //     final prefs = await SharedPreferences.getInstance();
  //     final userInfo = prefs.getString('userInfo');
  //     final userId = jsonDecode(userInfo!)['id'];
  //     contribuableData['userId'] = userId;

  //     // Préparer les données pour l'envoi
  //     contribuableData['api/contrib-update'] = ApiService().baseUrl;
  //     final formData = contribuableData.entries
  //         .map((entry) =>
  //             '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
  //         .join('&');

  //     // Tentative de mise à jour en ligne
  //     final response = await http.post(
  //       Uri.parse(baseUrl),
  //       headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  //       body: formData,
  //     );

  //     if (response.statusCode >= 200 && response.statusCode < 300) {
  //       // Mise à jour réussie en ligne
  //       contribuableData['traite'] = 1; // Marquer comme traité
  //       await _saveLocalContribuable(contribuableData, isUpdate: true);

  //       // Mise à jour des notifiers en cas de succès
  //       statusNotifier.value = 'Succès';
  //       messageNotifier.value = 'Contribuable mis à jour avec succès !';
  //       onSuccess();
  //     } else {
  //       // En cas d'échec côté serveur, sauvegarder localement
  //       contribuableData['traite'] = 0;
  //       await _saveLocalContribuable(contribuableData, isUpdate: true);

  //       // Mise à jour des notifiers en cas d'échec
  //       statusNotifier.value = 'Erreur';
  //       messageNotifier.value =
  //           'Échec de la mise à jour en ligne. Données sauvegardées localement.';
  //     }
  //   } catch (e, stackTrace) {
  //     print("Une erreur s'est produite lors de la requête : $e");
  //     print('Stacktrace : $stackTrace');

  //     // En cas d'erreur ou si hors ligne, sauvegarder localement
  //     contribuableData['traite'] = 0;
  //     await _saveLocalContribuable(contribuableData, isUpdate: true);

  //     // Mise à jour des notifiers en cas de problème
  //     statusNotifier.value = 'Hors ligne';
  //     messageNotifier.value =
  //         'Impossible de se connecter. Données sauvegardées localement.';
  //   } finally {
  //     // Toujours désactiver le pendingNotifier à la fin
  //     pendingNotifier.value = false;
  //   }
  // }

  // Future<void> _saveLocalContribuable(Map<String, dynamic> data,
  //     {bool isUpdate = false}) async {
  //   try {
  //     final db = await _dbService.database;
  //     if (isUpdate) {
  //       await db.update(
  //         'contribuables',
  //         data,
  //         where: 'id =?',
  //         whereArgs: [data['id']],
  //       );
  //     } else {
  //       await db.insert('contribuables', data);
  //     }
  //   } on Exception catch (e) {
  //     print('Error saving local data: $e');
  //   }
  // }

  // Future<List<Map<String, dynamic>>> fetchContribuables({
  //   required int page,
  // }) async {
  //   try {
  //     print("Loading Contrib..");

  //     // Récupération des informations utilisateur
  //     final prefs = await SharedPreferences.getInstance();
  //     final userInfo = prefs.getString('userInfo');
  //     final userRole = jsonDecode(userInfo!)['role'];
  //     final userId = jsonDecode(userInfo)['id'];
  //     final String apiKey =
  //         userRole == 'admin' ? 'api/user-contrib-list' : 'api/contribuables';

  //     // Préparer les données à envoyer
  //     final requestBody = {
  //       apiKey: apiKey,
  //       'userId': userId,
  //       'page': page.toString(),
  //     };

  //     print("ok suivant..");

  //     // Encodage du body
  //     final formData = requestBody.entries
  //         .map((entry) =>
  //             '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
  //         .join('&');

  //     print("Requete en cours..");

  //     // Envoi de la requête
  //     final response = await http.post(
  //       Uri.parse(ApiService().baseUrl),
  //       headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  //       body: formData,
  //     );

  //     print("Reponse :");
  //     print(response.body);
  //     print("Response code : " + response.statusCode.toString());

  //     if (response.statusCode == 200) {
  //       final data = jsonDecode(response.body) as List<dynamic>;
  //       print(data);
  //       return data.cast<Map<String, dynamic>>();
  //     } else {
  //       throw Exception('Erreur réseau : Code ${response.statusCode}');
  //     }
  //   } catch (e) {
  //     print(
  //         "Erreur réseau détectée, récupération des contribuables locaux. Erreur : $e");

  //     // Récupération des contribuables locaux depuis la base SQLite
  //     try {
  //       final prefs = await SharedPreferences.getInstance();
  //       final userInfo = prefs.getString('userInfo');
  //       final userId = jsonDecode(userInfo!)['id'];

  //       // Appel de la méthode locale pour récupérer les contribuables
  //       final localContribuables =
  //           await _dbService.getUserContribuables(userId, page: page);

  //       // Conversion en liste de Map<String, dynamic>
  //       return localContribuables
  //           .map((contribuable) => contribuable.toMap())
  //           .toList();
  //     } catch (localError) {
  //       print(
  //           "Erreur lors de la récupération des données locales : $localError");
  //       return []; // Retourne une liste vide en cas d'erreur locale
  //     }
  //   }
  // }

  // Future<void> resetContribuablesPayments() async {
  //   try {
  //     // Préparer les données à envoyer
  //     final Map<String, String> requestBody = {
  //       'api/contribs/renew': 'api/contribs/delete-all'
  //     };

  //     // Encodage du body
  //     final formData = requestBody.entries
  //         .map((entry) =>
  //             '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
  //         .join('&');

  //     // Envoi de la requête
  //     final response = await http.post(
  //       Uri.parse(ApiService().baseUrl),
  //       headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  //       body: formData,
  //     );
  //     print("Reponse du reset :");
  //     print(response.body);
  //   } catch (e) {
  //     print('Error resetting contributions: $e');
  //   }
  // }

  // Future<void> deleteContribuable(
  //   int id, {
  //   required ValueNotifier<String> statusNotifier,
  //   required ValueNotifier<bool> pendingNotifier,
  //   required ValueNotifier<String> messageNotifier,
  //   required VoidCallback onSuccess,
  // }) async {
  //   try {
  //     pendingNotifier.value = true;
  //     statusNotifier.value = 'En cours';
  //     messageNotifier.value = 'Suppression du contribuable en cours...';

  //     // Préparer les données à envoyer
  //     final Map<String, String> requestBody = {
  //       'api/contrib-delete': 'api/contrib-delete',
  //       'id': id.toString(),
  //     };

  //     // Encodage du body
  //     final formData = requestBody.entries
  //         .map((entry) =>
  //             '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
  //         .join('&');

  //     // Envoi de la requête
  //     final response = await http.post(
  //       Uri.parse(ApiService().baseUrl),
  //       headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  //       body: formData,
  //     );

  //     if (response.statusCode == 200) {
  //       statusNotifier.value = 'Succès';
  //       messageNotifier.value = 'Contribuable supprimé avec succès.';
  //       onSuccess();
  //     } else {
  //       statusNotifier.value = 'Erreur';
  //       messageNotifier.value =
  //           'Erreur lors de la suppression du contribuable (${response.statusCode}).';
  //     }
  //   } catch (e) {
  //     statusNotifier.value = 'Hors ligne';
  //     messageNotifier.value =
  //         'Impossible de se connecter. Veuillez réessayer plus tard.';
  //   } finally {
  //     pendingNotifier.value = false;
  //   }
  // }

  // Future<List<Map<String, dynamic>>> getAllContribuables() async {
  //   final db = await _dbService.database;
  //   return await db.query('contribuables');
  // }

  // // Future<void> deleteContribuable(int id) async {
  // //   final db = await _dbService.database;
  // //   await db.delete('contribuables', where: 'id =?', whereArgs: [id]);
  // // }

  // Future<void> markContribuableAsProcessed(int id) async {
  //   final db = await _dbService.database;
  //   await db.update(
  //     'contribuables',
  //     {'traite': 1},
  //     where: 'id =?',
  //     whereArgs: [id],
  //   );
  // }

  // Future deleteAllContribuables() async {
  //   try {
  //     // Préparer les données à envoyer
  //     final data = {'api/contribs/delete-all': 'api/contribs/delete-all'};

  //     // Encodage du body
  //     final formData = data.entries
  //         .map((entry) =>
  //             '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
  //         .join('&');

  //     // Envoi de la requête
  //     final response = await http.post(
  //       Uri.parse(ApiService().baseUrl),
  //       headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  //       body: formData,
  //     );

  //     if (response.statusCode == 200) {
  //       final data = jsonDecode(response.body) as Map<String, dynamic>;
  //       if (data['success']) {
  //         final db = await _dbService.database;
  //         await db.execute('DELETE FROM contributables');
  //       }
  //     }
  //   } catch (e) {
  //     print('Error deleting all contribuables: $e');
  //   }
  // }

  // Future<Map<String, dynamic>> searchContribuables({
  //   required String codeClient,
  //   required String nomPrenom,
  //   required String niu,
  //   required String tel,
  //   required int page,
  //   required String sigle,
  //   required String localisation,
  // }) async {
  //   try {
  //     // Préparer les données pour la requête API
  //     print("Nous y sommes :");
  //     final requestBody = {
  //       'api/search': 'api/search',
  //       'codeClient': codeClient,
  //       'raisonSociale': nomPrenom,
  //       'niu': niu,
  //       'numeroTel': tel,
  //       'sigle': sigle,
  //       'localisation': localisation,
  //       'page': page.toString(),
  //     };

  //     // Encodage du body
  //     final formData = requestBody.entries
  //         .map((entry) =>
  //             '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
  //         .join('&');

  //     // Envoi de la requête
  //     print("Nous voilà encore :");
  //     final response = await http.post(
  //       Uri.parse(baseUrl),
  //       headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  //       body: formData,
  //     );

  //     print("reponse prette..");
  //     print(response.body);
  //     if (response.statusCode == 200) {
  //       final responseData = jsonDecode(response.body);
  //       return responseData;
  //     } else {
  //       throw Exception('Erreur lors de la recherche en ligne');
  //     }
  //   } catch (e) {
  //     // Recherche en local en cas d'échec de la recherche en ligne
  //     print(
  //         'Recherche en ligne échouée, tentative de recherche locale. Erreur : $e');
  //     return _dbService.searchContribuables(
  //       codeClient: codeClient,
  //       raisonSociale: nomPrenom,
  //       niu: niu,
  //       tel: tel,
  //       page: page,
  //       sigle: sigle,
  //       localisation: localisation,
  //     );
  //   }
  // }

  // Future<List<ContribuableModel>> getNonValidatedAndNonTraiteContribuables({
  //   required ValueNotifier<String> statusNotifier,
  //   required ValueNotifier<bool> pendingNotifier,
  //   required ValueNotifier<String> messageNotifier,
  //   int page = 1,
  //   int pageSize = 100,
  // }) async {
  //   try {
  //     // Initialiser les notifiers
  //     pendingNotifier.value = true;
  //     statusNotifier.value = 'En cours';
  //     messageNotifier.value = 'Récupération des contribuables...';

  //     // Préparer les données à envoyer
  //     final Map<String, String> requestBody = {
  //       'api/contribs/validate': 'api/contribs/validate'
  //     };

  //     // Encodage du body
  //     final formData = requestBody.entries
  //         .map((entry) =>
  //             '${entry.key}=${Uri.encodeComponent(entry.value.toString())}')
  //         .join('&');

  //     // Envoi de la requête
  //     final response = await http.post(
  //       Uri.parse(ApiService().baseUrl),
  //       headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  //       body: formData,
  //     );

  //     print("Response de la recuperation des contribuables non validés");
  //     print(response.body);
  //     if (response.statusCode == 200) {
  //       var data;
  //       if (response.body.length > 0) {
  //         data = jsonDecode(response.body);

  //         // Vérification et parsing des données
  //         if (data.size() > 0) {
  //           final List<ContribuableModel> contribuables =
  //               List<ContribuableModel>.from(
  //             data.map((item) => ContribuableModel.fromMap(item)),
  //           );

  //           // Mise à jour des notifiers en cas de succès
  //           statusNotifier.value = 'Succès';
  //           messageNotifier.value = 'Contribuables récupérés avec succès !';
  //           return contribuables;
  //         } else {
  //           print("Contribuables non trouvés");
  //           statusNotifier.value = 'Succès';
  //           messageNotifier.value = 'Contribuables récupérés avec succès !';
  //           return [];
  //         }
  //       } else {
  //         print("Response de la recuperation des contribuables non validés");
  //         print(response.body);
  //         print("Contribuables non trouvés");
  //         statusNotifier.value = 'Succès';
  //         messageNotifier.value = 'Contribuables récupérés avec succès !';
  //         return [];
  //       }
  //     } else {
  //       print("Response de la recuperation des contribuables non validés");
  //       print(response.body);
  //       throw Exception('Erreur lors de la requête : ${response.statusCode}');
  //     }
  //   } catch (e, stackTrace) {
  //     print("Une erreur s'est produite lors de la requête : $e");
  //     print('Stacktrace : $stackTrace');

  //     // Mise à jour des notifiers en cas de problème
  //     statusNotifier.value = 'Erreur';
  //     messageNotifier.value = 'Impossible de récupérer les contribuables : $e';
  //     return [];
  //   } finally {
  //     // Toujours désactiver le pendingNotifier à la fin
  //     pendingNotifier.value = false;
  //   }
  // }