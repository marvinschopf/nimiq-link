/**
 * nimiq-link
 * Copyright (C) 2021 Marvin Schopf
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

CREATE TABLE `links` ( `id` VARCHAR(255) NOT NULL , `destination` TEXT NOT NULL , `domain` VARCHAR(255) NOT NULL , `slug` VARCHAR(255) NOT NULL , `active` INT(1) NOT NULL DEFAULT '1' , `created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , `adminpassword` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
ALTER TABLE `links` ADD `locked` INT(1) NOT NULL DEFAULT '0' AFTER `adminpassword`;
ALTER TABLE `links` ADD `lockReason` VARCHAR(255) NULL AFTER `adminpassword`;
