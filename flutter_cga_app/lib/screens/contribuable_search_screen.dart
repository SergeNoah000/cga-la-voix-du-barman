import 'package:flutter/material.dart';
import 'package:flutter_cga_app/models/contribuable_model.dart';
import 'package:flutter_cga_app/screens/contribuable_form_screen.dart';
import 'package:flutter_cga_app/services/api_service_contribuables.dart';

class ContribuablesSearchPage extends StatefulWidget {
  const ContribuablesSearchPage({super.key});

  @override
  _ContribuablesSearchPageState createState() =>
      _ContribuablesSearchPageState();
}

class _ContribuablesSearchPageState extends State<ContribuablesSearchPage> {
  final List<ContribuableModel> _searchResults = [];
  bool _isLoading = false;
  bool _isFetchingMore = false;
  bool _showFilters = true;
  int _currentPage = 1;
  int _totalPages = 1;

  final TextEditingController _codeClientController = TextEditingController();
  final TextEditingController _nomPrenomController = TextEditingController();
  final TextEditingController _niuController = TextEditingController();
  final TextEditingController _telController = TextEditingController();
  final TextEditingController _sigleController = TextEditingController();
  final TextEditingController _localisationController = TextEditingController();

  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _searchContribuables({bool isLoadMore = false}) async {
    if (isLoadMore && (_isFetchingMore || _currentPage >= _totalPages)) {
      return;
    }

    setState(() {
      if (!isLoadMore) {
        _isLoading = true;
        _searchResults.clear();
        _currentPage = 1;
      } else {
        _isFetchingMore = true;
      }
    });

    final service = ServiceContribuables();
    try {
      final results = await service.searchContribuables(
        codeClient: _codeClientController.text,
        nomPrenom: _nomPrenomController.text,
        niu: _niuController.text,
        tel: _telController.text,
        sigle: _sigleController.text,
        localisation: _localisationController.text,
        page: _currentPage,
      );

      setState(() {
        _searchResults.addAll(results['data']
            .map<ContribuableModel>((item) => ContribuableModel.fromMap(item))
            .toList());
        _totalPages = results['pagination']['totalPages'];
        if (!isLoadMore) _currentPage = 1;
      });
    } catch (e) {
      print('Erreur lors de la recherche : $e');
    } finally {
      setState(() {
        _isLoading = false;
        _isFetchingMore = false;
      });
    }
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent - 200 &&
        !_isFetchingMore &&
        _currentPage < _totalPages) {
      setState(() {
        _currentPage++;
      });
      _searchContribuables(isLoadMore: true);
    }
  }

  void _deleteContribuable(int id) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Confirmation'),
          content:
              const Text('Êtes-vous sûr de vouloir supprimer ce contribuable ?'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(context).pop();
                try {
                  final service = ServiceContribuables();
                  // await service.deleteContribuable(id);
                  _searchContribuables();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Contribuable supprimé avec succès.'),
                    ),
                  );
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Erreur lors de la suppression : $e'),
                    ),
                  );
                }
              },
              child: const Text('Confirmer'),
            ),
          ],
        );
      },
    );
  }

  void _editContribuable(ContribuableModel contribuable) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ContribuableFormScreen(contribuable: contribuable),
      ),
    ).then((value) {
      if (value == true) {
        _searchContribuables();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recherche de Contribuables'),
        actions: [
          if (_searchResults.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () {
                setState(() {
                  _showFilters = !_showFilters;
                });
              },
            ),
        ],
      ),
      body: Column(
        children: [
          if (_showFilters)
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                children: [
                  TextField(
                    controller: _codeClientController,
                    decoration: const InputDecoration(
                      labelText: 'Code Client',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _nomPrenomController,
                    decoration: const InputDecoration(
                      labelText: 'Noms et Prénoms',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _niuController,
                    decoration: const InputDecoration(
                      labelText: 'NIU',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _telController,
                    decoration: const InputDecoration(
                      labelText: 'Numéro Tel',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _sigleController,
                    decoration: const InputDecoration(
                      labelText: 'Sigle',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _localisationController,
                    decoration: const InputDecoration(
                      labelText: 'Localisation',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton(
                    onPressed: () => _searchContribuables(),
                    child: const Text('Rechercher'),
                  ),
                ],
              ),
            ),
          if (_isLoading)
            const Expanded(
              child: Center(
                child: CircularProgressIndicator(),
              ),
            ),
          if (!_isLoading && _searchResults.isNotEmpty)
            Expanded(
              child: SingleChildScrollView(
                controller: _scrollController,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('ID')),
                      DataColumn(label: Text('Code Client')),
                      DataColumn(label: Text('Noms et Prénoms')),
                      DataColumn(label: Text('NIU')),
                      DataColumn(label: Text('Tel')),
                      DataColumn(label: Text('Sigle')),
                      DataColumn(label: Text('Localisation')),
                      DataColumn(label: Text('Statut')),
                      DataColumn(label: Text('Actions')),
                    ],
                    rows: _searchResults.map((contribuable) {
                      return DataRow(
                        cells: [
                          DataCell(Text(contribuable.id.toString())),
                          DataCell(Text(contribuable.codeClient ?? '')),
                          DataCell(Text(contribuable.raisonSociale ?? '')),
                          DataCell(Text(contribuable.niu ?? '')),
                          DataCell(Text(contribuable.tel ?? '')),
                          DataCell(Text(contribuable.sigle ?? '')),
                          DataCell(Text(contribuable.localisation ?? '')),
                          DataCell(Text(contribuable.statut)),
                          DataCell(Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit, color: Colors.blue),
                                onPressed: () =>
                                    _editContribuable(contribuable),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete, color: Colors.red),
                                onPressed: () =>
                                    _deleteContribuable(contribuable.id as int),
                              ),
                            ],
                          )),
                        ],
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
          if (!_isLoading && _searchResults.isEmpty)
            const Expanded(
              child: Center(
                child: Text('Aucun résultat trouvé.'),
              ),
            ),
          if (_isFetchingMore)
            const Padding
(
              padding: EdgeInsets.all(8.0),
              child: Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }
}
