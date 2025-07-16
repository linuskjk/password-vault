<?php
$hash = $_POST['hash'] ?? '';
$file = "../accounts/{$hash}.json";
if (!file_exists($file)) {
  echo json_encode(["error" => "Invalid master key."]);
  exit;
}
$data = json_decode(file_get_contents($file), true);
echo json_encode(["status" => "ok", "username" => $data['username'] ?? '']);
