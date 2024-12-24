import 'package:flutter/material.dart';
import 'package:flutter_cga_app/models/contribuable_model.dart';
import 'package:flutter_cga_app/services/api_service_contribuables.dart';

class ContribuablesTable extends StatefulWidget {
  @override
  _ContribuablesTableState createState() => _ContribuablesTableState();
}

class _ContribuablesTableState extends State<ContribuablesTable> {
  List<ContribuableModel> _contribuables = [];
  bool _isLoading = true;
  late ScrollController _headerScrollController;
  late ScrollController _bodyScrollController;
  late ScrollController _verticalScrollController;
  int _currentPage = 1; // Page actuelle
  bool _isFetchingMore = false; // Indicateur de chargement
  bool _hasMoreData = true; // Indicateur s'il reste des données à charger

  @override
  void initState() {
    super.initState();
    _headerScrollController = ScrollController();
    _bodyScrollController = ScrollController();
    _verticalScrollController = ScrollController();

    _bodyScrollController.addListener(() {
      _headerScrollController.jumpTo(_bodyScrollController.offset);
    });



    // Charger plus de données si le scroll vertical atteint la fin
    _verticalScrollController.addListener(() {
      // Vérifier uniquement si le scroll vertical atteint la fin
      if (_verticalScrollController.position.extentAfter <= 100 &&
          !_isFetchingMore) {
        _fetchContribuables(append: true);
      }
    });


    _fetchContribuables();
  }

  @override
  void dispose() {
    _headerScrollController.dispose();
    _bodyScrollController.dispose();
    super.dispose();
  }

 Future<void> _fetchContribuables({bool append = false}) async {
  if (_isFetchingMore || !_hasMoreData) return;

  setState(() {
    _isFetchingMore = true;
  });

  final service = ServiceContribuables();
  try {
    List<Map<String, dynamic>> list =
        await service.fetchContribuables(page: _currentPage);

    if (list.isEmpty) {
      // Si la page est vide, on considère qu'il n'y a plus de données
      _hasMoreData = false;
       setState(() {        
        _isLoading = false;
      });
    } else {
      List<ContribuableModel> newContribuables = list
          .map((item) => ContribuableModel.fromMap(item))
          .toList();

      setState(() {
        if (append) {
          _contribuables.addAll(newContribuables); // Ajout des données
        } else {
          _contribuables = newContribuables; // Remplacement
        }
        _isLoading = false;
        _currentPage++;
      });
    }
  } catch (e) {
    print('Erreur lors de la récupération des contribuables : $e');
  } finally {
    setState(() {
      _isFetchingMore = false;
    });
  }
}

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_contribuables.isEmpty) {
      return const Center(child: Text('Aucun contribuable trouvé.'));
    }


