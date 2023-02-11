import { QueryResult } from "pg";

export interface IProjectsRquest {
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: Date;
  idDeveloper: number;
}

export interface IProjects extends IProjectsRquest {
  id: number;
  endDate?: Date;
}

export type projectsResults = QueryResult<IProjects>;

export interface IProjectsDevelopers extends IProjects {
  technologyName: string | null;
}

export type projectsDevResults = QueryResult<IProjectsDevelopers>;

export interface ITechnologiesRequest {
  name:
    | "JavaScript"
    | "Python"
    | "React"
    | "Express.js"
    | "HTML"
    | "CSS"
    | "Django"
    | "PostgreSQL"
    | "MongoDB";
}

export interface IProjectsTech {
  id: number;
  idProjects: number;
  idTechnologies: number;
  addedIn: Date;
}
export type ProjectsTechResults = QueryResult<IProjectsTech>;
