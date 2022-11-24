export interface Task {
  /**
    * Runs a task and returns its next execution
    * time or null if the task should not be
    * executed again
    * Errors will be handled internally. When this
    * method throws the task should not be run again
    */
  run(): Promise<Date | null>;
}