if (_isLoading ) {
  return const Center(child: CircularProgressIndicator());
}

    return Container(
    color: Colors.white, 
    child: Column(
        children: [
          SingleChildScrollView(
            controller: _headerScrollController,
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columns: const [
                DataColumn(label: Text('ID')),
                DataColumn(label: Text('Code Client')),
                DataColumn(label: Text('Noms et Prénoms')),
                DataColumn(label: Text('NIU')),
                DataColumn(label: Text('Statut')),
                DataColumn(label: Text('Montant payé')),
                DataColumn(label: Text('Reste à payer')),
                DataColumn(label: Text('Numéro Tel')),
                DataColumn(label: Text('CDI')),
                DataColumn(label: Text('Localisation')),
                DataColumn(label: Text('Distributeur')),
                DataColumn(label: Text('CGA Actuel')),
                DataColumn(label: Text('Ancien CGA')),
                DataColumn(label: Text('Action')),
              ],
              rows: [], // En-tête uniquement, donc aucune ligne de données ici
            ),
          ),
          Expanded(

          child: SingleChildScrollView(
            controller: _verticalScrollController,
                child: SingleChildScrollView(
                  controller: _bodyScrollController,
                  scrollDirection: Axis.horizontal,
                  child: SingleChildScrollView(
                    child: DataTable(
                      columns: const [
                        DataColumn(label: Text('ID')),
                        DataColumn(label: Text('Code Client')),
                        DataColumn(label: Text('Noms et Prénoms')),
                        DataColumn(label: Text('NIU')),
                        DataColumn(label: Text('Statut')),
                        DataColumn(label: Text('Montant payé')),
                        DataColumn(label: Text('Reste à payer')),
                        DataColumn(label: Text('Numéro Tel')),
                        DataColumn(label: Text('Unité de Gestion')),
                        DataColumn(label: Text('Localisation')),
                        DataColumn(label: Text('Distributeur')),
                        DataColumn(label: Text('CGA Actuel')),
                        DataColumn(label: Text('Ancien CGA')),
                        DataColumn(label: Text('Action')),
                      ],
                      rows: _contribuables.map((contribuable) {
                        String rowClass = getRowClass(contribuable);
                        Color backgroundColor = getBackgroundColor(rowClass);

                        return DataRow(
                          cells: [
                            DataCell(Container(
                                color: backgroundColor,
                                child: Text(contribuable.id.toString()))),
                            DataCell(Container(
                                color: backgroundColor,
                                child: Text(contribuable.codeClient ?? ''))),
                            DataCell(Container(
                                color: backgroundColor,
                                child: Text(contribuable.raisonSociale ?? ''))),
                            DataCell(Container(
                                color: backgroundColor,
                                child: Text(contribuable.niu ?? ''))),
                            DataCell(Container(
                                color: backgroundColor,
                                child: Text(contribuable.statut))),
                            DataCell(Container(
                                color: backgroundColor,
                                child: Text(contribuable.paiement.toString()))),
                            DataCell(Container(
                                color: backgroundColor,
                                child: Text(((contribuable.statut == "ancien"
                                            ? 50000
                                            : 75000) -
                                        contribuable.paiement)
                                    .toString()))),
                            DataCell(Container(
                                color: backgroundColor,
                                child: Text(contribuable.tel ?? ''))),
                            DataCell(Container(
                                color: backgroundColor,
                                child: Text(contribuable.codeUniteGestion ?? ''))),
                            DataCell(Container(
                                color: backgroundColor,
                                child: Text(contribuable.localisation ?? ''))),
                            DataCell(Container(
                                color: backgroundColor,
                                child: Text(contribuable.distributeur ?? ''))),
                            DataCell(Container(
                                color: contribuable.statut == "ancien" &&
                                        contribuable.ancienCga == "LA VOIX DU BARMAN"
                                    ? Colors.grey.shade300
                                    : Colors.blue.shade200,
                                child: Text(contribuable.cga ?? ''))),
                            DataCell(Container(
                                color: contribuable.statut == "ancien" &&
                                        contribuable.ancienCga == "LA VOIX DU BARMAN"
                                    ? Colors.grey.shade300
                                    : Colors.blue.shade200,
                                child: Text(contribuable.ancienCga ?? ''))),
                            DataCell(PopupMenuButton<String>(
                              onSelected: (value) {
                                if (value == 'Editer') {
                                  Navigator.pushNamed(
                                    context,
                                    '/contribForm',
                                    arguments: contribuable,
                                  ).then((_) => _fetchContribuables());
                                } else if (value == 'Supprimer') {
                                  _showDeleteConfirmation(context, contribuable.id);
                                }
                              },
                              itemBuilder: (context) => [
                                const PopupMenuItem(
                                  value: 'Editer',
                                  child: Text('Editer'),
                                ),
                                const PopupMenuItem(
                                  value: 'Supprimer',
                                  child: Text('Supprimer'),
                                ),
                              ],
                              child: const Icon(Icons.more_vert),
                            )),
                          ],
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ),
          ),
          if (_isFetchingMore)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: CircularProgressIndicator(),
            ),
        ],
      )
    );
  }

  String getRowClass(ContribuableModel contribuable) {
    if (contribuable.statut == "ancien") {
      if (contribuable.paiement == 50000) return 'blanc';
      if (contribuable.paiement == 0) return 'table-danger';
      if (50000 - contribuable.paiement > 0) return 'table-warning';
      return 'table-success';
    } else if (contribuable.statut == "nouveau") {
      if (contribuable.paiement == 0) return 'table-danger';
      if (75000 - contribuable.paiement > 0) return 'table-warning';
      if (contribuable.paiement == 75000) return '';
      return 'blanc';
    }
    return 'blanc';
  }

  Color getBackgroundColor(String rowClass) {
    switch (rowClass) {
      case 'table-danger':
        return const Color(0xffe53043);
      case 'table-warning':
        return const Color(0xfff9ea23);
      case 'blanc':
        return const Color(0xfff3fbfb);
      default:
        return const Color(0xffdee2e6);
    }
  }

  void _showDeleteConfirmation(BuildContext context, int? contribuableId) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Confirmation'),
          content:
              const Text('Voulez-vous vraiment supprimer ce contribuable?'),
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
                _deleteContribuable(contribuableId!);
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
      // await service.deleteContribuable(id);
      _fetchContribuables(); // Refresh the list after deletion
    } catch (e) {
      print('Erreur lors de la suppression du contribuable : $e');
    }
  }
}
