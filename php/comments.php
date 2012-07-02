<?php

header('content-type: text/html; charset=utf-8');

require_once('Database.class.php');

if(isset($_GET['q'])) {
  $params = array(
  	':institution_id' => intval($_GET['q'])
  );
  
  $query = Database::getDB()->prepare('SELECT username, comment_title, comment_content, DATE_FORMAT(created_at, "%d.%m.%Y, %H:%i:%s") AS created FROM comments WHERE institution_id = :institution_id');
  $query->execute($params);
  
  $comments = '<ul>';
    while($result = $query->fetch()) {
      if($result->username)
        $username = $result->username;
      else
        $username = 'Anonym';
        
      if($result->comment_title)
        $title = '<strong>' . $result->comment_title . '</strong></br />';
      else
        $title = ''; 
      
      $comments .= '<li>' . $username . '<br />' . $result->created . '<br />' . $title . $result->comment_content . '</li>';
    }
  $comments .= '</ul>';
  
  echo $comments;
}

elseif(isset($_POST['comment_content'])) {
  $params = array(
    ':institution_id' => intval($_POST['institution_id']),
    ':usermail' => $_POST['usermail'],
    ':username' => $_POST['username'],
    ':comment_title' => $_POST['comment_title'],
    ':comment_content' => $_POST['comment_content']
  );
  
  $query = Database::getDB()->prepare('
    INSERT INTO comments(institution_id, usermail, username, comment_title, comment_content)
    VALUES (:institution_id, :usermail, :username, :comment_title, :comment_content)
  ');
  
	$query->execute($params);
}

?>