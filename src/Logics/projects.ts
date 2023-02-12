import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../Database";
import {
  IProjectsRquest,
  IProjectsTech,
  ITechnologiesRequest,
  projectsDevResults,
  projectsResults,
  ProjectsTechResults,
} from "../Interfaces/projects.interfaces";

export const createProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const projectsData: IProjectsRquest = req.body;

    const queryString: string = format(
      `
          INSERT INTO
                  projects(%I)
          VALUES (%L)
          RETURNING *;
          `,
      Object.keys(projectsData),
      Object.values(projectsData)
    );
    const queryResult: projectsResults = await client.query(queryString);

    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("does not exist")) {
      return res.status(400).json({
        message:
          "Missing required keys: description,estimatedTime,repository,startDate.",
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
            SELECT
                pro.*             
            FROM
              projects pro
            LEFT JOIN
            developers de ON pro."idDeveloper" = de."id"
         
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
  return response.json(queryResult.rows[1]);
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
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const projectsId: number = parseInt(req.params.id);
    const projectsData: ITechnologiesRequest = req.body;
    const projectsaddedIn: IProjectsTech = req.body.addedIn;

    let queryString: string = `
         SELECT
              *
         FROM
             technologies
         WHERE
          name = $1;

     `;

    let queryConfig: QueryConfig = {
      text: queryString,
      values: [projectsData.name],
    };

    const queryResult = await client.query(queryConfig);

    if (queryResult.rowCount === 0) {
      return res.status(404).json({
        message: "Technology not found!",
      });
    }

    queryString = `
        INSERT INTO
        projects_technologies ("idProjects","idTechnologies","addedIn")
       
        VALUES ($1, $2,$3)
        RETURNING *;

        `;
    queryConfig = {
      text: queryString,
      values: [projectsId, queryResult.rows[0].id, projectsaddedIn],
    };

    const queryResultTech: ProjectsTechResults = await client.query(
      queryConfig
    );
    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("is not present")) {
      return res.status(400).json({
        message: "Not found ",
      });
    }
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
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
          "idProjects" = $1 AND "idTechnologies" = (SELECT id FROM technologies WHERE name = $2);
          
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id, name],
  };

  await client.query(queryConfig);

  return response.status(204).send();
};
