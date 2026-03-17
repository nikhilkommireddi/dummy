import {HttpEventType} from '@angular/common/http';
import {getRelativeTime} from './bug_suggestion.utils';

export function goToSummary(ctx: any): void {
  ctx.progressValue = 0;
  ctx.isLoading = true;
  if (ctx.progressInterval) clearInterval(ctx.progressInterval);

  ctx.progressInterval = setInterval(() => {
    if (ctx.progressValue < 95) {
      ctx.progressValue += 5;
      ctx.cdr.detectChanges();
    } else {
      clearInterval(ctx.progressInterval);
    }
  }, 200);

  const data: any = {
    'bug_title': ctx.bugTemplate.value.bug_reported_title,
    'bug_description': ctx.bugTemplate.value.templateDescription,
    'product_area': 'Omnient',
  };

  ctx.bugAnalyzeService.aiData(data).subscribe({
    next: (event: any) => {
      if (event.type !== HttpEventType.Response) return;

      clearInterval(ctx.progressInterval);
      ctx.progressValue = 100;
      ctx.cdr.detectChanges();

      const response = event.body;
      setTimeout(() => {
        ctx.isLoading = false;

        if (response) {
          if (response.summary) {
            let summaryText = response.summary;
            const dupIdx = summaryText.indexOf('possible_duplicate_bugs {');
            if (dupIdx !== -1) summaryText = summaryText.substring(0, dupIdx).trim();

            const workaroundMatch = summaryText.match(/"Workaround\/Recommendation":\s*(.+)/s);
            if (workaroundMatch) {
              ctx.workaroundRecommendation = workaroundMatch[1].trim();
              summaryText = summaryText.replace(workaroundMatch[0], '').trim();
            } else {
              ctx.workaroundRecommendation = '';
            }
            ctx.summaryLines = summaryText.replace('summary: ', '').trim().split('\n');
          } else {
            ctx.summaryLines = [];
            ctx.workaroundRecommendation = '';
          }

          if (response.duplicate_bugs) {
            ctx.duplicates = response.duplicate_bugs.map((db: any) => {
              const score = parseFloat(db['match_score']);
              return {
                bug_title: db['bug_title'] || '',
                bug_status: db['bug_status'] || 'N/A',
                match_score: !isNaN(score) ? parseFloat(score.toFixed(2)) : 0,
                bug_priority: db['bug_priority'] || '',
                created_at: getRelativeTime(db['created_at']),
                action_items: db['action_items'] || '',
                bug_issue_id: db['bug_issue_id'] || '',
              };
            });
          } else {
            ctx.duplicates = [];
          }
        } else {
          ctx.summaryLines = [];
          ctx.workaroundRecommendation = '';
          ctx.duplicates = [];
        }

        ctx.aiSummaryEnabled = true;
        ctx.cdr.detectChanges();
      }, 500);
    },
    error: (error: any) => {
      clearInterval(ctx.progressInterval);
      ctx.isLoading = false;
      ctx.cdr.detectChanges();
      alert(`Error calling backend for AI analysis: ${error.message}`);
    },
  });
}

export function suggestTitle(ctx: any): void {
  const currentTitle = ctx.bugTemplate.value.bug_reported_title;
  if (!currentTitle || currentTitle.trim() === '') {
    alert('Please enter a title first before requesting AI suggestion.');
    return;
  }

  ctx.isSuggestingTitle = true;
  const data = {
    original_title: currentTitle,
    bug_description: ctx.bugTemplate.value.templateDescription || '',
    product_area: ctx.form.value.product_area || '',
  };

  ctx.bugAnalyzeService.suggestTitle(data).subscribe({
    next: (response: any) => {
      ctx.isSuggestingTitle = false;
      if (response?.success && response.suggested_title) {
        const userChoice = confirm(
          `AI Suggested Title:\n\n"${response.suggested_title}"\n\nClick OK to Apply this title, or Cancel to keep your original title.`,
        );
        if (userChoice) {
          ctx.bugTemplate.patchValue({bug_reported_title: response.suggested_title});
          ctx.cdr.detectChanges();
        }
      } else {
        alert('Could not generate a suggested title. Please try again.');
      }
    },
    error: (error: any) => {
      ctx.isSuggestingTitle = false;
      alert(`Failed to suggest title: ${error.message}`);
      ctx.cdr.detectChanges();
    },
  });
}
