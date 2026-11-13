<?php
/**
 * JT Flipping P&L — API storan data (untuk hosting cPanel biasa).
 *
 * Data disimpan sebagai fail JSON dalam folder data/ (dilindungi .htaccess
 * dan setiap fail bermula dengan <?php exit ?> supaya tak boleh dibaca terus).
 * Log masuk guna kata laluan yang ditetapkan kali pertama app dibuka.
 *
 * Perlu PHP 7.3 atau lebih baru.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

define('DATA_DIR', __DIR__ . '/data');
define('TOKEN_DAYS', 60);
define('COOKIE', 'jt_pnl');
define('GUARD', "<?php http_response_code(404); exit; ?>\n");

function out($x, $code = 200) { http_response_code($code); echo json_encode($x, JSON_UNESCAPED_UNICODE); exit; }
function fail($err, $code = 400, $msg = '') { out(array('error' => $err, 'message' => $msg), $code); }

function fpath($name) { return DATA_DIR . '/' . $name . '.json.php'; }
function readf($name) {
  $f = fpath($name);
  if (!is_file($f)) return null;
  $s = file_get_contents($f);
  $p = strpos($s, "\n");
  return json_decode($p === false ? $s : substr($s, $p + 1));
}
function writef($name, $val) {
  $f = fpath($name);
  $tmp = $f . '.tmp' . bin2hex(random_bytes(4));
  if (file_put_contents($tmp, GUARD . json_encode($val, JSON_UNESCAPED_UNICODE)) === false) fail('unavailable', 500, 'Tak dapat tulis fail data. Semak kebenaran folder data/.');
  rename($tmp, $f);
}

/* ---------- kunci tulis (satu penulis pada satu masa) ---------- */
$LOCK = null;
function lock() {
  global $LOCK;
  $LOCK = fopen(DATA_DIR . '/.lock', 'c');
  if ($LOCK) flock($LOCK, LOCK_EX);
}

/* ---------- dokumen ---------- */
function docName($path) {
  if (!is_string($path) || !preg_match('#^(settings|months)/([A-Za-z0-9_.-]{1,40})$#', $path, $m)) fail('invalid_argument', 400, 'Laluan dokumen tidak sah.');
  return 'doc__' . $m[1] . '__' . $m[2];
}
function nameToPath($name) {
  $p = explode('__', $name);
  return $p[1] . '/' . $p[2];
}
function rev() { $m = readf('meta'); return $m && isset($m->rev) ? (int)$m->rev : 0; }
function bump() { $r = rev() + 1; writef('meta', (object)array('rev' => $r)); return $r; }

/* Gabung objek (seperti Firestore update): objek digabung, nilai lain diganti, null = padam. */
function merge($a, $b) {
  if (!is_object($a)) $a = new stdClass();
  foreach (get_object_vars($b) as $k => $v) {
    if ($v === null) { unset($a->$k); }
    elseif (is_object($v)) { $a->$k = merge(isset($a->$k) ? $a->$k : null, $v); }
    else { $a->$k = $v; }
  }
  return $a;
}
function stripNulls($v) {
  if (is_object($v)) { foreach (get_object_vars($v) as $k => $x) { if ($x === null) unset($v->$k); else $v->$k = stripNulls($x); } }
  return $v;
}

/* Salinan harian (simpan 30 hari) sebelum dokumen ditukar. */
function backup($name) {
  $src = fpath($name);
  if (!is_file($src)) return;
  $dir = DATA_DIR . '/backup/' . date('Y-m-d');
  if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
    foreach ((array)glob(DATA_DIR . '/backup/*', GLOB_ONLYDIR) as $old) {
      if (basename($old) < date('Y-m-d', strtotime('-30 days'))) { array_map('unlink', (array)glob($old . '/*')); @rmdir($old); }
    }
  }
  $dst = $dir . '/' . basename($src);
  if (!is_file($dst)) @copy($src, $dst);
}

