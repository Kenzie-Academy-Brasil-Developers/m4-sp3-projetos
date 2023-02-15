import { Request, response, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../Database";
import {
  IProjectsRquest,
  Itech,
  projectsDevResults,
  projectsResults,
} from "../Interfaces/projects.interfaces";

export const createProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      name,
      description,
      estimatedTime,
      repository,
      startDate,
      idDeveloper,
    }: IProjectsRquest = req.body;

    const queryString: string = format(
      ` INSERT INTO
                  projects(%I)
          VALUES (%L)
          RETURNING *;
          `,
      Object.keys({
        name,
        description,
        estimatedTime,
        repository,
        startDate,
        idDeveloper,
      }),
      Object.values({
        name,
        description,
        estimatedTime,
        repository,
        startDate,
        idDeveloper,
      })
    );
    const queryResult: projectsResults = await client.query(queryString);

    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("null value in column")) {
      return res.status(400).json({
        message:
          "Missing required keys name,description,estimatedTime,repository,startDate",
      });
    }
    if (error.message.includes("projects_idDeveloper_fkey")) {
      return res.status(404).json({
        message: "Developer not found",
      });
    }
    if (error.message.includes("invalid input")) {
      return res.status(404).json({
        message: "Invalid data",
      });
    }
    if (error instanceof Error) {
      return res.status(409).json({
        message: error.message,
      });
    }
    console.log(error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const listProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const queryString = `

  SELECT *
  FROM
    projects_technologies 
  LEFT JOIN 
    technologies ON projects_technologies."idTechnologies" = technologies.id 
  RIGHT JOIN
    projects ON projects_technologies ."idProjects" = projects.id;
  `;

  const queryResult: projectsDevResults = await client.query(queryString);

  return res.json(queryResult.rows);
};

export const retrieveProjectsId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const ProjectsId: number = parseInt(req.params.id);
  const queryString = `
    SELECT
        pro.*,
        de."name"             
    FROM
        projects pro
    LEFT JOIN
        developers de ON pro."idDeveloper" = de."id"
    WHERE 
        de.id=$1;
        `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [ProjectsId],
  };
  const queryResult: projectsDevResults = await client.query(queryConfig);

  return res.json(queryResult.rows[0]);
};

export const updatePartial = async (
  request: Request,
  response: Response
): Promise<Response> => {
  if (request.body.id) {
    return response.status(400).json({
      message: "Erro updating id!",
    });
  }

  const id: number = parseInt(request.params.id);
  const projectData = Object.values(request.body);
  const listKeys = Object.keys(request.body);

  const queryString: string = format(
    `
        UPDATE
            projects
        SET(%I) = ROW(%L)  
        WHERE 
            id = $1
        RETURNING *;      
    `,
    listKeys,
    projectData
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: projectsDevResults = await client.query(queryConfig);
  return response.json(queryResult.rows[0]);
};

export const deleteProjectById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);

  const queryString: string = `
      DELETE FROM
          projects
      WHERE
        id = $1; 
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  await client.query(queryConfig);

  return response.status(204).send();
};

export const createProjectsTech = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const projectId: number = parseInt(request.params.id);
    const techData: Itech = request.body;
    const projectData: Date = new Date();

    let querySearchTechId: string = `
          SELECT
             *
          FROM
              technologies
          WHERE
              tech = $1;
      `;

    const querySearchTechIdConfig: QueryConfig = {
      text: querySearchTechId,
      values: [techData.tech],
    };

    const queryTechResult = await client.query(querySearchTechIdConfig);

    let queryString: string = `
      INSERT INTO
          projects_technologies (
              "addedIn",
              "idTechnologies",
              "idProjects"
          )
      VALUES ($1, $2, $3)
      RETURNING *;
  `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [projectData, queryTechResult.rows[0].id, projectId],
    };

    let queryResult = await client.query(queryConfig);

    return response.status(201).json(queryTechResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("Cannot read properties of undefined")) {
      return response.status(404).json({
        message: "Technology not found",
        options: [
          "JavaScript",
          "Python",
          "React",
          "Express.js",
          "HTML",
          "CSS",
          "Django",
          "PostgreSQL",
          "MongoDB",
        ],
      });
    }
    console.error(error.message);
    return response.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteTech = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);
  const name: string = request.params.name;

  const queryString: string = `
      DELETE 
      FROM
        projects_technologies
      WHERE
          "idProjects" = $1 AND "idTechnologies" = (SELECT id FROM technologies WHERE tech = $2);
          
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id, name],
  };

  await client.query(queryConfig);

  return response.status(204).send();
};
