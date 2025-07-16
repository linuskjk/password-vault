<?php
session_start();
$user = $_POST['username'] ?? '';
$pass = $_POST['password'] ?? '';

foreach (glob("../accounts/*.json") as $file) {
  $data = json_decode(file_get_contents($file), true);
  if ($data['username'] === $user && password_verify($pass, $data['password'])) {
    $_SESSION['userfile'] = $file;
    echo json_encode(["status" => "ok"]);
    exit;
  }
}
echo json_encode(["error" => "Login failed."]);
