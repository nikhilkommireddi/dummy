// ==================== PURE HELPERS ====================

export function toTitleCase(str: string): string {
  if (!str) return '';
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

export function getRelativeTime(dateTimeStr: string): string {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return dateTimeStr;

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const units = [
    {label: 'year', seconds: 31536000},
    {label: 'month', seconds: 2592000},
    {label: 'week', seconds: 604800},
    {label: 'day', seconds: 86400},
    {label: 'hour', seconds: 3600},
    {label: 'minute', seconds: 60},
    {label: 'second', seconds: 1},
  ];

  for (const unit of units) {
    const interval = Math.floor(diffInSeconds / unit.seconds);
    if (interval >= 1) {
      return `${interval} ${unit.label}${interval > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

export function updateProductAreaFilter(ctx: any): void {
  const search = ctx.form.get('productAreaSearchTerm')?.value?.toLowerCase() || '';
  ctx.filteredProductAreas = !search
    ? [...ctx.productAreas]
    : ctx.productAreas.filter((area: string) => area.toLowerCase().includes(search));
}

export function buildCreatePayload(createData: any, bugTemplate: any): any {
  const ccArray: string[] = bugTemplate.value.cc
    ? bugTemplate.value.cc
        .split(',')
        .map((cc: string) => cc.trim())
        .filter((cc: string) => cc.length > 0)
    : [];

  const hotlistArray: string[] = createData.bug_hotlist_id
    ? Array.isArray(createData.bug_hotlist_id)
      ? createData.bug_hotlist_id
      : [createData.bug_hotlist_id]
    : [];

  return {
    bug_title: bugTemplate.value.bug_reported_title,
    bug_description: bugTemplate.value.templateDescription,
    bug_type: createData.bug_type || 'BUG',
    bug_component_id: createData.bug_component_id,
    bug_hotlist_id: hotlistArray,
    bug_priority: bugTemplate.value.bug_priority,
    bug_severity: bugTemplate.value.bug_severity || 'S2',
    format: createData.format || 'MARKDOWN',
    bug_in_prod: createData.bug_in_prod || false,
    bug_status: 'ASSIGNED',
    bug_assignee: bugTemplate.value.assignee,
    bug_template_id: '0',
    bug_cc_list: ccArray,
  };
}

// ==================== RESET HELPERS ====================

export function resetAfterCreate(ctx: any): void {
  ctx.bugTemplate.reset();
  ctx.templateEnabled = false;
  ctx.aiSummaryEnabled = false;
  ctx.createData = null;
  ctx.generateBugData = null;
  ctx.summaryLines = [];
  ctx.workaroundRecommendation = '';
  ctx.duplicates = [];
  ctx.isLoading = false;
  ctx.isCreating = false;
  ctx.isSuggestingTitle = false;
  ctx.progressValue = 0;
  if (ctx.progressInterval) clearInterval(ctx.progressInterval);
  ctx.cdr.detectChanges();
}

export function resetForNewBug(ctx: any): void {
  ctx.bugTemplate.reset();
  ctx.bugTemplate.patchValue({assignee: 'chandupavan@google.com'});
  ctx.aiSummaryEnabled = false;
  ctx.templateEnabled = false;
  ctx.summaryLines = [];
  ctx.workaroundRecommendation = '';
  ctx.duplicates = [];
  ctx.createData = null;
  ctx.generateBugData = null;
  ctx.isLoading = false;
  ctx.isCreating = false;
  ctx.isSuggestingTitle = false;
  ctx.progressValue = 0;
  if (ctx.progressInterval) clearInterval(ctx.progressInterval);
  ctx.cdr.detectChanges();
}

export function reset(ctx: any): void {
  ctx.form.reset();
  ctx.bugTemplate.reset();
  ctx.templateEnabled = false;
  ctx.aiSummaryEnabled = false;
  ctx.productAreas = [];
  ctx.filteredProductAreas = [];
  ctx.testingTypes = [];
  ctx.testingOptions = [];
  ctx.bugTypes = [];
  ctx.verticals = [];
  ctx.createData = null;
  ctx.generateBugData = null;
  ctx.isCreating = false;
  ctx.isSuggestingTitle = false;
  ctx.summaryLines = [];
  ctx.workaroundRecommendation = '';
  ctx.duplicates = [];

  ctx.form.controls['product_area'].disable();
  ctx.form.controls['testing_type'].disable();
  ctx.form.controls['testing_options'].disable();
  ctx.form.controls['bugType'].disable();
  ctx.form.controls['vertical'].disable();

  if (ctx.select) ctx.select.value = '';
  ctx.cdr.markForCheck();
}
