import { PaginatedList, Result } from "@/domain/shared";
import { mapTaskDefinitionFromApi, mapTaskDefinitionToApi } from "@/domain/taskDefinitions/TaskDefinitionEnumMappings";
import {
  TaskDefinitionSearchParams,
  TaskDefinition,
  CreateTaskDefinitionRequest,
  UpdateTaskDefinitionRequest,
} from "@/domain/taskDefinitions/TaskDefinitionTypes";
import axiosClient from "@/infrastructure/api/axiosClient";

function throwIfFailed<T>(response: { data: Result<T> }): T {
  const result = response.data;
  if (!result.succeeded) {
    console.error("API Error:", result);
    const message =
      result.errors?.[0]?.description || result.error || "Request failed";
    throw new Error(message);
  }
  return result.data as T;
}

/**
 * Fetch paginated list of task definitions.
 */
export async function searchTaskDefinitions(
  params: TaskDefinitionSearchParams,
): Promise<PaginatedList<TaskDefinition>> {
  // Map enum strings to numbers if they exist in the query params
  const mappedParams = mapTaskDefinitionToApi(params);
  const response = await axiosClient.get<Result<PaginatedList<TaskDefinition>>>(
    "/taskdefinitions",
    { params: mappedParams },
  );
  // If the backend returns numbers for type, convert to strings
  const data = throwIfFailed(response);
  return {
    ...data,
    items: data.items.map(mapTaskDefinitionFromApi),
  };
}

/**
 * Fetch a single task definition by ID.
 */
export async function getTaskDefinitionById(
  id: string,
): Promise<TaskDefinition> {
  const response = await axiosClient.get<Result<TaskDefinition>>(
    `/taskdefinitions/${id}`,
  );
  return mapTaskDefinitionFromApi(throwIfFailed(response));
}

/**
 * Create a new task definition. Returns the newly created ID.
 */
export async function createTaskDefinition(
  data: CreateTaskDefinitionRequest,
): Promise<string> {
  const mappedData = mapTaskDefinitionToApi(data);
  const response = await axiosClient.post<Result<string>>(
    "/taskdefinitions",
    mappedData,
  );
  return throwIfFailed(response);
}

/**
 * Update an existing task definition.
 */
export async function updateTaskDefinition(
  id: string,
  data: UpdateTaskDefinitionRequest,
): Promise<void> {
  const mappedData = mapTaskDefinitionToApi(data);
  const response = await axiosClient.put<Result<void>>(
    `/taskdefinitions/${id}`,
    mappedData,
  );
  return throwIfFailed(response);
}

/**
 * Delete a task definition.
 */
export async function deleteTaskDefinition(id: string): Promise<void> {
  const response = await axiosClient.delete<Result<void>>(
    `/taskdefinitions/${id}`,
  );
  return throwIfFailed(response);
}
