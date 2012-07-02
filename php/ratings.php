<?php

require_once('Database.class.php');

if($_POST['event'] == 'load') {
  $params = array(
    ':institution_id' => intval($_POST['institution_id'])
  );
  
  $query = Database::getDB()->prepare('SELECT AVG(rating) AS average FROM ratings WHERE institution_id = :institution_id');
  $query->execute($params);
  
  $result = $query->fetch();
  
  echo $result->average;
} elseif($_POST['event'] == 'click') {
  $readingParams = array(
    ':institution_id' => intval($_POST['institution_id']),
    ':user_ip' => $_SERVER['REMOTE_ADDR']
  );
  
  $readingQuery = Database::getDB()->prepare('SELECT * FROM ratings WHERE institution_id = :institution_id AND user_ip = :user_ip AND CURRENT_TIMESTAMP - rated_at < 86400');
  $readingQuery->execute($readingParams);
  $result = $readingQuery->fetch();
  
  if($result->id) {
    $updateParams = array(
      ':institution_id' => intval($_POST['institution_id']),
      ':rating' => intval($_POST['rating']),
      ':user_ip' => $_SERVER['REMOTE_ADDR']
    );
    
    $updateQuery = Database::getDB()->prepare('UPDATE ratings SET rating = :rating WHERE institution_id = :institution_id AND user_ip = :user_ip');
  	$updateQuery->execute($updateParams);
  } else {
    $newParams = array(
      ':institution_id' => intval($_POST['institution_id']),
      ':rating' => intval($_POST['rating']),
      ':user_ip' => $_SERVER['REMOTE_ADDR']
    );
    
    $newQuery = Database::getDB()->prepare('INSERT INTO ratings(institution_id, rating, user_ip) VALUES (:institution_id, :rating, :user_ip)');
  	$newQuery->execute($newParams);
  }
}

?>