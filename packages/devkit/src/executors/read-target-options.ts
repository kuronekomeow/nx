import type { Target } from 'nx/src/command-line/run/run';
import type { ExecutorContext } from 'nx/src/config/misc-interfaces';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { combineOptionsForExecutor } from 'nx/src/utils/params';
import { requireNx } from '../../nx';
import { relative } from 'path';

const { Workspaces, getExecutorInformation, calculateDefaultProjectName } =
  requireNx();

/**
 * Reads and combines options for a given target.
 *
 * Works as if you invoked the target yourself without passing any command lint overrides.
 */
export function readTargetOptions<T = any>(
  { project, target, configuration }: Target,
  context: ExecutorContext
): T {
  const projectConfiguration = (
    context.workspace || context.projectsConfigurations
  ).projects[project];
  const targetConfiguration = projectConfiguration.targets[target];

  // TODO(v18): remove Workspaces.
  const ws = new Workspaces(context.root);
  const [nodeModule, executorName] = targetConfiguration.executor.split(':');
  const { schema } = getExecutorInformation
    ? getExecutorInformation(nodeModule, executorName, context.root)
    : // TODO(v18): remove readExecutor. This is to be backwards compatible with Nx 16.5 and below.
      (ws as any).readExecutor(nodeModule, executorName);

  const defaultProject = calculateDefaultProjectName
    ? calculateDefaultProjectName(
        context.cwd,
        context.root,
        { version: 2, projects: context.projectsConfigurations.projects },
        context.nxJsonConfiguration
      )
    : // TODO(v18): remove calculateDefaultProjectName. This is to be backwards compatible with Nx 16.5 and below.
      (ws as any).calculateDefaultProjectName(
        context.cwd,
        { version: 2, projects: context.projectsConfigurations.projects },
        context.nxJsonConfiguration
      );

  return combineOptionsForExecutor(
    {},
    configuration ?? targetConfiguration.defaultConfiguration ?? '',
    targetConfiguration,
    schema,
    defaultProject,
    relative(context.cwd, context.root)
  ) as T;
}
