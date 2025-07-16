<?php
session_start();
$hash = $_POST['hash'] ?? '';
$user = $_POST['username'] ?? '';
$pass = $_POST['password'] ?? '';
if (!$hash || !$user || !$pass) {
  echo json_encode(["error" => "Missing data."]);
  exit;
}
$file = "../accounts/$hash.json";
if (!file_exists($file)) {
  echo json_encode(["error" => "Invalid master key."]);
  exit;
}
$data = json_decode(file_get_contents($file), true);
$data['username'] = $user;
$data['password'] = password_hash($pass, PASSWORD_DEFAULT);
file_put_contents($file, json_encode($data));

$_SESSION['userfile'] = $file;
echo json_encode(["status" => "ok"]);