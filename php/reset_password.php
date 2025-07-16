<?php
$hash = $_POST['hash'] ?? '';
$newPass = $_POST['newPass'] ?? '';
$file = "../accounts/{$hash}.json";
if (!file_exists($file)) {
  echo json_encode(["error" => "Invalid master key."]);
  exit;
}
$data = json_decode(file_get_contents($file), true);
$data['password'] = password_hash($newPass, PASSWORD_DEFAULT);
file_put_contents($file, json_encode($data));
echo json_encode(["status" => "ok"]);
