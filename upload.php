<?php

header('Content-type: application/json');
sleep(rand(1, 5));
echo json_encode(array("file" => $_FILES['file'], "post" => $_POST));