<?php
session_start();
if (!isset($_SESSION['userfile'])) {
  echo json_encode(["error" => "Not logged in."]);
  exit;
}
$id = $_POST['id'];
$file = $_SESSION['userfile'];
$hash = pathinfo($file, PATHINFO_FILENAME);
$vaultFile = "../entries/{$hash}.json";
$entries = file_exists($vaultFile) ? json_decode(file_get_contents($vaultFile), true) : [];
$entries = array_filter($entries, fn($e) => $e['id'] !== $id);
file_put_contents($vaultFile, json_encode(array_values($entries)));
echo json_encode(["status" => "ok"]);
