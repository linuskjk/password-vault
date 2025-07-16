<?php
session_start();
if (!isset($_SESSION['userfile'])) {
  echo json_encode(["error" => "Not logged in."]);
  exit;
}
$file = $_SESSION['userfile'];
$hash = pathinfo($file, PATHINFO_FILENAME);
$vaultFile = "../entries/{$hash}.json";
$entries = file_exists($vaultFile) ? json_decode(file_get_contents($vaultFile), true) : [];
echo json_encode(["entries" => $entries]);
