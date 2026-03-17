import {take} from 'rxjs/operators';
import {toTitleCase} from './bug_suggestion.utils';

export function search(ctx: any): void {
  const data: any = {
    'portfolio': ctx.form.value.portfolio,
    'product_area': ctx.form.value.product_area,
    'testing_type': ctx.form.value.testing_type,
    'testing_options': ctx.form.value.testing_options,
    'bug_types': ctx.form.value.bugType,
    'verticals': ctx.form.value.vertical,
  };

  ctx.isSearchButtonDisabled = true;
  ctx.templateEnabled = true;

  ctx.bugAnalyzeService
    .getSearchAPI(data)
    .pipe(take(1))
    .subscribe({
      next: (response: any) => {
        ctx.isSearchButtonDisabled = false;
        if (!response?.raised_bug_template) return;

        const template: string = response.raised_bug_template;
        const keyValuePattern = /^([\w_]+):\s*(["{]?(?:.|\n)*?(?=(?:\n\w+:)|$))/gm;
        const bugData: any = {};
        let match;
        while ((match = keyValuePattern.exec(template)) !== null) {
          const key = match[1];
          bugData[key] = match[2].trim().replace(/^"|"$/g, '');
        }
        ctx.generateBugData = bugData;

        let bugReportedComponent = '';
        if (bugData['bug_component_description']) {
          bugReportedComponent = bugData['bug_component_description'];
        } else if (
          ctx.form.value.portfolio === 'Search' &&
          ctx.form.value.product_area === 'Discover' &&
          ctx.form.value.testing_type === 'Exploratory'
        ) {
          bugReportedComponent =
            'Search > Search Experience > xGA > iGA > Home Page > Discover';
        } else {
          bugReportedComponent = 'Search > Search Experience > Omnient';
        }

        const assignee =
          bugData['bug_assignee'] || bugData['assignee'] || 'chandupavan@google.com';

        ctx.bugTemplate.patchValue({
          bug_reported_component: bugReportedComponent,
          bug_reported_title: bugData['bug_title'] || '',
          templateDescription:
            bugData['bug_description']
              ?.replace(/\\n/g, '\n')
              .replace(/\n/g, '\n')
              .replace(/\\"/g, '"') || '',
          bug_priority: bugData['bug_priority'] || '',
          bug_status: toTitleCase(bugData['bug_type']) || '',
          bug_severity: bugData['bug_severity'] || '',
          assignee,
          cc: bugData['bug_cc_list'] || '',
          collaborators: bugData['collaborators'] || '',
        });
        ctx.cdr.detectChanges();

        ctx.createData = {
          'bug_title': bugData.bug_title,
          'bug_description': bugData.bug_description,
          'bug_type': bugData.bug_type,
          'bug_component_id': bugData.bug_component_id,
          'bug_hotlist_id': Array.isArray(bugData.bug_hotlist_id)
            ? bugData.bug_hotlist_id
            : bugData.bug_hotlist_id
              ? [bugData.bug_hotlist_id]
              : [],
          'bug_priority': bugData.bug_priority,
          'bug_severity': bugData.bug_severity,
          'format': bugData.format || 'MARKDOWN',
          'bug_in_prod': bugData.bug_in_prod === 'true',
          'bug_status': 'ASSIGNED',
          'bug_assignee': assignee,
          'bug_template_id': '0',
          'bug_cc_list': Array.isArray(bugData.bug_cc_list)
            ? bugData.bug_cc_list
            : bugData.bug_cc_list
              ? bugData.bug_cc_list.split(',').map((s: string) => s.trim())
              : [],
        };
      },
      error: (error: any) => {
        ctx.isSearchButtonDisabled = false;
        alert(`Error calling backend for bug template generation: ${error.message}`);
      },
    });
}
