import 'package:flutter_cga_app/models/contribuable_model.dart';
import 'package:flutter_cga_app/models/user_model.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'user_database.db');
    return await openDatabase(
      path,
      version: 2, // Augmenter la version pour appliquer les migrations
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS contribuables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT,
        raison_sociale TEXT,
        sigle TEXT,
        niu TEXT,
        activite_principale TEXT,
        tel TEXT,
        email TEXT,
        coderegime TEXT,
        regime TEXT,
        siglecga TEXT,
        cga TEXT,
        codeunitegestion TEXT,
        unite_gestion TEXT,
        codeClient TEXT,
        paiement INTEGER NOT NULL DEFAULT 0,
        statut TEXT NOT NULL DEFAULT 'ancien',
        localisation TEXT,
        distributeur TEXT,
        ancienCga TEXT,
        userId INTEGER,
        validate INTEGER DEFAULT 0,
        traite INTEGER DEFAULT 0,
        upToDate INTEGER DEFAULT 0,
        status TEXT, -- Nouveau champ pour le statut (added, updated, deleted)
        creation_date TEXT DEFAULT CURRENT_TIMESTAMP,
        update_date TEXT DEFAULT CURRENT_TIMESTAMP
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        fullname TEXT NOT NULL,
        password TEXT NOT NULL,
        description TEXT,
        email TEXT UNIQUE,
        numTel INTEGER UNIQUE,
        creationDate TEXT,
        updateDate TEXT,
        role TEXT,
        status TEXT -- Nouveau champ pour le statut (added, updated, deleted)
      )
    ''');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      // Ajout de la colonne `status` si elle n'existe pas encore
      await db.execute("ALTER TABLE contribuables ADD COLUMN status TEXT");
      await db.execute("ALTER TABLE users ADD COLUMN status TEXT");
    }
  }

  // CRUD Operations for Users
  Future<int> insertUser(UserModel user) async {
    final db = await database;
    return await db.insert(
      'users',
      user.toMap()..['status'] = 'added', // Marquer comme ajouté
    );
  }

  Future<List<UserModel>> getUsers() async {
    final db = await database;
    final List<Map<String, dynamic>> maps =
        await db.query('users', where: 'status <>  \'deleted\' or status is null');
    return List.generate(maps.length, (i) => UserModel.fromMap(maps[i]));
  }

  Future<List<UserModel>> getAddedUsers() async {
    final db = await database;
    final List<Map<String, dynamic>> maps =
        await db.query('users', where: 'status = ?', whereArgs: ['added']);
    return maps.map((e) => UserModel.fromMap(e)).toList();
  }

  Future<List<UserModel>> getUpdatedUsers() async {
    final db = await database;
    final List<Map<String, dynamic>> maps =
        await db.query('users', where: 'status = ?', whereArgs: ['updated']);
    return maps.map((e) => UserModel.fromMap(e)).toList();
  }

  Future<List<int>> getDeletedUserIds() async {
    final db = await database;
    final List<Map<String, dynamic>> maps =
        await db.query('users', where: 'status = ?', whereArgs: ['deleted']);
    return maps.map((e) => e['id'] as int).toList();
  }

  Future<int> updateUser(UserModel user) async {
    final db = await database;
    return await db.update(
      'users',
      user.toMap()..['status'] = 'updated', // Marquer comme mis à jour
      where: 'id = ?',
      whereArgs: [user.id],
    );
  }

  Future<int> deleteUser(int id) async {
    final db = await database;
    // Marquer comme supprimé au lieu de supprimer immédiatement
    return await db.update(
      'users',
      {'status': 'deleted'},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<void> markAsSynced(int userId) async {
    final db = await database;
    await db.update(
      'users',
      {'status': null}, // Retirer le marquage
      where: 'id = ?',
      whereArgs: [userId],
    );
  }

  Future<void> deleteAllUsers() async {
    final db = await database;
    await db.execute('DELETE FROM users');
  }

  // CRUD Operations for Contribuables
  Future<int> insertContribuable(ContribuableModel contribuable) async {
    final db = await database;
    return await db.insert(
      'contribuables',
      contribuable.toMap()..['status'] = 'added', // Marquer comme ajouté
    );
  }

  Future<int> insertContribuablAfterSync(ContribuableModel contribuable) async {
    final db = await database;
    return await db.insert(
      'contribuables',
      contribuable.toMap()..['status'] = null, // Marquer comme ajouté
    );
  }

  Future<List<ContribuableModel>> getContribuables(
      {int page = 1, int pageSize = 100}) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'contribuables',
      limit: pageSize,
      offset: (page - 1) * pageSize,
    );
    return List.generate(
        maps.length, (i) => ContribuableModel.fromMap(maps[i]));
  }

  Future<int> updateContribuable(ContribuableModel contribuable) async {
    final db = await database;
    return await db.update(
      'contribuables',
      contribuable.toMap()..['status'] = 'updated',
      where: 'id = ?',
      whereArgs: [contribuable.id],
    );
  }

  Future<int> deleteContribuable(int id) async {
    final db = await database;
    return await db.update(
      'contribuables',
      {'status': 'deleted'},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Supprimer tous les contribuables
  Future<int> deleteAllContribuables() async {
    final db = await database;
    return await db.update('contribuables', {'status': 'deleted'});
  }

  // Supprimer tous les contribuables apres sync
  Future<void> deleteAllContribuablesafterSync() async {
    final db = await database;
    return await db.execute('delete from contribuables where 1');
  }

  // Valider un contribuable
  Future<int> validateContribuable(int id) async {
    final db = await database;
    return await db.update(
      'contribuables',
      {'validate': 1, 'traite': 1, 'status': 'validated'},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Désavouer un contribuable
  Future<int> unvalidateContribuable(int id) async {
    final db = await database;
    return await db.update(
      'contribuables',
      {'validate': 1, 'traite': 1, 'status': 'unvalidated'},
      where: 'id = ? AND status <>  \'deleted\'',
      whereArgs: [id],
    );
  }

  // Liste des contribuables pour un utilisateur spécifique
  Future<List<ContribuableModel>> getUserContribuables(int userId,
      {int page = 1, int pageSize = 100}) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'contribuables',
      where: 'userId = ?  AND status <>  \'deleted\' or status is null',
      whereArgs: [userId],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    );
    print(maps);
    return List.generate(
        maps.length, (i) => ContribuableModel.fromMap(maps[i]));
  }

  // Recherche des contribuables avec pagination
  Future<Map<String, dynamic>> searchContribuables({
    String? numero,
    String? raisonSociale,
    String? sigle,
    String? niu,
    String? activitePrincipale,
    String? tel,
    String? email,
    String? coderegime,
    String? regime,
    String? siglecga,
    String? cga,
    String? codeunitegestion,
    String? uniteGestion,
    String? codeClient,
    String? localisation,
    int? validate,
    int page = 1,
    int pageSize = 20,
  }) async {
    final db = await database;
    final queryArgs = <String, dynamic>{};
    String whereClause = '1 = 1'; // Par défaut, tout récupérer

    if (numero != null && numero.isNotEmpty) {
      whereClause += ' AND numero LIKE :numero';
      queryArgs['numero'] = '%$numero%';
    }
    if (raisonSociale != null && raisonSociale.isNotEmpty) {
      whereClause += ' AND raison_sociale LIKE :raisonSociale';
      queryArgs['raisonSociale'] = '%$raisonSociale%';
    }
    if (sigle != null && sigle != "") {
      whereClause += ' AND sigle LIKE :sigle';
      queryArgs['sigle'] = '%$sigle%';
    }
    if (niu != null && niu.isNotEmpty && niu != "") {
      whereClause += ' AND niu LIKE :niu';
      queryArgs['niu'] = '%$niu%';
    }
    if (activitePrincipale != null && activitePrincipale.isNotEmpty) {
      whereClause += ' AND activite_principale LIKE :activitePrincipale';
      queryArgs['activitePrincipale'] = '%$activitePrincipale%';
    }
    if (tel != null && tel.isNotEmpty && tel != "") {
      whereClause += ' AND tel LIKE :tel';
      queryArgs['tel'] = '%$tel%';
    }
    if (email != null && email.isNotEmpty) {
      whereClause += ' AND email LIKE :email';
      queryArgs['email'] = '%$email%';
    }
    if (coderegime != null && coderegime.isNotEmpty) {
      whereClause += ' AND coderegime LIKE :coderegime';
      queryArgs['coderegime'] = '%$coderegime%';
    }
    if (regime != null &&  regime.isNotEmpty) {
      whereClause += ' AND regime LIKE :regime';
      queryArgs['regime'] = '%$regime%';
    }
    if (siglecga != null && siglecga.isNotEmpty && siglecga != "") {
      whereClause += ' AND siglecga LIKE :siglecga';
      queryArgs['siglecga'] = '%$siglecga%';
    }
    if (cga != null) {
      whereClause += ' AND cga LIKE :cga';
      queryArgs['cga'] = '%$cga%';
    }
    if (codeunitegestion != null && codeunitegestion.isNotEmpty && codeunitegestion != "") {
      whereClause += ' AND codeunitegestion LIKE :codeunitegestion';
      queryArgs['codeunitegestion'] = '%$codeunitegestion%';
    }
    if (uniteGestion != null && uniteGestion.isNotEmpty && uniteGestion != "") {
      whereClause += ' AND unite_gestion LIKE :uniteGestion';
      queryArgs['uniteGestion'] = '%$uniteGestion%';
    }
    if (codeClient != null && codeClient != "") {
      whereClause += ' AND codeClient LIKE :codeClient';
      queryArgs['codeClient'] = '%$codeClient%';
    }
    if (localisation != null && localisation != "") {
      whereClause += ' AND localisation LIKE :localisation';
      queryArgs['localisation'] = '%$localisation%';
    }
    if (validate != null  ){
      whereClause += ' AND validate = :validate';
      queryArgs['validate'] = validate;
    }

    // 1. Récupérer les résultats paginés
    final List<Map<String, dynamic>> maps = await db.rawQuery(
      'SELECT * FROM contribuables WHERE $whereClause AND (status <>  \'deleted\' or status is null) LIMIT ? OFFSET ?',
      [...queryArgs.values, pageSize, (page - 1) * pageSize],
    );
    final query = 'SELECT COUNT(*) as count FROM contribuables WHERE $whereClause AND (status <>  \'deleted\' or status is null)';
    // print("query: " + query);
    // 2. Compter le nombre total de résultats
    final countResult = await db.rawQuery(
      query,
      queryArgs.values.toList(),
    );
    final totalCount = countResult.first['count'] as int;

    return {
      'data': maps,
      'pagination': {
        'currentPage': page,
        'totalPage': (totalCount / pageSize).ceil(),
        'totalResult': totalCount,
      },
    };
  }

  // recuperer les contribuables non validés et non traités
  Future<List<ContribuableModel>> getNonValidatedAndNonTraiteContribuables(
      {int page = 1, int pageSize = 100}) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'contribuables',
      where: 'validate = 0 AND traite = 0 AND (status <>  \'deleted\' or status is null)',
      limit: pageSize,
      offset: (page - 1) * pageSize,
    );
    return List.generate(
        maps.length, (i) => ContribuableModel.fromMap(maps[i]));
  }

// Récupérer les contribuables ajoutés localement (status = 'added')
  Future<List<ContribuableModel>> getAddedContribuables() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'contribuables',
      where: "status = ?",
      whereArgs: ['added'],
    );
    return List.generate(
        maps.length, (i) => ContribuableModel.fromMap(maps[i]));
  }

// Récupérer les contribuables modifiés localement (status = 'updated')
  Future<List<ContribuableModel>> getUpdatedContribuables() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'contribuables',
      where: "status = ?",
      whereArgs: ['updated'],
    );
    return List.generate(
        maps.length, (i) => ContribuableModel.fromMap(maps[i]));
  }

// Récupérer les contribuables supprimés localement (status = 'deleted')
  Future<List<int>> getDeletedContribuables() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'contribuables',
      columns: ['id'],
      where: "status = ?",
      whereArgs: ['deleted'],
    );
    return maps.map((map) => map['id'] as int).toList();
  }

// Récupérer les contribuables validés localement (validate = 1 AND status = 'validated')
  Future<List<int>> getValidatedContribuables() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'contribuables',
      columns: ['id'],
      where: "validate = ? AND status = ?",
      whereArgs: [1, 'validated'],
    );
    return maps.map((map) => map['id'] as int).toList();
  }

// Récupérer les contribuables désavoués localement (validate = 0 AND status = 'unvalidated')
  Future<List<int>> getUnvalidatedContribuables() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'contribuables',
      columns: ['id'],
      where: "validate = ? AND status = ?",
      whereArgs: [0, 'unvalidated'],
    );
    return maps.map((map) => map['id'] as int).toList();
  }

  Future<void> resetContribuableStatus(
      List<ContribuableModel> contribuables, String status) async {
    final db = await database;
    for (var contribuable in contribuables) {
      await db.update(
        'contribuables',
        {'status': null}, // Réinitialiser le statut
        where: 'id = ? AND status = ?',
        whereArgs: [contribuable.id, status],
      );
    }
  }

  Future<void> deleteSyncedContribuables(List<int> contribuableIds) async {
    final db = await database;
    for (var id in contribuableIds) {
      await db.delete(
        'contribuables',
        where: 'id = ? AND status = ?',
        whereArgs: [id, 'deleted'],
      );
    }
  }

  Future<void> resetValidationStatus(
      List<int> contribuableIds, int validateStatus) async {
    final db = await database;
    for (var id in contribuableIds) {
      await db.update(
        'contribuables',
        {'status': null, 'validate': validateStatus},
        where: 'id = ?',
        whereArgs: [id],
      );
    }
  }
}
