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
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE  TABLE IF NOT EXISTS contribuables (
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
        creation_date TEXT DEFAULT CURRENT_TIMESTAMP,
        update_date TEXT DEFAULT CURRENT_TIMESTAMP
      )
    '''); 
    await db.execute('''
      CREATE  TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        fullname TEXT NOT NULL,
        password TEXT NOT NULL,
        description TEXT,
        email TEXT UNIQUE,
        numTel INTEGER UNIQUE,
        creationDate TEXT,
        updateDate TEXT,
        role TEXT
      )
    ''');
  }

  // CRUD Operations
  Future<int> insertUser(UserModel user) async {
    final db = await database;
    return await db.insert('users', user.toMap());
  }

  Future<List<UserModel>> getUsers() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('users');
    return List.generate(maps.length, (i) => UserModel.fromMap(maps[i]));
  }

  Future<int> updateUser(UserModel user) async {
    final db = await database;
    return await db.update(
      'users',
      user.toMap(),
      where: 'id = ?',
      whereArgs: [user.id],
    );
  }

  Future<int> deleteUser(int id) async {
    final db = await database;
    return await db.delete(
      'users',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<void> deleteAllUsers() async {
    final db = await database;
    await db.execute('DELETE FROM users');
  }

  // CRUD Operations
  Future<int> insertContribuable(ContribuableModel contribuable) async {
    final db = await database;
    await db.execute('''
      CREATE  TABLE IF NOT EXISTS contribuables  (
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
        creation_date TEXT DEFAULT CURRENT_TIMESTAMP,
        update_date TEXT DEFAULT CURRENT_TIMESTAMP
      )
    '''); 
    return await db.insert('contribuables', contribuable.toMap());
  }

  Future<List<ContribuableModel>> getContribuables({int page = 1, int pageSize = 100}) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'contribuables',
      limit: pageSize,
      offset: (page - 1) * pageSize,
    );
    return List.generate(maps.length, (i) => ContribuableModel.fromMap(maps[i]));
  }

  Future<int> updateContribuable(ContribuableModel contribuable) async {
    final db = await database;
    return await db.update(
      'contribuables',
      contribuable.toMap(),
      where: 'id = ?',
      whereArgs: [contribuable.id],
    );
  }

  Future<int> deleteContribuable(int id) async {
    final db = await database;
    return await db.delete(
      'contribuables',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Supprimer tous les contribuables
  Future<int> deleteAllContribuables() async {
    final db = await database;
    return await db.delete('contribuables');
  }

  // Valider un contribuable
  Future<int> validateContribuable(int id) async {
    final db = await database;
    return await db.update(
      'contribuables',
      {'validate': 1,
      'traite': 1},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Désavouer un contribuable
  Future<int> unvalidateContribuable(int id) async {
    final db = await database;
    return await db.update(
      'contribuables',
      {'validate': 0, 
      'traite': 1},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Liste des contribuables pour un utilisateur spécifique
  Future<List<ContribuableModel>> getUserContribuables(int userId, {int page = 1, int pageSize = 100}) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'contribuables',
      where: 'userId = ?',
      whereArgs: [userId],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    );
    return List.generate(maps.length, (i) => ContribuableModel.fromMap(maps[i]));
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

    if (numero != null) {
      whereClause += ' AND numero LIKE :numero';
      queryArgs['numero'] = '%$numero%';
    }
    if (raisonSociale != null) {
      whereClause += ' AND raison_sociale LIKE :raisonSociale';
      queryArgs['raisonSociale'] = '%$raisonSociale%';
    }
    if (sigle != null) {
      whereClause += ' AND sigle LIKE :sigle';
      queryArgs['sigle'] = '%$sigle%';
    }
    if (niu != null) {
      whereClause += ' AND niu LIKE :niu';
      queryArgs['niu'] = '%$niu%';
    }
    if (activitePrincipale != null) {
      whereClause += ' AND activite_principale LIKE :activitePrincipale';
      queryArgs['activitePrincipale'] = '%$activitePrincipale%';
    }
    if (tel != null) {
      whereClause += ' AND tel LIKE :tel';
      queryArgs['tel'] = '%$tel%';
    }
    if (email != null) {
      whereClause += ' AND email LIKE :email';
      queryArgs['email'] = '%$email%';
    }
    if (coderegime != null) {
      whereClause += ' AND coderegime LIKE :coderegime';
      queryArgs['coderegime'] = '%$coderegime%';
    }
    if (regime != null) {
      whereClause += ' AND regime LIKE :regime';
      queryArgs['regime'] = '%$regime%';
    }
    if (siglecga != null) {
      whereClause += ' AND siglecga LIKE :siglecga';
      queryArgs['siglecga'] = '%$siglecga%';
    }
    if (cga != null) {
      whereClause += ' AND cga LIKE :cga';
      queryArgs['cga'] = '%$cga%';
    }
    if (codeunitegestion != null) {
      whereClause += ' AND codeunitegestion LIKE :codeunitegestion';
      queryArgs['codeunitegestion'] = '%$codeunitegestion%';
    }
    if (uniteGestion != null) {
      whereClause += ' AND unite_gestion LIKE :uniteGestion';
      queryArgs['uniteGestion'] = '%$uniteGestion%';
    }
    if (codeClient != null) {
      whereClause += ' AND codeClient LIKE :codeClient';
      queryArgs['codeClient'] = '%$codeClient%';
    }
    if (localisation != null) {
      whereClause += ' AND localisation LIKE :localisation';
      queryArgs['localisation'] = '%$localisation%';
    }
    if (validate != null) {
      whereClause += ' AND validate = :validate';
      queryArgs['validate'] = validate;
    }

    final List<Map<String, dynamic>> maps = await db.query(
      'contribuables',
      where: whereClause,
      whereArgs: queryArgs.values.toList(),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    );

    // le nombre total de contribuables
    final count = await db.query(
      'SELECT COUNT(*) FROM contribuables WHERE $whereClause',
      whereArgs: queryArgs.values.toList(),
    ).then((value) => value.first.values.first as int);

    return {
      'data': maps.toList(),
      'pagination':{
        'currentPage': (page - 1) * pageSize,
        'totalPage': (page - 1) * pageSize,
        'totalResult': count
      }
    };
  }


  // recuperer les contribuables non validés et non traités
  Future<List<ContribuableModel>> getNonValidatedAndNonTraiteContribuables({int page = 1, int pageSize = 100}) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'contribuables',
      where: 'validate = 0 AND traite = 0',
      limit: pageSize,
      offset: (page - 1) * pageSize,
    );
    return List.generate(maps.length, (i) => ContribuableModel.fromMap(maps[i]));
  }

  // recuperer les contribuables non validés et traités
  
}
