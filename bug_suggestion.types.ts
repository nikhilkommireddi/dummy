export interface Duplicate {
  title_of_bug: string;
  bug_status: string;
  percentage: number;
  bug_priority: string;
  created_at: string;
  action_items: string;
  bug_issue_id?: string;
}

export interface BugCreationData {
  bug_title?: string;
  bug_description?: string;
  bug_type?: string;
  bug_component_id?: string;
  bug_hotlist_id?: string;
  bug_priority?: string;
  bug_severity?: string;
  format?: string;
  bug_in_prod?: string;
  bug_cc_list?: string;
  bug_assignee?: string;
}

export interface FilterConfig {
  testingTypes: string[];
  testingOptions: string[];
  bugTypes: {[testingType: string]: string[]};
  verticals: {[testingType: string]: {[bugType: string]: string[]}};
}
