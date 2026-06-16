import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import * as taskDefinitionsApi from "@/infrastructure/api/taskDefinitionsApi";
import {
  TaskDefinitionSearchParams,
  CreateTaskDefinitionRequest,
  UpdateTaskDefinitionRequest,
} from "@/domain/taskDefinitions/TaskDefinitionTypes";

// ---------- Query Keys ----------
const taskDefinitionsKeys = {
  all: ["taskDefinitions"] as const,
  lists: () => [...taskDefinitionsKeys.all, "list"] as const,
  list: (params: TaskDefinitionSearchParams) =>
    [...taskDefinitionsKeys.lists(), params] as const,
  details: () => [...taskDefinitionsKeys.all, "detail"] as const,
  detail: (id: string) => [...taskDefinitionsKeys.details(), id] as const,
};

// ---------- Queries ----------

/**
 * Paginated search of task definitions.
 */
export function useSearchTaskDefinitions(
  params: TaskDefinitionSearchParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: taskDefinitionsKeys.list(params),
    queryFn: () => taskDefinitionsApi.searchTaskDefinitions(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/**
 * Single task definition by ID.
 */
export function useTaskDefinition(id: string) {
  return useQuery({
    queryKey: taskDefinitionsKeys.detail(id),
    queryFn: () => taskDefinitionsApi.getTaskDefinitionById(id),
    enabled: !!id,
  });
}

// ---------- Mutations ----------

/**
 * Create a new task definition.
 */
export function useCreateTaskDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDefinitionRequest) =>
      taskDefinitionsApi.createTaskDefinition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskDefinitionsKeys.lists() });
    },
  });
}

/**
 * Update an existing task definition.
 */
export function useUpdateTaskDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTaskDefinitionRequest;
    }) => taskDefinitionsApi.updateTaskDefinition(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskDefinitionsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: taskDefinitionsKeys.detail(variables.id),
      });
    },
  });
}

/**
 * Delete a task definition.
 */
export function useDeleteTaskDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskDefinitionsApi.deleteTaskDefinition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskDefinitionsKeys.lists() });
    },
  });
}
