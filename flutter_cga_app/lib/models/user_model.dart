class UserModel {
  int? id;
  String username;
  String fullname;
  String password;
  String? description;
  String? email;
  int? numTel;
  String? creationDate;
  String? updateDate;
  String? role;

  UserModel({
    this.id,
    required this.username,
    required this.fullname,
    required this.password,
    this.description,
    this.email,
    this.numTel,
    this.creationDate,
    this.updateDate,
    this.role,
  });

  // Convert a User object into a Map object for database operations
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'username': username,
      'fullname': fullname,
      'password': password,
      'description': description,
      'email': email,
      'numTel': numTel,
      'creationDate': creationDate,
      'updateDate': updateDate,
      'role': role,
    };
  }

  // Convert a Map object into a User object
  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'],
      username: map['username'],
      fullname: map['fullname'],
      password: map['password'],
      description: map['description'],
      email: map['email'],
      numTel: map['numTel'],
      creationDate: map['creationDate'],
      updateDate: map['updateDate'],
      role: map['role'],
    );
  }
}
