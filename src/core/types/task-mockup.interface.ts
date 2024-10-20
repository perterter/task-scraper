//TODO: update this from java
export interface ITask {
  /**
   * Struct id for task data
   */
  structId: number;
  /**
   * Sort id based on the sort order in the game's UI
   */
  sortId: number;
  /**
   * Skills required for the task
   */
  skills?: ITaskSkill[];
  /**
   * Metadata related to the task that isn't represented in the Struct/params
   * May or may not be used for task filters
   * Examples:
   * - notes = extra description like "a magic cabbage is a cabbage picked at Draynor Manor"
   * - category = an extra category type that isn't a param
   */
  metadata?: { [key: string]: string | number };

  wikiNotes?: string;

  completionPercent?: number;
}

export interface ITaskSkill {
  /**
   * The skill
   */
  skill: string;
  /**
   * The level required
   */
  level: number;
}
