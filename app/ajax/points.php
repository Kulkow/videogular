<?php
/**
 * Created by PhpStorm.
 * User: Игорёк
 * Date: 01.03.2016
 * Time: 21:44
 */
$points = array();
$points['points'] = array();
$points['points'] = array('x' => '20%', 'y' => '0%', 'text' => '<p>Точка 1</p>', 'start' => 10, 'end' => 15);
$points['points'] = array('x' => '20%', 'y' => '0%', 'text' => '<p>Точка 2</p>', 'start' => 20, 'end' => 30);
$points['points'] = array('x' => '20%', 'y' => '100%', 'text' => '<p>Точка 3</p>', 'start' => 60, 'end' => 80);
exit(json_encode($points));