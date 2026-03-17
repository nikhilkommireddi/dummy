import {buildCreatePayload, resetAfterCreate, resetForNewBug} from './bug_suggestion.utils';

export function createBug(ctx: any): void {
  if (!ctx.createData) {
    alert('No bug data available. Please generate a template first.');
    return;
  }
  if (!ctx.bugTemplate.value.bug_reported_title) {
    alert('Please enter a bug title.');
    return;
  }

  ctx.isCreating = true;
  ctx.bugAnalyzeService.createIssue(buildCreatePayload(ctx.createData, ctx.bugTemplate)).subscribe({
    next: (response: any) => {
      ctx.isCreating = false;
      if (response?.create_bug_response) {
        const idMatch = response.create_bug_response.match(/issue_created_id:\s*"?(\d+)"?/);
        const issueId = idMatch ? idMatch[1] : 'Unknown';
        alert(`Bug created successfully!\n\nIssue ID: ${issueId}\n\nView at: http://b/${issueId}`);
      } else {
        alert('Bug created successfully!');
      }
      resetAfterCreate(ctx);
      ctx.cdr.detectChanges();
    },
    error: (error: any) => {
      ctx.isCreating = false;
      alert(`Failed to create bug: ${error.message}`);
      ctx.cdr.detectChanges();
    },
  });
}

export function createAndStartAnother(ctx: any): void {
  if (!ctx.createData) {
    alert('No bug data available. Please generate a template first.');
    return;
  }
  if (!ctx.bugTemplate.value.bug_reported_title) {
    alert('Please enter a bug title.');
    return;
  }

  ctx.isCreating = true;
  ctx.bugAnalyzeService.createIssue(buildCreatePayload(ctx.createData, ctx.bugTemplate)).subscribe({
    next: (response: any) => {
      ctx.isCreating = false;
      if (response?.create_bug_response) {
        const idMatch = response.create_bug_response.match(/issue_created_id:\s*"?(\d+)"?/);
        const issueId = idMatch ? idMatch[1] : 'Unknown';
        alert(`Bug created successfully!\n\nIssue ID: ${issueId}\n\nForm has been reset. You can create another bug.`);
      } else {
        alert('Bug created successfully!\n\nForm has been reset. You can create another bug.');
      }
      resetForNewBug(ctx);
      ctx.cdr.detectChanges();
    },
    error: (error: any) => {
      ctx.isCreating = false;
      alert(`Failed to create bug: ${error.message}`);
      ctx.cdr.detectChanges();
    },
  });
}

export function discard(ctx: any): void {
  const confirmDiscard = confirm(
    'Are you sure you want to discard this bug?\n\nAll entered data will be lost.',
  );
  if (confirmDiscard) resetAfterCreate(ctx);
}

export function processBug(ctx: any, bugIssueId: string | undefined): void {
  bugIssueId = '465673126';
  const processData = {
    bug_issue_id: '465673126',
    comment_text:
      ctx.summaryLines.join('\n') +
      (ctx.workaroundRecommendation
        ? '\n\nWorkaround/Recommendation: ' + ctx.workaroundRecommendation
        : ''),
    bug_title: 2,
  };

  ctx.bugAnalyzeService.postProcesstoBug(processData).subscribe({
    next: (_response: any) => { alert('Processed bug successfully!'); },
    error: (_error: any) => { alert('Failed to process bug'); },
  });
}

export function updateBugWithSummary(ctx: any, bugIssueId: string | undefined): void {
  bugIssueId = '465673160';
  if (!bugIssueId) {
    alert('Cannot update: Bug ID is missing');
    return;
  }

  const commentData = {
    bug_issue_id: '465673160',
    comment_text:
      ctx.summaryLines.join('\n') +
      (ctx.workaroundRecommendation
        ? '\n\nWorkaround/Recommendation: ' + ctx.workaroundRecommendation
        : ''),
    bug_title: ctx.bugTemplate.value.bug_reported_title,
    bug_description: ctx.bugTemplate.value.templateDescription,
  };

  ctx.bugAnalyzeService.postCommentToBug(commentData).subscribe({
    next: (_response: any) => {
      alert('Summary posted to bug successfully!');
      const duplicateIndex = ctx.duplicates.findIndex(
        (d: any) => d.bug_issue_id === bugIssueId,
      );
      if (duplicateIndex !== -1) {
        ctx.duplicates[duplicateIndex].action_items =
          `Updated on ${new Date().toLocaleDateString()}`;
        ctx.cdr.detectChanges();
      }
    },
    error: (_error: any) => { alert('Failed to post comment to bug'); },
  });
}
