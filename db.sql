CREATE TABLE `links` ( `id` VARCHAR(255) NOT NULL , `destination` TEXT NOT NULL , `domain` VARCHAR(255) NOT NULL , `slug` VARCHAR(255) NOT NULL , `active` INT(1) NOT NULL DEFAULT '1' , `created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , `adminpassword` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
