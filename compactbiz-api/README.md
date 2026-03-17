Windows

install git
install node and npm
install postgres 14.xx (when asked set username to postgres and password to admin)

next we should add psql to windows path (replace exact version bellow)
@set PATH=%PATH%;C:\Program Files\PostgreSQL\14\bin;C:\Program Files\PostgreSQL\14\lib

next you need to run these queries:
CREATE DATABASE compactbiz_postgres;
CREATE SCHEMA compactbiz;
ALTER ROLE postgres SET search_path TO compactbiz;
ALTER DATABASE compactbiz_postgres SET search_path TO compactbiz;

then from the project root run
npm run heroku-postbuild

linux

install node and npm  for example sudo snap install node --classic --channel=22

install postgres   sudo apt-get install postgresql postgresql-contrib

in project root do
./initdb.sh

after that npm run heroku-postbuild

