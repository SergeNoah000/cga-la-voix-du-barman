/* <?php

require_once 'vendor/autoload.php';

use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app = AppFactory::create();

$database = new PDO('mysql:host=localhost;dbname=cga', 'root', '');

$app->addRoutingMiddleware();

$app->addErrorMiddleware(true, true, true);

$app->add(function (Request $request, $handler) {
    $response = $handler->handle($request);
    $protocol = $request->getServerParams()['SERVER_PROTOCOL'];
    $method = $request->getMethod();
    $originalUrl = $request->getUri()->getPath();
    $contentLength = $request->getHeaderLine('Content-Length') ?: 0;
    $statusCode = $response->getStatusCode();
    $date = gmdate('D, d M Y H:i:s \G\M\T');
    echo "[$date] $protocol $method $originalUrl $statusCode $contentLength bytes\n";
    return $response;
});

$app->addBodyParsingMiddleware();

$app->post('/api/login', function (Request $request, Response $response, $args) use ($database) {
    $data = $request->getParsedBody();
    $username = $data['username'];
    $password = $data['password'];

    $stmt = $database->prepare('SELECT * FROM users WHERE username = ? AND password = ?');
    $stmt->execute([$username, $password]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        return $response->withStatus(202)->withJson(['msg' => 'Nom d\'utilisateur ou mot de passe incorrect !']);
    }

    return $response->withJson(['user' => $user, 'msg' => 'Connexion réussie !']);
});

$app->post('/api/user-register', function (Request $request, Response $response, $args) use ($database) {
    $data = $request->getParsedBody();
    $username = $data['username'];
    $password = $data['password'];
    $fullname = $data['fullname'];

    $stmt = $database->prepare('SELECT * FROM users WHERE username = ? AND role = "user" AND fullname = ?');
    $stmt->execute([$username, $fullname]);
    $userExists = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($userExists) {
        return $response->withStatus(203)->withJson(['msg' => "L'utilisateur existe déjà dans la base de données !"]);
    }

    $stmt = $database->prepare('INSERT INTO users (username, password, role, fullname) VALUES (?, ?, "user", ?)');
    $stmt->execute([$username, $password, $fullname]);

    $newUser = $database->lastInsertId();

    return $response->withStatus(201)->withJson(['user' => $newUser, 'msg' => 'Enregistrement réussi !']);
});

$app->put('/api/contrib-update/{codeClient}', function (Request $request, Response $response, $args) use ($database) {
    $codeClient = $args['codeClient'];
    $data = $request->getParsedBody();

    $stmt = $database->prepare('UPDATE contribuables SET nomPrenoms = ?, niu = ?, paiementInscription = ?, paiementCotisation = ?, restePayerInscription = ?, restePayerCotisation = ?, numeroTel = ?, cdi = ?, localisation = ?, distributeur = ?, cgaActuel = ? WHERE id = ?');

    $updatedContribuable = [
        $data['nomPrenoms'],
        $data['niu'],
        $data['paiementInscription'],
        $data['paiementCotisation'],
        $data['restePayerInscription'],
        $data['restePayerCotisation'],
        $data['numeroTel'],
        $data['cdi'],
        $data['localisation'],
        $data['distributeur'],
        $data['cgaActuel'],
        $codeClient,
    ];

    $stmt->execute($updatedContribuable);

    if ($stmt->rowCount() === 0) {
        return $response->withStatus(404)->withJson(['message' => 'Client non trouvé.']);
    }

    return $response->withJson(['message' => 'Client mis à jour avec succès.']);
});

$app->post('/api/contrib-register', function (Request $request, Response $response, $args) use ($database) {
    $data = $request->getParsedBody();

    $stmt = $database->prepare('INSERT INTO contribuables (nomPrenoms, niu, paiementInscription, paiementCotisation, restePayerInscription, restePayerCotisation, numeroTel, cdi, localisation, distributeur, cgaActuel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $data['nomPrenoms'],
        $data['niu'],
        $data['paiementInscription'],
        $data['paiementCotisation'],
        $data['restePayerInscription'],
        $data['restePayerCotisation'],
        $data['numeroTel'],
        $data['cdi'],
        $data['localisation'],
        $data['distributeur'],
        $data['cgaActuel']
    ]);

    return $response->withJson(['msg' => 'Contribuable enregistré avec succès !']);
});

$app->get('/api/contribuables', function (Request $request, Response $response, $args) use ($database) {
    $page = $request->getQueryParams()['page'] ?? 1;
    $pageSize = 20;

    $offset = ($page - 1) * $pageSize;

    $stmt = $database->prepare('SELECT * FROM contribuables WHERE validate = TRUE ORDER BY id DESC LIMIT ? OFFSET ?');
    $stmt->execute([$pageSize, $offset]);
    $contribuables = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return $response->withJson($contribuables);
});

$app->post('/api/search', function (Request $request, Response $response, $args) use ($database) {
    $data = $request->getParsedBody();

    $niu = $data['niu'] ?? '';
    $raisonSociale = $data['raisonSociale'] ?? '';
    $sigle = $data['sigle'] ?? '';
    $numeroTel = $data['numeroTel'] ?? '';
    $localisation = $data['localisation'] ?? '';

    $whereClause = '';
    $params = [];

    if ($niu) {
        $whereClause .= 'niu LIKE ? OR ';
        $params[] = "%$niu%";
    }

    if ($raisonSociale) {
        $whereClause .= 'raison_sociale LIKE ? OR ';
        $params[] = "%$raisonSociale%";
    }

    if ($sigle) {
        $whereClause .= 'sigle LIKE ? OR ';
        $params[] = "%$sigle%";
    }

    if ($numeroTel) {
        $whereClause .= 'tel LIKE ? OR ';
        $params[] = "%$numeroTel%";
    }

    if ($localisation) {
        $whereClause .= 'localisation LIKE ? OR ';
        $params[] = "%$localisation%";
    }

    $whereClause .= '1=1';

    $stmt = $database->prepare("SELECT * FROM contribuables WHERE validate = TRUE AND $whereClause");
    $stmt->execute($params);
    $contribuables = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return $response->withJson($contribuables);
});

$app->post('/api/contrib/validate', function (Request $request, Response $response, $args) use ($database) {
    $data = $request->getParsedBody();

    $niu = $data['niu'] ?? '';
    $valide = $data['valide'] ?? false;

    $stmt = $database->prepare('UPDATE contribuables SET validate = ?, traite = TRUE WHERE niu = ?');
    $stmt->execute([$valide, $niu]);

    if ($stmt->rowCount() === 0) {
        return $response->withStatus(204)->withJson(['message' => 'Client non trouvé.']);
    }

    return $response->withJson(['message' => 'Client mis à jour avec succès.']);
});

$app->get('/contribs/renew', function (Request $request, Response $response, $args) use ($database) {
    $stmt = $database->prepare('UPDATE contribuables SET paiement = 0');
    $stmt->execute();

    return $response->withJson(['message' => 'Mis à jour avec succès.']);
});

$app->get('/api/contribuables/all', function (Request $request, Response $response, $args) use ($database) {
    $stmt = $database->prepare('SELECT * FROM contribuables WHERE validate = TRUE ORDER BY id DESC');
    $stmt->execute();
    $contribuables = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return $response->withJson($contribuables);
});

$app->get('/api/contribuables/validate', function (Request $request, Response $response, $args) use ($database) {
    $stmt = $database->prepare('SELECT c.*, u.fullname FROM contribuables c JOIN users u ON c.userId = u.id WHERE c.traite = FALSE');
    $stmt->execute();
    $contribuables = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return $response->withJson($contribuables);
});

$app->post('/mise-a-jour-en-ligne', function (Request $request, Response $response, $args) use ($database) {
    $uploadedFile = $request->getUploadedFiles()['file'];
    $filePath = './uploads/' . $uploadedFile->getClientFilename();
    $uploadedFile->moveTo($filePath);

    processXLSXFile($filePath, $database);

    return $response->withJson(['message' => 'Mise à jour réussie.']);
});

$app->post('/api/dgi-compare', function (Request $request, Response $response, $args) use ($database) {
    $uploadedFile = $request->getUploadedFiles()['file'];
    $filePath = './uploads/' . $uploadedFile->getClientFilename();
    $uploadedFile->moveTo($filePath);

    compareAndUpdateDatabase($filePath, $database);

    $stmt = $database->prepare('SELECT * FROM contribuables ORDER BY upToDate ASC');
    $stmt->execute();
    $contribuables = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return $response->withJson(['message' => 'Comparaison et mise à jour réussies.', 'contribuables' => $contribuables]);
});

function processXLSXFile($filePath, $database)
{
    $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
    $worksheet = $spreadsheet->getActiveSheet();
    $rows = $worksheet->toArray();

    foreach ($rows as $row) {
        if ($row[0] !== 'Code' && $row[0] !== '') {
            $stmt = $database->prepare('INSERT INTO contribuables (codeClient, nomPrenoms, niu, paiementInscription, paiementCotisation, restePayerInscription, restePayerCotisation, numeroTel, cdi, localisation, distributeur, cgaActuel, ancienCga, validate, traite) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, FALSE)');

            $stmt->execute([
                $row[0],
                $row[1],
                $row[2],
                $row[3],
                $row[4],
                $row[5],
                $row[6],
                $row[7],
                $row[8],
                $row[9],
                $row[10],
                $row[11],
                $row[11]
            ]);
        }
    }
}

function compareAndUpdateDatabase($filePath, $database)
{
    $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
    $worksheet = $spreadsheet->getActiveSheet();
    $rows = $worksheet->toArray();

    for ($i = 1; $i < count($rows); $i++) {
        $niu = $rows[$i][2];

        $stmt = $database->prepare('UPDATE contribuables SET upToDate = TRUE WHERE niu = ?');
        $stmt->execute([$niu]);
    }
}

$app->run(); 



require __DIR__ . '/vendor/autoload.php';

$app = AppFactory::create();
$app->addBodyParsingMiddleware();

$database = new \Slim\PDO\Database('mysql:host=localhost;dbname=cga', 'root', '');

$app->add(function ($request, $handler) {
    $response = $handler->handle($request);

    date_default_timezone_set('UTC');
    $date = date('D, d M Y H:i:s e');
    $protocol = $request->getUri()->getScheme();
    $method = $request->getMethod();
    $originalUrl = $request->getUri()->getPath();
    $statusCode = $response->getStatusCode();
    $contentLength = $response->getBody()->getSize() ?? 0;

    $logMessage = "[$date] $protocol $method $originalUrl $statusCode $contentLength bytes\n";

    file_put_contents('access.log', $logMessage, FILE_APPEND);

    return $response;
});

$app->post('/api/login', function ($request, $response, $args) use ($database) {
    $data = $request->getParsedBody();
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    try {
        $user = $database->select()
            ->from('users')
            ->where('username', '=', $username)
            ->where('password', '=', $password)
            ->first();

        if (!$user) {
            return $response->withStatus(202)->withJson(['msg' => 'Nom d\'utilisateur ou mot de passe incorrect !']);
        }

        return $response->withJson(['user' => $user, 'msg' => 'Connexion reussie !!']);
    } catch (Exception $e) {
        error_log($e->getMessage());
        return $response->withStatus(500)->withJson(['error' => 'Internal Server Error on login processing']);
    }
});

$app->post('/api/user-register', function ($request, $response, $args) use ($database) {
    $data = $request->getParsedBody();
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    $fullname = $data['fullname'] ?? '';

    try {
        $userExists = $database->select()
            ->from('users')
            ->where('username', '=', $username)
            ->where('role', '=', 'user')
            ->where('fullname', '=', $fullname)
            ->first();

        if ($userExists) {
            return $response->withStatus(203)->withJson(['msg' => "L'utilisateur existe déjà dans la base de données !"]);
        }

        $newUser = $database->insert(['username' => $username, 'password' => $password, 'role' => 'user', 'fullname' => $fullname])
            ->into('users')
            ->execute();

        return $response->withStatus(201)->withJson(['user' => $newUser, 'msg' => 'Enregistrement réussi !']);
    } catch (Exception $e) {
        error_log($e->getMessage());
        return $response->withStatus(500)->withJson(['error' => 'Internal Server Error on user registration processing']);
    }
});

$app->put('/api/contrib-update/{codeClient}', function ($request, $response, $args) use ($database) {
    $codeClient = $args['codeClient'];
    $updatedContribuable = $request->getParsedBody();

    try {
        $updateResult = $database->update($updatedContribuable)
            ->table('contribuables')
            ->where('id', '=', $codeClient)
            ->execute();

        if ($updateResult === 0) {
            return $response->withStatus(404)->withJson(['message' => 'Client non trouvé.']);
        }

        return $response->withJson(['message' => 'Client mis à jour avec succès.']);
    } catch (Exception $e) {
        error_log('Erreur lors de la mise à jour du client :' . $e->getMessage());
        return $response->withStatus(500)->withJson(['error' => 'Erreur lors de la mise à jour du client.']);
    }
});


$app->post('/api/contrib-register', function ($request, $response, $args) use ($database) {
    $contribuableData = $request->getParsedBody();

    try {
        $database->insert($contribuableData)
            ->into('contribuables')
            ->execute();

        return $response->withJson(['msg' => 'Contribuable enregistré avec succès !']);
    } catch (Exception $e) {
        error_log($e->getMessage());
        return $response->withStatus(500)->withJson(['error' => 'Erreur interne du serveur lors du traitement de l\'enregistrement du contribuable']);
    }
});

$app->get('/api/contribuables', function ($request, $response, $args) use ($database) {
    $page = $request->getQueryParam('page', 1);
    $pageSize = 20; // Nombre d'éléments par page

    // Calculer l'offset en fonction de la page
    $offset = ($page - 1) * $pageSize;

    try {
        $contribuables = $database->select()
            ->from('contribuables')
            ->where('validate', '=', true)
            ->orderBy('id', 'desc')
            ->offset($offset)
            ->limit($pageSize)
            ->execute()
            ->fetchAll();

        return $response->withJson($contribuables);
    } catch (Exception $e) {
        error_log('Erreur lors de la récupération des contribuables :' . $e->getMessage());
        return $response->withStatus(500)->withJson(['error' => 'Erreur interne du serveur lors de la récupération des contribuables']);
    }
});

$app->post('/api/search', function ($request, $response, $args) use ($database) {
    $niu = $request->getParsedBody()['niu'] ?? '';
    $raisonSociale = $request->getParsedBody()['raisonSociale'] ?? '';
    $sigle = $request->getParsedBody()['sigle'] ?? '';
    $numeroTel = $request->getParsedBody()['numeroTel'] ?? '';
    $localisation = $request->getParsedBody()['localisation'] ?? '';

    $query = $database->select()
        ->from('contribuables')
        ->andWhere('validate', '=', true);

    if ($niu) {
        $query = $query->orWhere('niu', 'like', "%$niu%");
    }

    if ($raisonSociale) {
        $query = $query->orWhere('raison_sociale', 'like', "%$raisonSociale%");
    }

    if ($sigle) {
        $query = $query->orWhere('sigle', 'like', "%$sigle%");
    }

    if ($numeroTel) {
        $query = $query->orWhere('tel', 'like', "%$numeroTel%");
    }

    if ($localisation) {
        $query = $query->orWhere('localisation', 'like', "%$localisation%");
    }

    $query = $query->orderBy('id', 'desc');

    try {
        $results = $query->execute()->fetchAll();
        return $response->withJson($results);
    } catch (Exception $e) {
        error_log('Erreur lors de la recherche :' . $e->getMessage());
        return $response->withStatus(500)->withJson(['error' => 'Erreur interne du serveur lors de la recherche']);
    }
});

$app->post('/api/contrib/validate', function ($request, $response, $args) use ($database) {
    $niu = $request->getParsedBody()['niu'] ?? '';
    $valide = $request->getParsedBody()['valide'] ?? false;

    try {
        $updateResult = $database->update(['validate' => $valide, 'traite' => true])
            ->table('contribuables')
            ->where('niu', '=', $niu)
            ->orderBy('id', 'desc')
            ->execute();

        if (!$updateResult) {
            return $response->withStatus(204)->withJson(['message' => 'Client non trouvé.']);
        }

        return $response->withJson(['message' => 'Client mis à jour avec succès.', 'updateResult' => $updateResult]);
    } catch (Exception $e) {
        error_log('Erreur lors de la validation :' . $e->getMessage());
        return $response->withStatus(500)->withJson(['error' => 'Erreur interne du serveur lors de la recherche']);
    }
});

$app->get('/api/contribs/renew', function ($request, $response, $args) use ($database) {
    try {
        $updateResult = $database->update(['paiement' => 0])->table('contribuables')->execute();

        if (!$updateResult) {
            return $response->withStatus(204)->withJson(['message' => 'Erreur']);
        }

        return $response->withJson(['message' => 'Mis à jour avec succès.', 'updateResult' => $updateResult]);
    } catch (Exception $e) {
        error_log('Erreur lors de la mise a jour totale :' . $e->getMessage());
        return $response->withStatus(500)->withJson(['error' => 'Erreur interne du serveur lors de la mise à jour toatale']);
    }
});

$app->get('/api/contribuables/all', function ($request, $response, $args) use ($database) {
    try {
        $contribuables = $database->select()
            ->from('contribuables')
            ->where('validate', '=', true)
            ->orderBy('id', 'desc')
            ->execute()
            ->fetchAll();

        return $response->withJson($contribuables);
    } catch (Exception $e) {
        error_log('Erreur lors de la récupération des contribuables :' . $e->getMessage());
        return $response->withStatus(500)->withJson(['error' => 'Erreur interne du serveur lors de la récupération des contribuables']);
    }
});

$app->get('/api/contribuables/validate', function ($request, $response, $args) use ($database) {
    try {
        $contribuables = $database->select()
            ->from('contribuables')
            ->join('users', 'contribuables.userId', '=', 'users.id')
            ->where('traite', '=', false)
            ->execute()
            ->fetchAll();

        return $response->withJson($contribuables);
    } catch (Exception $e) {
        error_log('Erreur lors de la récupération des contribuables :' . $e->getMessage());
        return $response->withStatus(500)->withJson(['error' => 'Erreur interne du serveur lors de la récupération des contribuables']);
    }
});

$app->post('/mise-a-jour-en-ligne', function ($request, $response, $args) use ($database) {
    $uploadedFiles = $request->getUploadedFiles();
    $file = $uploadedFiles['file'];

    try {
        $csvData = convertXlsToCsv($file->getStream()->getContents());

        $rows = explode("\n", $csvData);
        // Supprimer la première ligne (headers) du tableau
        $headers = str_getcsv(array_shift($rows));
        // Récupérer l'index de la colonne 'cga'
        $cgaIndex = array_search('CGA', $headers);
        if ($cgaIndex !== false) {
            $headers[] = 'ancienCga'; // Ajouter 'ancienCga' aux headers
        }

        $insertData = [];
        foreach ($rows as $row) {
            $rowData = str_getcsv($row);
            $rowData['ancienCga'] = $rowData[$cgaIndex] ?? '';
            $rowData['traite'] = true;
            $rowData['validate'] = true;
            $insertData[] = array_combine($headers, $rowData);
        }

        $database->insert($insertData)
            ->into('contribuables')
            ->execute();

        return $response->withStatus(200)->withJson(['message' => 'Mise à jour réussie.']);

    } catch (Exception $e) {
        error_log($e->getMessage());
        return $response->withStatus(500)->withJson(['error' => 'Erreur lors de la mise à jour.']);
    }
});

$app->post('/api/dgi-compare', function ($request, $response, $args) use ($database) {
    $uploadedFiles = $request->getUploadedFiles();
    $file = $uploadedFiles['file'];

    try {
        $fileContents = $file->getStream()->getContents();
        $workbook = \PhpOffice\PhpSpreadsheet\IOFactory::load($fileContents);
        $sheetData = $workbook->getActiveSheet()->toArray();

        $batchSize = 100; // Taille du lot
        $totalEntries = count($sheetData);
        $batchCount = ceil($totalEntries / $batchSize);

        // Utilisation de transaction par lot
        for ($i = 0; $i < $batchCount; $i++) {
            $start = $i * $batchSize;
            $end = min($start + $batchSize, $totalEntries);
            $batch = array_slice($sheetData, $start, $end - $start);

            $niuList = array_column($batch, 'NIU');
            $databaseNIUList = $database->select('niu')->from('contribuables')->execute()->fetchAll(PDO::FETCH_COLUMN);

            foreach ($databaseNIUList as $niu) {
                $isUpToDate = in_array($niu, $niuList);
                $database->update(['upToDate' => $isUpToDate])->table('contribuables')->where('niu', '=', $niu)->execute();
            }

            // Calcul du pourcentage de traitement
            $progressPercentage = (($i + 1) / $batchCount) * 100;

            // Envoi du pourcentage de progression au frontend via SSE
            echo "data: " . number_format($progressPercentage, 2) . "%\n\n";
            ob_flush();
            flush();
            sleep(1);
        }

        $updatedData = $database->select()->from('contribuables')->orderBy('upToDate', 'asc')->execute()->fetchAll();

        return $response->withStatus(200)->withJson(['message' => 'Comparaison et mise à jour réussies.', 'contribuables' => $updatedData]);

    } catch (Exception $e) {
        error_log('Erreur :' . $e->getMessage());
        return $response->withStatus(500)->withJson(['error' => 'Erreur lors de la comparaison et de la mise à jour.']);
    }
});

function convertXlsToCsv($fileContent)
{
    try {
        $reader = new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
        $spreadsheet = $reader->loadFromString($fileContent);
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Csv($spreadsheet);
        $string = $writer->generateCsv();
        return $string;
    } catch (Exception $e) {
        throw new Exception('Erreur lors de la conversion : ' . $e->getMessage());
    }
}

$app->run();