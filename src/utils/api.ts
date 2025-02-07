import { requestSliceActions } from "@features/requests/slice";
import type { AppDispatch } from "@store/index";
import { type CommandError, isCommandError } from "./errors";

export async function trackRequestOperation(
  type: string,
  dispatch: AppDispatch,
  handler: () => Promise<void> | void,
  errorCallback?: (error: CommandError) => Promise<void> | void,
) {
  try {
    dispatch(
      requestSliceActions.setRequestPending({
        name: type,
      }),
    );

    await handler();

    dispatch(requestSliceActions.setRequestSuccessful({ name: type }));
  } catch (error) {
    handleUnknownError(dispatch, error);

    await errorCallback?.(error as CommandError);
  }
}

export function handleUnknownError(dispatch: AppDispatch, error: unknown) {
  if (isCommandError(error)) {
    dispatch(
      requestSliceActions.setRequestFailed({
        name: "commandError",
        message: error.message,
      }),
    );

    return;
  }

  if (typeof error === "string") {
    dispatch(
      requestSliceActions.setRequestFailed({
        name: "error",
        message: error,
      }),
    );

    return;
  }

  dispatch(
    requestSliceActions.setRequestFailed({
      name: "unknownError",
      message: `An unexpected error occurred: ${JSON.stringify(error)}`,
    }),
  );
}
