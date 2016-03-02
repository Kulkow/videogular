<?php
$points = array();
$points['points'] = array();
$points['points'][] = array('type' => 'left','x' => '0%', 'y' => '0%', 'content' => '<p>Точка 1</p>', 'start' => 5, 'end' => 10);
$points['points'][] = array('type' => 'up','x' => '0%', 'y' => '0%', 'content' => '<p>Точка 2</p>', 'start' => 20, 'end' => 30);
$points['points'][] = array('type' => 'right','x' => '80%', 'y' => '50%', 'content' => '<p>Точка 3</p>', 'start' => 60, 'end' => 80);
$points['points'][] = array('type' => 'down','x' => '20%', 'y' => '50%', 'content' => '<p>Точка 4</p>', 'start' => 70, 'end' => 90);
exit(json_encode($points));