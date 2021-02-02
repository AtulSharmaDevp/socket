DROP PROCEDURE IF EXISTS releaseLock;
DELIMITER $$
CREATE PROCEDURE releaseLock (
    IN tablename varchar(25), 
    IN w_where varchar(500)
    )
BEGIN  
SET @Query =CONCAT("UPDATE ",tablename, " SET updated_at = CURRENT_TIMESTAMP() where ", w_where );  
PREPARE stmt3 FROM @Query;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3; 
END $$
DELIMITER ;