import { PaginatedList, Result } from "@/domain/shared";
import {
  mapTaskDefinitionFromApi,
  mapTaskDefinitionToApi,
} from "@/domain/taskDefinitions/TaskDefinitionEnumMappings";
import {
  TaskDefinitionSearchParams,
  TaskDefinition,
  CreateTaskDefinitionRequest,
  UpdateTaskDefinitionRequest,
} from "@/domain/taskDefinitions/TaskDefinitionTypes";
import axiosClient from "@/infrastructure/api/axiosClient";
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

/**
 * Fetch paginated list of task definitions.
 */
export async function searchTaskDefinitions(
  params: TaskDefinitionSearchParams,
): Promise<PaginatedList<TaskDefinition>> {
  try {
    // Map enum strings to numbers if they exist in the query params
    const mappedParams = mapTaskDefinitionToApi(params);
    const response = await axiosClient.get<
      Result<PaginatedList<TaskDefinition>>
    >("/taskdefinitions", { params: mappedParams });
    // If the backend returns numbers for type, convert to strings
    const data = extractData<PaginatedList<TaskDefinition>>(response);
    return {
      ...data,
      items: data.items.map(mapTaskDefinitionFromApi),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Fetch a single task definition by ID.
 */
export async function getTaskDefinitionById(
  id: string,
): Promise<TaskDefinition> {
  try {
    const response = await axiosClient.get<Result<TaskDefinition>>(
      `/taskdefinitions/${id}`,
    );
    return mapTaskDefinitionFromApi(extractData<TaskDefinition>(response));
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Create a new task definition. Returns the newly created ID.
 */
export async function createTaskDefinition(
  data: CreateTaskDefinitionRequest,
): Promise<string> {
  try {
    const mappedData = mapTaskDefinitionToApi(data);
    const response = await axiosClient.post<Result<string>>(
      "/taskdefinitions",
      mappedData,
    );
    return extractData<string>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update an existing task definition.
 */
export async function updateTaskDefinition(
  id: string,
  data: UpdateTaskDefinitionRequest,
): Promise<void> {
  try {
    const mappedData = mapTaskDefinitionToApi(data);
    const response = await axiosClient.put<Result<void>>(
      `/taskdefinitions/${id}`,
      mappedData,
    );
    return extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete a task definition.
 */
export async function deleteTaskDefinition(id: string): Promise<void> {
  try {
    const response = await axiosClient.delete<Result<void>>(
      `/taskdefinitions/${id}`,
    );
    return extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
