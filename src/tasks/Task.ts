export interface Task {
  /**
    * Runs a task and returns its next execution
    * time or null if the task should not be
    * executed again
    * This method should also throw on error
    */
  run(): Promise<Date | null>;
}
