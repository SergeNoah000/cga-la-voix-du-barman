import 'package:flutter/material.dart';
import 'package:flutter_cga_app/models/contribuable_model.dart';
import 'package:flutter_cga_app/services/api_service_contribuables.dart';
import 'package:flutter_cga_app/services/database_service.dart';

class NonValidatedContribuablesTable extends StatefulWidget {
  const NonValidatedContribuablesTable({super.key});

  @override
  _NonValidatedContribuablesTableState createState() =>
      _NonValidatedContribuablesTableState();
}

class _NonValidatedContribuablesTableState
    extends State<NonValidatedContribuablesTable> {
  List<ContribuableModel> _nonValidatedAndNonTraiteContribuables = [];
  List<int> _selectedIds = [];
  bool _isLoading = true;
  ValueNotifier<bool> pendingNotifier = ValueNotifier(false);
  ValueNotifier<String> messageNotifier = ValueNotifier('');
  ValueNotifier<String> statusNotifier = ValueNotifier('');

  @override
  void initState() {
    super.initState();

    _fetchNonValidatedAndNonTraiteContribuables();
  }

  Future<void> _fetchNonValidatedAndNonTraiteContribuables() async {
    try {
      List<ContribuableModel> contribuables =
          await ServiceContribuables().getNonValidatedAndNonTraiteContribuables(
            statusNotifier: statusNotifier, 
            pendingNotifier: pendingNotifier, 
            messageNotifier: messageNotifier
            );
      setState(() {
        _nonValidatedAndNonTraiteContribuables = contribuables;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      print(
          'Erreur lors de la récupération des contribuables non validés et non traités : $e');
    }
  }

  void _toggleSelection(int id) {
    setState(() {
      if (_selectedIds.contains(id)) {
        _selectedIds.remove(id); // Supprime l'ID de la liste s'il est déjà présent
      } else {
        _selectedIds.add(id); // Ajoute l'ID à la liste s'il n'est pas présent
      }
    });
  }


  void _selectAll() {
    setState(() {
      if (_selectedIds.length == _nonValidatedAndNonTraiteContribuables.length) {
        _selectedIds.clear(); // Désélectionne tout si tout est déjà sélectionné
      } else {
        _selectedIds =
            _nonValidatedAndNonTraiteContribuables.map((c) => c.id ?? 0).toList();
      }
    });
  }

  void _deselectAll() {
    setState(() {
      _selectedIds.clear();
    });
  }

  void _bulkValidate() {
    // Implémentez la validation des contribuables sélectionnés
    for (var id in _selectedIds) {
      _validateContribuable(id);
    }
    _selectedIds.clear(); // Réinitialiser la sélection après validation
  }

  void _bulkDelete() {
    // Implémentez la suppression des contribuables sélectionnés
    for (var id in _selectedIds) {
      _deleteContribuable(id);
    }
    _selectedIds.clear(); // Réinitialiser la sélection après suppression
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_nonValidatedAndNonTraiteContribuables.isEmpty) {
      return const Center(
          child: Text('Aucun contribuable non validé et non traité trouvé.'));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Contribuables Non Validés'),
        actions: [
          IconButton(
            icon: const Icon(Icons.select_all),
            onPressed: _selectAll,
            tooltip: 'Tout sélectionner',
          ),
          if (_selectedIds.isNotEmpty) ...[
            IconButton(
              icon: const Icon(Icons.check),
              onPressed: _bulkValidate,
              tooltip: 'Valider sélection',
            ),
            IconButton(
              icon: const Icon(Icons.delete),
              onPressed: _bulkDelete,
              tooltip: 'Supprimer sélection',
            ),
          ],
        ],
      ),
      body: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: SingleChildScrollView(
          child: DataTable(
            columns: const [
              DataColumn(label: Text('ID')),
              DataColumn(label: Text('Raison sociale')),
              DataColumn(label: Text('Ancien CGA')),
              DataColumn(label: Text('Montant')),
              DataColumn(label: Text('Utilisateur ajouté')),
              DataColumn(label: Text('Action')),
            ],
            rows: _nonValidatedAndNonTraiteContribuables.map((contribuable) {
              final isSelected = _selectedIds.contains(contribuable.id);
              return DataRow(
                selected: _selectedIds.contains(contribuable.id), 
                onSelectChanged: (bool? selected) {
                  if (selected != null) {
                    _toggleSelection(contribuable.id ?? 0);
                  }
                },
                cells: [
                  DataCell(Text(contribuable.id.toString())),
                  DataCell(Text(contribuable.raisonSociale ?? "Non défini")),
                  DataCell(Text(contribuable.ancienCga ?? "Non défini")),
                  DataCell(Text(contribuable.paiement.toString())),
                  DataCell(Text(contribuable.userId.toString())),
                  DataCell(
                    PopupMenuButton<String>(
                      onSelected: (value) {
                        if (value == 'Voir les détails') {
                          _showDetails(context, contribuable);
                        } else if (value == 'Valider') {
                          _validateContribuable(contribuable.id ?? 0);
                        } else if (value == 'Supprimer') {
                          _showDeleteConfirmation(
                              context, contribuable.id ?? 0);
                        }
                      },
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                            value: 'Voir les détails',
                            child: Text('Voir les détails')),
                        const PopupMenuItem(
                            value: 'Valider', child: Text('Valider')),
                        const PopupMenuItem(
                            value: 'Supprimer', child: Text('Supprimer')),
                      ],
                    ),
                  ),
                ],
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  void _showDetails(BuildContext context, ContribuableModel contribuable) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Détails du contribuable'),
          content: SingleChildScrollView(
            child: Column(
              children: [
                Text('ID: ${contribuable.id}'),
                Text('Raison sociale: ${contribuable.raisonSociale}'),
                Text('Ancien CGA: ${contribuable.ancienCga}'),
                Text('Montant: ${contribuable.paiement}'),
                Text('Utilisateur ajouté: ${contribuable.userId}'),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Fermer'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _validateContribuable(int id) async {
    final service = DatabaseService();
    try {
      await service.validateContribuable(id);
      _fetchNonValidatedAndNonTraiteContribuables(); // Rafraîchit la liste après validation
    } catch (e) {
      print('Erreur lors de la validation du contribuable : $e');
    }
  }

  void _showDeleteConfirmation(BuildContext context, int id) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Confirmation'),
          content:
              const Text('Voulez-vous vraiment supprimer ce contribuable ?'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Annuler'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _deleteContribuable(id);
              },
              child: const Text('Supprimer'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _deleteContribuable(int id) async {
    final service = ServiceContribuables();
    try {
      await service.deleteContribuable(id,  
        statusNotifier: statusNotifier, 
        pendingNotifier: pendingNotifier,
        messageNotifier: messageNotifier, 
       onSuccess: () {  }, 
      );
      _fetchNonValidatedAndNonTraiteContribuables(); // Rafraîchit la liste après suppression
    } catch (e) {
      print('Erreur lors de la suppression du contribuable : $e');
    }
  }
}
