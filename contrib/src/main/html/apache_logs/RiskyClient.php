<?php
header("Content-type: application/json");
$redis = new Redis();
$redis->connect('127.0.0.1');
$redis->select(5);

// result array
$result = array();

$limit = $redis->get(0);
for($i = 1; $i < $limit; $i++)
{
  $value = $redis->get($i);
  $result[] = $value;
}

print json_encode($result);


?>
