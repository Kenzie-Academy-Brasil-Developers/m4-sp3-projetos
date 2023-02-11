import { QueryResult } from "pg";

export interface IDevRequest {
  name: string;
  email: string;
}

export interface IDevelope extends IDevRequest {
  id: number;
  devInfoId: number;
}
export type devResult = QueryResult<IDevelope>;

export interface IDevInfoRequest {
  developerSince: Date;
  preferredOS: "Windows" | "Linux" | "MacOS";
}

export interface IDevelopeInfo extends IDevInfoRequest {
  id: number;
}

export type devInfoResult = QueryResult<IDevelopeInfo>;

export type IDevAndInformation = IDevelopeInfo & IDevInfoRequest;

export type devAndInformationResult = QueryResult<IDevAndInformation>;
