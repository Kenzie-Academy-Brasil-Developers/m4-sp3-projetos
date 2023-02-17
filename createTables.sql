
CREATE TYPE preferredOS AS ENUM ('Windows', 'MacOs', 'Linux');



CREATE TABLE IF NOT EXISTS developer_infos(
"id" SERIAL PRIMARY KEY,
"developerSince" DATE NOT NULL,
"preferredOS" preferredOS NOT NULL
);


CREATE TABLE IF NOT EXISTS developers (
"id" SERIAL PRIMARY KEY,
"name" VARCHAR (50) NOT NULL,
"email" VARCHAR (50) NOT NULL UNIQUE,
"devInfoId" INTEGER UNIQUE,
FOREIGN KEY ("devInfoId") REFERENCES developer_infos("id") ON DELETE CASCADE 
);

CREATE TABLE IF NOT EXISTS projects (
"id" SERIAL PRIMARY KEY,
"name" VARCHAR (50) NOT NULL,
"description" TEXT NOT NULL,
"estimatedTime" VARCHAR (20) NOT NULL,
"repository" VARCHAR (120) NOT NULL,
"startDate" DATE NOT NULL,
"endDate" DATE
);

ALTER TABLE
		projects 
ADD COLUMN 
		"idDeveloper" INTEGER NOT NULL;
	
ALTER TABLE 
		projects 
ADD FOREIGN KEY ("idDeveloper") REFERENCES developers("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS technologies(
"id" SERIAL PRIMARY KEY,
"tech" VARCHAR (30) NOT NULL

);

INSERT INTO 
technologies(tech)
VALUES ('JavaScript'),('Python'),('React'),('Express.js'),('HTML'),('CSS'),('Django'),('PostgreSQL'),('MongoDB')
RETURNING*;


CREATE TABLE IF NOT EXISTS projects_technologies (
"id" SERIAL PRIMARY KEY,
"addedIn" DATE NOT NULL,
"idProjects" INTEGER NOT NULL,
FOREIGN KEY ("idProjects") REFERENCES projects("id")ON DELETE CASCADE,
"idTechnologies" INTEGER NOT NULL ,
FOREIGN KEY ("idTechnologies") REFERENCES technologies("id") ON DELETE CASCADE

);

