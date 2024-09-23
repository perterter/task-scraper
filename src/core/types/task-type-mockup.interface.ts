export interface ITaskType {
  /**
   * Name of the task type for UI display
   */
  name: string;

  /**
   * Description of the task type
   */
  description: string;

  /**
   * Is the task type enabled?
   */
  isEnabled: boolean;

  /**
   * Filename for the task json found in the tasks directory of task-json-store
   * Extension not included
   */
  taskJsonName: string;

  /**
   * Filters for the task type based on skills required or any param in paramMap
   */
  filters: { [key: string]: IFilterConfig };

  /**
   * A dictionary of parameters relevant to the task, with required id, name, description, tier
   * The key is the plain english name for the parameter
   * The value is the OSRS cache Struct ParamID that matches with the plain english parameter
   */
  paramMap: { [key: string]: number };

  /**
   * Varps used to store task progress
   * Used for exports from the plugin
   */
  taskVarps: number[];

  /**
   * Other varps used for the task type
   * Used for exports from the plugin
   * Examples in the past: League Points, Sages Renown
   */
  otherVarps: number[];

  /**
   * Varbits used for the task type
   * Used for exports from the plugin
   * Examples in the past: Relics chosen, Tasks completed, unlocks, Fragment xp
   */
  varbits: number[];

  /**
   * The point values for difficulties/tiers
   * Ordinal (i.e. index 0 = tier 1 = Easy; index 1 = tier 2 = Medium)
   */
  pointMap: number[];
}

export interface IFilterConfig {
  /**
   * The filter type key, see the types of filters supported for key
   */
  key: string;

  /**
   * The source of the value(s) to use for the filter
   */
  valueType: "PARAM" | "SKILL" | "METADATA";

  /**
   * The name of the param or metadata property to use for the filter
   * Can be left undefined for SKILL value type
   */
  valueName?: string;
}
