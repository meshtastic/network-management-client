import merge from "lodash.merge";
import cloneDeep from "lodash.clonedeep";

export const getDefaultConfigInput = <C, E>(
  currentConfig: C | undefined,
  editedConfig: E | undefined
): Partial<E> | undefined => {
  return merge(cloneDeep(currentConfig), editedConfig);
};
