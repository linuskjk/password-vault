<?php
session_start();
if (!isset($_SESSION['userfile'])) {
  echo json_encode(["error" => "Not logged in."]);
  exit;
}
$id = uniqid();
$name = $_POST['name'];
$user = $_POST['user'];
$pass = $_POST['pass'];
$file = $_SESSION['userfile'];
$hash = pathinfo($file, PATHINFO_FILENAME);
$vaultFile = "../entries/{$hash}.json";
$entries = file_exists($vaultFile) ? json_decode(file_get_contents($vaultFile), true) : [];
$entries[] = ["id" => $id, "name" => $name, "user" => $user, "pass" => $pass];
file_put_contents($vaultFile, json_encode($entries));
echo json_encode(["status" => "ok"]);