/* ---------- auth ---------- */
function isHttps() { return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https'); }
function cookiePath() { $d = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/'); return $d === '' ? '/' : $d . '/'; }
function setTok($val, $exp) {
  setcookie(COOKIE, $val, array('expires' => $exp, 'path' => cookiePath(), 'secure' => isHttps(), 'httponly' => true, 'samesite' => 'Strict'));
}
function issueToken() {
  $tok = bin2hex(random_bytes(32));
  $t = readf('tokens'); if (!is_object($t)) $t = new stdClass();
  $now = time();
  foreach (get_object_vars($t) as $k => $exp) if ($exp < $now) unset($t->$k);
  $exp = $now + TOKEN_DAYS * 86400;
  $h = hash('sha256', $tok);
  $t->$h = $exp;
  writef('tokens', $t);
  setTok($tok, $exp);
}
function loggedIn() {
  if (empty($_COOKIE[COOKIE])) return false;
  $t = readf('tokens'); if (!is_object($t)) return false;
  $h = hash('sha256', (string)$_COOKIE[COOKIE]);
  return isset($t->$h) && $t->$h > time();
}
function needAuth() { if (!loggedIn()) fail('auth', 401, 'Sila log masuk.'); }
function throttle($ok) {
  $th = readf('throttle'); if (!is_object($th)) $th = (object)array('n' => 0, 'until' => 0);
  if ($ok) { writef('throttle', (object)array('n' => 0, 'until' => 0)); return; }
  $th->n = (int)$th->n + 1;
  if ($th->n >= 5) { $th->until = time() + 300; $th->n = 0; }
  writef('throttle', $th);
}
function checkThrottle() {
  $th = readf('throttle');
  if ($th && isset($th->until) && $th->until > time()) fail('locked', 429, 'Terlalu banyak cubaan. Cuba lagi dalam 5 minit.');
}

/* ---------- permintaan ---------- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || ($_SERVER['HTTP_X_JT'] ?? '') !== '1') fail('bad_request', 400, 'Permintaan tidak sah.');
if (!is_dir(DATA_DIR)) @mkdir(DATA_DIR, 0755, true);
if (!is_dir(DATA_DIR) || !is_writable(DATA_DIR)) fail('not_writable', 500, 'Folder data/ tidak boleh ditulis. Tukar permission folder data kepada 755.');
if (!is_file(DATA_DIR . '/.htaccess')) file_put_contents(DATA_DIR . '/.htaccess', "<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n");
if (!is_file(DATA_DIR . '/index.html')) file_put_contents(DATA_DIR . '/index.html', '');

$in = json_decode(file_get_contents('php://input'));
if (!is_object($in)) $in = new stdClass();
$action = $_GET['action'] ?? '';

switch ($action) {
  case 'status':
    out(array('setup' => readf('auth') === null, 'loggedIn' => loggedIn()));

  case 'setup':
    lock();
    if (readf('auth') !== null) fail('exists', 409, 'Kata laluan sudah ditetapkan.');
    $pw = (string)($in->password ?? '');
    if (strlen($pw) < 6) fail('weak', 400, 'Kata laluan mesti sekurang-kurangnya 6 aksara.');
    writef('auth', (object)array('hash' => password_hash($pw, PASSWORD_DEFAULT)));
    issueToken();
    out(array('ok' => true));

  case 'login':
    lock();
    checkThrottle();
    $a = readf('auth');
    if (!$a) fail('setup', 409, 'Kata laluan belum ditetapkan.');
    $ok = password_verify((string)($in->password ?? ''), $a->hash);
    throttle($ok);
    if (!$ok) { usleep(600000); fail('wrong', 401, 'Kata laluan salah.'); }
    issueToken();
    out(array('ok' => true));

  case 'logout':
    lock();
    if (!empty($_COOKIE[COOKIE])) { $t = readf('tokens'); $h = hash('sha256', (string)$_COOKIE[COOKIE]); if (is_object($t) && isset($t->$h)) { unset($t->$h); writef('tokens', $t); } }
    setTok('', time() - 3600);
    out(array('ok' => true));

  case 'password':
    needAuth(); lock();
    $a = readf('auth');
    if (!password_verify((string)($in->old ?? ''), $a->hash)) fail('wrong', 401, 'Kata laluan lama salah.');
    $pw = (string)($in->new ?? '');
    if (strlen($pw) < 6) fail('weak', 400, 'Kata laluan baru mesti sekurang-kurangnya 6 aksara.');
    writef('auth', (object)array('hash' => password_hash($pw, PASSWORD_DEFAULT)));
    writef('tokens', new stdClass()); // log keluar semua peranti lain
    issueToken();
    out(array('ok' => true));

  case 'version':
    needAuth();
    out(array('rev' => rev()));

  case 'load':
    needAuth();
    $docs = new stdClass();
    foreach ((array)glob(DATA_DIR . '/doc__*.json.php') as $f) {
      $name = substr(basename($f), 0, -strlen('.json.php'));
      $p = nameToPath($name);
      $docs->$p = readf($name);
    }
    out(array('rev' => rev(), 'docs' => $docs));

  case 'get':
    needAuth();
    $v = readf(docName($in->path ?? ''));
    out(array('exists' => $v !== null, 'data' => $v, 'rev' => rev()));

  case 'set':
    needAuth(); lock();
    $name = docName($in->path ?? '');
    if (!isset($in->data) || !is_object($in->data)) fail('invalid_argument', 400, 'Data mesti objek.');
    backup($name);
    writef($name, stripNulls($in->data));
    out(array('rev' => bump()));

  case 'update':
    needAuth(); lock();
    $name = docName($in->path ?? '');
    if (!isset($in->data) || !is_object($in->data)) fail('invalid_argument', 400, 'Data mesti objek.');
    $cur = readf($name);
    if ($cur === null) fail('invalid_argument', 404, 'Dokumen belum wujud.');
    backup($name);
    $new = merge($cur, $in->data);
    writef($name, $new);
    out(array('rev' => bump(), 'data' => $new));

  default:
    fail('bad_request', 400, 'Tindakan tidak dikenali.');
}
