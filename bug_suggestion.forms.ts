import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {updateProductAreaFilter} from './bug_suggestion.utils';

export function createMainForm(fb: FormBuilder): FormGroup {
  return fb.group({
    portfolio: ['', Validators.required],
    product_area: [{value: '', disabled: true}, Validators.required],
    hotlist_id: [{value: '', disabled: true}],
    testing_type: [{value: '', disabled: true}, Validators.required],
    testing_options: [{value: '', disabled: true}],
    bugType: [{value: '', disabled: true}, Validators.required],
    vertical: [{value: '', disabled: true}],
    productAreaSearchTerm: [''],
    selectedProductArea: new FormControl(''),
  });
}

export function createAdvanceForm(fb: FormBuilder): FormGroup {
  return fb.group({
    advanceSeverity: [''],
    foundIn: [''],
    inProd: [false],
    staffing: [''],
    reporter: [''],
    verifier: [''],
    targetedTo: [''],
    blockingBy: [''],
    blocking: [''],
    parents: [''],
    children: [''],
  });
}

export function createBugTemplateForm(fb: FormBuilder): FormGroup {
  return fb.group({
    bug_reported_component: ['', Validators.required],
    bug_reported_title: [''],
    bug_reported_discussion: ['', Validators.required],
    bug_priority: ['', Validators.required],
    bug_status: ['', Validators.required],
    assignee: [''],
    collaborators: [''],
    cc: [''],
    bug_severity: [''],
    templateDescription: [''],
    foundIn: [''],
  });
}

// Mirrors the portfolio subscription set up in the original constructor
export function setupPortfolioConstructorSubscription(ctx: any): void {
  ctx.form.get('portfolio')?.valueChanges.subscribe((portfolio: any) => {
    const productAreaControl = ctx.form.get('product_area');
    const productAreaSearchControl = ctx.form.get('productAreaSearchTerm');

    productAreaControl?.reset({value: ''});
    productAreaSearchControl?.reset('');

    if (portfolio === 'Search') {
      ctx.productAreas = [...ctx.allSearchProductAreas];
      productAreaControl?.enable();
    } else if (portfolio === 'Assistant') {
      ctx.productAreas = [...ctx.allProductAreas];
      productAreaControl?.enable();
    } else {
      ctx.productAreas = [];
    }
    updateProductAreaFilter(ctx);
  });
}
