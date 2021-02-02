-- SELECT DATA PROCEDURE
DROP PROCEDURE IF EXISTS SelectData;
DELIMITER $$
CREATE PROCEDURE SelectData(IN w_cols varchar(500),IN tab_name varchar(50),IN w_where varchar(500),IN offsets INT, IN limits INT,IN orderBy varchar(10),IN orderIs varchar(25))
    BEGIN  
        SET @enabled = FALSE;
        SET @limit_sp = CONCAT(' LIMIT ', offsets , ',', limits);
        SET @Query =CONCAT("SELECT ",w_cols," FROM ",tab_name);  
         IF(w_where != '')
         THEN
            SET  @Query = CONCAT(@Query," WHERE ", w_where);
        END IF; 
        IF(orderBy != '')
        THEN
            SET @Query = CONCAT(@Query,' order by ',orderIs,' ',orderBy);
        END IF;
        
            SET @Query = CONCAT(@Query,@limit_sp);             
        PREPARE stmt3 FROM @Query;
        EXECUTE stmt3;
        DEALLOCATE PREPARE stmt3;     
    END $$
DELIMITER ;

-- INSERT DATA PROCEDURE
DROP PROCEDURE IF EXISTS InsertData;
DELIMITER $$
CREATE PROCEDURE InsertData (
    IN tablename varchar(100), 
    IN insertion varchar(700),
    IN primarycolumn varchar(30)
    )
BEGIN  

SET @uuidValue=uuid();
SET @Query = CONCAT("INSERT INTO ",tablename," SET created_at=CURRENT_TIMESTAMP(),updated_at=CURRENT_TIMESTAMP(),",primarycolumn,"=UUID_TO_BIN('",@uuidValue,"'),", insertion);
  PREPARE stmt3 FROM @Query;
        EXECUTE stmt3;
        DEALLOCATE PREPARE stmt3; 
        SELECT  @uuidValue as uuid;
END $$
DELIMITER ;

-- Update Data Kyc
DROP PROCEDURE IF EXISTS updateData;
DELIMITER $$
CREATE PROCEDURE updateData (
    IN tablename varchar(100), 
    IN updation varchar(500),
    IN w_where varchar(500)
    )
BEGIN  
SET @Query = CONCAT("UPDATE ",tablename," SET updated_at=CURRENT_TIMESTAMP(),
", updation," WHERE ",w_where);
        PREPARE stmt3 FROM @Query;
        EXECUTE stmt3;
        DEALLOCATE PREPARE stmt3; 

END $$
DELIMITER ;


DROP PROCEDURE IF EXISTS `debug_msg`;
DELIMITER $$

CREATE PROCEDURE debug_msg(enabled INTEGER, msg VARCHAR(255))
BEGIN
  IF enabled 
  THEN 
    select concat("** ", msg) AS '** DEBUG:';
  END IF;
END $$


-- admin Kyc List
DROP PROCEDURE IF EXISTS adminGetKyc;
DELIMITER $$
CREATE PROCEDURE adminGetKyc (
       IN userId varchar(40),
       IN search varchar(100),
       IN offsets INT, 
       IN limits INT    
    )
BEGIN 
SET @query = "SELECT 
    BIN_TO_UUID(t1.users_id) AS users_id,
    t1.email,
    t1.password_digest,
    BIN_TO_UUID(t2.kyc_id),
    t2.approved_by,
    BIN_TO_UUID(t2.selfie_id),
    BIN_TO_UUID(t2.country_id),
    t2.firstname,
    t2.lastname,
    t2.country_code,
    t2.mobile_no,
    t2.city,
    t2.dob,
    t2.zip,
    t2.submitted_at,
    t2.approved_at,
    t2.declined_at,
    t2.reason_for_decline,
    t2.status,
    t2.created_at,
    t2.updated_at,
    t4.2fa_email_token as auth_email_token,
    t3.status as user_status,
    t3.activated_at as user_activated_at,
    t3.suspended_at as user_suspended_at,
    t4.is_sms_active,
    t4.is_email_active,
    t4.is_google_2fa_active as google_auth_active,
    t4.google_2fa_key as google_auth_key,
    t4.2fa_email as auth_email,
    t4.2fa_phone_no as auth_phone,
    t4.2fa_reset_requested as auth_requested,
    t4.2fa_approved_at as auth_approved_at
FROM
    identities AS t1
		 INNER JOIN 
    users AS t3 ON  BIN_TO_UUID(t3.users_id) =  BIN_TO_UUID(t1.users_id)
        LEFT JOIN
    kyc AS t2 ON  BIN_TO_UUID(t2.user_id) =  BIN_TO_UUID(t1.users_id)       
		INNER JOIN
     2fa_settings as t4 ON  BIN_TO_UUID(t4.user_id) =  BIN_TO_UUID(t1.users_id)";
SET @query = CONCAT(@query," WHERE t3.user_type=0 ");
IF(userId != '')
    THEN 
SET @query = CONCAT(@query," and BIN_TO_UUID(t1.users_id)='",userId,"'");
END IF;
IF(search != '')
    THEN
SET @query = CONCAT(@query," and (t1.email like '%",search,"%' or t2.firstname like '%",search,"%' or t2.lastname like '%",search,"%' or t2.mobile_no like '%",search,"%' or city like '%",search,"%')");
END IF;
SET @query = CONCAT(@query,' LIMIT ', offsets , ',', limits);
        PREPARE stmt3 FROM @query;
        EXECUTE stmt3;
        DEALLOCATE PREPARE stmt3; 
END $$
DELIMITER ;
