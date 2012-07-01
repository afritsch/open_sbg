<?php

header('content-type: text/html; charset=utf-8');

require_once('Database.class.php');

$object_id = intval($_GET['q']);

if(isset($object_id)) {
  $params = array( 
  	':object_id' => $object_id
  );
  
  $query = Database::getDB()->prepare('SELECT * FROM comments WHERE object_id = :object_id');
  $query->execute($params);
  
  $comments = '<ul>';
    while($result = $query->fetch()) {
      $comments .= '<li>' . $result->comment . '</li>';
    }
  $comments .= '</ul>';
  
  echo $comments;
}

?>